const { OAuth2Client } = require('google-auth-library');
const authMiddleware = require('./authMiddleware');
const { StatusCodes } = require('http-status-codes');

jest.mock('google-auth-library');

describe('Authentication Middleware', () => {
  // Input: JWT in authentication header
  // Expected status code: None
  // Expected behavior: assign user id of authenticated user to req.userId and call next()
  test('Valid JWT, no google auth error', async () => {
    const req = { headers: { authorization: 'Bearer asdfas23rwfsdfasdfas' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const invalidAuthorizationError = new Error('No valid authorization header');
    invalidAuthorizationError.status = StatusCodes.FORBIDDEN;
    const expectedUserId = '23412312';
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

    await authMiddleware(req, res, next);

    expect(req.userId).toStrictEqual(expectedUserId);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(invalidAuthorizationError);
  });

  // Input: Bypass token in authentication header
  // Expected status code: None
  // Expected behavior: assign user id of authenticated user to req.userId and call next()
  test('Use bypass token', async () => {
    const req = { headers: { authorization: `Bearer ${process.env.BYPASS_TOKEN}` } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const invalidAuthorizationError = new Error('No valid authorization header');
    invalidAuthorizationError.status = StatusCodes.FORBIDDEN;
    const expectedUserId = process.env.BYPASS_TOKEN;

    await authMiddleware(req, res, next);

    expect(req.userId).toStrictEqual(expectedUserId);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(invalidAuthorizationError);
  });

  // Input: invalid JWT in authentication header
  // Expected status code: 403 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: checks that JWT is invalid (doesnt start with 'Bearer ') and forwards an error using next()
  test('invalid JWT, no google auth error', async () => {
    const req = { headers: { authorization: 'asdf123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const invalidAuthorizationError = new Error('No valid authorization header');
    invalidAuthorizationError.status = StatusCodes.FORBIDDEN;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(invalidAuthorizationError);
  });

  // Input: None
  // Expected status code: 403 (Set using errorHandler which we test in errorHandler.test.js)
  // Expected behavior: if google oauth fails then forward an error using next()
  test('Valid JWT, google auth error', async () => {
    const req = { headers: { authorization: 'Bearer asdfas23rwfsdfasdfas' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    const invalidAuthorizationError = new Error('No valid authorization header');
    invalidAuthorizationError.status = StatusCodes.FORBIDDEN;
    const someOauthError = new Error('Some Oauth Error');

    OAuth2Client.mockImplementationOnce(() => {
      return {
        verifyIdToken: jest.fn().mockImplementationOnce(() => {
          throw someOauthError;
        }),
      };
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(invalidAuthorizationError);
  });
});
