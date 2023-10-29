const { database } = require('../database');

const getAllTasks = async (req, res, next) => {
  let sql = 'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id';

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

const getTasksRelatedToAuthorizedUserByGardenId = async (req, res, next) => {
  const { userIs } = req.query;
  const { gardenId } = req.params;

  // We want to get tasks with extra column for garden name
  let sql =
    'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id WHERE gardenId = ? AND (assigneeId = ? OR assignerId = ?) ORDER BY id DESC';
  let sqlInput = [gardenId, req.userId, req.userId];
  if (userIs === 'assignee') {
    sql =
      'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id WHERE gardenId = ? AND assigneeId = ? ORDER BY id DESC';
    sqlInput = [gardenId, req.userId];
  } else if (userIs === 'assigner') {
    sql =
      'SELECT tasks.*, gardens.gardenName FROM tasks JOIN gardens ON tasks.gardenId = gardens.id WHERE gardenId = ? AND assignerId = ? ORDER BY id DESC';
    sqlInput = [gardenId, req.userId];
  }

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const deleteTaskDev = async (req, res, next) => {
  const { taskId } = req.params;

  const sql = 'DELETE FROM tasks WHERE id=?;';

  try {
    const queryResults = await database.query(sql, [taskId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const createTaskDev = async (req, res, next) => {
  const {
    plotId,
    reward,
    minimumRating,
    title,
    description,
    assignerId,
    assigneeId,
    isCompleted,
    assigneeIsProvidedFeedback,
    gardenId,
    deadlineDate,
    taskStartTime,
    taskEndTime,
    expectedTaskDurationInHours,
  } = req.body;
  const sql = `INSERT INTO tasks(
    plotId, 
    reward, 
    minimumRating, 
    title,
    description, 
    assignerId, 
    assigneeId, 
    isCompleted, 
    assigneeIsProvidedFeedback, 
    gardenId, 
    deadlineDate, 
    taskStartTime, 
    taskEndTime, 
    expectedTaskDurationInHours
  ) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
  ); `;

  try {
    const queryResults = await database.query(sql, [
      plotId,
      reward,
      minimumRating,
      title,
      description,
      assignerId,
      assigneeId,
      isCompleted,
      assigneeIsProvidedFeedback,
      gardenId,
      deadlineDate,
      taskStartTime,
      taskEndTime,
      expectedTaskDurationInHours,
    ]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllTasks,
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
  createTaskDev,
  deleteTaskDev,
};
