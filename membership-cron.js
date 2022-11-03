const cron = require("node-cron")
const express = require("express")
const mongoose = require("mongoose")
require('./models/membership-relations');
require('./models/memberships');
require('./models/membership-Invoices');
const MembershipsRelations = mongoose.model('membership-relations');
const Memberships = mongoose.model('Memberships');
const MembershipInvoices = mongoose.model('MembershipInvoices');
const app = express()
//const model = require("./models")
//const date = new Date('2020-12-02');
//const date = new Date('2021-11-11');
//date.setDate(date.getDate() + 7); console.log(date); return false;
// let aYearFromNow=date;
// aYearFromNow.setMonth(aYearFromNow.getMonth() + 1);
// console.log(aYearFromNow); return false;

mongoose
  .connect("mongodb+srv://faisal:NIYtiINmjb2DOoqM@coachingmate-o1gxf.mongodb.net/coachingmate?retryWrites=true&w=majority")
//   .then(res => {
//     console.log("mongoose connected successfully");
//     const oldMembership =  MembershipsRelations.findOne({});
//     for(var key in oldMembership){
//         console.log(oldMembership[key]);
//     }
//   })
// checkTrailMemberShips();
// return false;

MembershipsRelations.find({status:'cancel'}, function(err,obj) { 
    let currentDate=new Date(new Date().getTime());

    for(var key in obj){
        let memId= obj[key]._id;
    let expDate=obj[key].expireDate;
    // cancell status

    if(currentDate>=expDate){
     // console.log('called');
      let  filter = { _id: memId };
       let  update = {
            status: 'deactivate',
        };
        MembershipsRelations.findOneAndUpdate(filter, update, (err, membership) => {
          
        });
    }
}
});

MembershipsRelations.find({status:'approved'}, function(err,obj) { 
  let currentDate=new Date(new Date().getTime());

  for(var key in obj){
      let memId= obj[key]._id;
  let startDate=obj[key].startDate;
  // cancell status
  if(startDate<=currentDate){
    let  filter = { _id: memId };
     let  update = {
          status: 'activate',
      };
      MembershipsRelations.findOneAndUpdate(filter, update, (err, membership) => {
        
      });
  }
}
});

