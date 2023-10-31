const express = require('express');
const { getAllGardens, getGardensForAuthorizedUser, updateGarden } = require('../controllers/gardensController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter gardenId and isApproved
router.get('/all', authMiddleware, getAllGardens);
router.get('/', authMiddleware, getGardensForAuthorizedUser);

router.put('/:gardenId', authMiddleware, updateGarden);

module.exports = router;
