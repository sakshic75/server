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
        const posts = db.collection('posts');

        const mockPost = {postId: '007', userId: 'type', email: "cycle"};
        await posts.insertOne(mockPost);

        const insertedPost = await posts.findOne({postId: '007'});
        expect(insertedPost).toEqual(mockPost);
        posts.deleteOne({postId: '007'}, true);
    });

    it('should not insert a doc into collection', async () => {
        const posts = db.collection('posts');

        const insertedPost = await posts.findOne({postId: '007'});
        expect(insertedPost).toEqual(null);
    });
});