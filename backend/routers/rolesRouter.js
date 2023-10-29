const express = require('express');
const { getRolesForAuthenticatedUser, getAllRoles } = require('../controllers/rolesController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter userIs
router.get('/', authMiddleware, getRolesForAuthenticatedUser);

// TODO: GET Garden members and their roles by garden
router.get('/all', authMiddleware, getAllRoles);

module.exports = router;
