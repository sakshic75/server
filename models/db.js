/**
 * =======================================
 * CONNECTING TO MONGO ATLAS FROM SERVER
 * =======================================
 * @date created: 22 August 2019
 * @authors: Uvin Abeysinghe
 *
 * The db.js is used for connecting the server to mongoDB so that data storage and retrieval can take place
 *
 */

const mongoose = require('mongoose');

var path = require("path");

const url = require(path.join(__dirname, '..', 'config/keys')).MongoURI;

// Connect to MongoDB using the MongoURI
mongoose.connect(url,  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ,  function (err) {
    if(!err){
        console.log("connected to the DB");
    }else{
        console.log('mongoose error', err);
    }

});

require('./workoutgrades'); 
require('./users');
require('./events');
require('./groups');
require('./posts');
require('./planners');
require('./programs');
require('./sessions');
require('./session-activity-types');
require('./session-sports-keywords');
require('./session-components');
require('./family-names');
require('./exercises');
require('./phases');
require('./coach_programs');
require('./activity');
require('./components');
require('./exercises');
require('./bodystrength');
require('./unitsa');
require('./units_b');
require('./rpe');
require('./strength_session');
require('./athlete_strength_data');
require('./teams');
require('./team-events');
require('./memberships');
require('./addsessions');
require('./membership-relations');
require('./membership-levels');
require('./membership-planners');
require('./membership-Invoices');