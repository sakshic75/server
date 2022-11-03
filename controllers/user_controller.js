/**
 * =====================================
 * DEFINING USER API CALLS CONTROLLER
 * =====================================
 * @date created: 01 September 2019
 * @authors: Uvin Abeysinghe and Waqas Rehmani
 *
 * The user_controller is used for defining the functionality of api calls related to users
 *
 */

const mongoose = require('mongoose');
const Trending = require('../models/trending');

// constants for authentication and authorization
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const mime = require('mime-types');
const { Storage } = require('@google-cloud/storage');
const googleConfig = require(path.join(__dirname, '..', 'config/keys')).google;
const pointsConfig = require(path.join(__dirname, '..', 'config/points'));

// constant for emailing confirmation emails to user
const nodemailer = require('nodemailer');

const storage = new Storage({
    projectId: googleConfig.projectId,
    keyFilename: './config/Coaching Mate Social Website-49227c7ec05e.json',
});

let User = mongoose.model('users');

// Function to set up the emailing details
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'coaching.mse.cmbilby@gmail.com',
        pass: 'cmbilby123!',
    },
});

let validateEmail = (email) => {
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
};

// Function to create user
let createUser =  async (req, res) =>{
    let userexists = "";
     let userId = "";
     //checking the email is already exists or not
    userexists = await User.findOne({
        email: req.body.email,
    });
    // checking the userId is already exists or not
    userId = await User.findOne({
        userId: req.body.userId,
    });
    if (userexists) {
        // sending response if email is already exists
       return res.json({
           type : "email_exists",
       });
    }
   
     if(userId) {
         // sending response if userId alredy exist
        return res.json({
            type:"userId_exists",
        })
    
    }
    else {
        //creatig new user
        googleId = "";
        facebookId = "";
        if (req.body.type == "google") {
            googleId = req.body.socialid;
        }
        if (req.body.type == "facebook") {
            facebookId = req.body.socialid;
        }
        var newUser = new User({
            userId: req.body.userId,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            dob: req.body.dob,
            interest: [],
            location: '',
            phone: req.body.phone,
            groups: [],
            profilePicture: '',
            profilePictureFileName: '',
            coachingCertificate: '',
            coachingCertificateFile: '',
            biography: '',
            following: [],
            follower: [],
            googleId: googleId,
            facebookId: facebookId,

        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save(function (err, createdUser) {
                    if (!err) {
                        // sending confirmation email to the user
                        let mailOptions = {
                            from: 'coaching.mse.cmbilby@gmail.com',
                            to: createdUser.email,
                            subject:
                                'Welcome to The Coaching Mate Social Media Website',
                            html:
                                '<div style="background-color: #ff5c4b; display: flex;flex-flow: column;align-items: center;justify-content: space-evenly;color: #fff;padding: 20px;">\n' +
                                '        <svg style="width: 200px;" id="Layer_3" data-name="Layer 3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 864.93 359.47"><defs><style>.cls-1{fill:#fff;}</style></defs><title>coachingmateLogo</title><path class="cls-1" d="M883.46,1089.62l59-57.19c-9.27-9.77-50.92-51.48-119-56.16-11.82-.81-70.78-3.69-123.79,38a181.09,181.09,0,0,0-64.82,178.24c2.81,13.63,14.19,60.69,56.38,97.9a182,182,0,0,0,54,32.41c41.7,16.14,77.46,12.51,86.08,11.48,41.91-5,70.26-24.1,84-33.58,19-13.08,30.52-26.36,34.72-30.22,31-28.5,220.46-216.27,220.46-216.27l-61.16-59.46c-85.07,83.39-123.12,122-142,141.69,0,0-32.34,33.84-69.79,71.65-4,4.08-8.12,8.15-8.12,8.15-8.3,8.28-14.88,14.7-15.6,15.39-7.37,7.1-37.72,27.48-77,22.28-8.11-1.07-37.14-6-59.95-31.21-31.08-34.41-24.53-77.74-23.43-84.24a103.76,103.76,0,0,1,18.23-43.21c4.24-5.38,27.34-33.56,67.85-37.81C847.9,1052.4,879.92,1085.79,883.46,1089.62Z" transform="translate(-631.1 -975.9)"/><polygon class="cls-1" points="410.94 248.42 644.49 18.13 703.93 78.26 471.5 309.41 410.94 248.42"/><polygon class="cls-1" points="571.94 248.42 805.49 18.13 864.93 78.26 632.5 309.41 571.94 248.42"/></svg>\n' +
                                '        <h1 style="margin: 20px 0 0 0;font-weight: 100;">Welcome to the Coaching Mate Social Website</h1>' +
                                '    </div>' +
                                '    <div style="padding: 2em;font-size: 20px;font-weight: 200;">' +
                                '        <p>Hi ' +
                                createdUser.firstName +
                                ',</p>' +
                                '        <p>We are glad to have you as part of our community!</p>' +
                                '        <p>Go to <a style="text-decoration: none;color: #ff5c4b;" href="http://localhost:3000/home" >The Coaching Mate Social Website</a> to log in!</p>\n' +
                                '    </div>',
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });

                        res.send(createdUser);
                    } else {
                        console.log(err);
                        res.send(err);
                    }
                });
            });
        });
    }
    //hashing the password and then saving the user.
};

