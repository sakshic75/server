const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bodySrengthSchema = new Schema({
	title: { type: String, required: true },
	icon: { type: String, required: false }
});

module.exports = mongoose.model('bodystrenght', bodySrengthSchema);