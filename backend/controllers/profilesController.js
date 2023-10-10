const { database } = require('../database');
const { roles, MAX_RATING } = require('../constants/profile');

const getProfiles = async (req, res, next) => {
  const { profileId } = req.query;
  const sql = profileId ? 'SELECT * FROM profiles WHERE id = ?' : 'SELECT * FROM profiles';

  // EXPLANATION NOTE: usually you want to try/catch await functions in your controllers
  try {
    const queryResults = await database.query(sql, profileId);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    // EXPLANATION NOTE: this forwards error to error handler
    return next(err);
  }
};

const createProfileForAuthenticatedUser = async (req, res, next) => {
  const { displayName } = req.body;
  console.log(displayName);
  const sql = 'INSERT INTO profiles (id, rating, role, displayName) VALUES (?, ?, ?, ?)';
  try {
    const queryResults = await database.query(sql, [req.userId, MAX_RATING, roles.CARETAKER, displayName]);
    return res.json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getProfiles,
  createProfileForAuthenticatedUser,
};
