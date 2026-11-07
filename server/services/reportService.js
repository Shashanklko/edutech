const Report = require('../models/Report');

const generateReportId = async (tier = 'state') => {
    const year = new Date().getFullYear();
    const count = await Report.countDocuments();
    return `REP-${tier.toUpperCase()}-${year}-${String(count + 1).padStart(3, '0')}`;
};

const getReports = async (query = {}) => {
    const filter = {};
    if (query.reportingTier) filter.reportingTier = query.reportingTier;
    if (query.submittedBy) filter.submittedBy = query.submittedBy;
    if (query.submittedTo) filter.submittedTo = query.submittedTo;
    if (query.status && query.status !== 'All') filter.status = query.status;

    return await Report.find(filter).sort({ createdAt: -1 }).lean();
};

const submitReport = async (reportData) => {
    const reportId = reportData.reportId || await generateReportId(reportData.reportingTier);
    const newReport = new Report({
        ...reportData,
        reportId
    });
    return await newReport.save();
};

const reviewReport = async (reportId, { status, reviewRemarks, reviewedBy }) => {
    const report = await Report.findOne({ reportId });
    if (!report) {
        const error = new Error(`Report ${reportId} not found`);
        error.statusCode = 404;
        throw error;
    }

    report.status = status;
    report.reviewRemarks = reviewRemarks || '';
    report.reviewedBy = reviewedBy;
    report.reviewedAt = new Date();

    return await report.save();
};

module.exports = {
    generateReportId,
    getReports,
    submitReport,
    reviewReport
};

