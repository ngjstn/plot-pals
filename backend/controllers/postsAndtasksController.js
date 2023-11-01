const { database } = require('../database');

const getAllTasks = async (req, res, next) => {
  let sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
  FROM posts 
  LEFT JOIN tasks ON posts.taskId = tasks.taskId 
  JOIN gardens 
  LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
  LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
  WHERE posts.postGardenId = gardens.id AND posts.taskId = tasks.taskId
  ORDER BY posts.id DESC`;

  try {
    const queryResults = await database.query(sql);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getAllPostsAndTasks = async (req, res, next) => {
  const { gardenId } = req.query;
  let sql = gardenId
    ? `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id AND posts.postGardenId = ?
    ORDER BY posts.id DESC`
    : `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id
    ORDER BY posts.id DESC`;

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const getTasksRelatedToAuthorizedUser = async (req, res, next) => {
  const { userIs } = req.query;

  // We want to get tasks with extra column for garden name
  let sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
  FROM posts 
  LEFT JOIN tasks ON posts.taskId = tasks.taskId 
  JOIN gardens 
  LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
  LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
  WHERE posts.postGardenId = gardens.id AND (assigneeId = ? OR assignerId = ?) AND posts.taskId = tasks.taskId 
  ORDER BY posts.id DESC`;
  let sqlInput = [req.userId, req.userId];
  if (userIs === 'assignee') {
    sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
  FROM posts 
  LEFT JOIN tasks ON posts.taskId = tasks.taskId 
  JOIN gardens 
  LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
  LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
  WHERE posts.postGardenId = gardens.id AND assigneeId = ? AND posts.taskId = tasks.taskId 
  ORDER BY posts.id DESC`;
    sqlInput = [req.userId];
  } else if (userIs === 'assigner') {
    sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id AND assignerId = ? AND posts.taskId = tasks.taskId 
    ORDER BY posts.id DESC`;
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
  let sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND (assigneeId = ? OR assignerId = ?) AND posts.taskId = tasks.taskId
    ORDER BY posts.id DESC`;
  let sqlInput = [gardenId, req.userId, req.userId];
  if (userIs === 'assignee') {
    sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND assigneeId = ? AND posts.taskId = tasks.taskId
    ORDER BY posts.id DESC`;
    sqlInput = [gardenId, req.userId];
  } else if (userIs === 'assigner') {
    sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id AND postGardenId = ? AND assignerId = ? AND posts.taskId = tasks.taskId
    ORDER BY posts.id DESC`;
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
  getAllPostsAndTasks,
};