const { database } = require('../database');

const getAllAdminProfiles = async (req, res, next) => {
  const { profileId } = req.query;
  const sql = profileId ? 'SELECT * FROM admin_profiles WHERE id=?' : 'SELECT * FROM admin_profiles';

  try {
    const queryResults = await database.query(sql, profileId ? [profileId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAllAdminProfiles };
