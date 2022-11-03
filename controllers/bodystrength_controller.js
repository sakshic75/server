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

var bodyStrength = mongoose.model('bodystrenght');

// Function for creating a new group
var createStrenght = function(req,res){
    var newstrenght = new bodyStrength({
        title: req.body.title,
        icon: req.body.icon,
    });
    newstrenght.save(function(err, createStrenght){
        if (!err){
            res.send(createStrenght);
        }
        else{
            console.log(err);
            res.send(err)
        }
    });
};

var getbodyStrenght = function (req, res) {
    var  strengthArr= [];
    bodyStrength.find(function(err, alltrength){
        if(!err){
            for (var key in alltrength) {
                //activityArr['id']=allactivites[key]._id;
                strengthArr.push({'_id': alltrength[key]._id,'icon':"http://localhost:3001/uploads/bodystrength/"+alltrength[key].icon,'title':alltrength[key].title});
            }

            res.send(strengthArr);
        } else {
            res.send(err);
        }
    });
  
};
module.exports.createStrenght = createStrenght;
module.exports.getbodyStrenght = getbodyStrenght;
