const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MembershipPlannersSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	membershipId: { type: Schema.Types.ObjectId, required: true },
	plannerId: { type: Schema.Types.ObjectId, required: true },
	levelId: { type: Schema.Types.ObjectId, required: true },
}, {
	timestamps: true
});

module.exports = mongoose.model('MembershipPlanners', MembershipPlannersSchema);