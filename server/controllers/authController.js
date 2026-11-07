const authService = require('../services/authService');

/**
 * Handle user and school-admin authentication
 */
const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Retrieve school admin password
 */
const getSchoolAdminPassword = async (req, res) => {
    try {
        const result = await authService.getSchoolAdminPassword(req.params.schoolId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Direct Student Login using Student ID / Aadhaar Number (No OTP required)
 */
const studentLogin = async (req, res) => {
    try {
        const { studentId, aadhaarNumber, identifier } = req.body;
        const result = await authService.loginStudent(studentId || identifier, aadhaarNumber);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Request OTP for student authentication via Aadhaar / USI
 */
const requestStudentOtp = async (req, res) => {
    try {
        const { identifier, studentId, aadhaarNumber } = req.body;
        const result = await authService.loginStudent(studentId || identifier, aadhaarNumber);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Verify student OTP and login
 */
const verifyStudentOtp = async (req, res) => {
    try {
        const { identifier, studentId, aadhaarNumber } = req.body;
        const result = await authService.loginStudent(studentId || identifier, aadhaarNumber);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    login,
    getSchoolAdminPassword,
    studentLogin,
    requestStudentOtp,
    verifyStudentOtp
};
