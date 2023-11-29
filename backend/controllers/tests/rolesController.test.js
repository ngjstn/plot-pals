const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { randomRoles } = require('./fixtures/roleFixtures');
const { getRolesForAuthenticatedUser, getAllRoles, addRole, updateRole, deleteRole } = require('../rolesController');
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

// GET /roles
describe('Get roles (membership of different gardens) of authenticated user identified using req.userId', () => {
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
  // Expected behavior: will return all roles associated with authenticated user
  // Expected output: all roles associated with authenticated user
  test('No database errors', async () => {
    const expectedReturnedData = randomRoles.map((role) => role.profileId === expectedUserId);

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([expectedUserId]);
      expect(sql).toBe(
        'SELECT roles.*, gardens.gardenName FROM roles JOIN gardens ON roles.gardenId = gardens.id WHERE profileId = ?'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/roles').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/roles').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// GET /roles/all
describe('Get roles (membership of different gardens) without discrimination using req.userId', () => {
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
  // Expected behavior: will return all roles associated with authenticated user
  // Expected output: all roles associated with authenticated user
  test('No gardenId query params, no database errors', async () => {
    const expectedReturnedData = randomRoles;

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT profiles.displayName AS gardenMemberName, roles.*, gardens.gardenName FROM roles JOIN gardens JOIN profiles WHERE (roles.gardenId = gardens.id AND roles.profileId = profiles.id)'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/roles/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: gardenId query param, authorization token in request header
  // Expected status code: 200
  // Expected behavior: will return all roles associated with authenticated user
  // Expected output: all roles associated with authenticated user
  test('Valid gardenId query param, no database errors', async () => {
    const queryParams = { gardenId: '1' };

    const expectedReturnedData = randomRoles.map((role) => toString(role.gardenId) === queryParams.gardenId);

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([queryParams.gardenId]);
      expect(sql).toBe(
        'SELECT profiles.displayName AS gardenMemberName, roles.*, gardens.gardenName FROM roles JOIN gardens JOIN profiles WHERE (roles.gardenId = gardens.id AND gardens.id = ? AND roles.profileId = profiles.id)'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/roles/all').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/roles/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// Required fields for req.body:
//  profileId
//  gardenId
//  roleNum
//
// POST /roles
describe('Add role (membership) to garden', () => {
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

  // Input: required fields in request body, authorization token in request header
  // Expected status code: 200
  // Expected behavior: add role
  // Expected output: whether operation is successful
  test('Valid request body, no database errors', async () => {
    const requestBody = { profileId: '32432412', gardenId: 1, roleNum: 0 };

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([requestBody.profileId, requestBody.gardenId, requestBody.roleNum]);
      expect(sql.replace(/\s+/g, ' ')).toBe(
        `
        INSERT INTO roles(
          profileId, 
          gardenId,
          roleNum
        ) VALUES (
          ?,
          ?,
          ?
        );`.replace(/\s+/g, ' ')
      );
      return [{ affectedRows: 1 }];
    });

    const res = await request(app).post('/roles').send(requestBody).set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: required fields in request body, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const requestBody = { profileId: '32432412', gardenId: 1, roleNum: 0 };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app).post('/roles').send(requestBody).set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// List of changable fields specifiable in req body:
//  roleNum
//
// PUT /roles/:profileId/:gardenId
describe('Update role (membership) for a garden', () => {
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
  // Input: new field values in request body, profileId and gardenId url params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: update role
  // Expected output: whether operation is successful
  test('Valid request body, no database errors', async () => {
    const requestBody = { roleNum: 0 };
    const urlParams = { profileId: '123423423', gardenId: '1' };

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([requestBody.roleNum, urlParams.profileId, urlParams.gardenId]);
      expect(sql).toBe(`UPDATE roles SET roleNum=? WHERE profileId=? AND gardenId=?`);
      return [{ affectedRows: 1 }];
    });

    const res = await request(app)
      .put(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: new field values in request body, profileId and gardenId url params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const requestBody = { roleNum: 0 };
    const urlParams = { profileId: '123423423', gardenId: '1' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app)
      .put(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .send(requestBody)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// DELETE /roles/:profileId/:gardenId
describe('Delete role (membership) for a garden', () => {
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

  // Input: profileId and gardenId url params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: delete role (membership) from garden and any posts, tasks and plots that the user owns in the garden
  // Expected output: whether operation is successful
  test('No database errors', async () => {
    const urlParams = { profileId: '123423423', gardenId: '1' };

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE tasks FROM tasks
      INNER JOIN posts
      ON posts.taskId = tasks.taskId
      WHERE posts.assignerId = ? AND posts.postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: profileId and gardenId url params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from tasks table', async () => {
    const urlParams = { profileId: '123423423', gardenId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE tasks FROM tasks
      INNER JOIN posts
      ON posts.taskId = tasks.taskId
      WHERE posts.assignerId = ? AND posts.postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: profileId and gardenId url params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from posts table', async () => {
    const urlParams = { profileId: '123423423', gardenId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE tasks FROM tasks
      INNER JOIN posts
      ON posts.taskId = tasks.taskId
      WHERE posts.assignerId = ? AND posts.postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: profileId and gardenId url params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from plots table', async () => {
    const urlParams = { profileId: '123423423', gardenId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE tasks FROM tasks
      INNER JOIN posts
      ON posts.taskId = tasks.taskId
      WHERE posts.assignerId = ? AND posts.postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: profileId and gardenId url params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from roles table', async () => {
    const urlParams = { profileId: '123423423', gardenId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE tasks FROM tasks
      INNER JOIN posts
      ON posts.taskId = tasks.taskId
      WHERE posts.assignerId = ? AND posts.postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([urlParams.profileId, urlParams.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/roles/${urlParams.profileId}/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});
