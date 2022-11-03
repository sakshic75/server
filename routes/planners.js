const router = require('express').Router();
const mongoose = require('mongoose');
const Planner = mongoose.model('Planners');
const Program = mongoose.model('Programs');
const Teams = mongoose.model('Teams');
const arrayify = require('sort-array');

router.route('/').get((req, res) => {
	Planner.find()
		.then(planners => res.json({success: true, planners: planners}))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/getByTeam/:teamId').get((req, res) => {
	Planner.find({clubId: req.params.teamId})
		.then(planners => res.json({success: true, planners: planners}))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/add').post(async (req, res) => {
	const planner = await Planner.find({slug: req.body.slug});
	if(planner.length > 0){
		res.json({success: false, msg: 'Error: Planner with this title already exists'});
	}
	else{
		let title = req.body.title;
		let slug = req.body.slug;
		let clubId = req.body.clubId;
		let startingDate = req.body.startDate;
		let endInterval = req.body.plannerInterval;
		let displayCountdown = req.body.displayCountdown;
		let reverseCountdown = req.body.revCountdown;
		let tcStartDate = req.body.trainCycleStartDate;
		let tcInterval = req.body.trainCycleInterval;
		let competitions = req.body.competitions;
		let addedBy = 	req.body.addedBy;
		
		const newPlanner = new Planner({title, slug, clubId, startingDate, endInterval, displayCountdown, reverseCountdown, tcStartDate, tcInterval, competitions, addedBy});
		
		newPlanner.save()
			.then(() => res.json({success: true, msg: 'Planner added'}))
			.catch(err => {res.json({success: false, msg: 'Error: '+err})});
	}
});

router.route('/:clubId/:id').get((req, res) => {
	Planner.findOne({_id: req.params.id, clubId: req.params.clubId})
		.then(planner => res.json(planner))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/slug/:id').post(async (req, res) => {
	let planner = null, programs = null;
	const club = await Teams.findOne({slug: req.body.clubSlug, creatorId: req.body.userId});
	if(club !== null){
		planner = await Planner.findOne({slug: req.params.id, clubId: club._id});
		programs = await Program.find();
	}
	
	res.json({club, planner, programs})
});

router.route('/:id').delete((req, res) => {
	Planner.findByIdAndDelete(req.params.id)
		.then(() => res.json('Planner deleted!'))
		.catch(err => res.status(400).json('Error: '+err));
});

router.route('/update/:id').post(async (req, res) => {
	const planner = await Planner.find({_id: {$ne: req.params.id}, slug: req.body.slug});
	if(planner.length > 0){
		res.json({success: false, msg: 'Planner with this title already exists'});
	}
	else{
		Planner.findById(req.params.id)
			.then(planner => {
				planner.title = req.body.title;
				planner.slug = req.body.slug;
				planner.startingDate = req.body.startDate;
				planner.endInterval = req.body.plannerInterval;
				planner.displayCountdown = req.body.displayCountdown;
				planner.reverseCountdown = req.body.revCountdown;
				planner.tcStartDate = req.body.trainCycleStartDate;
				planner.tcInterval = req.body.trainCycleInterval;
				planner.competitions = req.body.competitions;
				
				planner.save()
					.then(() => res.json({success: true, msg: 'Planner updated!'}))
					.catch(err => res.json({success: false, msg: 'Error: '+err}));
			})
			.catch(err => res.json({success: false, msg: 'Error: '+err}));
	}
});

router.route('/add-program/:id').post(async (req, res) => {
	let programId = mongoose.Types.ObjectId(req.body.programId);
	let program = await Planner.findOne({_id: req.params.id, programs: {$elemMatch: {programId}}});
	if(program){
		res.json({success: false, msg: 'This program is already present in this planner'});
	}
	else{
		let program = {
			programId,
			title: req.body.title,
			color: req.body.color,
			startDate: req.body.startDate,
			layer: req.body.layer,
			weeks: req.body.weeks
		}
		Planner.findById(req.params.id)
			.then(planner => {
				planner.programs.push(program);
				arrayify(planner.programs, {by: 'startDate', order: 'asc'});
				
				planner.save()
					.then(() => res.json({success: true, planner, msg: 'Program added in planner!'}))
					.catch(err => res.json({success: false, msg: 'Error: '+err}));
			})
			.catch(err => res.json({success: false, msg: 'Error: '+err}));
	}
});

router.route('/update-program/:id').post(async (req, res) => {
	let program = await Planner.findOne({_id: req.params.id, programs: {$elemMatch: {programId: req.body.programId}}});
	if(program){
		let programId = req.body.programId;
		Planner.findById(req.params.id)
			.then(planner => {
				planner.programs.forEach((item, ind) => {
					if(programId == item.programId.toString()){
						planner.programs[ind].startDate = req.body.startDate;
						planner.programs[ind].layer = req.body.layer;
					}
				});
				arrayify(planner.programs, {by: 'startDate', order: 'asc'});
				
				planner.save()
					.then(() => res.json({success: true, planner, msg: 'Program updated in planner!'}))
					.catch(err => res.json({success: false, msg: 'Error: '+err}));
			})
			.catch(err => res.json({success: false, msg: 'Error: '+err}));
	}
	else{
		res.json({success: false, msg: 'This program is not present in this planner'});
	}
});

