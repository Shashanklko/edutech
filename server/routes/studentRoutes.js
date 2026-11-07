const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Student search & roster records
router.get('/students', studentController.getAllStudents);
router.get('/students/search', studentController.searchStudents);
router.get('/student/:id', studentController.getStudentById);
router.post('/student', studentController.addStudent);
router.put('/student/:id', studentController.updateStudent);

// Student Transfer, Eligibility & Enrollment
router.get('/student/:id/eligibility', studentController.checkEnrollmentEligibility);
router.get('/students/:id/eligibility', studentController.checkEnrollmentEligibility);
router.post('/student/:id/transfer', studentController.issueTransferCertificate);
router.post('/student/:id/enroll', studentController.enrollStudent);

// Third-Party Agency Verification Requests (Routed to Central Education Board)
router.post('/agency-requests', studentController.createAgencyRequest);
router.get('/agency-requests', studentController.getAgencyRequests);
router.put('/agency-requests/:id/review', studentController.reviewAgencyRequest);

// Student Academic Marks
router.get('/student/:id/marks', studentController.getMarks);
router.post('/student/:id/marks', studentController.addMark);
router.delete('/student/:id/marks/:markId', studentController.deleteMark);

module.exports = router;
