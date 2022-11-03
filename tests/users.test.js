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
        const users = db.collection('users');

        const mockUser = {userId: '007', firstName: 'james', email: "james@gmail.com"};
        await users.insertOne(mockUser);

        const insertedUser = await users.findOne({userId: '007'});
        expect(insertedUser).toEqual(mockUser);
        users.deleteOne({userId: '007'}, true);
    });

    it('should not insert a doc into collection', async () => {
        const users = db.collection('users');

        const insertedUser = await users.findOne({userId: '007'});
        expect(insertedUser).toEqual(null);
    });
});