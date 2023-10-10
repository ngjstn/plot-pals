const express = require('express');
const { getProfiles, createProfileForAuthenticatedUser } = require('../controllers/profilesController');

const router = express.Router();

// accepts query parameter profileId
// EXPLANATION NOTE: this router for example will accept all requests of route '/profiles' or '/profiles?profileId={some profile id}'
router.get('/', getProfiles);

router.post('/', createProfileForAuthenticatedUser);

module.exports = router;
