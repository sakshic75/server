var express = require('express');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/exercise')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})
var upload = multer({ storage: storage })
   
var router = express.Router();
var exercise_controller = require('../controllers/exercise_controller.js');

// CRUD Routes for Exercise


router.post('/exercise-save', exercise_controller.createExercise);
router.post('/validate-title', exercise_controller.ValidateTitle);
router.post('/ex-image-upload',upload.single('eximg1'), exercise_controller.exImageUpload);
router.post('/ex-image-upload-1',upload.single('eximg2'), exercise_controller.exImageUpload);
router.post('/ex-image-upload-2',upload.single('eximg3'), exercise_controller.exImageUpload);
router.post('/search-exercise', exercise_controller.searchexercises);
router.post('/exercisebyid', exercise_controller.getExerciseById);
router.post('/update-exercise', exercise_controller.updateExerciseById);
router.post('/like-familyname', exercise_controller.linkFamilyName);//link zy

module.exports = router;