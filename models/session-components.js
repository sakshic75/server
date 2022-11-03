const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionComponentsSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true, trim: true },
	showInSearch: { type: Boolean, required: true }
}, {
	timestamps: true
});

module.exports = mongoose.model('SessionComponents', SessionComponentsSchema);