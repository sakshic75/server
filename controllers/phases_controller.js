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

var Phase = mongoose.model('phases');

// Function for creating a new group
var createPhase = function(req,res){
    var newphase = new Phase({
        name: req.body.name,
        colorcode: req.body.colorcode,
    });
    newphase.save(function(err, createPhase){
        if (!err){
            res.send(createPhase);
        }
        else{
            console.log(err);
            res.send(err)
        }
    });
};

var getPhases = function (req, res) {
    Phase.find(function(err, allphases){
        if(!err){
            res.send(allphases);
        } else {
            res.send(err);
        }
    });
};


module.exports.createPhase = createPhase;
module.exports.getPhases = getPhases;
