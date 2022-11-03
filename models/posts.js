/**
 * =======================================
 * SCHEMA OF POSTS (WITH MONGOOSE)
 * =======================================
 * @date created: 24 August 2019
 * @authors: Waqas Rehmani, Hasitha Dias and Jay Parikh
 *
 * The models/posts.js is used for establishing the 'posts' schema and types using mongoose
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const repliesSchema = mongoose.Schema({
    replyId: { type: Number, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    time: { type: Date, default: Date.now, required: true },
    likes: [String],
    dislikes: [String],
});

/**
 * The commentsSchema is used inside the postsSchema
 *
 * likes: array of userIds that have liked a particular comment with the given 'commentId'
 */
const commentsSchema = mongoose.Schema({
    commentId: { type: Number, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    time: { type: Date, default: Date.now, required: true },
    replies: [repliesSchema],
    likes: [String],
    dislikes: [String],
    accepted: Boolean,
});

/**
 * kudos: json object that stores arrays of userIds for 'likes', 'backSlaps' and 'bumSlaps'
 * isQuestion: If the given post is a question or not
 * section: Differentiate between general posts and other posts [type {groups, events or general posts} and,
 *          Id {groupId, eventId or general postId}]
 * asset and assetFileName: Store information about the image of the post
 * interest: Store the interest (eg. Running, Walking, Football, etc) of the post
 * role: Athlete or Coach
 * type: text or image
 * comments: Stores an array of comments that are defined by the commentsSchema
 */
const postsSchema = mongoose.Schema({
    postId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    userId: { type: String, required: true },
    type: { type: String, required: true },
    isQuestion: { type: Boolean, required: true, default: false },
    kudos: {
        likes: [String],
        bumSlaps: [String],
        backSlaps: [String],
    },
    section: {
        type: { type: String, required: true },
        id: { type: String },
        category: { type: String },
    },
    description: String,
    role: String,
    asset: { type: String, trim: true },
    imgFileName: { type: [String] },
    videoFileName: { type: [String] },
    comments: [commentsSchema],
    interest: {
        id: { type: Schema.Types.ObjectId, required: true },
        icon: { type: String, required: true },
        name: { type: String, required: true },
    },
    status: {
        type: String,
        default: 'active',
        required: false,
    },
    time: Date,
});

module.exports = mongoose.model('posts', postsSchema);
