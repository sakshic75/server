const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrackerSchema = Schema({
    userId: { type: String, required: true },
    itemsId: { type: [Schema.Types.ObjectId], required: true },
});

module.exports = mongoose.model('Tracker', TrackerSchema);