async function checkActiveMemberShips(){
  let currentDate=new Date(new Date().getTime());
  let membershipRelations = await MembershipsRelations.find({status:'active'});
  //console.log(membershipRelations); return false;
  for(var key in membershipRelations){
    let memId= membershipRelations[key]._id;
    let membershipId=membershipRelations[key].membershipId;
    let expireDate=membershipRelations[key].expireDate;
    let userId=membershipRelations[key].userId;
    let clubId=membershipRelations[key].clubId;
    let memobj=  await Memberships.findOne({_id:membershipId});
    let membershipType=memobj.intervalType;
        let membershipinterval=memobj.interval;
        let filter=null;
        let update=null;
        let exdate=null;
    if(expireDate<=currentDate){
        let paymentType=membershipRelations[key].paymentType;
        let intervalType=membershipRelations[key].intervalType;
        
        let  currentInvoiceNumber=1;
        let gateway=membershipRelations[key].gatewayId;
        if(paymentType=='recurring' && gateway=='manual'){
          let invoiceobj=await MembershipInvoices.findOne({relationshipId:memId});
          if(invoiceobj){
             currentInvoiceNumber=invoiceobj.currentInvoiceNumber+1;
          }
          let invoiceData={
            clubId: clubId,
            userId: userId,
            membershipId: membershipId,
            gatewayId: gateway,
            type: memobj.type,
            paymentType: paymentType,
            intervalType: intervalType,
            payDate: null,
            totalPayments:1,
            invoiceStatus: 'pending',
            price: memobj.price.$numberDecimal,
            currentInvoiceNumber: currentInvoiceNumber,
            relationshipId:memId,
        }
        const membershipInvoice= new MembershipInvoices(invoiceData);
        membershipInvoice.save();
        }else if(paymentType=='recurring' && gateway=='free'){
          let invoiceobj=await MembershipInvoices.findOne({relationshipId:memId});
          if(invoiceobj){
             currentInvoiceNumber=invoiceobj.currentInvoiceNumber;
          }
        let invoiceData={
          clubId: clubId,
          userId: userId,
          membershipId: membershipId,
          gatewayId: gateway,
          type: memobj.type,
          paymentType: paymentType,
          intervalType: intervalType,
          payDate: null,
          totalPayments:1,
          invoiceStatus: 'paid',
          price: memobj.price.$numberDecimal,
          currentInvoiceNumber: currentInvoiceNumber,
          relationshipId:memId,
      }
        const membershipInvoice= new MembershipInvoices(invoiceData);
        membershipInvoice.save();
        }
      if(intervalType=='weeks'){
        const date = new Date(expireDate);
        date.setDate(date.getDate() + (membershipinterval*7)); 
        exdate=date;

      }
      else if(intervalType=='years'){
        const date = new Date(expireDate);
        let aYearFromNow=date;
        aYearFromNow.setMonth(aYearFromNow.getMonth() + membershipinterval);
      }
      else if(intervalType=='months'){
        const date = new Date(expireDate);
        let aYearFromNow=date;
        aYearFromNow.setMonth(aYearFromNow.getMonth() + membershipinterval);
        exdate=aYearFromNow;
      }
      else if(intervalType=='days'){
        const date = new Date(expireDate);
        let aYearFromNow = date;
        aYearFromNow.setFullYear(aYearFromNow.getFullYear() + membershipinterval);
        exdate=aYearFromNow;
      }
            filter = { _id: memId };
            update = {
                status: 'active',
                startDate:expireDate,
                expireDate:exdate,
            };
            // console.log(filter);
            // console.log(update);
    }

     MembershipsRelations.findOneAndUpdate(filter, update, (err, membership) => {});

  }


}

checkActiveMemberShips();

async function checkTrailMemberShips(){
  let currentDate=new Date(new Date().getTime());
  let relationmemberships = await MembershipsRelations.find({status:'trial'});
  for(var key in relationmemberships){
    
    let exdate=null;
    let memrelationId=relationmemberships[key]._id;
    let membershipId=relationmemberships[key].membershipId;
    let invoiceobj=await MembershipInvoices.findOne({relationshipId:memrelationId});
    let memexpire=relationmemberships[key].expireDate;
   // if(memexpire<=currentDate){
     console.log(invoiceobj.invoiceStatus);
    if(invoiceobj.invoiceStatus=='paid'){
      let memberships= await Memberships.findOne({_id:membershipId});
      let interval=memberships.interval;
      let intervalType=memberships.intervalType;

      if(intervalType=='weeks'){
        const date = new Date(memexpire);
        date.setDate(date.getDate() + interval); 
        exdate=date;

      }
      else if(intervalType=='years'){
        const date = new Date(memexpire);
        let aYearFromNow=date;
        aYearFromNow.setMonth(aYearFromNow.getMonth() + interval);
      }
      else if(intervalType=='months'){
        const date = new Date(memexpire);
        let aYearFromNow=date;
        aYearFromNow.setMonth(aYearFromNow.getMonth() + interval);
        exdate=aYearFromNow;
      }
      else if(intervalType=='days'){
        const date = new Date(memexpire);
        let aYearFromNow = date;
        aYearFromNow.setFullYear(aYearFromNow.getFullYear() + trialPeriod);
        exdate=aYearFromNow;
      }
            filter = { _id: memrelationId };
            update = {
                status: 'active',
                startDate:memexpire,
                expireDate:exdate,
            };
              


    }else if(invoiceobj.invoiceStatus=='pending'){
      filter = { _id: memrelationId };
      update = {
          status: 'pending',
        
      };
    }
 // }
        MembershipsRelations.findOneAndUpdate(filter, update, (err, membership) => {
                
        });


  }
}
 checkTrailMemberShips();