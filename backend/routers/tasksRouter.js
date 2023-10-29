const express = require('express');
const {
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
} = require('../controllers/tasksController');

const router = express.Router();

// accepts query parameter userIs
router.get('/', getTasksRelatedToAuthorizedUser);

// accepts query parameter userIs
router.get('/:gardenId', getTasksRelatedToAuthorizedUserByGardenId);

module.exports = router;
