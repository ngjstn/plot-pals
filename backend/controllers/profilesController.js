const { database } = require('../database');
const { roles, MAX_RATING, STARTING_COMPETENCE } = require('../constants/profile');

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

  // get old rating
  try {
    const sqlFindOldRating = `SELECT rating FROM profiles WHERE id = ?`;
    const queryResults = await database.query(sqlFindOldRating, [req.userId]);
    oldRating = queryResults[0][0].rating;
  } catch (err) {
    console.log(err);
    return next(err);
  }
  console.log("old rating: " + oldRating);
  // calculate rating
  calculatedRating = oldRating * 0.8 + newRating * 0.2;
  console.log("calculated rating: " + calculatedRating);
  try {
    const sqlUpdateNewRating = `UPDATE profiles SET rating = ? WHERE id = ?`
    const updateResults = await database.query(sqlUpdateNewRating, [calculatedRating, req.userId]);
    // return res.json({ success: updateResults[0].affectedRows > 0 });
  } catch (err) {
    console.log(err);
    return next(err);
  }
  
  try {
    const sqlUpdateFeedbackStatus= `UPDATE tasks SET assigneeIsProvidedFeedback = 1 WHERE taskId = ? AND assigneeId = ?`;
    const updateResults = await database.query(sqlUpdateFeedbackStatus, [taskId, req.userId]);
    return res.json({ success: updateResults[0].affectedRows > 0 });
  } catch (err ){
    console.log(err);
    return next(err);
  }
};

module.exports = {
  getAllProfiles,
  createProfileForAuthenticatedUser,
  submitFeedback,
};
