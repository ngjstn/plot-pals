const roles = Object.freeze({
  CARETAKER: 0,
  PLOT_OWNER: 1,
  GARDEN_OWNER: 2,
  ADMIN: 3,
});

const MAX_RATING = 5;
const MIN_RATING = 0;
const STARTING_COMPETENCE = 0;

module.exports = { roles, MAX_RATING, MIN_RATING, STARTING_COMPETENCE };
