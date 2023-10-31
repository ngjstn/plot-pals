const express = require('express');
const {
  getAllGardens,
  getGardensForAuthorizedUser,
  updateGarden,
  createGardenApplication,
} = require('../controllers/gardensController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter gardenId and isApproved
router.get('/all', authMiddleware, getAllGardens);
router.get('/', authMiddleware, getGardensForAuthorizedUser);

router.put('/:gardenId', authMiddleware, updateGarden);
router.post('/', authMiddleware, createGardenApplication);

module.exports = router;
