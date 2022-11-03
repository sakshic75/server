/**
 * =========================================
 * ROUTES OF SEARCH (USING EXPRESS.ROUTER)
 * =========================================
 * @date created: 25 August 2019
 * @authors: Waqas Rehmani and Fatemeh Fathi
 *
 * The routes/search.js is used for defining the routes of each API call in search_controller made from the frontend
 */

var express = require('express');
var router = express.Router();

var search_controller = require('../controllers/search_controller.js');

// Routes for Search

router.post('/users', search_controller.findUsers);
router.post('/users/team', search_controller.findTeamUsers);
router.post('/posts', search_controller.findPosts);
router.post('/posts/team/:teamId', search_controller.findTeamPosts);
router.post(
    '/pending/posts/:teamId/:range',
    search_controller.findPendingTeamPostsWithDateRange
);
router.post('/groups', search_controller.findGroups);
router.post('/teams', search_controller.findTeams);
router.post('/events', search_controller.findEvents);
router.post('/coaches', search_controller.findCoaches);
//Budgerigar
router.get('/getSessionIcons',search_controller.findIcons);

module.exports = router;
