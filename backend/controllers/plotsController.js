const { StatusCodes } = require('http-status-codes');
const { database } = require('../database');

const getAllPlots = async (req, res, next) => {
  const { gardenId, plotOwnerId } = req.query;

  const sqlInput = [];
  let additionalQueries = '';

  if (gardenId) {
    sqlInput.push(gardenId);
    additionalQueries += ' AND plots.gardenId = ?';
  }

  if (plotOwnerId) {
    sqlInput.push(plotOwnerId);
    additionalQueries += ' AND plots.plotOwnerId = ?';
  }

  const sql = `SELECT profiles.displayName as plotOwnerName, plots.*, gardens.gardenName FROM plots JOIN gardens JOIN profiles WHERE plots.gardenId = gardens.id AND plots.plotOwnerId = profiles.id${additionalQueries}`;

  try {
    const queryResults = await database.query(sql, sqlInput);
    return res.status(StatusCodes.OK).json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const addAPlotToAGarden = async (req, res, next) => {
  const { gardenId, plotOwnerId } = req.body;
  let sql = `
  INSERT INTO plots(
    gardenId,
    plotOwnerId
  ) VALUES (
    ?,
    ?
  );`;
  try {
    await database.query(sql, [gardenId, plotOwnerId]);
  } catch (err) {
    return next(err);
  }

  sql = `
  UPDATE roles
  SET roleNum = 1
  WHERE gardenId = ? AND profileId = ?;`;
  try {
    await database.query(sql, [gardenId, plotOwnerId]);
  } catch (err) {
    return next(err);
  }

  return res.status(StatusCodes.OK).json({ success: true });
};

const removePlot = async (req, res, next) => {
  const { plotId } = req.params;

  let plotOwnerId;
  let gardenId;

  // Get plotOwnerId and gardenId
  let sql = `
  SELECT * FROM plots WHERE id = ?;`;
  try {
    const selectResponse = await database.query(sql, [plotId]);
    plotOwnerId = selectResponse[0][0].plotOwnerId;
    gardenId = selectResponse[0][0].gardenId;
  } catch (err) {
    return next(err);
  }

  // Update role for user in garden
  sql = `
  UPDATE roles
  SET roleNum = 0
  WHERE gardenId = ? AND profileId = ?;`;
  try {
    await database.query(sql, [gardenId, plotOwnerId]);
  } catch (err) {
    return next(err);
  }

  // Delete posts from former plotOwner
  sql = `
  DELETE FROM posts
  WHERE assignerId = ? AND postGardenId = ?;`;
  try {
    await database.query(sql, [plotOwnerId, gardenId]);
  } catch (err) {
    return next(err);
  }

  // Delete tasks from former plotOwner
  sql = `
  DELETE FROM tasks
  WHERE plotId = ?;`;
  try {
    await database.query(sql, [plotId]);
  } catch (err) {
    return next(err);
  }

  // Delete plot associated with former plotOwner
  sql = `
  DELETE FROM plots
  WHERE id = ?;`;
  try {
    await database.query(sql, [plotId]);
  } catch (err) {
    return next(err);
  }

  return res.status(StatusCodes.OK).json({ success: true });
};

module.exports = {
  getAllPlots,
  addAPlotToAGarden,
  removePlot,
};
