const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const units_b = new Schema({
	unit_a_id: { type: String, required: true },
	unit_a_name: { type: String, required: true },
	unit_b_name: { type: String, required: true },
	sets: { type: Number, required: true },
});

module.exports = mongoose.model('units_b', units_b);