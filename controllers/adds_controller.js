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

var Exercise = mongoose.model('exercises');
var bodyStr = mongoose.model('bodystrenght');

// link zy
var FamilyName = mongoose.model('FamilyNames');

// adds zy
var AddSeesion = mongoose.model('AddSessions');

// adds zy
var addSeesion = async (req, res) => {
    let isUpdate = false;

    const addSeesionData = await AddSeesion.findOne({ 'title': req.body.title});
    console.log(addSeesionData);
    if (addSeesionData !=null) {
        if(req.body.type === 'save'){
            isUpdate = true;
        }else{

            res.send({
                message:'Title already exists!',
                status: 400
            });
            return;
        }
    }
    if(isUpdate){
        //chart data  zy
        //fileds add zy
        //desJson add zy
        AddSeesion.findOneAndUpdate(
            { title: req.body.title },
            {
                familyName: req.body.familyName,
                activityType: req.body.activityType,
                athleteLevel: req.body.athleteLevel,
                sportsKeyWords: req.body.sportsKeywords,
                components: req.body.components,
                chartData:req.body.chatData,
                totalDuration: req.body.totalDuration,
                totalLoad: req.body.totalLoad,
                clubId:mongoose.Types.ObjectId(req.body.clubId),
                addedBy:req.body.addedBy,
                description:"This is a description!",
                videos:req.body.videos,
                image:req.body.image,
                tags:req.body.tags,
                hasWarmCool:req.body.hasWarmCool,
                hasWarm:req.body.hasWarm,
                hasCool:req.body.hasCool,
                stageType:req.body.stageType,
                desJson:req.body.desJson,
                steps: [
                    {
                        "type": "WorkoutStep",
                        "stepId": 1475,
                        "stepOrder": 1,
                        "intensity": "WARMUP",
                        "description": null,
                        "durationType": "CALORIES",
                        "durationValue": 2,
                        "durationValueType": null,
                        "targetType": "OPEN",
                        "targetValue": null,
                        "targetValueLow": null,
                        "targetValueHigh": null,
                        "targetValueType": null
                    },
                    {
                        "type": "WorkoutRepeatStep",
                        "stepId": 1476,
                        "stepOrder": 2,
                        "repeatType": null,
                        "repeatValue": null,
                        "steps": [
                            {
                                "type": "WorkoutStep",
                                "stepId": 1477,
                                "stepOrder": 5,
                                "intensity": "ACTIVE",
                                "description": null,
                                "durationType": "TIME",
                                "durationValue": 120,
                                "durationValueType": null,
                                "targetType": "POWER",
                                "targetValue": 1,
                                "targetValueLow": null,
                                "targetValueHigh": null,
                                "targetValueType": null
                            },
                            {
                                "type": "WorkoutStep",
                                "stepId": 1478,
                                "stepOrder": 6,
                                "intensity": "ACTIVE",
                                "description": null,
                                "durationType": "DISTANCE",
                                "durationValue": 32186.880859,
                                "durationValueType": "MILE",
                                "targetType": "OPEN",
                                "targetValue": null,
                                "targetValueLow": null,
                                "targetValueHigh": null,
                                "targetValueType": null
                            }
                        ]
                    }
                ]
            },
            function (err, editedUser) {
                if (!err) {
                    res.send({
                        message:'Update session success.',
                        status: 200
                    });
                } else {
                    console.log(err);
                    res.send({
                        message:'Update session fail!',
                        status: 400
                    });
                }
            }
        );
    }else{
        //chart data  zy
        //fileds add zy
        var addsessionModel = new AddSeesion({
            title: req.body.title,
                familyName: req.body.familyName,
                activityType: req.body.activityType,
                athleteLevel: req.body.athleteLevel,
                sportsKeyWords: req.body.sportsKeywords,
                components: req.body.components,
                chartData:req.body.chatData,
                totalDuration: req.body.totalDuration,
                totalLoad: req.body.totalLoad,
                clubId:mongoose.Types.ObjectId(req.body.clubId),
                addedBy:req.body.addedBy,
                description:"This is a description!",
                videos:req.body.videos,
                image:req.body.image,
                tags:req.body.tags,
                hasWarmCool:req.body.hasWarmCool,
                hasWarm:req.body.hasWarm,
                hasCool:req.body.hasCool,
                stageType:req.body.stageType,
                desJson:req.body.desJson,
                steps: [
                    {
                        "type": "WorkoutStep",
                        "stepId": 1475,
                        "stepOrder": 1,
                        "intensity": "WARMUP",
                        "description": null,
                        "durationType": "CALORIES",
                        "durationValue": 2,
                        "durationValueType": null,
                        "targetType": "OPEN",
                        "targetValue": null,
                        "targetValueLow": null,
                        "targetValueHigh": null,
                        "targetValueType": null
                    },
                    {
                        "type": "WorkoutRepeatStep",
                        "stepId": 1476,
                        "stepOrder": 2,
                        "repeatType": null,
                        "repeatValue": null,
                        "steps": [
                            {
                                "type": "WorkoutStep",
                                "stepId": 1477,
                                "stepOrder": 5,
                                "intensity": "ACTIVE",
                                "description": null,
                                "durationType": "TIME",
                                "durationValue": 120,
                                "durationValueType": null,
                                "targetType": "POWER",
                                "targetValue": 1,
                                "targetValueLow": null,
                                "targetValueHigh": null,
                                "targetValueType": null
                            },
                            {
                                "type": "WorkoutStep",
                                "stepId": 1478,
                                "stepOrder": 6,
                                "intensity": "ACTIVE",
                                "description": null,
                                "durationType": "DISTANCE",
                                "durationValue": 32186.880859,
                                "durationValueType": "MILE",
                                "targetType": "OPEN",
                                "targetValue": null,
                                "targetValueLow": null,
                                "targetValueHigh": null,
                                "targetValueType": null
                            }
                        ]
                    }
                ]
        })
        addsessionModel
            .save()
            .then(() => {
                res.send({
                    message:'Add session success.',
                    status: 200
                });
            })
            .catch(error => {
                console.log(error);
                res.send({
                    message:'Add  seesion  fail!',
                    status: 400
                });
            })
    }
}

module.exports = {
    addSeesion,

}