const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: String,
    description: String,
    teacher: String,
    seats: Number,
    schedule: [String],
    assign: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Assign'
        }
    ]
});

module.exports = mongoose.model('Course', CourseSchema);