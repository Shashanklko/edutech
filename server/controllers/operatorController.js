const operatorService = require('../services/operatorService');

const verifyMasterAccess = (req) => {
    const isMasterBody = req.body?.isMaster;
    const isMasterQuery = req.query?.isMaster;
    if (isMasterBody === false || isMasterQuery === 'false') {
        const error = new Error('Access Denied: Universal Access / Operator Governance is restricted exclusively to the Master Operator.');
        error.statusCode = 403;
        throw error;
    }
};

/**
 * Get all operators under an institution / authority
 */
const getOperators = async (req, res) => {
    try {
        const institutionId = req.query.institutionId || req.query.schoolId || req.query.id;
        if (!institutionId) {
            return res.status(400).json({ error: 'Institution / Authority ID is required' });
        }
        const operators = await operatorService.getOperatorsByInstitution(institutionId);
        res.json(operators);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Custom create a new operator by Master Admin
 */
const createOperator = async (req, res) => {
    try {
        verifyMasterAccess(req);
        const operator = await operatorService.createOperator(req.body);
        res.status(201).json({
            message: `Operator ${operator.operatorId} generated successfully`,
            operator
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Reset operator password directly by Master Admin
 */
const resetPassword = async (req, res) => {
    try {
        verifyMasterAccess(req);
        const { id } = req.params; // operatorId
        const { institutionId, newPassword } = req.body;
        const result = await operatorService.resetOperatorPassword(id, institutionId, newPassword);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Toggle operator status (Active / Suspended)
 */
const toggleStatus = async (req, res) => {
    try {
        verifyMasterAccess(req);
        const { id } = req.params;
        const { institutionId, status } = req.body;
        const result = await operatorService.toggleOperatorStatus(id, institutionId, status);
        res.json({ message: `Operator status updated to ${result.status}`, operator: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Delete operator by Master Admin
 */
const deleteOperator = async (req, res) => {
    try {
        verifyMasterAccess(req);
        const { id } = req.params;
        const institutionId = req.query.institutionId;
        const result = await operatorService.deleteOperator(id, institutionId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Submit public password reset request from operator to Master Admin
 */
const submitResetRequest = async (req, res) => {
    try {
        const result = await operatorService.requestPasswordReset(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * List password reset requests for a Master Admin
 */
const getResetRequests = async (req, res) => {
    try {
        const institutionId = req.query.institutionId || req.query.schoolId;
        const requests = await operatorService.getResetRequests(institutionId);
        res.json(requests);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

/**
 * Approve password reset request by Master Admin
 */
const approveResetRequest = async (req, res) => {
    try {
        const { id } = req.params; // requestId
        const { newPassword, masterAdminId } = req.body;
        const result = await operatorService.approveResetRequest(id, newPassword, masterAdminId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    getOperators,
    createOperator,
    resetPassword,
    toggleStatus,
    deleteOperator,
    submitResetRequest,
    getResetRequests,
    approveResetRequest
};
