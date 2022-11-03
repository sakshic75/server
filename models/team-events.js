const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamEventsSchema = Schema({
    creatorId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: false },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    location: { type: String, required: true },
    interest: {
        id: { type: Schema.Types.ObjectId, required: true },
        icon: { type: String, required: true },
        name: { type: String, required: true },
    },
    logo: { type: String, required: false },
    moduleType: { type: String, required: true }, //team or group or user
    moduleId: { type: Schema.Types.ObjectId, required: false },
    status: { type: String, required: true }, //active or inactive
    attending: { type: [Schema.Types.ObjectId] },
    interested: { type: [Schema.Types.ObjectId] },
    time: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('team_events', TeamEventsSchema);
