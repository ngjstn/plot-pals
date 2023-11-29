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
const request = require('supertest');
const { app } = require('../../server');
const { OAuth2Client } = require('google-auth-library');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

jest.mock('google-auth-library');

const expectedUserId = '23412312';

// GET /profiles/all
describe('Get profiles without discriminating based on req.userId', () => {
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
  // Expected behavior: will return all profiles
  // Expected output: all profiles
  test('No profileId query param, no database error', async () => {
    const expectedReturnedData = randomProfiles;

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual(null);
      expect(sql).toBe('SELECT * FROM profiles');
      return [expectedReturnedData];
    });

    const res = await request(app).get('/profiles/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: profileId query param, authorization token in request header
  // Expected status code: 200
  // Expected behavior: will return all profiles
  // Expected output: all profiles
  test('Valid profileId query param, no database error', async () => {
    const queryParam = { profileId: '123423421' };

    const expectedReturnedData = randomProfiles.map((profile) => {
      return profile.id === queryParam.profileId;
    });

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual([queryParam.profileId]);
      expect(sql).toBe('SELECT * FROM profiles WHERE id=?');
      return [expectedReturnedData];
    });

    const res = await request(app).get('/profiles/all').set({ Authorization: 'Bearer some token' }).query(queryParam);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const queryParam = { profileId: '123423421' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/profiles/all').set({ Authorization: 'Bearer some token' }).query(queryParam);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// List of changable fields that can be specified in req.body =
//    displayName
//
// PUT /profiles
describe('Update profile for user identified with req.userId', () => {
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

  // Input: field changes specified in req.body, authorization token in request header
  // Expected status code: 200
  // Expected behavior: updates profile whose id is equal to req.userId
  // Expected output: whether the operation is successful
  test('Valid request body, no database error', async () => {
    const requestBody = { displayName: 'foobar' };

    const expectedReturnedData = { affectedRows: 1 };
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([requestBody.displayName, expectedUserId]);
      expect(sql).toBe('UPDATE profiles SET displayName=? WHERE id=?');
      return [expectedReturnedData];
    });

    const res = await request(app)
      .put('/profiles')
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: field changes specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const requestBody = { displayName: 'foobar' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    const res = await request(app)
      .put('/profiles')
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// Required fields in req.body:
//    displayName
//
// POST /profiles/
describe('Create profile', () => {
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

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 200
  // Expected behavior: create new profile with id equaling req.userId
  // Expected output: whether operation is successful
  test('Valid request body, no database error', async () => {
    const requestBody = { displayName: 'foobar' };

    const expectedReturnedData = { affectedRows: 1 };
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([expectedUserId, MAX_RATING, requestBody.displayName, STARTING_COMPETENCE]);
      expect(sql).toBe('INSERT INTO profiles (id, rating, displayName, competence) VALUES (?, ?, ?, ?)');
      return [expectedReturnedData];
    });

    const res = await request(app)
      .post('/profiles')
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const requestBody = { displayName: 'foobar' };
    
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    const res = await request(app)
      .post('/profiles')
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// PUT /profiles/rating
describe('Submit feedback', () => {
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
  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 200
  // Expected behavior: create new profile with id equaling req.userId
  // Expected output: whether operation is successful
  test('Valid req body, no database error', async () => {
    const requestBody = { newRating: 3.2, taskId: 1 };

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
        feedbackAssigneeInfo.rating * 0.8 + requestBody.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/profiles/rating`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when selecting from task table', async () => {
    const requestBody = { newRating: 3.2, taskId: 1 };

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
        feedbackAssigneeInfo.rating * 0.8 + requestBody.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/profiles/rating`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when selecting from profiles table', async () => {
    const requestBody = { newRating: 3.2, taskId: 1 };

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
        feedbackAssigneeInfo.rating * 0.8 + requestBody.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/profiles/rating`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when updating profiles table', async () => {
    const requestBody = { newRating: 3.2, taskId: 1 };

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
        feedbackAssigneeInfo.rating * 0.8 + requestBody.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/profiles/rating`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from posts table', async () => {
    const requestBody = { newRating: 3.2, taskId: 1 };

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
        feedbackAssigneeInfo.rating * 0.8 + requestBody.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
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
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/profiles/rating`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: field for new profile specified in req.body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from tasks table', async () => {
    const requestBody = { newRating: 3.2, taskId: 1 };

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
        feedbackAssigneeInfo.rating * 0.8 + requestBody.newRating * 0.2 + ratingsChangeDueToCompletionEfficiency,
        0
      ),
      5
    );

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (sql.replace(/\s+/g, ' ') === `SELECT * FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return [[completedTaskInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `SELECT rating FROM profiles WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([feedBackReceiverId]);
        return [[feedbackAssigneeInfo]];
      } else if (sql.replace(/\s+/g, ' ') === `UPDATE profiles SET rating = ? WHERE id = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([calculatedRating, feedBackReceiverId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM posts WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        expect(sqlInputArr).toStrictEqual([requestBody.taskId]);
        return null;
      } else if (sql.replace(/\s+/g, ' ') === `DELETE FROM tasks WHERE taskId = ?`.replace(/\s+/g, ' ')) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .put(`/profiles/rating`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});
