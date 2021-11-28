const mongoose = require('mongoose');
const Course = require('../models/course');
const subject = require('./subjects');

mongoose.connect('mongodb://localhost:27017/class-scheduler', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Course.deleteMany({});
    for (let i = 0; i < 6; i++) {
        const sub = new Course({
            title: subject[i].title,
            description: subject[i].description,
            teacher: subject[i].teacher,
            seats: subject[i].seats,
            schedule: subject[i].schedule
        })
        await sub.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})