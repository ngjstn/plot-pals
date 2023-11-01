const { database } = require('../database');

const getAllPlots = async (req, res, next) => {
  const { gardenId } = req.query;
  let sql = gardenId
    ? `SELECT profiles.displayName as plotOwnerName, plots.*, gardens.gardenName 
  FROM plots JOIN gardens JOIN profiles 
  WHERE plots.gardenId = gardens.id AND plots.plotOwnerId = profiles.id AND plots.gardenId = ?`
    : `SELECT profiles.displayName as plotOwnerName, plots.*, gardens.gardenName 
  FROM plots JOIN gardens JOIN profiles 
  WHERE plots.gardenId = gardens.id AND plots.plotOwnerId = profiles.id`;

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
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
    const insertResponse = await database.query(sql, [gardenId, plotOwnerId]);

    if (insertResponse[0].affectedRows <= 0) {
      return res.json({ success: false });
    }
  } catch (err) {
    return next(err);
  }

  sql = `
  UPDATE roles
  SET roleNum = 1
  WHERE gardenId = ? AND profileId = ?;`;
  try {
    const updateResponse = await database.query(sql, [gardenId, plotOwnerId]);

    if (updateResponse[0].affectedRows <= 0) {
      return res.json({ success: false });
    }
  } catch (err) {
    return next(err);
  }

  return res.json({ success: true });
};

const removePlot = async (req, res, next) => {
  const { plotId } = req.params;

  let plotOwnerId;
  let gardenId;

  let sql = `
  SELECT * FROM plots WHERE id = ?;`;
  try {
    const selectResponse = await database.query(sql, [plotId]);
    plotOwnerId = selectResponse[0][0].plotOwnerId;
    gardenId = selectResponse[0][0].gardenId;
  } catch (err) {
    return next(err);
  }

  sql = `
  UPDATE roles
  SET roleNum = 0
  WHERE gardenId = ? AND profileId = ?;`;
  try {
    const updateResponse = await database.query(sql, [gardenId, plotOwnerId]);

    if (updateResponse[0].affectedRows <= 0) {
      return res.json({ success: false });
    }
  } catch (err) {
    return next(err);
  }

  sql = `
  DELETE FROM posts
  WHERE assignerId = ? AND postGardenId = ?;`;
  try {
    await database.query(sql, [plotOwnerId, gardenId]);
  } catch (err) {
    return next(err);
  }

  sql = `
  DELETE FROM plots
  WHERE id = ?;`;
  try {
    await database.query(sql, [plotId]);
  } catch (err) {
    return next(err);
  }

  return res.json({ success: true });
};

module.exports = {
  getAllPlots,
  addAPlotToAGarden,
  removePlot,
};
