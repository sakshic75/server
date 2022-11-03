var express = require('express');
var router = express.Router();

var strength_session_controller = require('../controllers/strength_session_controller.js');

// CRUD Routes for Phases


router.post('/save-strength-session', strength_session_controller.saveStrengthSession);
router.post('/get-session', strength_session_controller.getSessionById);
router.post('/update-session', strength_session_controller.updateSessionById);
router.post('/form-data', strength_session_controller.getsearchFormData);
router.post('/search-session', strength_session_controller.searchAdvanceSession);
router.post('/search-simple-session', strength_session_controller.searchSimpleSession);
router.post('/search-simple-strenght-session', strength_session_controller.searchSimpleStrengthSession);
router.post('/search-advance-strenght-session', strength_session_controller.searchAdvanceStrengthSession);
router.post('/getbyid', strength_session_controller.getSimpleSession);
router.post('/remove-session', strength_session_controller.removeSimpleSession);
router.post('/description', strength_session_controller.getDescription);
router.post('/strength-sess-info', strength_session_controller.getStrengthSessionViews);
router.post('/save-strength-sess-info', strength_session_controller.saveStrengthSessionInfo);
router.post('/strength-sess-info-athlete', strength_session_controller.getStrengthSessionViewsAthlete);
router.post('/save-strength-sess-info-athlete', strength_session_controller.saveStrengthSessionInfoAthlete);
//router.get('/phases', phases_controller.getPhases);


module.exports = router;