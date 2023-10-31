const express = require('express');
const { getAllGardens, getGardensForAuthorizedUser } = require('../controllers/gardensController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter gardenId and isApproved
router.get('/all', authMiddleware, getAllGardens);
router.get('/', authMiddleware, getGardensForAuthorizedUser);

router.update('/:gardenId', authMiddleware, updateGarden);

module.exports = router;
