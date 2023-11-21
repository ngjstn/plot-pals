const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { getTasksRelatedToAuthorizedUser, getAllPostsAndTasks } = require('../postsAndtasksController');
const { randomPostsAndTasks } = require('./fixtures/postAndTaskFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

// GET /posts/all
describe('Get all posts and tasks', () => {
  // Input: gardenId and postId query params
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

  // Input: none
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

  // Input: None
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
  // Input: req.userId set by authMiddleware
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

  // Input: userIs query param and req.userId set by authMiddleware
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

  // Input: userIs query param and req.userId set by authMiddleware
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

  // Input: userIs query param and req.userId set by authMiddleware
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
