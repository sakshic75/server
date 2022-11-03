/**
 * =====================================
 * DEFINING GROUP API CALLS CONTROLLER
 * =====================================
 * @date created: 27 August 2019
 * @authors: Hasitha Dias and Waqas Rehmani
 *
 * The group_controller is used for defining the functionality of api calls related to groups
 *
 */


const mongoose = require('mongoose');

var StrengthSession = mongoose.model('Sessions');
var Activity = mongoose.model('activity');
var UnitB = mongoose.model('units_b');
var UnitA = mongoose.model('units_a');
var Components = mongoose.model('SessionComponents');
var SessionSportsKeywords = mongoose.model('SessionSportsKeywords');
var SessionActivity = mongoose.model('SessionActivityTypes');
var Programs = mongoose.model('Programs');
const AthleteStrengthData = mongoose.model('athlete_strength_data');

var saveStrengthSession = async (req, res) => {
	const ssdata = req.body.ssdata;
	
	let exData = req.body.exercisedata;
	let clubId = req.body.clubId;
	let kewords = ssdata.str_session_keywords.split(',');
	const activitype = await SessionActivity.findOne({ '_id': ssdata.strength_activity_type });
	let activityObj = {};
	activityObj['_id'] = activitype._id;
	activityObj['value'] = activitype.title;
	activityObj['title'] = activitype.title;
	activityObj['imgUrl'] = activitype.imgUrl;
	activityObj['color'] = activitype.color;
	let cnt = 0;
	let exArray = [];
	
	exData.forEach((t, index, object) => {
		const exerciseObj = {};
		exerciseObj['exercise_id'] = t.exercise_id;
		exerciseObj['title'] = t.data;
		exerciseObj['pic1'] = t.pic1;
		exerciseObj['pic2'] = t.pic2;
		exerciseObj['pic3'] = t.pic3;
		exerciseObj['type'] = t.type;
		exerciseObj['unit_a_value'] = t.unit_a_value;
		exerciseObj['unit_b_value'] = t.unit_b_value;
		exerciseObj['strength_body_img'] = t.bodystrenght;
		exerciseObj['order'] = cnt;
		exerciseObj['note_value'] = t.note_value;
		exArray.push(exerciseObj);
		cnt++;
		// strength_sessions.log(exerciseObj);
	});
	if (!req.body) {
		return res.status(400).json({
			success: false,
			error: 'You must provide a parameter'
		});
	}
	var sessionObj = {};
	sessionObj['sessionType'] = 'strength';
	sessionObj['title'] = ssdata.str_session_title;
	sessionObj['keywords'] = kewords;
	sessionObj['exType'] = ssdata.str_session_type;
	sessionObj['activityType'] = activityObj;
	sessionObj['minutes'] = ssdata.str_session_minuts;
	sessionObj['hours'] = ssdata.str_session_hours;
	sessionObj['rpe'] = ssdata.str_session_rating;
	sessionObj['rpeLoad'] = ssdata.load;
	sessionObj['description'] = ssdata.str_session_comment;
	sessionObj['exercises'] = exArray;
	sessionObj['addedBy'] = 1;
	sessionObj['clubId'] = clubId;
	sessionObj['sessTime'] = Number(ssdata.str_session_hours * 60) + Number(ssdata.str_session_minuts);
	const ssession = new StrengthSession(sessionObj);
	if (!ssession) {
		return res.status(400).json({ success: false, error: err })
	}
	ssession
		.save()
		.then(() => {
			return res.status(201).json({
				success: true,
				id: ssession._id,
				message: 'Session created!',
			})
		})
		.catch(error => {
			return res.status(400).json({
				error,
				message: 'Session not created!',
			})
		});
}
var getSessionById = async (req, res) => {
	let Id = req.body;
	componentArr = [];
	let unitbarr = [];
	cnt = 0;
	let sessionObj = {};
	let strengthSessionData = await StrengthSession.findOne(Id);
	let keywords = strengthSessionData.keywords.toString();
	for (var key in strengthSessionData.exercises) {
		const unitBvalue = await UnitB.find({ 'unit_a_id': strengthSessionData.exercises[key].unit_a_value });
		componentArr.push({
			'id': cnt,
			'exercise_id': strengthSessionData.exercises[key].exercise_id,
			'data': strengthSessionData.exercises[key].title,
			'pic1': strengthSessionData.exercises[key].pic1,
			'pic2': strengthSessionData.exercises[key].pic2,
			'pic3': strengthSessionData.exercises[key].pic3,
			'type': strengthSessionData.exercises[key].type,
			'unit_a_value': strengthSessionData.exercises[key].unit_a_value,
			'unit_b_value': strengthSessionData.exercises[key].unit_b_value,
			'order': strengthSessionData.exercises[key].order,
			'bodystrenght': strengthSessionData.exercises[key].strength_body_img,
			'note_value': strengthSessionData.exercises[key].note_value
		});
		unitbarr.push(unitBvalue);
		cnt++;
	}
	sessionObj['ex_components'] = componentArr;
	sessionObj['unit_b_opt'] = unitbarr;
	sessionObj['_id'] = strengthSessionData._id;
	sessionObj['title'] = strengthSessionData.title;
	sessionObj['keywords'] = keywords;
	sessionObj['exercise_type'] = strengthSessionData.exType;
	sessionObj['activity_type'] = strengthSessionData.activityType;
	sessionObj['total_time_min'] = strengthSessionData.minutes;
	sessionObj['total_time_hours'] = strengthSessionData.hours;
	sessionObj['rpe'] = strengthSessionData.rpe;
	sessionObj['load'] = strengthSessionData.rpeLoad;
	sessionObj['comment'] = strengthSessionData.description;
	sessionObj['session_exercises'] = strengthSessionData.exercises;
	return res
		.status(200)
		.json(sessionObj);
}
var updateSessionById = async (req, res) => {
	var StrengthSession = mongoose.model('Sessions');
	const ssdata = req.body.ssdata;
	let exData = req.body.exercisedata;
	const activitype = await SessionActivity.findOne({ '_id': ssdata.strength_activity_type });
	let activityObj = {};
	activityObj['activity_id'] = activitype._id;
	activityObj['title'] = activitype.title;
	activityObj['activity_image'] = activitype.activity_image;
	let cnt = 0;
	let exArray = [];
	let sessTime = (ssdata.str_session_hours * 60) + ssdata.str_session_minuts;
	
	exData.forEach((t, index, object) => {
		const exerciseObj = {};
		exerciseObj['exercise_id'] = t.exercise_id;
		exerciseObj['title'] = t.data;
		exerciseObj['pic1'] = t.pic1;
		exerciseObj['pic2'] = t.pic2;
		exerciseObj['pic3'] = t.pic3;
		exerciseObj['type'] = t.type;
		exerciseObj['unit_a_value'] = t.unit_a_value;
		exerciseObj['unit_b_value'] = t.unit_b_value;
		exerciseObj['strength_body_img'] = t.bodystrenght;
		exerciseObj['order'] = cnt;
		exerciseObj['note_value'] = t.note_value;
		exArray.push(exerciseObj);
		cnt++;
	});
	const filter = { _id: ssdata.str_session_id };
	const update = {
		title: ssdata.str_session_title,
		keywords: ssdata.str_session_keywords,
		exercise_type: ssdata.str_session_type,
		activity_type: activityObj,
		minutes: ssdata.str_session_minuts,
		hours: ssdata.str_session_hours,
		sessTime,
		rpe: ssdata.str_session_rating,
		rpeLoad: ssdata.load,
		comment: ssdata.str_session_comment,
		exercises: exArray
	};
	
	return await StrengthSession.findOneAndUpdate(filter, update, (err, session) => {
		if (session) {
			Programs.updateMany({"sessions.sessionId": mongoose.Types.ObjectId(ssdata.str_session_id)}, {$set: {"sessions.$[session].exercisesTotal": exArray.length}}, {arrayFilters: [ { "session.sessionId": mongoose.Types.ObjectId(ssdata.str_session_id) } ]}, function(err, res){ });
			res.status(200).send(session._id);
		} else {
			res.status(500).send({ 'success': 'false', 'error': err });
		}
	});
}
var getsearchFormData = async (req, res) => {
	componentArr = [];
	sskeywords = [];
	const activitype = await SessionActivity.find({}, 'title _id imgUrl');
	const cmp = await Components.find({}, '_id title');
	const sskwrds = await SessionSportsKeywords.find({}, '_id title');
	for (var key in cmp) {
		componentArr.push({ 'value': cmp[key]._id, 'label': cmp[key].title });
	}
	for (var key in sskwrds) {
		sskeywords.push({ 'value': sskwrds[key]._id, 'label': sskwrds[key].title });
	}
	res.json({ success: true, activitype, componentArr, sskeywords });
}
var searchAdvanceSession = async (req, res) => {
	var parms = {};
	let groupQuery = '.*' + req.body.sessionDetail.session_title + '.*';
	let sportsKeywords = req.body.sessionDetail.sports_keywords;
	let Keyword = req.body.sessionDetail.session_keyword;
	let components = req.body.sessionDetail.session_Components;
	let athleteLevel = req.body.sessionDetail.athlete_levels;
	let unit = req.body.sessionDetail.session_unit;
	let sportsKeyWordArr = [];
	let comonentsArr = [];
	let min = req.body.rangeValue.min;
	let max = req.body.rangeValue.max;
	let activitytype = req.body.sessionDetail.session_activity_types;
	let toSessTime = Number(req.body.sessionDetail.to_str_session_hours * 60) + Number(req.body.sessionDetail.to_str_session_minuts);
	let fromSessTime = Number(req.body.sessionDetail.from_str_session_hours * 60) + Number(req.body.sessionDetail.from_str_session_minuts);
	if (sportsKeywords != null && sportsKeywords.length > 0) {
		for (var key in sportsKeywords) {
			sportsKeyWordArr.push(sportsKeywords[key].value);
		}
		parms['sportsKeywords'] = { $all: sportsKeyWordArr };
	}
	if (components != null && components.length > 0) {
		for (var key in components) {
			comonentsArr.push(components[key].value);
		}
		parms['components'] = { $all: comonentsArr };
	}
	if (athleteLevel != '') {
		parms['athleteLevel'] = { $all: [athleteLevel] };
	}
	if (unit != '') {
		parms['unit'] = unit;
	}
	if (Keyword != '') {
		parms['keywords'] = { $all: [Keyword] };
	}
	if (max != '' && max != 0) {
		parms['distance'] = { $gte: min, $lte: max };
	}
	if (toSessTime != '' && fromSessTime != '') {
		parms['sessTime'] = { $gte: toSessTime, $lte: fromSessTime };
	}
	
	if (activitytype != '') {
		parms['activityType._id'] = activitytype;
	}
	parms['sessionType'] = 'normal';
	parms['clubId'] = req.body.clubId;
	
	StrengthSession.
		find({ $and: [{ title: { $regex: groupQuery } }, parms] }, 'title unit distance sessionType rpeLoad hours minutes sessTime activityType.value activityType.imgUrl activityType.color description')
		.exec(function (err, sessiondata) {
			if (err) {
				return res.status(400).json({ success: false, message: err });
			}
			return res.status(200).json(sessiondata);
		});
}
var searchSimpleSession = async (req, res) => {
	var parms = {};
	let groupQuery = '.*' + req.body.search_title.sDetail + '.*';
	parms['sessionType'] = 'normal';
	parms['clubId'] = req.body.search_title.clubId;
	StrengthSession
		.find({ $and: [{ title: { $regex: groupQuery } }, parms] }, 'title unit distance sessionType rpeLoad hours minutes sessTime activityType.value activityType.imgUrl activityType.color description')
		.exec(function (err, sessiondata) {
			if (err) {
				return res.status(400).json({ success: false, message: err });
			}
			return res.status(200).json(sessiondata);
		});
}
var searchSimpleStrengthSession = async (req, res) => {
	var parms = {};
	let groupQuery = '.*' + req.body.search_title.sDetail + '.*';
	let clubId = req.body.search_title.clubId;
	parms['sessionType'] = 'strength';
	parms['clubId'] = clubId;
	
	StrengthSession.
		find({ $and: [{ title: { $regex: groupQuery } }, parms] }, 'title unit distance sessionType rpeLoad hours minutes sessTime activityType.value activityType.imgUrl activityType.color description exercises')
		.exec(function (err, sessiondata) {
			if (err) {
				return res.status(400).json({ success: false, message: err });
			}
			return res.status(200).json(sessiondata);
		});
}
var searchAdvanceStrengthSession = async (req, res) => {
	var parms = {};
	let groupQuery = '.*' + req.body.sessionDetail.ss_title + '.*';
	let Keyword = req.body.sessionDetail.ss_keyword;
	let exType = req.body.sessionDetail.ss_ex_type;
	let clubId = req.body.clubId;
	let activitytype = req.body.sessionDetail.ss_activitytype;
	let toHoursAndmin = (req.body.sessionDetail.ss_to_hours != '' && req.body.sessionDetail.ss_to_minutes != '') ? Number(req.body.sessionDetail.ss_to_hours * 60) + Number(req.body.sessionDetail.ss_to_minutes) : '';
	let fromHoursAndmin = (req.body.sessionDetail.ss_from_hours != '' && req.body.sessionDetail.ss_from_minutes != '') ? Number(req.body.sessionDetail.ss_from_hours * 60) + Number(req.body.sessionDetail.ss_from_minutes) : '';
	parms['sessionType'] = 'strength';
	parms['clubId'] = clubId;
	if (Keyword != '') {
		parms['keywords'] = { $all: [Keyword] };
	}
	if (activitytype != '') {
		parms['activityType._id'] = activitytype;
	}
	if (toHoursAndmin != '' && fromHoursAndmin != '') {
		parms['sessTime'] = { $gte: toHoursAndmin, $lt: fromHoursAndmin };
	}
	if (exType != '') {
		parms['exType'] = exType;
	}
	
	StrengthSession.
		find({ $and: [{ title: { $regex: groupQuery } }, parms] }, 'title unit distance sessionType rpeLoad hours minutes sessTime activityType.value activityType.imgUrl activityType.color description exercises')
		.exec(function (err, sessiondata) {
			if (err) {
				return res.status(400).json({ success: false, message: err });
			}
			return res.status(200).json(sessiondata);
		});
}
var getSimpleSession = async (req, res) => {
	let SessonId = req.body.sessionId;
	let clubId = req.body.clubId;
	let data = {};
	//let ProgtamsAssosiation=await Programs.findOne({'sessions.sessionId':'5e69181ea7961841c07ac84f'});
	let strengthSessionData = await StrengthSession.findOne({ '_id': SessonId, 'clubId': clubId });
	let programs = await Programs.find({ 'sessions.sessionId': SessonId }, 'title');
	// console.log(aa);
	data['session'] = strengthSessionData;
	data['programs'] = programs;
	return res
		.status(200)
		.json(data);
}

