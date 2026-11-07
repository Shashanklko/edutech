const studentService = require('../services/studentService');

/**
 * Retrieve students with dynamic query filters
 */
const getAllStudents = async (req, res) => {
    try {
        const students = await studentService.getAllStudents(req.query);
        res.json(students);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Search students across the platform by ID, Name, or Roll Number
 */
const searchStudents = async (req, res) => {
    try {
        const students = await studentService.searchStudents(req.query.q);
        res.json(students);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get comprehensive student profile by unique ID
 */
const getStudentById = async (req, res) => {
    try {
        const student = await studentService.getStudentById(req.params.id);
        res.json(student);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Add a fresh student record and initialize history timeline
 */
const addStudent = async (req, res) => {
    try {
        const result = await studentService.createStudent(req.body);
        res.json({ message: 'Student added successfully', uniqueId: result.uniqueId });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Edit student profile data
 */
const updateStudent = async (req, res) => {
    try {
        const student = await studentService.updateStudent(req.params.id, req.body);
        res.json({ message: 'Profile updated successfully', student });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Issue Transfer Certificate (TC) and close timeline entry
 */
const issueTransferCertificate = async (req, res) => {
    try {
        await studentService.issueTransferCertificate(req.params.id, req.body);
        res.json({ message: 'Transfer Certificate Issued' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Enroll existing student into a new institution (Transfer-In)
 */
const enrollStudent = async (req, res) => {
    try {
        await studentService.enrollStudent(req.params.id, req.body);
        res.json({ message: 'Student Enrolled Successfully' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get all academic marks for a student
 */
const getMarks = async (req, res) => {
    try {
        const marks = await studentService.getStudentMarks(req.params.id);
        res.json(marks);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Add a mark record for a student
 */
const addMark = async (req, res) => {
    try {
        await studentService.addStudentMark(req.params.id, req.body);
        res.json({ message: 'Mark recorded successfully' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Delete a mark record from student
 */
const deleteMark = async (req, res) => {
    try {
        await studentService.deleteStudentMark(req.params.id, req.params.markId);
        res.json({ message: 'Mark deleted successfully' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Check if a student is eligible for enrollment in a new institution
 */
const checkEnrollmentEligibility = async (req, res) => {
    try {
        const result = await studentService.checkEnrollmentEligibility(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Public agency verification request creation
 */
const createAgencyRequest = async (req, res) => {
    try {
        const result = await studentService.createAgencyRequest(req.body);
        res.json({ message: 'Verification request submitted to Central Education Board', request: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Get all agency verification requests (Central Board Operator desk)
 */
const getAgencyRequests = async (req, res) => {
    try {
        const requests = await studentService.getAgencyRequests(req.query.status);
        res.json(requests);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Review an agency verification request (Approve or Reject by Central Board)
 */
const reviewAgencyRequest = async (req, res) => {
    try {
        const result = await studentService.reviewAgencyRequest(req.params.id, req.body);
        res.json({ message: `Verification request ${result.status.toLowerCase()} successfully`, request: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    getAllStudents,
    searchStudents,
    getStudentById,
    addStudent,
    updateStudent,
    issueTransferCertificate,
    enrollStudent,
    getMarks,
    addMark,
    deleteMark,
    checkEnrollmentEligibility,
    createAgencyRequest,
    getAgencyRequests,
    reviewAgencyRequest
};

