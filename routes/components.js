var express = require('express');
var router = express.Router();
var components_controller = require('../controllers/components_controller.js');
// CRUD Routes for Components
router.post('/components-save', components_controller.createComponents);
router.get('/components', components_controller.getComponents);
module.exports = router;