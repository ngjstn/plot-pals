const express = require('express');
const { getAllGardens, getGardensForAuthorizedUser, createGardenApplication } = require('../controllers/gardensController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter gardenId
router.get('/all', authMiddleware, getAllGardens);

router.get('/', authMiddleware, getGardensForAuthorizedUser);

router.post('/', createGardenApplication);

module.exports = router;
