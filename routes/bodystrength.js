var express = require('express');
var router = express.Router();
var bodystrength_controller = require('../controllers/bodystrength_controller.js');
// CRUD Routes for Components
router.post('/bodystrength-save', bodystrength_controller.createStrenght);
router.get('/bodystrength', bodystrength_controller.getbodyStrenght);
// router.get('/components', components_controller.getComponents);
module.exports = router;