/**
 * =======================================
 * SCHEMA OF USERS (WITH MONGOOSE)
 * =======================================
 * @date created: 22 August 2019
 * @authors: Waqas Rehmani
 *
 * The models/users.js is used for establishing the 'users' schema and types using mongoose
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 3600000;

/**
 * profilePicture and profilePictureFileName: Store information about the profile picture of user
 * coachingCertificate and coachingCertificateFile: Store information about the coaching certificate of user
 * interest: Store the interests (eg. Running, Walking, Football, etc) of the user
 * role: Athlete or Coach
 * groups: Array of groupIds that the user is a member of
 */
const AddressSchema = new Schema({
    street: { type: String, required: true },
    street2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, required: true },
});

const MembershipSchema = new Schema({
    teamId: { type: Schema.Types.ObjectId, required: true },
    membershipId: { type: Schema.Types.ObjectId, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, required: true, default: 'simple' },
    intervalType: { type: String, required: true },
    interval: { type: Number, required: true },
    status: { type: String, required: true, default: 'active' },
    price: { type: Schema.Types.Decimal128, required: true },
});
const PlannerSchema = new Schema({
    clubId: { type: Schema.Types.ObjectId, required: true },
    plannerId: { type: Schema.Types.ObjectId, required: true },
});

const UsersSchema = Schema({
    userId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number, required: false },
    role: { type: String, required: true, enum: ['Admin', 'Athlete', 'Coach'] },
    registered: { type: Date, required: true, default: Date.now() },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    dob: { type: Date, required: false },
    interest: { type: [String], required: false },
    phone: Number,
    profilePicture: String,
    profilePictureFileName: String,
    coachingCertificate: String,
    coachingCertificateFile: String,
    biography: { type: String, required: false },
    memberships: { type: [MembershipSchema], required: false },
    planners: { type: [PlannerSchema], required: false },
    teams: { type: [Schema.Types.ObjectId], required: false },
    teamRequests: { type: [Schema.Types.ObjectId], required: false },
    groups: { type: [Schema.Types.ObjectId], required: false },
    groupRequests: { type: [Schema.Types.ObjectId], required: false },
    location: {
        type: String,
    },
    photos: {
        type: [String],
    },
    followers: {
        type: [String],
    },
    following: {
        type: [String],
    },
    saved: {
        type: [Schema.Types.ObjectId],
    },
    googleId:{
        type: String
    },
    facebookId:{
        type:String
    },
    accessToken:{
        type:String
    },
    accessSecret:{
        type:String
    }
});


/*UsersSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

UsersSchema.pre('save', function(next) {
	var user = this;
	
	if (!user.isModified('password'))
		return next();
	
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err)
			return next(err);
		
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err)
				return next(err);
			
			user.password = hash;
			next();
		});
	});
});

UsersSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err)
			return cb(err);
		
		cb(null, isMatch);
	});
};

UsersSchema.methods.incLoginAttempts = function(cb) {
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.update({
			$set: { loginAttempts: 1 },
			$unset: { lockUntil: 1 }
		}, cb);
	}
	
	var updates = { $inc: { loginAttempts: 1 } };
	
	if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
		updates.$set = { lockUntil: Date.now() + LOCK_TIME };
	}
	return this.update(updates, cb);
};

UsersSchema.statics.failedLogin = {
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	MAX_ATTEMPTS: 2
};

UsersSchema.statics.getAuthenticated = function(username, password, cb) {
	this.findOne({ username: username }, function(err, user) {
		if (err)
			return cb(err);
		if (!user) {
			return cb(null, null, reasons.NOT_FOUND);
		}
		if (user.isLocked) {
			return user.incLoginAttempts(function(err) {
				if (err)
					return cb(err);
				return cb(null, null, reasons.MAX_ATTEMPTS);
			});
		}
		user.comparePassword(password, function(err, isMatch) {
			if (err)
				return cb(err);
	
			if (isMatch) {
				if (!user.loginAttempts && !user.lockUntil)
					return cb(null, user);
				
				var updates = {
					$set: { loginAttempts: 0 },
					$unset: { lockUntil: 1 }
				};
				
				return user.update(updates, function(err) {
					if (err)
						return cb(err);
					
					return cb(null, user);
				});
			}
	
			user.incLoginAttempts(function(err) {
				if (err)
					return cb(err);
				
				return cb(null, null, reasons.PASSWORD_INCORRECT);
			});
		});
	});
};*/

module.exports = mongoose.model('users', UsersSchema);
