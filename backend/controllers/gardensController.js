const { database } = require('../database');
const axios = require('axios');
require('dotenv').config();

const getAllGardens = async (req, res, next) => {
  const { gardenId } = req.query;
  const sql = gardenId
    ? 'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles ON gardens.gardenOwnerId = profiles.id WHERE id = ? ORDER BY gardenName'
    : 'SELECT gardens.*, profiles.displayName AS gardenOwnerName FROM gardens JOIN profiles ON gardens.gardenOwnerId = profiles.id ORDER BY gardenName';

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getGardensForAuthorizedUser = async (req, res, next) => {
  const sql =
    'SELECT gardens.*, profiles.displayName AS gardenOwnerName, roles.roleNum AS roleNumOfCurrentAuthorizedUserInGarden FROM gardens JOIN roles JOIN profiles WHERE (roles.profileId = ? AND roles.profileId = profiles.id AND roles.gardenId = gardens.id) ORDER BY gardenName';

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

const createGardenApplication = async (req, res, next) => {
  // const {gardenName, gardenAddress, gardenPlots, gardenPhone, gardenEmail} = req.body;
  const sql = `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, 
    isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  let lat = 0;
  let long = 0;
  let gardenAddress = '5431 Lackner Crescent';

  try {
    const latlong = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: gardenAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    });
    lat = latlong.data.results[0].geometry.location.lat;
    long = latlong.data.results[0].geometry.location.lng;
  } catch (error) {
    console.log(error);
  }

  console.log(lat, long);

  try {
    const queryResults = await database.query(sql, ['5431 Lackner Crescent', long, lat, req.userId, 0, NULL, '1234567890', 'test@test', 10, 'test']);
    return res.json({ success: queryResults[0].affectedRows > 0});
  } catch (err) {
    console.log(err);
    return next(err);
  }

};

module.exports = {
  getAllGardens,
  getGardensForAuthorizedUser,
  createGardenDev,
  deleteGardenDev,
  getGardens,
  createGardenApplication,
};
