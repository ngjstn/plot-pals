const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { randomRoles } = require('./fixtures/roleFixtures');
const { getRolesForAuthenticatedUser, getAllRoles, addRole, updateRole, deleteRole } = require('../rolesController');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

// GET /roles
describe('Get roles (membership of different gardens) of authenticated user identified using req.userId', () => {
  // Input: userId (from authMiddleware)
  // Expected status code: 200
  // Expected behavior: will return all roles associated with authenticated user
  // Expected output: all roles associated with authenticated user
  test('No database errors', async () => {
    const req = { query: {}, userId: '23411232134' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomRoles.map((role) => role.profileId === req.userId);

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.userId]);
      expect(sql).toBe(
        'SELECT roles.*, gardens.gardenName FROM roles JOIN gardens ON roles.gardenId = gardens.id WHERE profileId = ?'
      );
      return [expectedReturnedData];
    });

    await getRolesForAuthenticatedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: userId (from authMiddleware)
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const req = { query: {}, userId: '23411232134' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await getRolesForAuthenticatedUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// GET /roles/all
describe('Get roles (membership of different gardens) without discrimination using req.userId', () => {
  // Input: None
  // Expected status code: 200
  // Expected behavior: will return all roles associated with authenticated user
  // Expected output: all roles associated with authenticated user
  test('No gardenId query params, no database errors', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomRoles;

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT profiles.displayName AS gardenMemberName, roles.*, gardens.gardenName FROM roles JOIN gardens JOIN profiles WHERE (roles.gardenId = gardens.id AND roles.profileId = profiles.id)'
      );
      return [expectedReturnedData];
    });

    await getAllRoles(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: gardenId query param
  // Expected status code: 200
  // Expected behavior: will return all roles associated with authenticated user
  // Expected output: all roles associated with authenticated user
  test('Valid gardenId query param, no database errors', async () => {
    const req = { query: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomRoles.map((role) => toString(role.gardenId) === req.query.gardenId);

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.query.gardenId]);
      expect(sql).toBe(
        'SELECT profiles.displayName AS gardenMemberName, roles.*, gardens.gardenName FROM roles JOIN gardens JOIN profiles WHERE (roles.gardenId = gardens.id AND gardens.id = ? AND roles.profileId = profiles.id)'
      );
      return [expectedReturnedData];
    });

    await getAllRoles(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: None
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const req = { query: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await getAllRoles(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// Required fields for req.body:
//  profileId
//  gardenId
//  roleNum
//
// POST /roles
describe('Add role (membership) to garden', () => {
  // Input: required fields in request body
  // Expected status code: 200
  // Expected behavior: add role
  // Expected output: whether operation is successful
  test('Valid request body, no database errors', async () => {
    const req = { body: { profileId: '32432412', gardenId: 1, roleNum: 0 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.body.profileId, req.body.gardenId, req.body.roleNum]);
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

    await addRole(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: required fields in request body
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const req = { body: { profileId: '32432412', gardenId: 1, roleNum: 0 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await addRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// List of changable fields specifiable in req body:
//  roleNum
//
// PUT /roles/:profileId/:gardenId
describe('Update role (membership) for a garden', () => {
  // Input: new field values in request body, profileId and gardenId url params
  // Expected status code: 200
  // Expected behavior: update role
  // Expected output: whether operation is successful
  test('Valid request body, no database errors', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' }, body: { roleNum: 0 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.body.roleNum, req.params.profileId, req.params.gardenId]);
      expect(sql).toBe(`UPDATE roles SET roleNum=? WHERE profileId=? AND gardenId=?`);
      return [{ affectedRows: 1 }];
    });

    await updateRole(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: new field values in request body, profileId and gardenId url params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database errors', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' }, body: { roleNum: 0 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await updateRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// DELETE /roles/:profileId/:gardenId
describe('Delete role (membership) for a garden', () => {
  beforeEach(() => {
    database.query.mockRestore();
  });
  // Input: profileId and gardenId url params
  // Expected status code: 200
  // Expected behavior: delete role (membership) from garden and any posts, tasks and plots that the user owns in the garden
  // Expected output: whether operation is successful
  test('No database errors', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE tasks FROM tasks
      INNER JOIN posts
      ON posts.taskId = tasks.taskId
      WHERE posts.assignerId = ? AND posts.postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await deleteRole(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: profileId and gardenId url params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from tasks table', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await deleteRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: profileId and gardenId url params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from posts table', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
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
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await deleteRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: profileId and gardenId url params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from plots table', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
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
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return [{ affectedRows: 1 }];
      }
      throw Error('It should not get to this point');
    });

    await deleteRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: profileId and gardenId url params
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database errors when deleting from roles table', async () => {
    const req = { params: { profileId: '123423423', gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM posts
      WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      DELETE FROM plots
      WHERE plotOwnerId = ? AND gardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.params.profileId, req.params.gardenId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') === `DELETE FROM roles WHERE profileId=? AND gardenId=?`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    await deleteRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
