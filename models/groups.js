/**
 * =======================================
 * SCHEMA OF GROUPS (WITH MONGOOSE)
 * =======================================
 * @date created: 23 August 2019
 * @authors: Hasitha Dias
 *
 * The models/groups.js is used for establishing the 'groups' schema and types using mongoose
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * coverPhoto and coverPhotoFileName: Store information about the cover picture of group
 * interest: Store the interest (eg. Running, Walking, Football, etc) of the group
 * members: Store the userIds of users that are members of the group
 */
const groupsSchema = Schema({
    creatorId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true, trim: true },
	slug: { type: String, required: true, unique: true, trim: true },
	description: { type: String, required: true },
	logo: { type: String, required: false },
	coverPhoto: { type: String, required: false },
	type: { type: String, required: true, default: 'open' },
	status: { type: String, required: true },
	membersCount: { type: Number, required: true, default: 0 },
	memberRequestsCount: { type: Number, required: true, default: 0 },
	interest: {type: String, required:true}
});

module.exports = mongoose.model('groups', groupsSchema);