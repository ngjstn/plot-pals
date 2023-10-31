const express = require('express');
const { getAllAdminProfiles } = require('../controllers/adminProfilesController');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, getAllAdminProfiles);

module.exports = router;
