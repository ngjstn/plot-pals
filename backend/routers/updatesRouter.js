const express = require('express');
const { getUpdatesForAuthenticatedUser } = require('../controllers/updatesController');

const router = express.Router();

router.get('/', getUpdatesForAuthenticatedUser);

module.exports = router;
