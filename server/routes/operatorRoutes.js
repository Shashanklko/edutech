const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');

// Operator Directory & Custom Operator Generation
router.get('/', operatorController.getOperators);
router.post('/', operatorController.createOperator);
router.put('/:id/password', operatorController.resetPassword);
router.put('/:id/status', operatorController.toggleStatus);
router.delete('/:id', operatorController.deleteOperator);

// Operator Password Reset Requests (Public request & Master Admin review)
router.post('/reset-request', operatorController.submitResetRequest);
router.get('/reset-requests', operatorController.getResetRequests);
router.put('/reset-requests/:id/approve', operatorController.approveResetRequest);

module.exports = router;
