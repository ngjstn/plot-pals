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

module.exports = {
  getAllPlots,
};
