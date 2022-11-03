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

var Rpe = mongoose.model('rpe');

// Function for creating a new group
var createRpe = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a parameter',
        })
    }
    const rpe = new Rpe({
        name: req.body.name,
        value: req.body.value,
    })
    if (!rpe) {
        return res.status(400).json({ success: false, error: err })
    }
    rpe
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: rpe._id,
                message: 'Rpe created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Rpe not created!',
            })
        })
}

var getAllRpe = function (req, res) {
    Rpe.find(function (err, rpe) {
        if (!err) {
            res.send(rpe);
        } else {
            res.send(err);
        }
    });
};
var getload = function (req, res) {
    let rpeId = req.body._id;
    console.log(rpeId);

    Rpe.findOne({_id: rpeId}, function (err, rpedata) {
        if (!err) {
            res.send(rpedata);
        } else {
            res.send(err);
        }
    });
};



module.exports = {
    createRpe,
    getAllRpe,
    getload,

}