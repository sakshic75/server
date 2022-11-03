var express = require('express');
var router = express.Router();

var activity_controller = require('../controllers/activity_controller.js');

// CRUD Routes for Activity

router.post('/activity-save', activity_controller.createActivity);
router.get('/:title', activity_controller.getActivityByTitle);
router.get('/activities', activity_controller.getActivity);
router.get('/session-activities', activity_controller.getsessionActivity);

module.exports = router;
