const reportService = require('../services/reportService');

const listReports = async (req, res, next) => {
    try {
        const reports = await reportService.getReports(req.query);
        res.json(reports);
    } catch (err) {
        next(err);
    }
};

const submitReport = async (req, res, next) => {
    try {
        const report = await reportService.submitReport(req.body);
        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (err) {
        next(err);
    }
};

const reviewReport = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const report = await reportService.reviewReport(reportId, req.body);
        res.json({ message: 'Report review recorded', report });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listReports,
    submitReport,
    reviewReport
};