var removeSimpleSession = async (req, res) => {
	let SessonId = req.body.sessionId;
	let clubId = req.body.clubId;
	let data = {};
	const filter = { _id: SessonId };
	//let ProgtamsAssosiation=await Programs.findOne({'sessions.sessionId':'5e69181ea7961841c07ac84f'});
	StrengthSession.findOneAndDelete(filter, (err, session) => {
		if (session) {
			res.status(200).send(session._id);
		} else {
			res.status(500).send({ 'success': 'false', 'error': err });
		}
	});
}
var getDescription = async (req, res) => {
	let SessonId = req.body.sessionId;
	let data = {};
	const filter = { _id: SessonId };
	let desSession = await StrengthSession.findOne({ '_id': SessonId }, 'description');
	return res
		.status(200)
		.json(desSession);
}
var getStrengthSessionViews = async (req, res) => {
	const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let sessionId = req.body.session_id;
	let programId = req.body.program_id;
	let startDate = req.body.program_start_date;
	let componentArr = [];
	let sessionArr = [];
	let finalArray = {};
	let daterr='';
	let strengthSessionData = await StrengthSession.findOne({ '_id': sessionId });
	let  yearsArr = [];
	let assositateDates=[];
	//let programs = await Programs.findOne({ '_id': programId }, 'sessions startDate');
	let sessionsdata = await Programs.findOne({ "sessions.sessionId": sessionId, '_id': programId }, 'sessions startDate');
	let programDate = sessionsdata.startDate;
	for (var key in sessionsdata.sessions) {
		if(sessionsdata.sessions[key].sessionType == 'strength' && sessionsdata.sessions[key].sessionId == sessionId){
			let prev_date = new Date(startDate);
			let days = sessionsdata.sessions[key].days;
			let exerciseData = {};
			prev_date.setDate(prev_date.getDate() + days);
			var d = new Date(prev_date),
				day = '' + d.getDate(),
				year = d.getFullYear();
			
			if (day.length < 2)
				day = '0' + day;
			if (yearsArr.includes(year)) {
				daterr= [day, monthNamesShort[d.getMonth()]].join(' ');
			} else {
				yearsArr.push(year);
				daterr =[day, monthNamesShort[d.getMonth()], year].join(' ');
			}
			if(sessionsdata.sessions[key].exercisesData.length > 0){
				for (var key1 in strengthSessionData.exercises) {
					let exerAssocId = strengthSessionData.exercises[key1]._id;
					let exerData = {sets: '', unita: '', unitb: ''};
					for(let key2 in sessionsdata.sessions[key].exercisesData){
						if(exerAssocId == sessionsdata.sessions[key].exercisesData[key2].exerciseAssocId.toString()){
							if(sessionsdata.sessions[key].exercisesData[key2].sets != undefined)
								exerData.sets = sessionsdata.sessions[key].exercisesData[key2].sets;
							if(sessionsdata.sessions[key].exercisesData[key2].unita != undefined)
								exerData.unita = sessionsdata.sessions[key].exercisesData[key2].unita;
							if(sessionsdata.sessions[key].exercisesData[key2].unitb != undefined)
								exerData.unitb = sessionsdata.sessions[key].exercisesData[key2].unitb;
						}
					}
					exerciseData[exerAssocId] = exerData;
				}
			}
			else{
				for (var key1 in strengthSessionData.exercises) {
					let exerAssocId = strengthSessionData.exercises[key1]._id;
					exerciseData[exerAssocId] = {sets: '', unita: '', unitb: ''};
				}
			}
			assositateDates.push({sessAssocId: sessionsdata.sessions[key]._id, daterr, days, exerciseData});
		}
	}
	
	cnt = 0;
	for (var key in strengthSessionData.exercises) {
		let unitAvalue = await UnitA.findOne({ '_id': strengthSessionData.exercises[key].unit_a_value },'name');
		
		componentArr.push({
			'id': cnt,
			'exerAssocId': strengthSessionData.exercises[key]._id,
			'exercise_id': strengthSessionData.exercises[key].exercise_id,
			'data': strengthSessionData.exercises[key].title,
			'pic1': strengthSessionData.exercises[key].pic1,
			'pic2': strengthSessionData.exercises[key].pic2,
			'pic3': strengthSessionData.exercises[key].pic3,
			'strength_body_img': strengthSessionData.exercises[key].strength_body_img,
			'unit_a_value': unitAvalue.name,
			'unit_b_value': strengthSessionData.exercises[key].unit_b_value
		});
		cnt++;
	}
	
	finalArray['session_dates'] = assositateDates;
	finalArray['strength_data'] = componentArr;
	finalArray['session_data'] = {title: strengthSessionData.title, comments: strengthSessionData.description};
	return res
		.status(200)
		.json(finalArray);
}

