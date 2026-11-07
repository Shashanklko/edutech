const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Platform Statistics routes
router.get('/overview', statsController.getOverviewStats);
router.get('/board-dropout-alarms', statsController.getBoardDropoutAlarms);
router.get('/dropout-alarms', statsController.getBoardDropoutAlarms);

module.exports = router;
