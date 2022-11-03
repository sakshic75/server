const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MembershipsSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	creatorId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true, trim: true },
	slug: { type: String, required: true, unique: true, trim: true },
	description: { type: String, required: false },
	logo: { type: String, required: false },
	coverPhoto: { type: String, required: false },
	isPublic: { type: String, required: true, default: 'yes' },
	type: { type: String, required: true, default: 'free' },	//free or paid
	paymentType: { type: String, required: true, default: 'permanent' },	//permanent or finite or range or recurring
	intervalType: { type: String, required: false },	//days or weeks or months or years
	interval: { type: Number, required: false },
	startDate: {type: Date, required: false },
	endDate: {type: Date, required: false },
	totalPayments: { type: Number, required: false },
	status: { type: String, required: true, default: 'active' },	//active or inactive
	trial: { type: Boolean, required: false, default: false },		//true or false
	trialType: { type: String, required: false },					//days or weeks or months or years
	trialPeriod: { type: Number, required: false, default: 0 },
	price: { type: Schema.Types.Decimal128, required: false },
	discountPrice: { type: Schema.Types.Decimal128, required: false },
	order: { type: Number, required: true, default: 1 },
	membersCount: { type: Number, required: true, default: 0 },
	memberRequestsCount: { type: Number, required: true, default: 0 },
	subscribeWithoutMembership: { type: Boolean, required: true, default: true },		//true or false
	updateDenied: { type: [Schema.Types.ObjectId], required: false },
	updateReplace: { type: [Schema.Types.ObjectId], required: false },
	coaches: { type: [Schema.Types.ObjectId], required: false },
}, {
	timestamps: true
});

module.exports = mongoose.model('Memberships', MembershipsSchema);