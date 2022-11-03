const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const units_a = new Schema({
	name: { type: String, required: true },
});

module.exports = mongoose.model('units_a', units_a);