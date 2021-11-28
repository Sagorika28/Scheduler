const Course = require('./models/course');
const Assign = require('./models/assign');

module.exports.formRoster = async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id).populate({
        path: 'assign',
        populate: {
            path: 'author'
        }
    });

    // scheduler algorithm
    const n = course.seats;
    let arr = [n, n, n];
   
        for (let v of course.assign) {
            const dose = v.author.vaccination_status;        
            if (!dose || v.mode == 'online') // if vaccination doses = 0 or student has selected online mode, skip him
                continue;
            if (arr[v.pref1]) // if seats of student's pref1 are left, allot physical class
            {
                arr[v.pref1]--;
                v.slot = v.pref1;
            }
            else if (arr[v.pref2]) // if seats of student's pref1 have ended and pref2 seats are left, allot physical class
            {
                arr[v.pref2]--;
                v.slot = v.pref2;
            }
            else if (arr[v.pref3]) // if seats of student's pref1 are left, allot physical class
            {
                arr[v.pref3]--;
                v.slot = v.pref3;
            }
            await Assign.findByIdAndUpdate(v._id, { slot: v.slot });
    }
    next();
};