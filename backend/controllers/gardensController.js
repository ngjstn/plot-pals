const { database } = require('../database');

const getGardens = async (req, res, next) => {
  const { gardenId } = req.query;
  const sql = gardenId ? 'SELECT * FROM gardens WHERE id=?' : 'SELECT * FROM gardens';

  try {
    const queryResults = await database.query(sql, gardenId ? [gardenId] : null);
    return res.json({ data: queryResults[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getGardens,
};
