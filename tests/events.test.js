const {MongoClient} = require('mongodb');

var path = require("path");
const url = require(path.join(__dirname, '..', 'config/keys')).MongoURI;

describe('insert', () => {
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

    it('should insert a doc into collection', async () => {
        const events = db.collection('events');

        const mockEvents = {eventId: '007', owner: '31333', groupEvent: "True", eventType: 'Fun'};
        await events.insertOne(mockEvents);

        const insertedEvent = await events.findOne({eventId: '007'});
        expect(insertedEvent).toEqual(mockEvents);
        events.deleteOne({eventId: '007'}, true);
    });

    it('should not insert a doc into collection', async () => {
        const events = db.collection('events');

        const insertedEvent = await events.findOne({eventId: '007'});
        expect(insertedEvent).toEqual(null);
    });
})