const router = require('express').Router();
const mongoose = require('mongoose');
const SessionSportsKeywords = mongoose.model('SessionSportsKeywords');

router.route('/').get((req, res) => {
	SessionSportsKeywords.find()
		.then(sessionSportsKeywords => res.json({success: true, sessionSportsKeywords}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/club/:clubId').get((req, res) => {
	SessionSportsKeywords.find({clubId: req.params.clubId})
		.then(sessionSportsKeywords => res.json({success: true, sessionSportsKeywords}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/add').post((req, res) => {
	let clubId = req.body.clubId;
	let title = req.body.title;
	let group = req.body.group;
	let showInSearch = req.body.showInSearch;
	
	const newSessionSportsKeyword = new SessionSportsKeywords({clubId, title, group, showInSearch});
	
	newSessionSportsKeyword.save()
		.then(() => res.json('Session sports keyword added!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').get((req, res) => {
	SessionSportsKeywords.findById(req.params.id)
		.then(sessionSportsKeyword => res.json(sessionSportsKeyword))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').delete((req, res) => {
	SessionSportsKeywords.findByIdAndDelete(req.params.id)
		.then(() => res.json('Session sports keyword deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

module.exports = router;