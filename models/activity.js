const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ActivitySchema = new Schema({
	title: { type: String, required: true, unique: true, trim: true },
	activity_image: { type: String, required: true },
	activity_icon: { type: String, required: false },
});

module.exports = mongoose.model('activity', ActivitySchema);