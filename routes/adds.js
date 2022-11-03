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
var adds_controller = require('../controllers/adds_controller.js');

router.post('/session-add', adds_controller.addSeesion);

module.exports = router;