const { StatusCodes } = require('http-status-codes');
const { database } = require('../database');

const getAllPostsAndTasks = async (req, res, next) => {
  const { gardenId, postId } = req.query;
  const sqlInput = [];
  let additionalSqlConditions = '';

  if (gardenId) {
    sqlInput.push(gardenId);
    additionalSqlConditions += ' AND posts.postGardenId = ?';
  }

  if (postId) {
    sqlInput.push(postId);
    additionalSqlConditions += ' AND posts.id = ?';
  }

  const sql = `SELECT posts.*, tasks.*, gardens.gardenName, assignerProfiles.displayName AS assignerName, assigneeProfiles.displayName AS assigneeName 
    FROM posts 
    LEFT JOIN tasks ON posts.taskId = tasks.taskId 
    JOIN gardens 
    LEFT JOIN profiles AS assignerProfiles ON posts.assignerId = assignerProfiles.id
    LEFT JOIN profiles As assigneeProfiles ON tasks.assigneeId = assigneeProfiles.id
    WHERE posts.postGardenId = gardens.id ${additionalSqlConditions} 
    ORDER BY posts.id DESC`;

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
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
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
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
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const createTask = async (req, res, next) => {
  const { taskTitle, taskDesc, taskRating, taskDuration, taskDeadline, taskReward } = req.body;
  const { gardenId } = req.query;

  let gardenRoleNum;
  let plotId;
  let genTaskId;

  // check first if they are a gardenOwner
  try {
    const sqlFindGardenOwner = `SELECT * FROM roles WHERE profileId = ? AND gardenId = ?`;
    const queryResults = await database.query(sqlFindGardenOwner, [req.userId, gardenId]);
    gardenRoleNum = queryResults[0][0].roleNum;
  } catch (err) {
    console.log(err);
    return next(err);
  }

  console.log('gardenRoleNum: ' + gardenRoleNum);

  if (gardenRoleNum === 2) {
    plotId = null;
  } else {
    try {
      const sqlFindPlotId = `SELECT plots.id FROM plots WHERE plots.gardenId = ? AND plotOwnerId = ?`;
      const queryResults = await database.query(sqlFindPlotId, [gardenId, req.userId]);
      plotId = queryResults[0][0].id;
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  console.log('plotId: ' + plotId);

  // need to process string for deadline
  let month = taskDeadline.substring(0, 2);
  let day = taskDeadline.substring(2, 4);
  let year = taskDeadline.substring(4, 8);
  let deadlineDate = year + '-' + month + '-' + day + ' 00:00:00';

  console.log('deadlineDate: ' + deadlineDate);

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
      deadlineDate,
      null,
      null,
      taskDuration,
    ]);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  try {
    const sqlFindInsId = `SELECT LAST_INSERT_ID();`;
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
    const insResults = await database.query(sqlInsertPost, [taskTitle, taskDesc, genTaskId, req.userId, gardenId]);
    return res.status(StatusCodes.OK).json({ success: insResults[0].affectedRows > 0 });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

const createPost = async (req, res, next) => {
  const { postTitle, postDesc } = req.body;
  const { gardenId } = req.query;

  try {
    const sqlInsertPost = `INSERT into posts (title, description, taskId, assignerId, postGardenId)
    VALUES (?, ?, ?, ?, ?)`;
    const insResults = await database.query(sqlInsertPost, [postTitle, postDesc, null, req.userId, gardenId]);
    return res.status(StatusCodes.OK).json({ success: insResults[0].affectedRows > 0 });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

const claimTask = async (req, res, next) => {
  const { taskId } = req.query;

  // update task based on taskid, update taskStartTime and set assigneeId
  try {
    const sqlClaimTask = `UPDATE tasks SET taskStartTime = NOW(), assigneeId = ? 
      WHERE taskId = ? AND taskStartTime IS NULL AND assigneeId IS NULL`;
    const queryResults = await database.query(sqlClaimTask, [req.userId, taskId]);
    return res.status(StatusCodes.OK).json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

const completeTask = async (req, res, next) => {
  const { taskId } = req.query;

  let sql;

  // update task based on taskid
  // if taskStartTime is not null, update taskEndTime and isCompleted
  try {
    sql = `UPDATE tasks SET taskEndTime = NOW(), isCompleted = 1 
      WHERE taskId = ? AND taskStartTime IS NOT NULL AND assigneeId = ? AND isCompleted = 0`;
    await database.query(sql, [taskId, req.userId]);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  //  delete tasks assigned to self that has been completed
  try {
    sql = `DELETE tasks FROM tasks 
    JOIN posts ON tasks.taskId = posts.taskId
    WHERE posts.assignerId = ? AND tasks.assigneeId = ? AND isCompleted = 1`;
    await database.query(sql, [req.userId, req.userId]);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  //  delete post associated with the deleted task from code above
  try {
    sql = `DELETE FROM posts 
    WHERE assignerId = ? AND taskId IS NULL`;
    await database.query(sql, [req.userId]);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  return res.status(StatusCodes.OK).json({ success: true });
};

module.exports = {
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
  getAllPostsAndTasks,
  createTask,
  createPost,
  claimTask,
  completeTask,
};
