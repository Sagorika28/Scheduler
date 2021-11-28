if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Course = require('./models/course')
const Assign = require('./models/assign');
const { isLoggedIn, validateAssignment, isStudent, isAdmin } = require('./middleware');
const { formRoster } = require('./algorithm');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

mongoose.connect('mongodb://localhost:27017/class-scheduler', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'views/login')))
app.use(mongoSanitize()); // To prevent mongo injection


const sessionConfig = {
    name: 'sgsession',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/login', (req, res) => {
    res.render('login/login');
});

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome back ${req.user.name}!`);
    const redirectUrl = req.session.returnTo || '/courses';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "You have been successfully logged out.");
    res.redirect('/');
});

app.get('/courses', catchAsync(async (req, res) => {
    const courses = await Course.find({});
    const users = await User.find({});
    res.render('courses/main', { courses, users })
}));

// scheduling routes for scheduling classes
app.get('/courses/:id', isLoggedIn, isStudent, catchAsync(async (req, res) => {
    const course = await Course.findById(req.params.id);
    res.render('courses/mode', { course })
}));

app.post('/courses/:id/', isLoggedIn, validateAssignment, catchAsync(async (req, res) => {
    const course = await Course.findById(req.params.id);
    const assignment = new Assign(req.body.assign);
    assignment.author = req.user._id;
    course.assign.push(assignment);
    await assignment.save();
    await course.save();
    req.flash('success', 'Your preferences have been successfully submitted.');
    res.redirect('/courses');
}));

// viewing route for roster
app.get('/courses/:id/roster', isLoggedIn, formRoster, catchAsync(async (req, res) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'assign',
        populate: {
            path: 'author'
        }
    });
    if (!course) {
        req.flash('error', 'Cannot find that Course!');
        return res.redirect('/courses');
    }
    res.render('courses/roster', { course });
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})