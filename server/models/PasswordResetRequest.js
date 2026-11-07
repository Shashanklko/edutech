const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    operatorId: {
        type: String,
        required: true,
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
        enum: ['school', 'university', 'board', 'state', 'central'],
        default: 'school'
    },
    requesterName: {
        type: String,
        default: '',
        trim: true
    },
    requesterContact: {
        type: String,
        default: '',
        trim: true
    },
    reason: {
        type: String,
        default: 'Forgot operator passkey',
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    temporaryPassword: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: String,
        default: ''
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
