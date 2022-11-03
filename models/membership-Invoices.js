const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MembershipInvoicesSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	userId: { type: Schema.Types.ObjectId, required: true },
	membershipId: { type: Schema.Types.ObjectId, required: true },
	relationshipId: { type: Schema.Types.ObjectId, required: true },
	gatewayId: { type: String, required: true },
	InvoiceNumber: { type: Number, required: true, default: 1 },
	type: { type: String, required: true, default: 'free' },	//free or paid
	invoiceDate: {type: Date, required: false },
	payDate: {type: Date, required: false },
	totalPayments: { type: Number, required: false },
	invoiceStatus: { type: String, required: true, default: 'pending' },	//pending or paid
	price: { type: Schema.Types.Decimal128, required: false },
	currentInvoiceNumber: { type: Number, required: true, default: 1 },
}, {
	timestamps: true,
});

module.exports = mongoose.model('MembershipInvoices', MembershipInvoicesSchema);