const { StatusCodes } = require('http-status-codes');
const { OAuth2Client } = require('google-auth-library');
const { database } = require('../../database');
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

// Interface GET /adminProfiles/all
describe('Obtain admin profiles', () => {
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
  // Expected behavior: an array of admin profile ids is returned
  // Expected output: admin profile ids or none at all
  test('No profileId query parameter and no database error', async () => {
    const expectedReturnedData = ['123214123', '124563454'];

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual(null);
      expect(sql).toBe('SELECT * FROM admin_profiles');
      return [expectedReturnedData];
    });

    const res = await request(app).get('/adminProfiles/all').set({ Authorization: 'Bearer some token' });
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header, profile id of an admin
  // Expected status code: 200
  // Expected behavior: an array with a single admin profile id is returned
  // Expected output: a single admin profile id or none at all
  test('With profileId query parameter and no database error', async () => {
    const expectedReturnedData = ['123214123'];
    const queryParams = { profileId: '123214123' };

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual([queryParams.profileId]);
      expect(sql).toBe('SELECT * FROM admin_profiles WHERE id=?');
      return [expectedReturnedData];
    });

    const res = await request(app)
      .get('/adminProfiles/all')
      .set({ Authorization: 'Bearer some token' })
      .query(queryParams);
    expect(res.statusCode).toStrictEqual(StatusCodes.OK);
    expect(res.body.data).toStrictEqual(expectedReturnedData);
  });

  // Input: authorization token in request header
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('Database error', async () => {
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    const res = await request(app).get('/adminProfiles/all').set({ Authorization: 'Bearer some token' });

    expect(res.statusCode).toStrictEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.error).toStrictEqual(expectedError.message);
  });
});
