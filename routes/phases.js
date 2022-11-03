var express = require('express');
var router = express.Router();

var phases_controller = require('../controllers/phases_controller.js');

// CRUD Routes for Phases


router.post('/save-phase', phases_controller.createPhase);
router.get('/phases', phases_controller.getPhases);


module.exports = router;