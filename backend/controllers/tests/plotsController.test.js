const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { OAuth2Client } = require('google-auth-library');
const { getAllPlots, addAPlotToAGarden, removePlot } = require('../plotsController');
const request = require('supertest');
const { app } = require('../../server');
const { randomPlots } = require('./fixtures/plotFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

jest.mock('google-auth-library');

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
    const req = { query: { gardenId: '1', plotOwnerId: '123423421' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedReturnedData = randomPlots.map((plot) => {
      return toString(plot.gardenId) === req.query.gardenId && req.query.plotOwnerId === plot.plotOwnerId;
    });

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.query.gardenId, req.query.plotOwnerId]);
      expect(sql).toBe(
        'SELECT profiles.displayName as plotOwnerName, plots.*, gardens.gardenName FROM plots JOIN gardens JOIN profiles WHERE plots.gardenId = gardens.id AND plots.plotOwnerId = profiles.id AND plots.gardenId = ? AND plots.plotOwnerId = ?'
      );
      return [expectedReturnedData];
    });

    await getAllPlots(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const req = { query: { gardenId: '1', plotOwnerId: '123423421' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await getAllPlots(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
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
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 200
  // Expected behavior: create plot
  // Expected output: whether the operation was successful or not
  test('Valid gardenId and plotOwner fields in request body, no database error', async () => {
    const req = { body: { gardenId: '1', plotOwnerId: '123423421' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.body.gardenId, req.body.plotOwnerId]);
        return null;
      } else if (
        sql.replace(/\s+/g, ' ') ===
        `
      UPDATE roles
      SET roleNum = 1
      WHERE gardenId = ? AND profileId = ?;`.replace(/\s+/g, ' ')
      ) {
        expect(sqlInputArr).toStrictEqual([req.body.gardenId, req.body.plotOwnerId]);
        return null;
      }

      throw Error('It should not get to this point');
    });

    await addAPlotToAGarden(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when inserting to plots table', async () => {
    const req = { body: { gardenId: '1', plotOwnerId: '123423421' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.body.gardenId, req.body.plotOwnerId]);
        return null;
      }

      throw Error('It should not get to this point');
    });

    await addAPlotToAGarden(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: gardenId and plotOwnerId query params, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when updating roles table', async () => {
    const req = { body: { gardenId: '1', plotOwnerId: '123423421' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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
        expect(sqlInputArr).toStrictEqual([req.body.gardenId, req.body.plotOwnerId]);
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

    await addAPlotToAGarden(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// DELETE /:plotId
describe('Remove plot From a garden', () => {
  beforeEach(() => {
    database.query.mockRestore();
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 200
  // Expected behavior: delete plot specified by plotId in url parameter
  // Expected output: whether the operation was successful or not
  test('No database error', async () => {
    const req = { params: { plotId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await removePlot(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when running select statement on plot table', async () => {
    const req = { params: { plotId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await removePlot(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when updating roles table', async () => {
    const req = { params: { plotId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await removePlot(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from posts table', async () => {
    const req = { params: { plotId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await removePlot(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from tasks table', async () => {
    const req = { params: { plotId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await removePlot(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: plotId url parameter, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when deleting from plots table', async () => {
    const req = { params: { plotId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

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

    await removePlot(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
