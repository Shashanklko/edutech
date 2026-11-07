const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'school', 'college', 'university', 'student', 'school-admin'], 
        required: true 
    },
    referenceId: { 
        type: String, 
        default: null 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
