const { database } = require('../database');

const getUpdatesForAuthenticatedUser = async (req, res, next) => {
  // Newer updates have higher id value, so we sort by id in descending order
  // since we newer updates to be placed at the front of the returned array
  const sql = 'SELECT * FROM updates WHERE userId=? ORDER BY id DESC';

  try {
    const queryResults = await database.query(sql, [req.userId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUpdatesForAuthenticatedUser,
};
