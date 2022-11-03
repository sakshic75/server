const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WorkoutGrades = new Schema({
    _id: { type: Schema.Types.ObjectId, required: false },
	session_id: { type: String, required: true },
	exercise_id: { type: String, required: false },
	program_id: { type: String, required: true },
	unit_a_value: { type: String, required: true },
	unit_b_value: { type: String, required: true },
	sets: { type: String, required: true },
});

module.exports = mongoose.model('workoutgrades', WorkoutGrades);