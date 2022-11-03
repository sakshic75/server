const router = require('express').Router();
const mongoose = require('mongoose');
const MembershipsRelations = mongoose.model('membership-relations');
const Memberships = mongoose.model('Memberships');
const MembershipInvoices = mongoose.model('MembershipInvoices');
const Users = mongoose.model('users');
const Teams = mongoose.model('Teams');

router.route('/add-user-membership').post(async (req, res) => {
    let input = req.body.membership;
    let userId = req.body.user_id;
    const oldMembership = await MembershipsRelations.find({
        membershipId: req.body._id,
    });
    if (oldMembership.length > 0) {
        res.json({
            success: false,
            msg: 'Error: Membership with this title already exists',
        });
    } else {
        let data = {
            clubId: input.clubId,
            userId: userId,
            membershipId: input._id,
            gatewayId: 'manual',
            type: input.type,
            paymentType: input.paymentType,
            intervalType: input.intervalType,
            startDate: input.startDate,
            expireDate: input.endDate,
            totalPayments: input.totalPayments,
            status: 'pending',
            trialCompleted: false,
            price: input.price.$numberDecimal,
            currentInvoiceNumber: 1,
        };
        const newMembership = new MembershipsRelations(data);
        newMembership.save(function (err, newMembership) {
            let gateWayId = 1;
            let startDate = new Date(new Date().getTime());
            let invoiceData = {
                clubId: input.clubId,
                userId: userId,
                membershipId: input._id,
                gatewayId: gateWayId,
                type: input.type,
                paymentType: input.paymentType,
                intervalType: input.intervalType,
                payDate: null,
                totalPayments: 1,
                invoiceStatus: 'pending',
                price: input.price.$numberDecimal,
                currentInvoiceNumber: 1,
                relationshipId: newMembership._id,
            };
            const membershipInvoice = new MembershipInvoices(invoiceData);
            membershipInvoice.save();

            //      let memberships =  MembershipsRelations.find({
            //     clubId: input.clubId,
            // });

            res.json({ success: true, msg: 'Membership added!' });
        });
        // .then(async (resp,memship) => {
        //     let gateWayId=1;
        //     let invoiceData={
        //         clubId: input.clubId,
        //         userId: userId,
        //         membershipId: input._id,
        //         gatewayId: gateWayId,
        //         type: input.type,
        //         paymentType: input.paymentType,
        //         intervalType: input.intervalType,
        //         payDate: input.startDate,
        //         totalPayments:1,
        //         invoiceStatus: 'pending',
        //         price: input.price.$numberDecimal,
        //         currentInvoiceNumber: 1,
        //         relationshipId:memship._id,
        //     };
        //     const membershipInvoice= new MembershipInvoices(invoiceData);
        //     membershipInvoice.save();

        //     let memberships = await MembershipsRelations.find({
        //         clubId: input.clubId,
        //     });

        //     res.json({ success: true, memberships, msg: 'Membership added!' })
        // })
        // .catch(err => res.json({ success: false, msg: 'Error: ' + err }));
    }
});

router.route('/cancel-user-membership').post(async (req, res) => {
    let deleteMembershipId = req.body.membership_id;
    const Membership = await MembershipsRelations.findOne({
        membershipId: deleteMembershipId,
        userId: req.body.user_id,
    });
    if (Membership !== null) {
        let filter = { _id: Membership._id };
        let update = { status: 'cancel' };
        MembershipsRelations.findOneAndUpdate(
            filter,
            update,
            (err, membership) => {
                if (membership) {
                    res.status(200).send({
                        success: true,
                        msg: 'membership cancelled successfully.',
                    });
                } else {
                    res.status(500).send({ success: false, error: err });
                }
            }
        );
    }
});

