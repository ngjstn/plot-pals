const { StatusCodes } = require('http-status-codes');
const { database } = require('../database');

const getRolesForAuthenticatedUser = async (req, res, next) => {
  const sql =
    'SELECT roles.*, gardens.gardenName FROM roles JOIN gardens ON roles.gardenId = gardens.id WHERE profileId = ?';

  try {
    const queryResults = await database.query(sql, [req.userId]);
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
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
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const addRole = async (req, res, next) => {
  const { profileId, gardenId, roleNum } = req.body;

  const sql = `
  INSERT INTO roles(
    profileId, 
    gardenId,
    roleNum
  ) VALUES (
    ?,
    ?,
    ?
  );`;

  try {
    const queryResults = await database.query(sql, [profileId, gardenId, roleNum]);
    return res.status(StatusCodes.OK).json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

const updateRole = async (req, res, next) => {
  const { profileId, gardenId } = req.params;
  const { roleNum } = req.body;

  const sql = `UPDATE roles SET roleNum=? WHERE profileId=? AND gardenId=?`;

  try {
    const queryResults = await database.query(sql, [roleNum, profileId, gardenId]);
    return res.status(StatusCodes.OK).json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

const deleteRole = async (req, res, next) => {
  const { profileId, gardenId } = req.params;

  let sql;

  // Delete tasks from user
  sql = `
  DELETE tasks FROM tasks
  INNER JOIN posts
  ON posts.taskId = tasks.taskId
  WHERE posts.assignerId = ? AND posts.postGardenId = ?;`;
  try {
    await database.query(sql, [profileId, gardenId]);
  } catch (err) {
    return next(err);
  }

  // Delete posts from user
  sql = `
  DELETE FROM posts
  WHERE assignerId = ? AND postGardenId = ?;`;
  try {
    await database.query(sql, [profileId, gardenId]);
  } catch (err) {
    return next(err);
  }

  // Delete plots from user
  sql = `
  DELETE FROM plots
  WHERE plotOwnerId = ? AND gardenId = ?;`;
  try {
    await database.query(sql, [profileId, gardenId]);
  } catch (err) {
    return next(err);
  }

  // Remove user from garden
  sql = `DELETE FROM roles WHERE profileId=? AND gardenId=?`;

  try {
    const queryResults = await database.query(sql, [profileId, gardenId]);
    return res.json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllRoles,
  getRolesForAuthenticatedUser,
  addRole,
  updateRole,
  deleteRole,
};
