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

/**
 * coverPhoto and coverPhotoFileName: Store information about the cover picture of group
 * interest: Store the interest (eg. Running, Walking, Football, etc) of the group
 * members: Store the userIds of users that are members of the group
 */
const phasesSchema = mongoose.Schema({
    name: { type: String, required:true},
   
    colorcode: {type: String, required:true,unique:false},
});

module.exports = mongoose.model('phases', phasesSchema);