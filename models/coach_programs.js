const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CoachProgramsSchema = new Schema({
	title: { type: String, required: true, unique: true, trim: true },
	startDate: { type: String, required: true },
	activityType: [{
		type: [String],
		required:true
	}],
	athleteLevel: [{
		type: [String],
		required:true
	}],
	programPhase: { type:[String], required: true },
});

module.exports = mongoose.model('coach_programs', CoachProgramsSchema);