const express = require('express');
const {
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
} = require('../controllers/tasksController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter userIs
router.get('/', authMiddleware, getTasksRelatedToAuthorizedUser);

// accepts query parameter userIs
router.get('/:gardenId', authMiddleware, getTasksRelatedToAuthorizedUserByGardenId);

module.exports = router;
