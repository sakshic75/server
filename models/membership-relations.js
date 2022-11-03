const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MembershipRelationshipsSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	userId: { type: Schema.Types.ObjectId, required: true },
	membershipId: { type: Schema.Types.ObjectId, required: true },
	gatewayId: { type: String, required: true },
	type: { type: String, required: true, default: 'free' },	//free or paid
	paymentType: { type: String, required: true, default: 'permanent' },	//permanent or finite or range or recurring
	intervalType: { type: String, required: false },	//days or weeks or months or years
	interval: { type: Number, required: false },
	startDate: {type: Date, required: false },
	expireDate: {type: Date, required: false },
	totalPayments: { type: Number, required: false },
	status: { type: String, required: true, default: 'active' },	//pending or active or cancelled or deactivated
	trialCompleted: { type: Boolean, required: false, default: false },		//true or false
	trialExpireDate: {type: Date, required: false },
	price: { type: Schema.Types.Decimal128, required: false },
	currentInvoiceNumber: { type: Number, required: true, default: 1 },
	coachId: { type: Schema.Types.ObjectId, required: false },
	athleteLevel: { type: Schema.Types.ObjectId, required: false },
	coach: { type: Schema.Types.ObjectId, required: false },
}, {
	timestamps: true
});

module.exports = mongoose.model('membership-relations', MembershipRelationshipsSchema);