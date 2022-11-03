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

var UnitA = mongoose.model('units_a');
var UnitB = mongoose.model('units_b');

// Function for creating a new group
var createUnitA = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a parameter',
        })
    }
    const unita = new UnitA({
        name: req.body.unita_name,
    })
    if (!unita) {
        return res.status(400).json({ success: false, error: err })
    }
    unita
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: unita._id,
                message: 'Unit A  created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Unit A not created!',
            })
        })
}
var createUnitB = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a parameter',
        })
    }
    const unitb = new UnitB({
        unit_a_id: req.body.unita_id, 
        unit_a_name: req.body.unita_name,
        unit_b_name: req.body.unitb_name,
        sets: req.body.sets,
    })
    if (!unitb) {
        return res.status(400).json({ success: false, error: err })
    }
    unitb
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: unitb._id,
                message: 'Unit b  created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Unit b not created!',
            })
        })
}
var getunitA = function (req, res) {
    UnitA.find(function(err, unita){
        if(!err){
            res.send(unita);
        } else {
            res.send(err);
        }
    });
};
var getunitbByunitaId = function (req, res) {
    let unit_a_id= req.body.unita_id;
    UnitB.find({unit_a_id},function(err, unitb){
        if(!err){
            res.send(unitb);
        } else {
            res.send(err);
        }
    });
};



module.exports = {
    createUnitA,
    createUnitB,
    getunitA,
    getunitbByunitaId,

}