const express = require('express');
const {
  getTasksRelatedToAuthorizedUser,
  getTasksRelatedToAuthorizedUserByGardenId,
  getAllTasks,
  getAllPostsAndTasks,
  createTask,
  createPost,
  claimTask,
  completeTask,
} = require('../controllers/postsAndtasksController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

router.get('/tasks/all', authMiddleware, getAllTasks);

router.get('/all', getAllPostsAndTasks);

// accepts query parameter userIs
router.get('/tasks', authMiddleware, getTasksRelatedToAuthorizedUser);

// accepts query parameter userIs
router.get('/tasks/:gardenId', authMiddleware, getTasksRelatedToAuthorizedUserByGardenId);

// accepts query parameter gardenId
router.post('/tasks', authMiddleware, createTask);

// accepts query parameter gardenId
router.post('/', authMiddleware, createPost);

// accepts query parameter
router.put('/tasks/claim', authMiddleware, claimTask);

// accepts query parameter
router.put('/tasks/complete', authMiddleware, completeTask);

module.exports = router;