const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionFamilySchema = new Schema({
	_id: { type: Schema.Types.ObjectId, required: false },
	name: { type: String, required: false }
});

/*const SessionLevelSchema = new Schema({
	name: { type: String, required: true, unique: true, trim: true },
	value: { type: String, required: true, unique: true, trim: true }
});*/
const ExerciseSchema = new Schema({
	exercise_id: { type: String, required: true },
	title: { type: String, required: false },
	pic1: { type: String, required: false },
	pic2: { type: String, required: false },
	pic3: { type: String, required: false },
	type: { type: String, required: false },
	note_id: { type: String, required: false },
	note_value: { type: String, required: false },
	unit_a_value: { type: String, required: true },
	unit_b_value: { type: String, required: false },
	strength_body_img: { type: String, required: false },
	order: { type: Number, required: false },
	note_value: { type: String, required: false }
});
const SessionActivitySchema = new Schema({
	_id: { type: Schema.Types.ObjectId, required: true },
	title: { type: String, required: true, trim: true },
	value: { type: String, required: true, trim: false },
	imgUrl: { type: String, required: true, trim: true },
	color: { type: String, required: true, trim: true }
});

/*const SessionEffortsSchema = new Schema({
	id: { type: Number, required: true, unique: true },
	value: { type: Number, required: true },
	duration: { type: Number, required: true }
});*/


const SessionsSchema = new Schema({
	title: { type: String, required: true, unique: true, trim: true },
	clubId: { type: Schema.Types.ObjectId, required: true },
	unit: { type: String, required: false, default: '' },
	distance: { type: Schema.Types.Decimal128, required: true, default: 0 },
	hours: { type: Number, required: true },
	minutes: { type: Number, required: true },
	sessTime: { type: Number, required: true },
	familyName: { type: SessionFamilySchema, required: false },
	athleteLevel: { type: [String], required: false },
	description: { type: String, required: true },
	keywords: { type: [String], required: true },
	activityType: { type: SessionActivitySchema, required: true },
	rpeLoad: { type: Number, required: true, default: 0 },
	image: { type: String, required: false },
	videos: { type: [String], required: false },
	sessionType: { type: String, required: true, enum: ['normal', 'strength'], default: 'normal' },
	exType: { type: String, required: false },
	rpe: { type: Schema.Types.ObjectId, required: false },
	addedBy: { type: String, required: true },
	sportsKeywords: { type: [Schema.Types.ObjectId], required: false },
	components: { type: [Schema.Types.ObjectId], required: false },
	perceivedEfforts: { type: [Number], required: false },
	exercises: { type: [ExerciseSchema], required: false }
}, {
	timestamps: true
});

module.exports = mongoose.model('Sessions', SessionsSchema);