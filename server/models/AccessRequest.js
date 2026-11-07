const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    }, // e.g. 'REQ-2026-8812'
    requestId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    agencyName: {
        type: String,
        required: true,
        trim: true
    },
    agencyRegistrationId: {
        type: String,
        default: null
    },
    requesterName: {
        type: String,
        required: true,
        trim: true
    },
    requesterEmail: {
        type: String,
        required: true,
        trim: true
    },
    requesterPhone: {
        type: String,
        default: null
    },
    purpose: {
        type: String,
        required: true,
        enum: [
            'Pre-Employment Background Verification',
            'Higher Education Admission Clearance',
            'Immigration & Visa Verification',
            'Government Grant & Scholarship Audit',
            'Legal & Judicial Clearance'
        ],
        default: 'Pre-Employment Background Verification'
    },
    studentId: {
        type: String,
        required: true,
        uppercase: true,
        ref: 'Student'
    },
    studentName: {
        type: String,
        default: null
    },
    targetBoard: {
        type: String,
        default: 'Central Depository / Central Education Board'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    reviewedBy: {
        type: String,
        default: null // Central Board Operator username
    },
    reviewRemarks: {
        type: String,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    verificationToken: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
