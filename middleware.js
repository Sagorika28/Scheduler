const { assignmentSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError');
const Course = require('./models/course');
const Assign = require('./models/assign');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isStudent = async (req, res, next) => {
    if ((req.user._id).equals("61a1f685fd06d3e8007c871b")) {
        req.flash('error', 'Unfortunately, you do not have permission to book a class.');
        return res.redirect(`/courses`);
    }
    next();
}

module.exports.isAdmin = async (req, res, next) => {
    if (!(req.user._id).equals("61a1f685fd06d3e8007c871b")) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/courses`);
    }
    next();
}

module.exports.validateAssignment = (req, res, next) => {
    const { error } = assignmentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}