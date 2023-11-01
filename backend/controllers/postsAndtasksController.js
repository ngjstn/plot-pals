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

const createTask = async (req, res, next) => {
  const { taskTitle, taskDesc, taskRating, taskDuration, taskDeadline, taskReward } = req.body;
  const { gardenId } = req.query;

  let plotId;
  let genTaskId;

  // needs to catch error for missing plot
  try {
    const sqlFindPlotId = `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`;
    const queryResults = await database.query(sqlFindPlotId, [gardenId, req.userId]);
    plotId = queryResults[0][0].id;
  } catch (err) {
    console.log(err);
    return next(err);
  }

  console.log(plotId);

  try {
    const sqlInsertTask = `INSERT into tasks (plotId, reward, minimumRating, assigneeId, 
      isCompleted, assigneeIsProvidedFeedback, deadlineDate, taskStartTime, 
      taskEndTime, expectedTaskDurationInHours) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await database.query(sqlInsertTask, [
      plotId,
      taskReward,
      taskRating,
      null,
      0,
      0,
      taskDeadline,
      null,
      null,
      taskDuration,
    ]);
  }
  catch (err) {
    console.log(err);
    return next(err);
  }

  try  {
    const sqlFindInsId = `SELECT LAST_INSERT_ID();`
    const queryResults = await database.query(sqlFindInsId);
    genTaskId = queryResults[0][0]['LAST_INSERT_ID()'];
  } catch (err) {
    console.log(err);
    return next(err);
  }

  console.log(genTaskId);

  try {
    const sqlInsertPost = `INSERT into posts (title, description, taskId, assignerId, postGardenId) 
    VALUES (?, ?, ?, ?, ?)`;
    const insResults = await database.query(sqlInsertPost, [
      taskTitle,
      taskDesc,
      genTaskId,
      req.userId,
      gardenId,
    ]);
    return res.json({ success: insResults[0].affectedRows > 0 });
  } catch (err) {
    console.log(err);
    return next(err);
  }

};

module.exports = {
  getAllTasks,
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
  getAllPostsAndTasks,
  createTask,
};
