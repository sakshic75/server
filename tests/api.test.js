const request = require('supertest');

const app = require('../app.js');

const MongoClient = require('mongodb').MongoClient;
const LOADER_URI = 'mongodb+srv://faisal:NIYtiINmjb2DOoqM@coachingmate-o1gxf.mongodb.net/coachingmate?retryWrites=true&w=majority'

describe('API testing', () => {

    let connection;

    beforeAll(async () => {
        connection = await MongoClient.connect(LOADER_URI);
    });

    afterAll(async () => {
        await connection.close();
    });

    it("check fecth workout",async() => {
        const workout = await request(app).get('/workout');
        expect(workout.statusCode).toBe(200);
        expect(workout).not.toBeNull();
    })


    it("post workout to garmin connect",async() => {
        jsonData = {data:{"workoutName": "Swim workout 3",
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
            },
            userID : "5e0dd9fe8c0e1f28ec814871"
        };
        const workout1 = await request(app)
            .post('/workout/sendWorkout')
            .send(jsonData);
        const workout2 = await request(app)
            .post('/workout/sendWorkout')
            .send(jsonData);
        expect(workout2.statusCode).toBe(200);
        expect(workout2).not.toBeNull();
    })


    it("check get oath1 token",async() => {
        const token = await request(app).post('/auth');
        expect(token.statusCode).toBe(200);
        expect(token).not.toBeNull();})

})
    
