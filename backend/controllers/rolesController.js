const { database } = require('../database');

const getRolesForAuthenticatedUser = async (req, res, next) => {
  const sql =
    'SELECT roles.*, gardens.gardenName FROM roles JOIN gardens ON roles.gardenId = gardens.id WHERE profileId = ?';

  try {
    const queryResults = await database.query(sql, [req.userId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getAllRoles = async (req, res, next) => {
  const { gardenId } = req.query;
  const sql = gardenId
    ? 'SELECT profiles.displayName AS gardenMemberName, roles.*, gardens.gardenName FROM roles JOIN gardens JOIN profiles WHERE (roles.gardenId = gardens.id AND gardens.id = ? AND roles.profileId = profiles.id)'
    : 'SELECT profiles.displayName AS gardenMemberName, roles.*, gardens.gardenName FROM roles JOIN gardens JOIN profiles WHERE (roles.gardenId = gardens.id AND roles.profileId = profiles.id)';

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllRoles,
  getRolesForAuthenticatedUser,
};
