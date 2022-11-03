/**
 * =====================================
 * DEFINING POST API CALLS CONTROLLER
 * =====================================
 * @date created: 30 August 2019
 * @authors: Jay Parikh, Waqas Rehmani, Hasitha Dias and Uvin Abeysinghe
 *
 * The post_controller is used for defining the functionality of api calls related to posts
 *
 */

const mongoose = require('mongoose');

var path = require('path');
var formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const googleConfig = require(path.join(__dirname, '..', 'config/keys')).google;
const pointsConfig = require(path.join(__dirname, '..', 'config/points'));
const mime = require('mime-types');

const storage = new Storage({
    projectId: googleConfig.projectId,
    keyFilename: './config/Coaching Mate Social Website-49227c7ec05e.json',
});

const bucket = storage.bucket(googleConfig.postBucket);

const Post = mongoose.model('posts');
const User = mongoose.model('users');
const Group = mongoose.model('groups');
const Teams = mongoose.model('Teams');
const Tracker = require('../models/tracker');
const Trending = require('../models/trending');

// Helper function to assist in creating post
var assemblePost = function (fields) {
    var newPost = new Post({
        postId: fields.postId,
        userId: fields.userId,
        isQuestion: fields.isQuestion,
        kudos: {
            likes: [],
            bumSlaps: [],
            backSlaps: [],
        },
        section: JSON.parse(fields.section),
        type: fields.type,
        description: fields.description,
        comments: [],
        asset: '',
        assetFileName: fields.assetFileName,
        role: fields.role,
        time: Date.now(),
        interest: fields.interest,
    });

    return newPost;
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

// Function to create post
var createPost = function (req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var newPost = new Post(assemblePost(fields));

        if (newPost.type === 'text') {
            newPost.save(function (err, createdPost) {
                if (!err) {
                    return res.send(createdPost);
                } else {
                    console.log(err);
                    return res.send(err);
                }
            });
        } else {
            let fileToUpload = files.file;

            const type = mime.lookup(fileToUpload.name);
            let fileName = newPost.postId + '.' + mime.extensions[type][0];

            bucket.upload(
                fileToUpload.path,
                {
                    gzip: true,
                    destination: fileName,
                    predefinedAcl: 'publicRead',
                    metadata: {
                        contentType: type,
                    },
                },
                () => {
                    bucket
                        .file(fileName)
                        .getMetadata()
                        .then((data) => {
                            newPost.asset = data[0].mediaLink;
                            newPost.assetFileName = fileName;

                            newPost.save(function (err, createdPost) {
                                if (!err) {
                                    res.send(createdPost);
                                } else {
                                    console.log(err);
                                    res.send(err);
                                }
                            });
                        });
                }
            );
        }
    });
};

