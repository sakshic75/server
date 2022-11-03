const router = require('express').Router();
const mongoose = require('mongoose');
const Program = mongoose.model('Programs');
const Session = mongoose.model('Sessions');
const Planner = mongoose.model('Planners');

router.route('/').get((req, res) => {
	Program.find()
		.then(programs => res.json(programs))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/add').post((req, res) => {
	let title = req.body.title;
	let slug = req.body.slug;
	let clubId = req.body.clubId;
	let phase = req.body.phase;
	let activityType = req.body.activityType;
	let level = req.body.level;
	let weeks = req.body.weeks;
	let startDate = req.body.startDate;
	let addedBy = req.body.addedBy;
	
	const newProgram = new Program({title, slug, clubId, phase, activityType, level, weeks, startDate, addedBy});
	
	newProgram.save()
		.then(() => res.json('Program added!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').get((req, res) => {
	Program.findById(req.params.id)
		.then(program => res.json(program))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/:id').delete((req, res) => {
	Program.findByIdAndDelete(req.params.id)
		.then(() => res.json('Program deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/update/:id').post((req, res) => {
	Program.findById(req.params.id)
		.then(program => {
			program.title = req.body.title;
			program.slug = req.body.slug;
			program.clubId = req.body.clubId;
			program.phase = req.body.phase;
			program.activityType = req.body.activityType;
			program.level = req.body.level;
			program.weeks = req.body.weeks;
			program.startDate = req.body.startDate;
			program.addedBy = req.body.addedBy;
			
			program.save()
				.then(() => res.json('Program updated!'))
				.catch(err => res.status(400).json('Error: '+err));
		})
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/add_sessions/:id').post(async (req, res) => {
	let plannerProgram = await Planner.findOne({_id: req.body.plannerId}, {programs: {$elemMatch: {programId: req.params.id}}});
	if(plannerProgram.programs.length > 0){
		let daysDiff = 0;
		let programDate = new Date(plannerProgram.programs[0].startDate);
		let sessDate = new Date(req.body.sessionDate);
		let timeDiff = sessDate - programDate;
		if(timeDiff > 0)
			daysDiff = timeDiff / (1000 * 60 * 60 * 24);
		
		let session = await Session.findById(req.body.sessionId);
		
		let newSession = {
			sessionId: session._id,
			title: session.title,
			unit: session.unit,
			distance: session.distance,
			hours: session.hours,
			minutes: session.minutes,
			rpeLoad: session.rpeLoad,
			sessionType: session.sessionType,
			color: session.activityType.color,
			icon: session.activityType.imgUrl,
			exercisesTotal: session.exercises.length,
			days: daysDiff,
			order: req.body.sessionOrder
		}
		
		Program.findById(req.params.id)
			.then(program => {
				program.sessions.push(newSession);
				
				program.save()
					.then(() => res.json({success: true, msg: 'Session added in program!'}))
					.catch(err => res.json({success: false, msg: 'Error: '+err}));
			})
			.catch(err => res.json({success: false, msg: 'Error: '+err}));
	}
	else{
		res.json({success: false, msg: 'Program not associated with this planner!'});
	}
});

router.route('/sessions/:id').get((req, res) => {
	Program.findById(req.params.id)
		.then(program => res.json({success: true, sessions: program.sessions, title: program.title, startDate: program.startDate}))
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});

router.route('/update_sessions').post(async (req, res) => {
	let program_id = req.body.program_id;
	let program_sessions = req.body.program_sessions;
	let add_sessions = req.body.add_sessions;
	let prog_max_days = 7;
	
	Program.findById(program_id)
		.then(program => {
			program.sessions = program_sessions;
			for(let i=0; i<add_sessions.length; i++){
				add_sessions[i].distance = {'$numberDecimal': add_sessions[i].distance};
				delete add_sessions[i]._id;
				program.sessions.push(add_sessions[i]);
			}
			for(let i=0; i<program.sessions.length; i++){
				if(program.sessions[i].days+1 > prog_max_days)
					prog_max_days = program.sessions[i].days+1;
			}
			let program_weeks = Math.ceil(prog_max_days / 7);
			program.weeks = program_weeks;
			program.save()
				.then(() => {
					   Planner.updateMany({"programs.programId": mongoose.Types.ObjectId(program_id)}, {$set: {"programs.$[program].weeks": program_weeks}}, {arrayFilters: [ { "program.programId": mongoose.Types.ObjectId(program_id) } ]}, function(err, res){ });
					   res.json({success: true, msg: 'Program sessions saved successfully', sessions: program.sessions})})
				.catch(err => res.json({success: false, msg: 'Error: '+err}));
		})
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});

module.exports = router;