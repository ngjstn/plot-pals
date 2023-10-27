const express = require('express');
const { getTasksRelatedToAuthorizedUser } = require('../controllers/tasksController');

const router = express.Router();

// accepts query parameter userIs
router.get('/', getTasksRelatedToAuthorizedUser);

module.exports = router;
