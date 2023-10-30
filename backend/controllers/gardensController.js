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
  // const {gardenName, gardenAddress, gardenPlots, gardenPhone, gardenEmail} = req.body;

  try {
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: '24%20Sussex%20Drive%20Ottawa%20ON',
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    }).then( function (response) {
      lat = response.data.results[0].geometry.location.lat;
      lng = response.data.results[0].geometry.location.lng;
      console.log(lat, lng);
    });

  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getGardens,
  createGardenApplication,
};
