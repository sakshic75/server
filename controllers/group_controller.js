/**
 * =====================================
 * DEFINING GROUP API CALLS CONTROLLER
 * =====================================
 * @date created: 27 August 2019
 * @authors: Hasitha Dias and Waqas Rehmani
 *
 * The group_controller is used for defining the functionality of api calls related to groups
 *
 */

const mongoose = require('mongoose');

const Group = mongoose.model('groups');
const User = mongoose.model('users');
const TeamEvents = mongoose.model('team_events');
const Planner = mongoose.model('Planners');
const Program = mongoose.model('Programs');
const Trending = require('../models/trending');

const path = require('path');
var formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const googleConfig = require(path.join(__dirname, '..', 'config/keys')).google;
const pointsConfig = require(path.join(__dirname, '..', 'config/points'));
const mime = require('mime-types');

const storage = new Storage({
    projectId: googleConfig.projectId,
    keyFilename: './config/Coaching Mate Social Website-49227c7ec05e.json',
});

// Function for creating a new group
var createGroup = function (req, res) {
    var newGroup = new Group({
        groupId: req.body.groupId,
        groupName: req.body.groupName,
        slug: req.body.slug,
        creator: req.body.creator,
        members: req.body.members,
        description: req.body.description,
        interest: req.body.interest,
        coverPhoto: '',
        coverPhotoFileName: '',
    });

    newGroup.save(function (err, createdGroup) {
        if (!err) {
            res.send(createdGroup);
        } else {
            console.log(err);
            res.send(err);
        }
    });
};

// Function to get all the groups present in the DB
var getAllGroups = function (req, res) {
    Group.find(function (err, allGroups) {
        if (!err) {
            res.send(allGroups);
        } else {
            res.send(err);
        }
    });
};

// Function to get a group by groupId
var getGroup = function (req, res) {
    let groupId = req.params.groupId;

    Group.findOne({ groupId }, function (err, group) {
        if (!err) {
            res.send(group);
        } else {
            res.send(err);
        }
    });
};

// Function to get a group by groupSlug
var getGroupBySlug = function (req, res) {
    let slug = req.params.groupSlug;

    Group.findOne({ slug }, function (err, group) {
        if (!err) {
            if (group === null) res.send({ group });
            else res.send(group);
        } else {
            res.send(err);
        }
    });
};

let getAdminGroup = async (req, res) => {
    let group = await Group.findOne({ slug: req.body.groupSlug });

    res.json({ success: true, group });
};

let getGroupMembers = async (req, res) => {
    let members = await User.find(
        { groups: { $all: req.body.groupId }, status: 'active' },
        'firstName lastName profilePicture'
    );
    let memberRequests = await User.find(
        { groupRequests: { $all: req.body.groupId }, status: 'active' },
        'firstName lastName profilePicture'
    );

    res.json({ success: true, members, memberRequests });
};

let getEvents = async (req, res) => {
    let events = await TeamEvents.find(
        { moduleType: 'group', moduleId: req.body.groupId, status: 'active' },
        'title slug start end logo'
    );

    res.json({ success: true, events });
};

