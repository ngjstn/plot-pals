const express = require('express');
const { getAllGardens, createGardenDev, deleteGardenDev } = require('../controllers/gardensController');
const { getAllProfiles } = require('../controllers/profilesController');
const { getAllTasks, createTaskDev, deleteTaskDev } = require('../controllers/tasksController');
const { getAllPlots, createPlotDev, deletePlotDev } = require('../controllers/plotsController');

const router = express.Router();

router.get('/gardens/all', getAllGardens);
router.get('/tasks/all', getAllTasks);
router.get('/profiles/all', getAllProfiles);
router.get('/plots/all', getAllPlots);

router.post('/plots', createPlotDev);
router.post('/gardens', createGardenDev);
router.post('/tasks', createTaskDev);

router.delete('/plots/:plotId', deletePlotDev);
router.delete('/gardens/:gardenId', deleteGardenDev);
router.delete('/tasks/:taskId', deleteTaskDev);

module.exports = router;
