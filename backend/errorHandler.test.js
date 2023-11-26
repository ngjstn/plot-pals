const { StatusCodes } = require('http-status-codes');
const errorHandler = require('./errorHandler');

describe('Centralized Error Handling', () => {
  test('Error with unspecified status code', () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const error = new Error('Some Error');

    errorHandler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  test('Error with specified status code', () => {
    const expectedStatusCode = StatusCodes.UNAUTHORIZED;

    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const error = new Error('Some Error');
    error.status = expectedStatusCode;

    errorHandler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });
});
