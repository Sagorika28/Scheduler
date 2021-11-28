const mongoose = require('mongoose');
const User = require('../models/user');
const student = require('./students');

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
    await User.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const vac = Math.floor(Math.random() * 3);
        const password = student[i].password;
        const username = "User" + i;
        const stud1 = new User({
            name: student[i].name,
            email: student[i].email,
            username: username,
            vaccination_status: vac
        })
        const stud = await User.register(stud1, password);
        await stud.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})