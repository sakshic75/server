/**
 * =========================================
 * ROUTES OF EVENTS (USING EXPRESS.ROUTER)
 * =========================================
 * @date created: 25 August 2019
 * @authors: Jay Parikh
 *
 * The routes/events.js is used for defining the routes of each API call in event_controller made from the frontend
 */


var express = require('express');
var router = express.Router();

var event_controller = require('../controllers/event_controller.js');

// CRUD Routes for Events

router.post('/', event_controller.createEvent);

router.get('/', event_controller.getAllEvents);
router.get('/:groupId/group', event_controller.getEventByGroup);
router.get('/:eventId', event_controller.getEvent);

router.put('/:eventId', event_controller.editEventResponse);
router.put('/editEvent/:eventId', event_controller.editEvent);
router.put('/:eventId/coverPicture', event_controller.updateCover);

router.delete('/:eventId', event_controller.deleteEvent);

module.exports = router;