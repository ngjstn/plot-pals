const { database } = require('../database');

const getTasksRelatedToAuthorizedUser = async (req, res, next) => {
  const { userIs } = req.query;

  // We want to get tasks with extra column for garden name
  let sql =
    'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id WHERE assigneeId = ? OR assignerId = ? ORDER BY id DESC';
  let sqlInput = [req.userId, req.userId];
  if (userIs === 'assignee') {
    sql =
      'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id WHERE assigneeId = ? ORDER BY id DESC';
    sqlInput = [req.userId];
  } else if (userIs === 'assigner') {
    sql =
      'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id WHERE assignerId = ? ORDER BY id DESC';
    sqlInput = [req.userId];
  }

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getTasksRelatedToAuthorizedUser,
};
