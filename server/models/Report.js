const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    }, // e.g. 'REP-STATE-UP-2026-Q1'
    title: {
        type: String,
        required: true,
        trim: true
    },
    reportingTier: {
        type: String,
        enum: ['state', 'institution', 'board'],
        required: true
    },
    submittedBy: {
        type: String,
        required: true
    }, // e.g. 'UP-MOE', 'SCH-CBSE-01'
    submittedByName: {
        type: String,
        required: true
    },
    submittedTo: {
        type: String,
        required: true
    }, // e.g. 'ADMIN' (Central MOE), 'UP-MOE' (State MOE), 'CBSE' (Board)
    reportingPeriod: {
        type: String,
        required: true
    }, // 'Q1-2026', 'Annual 2025-2026'
    reportType: {
        type: String,
        enum: [
            'STATE_ANNUAL_ENROLMENT',
            'INTERSTATE_MIGRATION_AUDIT',
            'SCHEME_UTILIZATION',
            'DROPOUT_INTERVENTION_SUMMARY',
            'INSTITUTION_INFRA_AUDIT',
            'BOARD_RESULT_GAZETTE'
        ],
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    metrics: {
        totalEnrolled: { type: Number, default: 0 },
        attendanceAverage: { type: Number, default: 0 },
        transitionRate: { type: Number, default: 0 },
        dropoutsInvestigated: { type: Number, default: 0 },
        schemeBeneficiaries: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'Approved', 'Revisions Requested'],
        default: 'Submitted'
    },
    reviewRemarks: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: String,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

reportSchema.virtual('id').get(function() {
    return this.reportId;
});

reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);

