const router = require('express').Router();
const mongoose = require('mongoose');
const Session = mongoose.model('workoutgrades');
router.route('/insert').get((req, res) => {
	Session.find()
		.then(sessions => res.json({success: true, sessions}))
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});


module.exports = router;