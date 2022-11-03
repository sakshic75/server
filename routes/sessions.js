const router = require('express').Router();
const mongoose = require('mongoose');
// const Session = mongoose.model('Sessions');
//su modify
const Session = mongoose.model('AddSessions');
const FamilyNames = mongoose.model('FamilyNames');
const SessionActivityTypes = mongoose.model('SessionActivityTypes');
const SessionSportsKeywords = mongoose.model('SessionSportsKeywords');
const SessionComponents = mongoose.model('SessionComponents');

const multer = require('multer');
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
        cb(null, 'uploads/session')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});
var upload = multer({ storage: storage });

router.route('/uploadImage').post(upload.single('sessImage'), async (req, res) => {
	const file = req.file;
	if(!file){
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        //return next(error);
    }
    res.send(file);
});
//su modify
router.route('/').get((req, res) => {
	Session.find()
		.then(sessions => res.json({success: true, sessions}))
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});

router.route('/getByTeam/:teamId').get((req, res) => {
	Session.find({clubId: req.params.teamId})
		.then(sessions => res.json({success: true, sessions}))
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});

router.route('/:clubId/addSessionData/:id').get(async (req, res) => {
	const clubId = req.params.clubId;
	const familyNames = await FamilyNames.find({clubId});
	const sessionActivityTypes = await SessionActivityTypes.find({clubId});
	const sessionSportsKeywords = await SessionSportsKeywords.find({clubId});
	const sessionComponents = await SessionComponents.find({clubId});
	let session = '';
	if(req.params.id != 'add')
		session = await Session.findOne({_id: req.params.id, clubId});
	
	res.json({success: true, familyNames, sessionActivityTypes, sessionSportsKeywords, sessionComponents, session})
});

router.route('/add').post(async (req, res) => {
	const oldSession = await Session.find({title: req.body.title});
	if(oldSession.length > 0){
		res.json({success: false, msg: 'Error: Session with this title already exists'});
	}
	else{
		let session = req.body;
		
		let sessionActivityType = await SessionActivityTypes.findOne({'_id': session.activityType});
		delete sessionActivityType.clubId;
		session.activityType = sessionActivityType;
		
		const newSession = new Session(session);
		newSession.save()
			.then(() => res.json({success: true, msg: 'Session added!'}))
			.catch(err => res.status(400).json({success: false, msg: 'Error: '+err}));
	}
});

router.route('/:id').get((req, res) => {
	Session.findById(req.params.id)
		.then(session => res.json(session))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').delete((req, res) => {
	Session.findByIdAndDelete(req.params.id)
		.then(() => res.json('Session deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/update/:id').post(async (req, res) => {
	const oldSession = await Session.find({_id: {$ne: req.params.id}, title: req.body.title});
	if(oldSession.length > 0){
		res.json({success: false, msg: 'Error: Session with this title already exists'});
	}
	else{
		let sessionActivityType = await SessionActivityTypes.findOne({'_id': req.body.activityType});
		delete sessionActivityType.clubId;
		
		Session.findById(req.params.id)
			.then(session => {
				session.title = req.body.title;
				session.unit = req.body.unit;
				session.distance = req.body.distance;
				session.hours = req.body.hours;
				session.minutes = req.body.minutes;
				session.sessTime = req.body.sessTime;
				session.familyName = req.body.familyName;
				session.lathleteLevel = req.body.athleteLevel;
				session.description = req.body.description;
				session.keywords = req.body.keywords;
				session.activityType = sessionActivityType;
				session.rpeLoad = req.body.rpeLoad;
				session.image = req.body.image;
				session.videos = req.body.videos;
				session.sessionType = req.body.sessionType;
				session.sportsKeywords = req.body.sportsKeywords;
				session.components = req.body.components;
				session.perceivedEfforts = req.body.perceivedEfforts;
				
				session.save()
					.then(() => res.json({success: true, msg: 'Session updated!'}))
					.catch(err => res.json({success: false, msg: 'Error: '+err}));
			})
			.catch(err => res.json({success: false, msg: 'Error: '+err}));
	}
});

module.exports = router;