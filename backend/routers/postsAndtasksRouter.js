const express = require('express');
const {
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
  getAllTasks,
  getAllPostsAndTasks,
} = require('../controllers/postsAndtasksController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

router.get('/tasks/all', authMiddleware, getAllTasks);

router.get('/all', getAllPostsAndTasks);

// accepts query parameter userIs
router.get('/tasks', authMiddleware, getTasksRelatedToAuthorizedUser);

// accepts query parameter userIs
router.get('/tasks/:gardenId', authMiddleware, getTasksRelatedToAuthorizedUserByGardenId);

module.exports = router;
