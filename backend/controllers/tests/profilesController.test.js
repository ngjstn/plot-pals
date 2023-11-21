const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { randomProfiles } = require('./fixtures/profileFixtures');
const {
  getAllProfiles,
  updateProfileDisplayNameForAuthenticatedUser,
  createProfileForAuthenticatedUser,
  submitFeedback,
} = require('../profilesController');
const { STARTING_COMPETENCE, MAX_RATING } = require('../../constants/profile');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

// GET /profiles/all
describe('Get profiles without discriminating based on req.userId', () => {
  // Input: None
  // Expected status code: 200
  // Expected behavior: will return all profiles
  // Expected output: all profiles
  test('No profileId query param, no database error', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomProfiles;

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual(null);
      expect(sql).toBe('SELECT * FROM profiles');
      return [expectedReturnedData];
    });

    await getAllProfiles(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: profileId query param
  // Expected status code: 200
  // Expected behavior: will return all profiles
  // Expected output: all profiles
  test('Valid profileId query param, no database error', async () => {
    const req = { query: { profileId: '123423421' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomProfiles.map((profile) => {
      return profile.id === req.query.profileId;
    });

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual([req.query.profileId]);
      expect(sql).toBe('SELECT * FROM profiles WHERE id=?');
      return [expectedReturnedData];
    });

    await getAllProfiles(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: None
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const req = { query: { profileId: '123214123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    await getAllProfiles(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// List of changable fields that can be specified in req.body =
//    displayName
//
// PUT /profiles/
describe('Update profile for user identified with req.userId', () => {
  // Input: field changes specified in req.body, userId from authMiddleware
  // Expected status code: 200
  // Expected behavior: updates profile whose id is equal to req.userId
  // Expected output: whether the operation is successful
  test('Valid request body, no database error', async () => {
    const req = { body: { displayName: 'foobar' }, userId: '12314123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = { affectedRows: 1 };

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.body.displayName, req.userId]);
      expect(sql).toBe('UPDATE profiles SET displayName=? WHERE id=?');
      return [expectedReturnedData];
    });

    await updateProfileDisplayNameForAuthenticatedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: field changes specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const req = { body: { displayName: 'foobar' }, userId: '12314123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    await updateProfileDisplayNameForAuthenticatedUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// Required fields in req.body:
//    displayName
//
// POST /profiles/
describe('Create profile', () => {
  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 200
  // Expected behavior: create new profile with id equaling req.userId
  // Expected output: whether operation is successful
  test('Valid request body, no database error', async () => {
    const req = { body: { displayName: 'foobar' }, userId: '12314123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = { affectedRows: 1 };

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.userId, MAX_RATING, req.body.displayName, STARTING_COMPETENCE]);
      expect(sql).toBe('INSERT INTO profiles (id, rating, displayName, competence) VALUES (?, ?, ?, ?)');
      return [expectedReturnedData];
    });

    await createProfileForAuthenticatedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const req = { body: { displayName: 'foobar' }, userId: '12314123' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    await createProfileForAuthenticatedUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// PUT /rating
describe('Submit feedback', () => {
  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 200
  // Expected behavior: create new profile with id equaling req.userId
  // Expected output: whether operation is successful
  test('Valid req body, no database error', async () => {
    const req = { body: { newRating: 3.2, taskId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const completedTaskInfo = {
      taskStartTime: '2023-03-01 10:00:00',
      taskEndTime: '2023-03-01 10:00:00',
      expectedTaskDurationInHours: 20,
      assigneeId: '234231',
    };

    const feedbackAssigneeInfo = {
      rating: 5.0,
    };

    const startTime = completedTaskInfo.taskStartTime;
    const endTime = completedTaskInfo.taskEndTime;
    const expectedTaskDurationInHours = completedTaskInfo.expectedTaskDurationInHours;
    const feedBackReceiverId = completedTaskInfo.assigneeId;
    const ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;

    const calculatedRating = Math.min(
      Math.max(
        feedbackAssigneeInfo.rating * 0.8 + req.body.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await submitFeedback(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when selecting from task table', async () => {
    const req = { body: { newRating: 3.2, taskId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const completedTaskInfo = {
      taskStartTime: '2023-03-01 10:00:00',
      taskEndTime: '2023-03-01 10:00:00',
      expectedTaskDurationInHours: 20,
      assigneeId: '234231',
    };

    const feedbackAssigneeInfo = {
      rating: 5.0,
    };

    const startTime = completedTaskInfo.taskStartTime;
    const endTime = completedTaskInfo.taskEndTime;
    const expectedTaskDurationInHours = completedTaskInfo.expectedTaskDurationInHours;
    const feedBackReceiverId = completedTaskInfo.assigneeId;
    const ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;

    const calculatedRating = Math.min(
      Math.max(
        feedbackAssigneeInfo.rating * 0.8 + req.body.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await submitFeedback(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when selecting from profiles table', async () => {
    const req = { body: { newRating: 3.2, taskId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const completedTaskInfo = {
      taskStartTime: '2023-03-01 10:00:00',
      taskEndTime: '2023-03-01 10:00:00',
      expectedTaskDurationInHours: 20,
      assigneeId: '234231',
    };

    const feedbackAssigneeInfo = {
      rating: 5.0,
    };

    const startTime = completedTaskInfo.taskStartTime;
    const endTime = completedTaskInfo.taskEndTime;
    const expectedTaskDurationInHours = completedTaskInfo.expectedTaskDurationInHours;
    const feedBackReceiverId = completedTaskInfo.assigneeId;
    const ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;

    const calculatedRating = Math.min(
      Math.max(
        feedbackAssigneeInfo.rating * 0.8 + req.body.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await submitFeedback(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when updating profiles table', async () => {
    const req = { body: { newRating: 3.2, taskId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const completedTaskInfo = {
      taskStartTime: '2023-03-01 10:00:00',
      taskEndTime: '2023-03-01 10:00:00',
      expectedTaskDurationInHours: 20,
      assigneeId: '234231',
    };

    const feedbackAssigneeInfo = {
      rating: 5.0,
    };

    const startTime = completedTaskInfo.taskStartTime;
    const endTime = completedTaskInfo.taskEndTime;
    const expectedTaskDurationInHours = completedTaskInfo.expectedTaskDurationInHours;
    const feedBackReceiverId = completedTaskInfo.assigneeId;
    const ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;

    const calculatedRating = Math.min(
      Math.max(
        feedbackAssigneeInfo.rating * 0.8 + req.body.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await submitFeedback(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from posts table', async () => {
    const req = { body: { newRating: 3.2, taskId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const completedTaskInfo = {
      taskStartTime: '2023-03-01 10:00:00',
      taskEndTime: '2023-03-01 10:00:00',
      expectedTaskDurationInHours: 20,
      assigneeId: '234231',
    };

    const feedbackAssigneeInfo = {
      rating: 5.0,
    };

    const startTime = completedTaskInfo.taskStartTime;
    const endTime = completedTaskInfo.taskEndTime;
    const expectedTaskDurationInHours = completedTaskInfo.expectedTaskDurationInHours;
    const feedBackReceiverId = completedTaskInfo.assigneeId;
    const ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;

    const calculatedRating = Math.min(
      Math.max(
        feedbackAssigneeInfo.rating * 0.8 + req.body.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await submitFeedback(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: field for new profile specified in req.body, userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from tasks table', async () => {
    const req = { body: { newRating: 3.2, taskId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const completedTaskInfo = {
      taskStartTime: '2023-03-01 10:00:00',
      taskEndTime: '2023-03-01 10:00:00',
      expectedTaskDurationInHours: 20,
      assigneeId: '234231',
    };

    const feedbackAssigneeInfo = {
      rating: 5.0,
    };

    const startTime = completedTaskInfo.taskStartTime;
    const endTime = completedTaskInfo.taskEndTime;
    const expectedTaskDurationInHours = completedTaskInfo.expectedTaskDurationInHours;
    const feedBackReceiverId = completedTaskInfo.assigneeId;
    const ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;

    const calculatedRating = Math.min(
      Math.max(
        feedbackAssigneeInfo.rating * 0.8 + req.body.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([req.body.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    await submitFeedback(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
