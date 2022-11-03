const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionActivityTypesSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true, trim: true },
	value: { type: String, required: true },
	imgUrl: { type: String, required: true },
	color: { type: String, required: true }
}, {
	timestamps: true
});

module.exports = mongoose.model('SessionActivityTypes', SessionActivityTypesSchema);