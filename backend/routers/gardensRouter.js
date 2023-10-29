const express = require('express');
const { getAllGardens, getGardensForAuthorizedUser } = require('../controllers/gardensController');

const router = express.Router();

// accepts query parameter gardenId
router.get('/all', getAllGardens);

router.get('/', getGardensForAuthorizedUser);

module.exports = router;
