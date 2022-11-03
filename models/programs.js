const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgramActivitySchema = new Schema({
	activity_id: { type: String, required: true },
	activity_name: { type: String, required: true, trim: true }
});
const ProgramPhaseSchema = new Schema({
	name: { type: String, required: false},
	colorcode: { type: String, required: false}	
});

const SessionExercisesSchema = new Schema({
	exerciseAssocId: { type: Schema.Types.ObjectId, required: true },
	sets: { type: String, required: false },
	unita: { type: String, required: false },
	unitb: { type: String, required: false }
});

const ProgramSessionsSchema = new Schema({
	sessionId: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true },
	unit: { type: String, required: false, default: '' },
	distance: { type: Schema.Types.Decimal128, required: false, default: 0 },
	hours: { type: Number, required: true },
	minutes: { type: Number, required: true },
	sessTime: { type: Number, required: true, default: 0 },
	rpeLoad: { type: Number, required: true },
	sessionType: { type: String, required: true },
	activityType: { type: String, required: true },
	color: { type: String, required: true },
	icon: { type: String, required: true },
	exercisesTotal: { type: Number, required: false },
	days: { type: Number, required: true },
	order: { type: Number, required: true },
	sessionTime: { type: Number, required: true, default: 0 },
	sessionURL: { type: String, required: false, default: '' },
	exercisesData: { type: [SessionExercisesSchema], required: false }
});

const ProgramsSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: false },
	title: { type: String, required: true, unique: true, trim: true },
	slug: { type: String, required: false},
	phase: { type: ProgramPhaseSchema, required: true},
	activityType: {type: [ProgramActivitySchema],required:true},
	level: { type: [String], required: true },
	weeks: { type: Number, required: true, default: 1 },
	startDate: { type: String, required: false,default:Date.now() },
	addedBy: { type: String, required: false },
	sessions: { type: [ProgramSessionsSchema], required: false }
}, {
	timestamps: true
});

module.exports = mongoose.model('Programs', ProgramsSchema);