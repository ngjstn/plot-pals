const express = require('express');
const { getAllGardens, getGardensForAuthorizedUser } = require('../controllers/gardensController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter gardenId
// TODO: ADD GARDEN OWNER NAMES
router.get('/all', authMiddleware, getAllGardens);

router.get('/', authMiddleware, getGardensForAuthorizedUser);

// TODO: GET Garden members and their roles by garden

// TODO: GET garden by authorized user

module.exports = router;
