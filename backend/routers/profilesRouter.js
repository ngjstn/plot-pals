const express = require('express');
const { getAllProfiles, createProfileForAuthenticatedUser, submitFeedback } = require('../controllers/profilesController');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter profileId
router.get('/all', authMiddleware, getAllProfiles);

router.post('/', authMiddleware, createProfileForAuthenticatedUser);

router.put('/rating', authMiddleware, submitFeedback);

module.exports = router;