// Function to edit user details
let editUser = async (req, res) => {
    await User.findOne({ userId: req.params.userId })
        .then((user) => {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.interest = req.body.interest;
            user.phone = req.body.phone;
            user.biography = req.body.biography;
            user.profilePicture = req.body.profilePicture;
            user.location = req.body.location;

            user.save()
                .then(() => res.json(user))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => res.json({ success: false, msg: 'Error: ' + err }));
};

// Function to get user by passing userId in params
let getUser = function (req, res) {
    let userId = req.params.userId;
    // Authorization done to check if the user is not accessing the DB without permission
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            console.log(err);
            res.send({ message: 'not allowed' });
        } else {
            User.findOne({ userId: userId }, function (err, user) {
                if (!err) {
                    res.send(user);
                } else {
                    console.log(err);
                    res.send(err);
                }
            });
        }
    });
};

// get user data
let getFollowerData = async (req, res) => {
    try {
        let userId = req.params.userId;

        const user = await User.findOne({ userId });
        res.send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

// get user basic profile data
let getUserBasicData = async (req, res) => {
    try {
        let userId = req.params.userId;

        const user = await User.findOne({ userId }, 'userId profilePicture');

        res.send({ userId: user.userId, profilePicture: user.profilePicture });
    } catch (err) {
        res.status(400).send(err);
    }
};

let getAllFollowersData = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({ userId });

        const followers = await User.find(
            {
                userId: {
                    $in: user.followers,
                },
            },
            'userId firstName lastName profilePicture role followers following'
        );

        res.send(followers);
    } catch (err) {
        res.status(400).send(err);
    }
};

let getAllFollowingUserData = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({ userId });

        const following = await User.find(
            {
                userId: {
                    $in: user.following,
                },
            },
            'userId firstName lastName profilePicture role followers following'
        );

        res.send(following);
    } catch (err) {
        res.status(400).send(err);
    }
};

let updateUnfollowAct = async (req, res) => {
    try {
        const userId = req.params.userId;
        const unfollowUserId = req.params.unfollowUserId;

        const user = await User.findOne({ userId });
        const unfollowedUser = await User.findOne({ userId: unfollowUserId });

        // update user following
        user.following = user.following.filter((u) => u !== unfollowUserId);
        user.markModified('following');

        const savedUser = await user.save();

        // update unfollow user followers list
        unfollowedUser.followers = unfollowedUser.followers.filter(
            (follower) => follower !== userId
        );
        unfollowedUser.markModified('followers');

        const savedUnfollowedUser = await unfollowedUser.save();

        res.send({
            success: true,
            user: savedUser,
            unfollowedUser: savedUnfollowedUser,
        });
    } catch (err) {
        res.send({ success: false, msg: 'Error: ' + err });
    }
};

let updateFollowAct = async (req, res) => {
    try {
        // update user following
        const userId = req.params.userId;
        const followUserId = req.params.followUserId;

        const user = await User.findOne(
            { userId },
            '_id userId firstName lastName profilePicture followers following'
        );
        const followedUser = await User.findOne(
            { userId: followUserId },
            '_id userId firstName lastName profilePicture followers following'
        );

        // add follow user id into current user following list
        user.following = user.following.filter((u) => u !== followUserId);
        user.following.push(followUserId);

        user.markModified('following');

        const savedUser = await user.save();

        // add current user id into followed user followers list
        followedUser.followers = followedUser.followers.filter(
            (follower) => follower !== userId
        );

        followedUser.followers.push(userId);

        followedUser.markModified('followers');

        const savedFollowedUser = await followedUser.save();

        // add trending score for user
        await updateUserTrendingScore(user._id, pointsConfig.follow);
        await updateUserTrendingScore(
            followedUser._id,
            pointsConfig.newFollower
        );

        res.send({
            success: true,
            user: savedUser,
            followedUser: savedFollowedUser,
        });
    } catch (err) {
        res.send({ success: false, msg: 'Error: ' + err });
    }
};

