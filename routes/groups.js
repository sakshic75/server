/**
 * =========================================
 * ROUTES OF GROUPS (USING EXPRESS.ROUTER)
 * =========================================
 * @date created: 24 August 2019
 * @authors: Hasitha Dias
 *
 * The routes/groups.js is used for defining the routes of each API call in group_controller made from the frontend
 */

var express = require('express');
var router = express.Router();

var group_controller = require('../controllers/group_controller.js');

// multer middleware
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});
var upload = multer({ storage });

// CRUD Routes for Posts
router.post('/', group_controller.createGroup);
router.post('/getPlanner/:userId/:clubSlug', group_controller.getPlanner);
router.post('/getUserGroups', group_controller.getUserGroups);
router.post('/getGroups', group_controller.getGroups);
router.post('/getAdminBySlug', group_controller.getAdminGroup);
router.post('/getMembers', group_controller.getGroupMembers);
router.post('/add', group_controller.add);
router.post('/addMember', group_controller.addMember);
router.post('/memberRemoveGroup', group_controller.memberRemoveGroup);
router.post('/memberRemoveRequest', group_controller.memberRemoveRequest);
router.post('/updateStatus', group_controller.updateStatus);
router.post('/updateLogoCoverPhoto', group_controller.updateLogoCoverPhoto);
router.post('/updateDescription', group_controller.updateDescription);
router.post('/acceptMember', group_controller.acceptMember);
router.post('/rejectMember', group_controller.rejectMember);
router.post('/removeMember', group_controller.removeMember);
router.post('/uploadFile', upload.single('groupUpload'), async (req, res) => {
    try {
        const file = req.file;

        res.send(file);
    } catch (err) {
        res.status(400).json('Please upload a file');
    }
});
router.post(
    '/uploadEventFile',
    upload.single('eventUpload'),
    async (req, res) => {
        try {
            const file = req.file;

            res.send(file);
        } catch (err) {
            res.status(400).json('Please upload a file');
        }
    }
);
router.post('/addEvent', group_controller.addEvent);
router.post('/removeEvent', group_controller.removeEvent);
router.post('/getEvents', group_controller.getEvents);

router.get('/', group_controller.getAllGroups);
router.get('/:groupId', group_controller.getGroup);
router.get('/slug/:groupSlug', group_controller.getGroupBySlug);

router.put('/:groupId', group_controller.editGroup);
router.put('/:groupId/coverPhoto', group_controller.changeCoverPhoto);

router.delete('/:groupId', group_controller.deleteGroup);

module.exports = router;
