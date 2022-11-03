const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FamilyNamesSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	name: { type: String, required: true, trim: true }
}, {
	timestamps: true
});

module.exports = mongoose.model('FamilyNames', FamilyNamesSchema);