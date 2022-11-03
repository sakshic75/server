var express = require('express');
var router = express.Router();

var rpe_controller = require('../controllers/rpe_controller.js');

// CRUD Routes for Phases


router.post('/save-rpe', rpe_controller.createRpe);
router.get('/all-rpe', rpe_controller.getAllRpe);
router.post('/load', rpe_controller.getload);
//router.get('/phases', phases_controller.getPhases);


module.exports = router;