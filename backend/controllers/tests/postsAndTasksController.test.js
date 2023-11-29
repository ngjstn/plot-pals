const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const {
  getTasksRelatedToAuthorizedUser,
  getAllPostsAndTasks,
  getTasksRelatedToAuthorizedUserByGardenId,
  createTask,
  claimTask,
  completeTask,
} = require('../postsAndtasksController');
const { randomPostsAndTasks } = require('./fixtures/postAndTaskFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

// GET /posts/all
describe('Get all posts and tasks', () => {
  // Input: gardenId and postId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks with gardenId and postId field equaling of that specified in query params
  // Expected output: all posts and tasks with gardenId and postId field equaling of that specified in query params
  test('Valid gardenId and postId query params, no database error', async () => {
    const req = { query: { gardenId: '1', postId: '5' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks.map((post) => {
      return toString(post.gardenId) === req.query.gardenId && toString(post.id) === req.query.postId;
    });

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.query.postId]);
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

    await getAllPostsAndTasks(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks
  // Expected output: all posts and tasks
  test('No gardenId and postId query params, no database error', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await getAllPostsAndTasks(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await getAllPostsAndTasks(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// GET posts/tasks
describe('Get all posts and tasks for authenticated user', () => {
  // Input: authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId
  test('No query param, no database error', async () => {
    const req = { query: {}, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.userId, req.userId]);
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

    await getTasksRelatedToAuthorizedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: userIs query param, authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId where user is assignee
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId where user is assignee
  test('userIs = assignee query param, no database error', async () => {
    const req = { query: { userIs: 'assignee' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks.map((post) => {
      return post.assigneeId === req.userId;
    });
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.userId]);
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

    await getTasksRelatedToAuthorizedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: userIs query param, authorization token in request header
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId where user is assigner
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId where user is assigner
  test('userIs = assigner query param, no database error', async () => {
    const req = { query: { userIs: 'assigner' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks.map((post) => {
      return post.assignerId === req.userId;
    });
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.userId]);
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

    await getTasksRelatedToAuthorizedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: userIs query param, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('userIs = assigner query param, no database error', async () => {
    const req = { query: { userIs: 'assigner' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await getTasksRelatedToAuthorizedUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// GET posts/tasks/:gardenId
describe('Get all posts and tasks for authenticated user in a garden', () => {
  // Input: authorization token in request header, gardenId url params
  // Expected status code: 200
  // Expected behavior: get all posts and tasks related to authorized user identifiable by req.userId for a garden identifiable by gardenId
  // Expected output: all posts and tasks related to authorized user identifiable by req.userId for a garden identifiable by gardenId
  test('No query param, no database error', async () => {
    const req = { query: {}, userId: '234123123', params: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.params.gardenId, req.userId, req.userId]);
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

    await getTasksRelatedToAuthorizedUserByGardenId(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: authorization token in request header, gardenId url params, userIs query params
  // Expected status code: 200
  // Expected behavior: get all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assignee
  // Expected output: all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assignee
  test('userIs=assignee query param, no database error', async () => {
    const req = { query: { userIs: 'assignee' }, userId: '234123123', params: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.params.gardenId, req.userId]);
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

    await getTasksRelatedToAuthorizedUserByGardenId(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: authorization token in request header, gardenId url params, userIs query params
  // Expected status code: 200
  // Expected behavior: get all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assigner
  // Expected output: all posts and tasks where authorized user, identifiable by req.userId for a garden identifiable by gardenId, is an assigner
  test('userIs=assigner , no database error', async () => {
    const req = { query: { userIs: 'assigner' }, userId: '234123123', params: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPostsAndTasks;
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.params.gardenId, req.userId]);
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

    await getTasksRelatedToAuthorizedUserByGardenId(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: authorization token in request header, gardenId url params, userIs query params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const req = { query: { userIs: 'assigner' }, userId: '234123123', params: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some database error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await getTasksRelatedToAuthorizedUserByGardenId(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
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
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 200
  // Expected behavior: create task
  // Expected output: whether operation was successful
  test('poster is garden owner, no database error', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = null;
    const expectedLastInsertId = 10;

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.query.gardenId]);
        return [[{ roleNum: 2 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.userId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          req.body.taskReward,
          req.body.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          req.body.taskDuration,
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
          req.body.taskTitle,
          req.body.taskDesc,
          expectedLastInsertId,
          req.userId,
          req.query.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await createTask(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 200
  // Expected behavior: create task
  // Expected output: whether operation was successful
  test('poster is not garden owner, no database error', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.query.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.userId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          req.body.taskReward,
          req.body.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          req.body.taskDuration,
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
          req.body.taskTitle,
          req.body.taskDesc,
          expectedLastInsertId,
          req.userId,
          req.query.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await createTask(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when checking roles table to see if requester is a garden owner', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
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
        expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.userId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          req.body.taskReward,
          req.body.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          req.body.taskDuration,
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
          req.body.taskTitle,
          req.body.taskDesc,
          expectedLastInsertId,
          req.userId,
          req.query.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await createTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: req.userId from authMiddleware, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when checking for plot id of requester', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.query.gardenId]);
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
          req.body.taskReward,
          req.body.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          req.body.taskDuration,
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
          req.body.taskTitle,
          req.body.taskDesc,
          expectedLastInsertId,
          req.userId,
          req.query.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await createTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when inserting to task table', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.query.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.userId]);
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
          req.body.taskTitle,
          req.body.taskDesc,
          expectedLastInsertId,
          req.userId,
          req.query.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await createTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when getting last inserted id to tasks table', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.query.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.userId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          req.body.taskReward,
          req.body.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          req.body.taskDuration,
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
          req.body.taskTitle,
          req.body.taskDesc,
          expectedLastInsertId,
          req.userId,
          req.query.gardenId,
        ]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await createTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: authorization token in request header, valid request body fields, gardenId query param
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when inserting into posts table', async () => {
    const req = {
      query: { gardenId: '1' },
      userId: '234123123',
      body: {
        taskTitle: 'some title',
        taskDesc: 'desc',
        taskRating: 1.1,
        taskDuration: 3,
        taskDeadline: '01012025',
        taskReward: 'potato',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const month = req.body.taskDeadline.substring(0, 2);
    const day = req.body.taskDeadline.substring(2, 4);
    const year = req.body.taskDeadline.substring(4, 8);
    const deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

    const expectedPlotId = 1;
    const expectedLastInsertId = 10;

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') === `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.query.gardenId]);
        return [[{ roleNum: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.userId]);
        return [[{ id: expectedPlotId }]];
      } else if (
        sql ===
        `INSERT into tasks (plotId, reward, minimumRating, assigneeId, isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(sqlInputArr).toStrictEqual([
          expectedPlotId,
          req.body.taskReward,
          req.body.taskRating,
          null,
          0,
          0,
          deadlineDate,
          null,
          null,
          req.body.taskDuration,
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

    await createTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// PUT /tasks/claim
describe('Claiming (volunteering) a task', () => {
  // Input: taskId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: claim a task for user identified by req.userId
  // Expected output: whether operation was successful or not
  test('no database error', async () => {
    const req = { query: { taskId: '1' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sql.replace(/\s+/g, ' ')).toStrictEqual(
        `UPDATE tasks SET taskStartTime = NOW(), assigneeId = ? 
      WHERE taskId = ? AND taskStartTime IS NULL AND assigneeId IS NULL`.replace(/\s+/g, ' ')
      );
      expect(sqlInputArr).toStrictEqual([req.userId, req.query.taskId]);
      return [{ affectedRows: 1 }];
    });

    await claimTask(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const req = { query: { taskId: '1' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await claimTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// PUT /tasks/complete
describe('Completing a task', () => {
  beforeEach(() => {
    database.query.mockRestore();
  });
  // Input: taskId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: complete a task for user identified by req.userId
  // Expected output: whether operation was successful or not
  test('no database error', async () => {
    const req = { query: { taskId: '1' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1 
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.taskId, req.userId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE tasks FROM tasks 
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.userId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE FROM posts 
    WHERE assignerId = ? AND taskId IS NULL`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId]);
        return null;
      }
      throw Error('It should not get to this point');
    });

    await completeTask(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when updating tasks table', async () => {
    const req = { query: { taskId: '1' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.userId, req.userId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE FROM posts
    WHERE assignerId = ? AND taskId IS NULL`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId]);
        return null;
      }
      throw Error('It should not get to this point');
    });

    await completeTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when deleting from tasks table', async () => {
    const req = { query: { taskId: '1' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.taskId, req.userId]);
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
        expect(sqlInputArr).toStrictEqual([req.userId]);
        return null;
      }
      throw Error('It should not get to this point');
    });

    await completeTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: taskId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when deleting from posts table', async () => {
    const req = { query: { taskId: '1' }, userId: '234123123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.query.taskId, req.userId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `DELETE tasks FROM tasks
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.userId, req.userId]);
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

    await completeTask(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
