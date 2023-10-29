const express = require('express');
const { getUpdatesForAuthenticatedUser } = require('../controllers/updatesController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getUpdatesForAuthenticatedUser);

module.exports = router;