// new create post
let newCreatePost = async (req, res) => {
    try {
        let newPost = new Post({
            postId: req.body.postId,
            userId: req.body.userId,
            isQuestion: req.body.isQuestion,
            kudos: {
                likes: [],
                bumSlaps: [],
                backSlaps: [],
            },
            section: req.body.section,
            type: req.body.type,
            description: req.body.description,
            comments: [],
            asset: '',
            imgFileName: req.body.imgFileName,
            videoFileName: req.body.videoFileName,
            role: req.body.role,
            time: Date.now(),
            interest: req.body.interest,
        });

        if (req.body.section.type === 'teams') {
            const team = await Teams.findOne({ slug: newPost.section.id });

            // if admin then post do not need any approval
            const currUser = await User.findOne(
                { userId: req.body.userId },
                '_id'
            );

            // team post approval is turned on and user is not creator/coach/mod/admin
            if (
                team.postReqApproval &&
                !(
                    currUser._id
                        .toString()
                        .localeCompare(team.creatorId.toString()) === 0 ||
                    (team.coaches && team.coaches.includes(currUser._id)) ||
                    (team.moderators &&
                        team.moderators.includes(currUser._id)) ||
                    (team.administrators &&
                        team.administrators.includes(currUser._id))
                )
            ) {
                newPost.status = 'pending';
            }
        } else if (req.body.section.type === 'groups') {
            const group = await Group.findById(newPost.section.id);

            if (group.postReqApproval) {
                newPost.status = 'pending';
            }
        }

        let savedPost = await newPost.save();

        // 5 trending points for user (create user/group post)
        const user = await User.findOne({ userId: newPost.userId }, '_id');
        await updateTrendingScore(
            user._id,
            'user',
            pointsConfig.addPostOrQuestion
        );

        // 5 trending points for group (create group post)
        if (newPost.section.type === 'groups') {
            await updateTrendingScore(
                newPost.section.id,
                'group',
                pointsConfig.addPostOrQuestion
            );
        }
        // 5 trending points for team (create team post)
        else if (newPost.section.type === 'teams') {
            // convert team slug to id
            const team = await Teams.findOne({ slug: newPost.section.id });

            await updateTrendingScore(
                team._id,
                'team',
                pointsConfig.addPostOrQuestion
            );
        }

        res.send(savedPost);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Function to create new comment
var createComment = async (req, res) => {
    await Post.findOne({ postId: req.params.postId })
        .then(async (post) => {
            post.comments = req.body.comment;

            const userId = req.body.userId;

            // 2 trending points for post (create user post)
            if (post.section.type === 'users') {
                if (!post.isQuestion) {
                    await updateTrendingScore(
                        post._id,
                        'post',
                        pointsConfig.comment
                    );
                } else {
                    await updateTrendingScore(
                        post._id,
                        'question',
                        pointsConfig.answer
                    );
                }
            }
            // 2 trending points for group (create group post)
            else if (post.section.type === 'groups') {
                await updateTrendingScore(
                    post.section.id,
                    'group',
                    pointsConfig.comment
                );
            }
            // 2 trending points for team (create team post)
            else if (post.section.type === 'teams') {
                // convert team slug to id
                const team = await Teams.findOne({ slug: post.section.id });

                await updateTrendingScore(
                    team._id,
                    'team',
                    pointsConfig.comment
                );
            }
            await updateTrendingScore(userId, 'user', pointsConfig.comment);

            post.save()
                .then(() => res.json(post))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => {
            res.json({ success: false, msg: 'Error: ' + err });
        });
};

// Function to update comment
var updateComment = async (req, res) => {
    await Post.findOne({ postId: req.params.postId })
        .then((post) => {
            post.comments = req.body.comment;

            post.save()
                .then(() => res.json(post))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => {
            res.json({ success: false, msg: 'Error: ' + err });
        });
};

// accept top answer
let acceptTopAnswer = async (req, res) => {
    try {
        const postId = req.body.postId;
        const commentId = parseInt(req.params.commentId);

        const question = await Post.findById(postId);

        const commentIndex = question.comments.findIndex(
            (c) => c.commentId === commentId
        );

        question.comments[commentIndex].accepted = true;

        await question.save();

        // add 3 trending points for question (accepted answer)
        await updateTrendingScore(
            postId,
            'question',
            pointsConfig.acceptTopAnswer
        );

        // add 5 trending points for user (user's answer marked as top answer)
        await updateTrendingScore(
            req.body.answerOwner,
            'user',
            pointsConfig.userTopAnswer
        );

        res.send({ question, success: true });
    } catch (err) {
        res.status(400).send(err);
    }
};

// Function to edit post
var editPost = async (req, res) => {
    await Post.findOne({ postId: req.params.postId })
        .then((post) => {
            post.type = req.body.type;
            post.description = req.body.description;
            post.interest = req.body.interest;

            post.save()
                .then(() => res.json(post))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => {
            res.json({ success: false, msg: 'Error: ' + err });
        });
};

// Function to get all posts
var getAllPosts = function (req, res) {
    Post.find(
        { isQuestion: false, section: { type: 'users' } },
        function (err, allPost) {
            if (!err) {
                res.send(allPost);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to get all posts that are questions
var getAllQuestionPosts = function (req, res) {
    Post.find({ isQuestion: true }, function (err, allPost) {
        if (!err) {
            res.send(allPost);
        } else {
            res.send(err);
        }
    });
};

// Function to get a post by postId
var getPost = function (req, res) {
    let postId = req.params.postId;

    Post.findOne({ postId }, function (err, returnedPost) {
        if (!err) {
            res.send(returnedPost);
        } else {
            res.send(err);
        }
    });
};

// Function to get all posts made by a particular user
var getPostByUser = function (req, res) {
    let userId = req.params.userId;

    Post.find({ userId }, function (err, userPosts) {
        if (!err) {
            res.send(userPosts);
        } else {
            res.send(err);
        }
    }).sort({ time: -1 });
};

// Function to delete a post with id passed in the params
var deletePost = function (req, res) {
    let postId = req.params.postId;

    Post.findOneAndDelete({ postId: postId }, function (err, deletedPost) {
        if (!err) {
            if (deletedPost.asset !== '') {
                bucket.file(deletedPost.assetFileName).delete();
            }
            res.send(true);
        } else {
            res.send(err);
        }
    });
};

// Function to change the kudos of a particular post by postId
var changeReaction = async (req, res) => {
    await Post.findOne({ postId: req.params.postId })
        .then((post) => {
            post.kudos = req.body.kudos;

            post.save()
                .then(() => res.json(post))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => {
            res.json({ success: false, msg: 'Error: ' + err });
        });
};

// Function to get all the posts of a particular event by eventId
var getAllEventsPosts = function (req, res) {
    let eventId = req.params.eventId;

    Post.find(
        { section: { type: 'events', id: eventId }, status: 'active' },
        function (err, allPost) {
            if (!err) {
                res.send(allPost);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to get all posts of a particular group by groupId
var getPostByGroup = function (req, res) {
    let groupId = req.params.groupId;

    Post.find(
        { section: { type: 'groups', id: groupId, status: 'active' } },
        function (err, groupPosts) {
            if (!err) {
                res.send(groupPosts);
            } else {
                res.send(err);
            }
        }
    ).sort({ time: -1 });
};

// Function to get all active posts of a particular team by teamId
let getPostByTeam = async (req, res) => {
    try {
        const teamId = req.params.teamId;

        const posts = await Post.find({
            $or: [
                { section: { type: 'teams', id: teamId }, status: 'active' },
                {
                    section: { type: 'teams', id: teamId, category: 'public' },
                    status: 'active',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'member' },
                    status: 'active',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'coach' },
                    status: 'active',
                },
                {
                    section: {
                        type: 'teams',
                        id: teamId,
                        category: 'moderator',
                    },
                    status: 'active',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'admin' },
                    status: 'active',
                },
            ],
        }).sort({ time: -1 });

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

        res.send({ posts, owners });
    } catch (err) {
        res.send(err);
    }
};

let getPostsByTypeAndDate = async (req, res) => {
    try {
        const teamId = req.params.teamId;
        let posts = await Post.find({
            $or: [
                { section: { type: 'teams', id: teamId }, status: 'active' },
                {
                    section: { type: 'teams', id: teamId, category: 'public' },
                    status: 'active',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'member' },
                    status: 'active',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'coach' },
                    status: 'active',
                },
                {
                    section: {
                        type: 'teams',
                        id: teamId,
                        category: 'moderator',
                    },
                    status: 'active',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'admin' },
                    status: 'active',
                },
            ],
        }).sort({ time: -1 });

        // if category is either public/member/coach/moderator/admin
        if (req.params.category !== 'all') {
            posts = posts.filter(
                (p) =>
                    p.section.category &&
                    p.section.category.localeCompare(req.params.category) === 0
            );
        }

        let date = new Date();
        const WEEKLY = 7;
        const MONTHLY = 30;

        switch (req.params.range) {
            case 'lastWeek':
                date.setDate(date.getDate() - WEEKLY);

                posts = posts.filter(
                    (p) => date.getTime() <= new Date(p.time).getTime()
                );
                break;
            case 'lastMonth':
                date.setDate(date.getDate() - MONTHLY);

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

let getPendingPostsByDateRange = async (req, res) => {
    try {
        const teamId = req.params.teamId;

        let posts = await Post.find({
            $or: [
                { section: { type: 'teams', id: teamId }, status: 'pending' },
                {
                    section: { type: 'teams', id: teamId, category: 'public' },
                    status: 'pending',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'member' },
                    status: 'pending',
                },
            ],
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

// Function to get all pending posts of a particular team by teamId
let getPendingPostByTeam = async (req, res) => {
    try {
        const teamId = req.params.teamId;

        const posts = await Post.find({
            $or: [
                { section: { type: 'teams', id: teamId }, status: 'pending' },
                {
                    section: { type: 'teams', id: teamId, category: 'public' },
                    status: 'pending',
                },
                {
                    section: { type: 'teams', id: teamId, category: 'member' },
                    status: 'pending',
                },
            ],
        }).sort({ time: -1 });

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

        res.send({ posts, owners });
    } catch (err) {
        res.send(err);
    }
};

let updatePostStatus = async (req, res) => {
    try {
        const post = await Post.findOne({ postId: req.params.postId });

        post.status = req.body.status;

        await post.save();

        res.send({ post, success: true });
    } catch (err) {
        res.send({ err, success: false });
    }
};

let updatePostsStatus = async (req, res) => {
    try {
        let posts = [...req.body.posts];

        switch (req.body.status) {
            case 'suspend':
                for (let post of posts) {
                    post = await Post.findById(post._id);
                    post.status = req.body.status;

                    await post.save();
                }

                break;
            case 'delete':
                for (let post of posts) {
                    const deletedPost = await Post.findByIdAndDelete(post._id);

                    // remove post in user
                    if (deletedPost._id) {
                        const users = await User.find({
                            saved: { $in: [deletedPost._id] },
                        });

                        // filter user save
                        for (const user of users) {
                            let saved = [...user.saved];
                            saved = saved.filter(
                                (s) =>
                                    s.toString() !== deletedPost._id.toString()
                            );

                            user.saved = saved;

                            await user.save();
                        }
                    }
                }

                break;
            default:
                break;
        }

        res.send({ posts, success: true });
    } catch (err) {
        res.send({ err, success: false });
    }
};

let getInitialFeedPosts = async (req, res) => {
    try {
        let userId = req.params.userId;
        let groupsId = [];
        let teamsSlug = [];
        const INITIAL_DISPLAY_LENGTH = 5;

        // get user data
        const user = await User.findOne({ userId });

        // get subscribed group posts
        if (user.groups) {
            // get the group id from the group object id
            let groupsInfo = await Group.find(
                {
                    _id: {
                        $in: user.groups,
                    },
                },
                'groupId'
            );
            // convert groups info json string, then parse into json obj
            groupsInfo = JSON.parse(JSON.stringify(groupsInfo));

            // extract the group id property to a list
            for (let groupInfo of groupsInfo) {
                groupsId.push(groupInfo.groupId);
            }
        }

        // get subscribed team posts
        if (user.teams) {
            let teamsInfo = await Teams.find(
                {
                    _id: {
                        $in: user.teams,
                    },
                },
                'slug'
            );

            // convert groups info json string, then parse into json obj
            teamsInfo = JSON.parse(JSON.stringify(teamsInfo));

            // extract the team slug property to a list
            for (let teamInfo of teamsInfo) {
                teamsSlug.push(teamInfo.slug);
            }
        }

        const postsId = await Post.find(
            {
                $or: [
                    // query to get following users posts
                    {
                        userId: {
                            $in: user.following,
                        },
                        isQuestion: false,
                        section: { type: 'users' },
                    },
                    // query to get subscribed groups posts
                    {
                        'section.id': {
                            $in: groupsId,
                        },
                        'section.type': 'groups',
                        isQuestion: false,
                    },
                    // query to get subscribed teams posts
                    {
                        'section.type': 'teams',
                        'section.id': {
                            $in: teamsSlug,
                        },
                        isQuestion: false,
                    },
                ],
            },
            '_id time'
        ).sort({ time: -1 });

        // create a tracker list for identifying which post to display
        const newTracker = new Tracker({
            userId,
            itemsId: postsId,
        });
        const savedTracker = await newTracker.save();

        // get first 5 posts data
        const initialPostsId = postsId
            .slice(0, INITIAL_DISPLAY_LENGTH)
            .map((postInfo) => postInfo._id);
        const initialPosts = await Post.find({
            _id: { $in: initialPostsId },
        }).sort({ time: -1 });

        // get first 5 posts owner data
        const initialOwnersUserId = initialPosts.map((post) => post.userId);

        const ownersNoDuplicate = await User.find(
            { userId: { $in: initialOwnersUserId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];

        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        initialOwnersUserId.forEach((ownerId) => {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(ownerId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(ownerId)]
                );
            }
        });

        res.send({
            posts: initialPosts,
            owners,
            currTrackerId: savedTracker._id,
            totalPostsLength: postsId.length,
            hasMore: postsId.length > INITIAL_DISPLAY_LENGTH,
        });
    } catch (err) {
        res.send(err);
    }
};

let getInitialSubQuestions = async (req, res) => {
    try {
        let userId = req.params.userId;
        let questionsId = [];
        const INITIAL_DISPLAY_LENGTH = 5;

        // get user data
        const user = await User.findOne({ userId });

        // get following user questions
        if (user.following) {
            const followingUserQuestions = await Post.find(
                {
                    userId: {
                        $in: user.following,
                    },
                    isQuestion: true,
                    section: { type: 'users' },
                },
                '_id time'
            ).sort({ time: -1 });
            questionsId.push(...followingUserQuestions);
        }

        // create a tracker list for identifying which post to display
        const newTracker = new Tracker({
            userId,
            itemsId: questionsId,
        });
        const savedTracker = await newTracker.save();

        // get first 5 questions data
        const initialQuestionsId = questionsId
            .slice(0, INITIAL_DISPLAY_LENGTH)
            .map((questionInfo) => questionInfo._id);
        const initialQuestions = await Post.find({
            _id: { $in: initialQuestionsId },
        }).sort({ time: -1 });

        // get first 5 questions owner data
        const initialOwnersUserId = initialQuestions.map(
            (question) => question.userId
        );

        const ownersNoDuplicate = await User.find(
            { userId: { $in: initialOwnersUserId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        initialOwnersUserId.forEach((ownerId) => {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(ownerId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(ownerId)]
                );
            }
        });

        res.send({
            questions: initialQuestions,
            owners,
            currTrackerId: savedTracker._id,
            totalQuestionsLength: questionsId.length,
            hasMore: questionsId.length > INITIAL_DISPLAY_LENGTH,
        });
    } catch (err) {
        res.send(err);
    }
};

let getInitialTrendingQuestions = async (req, res) => {
    try {
        let userId = req.params.userId;
        const INITIAL_DISPLAY_LENGTH = 5;

        // get yesterday's date
        let dateToday = new Date();
        dateToday.setDate(dateToday.getDate() - 1);
        const dateYesterday = dateToday.toISOString().split('T')[0];

        const trendingQuestions = await Trending.find(
            { type: 'question', date: dateYesterday },
            'itemId'
        );
        const questionsId = trendingQuestions.map(
            (question) => question.itemId
        );

        // create a tracker list for identifying which post to display
        const newTracker = new Tracker({
            userId,
            itemsId: questionsId,
        });
        const savedTracker = await newTracker.save();

        // get first 5 questions data
        const initialQuestionsId = questionsId
            .slice(0, INITIAL_DISPLAY_LENGTH)
            .map((questionInfo) => questionInfo._id);

        let initialQuestions = [];
        for (const questionId of initialQuestionsId) {
            const question = await Post.findById(questionId);
            initialQuestions.push(question);
        }

        // get first 5 questions owner data
        const initialOwnersUserId = initialQuestions.map(
            (question) => question.userId
        );

        const ownersNoDuplicate = await User.find(
            { userId: { $in: initialOwnersUserId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        for (let ownerId of initialOwnersUserId) {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(ownerId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(ownerId)]
                );
            }
        }

        res.send({
            questions: initialQuestions,
            owners,
            currTrackerId: savedTracker._id,
            totalQuestionsLength: questionsId.length,
            hasMore: questionsId.length > INITIAL_DISPLAY_LENGTH,
        });
    } catch (err) {
        res.send(err);
    }
};

let getSubscribedQuestions = async (req, res) => {
    try {
        let userId = req.params.userId;
        let followingUserQuestions = [];

        // get user data
        const user = await User.findOne({ userId });

        // get following user questions
        if (user.following) {
            followingUserQuestions = await Post.find(
                {
                    userId: {
                        $in: user.following,
                    },
                    isQuestion: true,
                    section: { type: 'users' },
                },
                '_id postId userId description time'
            ).sort({ time: -1 });
        }

        // get post authors details
        const ownersId = followingUserQuestions.map(
            (question) => question.userId
        );

        const ownersNoDuplicate = await User.find(
            { userId: { $in: ownersId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        ownersId.forEach((ownerId) => {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(ownerId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(ownerId)]
                );
            }
        });

        res.send({ subscribedQuestions: followingUserQuestions, owners });
    } catch (err) {
        res.send(err);
    }
};

let getInitialCurrUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const INITIAL_DISPLAY_LENGTH = 5;

        // get user posts (descending order by time)
        const userPostsId = await Post.find(
            {
                userId,
                isQuestion: false,
                section: { type: 'users' },
            },
            '_id time'
        ).sort({ time: -1 });

        // create a tracker list for identifying which post to display
        const newTracker = new Tracker({
            userId,
            itemsId: userPostsId,
        });
        const savedTracker = await newTracker.save();

        // get first 5 posts data
        const initialPostsId = userPostsId
            .slice(0, INITIAL_DISPLAY_LENGTH)
            .map((postInfo) => postInfo._id);
        const initialPosts = await Post.find({
            _id: { $in: initialPostsId },
        }).sort({ time: -1 });

        // get first 5 posts owner data
        const owner = await User.findOne(
            { userId },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        for (let i = 0; i < initialPostsId.length; i++) {
            owners.push(owner);
        }

        res.send({
            posts: initialPosts,
            owners,
            currTrackerId: savedTracker._id,
            totalPostsLength: userPostsId.length,
            hasMore: userPostsId.length > INITIAL_DISPLAY_LENGTH,
        });
    } catch (err) {
        res.send(err);
    }
};

let getInitialCurrUserQuestions = async (req, res) => {
    try {
        const userId = req.params.userId;
        const INITIAL_DISPLAY_LENGTH = 5;

        // get user questions (descending order by time)
        const userQuestionsId = await Post.find(
            {
                userId,
                isQuestion: true,
                section: { type: 'users' },
            },
            '_id time'
        ).sort({ time: -1 });

        // create a tracker list for identifying which post to display
        const newTracker = new Tracker({
            userId,
            itemsId: userQuestionsId,
        });
        const savedTracker = await newTracker.save();

        // get first 5 questions data
        const initialQuestionsId = userQuestionsId
            .slice(0, INITIAL_DISPLAY_LENGTH)
            .map((questionInfo) => questionInfo._id);
        const initialQuestions = await Post.find({
            _id: { $in: initialQuestionsId },
        }).sort({ time: -1 });

        // get first 5 questions owner data
        const owner = await User.findOne(
            { userId },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        for (let i = 0; i < initialQuestionsId.length; i++) {
            owners.push(owner);
        }

        res.send({
            questions: initialQuestions,
            owners,
            currTrackerId: savedTracker._id,
            totalQuestionsLength: userQuestionsId.length,
            hasMore: userQuestionsId.length > INITIAL_DISPLAY_LENGTH,
        });
    } catch (err) {
        res.send(err);
    }
};

let getInitialSavedPosts = async (req, res) => {
    try {
        let userId = req.params.userId;
        const INITIAL_DISPLAY_LENGTH = 5;

        // get user data
        const user = await User.findOne({ userId });
        const reversedSavedList = user.saved.reverse();

        // create a tracker list for identifying which post to display
        const newTracker = new Tracker({
            userId,
            itemsId: reversedSavedList,
        });
        const savedTracker = await newTracker.save();

        // get first 5 saved posts data (reversed)
        const initialSavedPostsId = reversedSavedList.slice(
            0,
            INITIAL_DISPLAY_LENGTH
        );
        const initialSavedPosts = await Post.find({
            _id: { $in: initialSavedPostsId },
        });

        // reorder the initialSavedPosts order
        const unorderedSavedPostsId = initialSavedPosts.map((post) => post._id);
        let orderedSavedPosts = [];

        initialSavedPostsId.forEach((pId) => {
            const index = unorderedSavedPostsId.findIndex(
                (item) => String(item) === String(pId)
            );
            orderedSavedPosts.push(initialSavedPosts[index]);
        });

        // get first 5 questions owner data
        const initialOwnersUserId = orderedSavedPosts.map(
            (post) => post.userId
        );

        const ownersNoDuplicate = await User.find(
            { userId: { $in: initialOwnersUserId } },
            'userId firstName lastName profilePicture'
        );

        let owners = [];
        const ownersNoDuplicateId = ownersNoDuplicate.map(
            (owner) => owner.userId
        );

        // get owners list
        initialOwnersUserId.forEach((ownerId) => {
            // found owner data in ownerNoDuplicate list
            if (ownersNoDuplicateId.indexOf(ownerId) !== -1) {
                owners.push(
                    ownersNoDuplicate[ownersNoDuplicateId.indexOf(ownerId)]
                );
            }
        });

        res.send({
            savedPosts: orderedSavedPosts,
            owners,
            currTrackerId: savedTracker._id,
            totalSavedPostsLength: user.saved.length,
            hasMore: user.saved.length > INITIAL_DISPLAY_LENGTH,
        });
    } catch (err) {
        res.send(err);
    }
};

// get post by object id (sorted by time)
let getPostListByObjId = async (req, res) => {
    try {
        // get the tracker
        const currTracker = await Tracker.findOne({
            _id: req.body.currTrackerId,
        });

        // get posts id list
        const postsId = currTracker.itemsId.slice(
            req.body.currPostsLen,
            req.body.lastPostsIndex
        );

        const posts = await Post.find({ _id: { $in: postsId } });

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

        res.send({ posts, owners });
    } catch (err) {
        res.send(err);
    }
};

// Function to delete a post with id passed in the params
var deletePostsByGroup = function (req, res) {
    let groupId = req.params.groupId;

    Post.deleteMany(
        { section: { type: 'groups', id: groupId } },
        function (err, stat) {
            if (!err) {
                res.send(true);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to delete posts of a particular event by eventId (passed in params)
var deletePostsByEvent = function (req, res) {
    let eventId = req.params.eventId;

    Post.deleteMany(
        { section: { type: 'events', id: eventId } },
        function (err, stat) {
            if (!err) {
                res.send(true);
            } else {
                res.send(err);
            }
        }
    );
};

// Function to get all the trending posts
var getTrendingPosts = function (req, res) {
    Post.find({ section: { type: 'users' } }, function (err, allPost) {
        let sortedPosts = allPost;
        sortedPosts.sort((a, b) => {
            let trendA =
                a.comments.length +
                a.kudos.likes.length +
                a.kudos.bumSlaps.length +
                a.kudos.backSlaps.length;
            let trendB =
                b.comments.length +
                b.kudos.likes.length +
                b.kudos.bumSlaps.length +
                b.kudos.backSlaps.length;
            return trendB - trendA;
        });

        if (!err) {
            res.send(sortedPosts);
        } else {
            res.send(err);
        }
    });
};
module.exports.createComment = createComment;
module.exports.updateComment = updateComment;
module.exports.acceptTopAnswer = acceptTopAnswer;
module.exports.getAllQuestionPosts = getAllQuestionPosts;
module.exports.editPost = editPost;
module.exports.createPost = createPost;
module.exports.newCreatePost = newCreatePost;
module.exports.getAllPosts = getAllPosts;
module.exports.deletePost = deletePost;
module.exports.getPostByUser = getPostByUser;
module.exports.getPost = getPost;
module.exports.getAllEventsPosts = getAllEventsPosts;
module.exports.changeReaction = changeReaction;
module.exports.getTrendingPosts = getTrendingPosts;
module.exports.getPostByGroup = getPostByGroup;
module.exports.getPostByTeam = getPostByTeam;
module.exports.getPostsByTypeAndDate = getPostsByTypeAndDate;
module.exports.getPendingPostsByDateRange = getPendingPostsByDateRange;
module.exports.getPendingPostByTeam = getPendingPostByTeam;
module.exports.updatePostStatus = updatePostStatus;
module.exports.updatePostsStatus = updatePostsStatus;
module.exports.getInitialFeedPosts = getInitialFeedPosts;
module.exports.getInitialSubQuestions = getInitialSubQuestions;
module.exports.getInitialCurrUserPosts = getInitialCurrUserPosts;
module.exports.getInitialCurrUserQuestions = getInitialCurrUserQuestions;
module.exports.getInitialTrendingQuestions = getInitialTrendingQuestions;
module.exports.getSubscribedQuestions = getSubscribedQuestions;
module.exports.getInitialSavedPosts = getInitialSavedPosts;
module.exports.getPostListByObjId = getPostListByObjId;
module.exports.deletePostsByGroup = deletePostsByGroup;
module.exports.deletePostsByEvent = deletePostsByEvent;
