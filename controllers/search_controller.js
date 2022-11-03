/**
 * =====================================
 * DEFINING SEARCH API CALLS CONTROLLER
 * =====================================
 * @date created: 01 September 2019
 * @authors: Waqas Rehmani and Fatemeh Fathi
 *
 * The search_controller is used for defining the functionality of api calls related to search
 *
 */

const mongoose = require('mongoose');

var User = mongoose.model('users');
var Post = mongoose.model('posts');
var Group = mongoose.model('groups');
var Team = mongoose.model('Teams');
var Event = mongoose.model('events');

// Function to find users using regex
var findUsers = function (req, res) {
    let userQuery = '(?i).*' + req.body.query + '.*';

    User.find(
        {
            $or: [
                { userId: { $regex: userQuery } },
                { firstName: { $regex: userQuery } },
                { lastName: { $regex: userQuery } },
            ],
        },
        function (err, resultUsers) {
            if (!err) {
                res.send(resultUsers);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to find posts using regex
var findPosts = function (req, res) {
    let postQuery = '(?i).*' + req.body.query + '.*';

    Post.find(
        { description: { $regex: postQuery } },
        function (err, resultPosts) {
            if (!err) {
                res.send(resultPosts);
            } else {
                res.send(err);
            }
        }
    );
};

// search for pending team posts with regex
let findPendingTeamPostsWithDateRange = async (req, res) => {
    try {
        let postQuery = '(?i).*' + req.body.query + '.*';

        let posts = await Post.find({
            section: {
                type: 'teams',
                id: req.params.teamId,
            },
            status: 'pending',
            description: { $regex: postQuery },
        }).sort({ time: -1 });

        let date = new Date();
        const WEEKLY = 7;
        const MONTHLY = 30;
        const QUARTERLY = 91;
        const YEARLY = 365;

        switch (req.params.range) {
            case 'all':
                break;
            case 'weekly':
                date.setDate(date.getDate() - WEEKLY);

                posts = posts.filter(
                    (p) => date.getTime() <= new Date(p.time).getTime()
                );
                break;
            case 'monthly':
                date.setDate(date.getDate() - MONTHLY);

                posts = posts.filter(
                    (p) => date.getTime() <= new Date(p.time).getTime()
                );
                break;
            case 'quarterly':
                date.setDate(date.getDate() - QUARTERLY);

                posts = posts.filter(
                    (p) => date.getTime() <= new Date(p.time).getTime()
                );
                break;
            case 'yearly':
                date.setDate(date.getDate() - YEARLY);

                posts = posts.filter(
                    (p) => date.getTime() <= new Date(p.time).getTime()
                );
                break;
            default:
                break;
        }

        const postsUserId = posts.map((p) => p.userId);

        const ownersNoDuplicate = await User.find(
            { userId: { $in: postsUserId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        postsUserId.forEach((uId) => {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(uId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(uId)]
                );
            }
        });

        res.send({ posts, owners, success: true });
    } catch (err) {
        res.send({ err, success: false });
    }
};

// search for team posts with regex
let findTeamPosts = async (req, res) => {
    try {
        let posts = [...req.body.posts];
        if (req.body.query) {
            posts = posts.filter(({ description }) =>
                new RegExp(`.*${req.body.query}.*`, 'i').test(description)
            );
        }

        const postsUserId = posts.map((p) => p.userId);

        const ownersNoDuplicate = await User.find(
            { userId: { $in: postsUserId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        postsUserId.forEach((uId) => {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(uId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(uId)]
                );
            }
        });

        res.send({ posts, owners, success: true });
    } catch (err) {
        res.send({ err, success: false });
    }
};

// search for team users with regex
let findTeamUsers = async (req, res) => {
    try {
        let users = [...req.body.users];
        if (req.body.query) {
            users = users.filter(({ firstName, lastName }) =>
                new RegExp(`.*${req.body.query}.*`, 'i').test(
                    `${firstName} ${lastName}`
                )
            );
        }

        res.send({ users, success: true });
    } catch (err) {
        res.send({ err, success: false });
    }
};

// Function to find groups using regex
var findGroups = function (req, res) {
    let groupQuery = '(?i).*' + req.body.query + '.*';

    Group.find(
        {
            $or: [
                { groupId: { $regex: groupQuery } },
                { title: { $regex: groupQuery } },
                { slug: { $regex: groupQuery } },
                { description: { $regex: groupQuery } },
                { activityType: { $regex: groupQuery } },
            ],
        },
        function (err, resultGroups) {
            if (!err) {
                res.send(resultGroups);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to find teams using regex
var findTeams = function (req, res) {
    let teamQuery = '(?i).*' + req.body.query + '.*';

    Team.find(
        {
            $or: [
                { title: { $regex: teamQuery } },
                { slug: { $regex: teamQuery } },
                { description: { $regex: teamQuery } },
                { activityType: { $regex: teamQuery } },
            ],
        },
        function (err, resultTeams) {
            if (!err) {
                res.send(resultTeams);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to find events using regex
var findEvents = function (req, res) {
    let eventQuery = '(?i).*' + req.body.query + '.*';
    //console.log(eventQuery);
    Event.find(
        {
            $or: [
                { name: { $regex: eventQuery } },
                { description: { $regex: eventQuery } },
            ],
        },
        function (err, resultEvents) {
            if (!err) {
                res.send(resultEvents);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to find users using regex
var findCoaches = function (req, res) {
    let coachQuery = '(?i).*' + req.body.query + '.*';

    User.find(
        {
            role: 'Coach',
            $or: [
                { userId: { $regex: coachQuery } },
                { firstName: { $regex: coachQuery } },
                { lastName: { $regex: coachQuery } },
            ],
        },
        function (err, resultCoaches) {
            if (!err) {
                res.send(resultCoaches);
            } else {
                res.send(err);
            }
        }
    );
};

//Budgerigar
//Function to send the necessary icons
var findIcons = function (req, res){
    var icons = [];
    var iconsName = [
        "edit.png",
        "complete.png"
    ];
    for (let i = 0; i < iconsName.length; i++){
        icons.push('http://localhost:3001/uploads/images/' + iconsName[i])
    }
    //console.log(icons);
    res.send(icons);
};

module.exports.findUsers = findUsers;
module.exports.findTeamUsers = findTeamUsers;
module.exports.findPosts = findPosts;
module.exports.findTeamPosts = findTeamPosts;
module.exports.findPendingTeamPostsWithDateRange = findPendingTeamPostsWithDateRange;
module.exports.findGroups = findGroups;
module.exports.findTeams = findTeams;
module.exports.findEvents = findEvents;
module.exports.findCoaches = findCoaches;
module.exports.findIcons = findIcons;
