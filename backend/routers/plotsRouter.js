const express = require('express');
const { getAllPlots } = require('../controllers/plotsController');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

// accepts query parameter gardenId and isApproved
router.get('/all', authMiddleware, getAllPlots);
module.exports = router;
