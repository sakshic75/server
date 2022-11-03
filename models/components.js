const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ComponentsSchema = new Schema({
	name: { type: String, required: true, unique: true, trim: true },
	show_advance_search: { type: String, unique: false,required: true },
});

module.exports = mongoose.model('components', ComponentsSchema);