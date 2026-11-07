const schoolService = require('../services/schoolService');

/**
 * Get all registered schools/universities sorted by name
 */
const getAllSchools = async (req, res) => {
    try {
        const schools = await schoolService.getAllSchools(req.query);
        res.json(schools);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Automatically generate next unique institution ID based on type
 */
const getGeneratedId = async (req, res) => {
    try {
        const result = await schoolService.generateNextInstitutionId(req.query.type);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Register a new educational institution and its admin user account
 */
const registerSchool = async (req, res) => {
    try {
        const caller = req.user || req.body.caller;
        const result = await schoolService.registerSchool(req.body, caller);
        res.json({ message: 'School Registered Successfully', school: result.school, generatedId: result.generatedId });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get institution details by ID
 */
const getSchoolById = async (req, res) => {
    try {
        const school = await schoolService.getSchoolById(req.params.id);
        res.json(school);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Update institution profile information
 */
const updateSchoolProfile = async (req, res) => {
    try {
        const school = await schoolService.updateSchoolProfile(req.params.id, req.body);
        res.json({ message: 'Institution profile updated successfully', school });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get all current students enrolled in a specific institution
 */
const getSchoolStudents = async (req, res) => {
    try {
        const students = await schoolService.getSchoolStudents(req.params.id);
        res.json(students);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Reset school admin password
 */
const resetSchoolPassword = async (req, res) => {
    try {
        await schoolService.resetSchoolPassword(req.params.id, req.body.password);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    getAllSchools,
    registerSchool,
    getSchoolById,
    updateSchoolProfile,
    getSchoolStudents,
    resetSchoolPassword,
    getGeneratedId
};
