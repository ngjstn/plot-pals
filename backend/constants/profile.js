const roles = Object.freeze({
  CARETAKER: 0,
  PLOT_OWNER: 1,
  GARDEN_OWNER: 2,
  ADMIN: 3,
});

const MAX_RATING = 100;
const MIN_RATING = 0;

module.exports = { roles, MAX_RATING, MIN_RATING };