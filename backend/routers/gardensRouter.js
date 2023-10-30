const express = require('express');
const { getGardens, createGardenApplication } = require('../controllers/gardensController');

const router = express.Router();

// accepts query parameter gardenId
router.get('/', getGardens);

router.post('/', createGardenApplication);

module.exports = router;
