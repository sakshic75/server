const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Teams = mongoose.model('Teams');
const Group = mongoose.model('groups');
const Post = mongoose.model('posts');
const Event = mongoose.model('team_events');
const User = mongoose.model('users');
const Trending = require('../models/trending');
const path = require('path');
const pointsConfig = require(path.join(__dirname, '..', 'config/points'));

// get yesterday's date
let dateToday = new Date();
dateToday.setDate(dateToday.getDate() - 1);
const dateYesterday = dateToday.toISOString().split('T')[0];

router.post('/question/expression/:expr', async (req, res) => {
    try {
        const questionId = req.body.questionId;
        const userId = req.body.userId;
        const expr = req.params.expr;

        const date = new Date().toISOString().split('T')[0];
        let questionTrending = await Trending.findOne({
            date,
            type: 'question',
            itemId: questionId,
        });

        if (questionTrending) {
            if (expr === 'like') {
                questionTrending.point += pointsConfig.like;
            } else if (expr === 'dislike') {
                questionTrending.point += pointsConfig.dislike;
            }

            await questionTrending.save();
            console.log('questionTrending = ' + questionTrending);
        } else {
            const newTrendingItem = new Trending({
                date,
                type: 'question',
                itemId: questionId,
                point:
                    expr === 'like' ? pointsConfig.like : pointsConfig.dislike,
            });

            questionTrending = await newTrendingItem.save();

            console.log('newTrending = ' + questionTrending);
        }

        let userTrending = await Trending.findOne({
            date,
            type: 'user',
            itemId: userId,
        });

        if (userTrending) {
            userTrending.point += pointsConfig.like;

            await userTrending.save();
            console.log('userTrending = ' + userTrending);
        } else {
            const newTrendingItem = new Trending({
                date,
                type: 'user',
                itemId: userId,
                point: pointsConfig.like,
            });

            userTrending = await newTrendingItem.save();

            console.log('newTrending = ' + userTrending);
        }

        res.send({ questionTrending, userTrending });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/kudos', async (req, res) => {
    try {
        const userId = req.body.userId;
        const date = new Date().toISOString().split('T')[0];
        let userTrending = await Trending.findOne({
            date,
            type: 'user',
            itemId: userId,
        });

        if (userTrending) {
            userTrending.point += pointsConfig.like;

            await userTrending.save();
            console.log('userTrending = ' + userTrending);
        } else {
            const newTrendingItem = new Trending({
                date,
                type: 'user',
                itemId: userId,
                point: pointsConfig.like,
            });

            userTrending = await newTrendingItem.save();
            console.log('newTrending = ' + userTrending);
        }

        const sectionType = req.body.sectionType;
        const itemId = req.body.itemId;
        let itemTrending = null;

        // update trending score with +1 score for post/question and user (backslap)
        if (sectionType === 'users') {
            itemTrending = await Trending.findOne({
                date,
                type: 'post',
                itemId,
            });

            if (itemTrending) {
                itemTrending.point += pointsConfig.like;

                await itemTrending.save();
                console.log('itemTrending = ' + itemTrending);
            } else {
                const newTrendingItem = new Trending({
                    date,
                    type: 'post',
                    itemId,
                    point: pointsConfig.like,
                });

                itemTrending = await newTrendingItem.save();
                console.log('newTrending = ' + itemTrending);
            }
        }
        // update trending score with +1 score for groups
        else if (sectionType === 'groups') {
            itemTrending = await Trending.findOne({
                date,
                type: 'group',
                itemId,
            });

            if (itemTrending) {
                itemTrending.point += pointsConfig.like;

                await itemTrending.save();
                console.log('itemTrending = ' + itemTrending);
            } else {
                const newTrendingItem = new Trending({
                    date,
                    type: 'group',
                    itemId,
                    point: pointsConfig.like,
                });

                itemTrending = await newTrendingItem.save();
                console.log('newTrending = ' + itemTrending);
            }
        }
        // update trending score with +1 score for teams
        else if (sectionType === 'teams') {
            // convert team slug to id
            const team = await Teams.findOne({ slug: itemId });

            itemTrending = await Trending.findOne({
                date,
                type: 'team',
                itemId: team._id,
            });

            if (itemTrending) {
                itemTrending.point += pointsConfig.like;

                await itemTrending.save();
                console.log('itemTrending = ' + itemTrending);
            } else {
                const newTrendingItem = new Trending({
                    date,
                    type: 'team',
                    itemId: team._id,
                    point: pointsConfig.like,
                });

                itemTrending = await newTrendingItem.save();
                console.log('newTrending = ' + itemTrending);
            }
        }

        res.send({ userTrending, itemTrending });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/posts', async (req, res) => {
    try {
        const trendingPosts = await Trending.find(
            { type: 'post', date: dateYesterday },
            'itemId'
        );

        trendingPosts.sort((a, b) => b.point - a.point);
        const postsId = trendingPosts.map((post) => post.itemId);
        let posts = [];
        for (const postId of postsId) {
            const post = await Post.findById(postId);
            posts.push(post);
        }

        let owners = [];
        for (const post of posts) {
            const owner = await User.findOne(
                { userId: post.userId },
                'profilePicture firstName lastName'
            );
            owners.push(owner);
        }

        res.send({ posts, owners });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/teams', async (req, res) => {
    try {
        const trendingTeams = await Trending.find(
            { type: 'team', date: dateYesterday },
            'itemId'
        );

        trendingTeams.sort((a, b) => b.point - a.point);
        const teamsId = trendingTeams.map((team) => team.itemId);
        let teams = [];
        for (const teamId of teamsId) {
            const team = await Teams.findById(teamId);
            teams.push(team);
        }

        res.send({ teams });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/groups', async (req, res) => {
    try {
        const trendingGroups = await Trending.find(
            { type: 'group', date: dateYesterday },
            'itemId'
        );

        trendingGroups.sort((a, b) => b.point - a.point);
        const groupsId = trendingGroups.map((group) => group.itemId);
        let groups = [];
        for (const groupId of groupsId) {
            const group = await Group.findById(groupId);
            groups.push(group);
        }

        res.send({ groups });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/users', async (req, res) => {
    try {
        const trendingUsers = await Trending.find(
            { type: 'user', date: dateYesterday },
            'itemId point'
        );

        trendingUsers.sort((a, b) => b.point - a.point);
        const usersId = trendingUsers.map((user) => user.itemId);
        let users = [];
        for (const userId of usersId) {
            const user = await User.findById(userId);
            users.push(user);
        }

        res.send({ users });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/events', async (req, res) => {
    try {
        const trendingEvents = await Trending.find(
            { type: 'event', date: dateYesterday },
            'itemId point'
        );

        trendingEvents.sort((a, b) => b.point - a.point);
        const eventsId = trendingEvents.map((event) => event.itemId);

        let events = [];
        for (const eventId of eventsId) {
            const event = await Event.findById(eventId);
            events.push(event);
        }

        let creators = [];
        for (const event of events) {
            const creator = await User.findById(
                event.creatorId,
                'userId profilePicture firstName lastName'
            );
            creators.push(creator);
        }

        res.send({ events, creators });
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
