const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSportsKeywordsSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true, trim: true },
	group: { type: String, required: false },
	showInSearch: { type: Boolean, required: true }
}, {
	timestamps: true
});

module.exports = mongoose.model('SessionSportsKeywords', SessionSportsKeywordsSchema);