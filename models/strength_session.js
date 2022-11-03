const mongoose = require('mongoose');
const Exercises = require('./exercises.js')
const Rpe = require('./rpe.js')
const Activity = require('./activity.js')
const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
	exercise_id: { type: String, required: true },
	title: { type: String, required: false },
	pic1: { type: String, required: false },
	type: { type: String, required: false },
	note_id: { type: String, required: false },
	note_value: { type: String, required: false },
	unit_a_value: { type: String, required: true },
	unit_b_value: { type: String, required: false },
	order: { type: Number, required: false }
});
const ActivitySchema = new Schema({
	activity_id: { type: String, required: true },
	title: { type: String, required: true },
	activity_image: { type: String, required: true },
});
const StrengthSessionSchema = new Schema({
	clubId: { type: Number, required: false },
	title: { type: String, required: true },
	keywords: { type: String, required: true },
	exercise_type: { type: String, required: false },
	activity_type:  { type:ActivitySchema, required: true },
	total_time_hours: { type: String, required: true },
	total_time_min: { type: String, required: true },
	rpe: { type: mongoose.Schema.Types.ObjectId, ref: 'Rpe', required: true },
	load: { type: String, required: true },
	comment: { type: String, required: false },
	session_exercises: { type: [ExerciseSchema], required: false },
}, {
	timestamps: true
});

module.exports = mongoose.model('strength_sessions', StrengthSessionSchema);