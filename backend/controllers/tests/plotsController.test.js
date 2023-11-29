const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { OAuth2Client } = require('google-auth-library');
const request = require('supertest');
const { app } = require('../../server');
const { randomPlots } = require('./fixtures/plotFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

jest.mock('google-auth-library');

// This will be the value of req.userId for all tests
const expectedUserId = '23412312';

// GET /plots/all
describe('Obtain plot information without discriminating based on req.userId', () => {
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
  // Expected behavior: will return all plots
  // Expected output: all plots
  test('No gardenId and plotOwner query params, no database error', async () => {
    const expectedReturnedData = randomPlots;

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([]);
      expect(sql).toBe(
        'SELECT profiles.displayName as plotOwnerName, plots.*, gardens.gardenName FROM plots JOIN gardens JOIN profiles WHERE plots.gardenId = gardens.id AND plots.plotOwnerId = profiles.id'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/plots/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: will return plot identified by gardenId and plotOwnerId query params
  // Expected output: plot identified by gardenId and plotOwnerId query params
  test('Valid gardenId and plotOwner query params, no database error', async () => {
    const requestBody = { gardenId: '1', plotOwnerId: '123423421' };

    const expectedReturnedData = randomPlots.map((plot) => {
      return toString(plot.gardenId) === requestBody.gardenId && requestBody.plotOwnerId === plot.plotOwnerId;
    });

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([requestBody.gardenId, requestBody.plotOwnerId]);
      expect(sql).toBe(
        'SELECT profiles.displayName as plotOwnerName, plots.*, gardens.gardenName FROM plots JOIN gardens JOIN profiles WHERE plots.gardenId = gardens.id AND plots.plotOwnerId = profiles.id AND plots.gardenId = ? AND plots.plotOwnerId = ?'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/plots/all').set({ Authorization: 'Bearer some token' }).query(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const requestBody = { gardenId: '1', plotOwnerId: '123423421' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/plots/all').set({ Authorization: 'Bearer some token' }).query(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// Req.body required fields =
//    gardenId
//    plotOwnerId
//
// POST /plots
describe('Create plot for garden', () => {
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

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: create plot
  // Expected output: whether the operation was successful or not
  test('Valid gardenId and plotOwner fields in request body, no database error', async () => {
    const requestBody = { gardenId: '1', plotOwnerId: '123423421' };

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        INSERT INTO plots(
          gardenId,
          plotOwnerId
        ) VALUES (
          ?,
          ?
        );`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([requestBody.gardenId, requestBody.plotOwnerId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      UPDATE roles
      SET roleNum = 1
      WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([requestBody.gardenId, requestBody.plotOwnerId]);
        return null;
      }

      throw Error('It should not get to this point');
    });

    const res = await request(app).post(`/plots`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when inserting to plots table', async () => {
    const requestBody = { gardenId: '1', plotOwnerId: '123423421' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        INSERT INTO plots(
          gardenId,
          plotOwnerId
        ) VALUES (
          ?,
          ?
        );`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      UPDATE roles
      SET roleNum = 1
      WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([requestBody.gardenId, requestBody.plotOwnerId]);
        return null;
      }

      throw Error('It should not get to this point');
    });

    const res = await request(app).post(`/plots`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when updating roles table', async () => {
    const requestBody = { gardenId: '1', plotOwnerId: '123423421' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        INSERT INTO plots(
          gardenId,
          plotOwnerId
        ) VALUES (
          ?,
          ?
        );`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([requestBody.gardenId, requestBody.plotOwnerId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      UPDATE roles
      SET roleNum = 1
      WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      }

      throw Error('It should not get to this point');
    });

    const res = await request(app).post(`/plots`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// DELETE /plots/:plotId
describe('Remove plot From a garden', () => {
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

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 200
  // Expected behavior: delete plot specified by plotId in url parameter
  // Expected output: whether the operation was successful or not
  test('No database error', async () => {
    const queryParams = { plotId: '1' };

    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        SELECT * FROM plots WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return [[{ plotOwnerId: '234234213', gardenId: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        UPDATE roles
        SET roleNum = 0
        WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM posts
        WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM tasks
        WHERE plotId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM plots
        WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/plots/${queryParams.plotId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when running select statement on plot table', async () => {
    const queryParams = { plotId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        SELECT * FROM plots WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        UPDATE roles
        SET roleNum = 0
        WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM posts
        WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM tasks
        WHERE plotId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM plots
        WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/plots/${queryParams.plotId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when updating roles table', async () => {
    const queryParams = { plotId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        SELECT * FROM plots WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return [[{ plotOwnerId: '234234213', gardenId: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        UPDATE roles
        SET roleNum = 0
        WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM posts
        WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM tasks
        WHERE plotId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM plots
        WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/plots/${queryParams.plotId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from posts table', async () => {
    const queryParams = { plotId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        SELECT * FROM plots WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return [[{ plotOwnerId: '234234213', gardenId: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        UPDATE roles
        SET roleNum = 0
        WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
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
        DELETE FROM tasks
        WHERE plotId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM plots
        WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/plots/${queryParams.plotId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from tasks table', async () => {
    const queryParams = { plotId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        SELECT * FROM plots WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return [[{ plotOwnerId: '234234213', gardenId: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        UPDATE roles
        SET roleNum = 0
        WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM posts
        WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM tasks
        WHERE plotId = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM plots
        WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/plots/${queryParams.plotId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from plots table', async () => {
    const queryParams = { plotId: '1' };

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, sqlInputArr) => {
      if (
        sql.replace(/\s+/g, ' ') ===
        `
        SELECT * FROM plots WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        return [[{ plotOwnerId: '234234213', gardenId: 1 }]];
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        UPDATE roles
        SET roleNum = 0
        WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM posts
        WHERE assignerId = ? AND postGardenId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM tasks
        WHERE plotId = ?;`.replace(/\s+/g, ' ')
      ) {
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
        DELETE FROM plots
        WHERE id = ?;`.replace(/\s+/g, ' ')
      ) {
        throw expectedError;
      }
      throw Error('It should not get to this point');
    });

    const res = await request(app)
      .delete(`/plots/${queryParams.plotId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});
