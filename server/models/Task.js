const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    }, // e.g. 'TSK-2026-001'
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'STATE_REPORT_REVIEW',
            'DROPOUT_INVESTIGATION',
            'AFFILIATION_APPLICATION',
            'EXAM_RESULT_VERIFICATION',
            'STUDENT_MIGRATION_CLEARANCE',
            'SCHEME_AUDIT',
            'DATA_QUALITY_DISCREPANCY',
            'GENERAL_ADMINISTRATIVE'
        ],
        default: 'GENERAL_ADMINISTRATIVE'
    },
    tier: {
        type: String,
        enum: ['central', 'state', 'board', 'school', 'college', 'university'],
        required: true
    },
    assignedTo: {
        type: String,
        required: true
    }, // e.g. 'ADMIN', 'UP-MOE', 'CBSE', 'SCH-CBSE-01', 'DEO-LUCKNOW'
    assignedBy: {
        type: String,
        default: 'System Workflow'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Under Review', 'Completed', 'Rejected', 'Overdue'],
        default: 'Pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    relatedEntityId: {
        type: String,
        default: null
    }, // Student ID, School ID, or Report ID
    relatedEntityType: {
        type: String,
        default: null
    }, // 'Student', 'School', 'Report'
    remarks: {
        type: String,
        default: ''
    },
    resolutionDate: {
        type: Date,
        default: null
    },
    activityLog: [{
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' }
    }]
}, {
    timestamps: true
});

taskSchema.virtual('id').get(function() {
    return this.taskId;
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);

