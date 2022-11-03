const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExercisesDataSchema = new Schema({
	exerciseAssocId: { type: String, required: false },
	sets1: { type: String, required: false },
	unita1: { type: String, required: false },
	unitb1: { type: String, required: false },
	sets2: { type: String, required: false },
	unita2: { type: String, required: false },
	unitb2: { type: String, required: false },
	sets3: { type: String, required: false },
	unita3: { type: String, required: false },
	unitb3: { type: String, required: false }
});

const SessionsDataSchema = new Schema({
	sessionAssocId: { type: Schema.Types.ObjectId, required: false },
	exercisesData: { type: [ExercisesDataSchema], required: false }
	
});
const ProgramsDataSchema = new Schema({
	programId: { type: Schema.Types.ObjectId, required: false },
	sessionsData: { type: [SessionsDataSchema], required: false }
});
const AthleteStrengthDataSchema = new Schema({
	clubId: { type: Schema.Types.ObjectId, required: true },
	athleteId: { type: String, required: true },
	plannerId: { type: Schema.Types.ObjectId, required: true },
	programsData:  { type: [ProgramsDataSchema], required: false }
}, {
	timestamps: true
});

module.exports = mongoose.model('athlete_strength_data', AthleteStrengthDataSchema);