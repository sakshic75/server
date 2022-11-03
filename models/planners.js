const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlannerProgramsSchema = new Schema({
	programId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true },
	color: { type: String, required: true },
	startDate: { type: Date, required: true },
	layer: { type: Number, required: true },
	weeks: { type: Number, required: true },
	athleteId: { type: Schema.Types.ObjectId, required: false }
});

const PlannerCompetitionsSchema = new Schema({
	title: { type: String, required: true },
	type: { type: String, required: true },
	compDate: { type: Date, required: true }
});

const PlannersSchema = new Schema({
	title: { type: String, required: true, trim: true },
	slug: { type: String, required: true, trim: true },
	clubId: { type: Schema.Types.ObjectId, required: true },
	startingDate: { type: Date, required: true },
	endInterval: { type: Number, required: true },
	displayCountdown: { type: String, required: true, trim: true, enum: ['yes', 'no'], default: 'yes' },
	reverseCountdown: { type: String, required: true, trim: true, enum: ['yes', 'no'], default: 'yes' },
	tcStartDate: { type: Date, required: false },
	tcInterval: { type: Number, required: true },
	programs: { type: [PlannerProgramsSchema], required: false },
	competitions: { type:[PlannerCompetitionsSchema], required: false },
	addedBy: { type: String, required: true }
}, {
	timestamps: true
});

module.exports = mongoose.model('Planners', PlannersSchema);