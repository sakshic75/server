const router = require('express').Router();
const crypto = require('crypto');
const oauth1a = require('oauth-1.0a');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Users = mongoose.model('users');

const CONSUMERKEY = '98c0d521-3638-40c3-9081-e47a85d56d1a';
const CONSUMERSECRET = 'ZmsEPNefVMdIwHvPwgG5E7dnjSsXLKSztqm';
var ACCESSTOKEN = '';
var ACCESSSECRET = '';
var REQUESTTOKEN = '';
var REQUESTSECRET = '';
var OAUTHVERIFIER = '';


const oauth = oauth1a({
    consumer: {key: CONSUMERKEY, secret: CONSUMERSECRET},
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64')
    },
});

router.route('/').post((req, res) => {
    const unauth_request = {
        url: 'https://connectapi.garmin.com/oauth-service/oauth/request_token',
        method: 'POST',
    };

    //console.log("first auth header ", unauth_oauth.toHeader(unauth_oauth.authorize(unauth_request)))

    axios.post(
        unauth_request.url,
        unauth_request.body,
        {headers: oauth.toHeader(oauth.authorize(unauth_request))})
        .then(resp => {
            var respond = resp.data;
            REQUESTTOKEN = respond.substring(respond.indexOf('=') + 1, respond.indexOf('&'));
            var pos = respond.indexOf(REQUESTTOKEN)
            REQUESTSECRET = respond.substring(respond.indexOf('=', pos) + 1)
        })
        .then(response => {
            res.send(REQUESTTOKEN)
        })
    //.then(log => console.log("request token = ", REQUESTTOKEN, " request secret = ", REQUESTSECRET))
});

router.route('/authorise').get((req, res) => {
    res.send("Thank you for authorizing. You may now close the window.")
    OAUTHVERIFIER = req.query.oauth_verifier;
    //console.log("oauth verifier =", OAUTHVERIFIER)

    const access_request = {
        url: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
        method: 'POST',
        data: {oauth_verifier: OAUTHVERIFIER},
    }

    const authorization = oauth.authorize(access_request, {
        key: REQUESTTOKEN,
        secret: REQUESTSECRET
    });

    auth_header = oauth.toHeader(authorization);
    //console.log("second auth header ", auth_header)

    axios.post(
        access_request.url,
        access_request.body,
        {headers: auth_header})
        .then(res => {
            var response = res.data;
            ACCESSTOKEN = response.substring(response.indexOf('=') + 1, response.indexOf('&'));
            var pos = response.indexOf(ACCESSTOKEN)
            ACCESSSECRET = response.substring(response.indexOf('=', pos) + 1)
            const userID = req.originalUrl.substring(req.originalUrl.indexOf('user_id=') + 8, req.originalUrl.indexOf('&'))
            Users.updateOne(
                {_id: userID},
                {accessToken: ACCESSTOKEN, accessSecret: ACCESSSECRET},
                function (err, doc) {
                    if (err) console.log(err)
                    else console.log('Succesfully saved.');
                });
        })
        .catch(res => console.log(res))

});

router.route('/check').get((req, res) => {
    Users.find({_id: req.query.userID, accessToken: {$exists: true}})
        .then(users => res.send({success: true, users}))
        .catch(err => res.send());
});

router.route('/out').get((req, res) => {
    // console.log("userid", req.query.userID);
    // res.send("Finished");
    Users.updateOne(
        {_id: req.query.userID},
        { $unset: {accessToken: "", accessSecret: ""}},
        function (err, doc) {
            if (err) console.log("error")
            else res.send("Finished logout.");
        }
    );
});

module.exports = router;
