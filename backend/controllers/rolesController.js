const { database } = require('../database');

const getRolesForAuthenticatedUser = async (req, res, next) => {
  const sql = 'SELECT roles.*, gardens.gardenName FROM roles JOIN gardens ON roles.gardenId = gardens.id WHERE profileId = ? ORDER BY gardens.gardenName';

  try {
    const queryResults = await database.query(sql, [req.userId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getRolesForAuthenticatedUser,
};