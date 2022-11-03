/**
	 * =======rs: Hasitha Dias and Waqas Rehmani
 *
 * The group_controller is used for defining the==============================
 * DEFINING GROUP API CALLS CONTROLLER
 * =====================================
 * @date created: 27 August 2019
 * @autho functionality of api calls related to groups
 *
 */

const mongoose = require('mongoose');

const Programs = mongoose.model('Programs');
const Phases = mongoose.model('phases');
const Sessions = mongoose.model('Sessions');
const Teams = mongoose.model('Teams');

var createProgram = async (req, res) => {
	var athlete_Level = req.body.athlete_Level;
	var programDetail = req.body.program_detail;
	var slug = string_to_slug(programDetail.program_title);
	var ProgramPhases = await Phases.findOne({ _id: programDetail.phase_id });
	var newprogram = new Programs({
		title: programDetail.program_title,
		slug: slug,
		startDate: programDetail.startDate,
		phase: ProgramPhases,
		activityType: req.body.ativity_type,
		level: athlete_Level,
		clubId: programDetail.clubId,
		addedBy: req.body.userId,
		weeks: 1,
		sessions: []
	});
	
	newprogram.save(function (err, createProgram) {
		if (!err) {
			res.status(200).send(createProgram);
		}
		else {
			res.send(err);
		}
	});
};
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

var getPhases = function (req, res) {
	Phase.find(function (err, allphases) {
		if (!err) {
			res.send(allphases);
		} else {
			res.send(err);
		}
	});
};
var checkProgramTitle = function (req, res) {
	let title = req.body.title;
	Programs.findOne({ title }, function (err, programe) {
		if (programe) {
			res.status(201).send(programe);
		} else {
			res.send({ 'success': 'true' });
		}
	});
};

var getProgramById = function (req, res) {
	let id = req.body;
	let dataArr = {};
	let ActivityArr = [];
	let selectedActivityIds = [];
	Programs.findOne(id, function (err, programe) {
		if (programe) {
			programe.activityType.forEach(t => {
				var obj = { 'activity_id': t.activity_id, 'activity_name': t.activity_name };
				ActivityArr.push(obj);
				selectedActivityIds.push(t.activity_id);
			});
			dataArr['level'] = programe.level;
			dataArr['startDate'] = programe.startDate;
			dataArr['title'] = programe.title;
			dataArr['phase'] = programe.phase._id;
			dataArr['activityType'] = ActivityArr;
			res.status(200).send(dataArr);
		} else {
			res.send({ 'success': 'true' });
		}
	});
};
var updateProgramById = async (req, res) => {
	var programDetail = req.body.program_detail;
	var athleteLevel = req.body.athlete_Level;
	var phaseId = programDetail.phase_id;
	var activityType = req.body.ativity_type;
	var programId = programDetail.program_id;
	var slug = string_to_slug(programDetail.program_title);
	var ProgramPhases = await Phases.findOne({ _id: phaseId });
	const filter = { _id: programId };
	const update = {
		title: programDetail.program_title,
		slug: slug,
		startDate: programDetail.startDate,
		phase: ProgramPhases,
		activityType: activityType,
		level: athleteLevel
	};
	Programs.findOneAndUpdate(filter, update, (err, program) => {
		if (program) {
			res.status(200).send(program._id);
		} else {
			res.status(500).send({ 'success': 'false', 'error': err });
		}
	});
}

