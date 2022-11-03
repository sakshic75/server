const router = require("express").Router();
const mongoose = require("mongoose");
const Memberships = mongoose.model("Memberships");
const MembershipsRelations = mongoose.model("membership-relations");
const MembershipLevels = mongoose.model("MembershipLevels");
const Teams = mongoose.model("Teams");
const User = mongoose.model('users');

const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
var upload = multer({ storage: storage });

router
  .route("/uploadMembershipFile")
  .post(upload.single("membershipUpload"), async (req, res) => {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      //return next(error);
    }
    res.send(file);
  });

router.route("/").get((req, res) => {
  Memberships.find()
    .then((memberships) => res.json({ success: true, memberships }))
    .catch((err) => res.json({ success: false, msg: "Error: " + err }));
});

router.route("/getByTeam").post(async (req, res) => {
  let team = await Teams.findById(req.body.teamId);
  let user = await User.findById(req.body.userId);
  Memberships.find({ clubId: req.body.teamId })
    .then(async (memberships) => {
      let coaches = await User.find({_id: {$in: req.body.coaches}, status: 'active'}, 'firstName lastName email profilePicture');
      let isAdminOrJoined = false;
      if(user.teams.includes(team._id) || team.creatorId == req.body.userId)
        isAdminOrJoined = true;
      res.json({ success: true, memberships, coaches, isAdminOrJoined })
    })
    .catch((err) => res.json({ success: false, msg: "Error: " + err }));
});

router.route("/addMembership").post(async (req, res) => {
  const oldMembership = await Memberships.find({ title: req.body.title });
  if (oldMembership.length > 0) {
    res.json({
      success: false,
      msg: "Error: Membership with this title already exists",
    });
  } else {
    let membership = req.body;
    membership.status = "active";
    membership.order = 1;
    membership.membersCount = 0;
    membership.memberRequestsCount = 0;
	
	/*let membershipLevel = {clubId: req.body.clubId, levelName: 'No Level'};
    let newMembershipLevel = new MembershipLevels(membershipLevel);
    newMembershipLevel.save().then((resp) => { console.log('added'); }).catch((err) => console.log(err));
	
	membershipLevel = {clubId: req.body.clubId, levelName: 'Ironman Advance'};
	newMembershipLevel = new MembershipLevels(membershipLevel);
    newMembershipLevel.save().then((resp) => { console.log('added'); }).catch((err) => console.log(err));
	
	membershipLevel = {clubId: req.body.clubId, levelName: 'Ironman Intermediate'};
	newMembershipLevel = new MembershipLevels(membershipLevel);
    newMembershipLevel.save().then((resp) => { console.log('added'); }).catch((err) => console.log(err));
	
	membershipLevel = {clubId: req.body.clubId, levelName: 'Ironman First Timer'};
	newMembershipLevel = new MembershipLevels(membershipLevel);
    newMembershipLevel.save().then((resp) => { console.log('added'); }).catch((err) => console.log(err));
	
	membershipLevel = {clubId: req.body.clubId, levelName: 'Half Ironman Advance'};
	newMembershipLevel = new MembershipLevels(membershipLevel);
    newMembershipLevel.save().then((resp) => { console.log('added'); }).catch((err) => console.log(err));*/

    const newMembership = new Memberships(membership);
    newMembership
      .save()
      .then(async (resp) => {
        const fs = require("fs");
        const os = require("os");
        let oldPath = (newPath = ""),
          delim = "/";
        if (os.type() == "Windows_NT") delim = "\\";

        oldPath = "uploads" + delim + "temp" + delim + req.body.logo;
        newPath = "uploads" + delim + "memberships" + delim + req.body.logo;
        fs.rename(oldPath, newPath, function (err) {});

        let memberships = await Memberships.find({
          clubId: membership.clubId,
        });

        res.json({ success: true, memberships, msg: "Membership added!" });
      })
      .catch((err) => res.json({ success: false, msg: "Error: " + err }));
  }
});

router.route("/get").post((req, res) => {
  Memberships.findById(req.body.membershipId)
    .then((membership) => res.json({ success: true, membership }))
    .catch((err) => res.json({ success: false, msg: "Error: " + err }));
});

router.route("/:id").delete((req, res) => {
  Memberships.findByIdAndDelete(req.params.id)
    .then(() => res.json("Membership deleted!"))
    .catch((err) => res.json("Error: " + err));
});

