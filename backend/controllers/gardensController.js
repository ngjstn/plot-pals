const { database } = require('../database');
const axios = require('axios');
require('dotenv').config();

const getGardens = async (req, res, next) => {
  const { gardenId } = req.query;
  const sql = gardenId ? 'SELECT * FROM gardens WHERE id=?' : 'SELECT * FROM gardens';

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const createGardenApplication = async (req, res, next) => {
  const {gardenName, gardenAddress, gardenPlots, gardenPhone, gardenEmail} = req.body;

  let lat = 0;
  let long = 0;
  // let gardenAddress = '2205 Lower Mall';
  // let gardenPhone = '1234567890';
  // let gardenEmail = 'test@test';
  // let gardenName = 'test';
  // let gardenPlots = 10;
  // let userId = "103354493506323780957";
  let gardenID;

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
    return next(error);
  }

  try {
    const sqlInsertGardens = `INSERT INTO gardens (address, longitude, latitude, gardenOwnerId, 
      isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots, gardenName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await database.query(sqlInsertGardens, [gardenAddress, long, lat, req.userId, 0, null, gardenPhone, gardenEmail, gardenPlots, gardenName]);
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
  getGardens,
  createGardenApplication,
};
