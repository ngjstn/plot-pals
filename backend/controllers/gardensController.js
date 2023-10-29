const { database } = require('../database');

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
  const sql = 'SELECT * FROM gardens WHERE gardenOwnerId=? ORDER BY gardenName';

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

module.exports = {
  getAllGardens,
  getGardensForAuthorizedUser,
  createGardenDev,
  deleteGardenDev,
};