let saveStrengthSessionInfo = (req, res) => {
	let programId = req.body.programId;
	let sessionId = req.body.sessionId;
	let exarr = req.body.exarr;
	
	Programs.findOne({ '_id': programId })
		.then(program => {
			program.sessions.forEach((item, ind) => {
				if(item.sessionType == 'strength' && item.sessionId == sessionId){
					if(exarr[item._id] != undefined){
						if(item.exercisesData.length > 0){
							for (let key in item.exercisesData) {
								//let exerciseAssocId = item.exercisesData[key].exerciseAssocId.toString();
								if(exarr[item._id][item.exercisesData[key].exerciseAssocId] != undefined){
									//console.log(exarr[item._id], exerciseAssocId);
									if(exarr[item._id][item.exercisesData[key].exerciseAssocId].sets != undefined)
										item.exercisesData[key].sets = exarr[item._id][item.exercisesData[key].exerciseAssocId].sets;
									if(exarr[item._id][item.exercisesData[key].exerciseAssocId].unita != undefined)
										item.exercisesData[key].unita = exarr[item._id][item.exercisesData[key].exerciseAssocId].unita;
									if(exarr[item._id][item.exercisesData[key].exerciseAssocId].unitb != undefined)
										item.exercisesData[key].unitb = exarr[item._id][item.exercisesData[key].exerciseAssocId].unitb;
									delete exarr[item._id][item.exercisesData[key].exerciseAssocId];
								}
							}
						}
						
						for (var key1 in exarr[item._id]) {
							let exerData = {exerciseAssocId: key1};
							if(exarr[item._id][key1].sets != undefined)
								exerData.sets = exarr[item._id][key1].sets;
							if(exarr[item._id][key1].unita != undefined)
								exerData.unita = exarr[item._id][key1].unita;
							if(exarr[item._id][key1].unitb != undefined)
								exerData.unitb = exarr[item._id][key1].unitb;
							item.exercisesData.push(exerData);
						}
					}
				}
			});
			
			program.save()
				.then(() => res.json({success: true, msg: 'Exercises data updated successfully'}))
				.catch(err => res.json({success: false, msg: 'Error: '+err}));
		})
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
}