router.route('/programs-graph-detail/:id').post(async (req, res) => {
	let planner = await Planner.findOne({_id: req.params.id});
	let graphType = req.body.graphType;
	let offset = new Date().getTimezoneOffset() * 60 * 1000;
	let startWeek = new Date(req.body.startWeek).getTime();
	startWeek = startWeek - offset;
	let maxVal = 0;
	
	if(planner){
		let programArr = [];
		let getGraphData = async (item) => {
			let programStartTime = item.startDate.getTime();
			let programWeekDifference = programStartTime - startWeek;
			let programStartWeek = programWeekDifference / 604800000;
			let weeksArr = [];
			for(let i=0; i<item.weeks; i++){
				weeksArr[i] = 0;
			}
			if(graphType == 'time'){
				let program = await Program.findOne({_id: item.programId}, 'sessions');
				program.sessions.forEach((item1) => {
					let arrInd = Math.floor(item1.days / 7);
					if(weeksArr[arrInd] == null)
						weeksArr[arrInd] = 0;
					weeksArr[arrInd] = weeksArr[arrInd] + item1.sessTime;
				});
			}
			else if(graphType == 'distance'){
				let program = await Program.findOne({_id: item.programId}, 'sessions');
				program.sessions.forEach((item1) => {
					let arrInd = Math.floor(item1.days / 7);
					if(weeksArr[arrInd] == null)
						weeksArr[arrInd] = 0;
					if(item1.unit == 'km')
						weeksArr[arrInd] = weeksArr[arrInd] + parseFloat(item1.distance);
					else if(item1.unit == 'miles')
						weeksArr[arrInd] = weeksArr[arrInd] + (parseFloat(item1.distance) * 1.609344);
				});
			}
			else if(graphType == 'load'){
				let program = await Program.findOne({_id: item.programId}, 'sessions');
				program.sessions.forEach((item1) => {
					let arrInd = Math.floor(item1.days / 7);
					if(weeksArr[arrInd] == null)
						weeksArr[arrInd] = 0;
					weeksArr[arrInd] = weeksArr[arrInd] + item1.rpeLoad;
				});
			}
			for(let i=0; i<weeksArr.length; i++){
				if(weeksArr[i] > maxVal)
					maxVal = weeksArr[i];
			}
			return {color: item.color, programStartWeek, weeksArr};
		}
		
		for(let i=0; i<planner.programs.length; i++){
			let data = await getGraphData(planner.programs[i]);
			programArr.push(data);
		};
		//console.log(programArr);
		res.json({success: true, maxVal, programArr});
	}
	else{
		res.json({success: false, msg: 'This planner dose not exist'});
	}
});

router.route('/duplicate-program/:id').post(async (req, res) => {
	let programId = req.body.programId;
	let title = req.body.title;
	let userId = req.body.userId;
	let slug = string_to_slug(title);
	
	let program = await Program.findById(programId);
	let phase = {name: program.phase.name, colorcode: program.phase.colorcode};
	let activityType = [];
	let sessions = [];
	
	program.activityType.forEach((type) => {
		activityType.push({activity_id: type.activity_id, activity_name: type.activity_name});
	});
	
	program.sessions.forEach((session) => {
		sessions.push({sessionId: session.sessionId, title: session.title, unit: session.unit, distance: session.distance, hours: session.hours, minutes: session.minutes, sessTime: session.sessTime, rpeLoad: session.rpeLoad, sessionType: session.sessionType, activityType: session.activityType, color: session.color, icon: session.icon, exercisesTotal: session.exercisesTotal, days: session.days, order: session.order, sessionTime: session.sessionTime, sessionURL: session.sessionURL});
	});
	
	const newProgram = new Program({title, slug, clubId: program.clubId, phase, activityType, level: program.level, weeks: program.weeks, startDate: program.startDate, addedBy: userId, sessions});
	newProgram.save()
		.then(() => {
			Planner.findById(req.params.id)
				.then(planner => {
					planner.programs.forEach((item, ind) => {
						if(programId == item.programId.toString()){
							let plannerProgram = {
								programId: newProgram._id,
								title: newProgram.title,
								color: newProgram.phase.colorcode,
								startDate: planner.programs[ind].startDate,
								layer: planner.programs[ind].layer,
								weeks: newProgram.weeks
							}
							
							planner.programs.splice(ind, 1);
							planner.programs.push(plannerProgram);
						}
					});
					arrayify(planner.programs, {by: 'startDate', order: 'asc'});
					
					planner.save()
						.then(() => res.json({success: true, planner, msg: 'Duplicate Program created'}))
						.catch(err => res.json({success: false, msg: 'Error: '+err}));
				})
				.catch(err => res.json({success: false, msg: 'Error: '+err}));
		})
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});

router.route('/remove-program/:id').post((req, res) => {
	let programId = req.body.programId;
	Planner.findById(req.params.id)
		.then(planner => {
			planner.programs.forEach((item, ind) => {
				if(programId == item.programId.toString()){
					planner.programs.splice(ind, 1);
				}
			});
			
			planner.save()
				.then(() => res.json({success: true, planner, msg: 'Program removed from planner!'}))
				.catch(err => res.json({success: false, msg: 'Error: '+err}));
		})
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
});

router.route('/layer-programs/:id').post(async (req, res) => {
	let sessions = [];
	let layerNo = req.body.layerNo;
	let planner = await Planner.findOne({_id: req.params.id});
	
	let getSessionsData = async (programId) => {
		program = await Program.findOne({_id: programId});
		return program;
	}
			
	for(let j=0; j<planner.programs.length; j++){
		if(planner.programs[j].layer == layerNo){
			let program = await getSessionsData(planner.programs[j].programId);
			sessions.push({programSessions: program.sessions});
		}
	}
	
	res.json({planner, sessions});
});

function string_to_slug(str) {
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();
	
	// remove accents, swap ñ for n, etc
	var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
	var to = "aaaaeeeeiiiioooouuuunc------";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}
	
	str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes
	
	return str;
}

module.exports = router;