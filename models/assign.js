const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = Schema({
    mode: {
        type: String,
        enum: ["online", "offline"]
    },
    pref1: Number,
    pref2: Number,
    pref3: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    slot: {
        type: Number,
        default: 4
    }
});

module.exports = mongoose.model('Assign', AssignmentSchema);