var getStrengthSessionViewsAthlete = async (req, res) => {
	const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	let sessionId = req.body.session_id;
	let programId = req.body.program_id;
	let startDate = req.body.program_start_date;
	let clubId = req.body.club_id;
	let plannerId = req.body.planner_id;
	let athleteId = req.body.user_id;
	
	let componentArr = [];
	let sessionArr = [];
	let finalArray = {};
	let athSessionsData = [];
	let daterr='';
	let strengthSessionData = await StrengthSession.findOne({ '_id': sessionId });
	let  yearsArr = [];
	let assositateDates=[];
	//let programs = await Programs.findOne({ '_id': programId }, 'sessions startDate');
	let sessionsdata = await Programs.findOne({ "sessions.sessionId": sessionId, '_id': programId }, 'sessions startDate');
	let athleteStrengthData = await AthleteStrengthData.findOne({clubId, athleteId, plannerId});
	if(athleteStrengthData != null){
		if(athleteStrengthData.programsData.length > 0){
			for (let prog_key in athleteStrengthData.programsData) {
				if(athleteStrengthData.programsData[prog_key].programId.toString() == programId){
					athSessionsData = athleteStrengthData.programsData[prog_key].sessionsData;
				}
			}
		}
	}
	let programDate = sessionsdata.startDate;
	for (var key in sessionsdata.sessions) {
		if(sessionsdata.sessions[key].sessionType == 'strength' && sessionsdata.sessions[key].sessionId == sessionId){
			let sessAssocId = sessionsdata.sessions[key]._id;
			let athExerData = [];
			if(athSessionsData.length > 0){
				for (let sess_key in athSessionsData) {
					if(athSessionsData[sess_key].sessionAssocId.toString() == sessAssocId){
						athExerData = athSessionsData[sess_key].exercisesData;
					}
				}
			}
			let prev_date = new Date(startDate);
			let days = sessionsdata.sessions[key].days;
			let exerciseData = {};
			prev_date.setDate(prev_date.getDate() + days);
			var d = new Date(prev_date),
				day = '' + d.getDate(),
				year = d.getFullYear();
			
			if (day.length < 2)
				day = '0' + day;
			if (yearsArr.includes(year)) {
				daterr= [day, monthNamesShort[d.getMonth()]].join(' ');
			} else {
				yearsArr.push(year);
				daterr =[day, monthNamesShort[d.getMonth()], year].join(' ');
			}
			if(sessionsdata.sessions[key].exercisesData.length > 0){
				for (var key1 in strengthSessionData.exercises) {
					let exerAssocId = strengthSessionData.exercises[key1]._id;
					let exerData = {sets: '', unita: '', unitb: '', sets1: '', unita1: '', unitb1: '', sets2: '', unita2: '', unitb2: '', sets3: '', unita3: '', unitb3: ''};
					for(let key2 in sessionsdata.sessions[key].exercisesData){
						if(exerAssocId == sessionsdata.sessions[key].exercisesData[key2].exerciseAssocId.toString()){
							if(sessionsdata.sessions[key].exercisesData[key2].sets != undefined)
								exerData.sets = sessionsdata.sessions[key].exercisesData[key2].sets;
							if(sessionsdata.sessions[key].exercisesData[key2].unita != undefined)
								exerData.unita = sessionsdata.sessions[key].exercisesData[key2].unita;
							if(sessionsdata.sessions[key].exercisesData[key2].unitb != undefined)
								exerData.unitb = sessionsdata.sessions[key].exercisesData[key2].unitb;
						}
					}
					
					if(athExerData.length > 0){
						for(let exer_key2 in athExerData){
							if(exerAssocId == athExerData[exer_key2].exerciseAssocId.toString()){
								let athExerData1 = athExerData[exer_key2];
								if(athExerData1.sets1 != undefined)
									exerData.sets1 = athExerData1.sets1;
								if(athExerData1.unita1 != undefined)
									exerData.unita1 = athExerData1.unita1;
								if(athExerData1.unitb1 != undefined)
									exerData.unitb1 = athExerData1.unitb1;
								if(athExerData1.sets2 != undefined)
									exerData.sets2 = athExerData1.sets2;
								if(athExerData1.unita2 != undefined)
									exerData.unita2 = athExerData1.unita2;
								if(athExerData1.unitb2 != undefined)
									exerData.unitb2 = athExerData1.unitb2;
								if(athExerData1.sets3 != undefined)
									exerData.sets3 = athExerData1.sets3;
								if(athExerData1.unita3 != undefined)
									exerData.unita3 = athExerData1.unita3;
								if(athExerData1.unitb3 != undefined)
									exerData.unitb3 = athExerData1.unitb3;
							}
						}
					}
					exerciseData[exerAssocId] = exerData;
				}
			}
			else{
				for (var key1 in strengthSessionData.exercises) {
					let exerAssocId = strengthSessionData.exercises[key1]._id;
					exerciseData[exerAssocId] = {sets: '', unita: '', unitb: '', sets1: '', unita1: '', unitb1: '', sets2: '', unita2: '', unitb2: '', sets3: '', unita3: '', unitb3: ''};
				}
			}
			assositateDates.push({sessAssocId, daterr, days, exerciseData});
		}
	}
	
	cnt = 0;
	for (var key in strengthSessionData.exercises) {
		let unitAvalue = await UnitA.findOne({ '_id': strengthSessionData.exercises[key].unit_a_value },'name');
		
		componentArr.push({
			'id': cnt,
			'exerAssocId': strengthSessionData.exercises[key]._id,
			'exercise_id': strengthSessionData.exercises[key].exercise_id,
			'data': strengthSessionData.exercises[key].title,
			'pic1': strengthSessionData.exercises[key].pic1,
			'pic2': strengthSessionData.exercises[key].pic2,
			'pic3': strengthSessionData.exercises[key].pic3,
			'strength_body_img': strengthSessionData.exercises[key].strength_body_img,
			'unit_a_value': unitAvalue.name,
			'unit_b_value': strengthSessionData.exercises[key].unit_b_value
		});
		cnt++;
	}
	
	finalArray['session_dates'] = assositateDates;
	finalArray['strength_data'] = componentArr;
	finalArray['session_data'] = {title: strengthSessionData.title, comments: strengthSessionData.description};
	return res
		.status(200)
		.json(finalArray);
}