let savePostToSavedList = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({ userId });

        const savePostId = req.params.postId;

        user.saved.push(savePostId);
        user.markModified('saved');

        const savedUser = await user.save();

        res.send({
            success: true,
            user: savedUser,
            saved: user.saved,
        });
    } catch (err) {
        res.send({ success: false, msg: 'Error: ' + err });
    }
};

let unsavePostSavedList = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({ userId });

        const unsavePostId = req.params.postId;

        user.saved = user.saved.filter(
            (pId) => pId.toString() !== unsavePostId
        );
        user.markModified('saved');

        const savedUser = await user.save();

        res.send({
            success: true,
            user: savedUser,
            saved: user.saved,
        });
    } catch (err) {
        res.send({ success: false, msg: 'Error: ' + err });
    }
};

// Function to log in
let login = function (req, res) {
    if (validateEmail(req.body.userId)) {
        User.findOne({
            email: req.body.userId,
        }).then((user) => {
            if (!user) {
                return res.send('That user is not registered');
            }

            // Match password
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    jwt.sign({ user }, 'secretkey', (err, token) => {
                        res.json({
                            token: token,
                            user: user,
                        });
                    });
                } else {
                    return res.send('Password incorrect');
                }
            });
        });
    } else {
        User.findOne({
            userId: req.body.userId,
        }).then((user) => {
            if (!user) {
                return res.send('That user is not registered');
            }

            // Match password
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    jwt.sign({ user }, 'secretkey', (err, token) => {
                        res.json({
                            token: token,
                            user: user,
                        });
                    });
                } else {
                    return res.send('Password incorrect');
                }
            });
        });
    }
};

let socialLogin = async (req, res) => {
    //console.log(req.body.loginDetails.socialType);
    let userObj = "";
    if (req.body.loginDetails.socialType == 'google') {
        userObj = await User.findOne({
            googleId: req.body.loginDetails.socialId,
        });

    }

    else if (req.body.loginDetails.socialType == "facebook") {

        userObj = await User.findOne({
            facebookId: req.body.loginDetails.socialId
        });
    }
    if (userObj) {
        jwt.sign({ userObj }, 'secretkey', (err, token) => {
            res.json({
                success: true,
                token: token,
                user: userObj,
                type: "user find",
            });
        });
    }
    else {
        const findemail = await User.findOne({
            email: req.body.loginDetails.email
        });
        // console.log(findemail);
        if (findemail) {
            if (req.body.loginDetails.socialType == "facebook") {
                findemail.facebookId = req.body.loginDetails.socialId;
            }
            else if (req.body.loginDetails.socialType == "google") {
                findemail.googleId = req.body.loginDetails.socialId;
            }
            jwt.sign({ findemail }, 'secretkey', (err, token) => {
                res.json({
                    success: true,
                    token: token,
                    user: findemail,
                });
            });
            findemail.save();
        }
        else {
            res.json({
                success: false,
                type: "user not find",
            });
        }

    }
}


// Function to check if a user exists by sending userId in params
let userIdExists = function (req, res) {
    let userId = req.params.userId;

    if (validateEmail(userId)) {
        User.findOne({ email: userId }, function (err, user) {
            if (!user) {
                res.send(false);
            } else {
                res.send(true);
            }
        });
    } else {
        User.findOne({ userId }, function (err, user) {
            if (!user) {
                res.send(false);
            } else {
                res.send(true);
            }
        });
    }
};