var searchProgram = async (req, res) => {
	let groupQuery = '.*' + req.body.searching + '.*';
	var recrdArr = [];
	Programs.
		find({ title: { $regex: groupQuery } })
		.exec(function (err, programdata) {
			if (err) {
				return res.status(400).json({ success: false, message: err });
			}
			if (!programdata.length) {
				return res
					.status(200)
					.json(recrdArr);
			}
			//                for (var key in exercise) {
			//                    componentArr.push({ 'id': cnt, 'exercise_id': exercise[key]._id, 'data': exercise[key].title, 'pic1': exercise[key].pic1, 'type': exercise[key].type });
			//                    cnt++;
			//                }
			return res.status(200).json(programdata);
		});
}
var getProgramSessions = async (req, res) => {
	let sessionArr = [];
	let programs = {};
	let finalArray={};
	let club = null;
	let programId = req.body.program_id;
	let programSlug = req.body.program_slug;
	let clubSlug = req.body.club_slug;
	let userId = req.body.user_id;
	if(clubSlug !== undefined && userId !== undefined){
		club = await Teams.findOne({slug: clubSlug, creatorId: userId});
	}
	if(programId == undefined){
		programs = await Programs.findOne({ 'slug': programSlug }, 'title sessions startDate');
		programId = programs._id;
	}
	else{
		programs = await Programs.findOne({ '_id': programId }, 'title sessions startDate');
	}
	let programDate = programs.startDate;
	programs.sessions.forEach(t => {
		let prev_date = new Date(programDate);
		let days = t.days;
		prev_date.setDate(prev_date.getDate() + days);
		let assos_date = formatDate(prev_date);
		var obj = {
			'id_session': t._id,
			'sessionId': t.sessionId,
			'programdate': programDate,
			'sesstitle': t.title,
			'unit': t.unit,
			'distance': t.distance,
			'type': t.sessionType,
			'sesscolor': t.color,
			'icon': t.icon,
			'order': t.order,
			'date': assos_date,
			'minutes': t.minutes,
			'sessTime': t.sessTime,
			'rpe_load': t.rpeLoad,
			'total_ex': (t.exercisesTotal)?t.exercisesTotal:0,
			'days': days,
			'hours': t.hours,
			'sess_description': t.sess_description,
			'activityType':t.activityType,
			'sessionTime': t.sessionTime,
			'sessionURL': t.sessionURL
		}
		//  var obj = { 'title': t.title,'date':assos_date }
		sessionArr.push(obj);
	});
	finalArray['program_id']=programId;
	finalArray['program_title']=programs.title;
	finalArray['program_date']=programDate;
	finalArray['program_session']=sessionArr;
	finalArray['club']=club;
	return res
		.status(200)
		.json(finalArray);
};
function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();
	
	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;
	
	return [year, month, day].join('-');
}
function checkExist(arr, newsess) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].session_id == newsess.sessionId) {
			return newsess.sessionId;
		}
	}
}
var getSession = async(req, res) => {
	let sessionId=req.body.id_session;
	let sessions = await Programs.findOne({ "sessions._id":sessionId},{  "sessions.$": 1 });
	return res
		.status(200)
		.json(sessions);
}

var updateProgramSession = async(req, res) => {
	let Sessions = req.body.program_sessions;
	let ProgramId = req.body.program_id;
	let sessArray = [];
	
	for (var i = 0; i < Sessions.length; i++) {
		const sessionObj = {};
		sessionObj['sessionId'] = Sessions[i].sessionId;
		sessionObj['title'] = Sessions[i].sesstitle;
		sessionObj['unit'] = Sessions[i].unit;
		sessionObj['distance'] = Sessions[i].distance;
		sessionObj['hours'] = Sessions[i].hours;
		sessionObj['minutes'] = Sessions[i].minutes;
		sessionObj['sessTime'] = Sessions[i].sessTime;
		sessionObj['rpeLoad'] = Sessions[i].rpe_load;
		sessionObj['sessionType'] = Sessions[i].type;
		sessionObj['color'] = Sessions[i].sesscolor;
		sessionObj['icon'] = Sessions[i].icon;
		if(Sessions[i].type === 'strength')
			sessionObj['exercisesTotal'] = Sessions[i].total_ex;
		else
			sessionObj['exercisesTotal'] = 0;
		sessionObj['days'] = Sessions[i].days;
		sessionObj['order'] = Sessions[i].order;
		sessArray.push(sessionObj);
	}
	const filter = { _id: ProgramId};
	//const filter = { _id: ProgramId};
	const update = {
		sessions: sessArray,
	};
	return await Programs.findOneAndUpdate(filter, update, (err, program) => {
		if (program) {
			res.status(200).send(program.sessions);
		} else {
			res.status(500).send({ 'success': 'false', 'error': err });
		}
	});
};
var getAllPrograms = async (req, res) => {
	let programs = await Programs.find({}, '_id title');
	if (programs) {
		res.status(200).send(programs);
	} else {
		res.status(500).send({ 'success': 'false', 'error': err });
	}
};
module.exports.createProgram = createProgram;
module.exports.getPhases = getPhases;
module.exports.checkProgramTitle = checkProgramTitle;
module.exports.getProgramById = getProgramById;
module.exports.updateProgramById = updateProgramById;
module.exports.searchProgram = searchProgram;
module.exports.getProgramSessions = getProgramSessions;
module.exports.updateProgramSession = updateProgramSession;
module.exports.getAllPrograms = getAllPrograms;
module.exports.getSession = getSession;