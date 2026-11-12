const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
    operatorId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    institutionId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    tier: {
        type: String,
        enum: ['school', 'college', 'university', 'board', 'state', 'central'],
        default: 'school'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        default: '',
        trim: true
    },
    phone: {
        type: String,
        default: '',
        trim: true
    },
    deskRole: {
        type: String,
        default: 'Desk Operator',
        trim: true
    },
    password: {
        type: String,
        required: true,
        default: 'admin123'
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended'],
        default: 'Active'
    },
    assignedOperations: {
        type: [String],
        enum: ['admissions', 'students', 'transfers', 'marks', 'tasks'],
        default: ['students', 'tasks']
    },
    createdBy: {
        type: String,
        default: 'Master Admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Operator', operatorSchema);
