const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// Schools and Institutions Directory
router.get('/', schoolController.getAllSchools);
router.get('/generate-id', schoolController.getGeneratedId);
router.post('/', schoolController.registerSchool);
router.get('/:id', schoolController.getSchoolById);
router.put('/:id', schoolController.updateSchoolProfile);
router.get('/:id/students', schoolController.getSchoolStudents);
router.put('/:id/password', schoolController.resetSchoolPassword);

module.exports = router;
