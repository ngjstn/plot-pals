const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const { getAllAdminProfiles } = require('../adminProfilesController');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
}));

// Interface GET /adminProfiles/all
describe('Obtain admin profiles', () => {
  // Input: None
  // Expected status code: 200
  // Expected behavior: an array of admin profile ids is returned
  // Expected output: admin profile ids or none at all
  test('No profileId query parameter and no database error', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = ['123214123', '124563454'];

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual(null);
      expect(sql).toBe('SELECT * FROM admin_profiles');
      return [expectedReturnedData];
    });

    await getAllAdminProfiles(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: profile id of an admin
  // Expected status code: 200
  // Expected behavior: an array with a single admin profile id is returned
  // Expected output: a single admin profile id or none at all
  test('With profileId query parameter and no database error', async () => {
    const req = { query: { profileId: '123214123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = ['123214123'];

    database.query.mockImplementationOnce((sql, profileIdArr) => {
      expect(profileIdArr).toStrictEqual([req.query.profileId]);
      expect(sql).toBe('SELECT * FROM admin_profiles WHERE id=?');
      return [expectedReturnedData];
    });

    await getAllAdminProfiles(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: expectedReturnedData });
  });

  // Input: None
  // Expected status code: 500 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: an error is thrown when calling database.query and the error is send through next()
  // Expected output: an error message (Set using errorHandler which we test in errorHandler.test.js)
  test('database error', async () => {
    const req = { query: { profileId: '123214123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedError = new Error('Some Database Error');
    database.query.mockImplementationOnce((sql, profileIdArr) => {
      throw expectedError;
    });

    await getAllAdminProfiles(req, res, next);
    expect(next).toHaveBeenCalledWith(expectedError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
