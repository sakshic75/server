const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//chart data  zy
//fileds add zy
const AddSeesionsSchema = new Schema({
	title: { type: String, required: true },
	familyName: { type: String},
	activityType: { type: String},
	athleteLevel: { type: String},
	sportsKeyWords: { type: String},
	components: { type: String},
	chartData:{type: Array},
	totalDuration: {type: Number},
	totalLoad: {type: Number},
	clubId:{type:Schema.Types.ObjectId},
	addedBy:{type:String},
	description:{type:String},
	videos:{type:Array},
	image:{type:String},
	tags:{type:String},
	hasWarmCool:{type:Boolean},
	hasWarm:{type:Boolean},
	hasCool:{type:Boolean},
	stageType:{type:String},
	desJson:{type:String},
	time: { type: Date, default: Date.now},
	steps: {type:Array}
}, {
	timestamps: true
});

module.exports = mongoose.model('AddSessions', AddSeesionsSchema);