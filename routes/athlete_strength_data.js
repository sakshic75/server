const router = require('express').Router();
const mongoose = require('mongoose');
const AthleteStrengthData1 = mongoose.model('athlete_strength_data');


router.route('/').post((req, res) => {
	AthleteStrengthData1.find()
		.then(strengthData1 => res.json(strengthData1))
		.catch(err => res.status(400).json('Error: '+err));
});


module.exports = router;