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
        const groups = db.collection('groups');

        const mockGroup = {groupId: '007', members: 'james', description: "dsfdfdsfsd"};
        await groups.insertOne(mockGroup);

        const insertedGroup = await groups.findOne({groupId: '007'});
        expect(insertedGroup).toEqual(mockGroup);
        groups.deleteOne({groupId: '007'}, true);
    });

    it('should not insert a doc into collection', async () => {
        const groups = db.collection('groups');

        const insertedGroup = await groups.findOne({groupId: '007'});
        expect(insertedGroup).toEqual(null);
    });
});