const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.listReports);
router.post('/', reportController.submitReport);
router.put('/:reportId/review', reportController.reviewReport);

module.exports = router;

