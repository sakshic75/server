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

// Function for creating a new group
var createExercise = async (req, res) => {
    const body = req.body;
    var excomponent = req.body.exercise_components;
    var exComponentArr = [];
    if (excomponent != null) {
        for (var key in excomponent) {
            exComponentArr.push(excomponent[key].value);
        }
    }

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a parameter',
        })
    }
    const exerciseData = await Exercise.findOne({ 'title': req.body.exercise_title});
    if (exerciseData !=null) {
        return res.status(500).json({
            success: false,
            error: 'exercise title already exists',
        })
    }
    const strengthData = await bodyStr.findOne({ '_id': req.body.strength});
    const exercise = new Exercise({
        title: req.body.exercise_title,
        type: req.body.exercise_type,
        description: req.body.ex_description,
        tips: req.body.ex_tips,
        pic1: req.body.ex_img_one,
        pic2: req.body.ex_img_two,
        pic3: req.body.ex_img_three,
        video: req.body.video_link,
        bodystrenght: strengthData,
        components: exComponentArr,
        addedBy: 'olie',
        clubId:  req.body.clubId,
    })
    if (!exercise) {
        return res.status(400).json({ success: false, error: err })
    }
    exercise
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: exercise._id,
                message: 'Exercise  created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Exercise not created!',
            })
        })
}
var getComponents = async (req, res) => {
    var componentArr = [];
    await Components.find({}, 'name _id', (err, components) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!components.length) {
            return res
                .status(404)
                .json({ success: false, error: `Components not found` })
        }
        for (var key in components) {

            componentArr.push({ 'value': components[key]._id, 'label': components[key].name });
        }

        return res.status(200).send(componentArr)
    }).catch(err => console.log(err))
}
var ValidateTitle = function (req, res) {
    let title = req.body.title;
    exercise.findOne({ title }, function (err, exercise) {
        if (exercise) {
            res.status(201).send(exercise);
        } else {
            res.send({ 'success': 'true' });
        }
    });
};
exImageUpload = async (req, res) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        //return next(error)
    }
    res.send(file)
}
var getexercises = async (req, res) => {
    var componentArr = [];
    await Components.find({}, 'name _id', (err, components) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!components.length) {
            return res
                .status(404)
                .json({ success: false, error: `Components not found` })
        }
        for (var key in components) {

            componentArr.push({ 'value': components[key]._id, 'label': components[key].name });
        }

        return res.status(200).send(componentArr)
    }).catch(err => console.log(err))
}
var searchexercises = async (req, res) => {
    let groupQuery = '.*' + req.body.ssDetail.ss_title + '.*';
    let exerciseType = req.body.ssDetail.exercise_type;
    let strengthBody = req.body.ssDetail.strength_body;
    let clubId=req.body.clubId;
    let condition = req.body.ssDetail.ss_and;
    var componentArr = [];
    var parms = {};
    if (exerciseType != '') {
        parms['type'] = exerciseType;
    }
    if (strengthBody != '') {
       // parms['bodystrenght'] = strengthBody;
    }
    //parms['clubId']=clubId;
    //parms['bodystrenght._id']='5e04558ddd73ff138cc91a20';
    var recrdArr = [{ 'id': 0, 'data': 'no record found' }];
    cnt = 0;
    if (condition == 'and') {
        
        Exercise.
            find({ $and: [{ title: { $regex: groupQuery } }, parms] })
            // .populate({path:'bodystrenght'})
            .exec(function (err, exercise) {
                if (err) {
                    return res.status(400).json({ success: false, message: err })
                }
                if (!exercise.length) {
                    return res
                        .status(200)
                        .json(recrdArr)
                }
                for (var key in exercise) {
                    componentArr.push({ 
                        'id': cnt, 
                        'exercise_id': exercise[key]._id,
                         'data': exercise[key].title, 
                         'pic1': exercise[key].pic1, 
                         'pic2': exercise[key].pic2, 
                         'pic3': exercise[key].pic3, 
                         'type': exercise[key].type,
                         'bodystrenght': exercise[key].bodystrenght.icon,
                         'unit_a_value':'',
                         'unit_b_value':'',
                         'order':'' 
                        });
                    cnt++;
                }
                return res.status(200).json(componentArr);
            });

    }
    if (condition == 'or') {
        Exercise.
            find({ $or: [{ title: { $regex: groupQuery } }, parms] })
            // populate({ path: 'Products', select: 'product_name sku' })
            .exec(function (err, exercise) {
                if (err) {
                    return res.status(400).json({ success: false, message: err })
                }
                if (!exercise.length) {
                    return res
                        .status(200)
                        .json(recrdArr)
                }
                for (var key in exercise) {
                    componentArr.push({ 
                        'id': cnt, 
                        'exercise_id': exercise[key]._id,
                         'data': exercise[key].title, 
                         'pic1': exercise[key].pic1, 
                         'pic2': exercise[key].pic2, 
                         'pic3': exercise[key].pic3, 
                         'type': exercise[key].type,
                         'bodystrenght': exercise[key].bodystrenght.icon,
                         'unit_a_value':'',
                         'unit_b_value':'',
                         'order':'' 
                        });
                    cnt++;
                }

                return res.status(200).json(componentArr);
            });
    }
}
var getExerciseById = async (req, res) => {
    let exercise_id = req.body;
    let exConpoments = [];
    var mainArr = {};
    Exercise.findOne(exercise_id, function (err, exercise) {
        if (exercise) {
            for (var key in exercise.components) {
                exConpoments.push({ 'value': exercise.components[key], 'label': exercise.components[key] });
            }
            mainArr['id'] = exercise._id,
                mainArr['title'] = exercise.title,
                mainArr['pic1'] = exercise.pic1,
                mainArr['pic2'] = exercise.pic2,
                mainArr['pic3'] = exercise.pic3,
                mainArr['description'] = exercise.description,
                mainArr['tips'] = exercise.tips,
                mainArr['type'] = exercise.type,
                mainArr['video'] = exercise.video,
                mainArr['strength'] = exercise.bodystrenght,
                mainArr['components'] = exConpoments,
            res.status(200).send(mainArr);
        } else {
            res.send({ 'success': 'true' });
        }
    });
}
var updateExerciseById = async (req, res) => {
    
    //  let exercise_id = req.body.exercise_id;
    var excomponent = req.body.exdetail.exercise_components;
    var exComponentArr = [];
    if (excomponent != '') {
        for (var key in excomponent) {
            exComponentArr.push(excomponent[key].value);
        }
    }
    const filter = { _id: req.body.exdetail.exercise_id };
    const update = {
        title: req.body.exdetail.exercise_title,
        type: req.body.exdetail.exercise_type,
        description: req.body.exdetail.ex_description,
        tips: req.body.exdetail.ex_tips,
        pic1: req.body.exdetail.ex_img_one,
        pic2: req.body.exdetail.ex_img_two,
        pic3: req.body.exdetail.ex_img_three,
        video: req.body.exdetail.video_link,
        strength: req.body.exdetail.strength,
        components: exComponentArr,
        clubId:  req.body.clubId, 
    };
    Exercise.findOneAndUpdate(filter, update, (err, exercise) => {
        if (exercise) {
            res.status(200).send(exercise._id);
        } else {
            res.status(500).send({ 'success': 'false', 'error': err });
        }
    });
}

//link zy
var linkFamilyName = function (req, res) {
    let title = req.body.value;

    var queryToName = {};
    queryToName['name'] = new RegExp(title);

    FamilyName.find(queryToName, function (err, lists) {
        /*if (exercise) {
            res.status(201).send(exercise);
        } else {
            res.send({ 'success': 'true' });
        }*/
        var result = [];
        for (var i = 0; i < lists.length; i++) {
            result.push(lists[i].name);
        }
        res.send(result);
    });
};




module.exports = {
    getComponents,
    createExercise,
    exImageUpload,
    ValidateTitle,
    searchexercises,
    getExerciseById,
    updateExerciseById,
    linkFamilyName,

}