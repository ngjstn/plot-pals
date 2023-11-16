const { database } = require('../database');
const { MAX_RATING, STARTING_COMPETENCE } = require('../constants/profile');

const getAllProfiles = async (req, res, next) => {
  const { profileId } = req.query;
  const sql = profileId ? 'SELECT * FROM profiles WHERE id=?' : 'SELECT * FROM profiles';

  // EXPLANATION NOTE: usually you want to try/catch await functions in your controllers
  try {
    const queryResults = await database.query(sql, profileId ? [profileId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    // EXPLANATION NOTE: this forwards error to error handler
    return next(err);
  }
};

const updateProfileDisplayNameForAuthenticatedUser = async (req, res, next) => {
  const { displayName } = req.body;
  const sql = 'UPDATE profiles SET displayName=? WHERE id=?';

  try {
    const queryResults = await database.query(sql, [displayName, req.userId]);
    return res.json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

const createProfileForAuthenticatedUser = async (req, res, next) => {
  const { displayName } = req.body;
  const sql = 'INSERT INTO profiles (id, rating, displayName, competence) VALUES (?, ?, ?, ?)';
  try {
    const queryResults = await database.query(sql, [req.userId, MAX_RATING, displayName, STARTING_COMPETENCE]);
    return res.json({ success: queryResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

const submitFeedback = async (req, res, next) => {
  const { newRating, taskId } = req.body;
  let oldRating;
  let calculatedRating;

  // calculate boost in ratings due to completion efficiency and get feedback receiver id
  let startTime;
  let endTime;
  let expectedTaskDurationInHours;
  let ratingsChangeDueToCompletionEfficiency;
  let feedBackReceiverId;
  try {
    const sqlCompleteTask = `SELECT * FROM tasks WHERE taskId = ?`;
    const queryResults = await database.query(sqlCompleteTask, [taskId]);
    startTime = queryResults[0][0].taskStartTime;
    endTime = queryResults[0][0].taskEndTime;
    expectedTaskDurationInHours = queryResults[0][0].expectedTaskDurationInHours;
    feedBackReceiverId = queryResults[0][0].assigneeId;
    ratingsChangeDueToCompletionEfficiency =
      (expectedTaskDurationInHours - (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) / 100;
  } catch (err) {
    return next(err);
  }

  // get old rating of feedback receiver
  try {
    const sqlFindOldRating = `SELECT rating FROM profiles WHERE id = ?`;
    const queryResults = await database.query(sqlFindOldRating, [feedBackReceiverId]);
    oldRating = queryResults[0][0].rating;
  } catch (err) {
    return next(err);
  }

  // calculate rating based on feedback and completion efficiency while making sure it is between 0 and 5
  calculatedRating = Math.min(
    Math.max(oldRating * 0.8 + newRating * 0.2 + ratingsChangeDueToCompletionEfficiency, 0),
    5
  );
  try {
    const sqlUpdateNewRating = `UPDATE profiles SET rating = ? WHERE id = ?`;
    await database.query(sqlUpdateNewRating, [calculatedRating, feedBackReceiverId]);
    // return res.json({ success: updateResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }

  try {
    const sqlUpdateFeedbackStatus = `UPDATE tasks SET assigneeIsProvidedFeedback = 1 WHERE taskId = ? AND assigneeId = ?`;
    const updateResults = await database.query(sqlUpdateFeedbackStatus, [taskId, feedBackReceiverId]);
    return res.json({ success: updateResults[0].affectedRows > 0 });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllProfiles,
  createProfileForAuthenticatedUser,
  submitFeedback,
  updateProfileDisplayNameForAuthenticatedUser,
};
