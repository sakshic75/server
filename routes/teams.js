const router = require('express').Router();
const mongoose = require('mongoose');
const Teams = mongoose.model('Teams');
const User = mongoose.model('users');
const TeamEvents = mongoose.model('team_events');
const Planner = mongoose.model('Planners');
const Program = mongoose.model('Programs');
const Memberships = mongoose.model('Memberships');
const Trending = require('../models/trending');

const path = require('path');
const pointsConfig = require(path.join(__dirname, '..', 'config/points'));

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});
var upload = multer({ storage: storage });

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

router.route('/').get(async (req, res) => {
    let teams = await Teams.find({});

    res.json({ success: true, teams });
});

router.route('/getAdminBySlug').post(async (req, res) => {
    let team = await Teams.findOne({ slug: req.body.teamSlug });

    res.json({ success: true, team });
});

router.route('/getTeamMemberships').post(async (req, res) => {
    let teamId = req.body.teamId;
    let memberships = await Memberships.findOne({
        slug: req.body.teamSlug,
        clubId: teamId,
    });

    res.json({ success: true, memberships });
});

router.route('/getBySlug').post(async (req, res) => {
    let team = await Teams.findOne({ slug: req.body.teamSlug });

    res.json({ success: true, team });
});

router.route('/getMembers').post(async (req, res) => {
    let members = await User.find(
        { teams: { $all: req.body.teamId }, status: 'active' },
        'firstName lastName profilePicture'
    );
    let memberRequests = await User.find(
        { teamRequests: { $all: req.body.teamId }, status: 'active' },
        'firstName lastName profilePicture'
    );

    res.json({ success: true, members, memberRequests });
});

router.route('/getCoaches').post(async (req, res) => {
    let team_coaches = await Teams.findOne({ _id: req.body.teamId }, 'coaches');
    let coaches = await User.find(
        { _id: { $in: team_coaches.coaches }, status: 'active' },
        'firstName lastName profilePicture'
    );

    res.json({ success: true, coaches });
});

router.route('/searchCoaches').post(async (req, res) => {
    let coachQuery = '(?i).*' + req.body.query + '.*';
    let coaches = await User.find(
        {
            role: 'Coach',
            status: 'active',
            $or: [
                { userId: { $regex: coachQuery } },
                { firstName: { $regex: coachQuery } },
                { lastName: { $regex: coachQuery } },
                { email: { $regex: coachQuery } },
            ],
        },
        'firstName lastName email',
        { limit: 10 }
    );

    res.json({ success: true, coaches });
});

