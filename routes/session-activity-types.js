const router = require('express').Router();
const mongoose = require('mongoose');
const SessionActivityTypes = mongoose.model('SessionActivityTypes');

router.route('/').get((req, res) => {
	SessionActivityTypes.find()
		.then(sessionActivityTypes => res.json({success: true, sessionActivityTypes}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/club/:clubId').get((req, res) => {
	SessionActivityTypes.find({clubId: req.params.clubId})
		.then(sessionActivityTypes => res.json({success: true, sessionActivityTypes}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/add').post((req, res) => {
	let clubId = req.body.clubId;
	let title = req.body.title;
	let value = req.body.value;
	let imgUrl = req.body.imgUrl;
	let color = req.body.color;
	
	const newSessionActivityType = new SessionActivityType({clubId, title, value, imgUrl, color});
	
	newSessionActivityType.save()
		.then(() => res.json('Session Activity Type added!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').get((req, res) => {
	SessionSportsKeywords.findById(req.params.id)
		.then(sessionActivityType => res.json(sessionActivityType))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').delete((req, res) => {
	SessionSportsKeywords.findByIdAndDelete(req.params.id)
		.then(() => res.json('Session Activity Type deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

module.exports = router;