const router = require('express').Router();
const mongoose = require('mongoose');
const FamilyNames = mongoose.model('FamilyNames');

router.route('/').get((req, res) => {
	FamilyNames.find()
		.then(familyNames => res.json({success: true, familyNames}))
		.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
});

router.route('/add').post((req, res) => {
	let clubId = req.body.clubId;
	let name = req.body.name;
	
	const newFamilyName = new FamilyNames({clubId, name});
	
	newFamilyName.save()
		.then(() => res.json('Family Name added!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').get((req, res) => {
	FamilyNames.findById(req.params.id)
		.then(familyName => res.json(familyName))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').delete((req, res) => {
	FamilyNames.findByIdAndDelete(req.params.id)
		.then(() => res.json('Family Name deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

module.exports = router;