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

const addPlots = async (req, res, next) => {
  const { gardenId, plotOwnerId } = req.body;
  let sql = `
  INSERT INTO plots(
    gardenId, 
    plotOwnerId
  ) VALUES (
    123 /*some int from garden.id */, 
    '{insert some profile.id}'
  );`;
  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllPlots,
};
