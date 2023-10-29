const express = require('express');
const { getAllProfiles, createProfileForAuthenticatedUser } = require('../controllers/profilesController');

const router = express.Router();

// accepts query parameter profileId
// EXPLANATION NOTE: this router for example will accept all requests of route '/profiles/all' or '/profiles/all?profileId={some profile id}'
router.get('/all', getAllProfiles);

router.post('/', createProfileForAuthenticatedUser);

module.exports = router;