let saveStrengthSessionInfoAthlete = (req, res) => {
	let programId = req.body.programId;
	let sessionId = req.body.sessionId;
	let exarr = req.body.exarr;
	let clubId = req.body.clubId;
	let plannerId = req.body.plannerId;
	let athleteId = req.body.athleteId;
	
	AthleteStrengthData.findOne({clubId, athleteId, plannerId})
		.then(strengthData => {
			if(strengthData == null || strengthData == undefined){
				let programsData = [];
				programsData.push({programId: mongoose.Types.ObjectId(programId), sessionsData: []});
				
				let strengthObj = {};
				strengthObj['clubId'] = mongoose.Types.ObjectId(clubId);
				strengthObj['athleteId'] = athleteId;
				strengthObj['plannerId'] = mongoose.Types.ObjectId(plannerId);
				strengthObj['programsData'] = programsData;
				
				strengthData = new AthleteStrengthData(strengthObj);
			}
			
			strengthData.programsData.forEach((program, ind) => {
				if(program.programId == programId){
					if(program.sessionsData.length > 0){
						program.sessionsData.forEach((session, ind1) => {
							if(exarr[session.sessionAssocId] != undefined){
								if(session.exercisesData.length > 0){
									for (let key in session.exercisesData) {
										//let exerciseAssocId = item.exercisesData[key].exerciseAssocId.toString();
										if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId] != undefined){
											//console.log(exarr[item._id], exerciseAssocId);
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].sets1 != undefined)
												session.exercisesData[key].sets1 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].sets1;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unita1 != undefined)
												session.exercisesData[key].unita1 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unita1;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unitb1 != undefined)
												session.exercisesData[key].unitb1 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unitb1;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].sets2 != undefined)
												session.exercisesData[key].sets2 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].sets2;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unita2 != undefined)
												session.exercisesData[key].unita2 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unita2;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unitb2 != undefined)
												session.exercisesData[key].unitb2 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unitb2;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].sets3 != undefined)
												session.exercisesData[key].sets3 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].sets3;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unita3 != undefined)
												session.exercisesData[key].unita3 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unita3;
											if(exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unitb3 != undefined)
												session.exercisesData[key].unitb3 = exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId].unitb3;
											
											delete exarr[session.sessionAssocId][session.exercisesData[key].exerciseAssocId];
										}
									}
								}
								
								for (let key1 in exarr[session.sessionAssocId]) {
									let exerData = {exerciseAssocId: key1};
									if(exarr[session.sessionAssocId][key1].sets1 != undefined)
										exerData.sets1 = exarr[session.sessionAssocId][key1].sets1;
									if(exarr[session.sessionAssocId][key1].unita1 != undefined)
										exerData.unita1 = exarr[session.sessionAssocId][key1].unita1;
									if(exarr[session.sessionAssocId][key1].unitb1 != undefined)
										exerData.unitb1 = exarr[session.sessionAssocId][key1].unitb1;
									if(exarr[session.sessionAssocId][key1].sets2 != undefined)
										exerData.sets2 = exarr[session.sessionAssocId][key1].sets2;
									if(exarr[session.sessionAssocId][key1].unita2 != undefined)
										exerData.unita2 = exarr[session.sessionAssocId][key1].unita2;
									if(exarr[session.sessionAssocId][key1].unitb2 != undefined)
										exerData.unitb2 = exarr[session.sessionAssocId][key1].unitb2;
									if(exarr[session.sessionAssocId][key1].sets3 != undefined)
										exerData.sets3 = exarr[session.sessionAssocId][key1].sets3;
									if(exarr[session.sessionAssocId][key1].unita3 != undefined)
										exerData.unita3 = exarr[session.sessionAssocId][key1].unita3;
									if(exarr[session.sessionAssocId][key1].unitb3 != undefined)
										exerData.unitb3 = exarr[session.sessionAssocId][key1].unitb3;
									session.exercisesData.push(exerData);
								}
								delete exarr[session.sessionAssocId];
							}
						});
						for (let key2 in exarr) {
							let exercisesData = [];
							for (let key3 in exarr[key2]) {
								let exerData = {exerciseAssocId: key3};
								if(exarr[key2][key3].sets1 != undefined)
									exerData.sets1 = exarr[key2][key3].sets1;
								if(exarr[key2][key3].unita1 != undefined)
									exerData.unita1 = exarr[key2][key3].unita1;
								if(exarr[key2][key3].unitb1 != undefined)
									exerData.unitb1 = exarr[key2][key3].unitb1;
								if(exarr[key2][key3].sets2 != undefined)
									exerData.sets2 = exarr[key2][key3].sets2;
								if(exarr[key2][key3].unita2 != undefined)
									exerData.unita2 = exarr[key2][key3].unita2;
								if(exarr[key2][key3].unitb2 != undefined)
									exerData.unitb2 = exarr[key2][key3].unitb2;
								if(exarr[key2][key3].sets3 != undefined)
									exerData.sets3 = exarr[key2][key3].sets3;
								if(exarr[key2][key3].unita3 != undefined)
									exerData.unita3 = exarr[key2][key3].unita3;
								if(exarr[key2][key3].unitb3 != undefined)
									exerData.unitb3 = exarr[key2][key3].unitb3;
								exercisesData.push(exerData);
							}
							program.sessionsData.push({sessionAssocId: key2, exercisesData});
						}
					}
					else{
						for (let key in exarr) {
							let exercisesData = [];
							for (let key1 in exarr[key]) {
								let exerData = {exerciseAssocId: key1};
								if(exarr[key][key1].sets1 != undefined)
									exerData.sets1 = exarr[key][key1].sets1;
								if(exarr[key][key1].unita1 != undefined)
									exerData.unita1 = exarr[key][key1].unita1;
								if(exarr[key][key1].unitb1 != undefined)
									exerData.unitb1 = exarr[key][key1].unitb1;
								if(exarr[key][key1].sets2 != undefined)
									exerData.sets2 = exarr[key][key1].sets2;
								if(exarr[key][key1].unita2 != undefined)
									exerData.unita2 = exarr[key][key1].unita2;
								if(exarr[key][key1].unitb2 != undefined)
									exerData.unitb2 = exarr[key][key1].unitb2;
								if(exarr[key][key1].sets3 != undefined)
									exerData.sets3 = exarr[key][key1].sets3;
								if(exarr[key][key1].unita3 != undefined)
									exerData.unita3 = exarr[key][key1].unita3;
								if(exarr[key][key1].unitb3 != undefined)
									exerData.unitb3 = exarr[key][key1].unitb3;
								exercisesData.push(exerData);
							}
							program.sessionsData.push({sessionAssocId: key, exercisesData});
						}
					}
					exarr = '';
				}
			});
			if(exarr != ''){
				let programData = {programId: mongoose.Types.ObjectId(programId), sessionsData: []};
				
				for (let key in exarr) {
					let exercisesData = [];
					for (let key1 in exarr[key]) {
						let exerData = {exerciseAssocId: key1};
						if(exarr[key][key1].sets1 != undefined)
							exerData.sets1 = exarr[key][key1].sets1;
						if(exarr[key][key1].unita1 != undefined)
							exerData.unita1 = exarr[key][key1].unita1;
						if(exarr[key][key1].unitb1 != undefined)
							exerData.unitb1 = exarr[key][key1].unitb1;
						if(exarr[key][key1].sets2 != undefined)
							exerData.sets2 = exarr[key][key1].sets2;
						if(exarr[key][key1].unita2 != undefined)
							exerData.unita2 = exarr[key][key1].unita2;
						if(exarr[key][key1].unitb2 != undefined)
							exerData.unitb2 = exarr[key][key1].unitb2;
						if(exarr[key][key1].sets3 != undefined)
							exerData.sets3 = exarr[key][key1].sets3;
						if(exarr[key][key1].unita3 != undefined)
							exerData.unita3 = exarr[key][key1].unita3;
						if(exarr[key][key1].unitb3 != undefined)
							exerData.unitb3 = exarr[key][key1].unitb3;
						exercisesData.push(exerData);
					}
					programData.sessionsData.push({sessionAssocId: key, exercisesData});
				}
				strengthData.programsData.push(programData);
			}
			
			strengthData.save()
				.then(() => res.json({success: true, msg: 'Exercises data updated successfully'}))
				.catch(err => res.json({success: false, msg: 'Error: '+err}));
		})
		.catch(err => res.json({success: false, msg: 'Error: '+err}));
}

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

module.exports = {
	saveStrengthSession,
	getSessionById,
	updateSessionById,
	getsearchFormData,
	searchAdvanceSession,
	searchSimpleSession,
	searchSimpleStrengthSession,
	searchAdvanceStrengthSession,
	getSimpleSession,
	removeSimpleSession,
	getDescription,
	getStrengthSessionViews,
	saveStrengthSessionInfo,
	getStrengthSessionViewsAthlete,
	saveStrengthSessionInfoAthlete
};