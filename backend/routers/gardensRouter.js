const express = require('express');
const { getGardens } = require('../controllers/gardensController');

const router = express.Router();

// accepts query parameter gardenId
router.get('/', getGardens);

module.exports = router;