router.route('/addCoach').post(async (req, res) => {
    Teams.findById(req.body.teamId)
        .then((team) => {
            let msg = '';

            team.coaches.push(req.body.coachId);
            msg = 'Coach added!';

            team.save()
                .then(async () => {
                    let coaches = await User.find(
                        { _id: { $in: team.coaches }, status: 'active' },
                        'firstName lastName profilePicture'
                    );

                    res.json({ success: true, msg, coaches });
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
});

router.route('/getEventBySlug').post(async (req, res) => {
    let event = await TeamEvents.findOne({
        slug: req.body.teamEventSlug,
    });

    const creator = await User.findById(
        event.creatorId,
        'userId firstName lastName profilePicture'
    );

    res.json({ success: true, event, creator });
});

router.route('/getEvents').post(async (req, res) => {
    let events = await TeamEvents.find(
        { moduleType: 'team', moduleId: req.body.teamId, status: 'active' },
        'title slug start end logo'
    );

    res.json({ success: true, events });
});

router.route('/getUserTeams').post(async (req, res) => {
    let user = await User.findById(req.body.userId);
    let myTeams = await Teams.find({ creatorId: req.body.userId });
    let joinedTeams = await Teams.find({ _id: { $in: user.teams } });

    res.json({ success: true, myTeams, joinedTeams });
});

router.route('/getTeams').post(async (req, res) => {
    let user = await User.findById(req.body.userId);
    let teams = await Teams.find({ creatorId: { $ne: req.body.userId } });

    res.json({
        success: true,
        teams,
        userTeams: user.teams,
        userTeamRequests: user.teamRequests,
    });
});

router
    .route('/uploadFile')
    .post(upload.single('teamUpload'), async (req, res) => {
        const file = req.file;
        if (!file) {
            const error = new Error('Please upload a file');
            error.httpStatusCode = 400;
            //return next(error);
        }
        res.send(file);
    });

router.route('/add').post(async (req, res) => {
    const oldTeam = await Teams.find({ title: req.body.title });
    if (oldTeam.length > 0) {
        res.json({
            success: false,
            msg: 'Error: Team with this title already exists',
        });
    } else {
        let newTeam = new Teams({
            creatorId: req.body.creatorId,
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            address: req.body.address,
            addressLat: req.body.lat,
            addressLng: req.body.lng,
            activityType: req.body.activityType,
            logo: req.body.logo,
            coverPhoto: req.body.coverPhoto,
            documents: req.body.documents,
            type: 'open',
            status: 'active',
            membersCount: 0,
        });

        newTeam
            .save()
            .then(async (resp) => {
                const fs = require('fs');
                const os = require('os');
                let oldPath = (newPath = ''),
                    delim = '/';
                if (os.type() == 'Windows_NT') delim = '\\';

                oldPath = 'uploads' + delim + 'temp' + delim + req.body.logo;
                newPath = 'uploads' + delim + 'team' + delim + req.body.logo;
                fs.rename(oldPath, newPath, function (err) {
                    /*if(err)
						console.log(err);
					else
						console.log('Successfully moved!');*/
                });

                oldPath =
                    'uploads' + delim + 'temp' + delim + req.body.coverPhoto;
                newPath =
                    'uploads' + delim + 'team' + delim + req.body.coverPhoto;
                fs.rename(oldPath, newPath, function (err) {});
                let documents = req.body.documents;
                for (let i = 0; i < documents.length; i++) {
                    oldPath = 'uploads' + delim + 'temp' + delim + documents[i];
                    newPath = 'uploads' + delim + 'team' + delim + documents[i];
                    fs.rename(oldPath, newPath, function (err) {});
                }

                let myTeams = await Teams.find({
                    creatorId: req.body.creatorId,
                });

                res.json({ success: true, myTeams, msg: 'Team added!' });
            })
            .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
    }
});

router.route('/addMember').post(async (req, res) => {
    let screen = req.body.screen;
    User.findById(req.body.userId)
        .then((user) => {
            let msg = '';
            if (req.body.teamType == 'public') {
                msg = 'Team joined!';
                user.teams.push(req.body.teamId);
            } else if (req.body.teamType == 'open') {
                msg = 'Team join request sent!';
                user.teamRequests.push(req.body.teamId);
            }

            user.save()
                .then(async () => {
                    if (req.body.teamType == 'public') {
                        await Teams.updateOne(
                            { _id: req.body.teamId },
                            { $inc: { membersCount: 1 } }
                        );

                        // 5 trending points for team (new member added)
                        await updateTrendingScore(
                            req.body.teamId,
                            'team',
                            pointsConfig.newMember
                        );

                        // 5 trending points for user (joined a team)
                        await updateTrendingScore(
                            req.body.userId,
                            'user',
                            pointsConfig.joinTeamOrGroup
                        );
                    } else if (req.body.teamType == 'open') {
                        await Teams.updateOne(
                            { _id: req.body.teamId },
                            { $inc: { memberRequestsCount: 1 } }
                        );
                    }

                    if(screen == 'teams'){
                        let teams = await Teams.find({
                            creatorId: { $ne: req.body.userId },
                        });
                        let joinedTeams = await Teams.find({
                            _id: { $in: user.teams },
                        });

                        res.json({
                            success: true,
                            msg,
                            teams,
                            joinedTeams,
                            userTeams: user.teams,
                            userTeamRequests: user.teamRequests,
                        });
                    }
                    else if(screen == 'team'){
                        res.json({success: true, msg});
                    }
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
});

router.route('/memberRemoveTeam').post(async (req, res) => {
    let screen = req.body.screen;
    User.findById(req.body.userId)
        .then((user) => {
            let msg = '';

            for (let i = 0; i < user.teams.length; i++) {
                if (user.teams[i] == req.body.teamId) {
                    user.teams.splice(i, 1);
                }
            }
            msg = 'Team left!';

            user.save()
                .then(async () => {
                    await Teams.updateOne(
                        { _id: req.body.teamId },
                        { $inc: { membersCount: -1 } }
                    );
                    if(screen == 'teams'){
                        let teams = await Teams.find({
                            creatorId: { $ne: req.body.userId },
                        });
                        let joinedTeams = await Teams.find({
                            _id: { $in: user.teams },
                        });

                        res.json({
                            success: true,
                            msg,
                            teams,
                            joinedTeams,
                            userTeams: user.teams,
                            userTeamRequests: user.teamRequests,
                        });
                    }
                    else if(screen == 'team'){
                        res.json({success: true, msg});
                    }
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
});

router.route('/removeRequest').post(async (req, res) => {
    let screen = req.body.screen;
    User.findById(req.body.userId)
        .then((user) => {
            let msg = '';

            for (let i = 0; i < user.teamRequests.length; i++) {
                if (user.teamRequests[i] == req.body.teamId) {
                    user.teamRequests.splice(i, 1);
                }
            }
            msg = 'Team request removed!';

            user.save()
                .then(async () => {
                    await Teams.updateOne(
                        { _id: req.body.teamId },
                        { $inc: { memberRequestsCount: -1 } }
                    );
                    if(screen == 'teams'){
                        let teams = await Teams.find({
                            creatorId: { $ne: req.body.userId },
                        });
                        let joinedTeams = await Teams.find({
                            _id: { $in: user.teams },
                        });

                        res.json({
                            success: true,
                            msg,
                            teams,
                            joinedTeams,
                            userTeams: user.teams,
                            userTeamRequests: user.teamRequests,
                        });
                    }
                    else if(screen == 'team'){
                        res.json({success: true, msg});
                    }
                })
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
});

router.route('/updateLogoCoverPhoto').post((req, res) => {
    let logo = req.body.logo;
    let coverPhoto = req.body.coverPhoto;

    Teams.findById(req.body.id)
        .then((team) => {
            if (logo) team.logo = req.body.logo;
            if (coverPhoto) team.coverPhoto = req.body.coverPhoto;

            team.save()
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
                            'uploads' + delim + 'team' + delim + req.body.logo;
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
                            'team' +
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
});

router.route('/updateDescription').post((req, res) => {
    Teams.findById(req.body.id)
        .then((team) => {
            team.description = req.body.description;

            team.save()
                .then(() =>
                    res.json({ success: true, msg: 'Description updated!' })
                )
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
});

router.route('/updateStatus').post((req, res) => {
    Teams.findById(req.body.id)
        .then((team) => {
            team.status = req.body.status;

            team.save()
                .then(() =>
                    res.json({ success: true, msg: 'Team status changed!' })
                )
                .catch((err) =>
                    res.json({ success: false, msg: 'Error: ' + err })
                );
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
});

router
    .route('/uploadEventFile')
    .post(upload.single('eventUpload'), async (req, res) => {
        const file = req.file;
        if (!file) {
            const error = new Error('Please upload a file');
            error.httpStatusCode = 400;
            //return next(error);
        }
        res.send(file);
    });

router.route('/addEvent').post(async (req, res) => {
    const oldTeamEvent = await TeamEvents.find({ title: req.body.title });
    if (oldTeamEvent.length > 0) {
        res.json({
            success: false,
            msg: 'Error: Event with this title already exists',
        });
    } else {
        let newTeamEvent = new TeamEvents({
            creatorId: req.body.creatorId,
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            start: req.body.startDate + ' ' + req.body.startTime + ':00',
            end: req.body.endDate + ' ' + req.body.endTime + ':00',
            logo: req.body.logo,
            moduleType: 'team',
            moduleId: req.body.teamId,
            location: req.body.location,
            interest: req.body.interest,
            status: 'active',
            attending: [],
            interested: [],
        });

        newTeamEvent
            .save()
            .then(async (resp) => {
                const fs = require('fs');
                const os = require('os');
                let oldPath = (newPath = ''),
                    delim = '/';
                if (os.type() == 'Windows_NT') delim = '\\';

                oldPath = 'uploads' + delim + 'temp' + delim + req.body.logo;
                newPath = 'uploads' + delim + 'event' + delim + req.body.logo;
                fs.rename(oldPath, newPath, function (err) {});

                // 5 trending points for adding event
                await updateTrendingScore(
                    req.body.teamId,
                    'team',
                    pointsConfig.addEvent
                );

                res.json({ success: true, msg: 'Event added!' });
            })
            .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
    }
});

router.route('/acceptMember').post(async (req, res) => {
    User.findById(req.body.userId)
        .then((user) => {
            for (let i = 0; i < user.teamRequests.length; i++) {
                if (user.teamRequests[i] == req.body.teamId) {
                    user.teamRequests.splice(i, 1);
                }
            }
            user.teams.push(req.body.teamId);

            user.save()
                .then(async () => {
                    await Teams.updateOne(
                        { _id: req.body.teamId },
                        { $inc: { membersCount: 1, memberRequestsCount: -1 } }
                    );
                    let members = await User.find(
                        { teams: { $all: req.body.teamId }, status: 'active' },
                        'firstName lastName profilePicture'
                    );
                    let memberRequests = await User.find(
                        {
                            teamRequests: { $all: req.body.teamId },
                            status: 'active',
                        },
                        'firstName lastName profilePicture'
                    );

                    // 5 trending points for team (new member added)
                    await updateTrendingScore(
                        req.body.teamId,
                        'team',
                        pointsConfig.newMember
                    );

                    // 5 trending points for user (joined a team)
                    await updateTrendingScore(
                        req.body.userId,
                        'user',
                        pointsConfig.joinTeamOrGroup
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
});

router.route('/rejectMember').post(async (req, res) => {
    User.findById(req.body.userId)
        .then((user) => {
            for (let i = 0; i < user.teamRequests.length; i++) {
                if (user.teamRequests[i] == req.body.teamId) {
                    user.teamRequests.splice(i, 1);
                }
            }

            user.save()
                .then(async () => {
                    await Teams.updateOne(
                        { _id: req.body.teamId },
                        { $inc: { memberRequestsCount: -1 } }
                    );
                    let memberRequests = await User.find(
                        {
                            teamRequests: { $all: req.body.teamId },
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
});

router.route('/removeMember').post(async (req, res) => {
    User.findById(req.body.userId)
        .then((user) => {
            for (let i = 0; i < user.teams.length; i++) {
                if (user.teams[i] == req.body.teamId) {
                    user.teams.splice(i, 1);
                }
            }

            user.save()
                .then(async () => {
                    await Teams.updateOne(
                        { _id: req.body.teamId },
                        { $inc: { membersCount: -1 } }
                    );
                    let members = await User.find(
                        { teams: { $all: req.body.teamId }, status: 'active' },
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
});

router.route('/removeEvent').post(async (req, res) => {
    TeamEvents.findById(req.body.eventId)
        .then((event) => {
            event.status = req.body.status;

            event
                .save()
                .then(async () => {
                    let events = await TeamEvents.find(
                        {
                            moduleType: 'team',
                            moduleId: req.body.teamId,
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
});

router.route('/getPlanner/:userId/:clubSlug').post(async (req, res) => {
    let layerNo = req.body.layerNo;
    let planner = null,
        user = null,
        program = null,
        sessions = [];
    const club = await Teams.findOne({ slug: req.params.clubSlug });
    if (club !== null) {
        user = await User.findOne(
            {
                _id: req.params.userId,
                role: 'Athlete',
                status: 'active',
                teams: club._id,
            },
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
});

router.route('/edit/pageInfo/:teamSlug').post(async (req, res) => {
    try {
        const { information } = req.body;
        const team = await Teams.findOne({ slug: req.params.teamSlug });

        team.title = information.title;
        team.description = information.description;
        team.logo = information.logo;
        team.activityType = information.activityType;
        team.phone = information.phone;
        team.address = information.address;
        team.cityStateCountry = information.cityStateCountry;
        team.hideAddress = information.hideAddress;
        information.operatingTimings &&
            (team.operatingTimings = information.operatingTimings);
        information.operatingStartHours &&
            (team.operatingStartHours = information.operatingStartHours);
        information.operatingEndHours &&
            (team.operatingEndHours = information.operatingEndHours);

        await team.save().then(() => {
            if (team.logo) {
                const fs = require('fs');
                const os = require('os');
                let oldPath = (newPath = ''),
                    delim = '/';
                if (os.type() == 'Windows_NT') delim = '\\';

                oldPath = 'uploads' + delim + 'temp' + delim + team.logo;
                newPath = 'uploads' + delim + 'team' + delim + team.logo;
                fs.copyFile(oldPath, newPath, function () {});
            }
        });

        res.json({ team, success: true });
    } catch (err) {
        res.json({ success: false, msg: 'Error: ' + err });
    }
});

router.route('/postManagement/:teamSlug').post(async (req, res) => {
    try {
        const team = await Teams.findOne({ slug: req.params.teamSlug });

        team.postRestriction = req.body.postRestriction;
        team.postReqApproval = req.body.postReqApproval;
        await team.save();

        res.json({ team, success: true });
    } catch (err) {
        res.json({ success: false, msg: 'Error: ' + err });
    }
});

router.route('/updatePageMembersStatus/:teamSlug').post(async (req, res) => {
    try {
        const checkedUsersId = [...req.body.checkedUsersId];
        let removedUsers = [];

        const team = await Teams.findOne({ slug: req.params.teamSlug });

        switch (req.body.status) {
            case 'ban':
                const banned = [...team.banned];

                for (let checkedUserId of checkedUsersId) {
                    if (!team.banned.includes(checkedUserId)) {
                        banned.push(checkedUserId);
                    }
                }

                team.banned = banned;

                await team.save();

                break;
            case 'remove':
                // remove checked user out of the team
                for (let checkedUserId of checkedUsersId) {
                    const user = await User.findById(checkedUserId);

                    user.teams = user.teams.filter(
                        (t) =>
                            t.toString().localeCompare(team._id.toString()) !==
                            0
                    );
                    await user.save();

                    removedUsers.push(user);
                }

                break;
            default:
                break;
        }
        res.json({ success: true, removedUsers });
    } catch (err) {
        res.json({ success: false, msg: 'Error: ' + err });
    }
});

router.route('/updatePageMembersRole/:teamSlug').post(async (req, res) => {
    try {
        const club = await Teams.findOne({ slug: req.params.teamSlug });
        let counter = 0;

        for (const userId of req.body.usersId) {
            const userRole = req.body.roles[counter];
            let admins = [...club.administrators];
            let coaches = [...club.coaches];
            let moderators = [...club.moderators];

            switch (userRole) {
                case 'admin':
                    // only add if user is not found in the list
                    if (
                        !admins.some(
                            (uId) =>
                                uId
                                    .toString()
                                    .localeCompare(userId.toString()) === 0
                        )
                    ) {
                        admins.push(userId);
                    }

                    // filter user out of the moderators list (role upgraded)
                    moderators = moderators.filter(
                        (m) =>
                            m.toString().localeCompare(userId.toString()) !== 0
                    );

                    club.administrators = admins;
                    club.moderators = moderators;

                    break;
                case 'coach':
                    // only add if user is not found in the list
                    if (
                        !coaches.some(
                            (uId) =>
                                uId
                                    .toString()
                                    .localeCompare(userId.toString()) === 0
                        )
                    ) {
                        coaches.push(userId);
                    }

                    // filter user out of the moderators list (role upgraded)
                    moderators = moderators.filter(
                        (m) =>
                            m.toString().localeCompare(userId.toString()) !== 0
                    );

                    club.coaches = coaches;
                    club.moderators = moderators;

                    break;
                case 'mod':
                    // only add if user is not found in the list
                    if (
                        !moderators.some(
                            (uId) =>
                                uId
                                    .toString()
                                    .localeCompare(userId.toString()) === 0
                        )
                    ) {
                        moderators.push(userId);
                    }

                    // filter user out of the admin & coach list
                    admins = admins.filter(
                        (a) =>
                            a.toString().localeCompare(userId.toString()) !== 0
                    );
                    coaches = coaches.filter(
                        (c) =>
                            c.toString().localeCompare(userId.toString()) !== 0
                    );

                    club.administrators = admins;
                    club.coaches = coaches;
                    club.moderators = moderators;

                    break;
                default:
                    break;
            }

            counter += 1;
        }

        await club.save();

        res.json({
            success: true,
            coaches: club.coaches,
            moderators: club.moderators,
            administrators: club.administrators,
        });
    } catch (err) {
        res.json({ success: false, msg: 'Error: ' + err });
    }
});

module.exports = router;
