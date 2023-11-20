const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const axios = require('axios');
const {
  getAllGardens,
  getGardensForAuthorizedUser,
  updateGarden,
  createGardenApplication,
} = require('../gardensController');
const {
  randomGardensWithoutAuthorizedUserDiscrimination,
  randomGardensWithAuthorizedUserDiscrimination,
} = require('./fixtures/gardenFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Interface GET /gardens/all
describe('Obtain gardens without discriminating based on req.userId', () => {
  // Input: None
  // Expected status code: 200
  // Expected behavior: will return all gardens
  // Expected output: all gardens
  test('No gardenId and isApproved query parameter as well as no database error', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination;
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getAllGardens(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: gardenId query parameter
  // Expected status code: 200
  // Expected behavior: will return all gardens with specified gardenId
  // Expected output: all gardens with specified gardenId
  test('Has gardenId but no isApproved query parameter as well as no database error', async () => {
    const req = { query: { gardenId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => toString(garden.id) === req.query.gardenId
    );
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual([req.query.gardenId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.id = ? AND gardens.gardenOwnerId = profiles.id ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getAllGardens(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: isApproved query parameter
  // Expected status code: 200
  // Expected behavior: will return all gardens that has isApproved field equalling to 1 (true)
  // Expected output: all gardens that has isApproved field equalling to 1 (true)
  test('No gardenId but has isApproved == true query parameter as well as no database error', async () => {
    const req = { query: { isApproved: 'true' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved === req.query.isApproved
    );
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id AND gardens.isApproved = true ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getAllGardens(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: isApproved query parameter
  // Expected status code: 200
  // Expected behavior: will return all gardens that has isApproved field equalling to 0 (false)
  // Expected output: all gardens that has isApproved field equalling to 0 (false)
  test('No gardenId but has isApproved == false query parameter as well as no database error', async () => {
    const req = { query: { isApproved: 'false' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved !== req.query.isApproved
    );
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id AND gardens.isApproved = false ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getAllGardens(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: None
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      throw expectedError;
    });

    await getAllGardens(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// Interface GET /gardens
describe('Obtain gardens for user identified by req.userId', () => {
  // Input: userId from authMiddleware
  // Expected status code: 200
  // Expected behavior: will return all gardens that the user is in
  // Expected output: all gardens that the user is in (either as caretaker or garden owner)
  test('No isApproved query parameter as well as no database error', async () => {
    const req = { query: {}, userId: '12353943' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithAuthorizedUserDiscrimination;
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      expect(reqUserIdArr).toStrictEqual([req.userId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id ) ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getGardensForAuthorizedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: isApproved query parameter, userId from authMiddleware
  // Expected status code: 200
  // Expected behavior: will return all approved gardens that the user is in
  // Expected output: all approved gardens that the user is in (either as caretaker or garden owner)
  test('isApproved = true query parameter as well as no database error', async () => {
    const req = { query: { isApproved: 'true' }, userId: '12353943' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved === req.query.isApproved
    );
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      expect(reqUserIdArr).toStrictEqual([req.userId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id AND gardens.isApproved = true) ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getGardensForAuthorizedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: isApproved query parameter, userId from authMiddleware
  // Expected status code: 200
  // Expected behavior: will return all unapproved gardens that the user is in
  // Expected output: all unapproved gardens that the user is in (either as caretaker or garden owner)
  test('isApproved = false query parameter as well as no database error', async () => {
    const req = { query: { isApproved: 'false' }, userId: '12353943' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved !== req.query.isApproved
    );
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      expect(reqUserIdArr).toStrictEqual([req.userId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id AND gardens.isApproved = false) ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    await getGardensForAuthorizedUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: userId from authMiddleware
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const req = { query: {}, userId: '12353943' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      throw expectedError;
    });

    await getGardensForAuthorizedUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// List of changable fields specifiable in req.body =
//   longitude
//   latitude
//   gardenOwnerId
//   isApproved
//   gardenPicture
//   contactPhoneNumber
//   contactEmail
//   numberOfPlots
//   gardenName
//
// PUT gardens/:gardenId
describe('Updating gardens', () => {
  // Input: gardenId url param, request body specifying the new field values
  // Expected status code: 200
  // Expected behavior: update garden identified by gardenId so that it has new field values as specified in request body
  // Expected output: whether the update was successful or not
  test('Valid changable fields and no database error', async () => {
    const req = { params: { gardenId: '1' }, body: { contactEmail: 'bar@gmail.com', contactPhoneNumber: '34235234' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = { affectedRows: 1 };
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([req.body.contactPhoneNumber, req.body.contactEmail, req.params.gardenId]);
      expect(sql).toBe('UPDATE gardens SET contactPhoneNumber=?, contactEmail=? WHERE id=?');
      return [expectedReturnedData];
    });

    await updateGarden(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: gardenId url param, request body specifying the new field values
  // Expected status code: 400 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when function determines that there are no new valid garden fields in request body
  //  and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('None or invalid changable fields and no database error', async () => {
    const req = { params: { gardenId: '1' }, body: { contactEmailBleh: 'bar@gmail.com' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Request body contains no valid updates');
    expectedError.status = StatusCodes.BAD_REQUEST;

    await updateGarden(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: gardenId url param, request body specifying the new field values
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const req = { params: { gardenId: '1' }, body: { contactEmail: 'bar@gmail.com' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    await updateGarden(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// Req.body required fields =
//    gardenName
//    gardenAddress
//    gardenPlots
//    gardenPhone
//    gardenEmail
//
// POST /gardens
describe('Create garden (application)', () => {
  beforeEach(() => {
    database.query.mockRestore();
  });

  // Input: gardenId url param, request body with required fields
  // Expected status code: 200
  // Expected behavior: create a new garden with information derived from request body
  // Expected output: whether the garden creation was successful or not
  test('Valid body and no axios error as well as no database errors', async () => {
    const req = {
      params: { gardenId: '1' },
      body: {
        gardenName: 'some name',
        gardenAddress: 'some address',
        gardenPlots: 4,
        gardenPhone: '3214',
        gardenEmail: 'email@gmail.com',
      },
      userId: '324231',
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const axiosReturnValue = { data: { results: [{ geometry: { location: { lat: '12.3423', lng: '34.4234' } } }] } };
    axios.get.mockImplementationOnce(() => {
      return axiosReturnValue;
    });

    const databaseSelectQueryGardenId = 1;
    database.query.mockImplementation((sql, inputArr) => {
      if (
        sql ===
        `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(inputArr).toStrictEqual([
          req.body.gardenAddress,
          axiosReturnValue.data.results[0].geometry.location.lng,
          axiosReturnValue.data.results[0].geometry.location.lat,
          req.userId,
          0,
          null,
          req.body.gardenPhone,
          req.body.gardenEmail,
          req.body.gardenPlots,
          req.body.gardenName,
        ]);
        return null;
      } else if (sql === `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`) {
        expect(inputArr).toStrictEqual([req.userId]);
        return [[{ id: databaseSelectQueryGardenId }]];
      } else if (sql === `INSERT INTO roles (profileId, gardenId, roleNum) VALUES (?, ?, ?)`) {
        expect(inputArr).toStrictEqual([req.userId, databaseSelectQueryGardenId, 2]);
        return [{ affectedRows: 1 }];
      }

      throw Error('It should not get to this point');
    });

    await createGardenApplication(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Input: gardenId url param, request body with required fields
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling axios.get and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('axios error', async () => {
    const req = {
      params: { gardenId: '1' },
      body: {
        gardenName: 'some name',
        gardenAddress: 'some address',
        gardenPlots: 4,
        gardenPhone: '3214',
        gardenEmail: 'email@gmail.com',
      },
      userId: '324231',
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const expectedError = new Error('Some axios error');
    axios.get.mockImplementationOnce(() => {
      throw expectedError;
    });

    await createGardenApplication(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: gardenId url param, request body with required fields
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when inserting to gardens table', async () => {
    const req = {
      params: { gardenId: '1' },
      body: {
        gardenName: 'some name',
        gardenAddress: 'some address',
        gardenPlots: 4,
        gardenPhone: '3214',
        gardenEmail: 'email@gmail.com',
      },
      userId: '324231',
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const axiosReturnValue = { data: { results: [{ geometry: { location: { lat: '12.3423', lng: '34.4234' } } }] } };
    axios.get.mockImplementationOnce(() => {
      return axiosReturnValue;
    });

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, inputArr) => {
      if (
        sql ===
        `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        throw expectedError;
      }

      throw Error('It should not get to this point');
    });

    await createGardenApplication(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: gardenId url param, request body with required fields
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when getting newly added garden', async () => {
    const req = {
      params: { gardenId: '1' },
      body: {
        gardenName: 'some name',
        gardenAddress: 'some address',
        gardenPlots: 4,
        gardenPhone: '3214',
        gardenEmail: 'email@gmail.com',
      },
      userId: '324231',
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const axiosReturnValue = { data: { results: [{ geometry: { location: { lat: '12.3423', lng: '34.4234' } } }] } };
    axios.get.mockImplementationOnce(() => {
      return axiosReturnValue;
    });

    const expectedError = new Error('Some database error');
    database.query.mockImplementation((sql, inputArr) => {
      if (
        sql ===
        `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(inputArr).toStrictEqual([
          req.body.gardenAddress,
          axiosReturnValue.data.results[0].geometry.location.lng,
          axiosReturnValue.data.results[0].geometry.location.lat,
          req.userId,
          0,
          null,
          req.body.gardenPhone,
          req.body.gardenEmail,
          req.body.gardenPlots,
          req.body.gardenName,
        ]);
        return null;
      } else if (sql === `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`) {
        throw expectedError;
      }

      throw Error('It should not get to this point');
    });

    await createGardenApplication(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Input: gardenId url param, request body with required fields
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error when inserting into roles table', async () => {
    const req = {
      params: { gardenId: '1' },
      body: {
        gardenName: 'some name',
        gardenAddress: 'some address',
        gardenPlots: 4,
        gardenPhone: '3214',
        gardenEmail: 'email@gmail.com',
      },
      userId: '324231',
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const axiosReturnValue = { data: { results: [{ geometry: { location: { lat: '12.3423', lng: '34.4234' } } }] } };
    axios.get.mockImplementationOnce(() => {
      return axiosReturnValue;
    });

    const expectedError = new Error('Some database error');
    const databaseSelectQueryGardenId = 1;
    database.query.mockImplementation((sql, inputArr) => {
      if (
        sql ===
        `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ) {
        expect(inputArr).toStrictEqual([
          req.body.gardenAddress,
          axiosReturnValue.data.results[0].geometry.location.lng,
          axiosReturnValue.data.results[0].geometry.location.lat,
          req.userId,
          0,
          null,
          req.body.gardenPhone,
          req.body.gardenEmail,
          req.body.gardenPlots,
          req.body.gardenName,
        ]);
        return null;
      } else if (sql === `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`) {
        expect(inputArr).toStrictEqual([req.userId]);
        return [[{ id: databaseSelectQueryGardenId }]];
      } else if (sql === `INSERT INTO roles (profileId, gardenId, roleNum) VALUES (?, ?, ?)`) {
        throw expectedError;
      }

      throw Error('It should not get to this point');
    });

    await createGardenApplication(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
