/**
 * =======================================
 * SCHEMA OF EVENTS (WITH MONGOOSE)
 * =======================================
 * @date created: 24 August 2019
 * @authors: Jay Parikh
 *
 * The models/events.js is used for establishing the 'events' schema and types using mongoose
 */


const mongoose = require('mongoose');

/**
 * groupEvent: Stores the groupId of the group that it is a part of
 * eventAsset and eventAssetFileName: Store information about the cover picture of events
 * eventType: Store the interest (eg. Running, Walking, Footballna, etc) of the event
 * attending and interested: Store the userIds of users that are attending or interested in the event
 */
const eventsSchema = mongoose.Schema({
    eventId: { type: String, required: true, lowercase: true, unique: true, trim: true},
    name: {type: String, required:true},
    owner: {type: String, required:true},
    groupEvent: {type: String},
    time: {type: Date, default: Date.now, required: true},
    eventAsset: {type: String},
    eventAssetFileName: {type: String},
    eventType: {type: String, required:true},
    location: {
        lat: Number,
        lng: Number
    },
    description: {type: String, required:true},
    attending: [String],
    interested: [String]
});


module.exports = mongoose.model('events', eventsSchema);