router.route('/update-memberships').post(async (req, res) => {
    let membershipData = req.body.membershipdata;
    let action = req.body.action;
    let membershipId = membershipData.membershipId;

    let userId = membershipData.userId;
    let startDate = null;
    let endDate = null;
    let update = null;
    let filter = null;
    let memdata = null;

    if (action == 'accept') {
        startDate = new Date(new Date().getTime());

        let memShipData = await Memberships.findOne({ _id: membershipId });
        let interval = memShipData.interval ? memShipData.interval : 1;
        let trial = memShipData.trial ? memShipData.trial : false;
        let updateReplace = memShipData.updateReplace;
        let updateDenied = memShipData.updateDenied;

        for (var key in updateReplace) {
            let memId = updateReplace[key];
            memdata = await MembershipsRelations.findOne({
                membershipId: memId,
            });

            //  console.log(memenddate); return false;
            if (memdata != null) {
                let memenddate = memdata.expireDate;
                startDate = memenddate;
            }
            // console.log(memdata);
            if (memdata != null) {
                filter = { _id: memdata._id };
                update = { status: 'cancel' };
                await MembershipsRelations.findOneAndUpdate(filter, update);
            }
        }

        //trial case active
        if (trial == true) {
            let now = new Date();
            let expdate = null;
            let trialType = memShipData.trialType;
            let trialPeriod = memShipData.trialPeriod;
            if (trialType == 'days') {
                now.setDate(now.getDate() + trialPeriod);
                const days = new Date(new Date().getTime());

                days.setDate(startDate.getDate() + trialPeriod);
                console.log(days);
                expdate = days;
            } else if (trialType == 'weeks') {
                console.log('weeks');
                now.setDate(now.getDate() + trialPeriod * 7);
                const nextWeek = new Date(new Date().getTime());
                nextWeek.setDate(startDate.getDate() + trialPeriod * 7);
                expdate = nextWeek;
            } else if (trialType == 'months') {
                let aYearFromNow = now;
                aYearFromNow.setMonth(aYearFromNow.getMonth() + trialPeriod);
                expdate = aYearFromNow;
            } else if (trialType == 'years') {
                let aYearFromNow = now;
                aYearFromNow.setFullYear(
                    aYearFromNow.getFullYear() + trialPeriod
                );
                expdate = aYearFromNow;
            }

            filter = { _id: membershipData._id };
            update = {
                status: 'trial',
                startDate: startDate,
                expireDate: expdate,
            };

            filter1 = { relationshipId: membershipData._id };
            update1 = {
                invoiceStatus: 'trial',
                payDate: now,
            };
        } else {
            if (memShipData.intervalType == 'weeks') {
                console.log('here');
                let numWeeks = interval;
                let now = new Date();
                now.setDate(now.getDate() + numWeeks * 7);
                endDate = now;
            } else if (memShipData.intervalType == 'years') {
                //let aYearFromNow = new Date();
                let aYearFromNow = startDate;
                aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
                endDate = aYearFromNow;
            } else if (memShipData.intervalType == 'months') {
                //console.log(startDate); return false;
                //let aYearFromNow = new Date();
                let aYearFromNow = startDate;
                aYearFromNow.setMonth(aYearFromNow.getMonth() + interval);
                endDate = aYearFromNow;
            }

            filter = { _id: membershipData._id };
            update = {
                status: 'active',
                startDate: startDate,
                expireDate: endDate,
            };
        }
    } else {
        filter = { _id: membershipData._id };
        update = { status: 'deactivate' };
    }
    filter1 = { relationshipId: membershipData._id };
    update1 = { invoiceStatus: 'paid', payDate: startDate };

    await MembershipInvoices.findOneAndUpdate(filter1, update1);
    MembershipsRelations.findOneAndUpdate(filter, update, (err, membership) => {
        if (membership) {
            res.status(200).send({
                success: true,
                msg: 'membership approved successfully.',
            });
        } else {
            res.status(500).send({ success: false, error: err });
        }
    });
});
router.route('/get-pending-memberships').post(async (req, res) => {
    const memberShipData = await Memberships.findOne({ slug: req.body.slug });
    let id = memberShipData._id;
    let AllmemberShips = await MembershipsRelations.find({
        membershipId: id,
        status: 'active',
    });
    let pendingMemberShips = await MembershipsRelations.find({
        status: 'pending',
        membershipId: id,
    });
    let userArray = [];
    let membershipsarr = [];
    for (var key in AllmemberShips) {
        let userId = AllmemberShips[key].userId;
        const userData = await Users.findOne({ _id: userId });
        userArray.push(userData);
    }
    for (var key in pendingMemberShips) {
        let obj = {
            _id: pendingMemberShips[key]._id,
            title: memberShipData.title,
            userId: memberShipData.userId,
            logo: memberShipData.logo,
            membersCount: memberShipData.membersCount,
            membershipId: memberShipData._id,
        };
        membershipsarr.push(obj);
    }
    res.json({ success: true, userArray, membershipsarr });
});

