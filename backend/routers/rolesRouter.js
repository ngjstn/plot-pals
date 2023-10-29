const express = require('express');
const { getRolesForAuthenticatedUser } = require('../controllers/rolesController');

const router = express.Router();

// accepts query parameter userIs
router.get('/', getRolesForAuthenticatedUser);

module.exports = router;
