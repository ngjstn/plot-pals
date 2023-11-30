const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { randomPostsAndTasks } = require('./fixtures/postAndTaskFixtures');
const { OAuth2Client } = require('google-auth-library');
const request = require('supertest');
const { app } = require('../../server');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

jest.mock('google-auth-library');

// This will be the value of req.userId for all tests
const expectedUserId = '23412312';

// GET /posts/all
describe('Get all posts and tasks', () => {
  beforeEach(() => {
    // Mocking auth middleware input
    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          return {
            getPayload: jest.fn().mockImplementationOnce(() => {
              return { sub: expectedUserId };
            }),
          };
        }),
      };
    });
  });

  // Input: gardenId and postId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks with gardenId and postId field equaling of that specified in query params
  // Expected output: all posts and tasks with gardenId and postId field equaling of that specified in query params
  test('Valid gardenId and postId query params, no database error', async () => {
    const queryParams = { gardenId: '1', postId: '5' };

    const expectedReturnedData = randomPostsAndTasks.map((post) => {
      return toString(post.gardenId) === queryParams.gardenId && toString(post.id) === queryParams.postId;
    });

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([queryParams.gardenId, queryParams.postId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
      FROM posts 
      LEFT JOIN tasks ON posts.taskId = tasks.taskId 
      JOIN gardens 
      LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
      LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
      WHERE posts.postGardenId = gardens.id AND posts.postGardenId = ? AND posts.id = ? 
      ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/posts/all').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks
  // Expected output: all posts and tasks
  test('No gardenId and postId query params, no database error', async () => {
    const expectedReturnedData = randomPostsAndTasks;

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
      FROM posts 
      LEFT JOIN tasks ON posts.taskId = tasks.taskId 
      JOIN gardens 
      LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
      LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
      WHERE posts.postGardenId = gardens.id
      ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/posts/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/posts/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// GET posts/tasks
describe('Get all posts and tasks for authenticated user', () => {
  beforeEach(() => {
    // Mocking auth middleware input
    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          return {
            getPayload: jest.fn().mockImplementationOnce(() => {
              return { sub: expectedUserId };
            }),
          };
        }),
      };
    });
  });

  // Input: authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId
  test('No query param, no database error', async () => {
    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([expectedUserId, expectedUserId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
        FROM posts 
        LEFT JOIN tasks ON posts.taskId = tasks.taskId 
        JOIN gardens 
        LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
        LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
        WHERE posts.postGardenId = gardens.id AND (assigneeId = ? OR assignerId = ?) AND posts.taskId = tasks.taskId 
        ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/posts/tasks').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: userIs query param, authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId where user is assignee
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId where user is assignee
  test('userIs = assignee query param, no database error', async () => {
    const queryParams = { userIs: 'assignee' };

    const expectedReturnedData = randomPostsAndTasks.map((post) => {
      return post.assigneeId === expectedUserId;
    });
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([expectedUserId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
        FROM posts 
        LEFT JOIN tasks ON posts.taskId = tasks.taskId 
        JOIN gardens 
        LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
        LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
        WHERE posts.postGardenId = gardens.id AND assigneeId = ? AND posts.taskId = tasks.taskId 
        ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/posts/tasks').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: userIs query param, authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId where user is assigner
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId where user is assigner
  test('userIs = assigner query param, no database error', async () => {
    const queryParams = { userIs: 'assigner' };

    const expectedReturnedData = randomPostsAndTasks.map((post) => {
      return post.assignerId === expectedUserId;
    });
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([expectedUserId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
        FROM posts 
        LEFT JOIN tasks ON posts.taskId = tasks.taskId 
        JOIN gardens 
        LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
        LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
        WHERE posts.postGardenId = gardens.id AND assignerId = ? AND posts.taskId = tasks.taskId 
        ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/posts/tasks').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: userIs query param, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('userIs = assigner query param, no database error', async () => {
    const queryParams = { userIs: 'assigner' };
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/posts/tasks').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// GET posts/tasks/:gardenId
describe('Get all posts and tasks for authenticated user in a garden', () => {
  beforeEach(() => {
    // Mocking auth middleware input
    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          return {
            getPayload: jest.fn().mockImplementationOnce(() => {
              return { sub: expectedUserId };
            }),
          };
        }),
      };
    });
  });

  // Input: authorization token in request header, gardenId url params
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId for a garden identifiable by gardenId
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId for a garden identifiable by gardenId
  test('No query param, no database error', async () => {
    const urlParams = { gardenId: '1' };

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([urlParams.gardenId, expectedUserId, expectedUserId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
        FROM posts 
        LEFT JOIN tasks ON posts.taskId = tasks.taskId 
        JOIN gardens 
        LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
        LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
        WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND (assigneeId = ? OR assignerId = ?) AND posts.taskId = tasks.taskId
        ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app)
      .get(`/posts/tasks/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, gardenId url params, userIs query params
  // Expected status code: 200
  // Expected behavior: get all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assignee
  // Expected output: all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assignee
  test('userIs=assignee query param, no database error', async () => {
    const urlParams = { gardenId: '1' };
    const queryParams = { userIs: 'assignee' };

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([urlParams.gardenId, expectedUserId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
        FROM posts 
        LEFT JOIN tasks ON posts.taskId = tasks.taskId 
        JOIN gardens 
        LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
        LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
        WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND assigneeId = ? AND posts.taskId = tasks.taskId
        ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app)
      .get(`/posts/tasks/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, gardenId url params, userIs query params
  // Expected status code: 200
  // Expected behavior: get all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assigner
  // Expected output: all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assigner
  test('userIs=assigner , no database error', async () => {
    const urlParams = { gardenId: '1' };
    const queryParams = { userIs: 'assigner' };

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([urlParams.gardenId, expectedUserId]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
        FROM posts 
        LEFT JOIN tasks ON posts.taskId = tasks.taskId 
        JOIN gardens 
        LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
        LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
        WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND assignerId = ? AND posts.taskId = tasks.taskId
        ORDER BY posts.id DESC`.replace(/\s+/g, ' ')
      );
      return [expectedReturnedData];
    });

    const res = await request(app)
      .get(`/posts/tasks/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, gardenId url params, userIs query params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const urlParams = { gardenId: '1' };
    const queryParams = { userIs: 'assigner' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app)
      .get(`/posts/tasks/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// required fields in request body:
//  taskTitle
//  taskDesc
//  taskRating
//  taskDuration
//  taskDeadline
//  taskReward
//
// POST posts/tasks/
describe('create task', () => {
  beforeEach(() => {
    database.query.mockRestore();

    // Mocking auth middleware input
    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          return {
            getPayload: jest.fn().mockImplementationOnce(() => {
              return { sub: expectedUserId };
            }),
          };
        }),
      };
    });
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 200
  // Expected behavior: create task
  // Expected output: whether operation was successful
  test('poster is garden owner, no database error', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const month = requestBody.taskDeadline.substring(0, 2);
    const day = requestBody.taskDeadline.substring(2, 4);
    const year = requestBody.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = null;
    const expectedLastInsertId = 10;

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.gardenId]);
        return [[{ roleNum: 2 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.gardenId, expectedUserId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          requestBody.taskReward,
          requestBody.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          requestBody.taskDuration,
        ]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        return [[{ 'LAST_INSERT_ID()': expectedLastInsertId }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([
          requestBody.taskTitle,
          requestBody.taskDesc,
          expectedLastInsertId,
          expectedUserId,
          queryParams.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 200
  // Expected behavior: create task
  // Expected output: whether operation was successful
  test('poster is not garden owner, no database error', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const month = requestBody.taskDeadline.substring(0, 2);
    const day = requestBody.taskDeadline.substring(2, 4);
    const year = requestBody.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.gardenId, expectedUserId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          requestBody.taskReward,
          requestBody.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          requestBody.taskDuration,
        ]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        return [[{ 'LAST_INSERT_ID()': expectedLastInsertId }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([
          requestBody.taskTitle,
          requestBody.taskDesc,
          expectedLastInsertId,
          expectedUserId,
          queryParams.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when checking roles table to see if requester is a garden owner', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const month = requestBody.taskDeadline.substring(0, 2);
    const day = requestBody.taskDeadline.substring(2, 4);
    const year = requestBody.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.gardenId, expectedUserId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          requestBody.taskReward,
          requestBody.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          requestBody.taskDuration,
        ]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        return [[{ 'LAST_INSERT_ID()': expectedLastInsertId }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([
          requestBody.taskTitle,
          requestBody.taskDesc,
          expectedLastInsertId,
          expectedUserId,
          queryParams.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: req.userId from authMiddleware, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when checking for plot id of requester', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const month = requestBody.taskDeadline.substring(0, 2);
    const day = requestBody.taskDeadline.substring(2, 4);
    const year = requestBody.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          requestBody.taskReward,
          requestBody.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          requestBody.taskDuration,
        ]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        return [[{ 'LAST_INSERT_ID()': expectedLastInsertId }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([
          requestBody.taskTitle,
          requestBody.taskDesc,
          expectedLastInsertId,
          expectedUserId,
          queryParams.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when inserting to task table', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.gardenId, expectedUserId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        return [[{ 'LAST_INSERT_ID()': expectedLastInsertId }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([
          requestBody.taskTitle,
          requestBody.taskDesc,
          expectedLastInsertId,
          expectedUserId,
          queryParams.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when getting last inserted id to tasks table', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const month = requestBody.taskDeadline.substring(0, 2);
    const day = requestBody.taskDeadline.substring(2, 4);
    const year = requestBody.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.gardenId, expectedUserId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          requestBody.taskReward,
          requestBody.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          requestBody.taskDuration,
        ]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([
          requestBody.taskTitle,
          requestBody.taskDesc,
          expectedLastInsertId,
          expectedUserId,
          queryParams.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when inserting into posts table', async () => {
    const requestBody = {
      taskTitle: 'some title',
      taskDesc: 'desc',
      taskRating: 1.1,
      taskDuration: 3,
      taskDeadline: '01012025',
      taskReward: 'potato',
    };

    const queryParams = { gardenId: '1' };

    const month = requestBody.taskDeadline.substring(0, 2);
    const day = requestBody.taskDeadline.substring(2, 4);
    const year = requestBody.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.gardenId, expectedUserId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          requestBody.taskReward,
          requestBody.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          requestBody.taskDuration,
        ]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT LAST_INSERT_ID();`.replace(/\s+/g, ' ')) {
        return [[{ 'LAST_INSERT_ID()': expectedLastInsertId }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
      VALUES (?, ?, ?, ?, ?)`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .post(`/posts/tasks`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// PUT posts/tasks/claim
describe('Claiming (volunteering) a task', () => {
  beforeEach(() => {
    // Mocking auth middleware input
    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          return {
            getPayload: jest.fn().mockImplementationOnce(() => {
              return { sub: expectedUserId };
            }),
          };
        }),
      };
    });
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: claim a task for user identified by req.userId
  // Expected output: whether operation was successful or not
  test('no database error', async () => {
    const queryParams = { taskId: '1' };

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sql.replace(/\s+/g, ' ')).toStrictEqual(
        `UPDATE tasks SET taskStartTime = NOW(), assigneeId = ? 
      WHERE taskId = ? AND taskStartTime IS NULL AND assigneeId IS NULL`.replace(/\s+/g, ' ')
      );
      expect(sqlInputArr).toStrictEqual([expectedUserId, queryParams.taskId]);
      return [{ affectedRows: 1 }];
    });

    const res = await request(app)
      .put(`/posts/tasks/claim`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const queryParams = { taskId: '1' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app)
      .put(`/posts/tasks/claim`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// PUT posts/tasks/complete
describe('Completing a task', () => {
  beforeEach(() => {
    database.query.mockRestore();

    // Mocking auth middleware input
    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          return {
            getPayload: jest.fn().mockImplementationOnce(() => {
              return { sub: expectedUserId };
            }),
          };
        }),
      };
    });
  });
  // Input: taskId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: complete a task for user identified by req.userId
  // Expected output: whether operation was successful or not
  test('no database error', async () => {
    const queryParams = { taskId: '1' };

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1 
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.taskId, expectedUserId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE tasks FROM tasks 
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, expectedUserId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE FROM posts 
    WHERE assignerId = ? AND taskId IS NULL`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId]);
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/posts/tasks/complete`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when updating tasks table', async () => {
    const queryParams = { taskId: '1' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE tasks FROM tasks
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, expectedUserId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE FROM posts
    WHERE assignerId = ? AND taskId IS NULL`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId]);
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/posts/tasks/complete`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when deleting from tasks table', async () => {
    const queryParams = { taskId: '1' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.taskId, expectedUserId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE tasks FROM tasks
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE FROM posts
    WHERE assignerId = ? AND taskId IS NULL`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId]);
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/posts/tasks/complete`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when deleting from posts table', async () => {
    const queryParams = { taskId: '1' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([queryParams.taskId, expectedUserId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE tasks FROM tasks
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([expectedUserId, expectedUserId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE FROM posts
    WHERE assignerId = ? AND taskId IS NULL`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/posts/tasks/complete`)
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});
