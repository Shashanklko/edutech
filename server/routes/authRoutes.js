const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Standard Authentication routes
router.post('/login', authController.login);
router.get('/school-admin/password/:schoolId', authController.getSchoolAdminPassword);

// Student Authentication (Direct Student ID & Aadhaar)
router.post('/student/login', authController.studentLogin);
router.post('/student/request-otp', authController.requestStudentOtp);
router.post('/student/verify-otp', authController.verifyStudentOtp);

module.exports = router;
