const { StatusCodes } = require('http-status-codes');
const { OAuth2Client } = require('google-auth-library');
const { database } = require('../../database');
const request = require('supertest');
const { app } = require('../../server');
const axios = require('axios');

const {
  randomGardensWithoutAuthorizedUserDiscrimination,
  randomGardensWithAuthorizedUserDiscrimination,
} = require('./fixtures/gardenFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

jest.mock('google-auth-library');

jest.mock('axios', () => ({
  get: jest.fn(),
}));

const expectedUserId = '23412312';

// Interface GET /gardens/all
describe('Obtain garden information without discriminating based on req.userId', () => {
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
  // Expected behavior: will return all gardens
  // Expected output: all gardens
  test('No gardenId and isApproved query parameter as well as no database error', async () => {
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination;
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, gardenId query parameter
  // Expected status code: 200
  // Expected behavior: will return all gardens with specified gardenId
  // Expected output: all gardens with specified gardenId
  test('Has gardenId but no isApproved query parameter as well as no database error', async () => {
    const queryParams = { gardenId: '1' };
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => toString(garden.id) === queryParams.gardenId
    );

    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual([queryParams.gardenId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.id = ? AND gardens.gardenOwnerId = profiles.id ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens/all').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, isApproved query parameter
  // Expected status code: 200
  // Expected behavior: will return all gardens that has isApproved field equalling to 1 (true)
  // Expected output: all gardens that has isApproved field equalling to 1 (true)
  test('No gardenId but has isApproved == true query parameter as well as no database error', async () => {
    const queryParams = { isApproved: 'true' };
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved === queryParams.isApproved
    );
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id AND gardens.isApproved = true ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens/all').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, isApproved query parameter
  // Expected status code: 200
  // Expected behavior: will return all gardens that has isApproved field equalling to 0 (false)
  // Expected output: all gardens that has isApproved field equalling to 0 (false)
  test('No gardenId but has isApproved == false query parameter as well as no database error', async () => {
    const queryParams = { isApproved: 'false' };
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved !== queryParams.isApproved
    );
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      expect(gardenIdArr).toStrictEqual(null);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id AND gardens.isApproved = false ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens/all').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, gardenIdArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/gardens/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});

// Interface GET /gardens
describe('Obtain garden information in relation to user identified by req.userId', () => {
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
  // Expected behavior: will return all gardens that the user is in
  // Expected output: all gardens that the user is in (either as caretaker or garden owner)
  test('No isApproved query parameter as well as no database error', async () => {
    const expectedReturnedData = randomGardensWithAuthorizedUserDiscrimination;
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      expect(reqUserIdArr).toStrictEqual([expectedUserId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id ) ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, isApproved query parameter
  // Expected status code: 200
  // Expected behavior: will return all approved gardens that the user is in
  // Expected output: all approved gardens that the user is in (either as caretaker or garden owner)
  test('isApproved = true query parameter as well as no database error', async () => {
    const queryParams = { isApproved: 'true' };

    const expectedReturnedData = randomGardensWithAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved === queryParams.isApproved
    );
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      expect(reqUserIdArr).toStrictEqual([expectedUserId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id AND gardens.isApproved = true) ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, isApproved query parameter
  // Expected status code: 200
  // Expected behavior: will return all unapproved gardens that the user is in
  // Expected output: all unapproved gardens that the user is in (either as caretaker or garden owner)
  test('isApproved = false query parameter as well as no database error', async () => {
    const queryParams = { isApproved: 'false' };

    const expectedReturnedData = randomGardensWithAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved !== queryParams.isApproved
    );
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      expect(reqUserIdArr).toStrictEqual([expectedUserId]);
      expect(sql).toBe(
        'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id AND gardens.isApproved = false) ORDER BY id DESC'
      );
      return [expectedReturnedData];
    });

    const res = await request(app).get('/gardens').set({ Authorization: 'Bearer some token' }).query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, reqUserIdArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/gardens').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
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
  // Input: authorization token in request header, gardenId url param, request body specifying the new field values
  // Expected status code: 200
  // Expected behavior: update garden identified by gardenId so that it has new field values as specified in request body
  // Expected output: whether the update was successful or not
  test('Valid changable fields and no database error', async () => {
    const requestBody = { contactEmail: 'bar@gmail.com', contactPhoneNumber: '34235234' };
    const urlParams = { gardenId: '1' };

    const expectedReturnedData = { affectedRows: 1 };

    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      expect(sqlInputArr).toStrictEqual([requestBody.contactPhoneNumber, requestBody.contactEmail, urlParams.gardenId]);
      expect(sql).toBe('UPDATE gardens SET contactPhoneNumber=?, contactEmail=? WHERE id=?');
      return [expectedReturnedData];
    });

    const res = await request(app)
      .put(`/gardens/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: authorization token in request header, gardenId url param, request body specifying the new field values
  // Expected status code: 400 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when function determines that there are no new valid garden fields in request body
  //  and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('None or invalid changable fields and no database error', async () => {
    const requestBody = { contactEmailBleh: 'bar@gmail.com' };
    const urlParams = { gardenId: '1' };

    const expectedError = new Error('Request body contains no valid updates');
    expectedError.status = StatusCodes.BAD_REQUEST;

    const res = await request(app)
      .put(`/gardens/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: authorization token in request header, gardenId url param, request body specifying the new field values
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const requestBody = { contactEmail: 'bar@gmail.com' };
    const urlParams = { gardenId: '1' };

    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, sqlInputArr) => {
      throw expectedError;
    });

    const res = await request(app)
      .put(`/gardens/${urlParams.gardenId}`)
      .set({ Authorization: 'Bearer some token' })
      .send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
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

  // Input: authorization token in request header, request body with required fields
  // Expected status code: 200
  // Expected behavior: create a new garden with information derived from request body
  // Expected output: whether the garden creation was successful or not
  test('Valid body and no axios error as well as no database errors', async () => {
    const requestBody = {
      gardenName: 'some name',
      gardenAddress: 'some address',
      gardenPlots: 4,
      gardenPhone: '3214',
      gardenEmail: 'email@gmail.com',
    };

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
          requestBody.gardenAddress,
          axiosReturnValue.data.results[0].geometry.location.lng,
          axiosReturnValue.data.results[0].geometry.location.lat,
          expectedUserId,
          0,
          null,
          requestBody.gardenPhone,
          requestBody.gardenEmail,
          requestBody.gardenPlots,
          requestBody.gardenName,
        ]);
        return null;
      } else if (sql === `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`) {
        expect(inputArr).toStrictEqual([expectedUserId]);
        return [[{ id: databaseSelectQueryGardenId }]];
      } else if (sql === `INSERT INTO roles (profileId, gardenId, roleNum) VALUES (?, ?, ?)`) {
        expect(inputArr).toStrictEqual([expectedUserId, databaseSelectQueryGardenId, 2]);
        return [{ affectedRows: 1 }];
      }

      throw Error('It should not get to this point');
    });

    const res = await request(app).post(`/gardens`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.success).toStrictEqual(true);
  });

  // Input: authorization token in request header, request body with required fields
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling axios.get and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('axios error', async () => {
    const requestBody = {
      gardenName: 'some name',
      gardenAddress: 'some address',
      gardenPlots: 4,
      gardenPhone: '3214',
      gardenEmail: 'email@gmail.com',
    };

    const expectedError = new Error('Some axios error');
    axios.get.mockImplementationOnce(() => {
      throw expectedError;
    });

    const res = await request(app).post(`/gardens`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: request body with required fields, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when inserting to gardens table', async () => {
    const requestBody = {
      gardenName: 'some name',
      gardenAddress: 'some address',
      gardenPlots: 4,
      gardenPhone: '3214',
      gardenEmail: 'email@gmail.com',
    };

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

    const res = await request(app).post(`/gardens`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: request body with required fields, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when getting newly added garden', async () => {
    const requestBody = {
      gardenName: 'some name',
      gardenAddress: 'some address',
      gardenPlots: 4,
      gardenPhone: '3214',
      gardenEmail: 'email@gmail.com',
    };

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
          requestBody.gardenAddress,
          axiosReturnValue.data.results[0].geometry.location.lng,
          axiosReturnValue.data.results[0].geometry.location.lat,
          expectedUserId,
          0,
          null,
          requestBody.gardenPhone,
          requestBody.gardenEmail,
          requestBody.gardenPlots,
          requestBody.gardenName,
        ]);
        return null;
      } else if (sql === `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`) {
        throw expectedError;
      }

      throw Error('It should not get to this point');
    });

    const res = await request(app).post(`/gardens`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });

  // Input: request body with required fields, authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error when inserting into roles table', async () => {
    const requestBody = {
      gardenName: 'some name',
      gardenAddress: 'some address',
      gardenPlots: 4,
      gardenPhone: '3214',
      gardenEmail: 'email@gmail.com',
    };

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
          requestBody.gardenAddress,
          axiosReturnValue.data.results[0].geometry.location.lng,
          axiosReturnValue.data.results[0].geometry.location.lat,
          expectedUserId,
          0,
          null,
          requestBody.gardenPhone,
          requestBody.gardenEmail,
          requestBody.gardenPlots,
          requestBody.gardenName,
        ]);
        return null;
      } else if (sql === `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`) {
        expect(inputArr).toStrictEqual([expectedUserId]);
        return [[{ id: databaseSelectQueryGardenId }]];
      } else if (sql === `INSERT INTO roles (profileId, gardenId, roleNum) VALUES (?, ?, ?)`) {
        throw expectedError;
      }

      throw Error('It should not get to this point');
    });

    const res = await request(app).post(`/gardens`).set({ Authorization: 'Bearer some token' }).send(requestBody);
    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});
