/**
 * =========================================
 * ROUTES OF USERS (USING EXPRESS.ROUTER)
 * =========================================
 * @date created: 25 August 2019
 * @authors: Waqas Rehmani and Uvin Abeysinghe
 *
 * The routes/users.js is used for defining the routes of each API call in user_controller made from the frontend
 */

var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/user_controller.js');

// multer middleware
const multer = require('multer');

let tempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            req.body.mediaDateNow
                ? req.body.mediaDateNow + file.originalname
                : Date.now() + file.originalname
        );
    },
});

let userProfilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/user');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            req.body.mediaDateNow
                ? req.body.mediaDateNow + file.originalname
                : Date.now() + file.originalname
        );
    },
});

let uploadToTemp = multer({ storage: tempStorage });
let uploadToUser = multer({ storage: userProfilePicStorage });

// CRUD Routes for Users
router.post('/', user_controller.createUser);
router.post(
    '/uploadFile',
    uploadToTemp.single('profileUpload'),
    async (req, res) => {
        try {
            const file = req.file;

            res.send(file);
        } catch (err) {
            res.status(400).json('Please upload a file');
        }
    }
);
router.post(
    '/updateProfilePicture',
    uploadToUser.single('profileUpdate'),
    async (req, res) => {
        try {
            const file = req.file;

            res.send(file);
        } catch (err) {
            res.status(400).json('Please upload a file');
        }
    }
);
router.post('/socialLogin' , user_controller.socialLogin);
router.post('/:userId', user_controller.login);
router.post(
    '/:userId/unfollow/:unfollowUserId',
    user_controller.updateUnfollowAct
);
router.post('/:userId/follow/:followUserId', user_controller.updateFollowAct);
router.post('/saved/:userId/save/:postId', user_controller.savePostToSavedList);
router.post(
    '/saved/:userId/unsave/:postId',
    user_controller.unsavePostSavedList
);

router.put('/', user_controller.editUser);
router.put('/:userId', user_controller.editUser);
router.put('/:userId/profilePicture', user_controller.changeProfilePicture);
router.put('/:userId/updateCertificate', user_controller.updateCertificate);

router.get('/:userId', verifyToken, user_controller.getUser);
router.get('/follower/:userId', user_controller.getFollowerData);
router.get('/basic/:userId', user_controller.getUserBasicData);
router.get('/followers/:userId', user_controller.getAllFollowersData);
router.get('/following/:userId', user_controller.getAllFollowingUserData);
router.get('/checkId/:userId', user_controller.userIdExists);

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

module.exports = router;
