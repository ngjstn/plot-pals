const { database } = require('../database');

const getAllTasks = async (req, res, next) => {
  let sql =
    'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND posts.taskId = tasks.id';

  try {
    const queryResults = await database.query(sql);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getTasksRelatedToAuthorizedUser = async (req, res, next) => {
  const { userIs } = req.query;

  // We want to get tasks with extra column for garden name
  let sql =
    'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND (assigneeId = ? OR assignerId = ?) AND posts.taskId = tasks.id ORDER BY posts.id DESC';
  let sqlInput = [req.userId, req.userId];
  if (userIs === 'assignee') {
    sql =
      'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND assigneeId = ? AND posts.taskId = tasks.id ORDER BY posts.id DESC';
    sqlInput = [req.userId];
  } else if (userIs === 'assigner') {
    sql =
      'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND assignerId = ? AND posts.taskId = tasks.id ORDER BY posts.id DESC';
    sqlInput = [req.userId];
  }

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getTasksRelatedToAuthorizedUserByGardenId = async (req, res, next) => {
  const { userIs } = req.query;
  const { gardenId } = req.params;

  // We want to get tasks with extra column for garden name
  let sql =
    'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND (assigneeId = ? OR assignerId = ?) AND posts.taskId = tasks.id ORDER BY posts.id DESC';
  let sqlInput = [gardenId, req.userId, req.userId];
  if (userIs === 'assignee') {
    sql =
      'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND assigneeId = ? AND posts.taskId = tasks.id ORDER BY posts.id DESC';
    sqlInput = [gardenId, req.userId];
  } else if (userIs === 'assigner') {
    sql =
      'SELECT posts.*, tasks.*, gardens.gardenName FROM posts JOIN tasks JOIN gardens WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND assignerId = ? AND posts.taskId = tasks.id ORDER BY posts.id DESC';
    sqlInput = [gardenId, req.userId];
  }

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllTasks,
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
};
