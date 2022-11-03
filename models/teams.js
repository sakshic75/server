const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamsSchema = new Schema(
    {
        creatorId: { type: Schema.Types.ObjectId, required: true },
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: false },
        address: { type: String, required: true },
        cityStateCountry: { type: String, required: false },
        addressLat: { type: String, required: false },
        addressLng: { type: String, required: false },
        activityType: { type: String, required: true },
        logo: { type: String, required: false },
        coverPhoto: { type: String, required: false },
        documents: { type: [String], required: false },
        type: { type: String, required: true, default: 'open' },
        status: { type: String, required: true },
        membersCount: { type: Number, required: true, default: 0 },
        memberRequestsCount: { type: Number, required: true, default: 0 },
        coaches: { type: [Schema.Types.ObjectId], required: false },
        moderators: { type: [Schema.Types.ObjectId], required: false },
        administrators: { type: [Schema.Types.ObjectId], required: false },
        banned: { type: [Schema.Types.ObjectId], required: false },
        phone: { type: Number, required: false },
        hideAddress: { type: Boolean, default: false },
        operatingTimings: { type: [String], required: false },
        operatingStartHours: { type: String, required: false },
        operatingEndHours: { type: String, required: false },
        postRestriction: {
            type: String,
            default: 'allowMembers',
            required: false,
        },
        postReqApproval: { type: Boolean, default: true, required: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Teams', TeamsSchema);
