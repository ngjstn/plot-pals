const { database } = require('../database');

const getAllPlots = async (req, res, next) => {
  let sql = 'SELECT plots.*, gardens.gardenName FROM plots JOIN gardens ON plots.gardenId = gardens.id';

  try {
    const queryResults = await database.query(sql);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const createPlotDev = async (req, res, next) => {
  const { gardenId, plotOwnerId } = req.body;
  let sql = `INSERT INTO plots(
    gardenId, 
    plotOwnerId
  ) VALUES (
    ?, 
    ?
  );`;

  try {
    const queryResults = await database.query(sql, [gardenId, plotOwnerId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

const deletePlotDev = async (req, res, next) => {
  const { plotId } = req.params;

  const sql = 'DELETE FROM plots WHERE id=?;';

  try {
    const queryResults = await database.query(sql, [plotId]);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllPlots,
  createPlotDev,
  deletePlotDev,
};
