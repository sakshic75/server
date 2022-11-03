var express = require('express');
var router = express.Router();

var program_controller = require('../controllers/program_controller.js');

// CRUD Routes for Phases


router.post('/program-save', program_controller.createProgram);
router.post('/check-title', program_controller.checkProgramTitle);
router.get('/phases', program_controller.getPhases);
router.post('/getprogram', program_controller.getProgramById);
router.post('/update-program', program_controller.updateProgramById);
router.post('/search-program', program_controller.searchProgram);
router.post('/program-sessions', program_controller.getProgramSessions);
router.get('/programs', program_controller.getAllPrograms);
router.post('/update-programsessions', program_controller.updateProgramSession);
router.post('/session-time', program_controller.getSession);


module.exports = router;