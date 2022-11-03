const router = require('express').Router();
const mongoose = require('mongoose');
const Users = mongoose.model('users');
const crypto = require('crypto');
const oauth1a = require('oauth-1.0a');
const axios = require('axios').default;

const CONSUMERKEY = '98c0d521-3638-40c3-9081-e47a85d56d1a';
const CONSUMERSECRET = 'ZmsEPNefVMdIwHvPwgG5E7dnjSsXLKSztqm';
let TOKENKEY = '';
let TOKENSECRET = '';

const jsonData = {"workoutName": "Swim workout 3",
    "description": null,
    "sport": "LAP_SWIMMING",
    "estimatedDurationInSecs": null,
    "estimatedDistanceInMeters": null,
    "poolLength": 25.0,
    "poolLengthUnit": "METER",
    "steps": [{
    "type": "WorkoutStep",
    "stepId": null,
    "stepOrder": "1",
    "repeatType": null,
    "repeatValue": null,
    "intensity": "WARMUP",
    "description": null,
    "durationType": "DISTANCE",
    "durationValue": 150.0,
    "durationValueType": "METER",
    "targetType": null,
    "targetValue": null,
    "targetValueLow": null,
    "targetValueHigh": null,
    "targetValueType": null,
    "strokeType": null,
    "equipmentType": "SWIM_PULL_BUOY"}]
    }

class Oauth1Helper {
    static getAuthHeaderForRequest(request, userID) {
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
        Users.find({_id: userID})
            .then(users => {
                TOKENKEY = users[0].accessToken
                TOKENSECRET = users[0].accessSecret
                console.log('666')
                console.log(users[0].accessToken)
                console.log(users[0].accessSecret)
                console.log(userID)
            })

        const authorization = oauth.authorize(request, {
            key: TOKENKEY,
            secret: TOKENSECRET,
        });
    
        return oauth.toHeader(authorization);
    }
};
    
const request = {
    url: 'https://apis.garmin.com/training-api/workout',
    method: 'POST',
    body: jsonData
};
    
// const authHeader = Oauth1Helper.getAuthHeaderForRequest(request);

router.route('/').get((req, res) => {
	res.send('Connected to My part');
});

router.route('/sendWorkout').post(async (req, res) => {
    let authHeader = Oauth1Helper.getAuthHeaderForRequest(request, req.body.userID);
	axios.post(
        request.url,
        req.body.data,
        {headers: authHeader})
        .then(resp => {
        res.send(resp.data);})
        .catch(error => {
        console.log(error);
        return res.status(401).json({
            error,
            message: 'Cannot add to Garmin Connect',
        })
    });
});

module.exports = router;