router.route('/memberships-check').post(async (req, res) => {
    let currentDate = new Date(new Date().getTime());
    let userId = req.body.userId;
    let memberShipsRelations = await MembershipsRelations.find({
        status: 'cancel',
        userId: userId,
    });

    for (var key in memberShipsRelations) {
        let memId = memberShipsRelations[key]._id;
        let startDate = memberShipsRelations[key].startDate;
        // cancell status
        if (startDate <= currentDate) {
            let filter = { _id: memId };
            let update = {
                status: 'active',
            };
            MembershipsRelations.findOneAndUpdate(
                filter,
                update,
                (err, membership) => {}
            );
        }
    }

    let relationmemberships = await MembershipsRelations.find({
        status: 'trial',
        userId: userId,
    });
    for (var key in relationmemberships) {
        let exdate = null;
        let memrelationId = relationmemberships[key]._id;
        let membershipId = relationmemberships[key].membershipId;
        let invoiceobj = await MembershipInvoices.findOne({
            relationshipId: memrelationId,
        });
        let memexpire = relationmemberships[key].expireDate;
        // if(memexpire<=currentDate){
        console.log(invoiceobj.invoiceStatus);
        if (invoiceobj.invoiceStatus == 'paid') {
            let memberships = await Memberships.findOne({ _id: membershipId });
            let interval = memberships.interval;
            let intervalType = memberships.intervalType;

            if (intervalType == 'weeks') {
                const date = new Date(memexpire);
                date.setDate(date.getDate() + interval);
                exdate = date;
            } else if (intervalType == 'years') {
                const date = new Date(memexpire);
                let aYearFromNow = date;
                aYearFromNow.setMonth(aYearFromNow.getMonth() + interval);
            } else if (intervalType == 'months') {
                const date = new Date(memexpire);
                let aYearFromNow = date;
                aYearFromNow.setMonth(aYearFromNow.getMonth() + interval);
                exdate = aYearFromNow;
            } else if (intervalType == 'days') {
                const date = new Date(memexpire);
                let aYearFromNow = date;
                aYearFromNow.setFullYear(
                    aYearFromNow.getFullYear() + trialPeriod
                );
                exdate = aYearFromNow;
            }
            filter = { _id: memrelationId };
            update = {
                status: 'active',
                startDate: memexpire,
                expireDate: exdate,
            };
        } else if (invoiceobj.invoiceStatus == 'pending') {
            filter = { _id: memrelationId };
            update = { status: 'pending' };
        }
        // }
        MembershipsRelations.findOneAndUpdate(
            filter,
            update,
            (err, membership) => {}
        );
    }

    let membershipRelations = await MembershipsRelations.find({
        status: 'active',
        userId: userId,
    });
    for (var key in membershipRelations) {
        let memId = membershipRelations[key]._id;
        let membershipId = membershipRelations[key].membershipId;
        let expireDate = membershipRelations[key].expireDate;
        let userId = membershipRelations[key].userId;
        let memobj = await Memberships.findOne({ _id: membershipId });
        if (expireDate <= currentDate) {
            let paymentType = memobj.paymentType;
            let currentInvoiceNumber = 1;
            let gateway = membershipRelations[key].gatewayId;
            if (paymentType == 'recurring' && gateway == 'manual') {
                let invoiceobj = await MembershipInvoices.findOne({
                    relationshipId: memId,
                });
                if (invoiceobj) {
                    currentInvoiceNumber = invoiceobj.currentInvoiceNumber;
                }

                let invoiceData = {
                    clubId: memobj.clubId,
                    userId: userId,
                    membershipId: memobj._id,
                    gatewayId: gateway,
                    type: memobj.type,
                    paymentType: memobj.paymentType,
                    intervalType: memobj.intervalType,
                    payDate: null,
                    totalPayments: 1,
                    invoiceStatus: 'pending',
                    price: memobj.price.$numberDecimal,
                    currentInvoiceNumber: currentInvoiceNumber,
                    relationshipId: memId,
                };

                const membershipInvoice = new MembershipInvoices(invoiceData);
                membershipInvoice.save();
            } else if (paymentType == 'recurring' && gateway == 'free') {
                let invoiceobj = await MembershipInvoices.findOne({
                    relationshipId: memId,
                });
                if (invoiceobj) {
                    currentInvoiceNumber = invoiceobj.currentInvoiceNumber;
                }

                let invoiceData = {
                    clubId: memobj.clubId,
                    userId: userId,
                    membershipId: memobj._id,
                    gatewayId: gateway,
                    type: memobj.type,
                    paymentType: memobj.paymentType,
                    intervalType: memobj.intervalType,
                    payDate: null,
                    totalPayments: 1,
                    invoiceStatus: 'paid',
                    price: memobj.price.$numberDecimal,
                    currentInvoiceNumber: currentInvoiceNumber,
                    relationshipId: memId,
                };
                const membershipInvoice = new MembershipInvoices(invoiceData);
                membershipInvoice.save();
            }
            // console.log(memobj.paymentType);

            //  console.log(membershipData);
        }
    }
    res.json({ success: true, msg: 'membership success' });
});

