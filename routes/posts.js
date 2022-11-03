/**
 * =========================================
 * ROUTES OF POSTS (USING EXPRESS.ROUTER)
 * =========================================
 * @date created: 25 August 2019
 * @authors: Waqas Rehmani, Hasitha Dias and Jay Parikh
 *
 * The routes/posts.js is used for defining the routes of each API call in post_controller made from the frontend
 */

var express = require('express');
var router = express.Router();

var post_controller = require('../controllers/post_controller.js');

// multer middleware
const multer = require('multer');
let videoFileName;

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

let postMediaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/posts');
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
let uploadMediaToPosts = multer({ storage: postMediaStorage });

// CRUD Routes for Posts
router.post('/', post_controller.newCreatePost);
router.post(
    '/uploadMediaToTemp',
    uploadToTemp.single('mediaToTempUpload'),
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
    '/uploadMediaToPosts',
    uploadMediaToPosts.single('mediaToPostsUpload'),
    async (req, res) => {
        try {
            const file = req.file;

            res.send(file);
        } catch (err) {
            res.status(400).json('Please upload a file');
        }
    }
);
router.post('/list', post_controller.getPostListByObjId);

router.get('/', post_controller.getAllPosts);
router.get('/questions', post_controller.getAllQuestionPosts);
router.get('/trending', post_controller.getTrendingPosts);
router.get('/:postId', post_controller.getPost);
router.get('/user/:userId', post_controller.getPostByUser);
router.get('/:eventId/events', post_controller.getAllEventsPosts);
router.get('/group/:groupId', post_controller.getPostByGroup);
router.get('/team/:teamId', post_controller.getPostByTeam);
router.get(
    '/team/:teamId/:category/:range',
    post_controller.getPostsByTypeAndDate
);
router.get(
    '/team/pending/:teamId/:range',
    post_controller.getPendingPostsByDateRange
);
router.get('/team/pending/:teamId', post_controller.getPendingPostByTeam);
router.get('/feed/:userId', post_controller.getInitialFeedPosts);
router.get('/questions/:userId', post_controller.getInitialSubQuestions);
router.get(
    '/questions/trending/:userId',
    post_controller.getInitialTrendingQuestions
);
router.get('/profile/:userId', post_controller.getInitialCurrUserPosts);
router.get(
    '/questions/own/:userId',
    post_controller.getInitialCurrUserQuestions
);
router.get(
    '/questions/subscribed/:userId',
    post_controller.getSubscribedQuestions
);
router.get('/saved/:userId', post_controller.getInitialSavedPosts);

router.put('/updatePostsStatus', post_controller.updatePostsStatus);
router.put('/:postId', post_controller.editPost);
router.put('/:postId/createComment', post_controller.createComment);
router.put('/:postId/updateComment', post_controller.updateComment);
router.put('/:postId/updatePostStatus', post_controller.updatePostStatus);
router.put('/:postId/kudos', post_controller.changeReaction);
router.put('/:commentId/acceptTopAnswer', post_controller.acceptTopAnswer);

router.delete('/:postId', post_controller.deletePost);
router.delete('/group/:groupId', post_controller.deletePostsByGroup);
router.delete('/events/:eventId', post_controller.deletePostsByEvent);

module.exports = router;
