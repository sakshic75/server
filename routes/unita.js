var express = require('express');
var router = express.Router();

var unit_controller = require('../controllers/unit_controller.js');

// CRUD Routes for Phases


router.post('/save-unita', unit_controller.createUnitA);
router.post('/save-unitb', unit_controller.createUnitB);
router.get('/unita', unit_controller.getunitA);
router.post('/unitb', unit_controller.getunitbByunitaId);

// router.get('/phases', phases_controller.getPhases);


module.exports = router;