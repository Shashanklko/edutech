const statsService = require('../services/statsService');

/**
 * Get platform-wide overview statistics with optional state/board filters
 */
const getOverviewStats = async (req, res) => {
    try {
        const stats = await statsService.getPlatformStats(req.query);
        res.json(stats);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get Board Dropout / Out-of-School Alarms with optional board and state filters
 */
const getBoardDropoutAlarms = async (req, res) => {
    try {
        const alarms = await statsService.getBoardDropoutAlarms(req.query.board, req.query.state);
        res.json(alarms);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get Interstate Migrated Students
 */
const getInterstateMigrations = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const migrations = await statsService.getInterstateMigrations(limit);
        res.json(migrations);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    getOverviewStats,
    getBoardDropoutAlarms,
    getInterstateMigrations
};
