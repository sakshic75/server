/**
 * ===================================
 * SETTING KEYS OF DIFFERENT SERVICES
 * ===================================
 * @date created: 10 October 2019
 * @authors: Waqas Rehmani
 *
 * This file consists of the MongoURI that is used in other modules to connect to MongoDB.
 * It also consists of google cloud information such as the storage buckets used to save pictures.
 *
 */


module.exports = {
   // MongoURI:'mongodb+srv://dev-team:cmbilby@coachingmatecluster-c4mcn.mongodb.net/test?retryWrites=true&w=majority',
    MongoURI:'mongodb+srv://faisal:NIYtiINmjb2DOoqM@coachingmate-o1gxf.mongodb.net/coachingmate?retryWrites=true&w=majority',
    google: {
        projectId: 'coaching-mate-social-website',
        certificateBucket: 'coaching_certificates',
        profilePictureBucket: 'cm_profile_pictures',
        postBucket: 'cm_posts',
        eventBucket: 'cm_events',
        groupBucket: 'cm_groups',
    }
};