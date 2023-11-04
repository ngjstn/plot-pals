const { StatusCodes } = require('http-status-codes');
const { database } = require('../database');
const axios = require('axios');
require('dotenv').config();

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
  const { isApproved } = req.query;
  let isApprovedConditionString = '';

  if (isApproved === 'true') {
    isApprovedConditionString = 'AND gardens.isApproved = true';
  } else if (isApproved === 'false') {
    isApprovedConditionString = 'AND gardens.isApproved = false';
  }

  const sql = `SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id${isApprovedConditionString}) ORDER BY id DESC`;

  try {
    const queryResults = await database.query(sql, [req.userId]);
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

const createGardenApplication = async (req, res, next) => {
  const { gardenName, gardenAddress, gardenPlots, gardenPhone, gardenEmail } = req.body;

  console.log(req.userId);

  let lat = 0;
  let long = 0;
  let gardenID;

  try {
    const latlong = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: gardenAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    lat = latlong.data.results[0].geometry.location.lat;
    long = latlong.data.results[0].geometry.location.lng;
  } catch (error) {
    console.log(error);
    return next(error);
  }

  try {
    const sqlInsertGardens = `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, 
      isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await database.query(sqlInsertGardens, [
      gardenAddress,
      long,
      lat,
      req.userId,
      0,
      null,
      gardenPhone,
      gardenEmail,
      gardenPlots,
      gardenName,
    ]);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  try {
    const sqlFind = `SELECT * FROM gardens WHERE gardenOwnerId = ? ORDER BY id DESC LIMIT 1`;
    const queryResults = await database.query(sqlFind, [req.userId]);
    gardenID = queryResults[0][0].id;
    console.log(gardenID);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  try {
    const sqlInsertProfiles = `INSERT INTO roles (profileId, gardenId, roleNum) VALUES (?, ?, ?)`;
    const insResults = await database.query(sqlInsertProfiles, [req.userId, gardenID, 2]);
    return res.json({ success: insResults[0].affectedRows > 0 });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

module.exports = {
  getAllGardens,
  getGardensForAuthorizedUser,
  updateGarden,
  createGardenApplication,
};
