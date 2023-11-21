const { database } = require('../database');
const { StatusCodes } = require('http-status-codes');

const getAllAdminProfiles = async (req, res, next) => {
  const { profileId } = req.query;
  const sql = profileId ? 'SELECT * FROM admin_profiles WHERE id=?' : 'SELECT * FROM admin_profiles';

  try {
    const queryResults = await database.query(sql, profileId ? [profileId] : null);
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAllAdminProfiles };
