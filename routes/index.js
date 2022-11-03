var express = require('express');
const router = require("express").Router();
const cron = require("node-cron");
/* GET users listing. */
// const mongoose = require("mongoose");
// const MembershipsRelations = mongoose.model('membership-relations');

// cron.schedule("* * * * *", function() {
 
//   memdata=  MembershipsRelations.findOne({membershipId:'60ae641e5a9f7e1594aef4e3'});
//   console.log(memdata.membershipId);
// });

router.get('/', function(req, res, next) {
  res.send('MSE CoachingMate Server');
});

module.exports = router;