router.route("/updateMembership").post(async (req, res) => {
  let membershipData = req.body.membership;
  let logo = req.body.logo;
  const oldMembership = await Memberships.find({
    _id: { $ne: membershipData._id },
    slug: membershipData.slug,
  });
  if (oldMembership.length > 0) {
    res.json({
      success: false,
      msg: "Error: Membership with this title already exists",
    });
  } else {
    Memberships.findById(membershipData._id)
      .then((membership) => {
        let oldFileName = membership.logo;

        membership.title = membershipData.title;
        membership.slug = membershipData.slug;
        membership.description = membershipData.description;
        membership.logo = membershipData.logo;
        membership.coverPhoto = membershipData.coverPhoto;
        membership.isPublic = membershipData.isPublic;
        membership.type = membershipData.type;
        membership.paymentType = membershipData.paymentType;
        membership.intervalType = membershipData.intervalType;
        membership.interval = membershipData.interval;
        membership.startDate = membershipData.startDate;
        membership.endDate = membershipData.endDate;
        membership.totalPayments = membershipData.totalPayments;
        membership.status = membershipData.status;
        membership.trial = membershipData.trial;
        membership.trialType = membershipData.trialType;
        membership.trialPeriod = membershipData.trialPeriod;
        membership.price = membershipData.price;
        membership.discountPrice = membershipData.discountPrice;
        membership.order = membershipData.order;
        membership.coaches = membershipData.coaches;

        membership
          .save()
          .then((resp) => {
            if (logo != "") {
              const fs = require("fs");
              const os = require("os");
              let oldPath = (newPath = ""),
                delim = "/";
              if (os.type() == "Windows_NT") delim = "\\";

              oldFilePath =
                "uploads" + delim + "memberships" + delim + oldFileName;
              fs.unlink(oldFilePath, function (err) {});

              oldPath = "uploads" + delim + "temp" + delim + logo;
              newPath = "uploads" + delim + "memberships" + delim + logo;
              fs.rename(oldPath, newPath, function (err) {});
            }

            Memberships.find({ clubId: membership.clubId })
              .then((memberships) =>
                res.json({
                  success: true,
                  memberships,
                  msg: "Membership updated!",
                })
              )
              .catch((err) =>
                res.json({ success: false, msg: "Error: " + err })
              );
          })
          .catch((err) => res.json({ success: false, msg: "Error: " + err }));
      })
      .catch((err) => res.json({ success: false, msg: "Error: " + err }));
  }
});

router.route("/updateUpgradePaths").post(async (req, res) => {
  let membershipData = req.body.membership;
  Memberships.findById(membershipData._id)
    .then((membership) => {
      membership.subscribeWithoutMembership = membershipData.subscribeWithoutMembership;
      membership.updateDenied = membershipData.updateDenied;
      membership.updateReplace = membershipData.updateReplace;

      membership
        .save()
        .then((resp) => {
          res.json({ success: true, msg: "Membership upgrade paths updated!" });
        })
        .catch((err) => res.json({ success: false, msg: "Error: " + err }));
    })
    .catch((err) => res.json({ success: false, msg: "Error: " + err }));
});

router.route("/getMembershipLevels").post(async (req, res) => {
  MembershipLevels.find({clubId: req.body.clubId})
    .then((membershipLevels) => {
      res.json({ success: true, membershipLevels });
    })
    .catch((err) => res.json({ success: false, msg: "Error: " + err }));
});

router.route("/getUserMemberships").post(async (req, res) => {
  let team = await Teams.findOne({ slug: req.body.teamSlug });
  let user = await User.findById(req.body.userId);
  let isAdminOrJoined = false;
  if(user.teams.includes(team._id) || team.creatorId == req.body.userId)
    isAdminOrJoined = true;

  let userMemberships = [];
  let updateReplace = [];
  let deniedMemberships = [];
  let usersubscribedmembership=[];
  let usersubmemids=[];
  
  userMemberships = await MembershipsRelations.find({
    clubId: team._id,
    userId: req.body.userId,
  });
  
  memberships = await Memberships.find({
    clubId: team._id,
    creatorId: req.body.userId,
  });
  
  for (var key1 in userMemberships){
    let memId= userMemberships[key1].membershipId;
    let memdata=await Memberships.findOne({_id:memId});
    let memobj={
      clubId:memdata.clubId,
      price:memdata.price,
      slug:memdata.slug,
      title:memdata.title,
      status:userMemberships[key1].status,
      userId: userMemberships[key1].userId,
      description:memdata.description,
    };
    
    usersubscribedmembership.push(memobj);
    usersubmemids.push(memId);
  }
  
  for (var key in memberships) {
    let update = memberships[key].updateReplace;
    let denied = memberships[key].updateDenied;
      for (var key1 in update) {
        updateReplace.push(update[key1]);
    }
    for (var key2 in denied) {
     // deniedMemberships.push(denied[key2]);
      usersubmemids.push(denied[key2]);
    }
  }
  
  Memberships.find({ clubId: team._id })
    .then((memberships) => {
      res.json({ success: true, team, memberships, userMemberships, updateReplace, deniedMemberships, usersubscribedmembership, usersubmemids:usersubmemids, isAdminOrJoined });
    })
    .catch((err) => res.json({ success: false, msg: "Error: " + err }));
});

module.exports = router;
