const express = require('express');
const cors = require('cors');
const passport = require('passport');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./models/db.js');

// defining routes
var indexRouter = require('./routes/index');
var eventsRouter = require('./routes/events');
var usersRouter = require('./routes/users');
var groupsRouter = require('./routes/groups');
var postsRouter = require('./routes/posts');
var searchRouter = require('./routes/search');
var sessionsRouter = require('./routes/sessions');
var sessionActivityTypesRouter = require('./routes/session-activity-types');
var familyNamesRouter = require('./routes/family-names');
var programsRouter = require('./routes/programs');
var plannersRouter = require('./routes/planners');
var PhaseRouter = require('./routes/phases');
var coachProgramerRouter = require('./routes/coach_programs');
var activityRouter = require('./routes/activity');
var componentRouter = require('./routes/components');
var exerciseRouter = require('./routes/exercise');
var bodystrengthRouter = require('./routes/bodystrength');
var unita = require('./routes/unita');
var rpe = require('./routes/rpe');
var strength_session = require('./routes/strength_session');
var sessiongrades = require('./routes/sessionworkoutgrade');
var athleteStrengthData = require('./routes/athlete_strength_data');
var teamsData = require('./routes/teams');
var membershipsData = require('./routes/memberships');
var trackerRouter = require('./routes/tracker');
//adds zy
var addsRouter = require('./routes/adds');
var trendingRouter = require('./routes/trending');
var membership_relations = require('./routes/membership-relations');
var workoutRouter = require('./routes/workout');
var authRouter = require('./routes/auth')
// using route\\\\\\\\\\\\s
app.use('/workout',workoutRouter);
app.use('/auth', authRouter);
app.use('/uploads', express.static('uploads'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/events', eventsRouter);
app.use('/posts', postsRouter);
app.use('/groups', groupsRouter);
app.use('/search', searchRouter);
app.use('/sessions', sessionsRouter);
app.use('/session-activity-types', sessionActivityTypesRouter);
app.use('/family-names', familyNamesRouter);
app.use('/programs', programsRouter);
app.use('/planners', plannersRouter);
app.use('/phase', PhaseRouter);
app.use('/coach-program', coachProgramerRouter);
app.use('/activity', activityRouter);
app.use('/components', componentRouter);
app.use('/exercise', exerciseRouter);
app.use('/bodystrength', bodystrengthRouter);
app.use('/unit', unita);
app.use('/rpe', rpe);
app.use('/strength-session', strength_session);
app.use('/grades-session', sessiongrades);
app.use('/athlete-strength-data', athleteStrengthData);
app.use('/teams', teamsData);
app.use('/memberships', membershipsData);
app.use('/tracker', trackerRouter);
//adds zy
app.use('/adds', addsRouter);
app.use('/trending', trendingRouter);
app.use('/membership-relations', membership_relations);
const port = 3001;
app.listen(port, function (req, res) {
    console.log('server is running on port ' + port + '!');
});

module.exports = app;