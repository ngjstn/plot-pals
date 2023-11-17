const { StatusCodes } = require('http-status-codes');
const { database } = require('../../database');
const {
  getAllGardens,
  getGardensForAuthorizedUser,
  updateGarden,
  createGardenApplication,
} = require('../gardensController');
const { randomGardensWithoutAuthorizedUserDiscrimination } = require('./fixtures/gardenFixtures');

jest.mock('../../database', () => ({
  database: {
    query: jest.fn(),
  },
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
    database.query.mockImplementationOnce((sql, gardenId) => {
      expect(gardenId).toStrictEqual(null);
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

  // Input: None
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
    database.query.mockImplementationOnce((sql, gardenId) => {
      expect(gardenId).toStrictEqual(['1']);
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

  // Input: None
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
    database.query.mockImplementationOnce((sql, gardenId) => {
      expect(gardenId).toStrictEqual(null);
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

  // Input: None
  // Expected status code: 200
  // Expected behavior: will return all gardens that has isApproved field equalling to 0 (false)
  // Expected output: all gardens that has isApproved field equalling to 0 (false)
  test('No gardenId but has isApproved == false query parameter as well as no database error', async () => {
    const req = { query: { isApproved: 'false' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const expectedReturnedData = randomGardensWithoutAuthorizedUserDiscrimination.map(
      (garden) => garden.isApproved === req.query.isApproved
    );
    database.query.mockImplementationOnce((sql, gardenId) => {
      expect(gardenId).toStrictEqual(null);
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
});
