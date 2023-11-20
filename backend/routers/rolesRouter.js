const express = require('express');
const {
  getRolesForAuthenticatedUser,
  getAllRoles,
  addRole,
  updateRole,
  deleteRole,
} = require('../controllers/rolesController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter userIs
router.get('/', authMiddleware, getRolesForAuthenticatedUser);

router.get('/all', authMiddleware, getAllRoles);

router.post('/', authMiddleware, addRole);

router.put('/:profileId/:gardenId', authMiddleware, updateRole);

router.delete('/:profileId/:gardenId', authMiddleware, deleteRole);

module.exports = router;
