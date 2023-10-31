const { StatusCodes } = require('http-status-codes');
const { database } = require('../database');

const getAllGardens = async (req, res, next) => {
  const { gardenId, isApproved } = req.query;

  let isApprovedConditionString = '';

  if (isApproved === 'true') {
    isApprovedConditionString = 'AND gardens.isApproved = true';
  } else if (isApproved === 'false') {
    isApprovedConditionString = 'AND gardens.isApproved = false';
  }
  const sql = gardenId
    ? `SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.id = ? AND gardens.gardenOwnerId = profiles.id ${isApprovedConditionString} ORDER BY id DESC`
    : `SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles WHERE gardens.gardenOwnerId = profiles.id ${isApprovedConditionString} ORDER BY id DESC`;

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getGardensForAuthorizedUser = async (req, res, next) => {
  const sql =
    'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id) ORDER BY id DESC';

  try {
    const queryResults = await database.query(sql, [req.userId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const deleteGardenDev = async (req, res, next) => {
  const { gardenId } = req.params;
  const sql = 'DELETE FROM gardens WHERE id=?';

  try {
    const queryResults = await database.query(sql, [gardenId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const createGardenDev = async (req, res, next) => {
  const {
    longitude,
    latitude,
    gardenOwnerId,
    isApproved,
    gardenPicture,
    contactPhoneNumber,
    contactEmail,
    numberOfPlots,
    gardenName,
  } = req.body;
  const sql = `INSERT INTO gardens(
    address, 
      longitude, 
      latitude, 
      gardenOwnerId, 
      isApproved, 
      gardenPicture, 
      contactPhoneNumber, 
      contactEmail, 
      numberOfPlots, 
      gardenName
  ) VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
  ); `;

  try {
    const queryResults = await database.query(sql, [
      longitude,
      latitude,
      gardenOwnerId,
      isApproved,
      gardenPicture,
      contactPhoneNumber,
      contactEmail,
      numberOfPlots,
      gardenName,
    ]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const updateGarden = async (req, res, next) => {
  const { gardenId } = req.params;
  const listOfChangableFields = [
    'longitude',
    'latitude',
    'gardenOwnerId',
    'isApproved',
    'gardenPicture',
    'contactPhoneNumber',
    'contactEmail',
    'numberOfPlots',
    'gardenName',
  ];

  let sql = 'UPDATE gardens SET ';
  const sqlInput = [];
  let changeCount = 0;

  // Alter sql statement to include field changes if there is a valid change specified in req.body
  for (const field of listOfChangableFields) {
    if (req.body[field] !== undefined) {
      sql += `${field}=?, `;
      sqlInput.push(req.body[field]);
      changeCount += 1;
    }
  }

  if (changeCount == 0) {
    const err = new Error('Request body contains no updates');
    err.status = StatusCodes.BAD_REQUEST;
    return next(err);
  }

  // Remove ', ' characters at the end of sql
  sql = sql.slice(0, sql.length - 2);

  // Add last part of sql statement to discriminate based on gardenId
  sql += ' WHERE id=?';
  sqlInput.push(gardenId);

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllGardens,
  getGardensForAuthorizedUser,
  createGardenDev,
  deleteGardenDev,
  updateGarden,
};
