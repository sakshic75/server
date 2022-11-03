const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bodySrengthSchema = new Schema({
	title: { type: String, required: true },
	icon: { type: String, required: false }
});

const ExercisesSchema = new Schema({
	clubId: { type: String, required: false },
	title: { type: String, required: true},
	description: { type: String, required: true },
	components: [{type: String,required:true}],
	tips: { type: String, required: true },
	pic1: { type: String, required: false },
	pic2: { type: String, required: false },
	pic3: { type: String, required: false },
	video: { type: String, required: false },
	bodystrenght:{ type:bodySrengthSchema, required: true },
	bodySelection: { type:String , required: false },
	type: { type: String, required: true, trim: true, enum: ['flexibility', 'exercise'] },
	addedBy: { type: String, required: false }
}, {
	timestamps: true
});

module.exports = mongoose.model('exercises', ExercisesSchema);