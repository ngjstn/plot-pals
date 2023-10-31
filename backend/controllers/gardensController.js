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

const updateGarden = async (req, res) => {
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
};

module.exports = {
  getAllGardens,
  getGardensForAuthorizedUser,
  createGardenDev,
  deleteGardenDev,
};
