const {MongoClient} = require('mongodb');

var path = require("path");
const url = require(path.join(__dirname, '..', 'config/keys')).MongoURI;

describe('check connection', () => {
    let connection;
    let db;

    beforeAll(async () => {
        connection = await MongoClient.connect(url, {
            useNewUrlParser: true,
        });
        db = await connection.db("test");
    });

    afterAll(async () => {
        await connection.close();
        await db.close();
    });

    it('should insert a workout into collection', async () => {
        const events = db.collection('workouts');

        const mockEvents =  {'eventId': '001',
        "workoutName": "Swim workout 3",
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
        };
        await events.insertOne(mockEvents);

        const insertedEvent = await events.findOne({'eventId': '001'});
        expect(insertedEvent).toEqual(mockEvents);
        events.deleteOne({'eventId': '001'}, true);
    });

    it('should not insert a workout into collection', async () => {
        const events = db.collection('workouts');

        const insertedEvent = await events.findOne({'eventId': '001'});
        expect(insertedEvent).toEqual(null);
    });
})