let acceptMember = async (req, res) => {
    User.findById(req.body.userId)
        .then((user) => {
            for (let i = 0; i < user.groupRequests.length; i++) {
                if (user.groupRequests[i] == req.body.groupId) {
                    user.groupRequests.splice(i, 1);
                }
            }
            user.groups.push(req.body.groupId);

            user.save()
                .then(async () => {
                    await Group.updateOne(
                        { _id: req.body.groupId },
                        { $inc: { membersCount: 1, memberRequestsCount: -1 } }
                    );

                    // add 5 trending score for the group
                    await updateTrendingScore(
                        req.body.groupId,
                        'group',
                        pointsConfig.newMember
                    );

                    // add 5 trending score for the user
                    await updateTrendingScore(
                        req.body.userId,
                        'user',
                        pointsConfig.joinTeamOrGroup
                    );

                    let members = await User.find(
                        {
                            groups: { $all: req.body.groupId },
                            status: 'active',
                        },
                        'firstName lastName profilePicture'
                    );
                    let memberRequests = await User.find(
                        {
                            groupRequests: { $all: req.body.groupId },
                            status: 'active',
                        },
                        'firstName lastName profilePicture'
                    );

                    res.json({
                        success: true,
                        msg: 'Member accepted!',
                        members,
                        memberRequests,
                    });
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let rejectMember = async (req, res) => {
    User.findById(req.body.userId)
        .then((user) => {
            for (let i = 0; i < user.groupRequests.length; i++) {
                if (user.groupRequests[i] == req.body.groupId) {
                    user.groupRequests.splice(i, 1);
                }
            }

            user.save()
                .then(async () => {
                    await Group.updateOne(
                        { _id: req.body.groupId },
                        { $inc: { memberRequestsCount: -1 } }
                    );
                    let memberRequests = await User.find(
                        {
                            groupRequests: { $all: req.body.groupId },
                            status: 'active',
                        },
                        'firstName lastName profilePicture'
                    );

                    res.json({
                        success: true,
                        msg: 'Member rejected!',
                        memberRequests,
                    });
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let removeMember = async (req, res) => {
    User.findById(req.body.userId)
        .then((user) => {
            for (let i = 0; i < user.groups.length; i++) {
                if (user.groups[i] == req.body.groupId) {
                    user.groups.splice(i, 1);
                }
            }

            user.save()
                .then(async () => {
                    await Group.updateOne(
                        { _id: req.body.groupId },
                        { $inc: { membersCount: -1 } }
                    );
                    let members = await User.find(
                        {
                            groups: { $all: req.body.groupId },
                            status: 'active',
                        },
                        'firstName lastName profilePicture'
                    );

                    res.json({
                        success: true,
                        msg: 'Member removed!',
                        members,
                    });
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

// Function to change the cover picture of a group by groupId
var changeCoverPhoto = function (req, res) {
    let groupId = req.params.groupId;

    var form = new formidable.IncomingForm();
    const bucket = storage.bucket(googleConfig.groupBucket);

    form.parse(req, function (err, fields, files) {
        let filetoupload = files.file;

        Group.findOne({ groupId }, (err, group) => {
            if (!err) {
                if (filetoupload) {
                    let type = mime.lookup(filetoupload.name);
                    let newName = groupId + '.' + mime.extensions[type][0];
                    if (group.coverPhotoFileName !== '') {
                        bucket
                            .file(group.coverPhotoFileName)
                            .delete()
                            .then(() => {
                                bucket.upload(
                                    filetoupload.path,
                                    {
                                        gzip: true,
                                        destination: newName,
                                        predefinedAcl: 'publicRead',
                                        metadata: {
                                            contentType: type,
                                        },
                                    },
                                    () => {
                                        bucket
                                            .file(newName)
                                            .getMetadata()
                                            .then((data) => {
                                                Group.findOneAndUpdate(
                                                    { groupId },
                                                    {
                                                        coverPhoto:
                                                            data[0].mediaLink,
                                                        coverPhotoFileName:
                                                            newName,
                                                    },
                                                    function (
                                                        err,
                                                        updatedGroup
                                                    ) {
                                                        if (!err) {
                                                            res.send(
                                                                updatedGroup
                                                            );
                                                        } else {
                                                            console.log(err);
                                                            res.send(err);
                                                        }
                                                    }
                                                );
                                            });
                                    }
                                );
                            });
                    } else {
                        bucket.upload(
                            filetoupload.path,
                            {
                                gzip: true,
                                destination: newName,
                                predefinedAcl: 'publicRead',
                                metadata: {
                                    contentType: type,
                                },
                            },
                            () => {
                                bucket
                                    .file(newName)
                                    .getMetadata()
                                    .then((data) => {
                                        Group.findOneAndUpdate(
                                            { groupId },
                                            {
                                                coverPhoto: data[0].mediaLink,
                                                coverPhotoFileName: newName,
                                            },
                                            function (err, updatedGroup) {
                                                if (!err) {
                                                    res.send(updatedGroup);
                                                } else {
                                                    console.log(err);
                                                    res.send(err);
                                                }
                                            }
                                        );
                                    });
                            }
                        );
                    }
                } else {
                    if (group.coverPhotoFileName !== '') {
                        bucket
                            .file(group.coverPhotoFileName)
                            .delete()
                            .then(() => {
                                Group.findOneAndUpdate(
                                    { groupId },
                                    { coverPhoto: '', coverPhotoFileName: '' },
                                    function (err, updatedGroup) {
                                        if (!err) {
                                            res.send(updatedGroup);
                                        } else {
                                            console.log(err);
                                            res.send(err);
                                        }
                                    }
                                );
                            });
                    } else {
                        res.send(false);
                    }
                }
            } else {
                res.send(err);
            }
        });
    });
};

// Function to edit group
var editGroup = async (req, res) => {
    await Group.findOne({ groupId: req.params.groupId })
        .then((group) => {
            group.title = req.body.title;
            group.slug = req.body.slug;
            group.description = req.body.description;
            group.logo = req.body.logo;
            group.coverPhoto = req.body.coverPhoto;
            group.interest = req.body.interest;
            group.type = req.body.type;
            group.status = req.body.status;

            group
                .save()
                .then(() => res.json(group))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

// Function to delete a post with id passed in the params
var deleteGroup = function (req, res) {
    let groupId = req.params.groupId;

    Group.findOneAndDelete({ groupId }, function (err, deletedPost) {
        if (!err) {
            res.send(deletedPost);
        } else {
            res.send(err);
        }
    });
};

let getPlanner = async function (req, res) {
    let layerNo = req.body.layerNo;
    let planner = null,
        user = null,
        program = null,
        sessions = [];
    const club = await Group.findOne({
        slug: req.params.clubSlug,
        members: req.params.userId,
    });
    if (club !== null) {
        user = await User.findOne(
            { userId: req.params.userId, role: 'Athlete', status: 'active' },
            'userId firstName lastName profilePicture profilePictureFileName planners'
        );
        if (user !== null) {
            let getPlannerData = async (plannerId, clubId) => {
                planner = await Planner.findOne({ _id: plannerId, clubId });
                return planner;
            };
            let getSessionsData = async (programId, clubId) => {
                program = await Program.findOne({ _id: programId, clubId });
                return program;
            };
            for (let i = 0; i < user.planners.length; i++) {
                if (
                    user.planners[i].clubId.toString() === club._id.toString()
                ) {
                    planner = await getPlannerData(
                        user.planners[i].plannerId,
                        club._id
                    );
                    if (layerNo != '') {
                        for (let j = 0; j < planner.programs.length; j++) {
                            if (planner.programs[j].layer == layerNo) {
                                program = await getSessionsData(
                                    planner.programs[j].programId,
                                    club._id
                                );
                                sessions.push({
                                    programSessions: program.sessions,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    res.json({ club, planner, sessions });
};

let getUserGroups = async function (req, res) {
    let user = await User.findById(req.body.userId);
    let myGroups = await Group.find({ creatorId: req.body.userId });
    let joinedGroups = await Group.find({ _id: { $in: user.groups } });

    res.json({ success: true, myGroups, joinedGroups });
};

let getGroups = async function (req, res) {
    let user = await User.findById(req.body.userId);
    let groups = await Group.find({ creatorId: { $ne: req.body.userId } });

    res.json({
        success: true,
        groups,
        userGroups: user.groups,
        userGroupRequests: user.groupRequests,
    });
};

let add = async function (req, res) {
    const oldGroup = await Group.find({ title: req.body.title });
    if (oldGroup.length > 0) {
        res.json({
            success: false,
            msg: 'Error: Group with this title already exists',
        });
    } else {
        let newGroup = new Group({
            creatorId: req.body.creatorId,
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            address: req.body.address,
            addressCity: req.body.addressCity,
            addressCountry: req.body.addressCountry,
            logo: req.body.logo,
            coverPhoto: req.body.coverPhoto,
            interest: req.body.interest,
            type: 'open',
            status: 'active',
            membersCount: 0,
        });

        newGroup
            .save()
            .then(async (resp) => {
                const fs = require('fs');
                const os = require('os');
                let oldPath = (newPath = ''),
                    delim = '/';
                if (os.type() == 'Windows_NT') delim = '\\';

                oldPath = 'uploads' + delim + 'temp' + delim + req.body.logo;
                newPath = 'uploads' + delim + 'group' + delim + req.body.logo;
                fs.rename(oldPath, newPath, function (err) {
                    /*if(err)
						console.log(err);
					else
						console.log('Successfully moved!');*/
                });

                oldPath =
                    'uploads' + delim + 'temp' + delim + req.body.coverPhoto;
                newPath =
                    'uploads' + delim + 'group' + delim + req.body.coverPhoto;
                fs.rename(oldPath, newPath, function (err) {});

                let myGroups = await Group.find({
                    creatorId: req.body.creatorId,
                });

                res.json({ success: true, myGroups, msg: 'Group added!' });
            })
            .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
    }
};

let addMember = async function (req, res) {
    let screen = req.body.screen;
    User.findById(req.body.userId)
        .then((user) => {
            let msg = '';
            if (req.body.groupType === 'public') {
                msg = 'Group joined!';
                user.groups.push(req.body.groupId);
            } else if (req.body.groupType === 'open') {
                msg = 'Group join request sent!';
                user.groupRequests.push(req.body.groupId);
            }

            user.save()
                .then(async () => {
                    if (req.body.groupType === 'public') {
                        await Group.updateOne(
                            { _id: req.body.groupId },
                            { $inc: { membersCount: 1 } }
                        );

                        await updateTrendingScore(
                            req.body.groupId,
                            'group',
                            pointsConfig.newMember
                        );
                        await updateTrendingScore(
                            req.body.userId,
                            'user',
                            pointsConfig.joinTeamOrGroup
                        );
                    } else if (req.body.groupType === 'open') {
                        await Group.updateOne(
                            { _id: req.body.groupId },
                            { $inc: { memberRequestsCount: 1 } }
                        );
                    }
                    if(screen == 'groups'){
                        let groups = await Group.find({
                            creatorId: { $ne: req.body.userId },
                        });
                        let joinedGroups = await Group.find({
                            _id: { $in: user.groups },
                        });

                        res.json({
                            success: true,
                            msg,
                            groups,
                            joinedGroups,
                            userGroups: user.groups,
                            userGroupRequests: user.groupRequests
                        });
                    }
                    else if(screen == 'group'){
                        res.json({
                            success: true,
                            msg
                        });
                    }
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let memberRemoveGroup = async function (req, res) {
    let screen = req.body.screen;
    User.findById(req.body.userId)
        .then((user) => {
            let msg = '';

            for (let i = 0; i < user.groups.length; i++) {
                if (user.groups[i] == req.body.groupId) {
                    user.groups.splice(i, 1);
                }
            }
            msg = 'Group left!';

            user.save()
                .then(async () => {
                    await Group.updateOne(
                        { _id: req.body.groupId },
                        { $inc: { membersCount: -1 } }
                    );
                    if(screen == 'groups'){
                        let groups = await Group.find({
                            creatorId: { $ne: req.body.userId },
                        });
                        let joinedGroups = await Group.find({
                            _id: { $in: user.groups },
                        });

                        res.json({
                            success: true,
                            msg,
                            groups,
                            joinedGroups,
                            userGroups: user.groups,
                            userGroupRequests: user.groupRequests,
                        });
                    }
                    else if(screen == 'group'){
                        res.json({
                            success: true,
                            msg
                        });
                    }
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let memberRemoveRequest = async function (req, res) {
    let screen = req.body.screen;
    User.findById(req.body.userId)
        .then((user) => {
            let msg = '';

            for (let i = 0; i < user.groupRequests.length; i++) {
                if (user.groupRequests[i] == req.body.groupId) {
                    user.groupRequests.splice(i, 1);
                }
            }
            msg = 'Group request removed!';

            user.save()
                .then(async () => {
                    await Group.updateOne(
                        { _id: req.body.groupId },
                        { $inc: { memberRequestsCount: -1 } }
                    );
                    if(screen == 'groups'){
                        let groups = await Group.find({
                            creatorId: { $ne: req.body.userId },
                        });
                        let joinedGroups = await Group.find({
                            _id: { $in: user.groups },
                        });

                        res.json({
                            success: true,
                            msg,
                            groups,
                            joinedGroups,
                            userGroups: user.groups,
                            userGroupRequests: user.groupRequests,
                        });
                    }
                    else if(screen == 'group'){
                        res.json({
                            success: true,
                            msg
                        });
                    }
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let addEvent = async (req, res) => {
    const oldGroupEvent = await TeamEvents.find({ title: req.body.title });
    if (oldGroupEvent.length > 0) {
        res.json({
            success: false,
            msg: 'Error: Event with this title already exists',
        });
    } else {
        let newGroupEvent = new TeamEvents({
            creatorId: req.body.creatorId,
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            start: req.body.startDate + ' ' + req.body.startTime + ':00',
            end: req.body.endDate + ' ' + req.body.endTime + ':00',
            logo: req.body.logo,
            moduleType: 'group',
            moduleId: req.body.groupId,
            location: req.body.location,
            interest: req.body.interest,
            status: 'active',
            attending: [],
            interested: [],
        });

        newGroupEvent
            .save()
            .then(async () => {
                const fs = require('fs');
                const os = require('os');
                let oldPath = (newPath = ''),
                    delim = '/';
                if (os.type() == 'Windows_NT') delim = '\\';

                oldPath = 'uploads' + delim + 'temp' + delim + req.body.logo;
                newPath = 'uploads' + delim + 'event' + delim + req.body.logo;
                fs.rename(oldPath, newPath, function () {});

                // 5 trending points for adding new event (group)
                await updateTrendingScore(
                    req.body.groupId,
                    'group',
                    pointsConfig.addEvent
                );

                res.json({ success: true, msg: 'Event added!' });
            })
            .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
    }
};

let removeEvent = async (req, res) => {
    TeamEvents.findById(req.body.eventId)
        .then((event) => {
            event.status = req.body.status;

            event
                .save()
                .then(async () => {
                    let events = await TeamEvents.find(
                        {
                            moduleType: 'group',
                            moduleId: req.body.groupId,
                            status: 'active',
                        },
                        'title slug start end logo'
                    );

                    res.json({ success: true, msg: 'Event removed!', events });
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let updateStatus = (req, res) => {
    Group.findById(req.body.id)
        .then((group) => {
            group.status = req.body.status;

            group
                .save()
                .then(() =>
                    res.json({ success: true, msg: 'Group status changed!' })
                )
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let updateLogoCoverPhoto = (req, res) => {
    let logo = req.body.logo;
    let coverPhoto = req.body.coverPhoto;

    Group.findById(req.body.id)
        .then((group) => {
            if (logo) group.logo = req.body.logo;
            if (coverPhoto) group.coverPhoto = req.body.coverPhoto;

            group
                .save()
                .then(() => {
                    const fs = require('fs');
                    const os = require('os');
                    let oldPath = (newPath = ''),
                        delim = '/';
                    if (os.type() == 'Windows_NT') delim = '\\';

                    if (logo) {
                        oldPath =
                            'uploads' + delim + 'temp' + delim + req.body.logo;
                        newPath =
                            'uploads' + delim + 'group' + delim + req.body.logo;
                        fs.rename(oldPath, newPath, function (err) {});
                    }

                    if (coverPhoto) {
                        oldPath =
                            'uploads' +
                            delim +
                            'temp' +
                            delim +
                            req.body.coverPhoto;
                        newPath =
                            'uploads' +
                            delim +
                            'group' +
                            delim +
                            req.body.coverPhoto;
                        fs.rename(oldPath, newPath, function (err) {});
                    }

                    res.json({
                        success: true,
                        msg: 'Logo and Cover Photo updated!',
                    });
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let updateDescription = (req, res) => {
    Group.findById(req.body.id)
        .then((group) => {
            group.description = req.body.description;

            group
                .save()
                .then(() =>
                    res.json({ success: true, msg: 'Description updated!' })
                )
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

let updateTrendingScore = async (itemId, type, point) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        const currDateTrending = await Trending.findOne({
            date,
            type,
            itemId,
        });

        if (currDateTrending) {
            currDateTrending.point += point;
            console.log('currdatetrending after = ' + currDateTrending);

            await currDateTrending.save();
        } else {
            const newTrending = new Trending({
                date,
                type,
                itemId,
                point,
            });

            console.log('newTrending = ' + newTrending);

            await newTrending.save();
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports.createGroup = createGroup;
module.exports.getAllGroups = getAllGroups;
module.exports.getGroup = getGroup;
module.exports.getGroupBySlug = getGroupBySlug;
module.exports.getAdminGroup = getAdminGroup;
module.exports.getGroupMembers = getGroupMembers;
module.exports.getEvents = getEvents;
module.exports.acceptMember = acceptMember;
module.exports.rejectMember = rejectMember;
module.exports.removeMember = removeMember;
module.exports.editGroup = editGroup;
module.exports.changeCoverPhoto = changeCoverPhoto;
module.exports.deleteGroup = deleteGroup;
module.exports.getPlanner = getPlanner;
module.exports.getUserGroups = getUserGroups;
module.exports.getGroups = getGroups;
module.exports.add = add;
module.exports.addMember = addMember;
module.exports.memberRemoveGroup = memberRemoveGroup;
module.exports.memberRemoveRequest = memberRemoveRequest;
module.exports.addEvent = addEvent;
module.exports.removeEvent = removeEvent;
module.exports.updateStatus = updateStatus;
module.exports.updateLogoCoverPhoto = updateLogoCoverPhoto;
module.exports.updateDescription = updateDescription;
