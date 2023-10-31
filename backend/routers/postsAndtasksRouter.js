const express = require('express');
const {
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
  getAllTasks,
} = require('../controllers/postsAndtasksController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter userIs
router.get('/tasks/all', authMiddleware, getAllTasks);

// accepts query parameter userIs
router.get('/tasks', authMiddleware, getTasksRelatedToAuthorizedUser);

// accepts query parameter userIs
router.get('/tasks/:gardenId', authMiddleware, getTasksRelatedToAuthorizedUserByGardenId);

module.exports = router;