router.route('/getClubMembers').post(async (req, res) => {
    try {
        let paidUsers = [];
        let addedUsersId = [];
        let bannedUsers = [];
        const slug = req.body.slug;
        const club = await Teams.findOne({ slug }, '_id banned creatorId');

        if (club.banned) {
            for (const bannedUserId of club.banned) {
                const bannedUser = await Users.findById(bannedUserId);

                bannedUsers.push(bannedUser);
            }
        }

        let members = await Users.find(
            { teams: { $all: club._id }, status: 'active' },
            'firstName lastName profilePicture'
        );

        const memberships = await MembershipsRelations.find(
            { status: 'active', clubId: club._id },
            'type status userId'
        );

        for (const membership of memberships) {
            // check for user duplication and not the creator
            if (
                club.creatorId
                    .toString()
                    .localeCompare(membership.userId.toString()) !== 0 &&
                !addedUsersId.some(
                    (uId) =>
                        uId
                            .toString()
                            .localeCompare(membership.userId.toString()) === 0
                )
            ) {
                const user = await Users.findById(membership.userId);
                addedUsersId.push(membership.userId);

                paidUsers.push(user);
            }
        }

        let freeUsers = [...members];
        for (const uId of addedUsersId) {
            freeUsers = freeUsers.filter(
                (f) => f._id.toString().localeCompare(uId.toString()) !== 0
            );
        }

        res.json({ success: true, members, bannedUsers, paidUsers, freeUsers });
    } catch (err) {
        res.json({ success: false, msg: 'Error: ' + err });
    }
});

/*router.route('/memberships-check').post(async (req, res) => {
let aa=req.body;
console.log(aa);
});*/

module.exports = router;
