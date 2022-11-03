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

var Activity = mongoose.model('activity');
var SessionActivityTypes = mongoose.model('SessionActivityTypes');

// Function for creating a new group
var createActivity = function (req, res) {
    var newactivity = new Activity({
        title: req.body.title,
        activity_image: req.body.activity_image,
    });
    newactivity.save(function (err, createActivity) {
        if (!err) {
            res.send(createActivity);
        } else {
            console.log(err);
            res.send(err);
        }
    });
};

var getActivity = function (req, res) {
    var activityArr = [];
    Activity.find(function (err, allactivites) {
        if (!err) {
            for (var key in allactivites) {
                //activityArr['id']=allactivites[key]._id;
                activityArr.push({
                    _id: allactivites[key]._id,
                    title: allactivites[key].title,
                    image_name:
                        'http://localhost:3001/uploads/images/' +
                        allactivites[key].activity_image,
                });
            }

            res.send(activityArr);
        } else {
            res.send(err);
        }
    });
};

let getActivityByTitle = async (req, res) => {
    try {
        const activity = await Activity.findOne({ title: req.params.title });

        res.json(activity);
    } catch (err) {
        res.status(400).json(err);
    }
};

var getsessionActivity = async (req, res) => {
    var session = await SessionActivityTypes.find();
    return res.status(200).json(session);
};
module.exports.createActivity = createActivity;
module.exports.getActivity = getActivity;
module.exports.getActivityByTitle = getActivityByTitle;
module.exports.getsessionActivity = getsessionActivity;
