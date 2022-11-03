const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MembershipLevelsSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	levelName: { type: String, required: true },
	defaultLevel: { type: Boolean, required: false, default: false }
}, {
	timestamps: true
});

module.exports = mongoose.model('MembershipLevels', MembershipLevelsSchema);