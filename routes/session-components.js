const router = require('express').Router();
const mongoose = require('mongoose');
const SessionComponents = mongoose.model('SessionComponents');

router.route('/').get((req, res) => {
	SessionComponents.find()
		.then(sessionComponents => res.json({success: true, sessionComponents}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/club/:clubId').get((req, res) => {
	SessionComponents.find({clubId: req.params.clubId})
		.then(sessionComponents => res.json({success: true, sessionComponents}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/add').post((req, res) => {
	let clubId = req.body.clubId;
	let title = req.body.title;
	let showInSearch = req.body.showInSearch;
	
	const newSessionComponent = new SessionComponents({clubId, title, showInSearch});
	
	newSessionComponent.save()
		.then(() => res.json('Session component added!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').get((req, res) => {
	SessionComponents.findById(req.params.id)
		.then(sessionComponent => res.json(sessionComponent))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').delete((req, res) => {
	SessionComponents.findByIdAndDelete(req.params.id)
		.then(() => res.json('Session component deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

module.exports = router;