// Function to change the user's profile picture by userId (sent in params)
let changeProfilePicture = function (req, res) {
    let userId = req.params.userId;

    var form = new formidable.IncomingForm();
    const bucket = storage.bucket(googleConfig.profilePictureBucket);

    form.parse(req, function (err, fields, files) {
        let filetoupload = files.file;

        User.findOne({ userId }, (err, user) => {
            if (!err) {
                if (filetoupload) {
                    let type = mime.lookup(filetoupload.name);
                    let newName = userId + '.' + mime.extensions[type][0];

                    if (user.profilePictureFileName !== '') {
                        bucket
                            .file(user.profilePictureFileName)
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
                                                User.findOneAndUpdate(
                                                    { userId: userId },
                                                    {
                                                        profilePicture:
                                                            data[0].mediaLink,
                                                        profilePictureFileName:
                                                            newName,
                                                    },
                                                    function (err, editedUser) {
                                                        if (!err) {
                                                            res.send(
                                                                'Update success.'
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
                                        User.findOneAndUpdate(
                                            { userId: userId },
                                            {
                                                profilePicture:
                                                    data[0].mediaLink,
                                                profilePictureFileName: newName,
                                            },
                                            function (err, editedUser) {
                                                if (!err) {
                                                    res.send('Upload success.');
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
                    if (user.profilePictureFileName !== '') {
                        bucket
                            .file(user.profilePictureFileName)
                            .delete()
                            .then(() => {
                                User.findOneAndUpdate(
                                    { userId: userId },
                                    {
                                        profilePicture: '',
                                        profilePictureFileName: '',
                                    },
                                    function (err, editedUser) {
                                        if (!err) {
                                            res.send('Delete success.');
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

// Function to update the coaching certificate of a coach based on userId (passed in params)
let updateCertificate = function (req, res) {
    let userId = req.params.userId;

    var form = new formidable.IncomingForm();
    const bucket = storage.bucket(googleConfig.certificateBucket);

    form.parse(req, function (err, fields, files) {
        let filetoupload = files.file;

        User.findOne({ userId }, (err, user) => {
            if (!err) {
                if (filetoupload) {
                    let type = mime.lookup(filetoupload.name);
                    let newName =
                        userId + '_certificate.' + mime.extensions[type][0];

                    if (user.coachingCertificateFile !== '') {
                        bucket
                            .file(user.coachingCertificateFile)
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
                                                User.findOneAndUpdate(
                                                    { userId: userId },
                                                    {
                                                        coachingCertificate:
                                                            data[0].mediaLink,
                                                        coachingCertificateFile:
                                                            newName,
                                                    },
                                                    function (err, editedUser) {
                                                        if (!err) {
                                                            res.send(
                                                                'Update success.'
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
                                        User.findOneAndUpdate(
                                            { userId: userId },
                                            {
                                                coachingCertificate:
                                                    data[0].mediaLink,
                                                coachingCertificateFile:
                                                    newName,
                                            },
                                            function (err, editedUser) {
                                                if (!err) {
                                                    res.send('Upload success.');
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
                    if (user.coachingCertificateFile !== '') {
                        bucket
                            .file(user.coachingCertificateFile)
                            .delete()
                            .then(() => {
                                User.findOneAndUpdate(
                                    { userId: userId },
                                    {
                                        coachingCertificate: '',
                                        coachingCertificateFile: '',
                                    },
                                    function (err, editedUser) {
                                        if (!err) {
                                            res.send('Delete success.');
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

let updateUserTrendingScore = async (currUserId, point) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        const currDateTrending = await Trending.findOne({
            date,
            type: 'user',
            itemId: currUserId,
        });

        if (currDateTrending) {
            currDateTrending.point += point;
            console.log('currdatetrending after = ' + currDateTrending);
            await currDateTrending.save();
        } else {
            const newTrending = new Trending({
                date,
                type: 'user',
                itemId: currUserId,
                point,
            });

            console.log('newTrending = ' + newTrending);

            await newTrending.save();
        }
    } catch (err) {
        console.log(err);
    }
};


module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.getFollowerData = getFollowerData;
module.exports.getUserBasicData = getUserBasicData;
module.exports.getAllFollowersData = getAllFollowersData;
module.exports.getAllFollowingUserData = getAllFollowingUserData;
module.exports.updateUnfollowAct = updateUnfollowAct;
module.exports.updateFollowAct = updateFollowAct;
module.exports.savePostToSavedList = savePostToSavedList;
module.exports.unsavePostSavedList = unsavePostSavedList;
module.exports.userIdExists = userIdExists;
module.exports.editUser = editUser;
module.exports.login = login;
module.exports.changeProfilePicture = changeProfilePicture;
module.exports.updateCertificate = updateCertificate;
module.exports.socialLogin = socialLogin;
