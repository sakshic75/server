const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrendingSchema = Schema({
    date: { type: Date, required: true },
    type: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    point: { type: Number, required: true },
});

module.exports = mongoose.model('Trending', TrendingSchema);
