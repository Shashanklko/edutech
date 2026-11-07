const Operator = require('../models/Operator');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const School = require('../models/School');

// Default initial operator templates for auto-seeding if an institution has no operators in DB yet
const defaultOperatorTemplates = {
    'SCH001': [
        { operatorId: 'OP-SCH001', name: 'Alok Nath', deskRole: 'Admissions & Records Officer', tier: 'school' }
    ],
    'SCH002': [
        { operatorId: 'OP-SCH002', name: 'Ravi Verma', deskRole: 'Senior Admissions Registrar', tier: 'school' },
        { operatorId: 'OP-SCH002-EXAMS', name: 'Meena Saxena', deskRole: 'Academic Examination Controller', tier: 'school' }
    ],
    'SCH003': [
        { operatorId: 'OP-SCH003', name: 'Sister Theresa', deskRole: 'Enrollment & TC Clearance Desk', tier: 'school' }
    ],
    'UNIV001': [
        { operatorId: 'OP-UNIV001', name: 'Prof. Ramesh Chandra', deskRole: 'University Registrar / Admissions Dean', tier: 'university' }
    ],
    'CBSE': [
        { operatorId: 'OP-CBSE-01', name: 'Virendra Singh', deskRole: 'Central Depository & Verification Desk', tier: 'board' }
    ],
    'CISCE': [
        { operatorId: 'OP-CISCE-01', name: 'Anita Joseph', deskRole: 'ICSE Examination Council Officer', tier: 'board' }
    ],
    'MIN-EDU': [
        { operatorId: 'OP-CENTRAL-01', name: 'Dr. K. S. Murthy', deskRole: 'National Education Census Director', tier: 'central' }
    ],
    'UGC': [
        { operatorId: 'OP-UGC-01', name: 'Dr. Sunita Rao', deskRole: 'Higher Education Accreditation Desk', tier: 'central' }
    ],
    'AICTE': [
        { operatorId: 'OP-AICTE-01', name: 'Dr. P. Balakrishnan', deskRole: 'Technical Education Standards Controller', tier: 'central' }
    ],
    'STATE-DL': [
        { operatorId: 'OP-STATE-DL', name: 'Sanjay Tyagi', deskRole: 'Delhi Directorate of Education Officer', tier: 'state' }
    ],
    'STATE-WB': [
        { operatorId: 'OP-STATE-WB', name: 'Debashis Mukherjee', deskRole: 'West Bengal School Education Desk', tier: 'state' }
    ],
    'ADMIN': [
        { operatorId: 'OP-MASTER-01', name: 'EduVera System Lead', deskRole: 'Master Platform Operations Officer', tier: 'central' },
        { operatorId: 'OP-ADMIN-01', name: 'EduVera Operations Lead', deskRole: 'Platform Administrator Desk', tier: 'central' }
    ],
    'MOE': [
        { operatorId: 'OP-MOE-01', name: 'Dr. K. S. Murthy', deskRole: 'National Education Census Director', tier: 'central' }
    ],
    'UP-MOE': [
        { operatorId: 'OP-UP-MOE', name: 'Dr. Akhilesh Tripathi', deskRole: 'Uttar Pradesh State Outreach Lead', tier: 'state' }
    ],
    'UP-BOARD': [
        { operatorId: 'OP-UPBOARD-01', name: 'Harish Chandra Joshi', deskRole: 'UP Secondary Examination Controller', tier: 'board' }
    ],
    'SCH-CBSE-01': [
        { operatorId: 'OP-DPS-01', name: 'Mrs. Suman Rastogi', deskRole: 'Chief Admissions Registrar', tier: 'school' }
    ],
    'SCH-CBSE-02': [
        { operatorId: 'OP-KV-01', name: 'Manoj Kumar Sharma', deskRole: 'Academic Records Controller', tier: 'school' }
    ],
    'SCH-UP-01': [
        { operatorId: 'OP-GIC-LKO', name: 'Ram Dayal Verma', deskRole: 'Principal Registrar', tier: 'school' }
    ],
    'IIT-DELHI': [
        { operatorId: 'OP-IITD-01', name: 'Col. Sanjeev Singh (Retd.)', deskRole: 'Registrar & Senate Secretariat Lead', tier: 'university' }
    ],
    'UNIV-DU': [
        { operatorId: 'OP-DU-01', name: 'Dr. Vikas Gupta', deskRole: 'Central University Registrar', tier: 'university' }
    ]
};

/**
 * Seed initial operators if collection is empty for an institution
 */
const ensureInitialOperators = async (institutionId) => {
    const instId = institutionId.toUpperCase();
    const count = await Operator.countDocuments({ institutionId: instId });
    if (count === 0 && defaultOperatorTemplates[instId]) {
        const templates = defaultOperatorTemplates[instId];
        for (const t of templates) {
            await Operator.create({
                operatorId: t.operatorId,
                institutionId: instId,
                tier: t.tier || (instId.startsWith('UNIV') ? 'university' : 'school'),
                name: t.name,
                deskRole: t.deskRole,
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            });
        }
    }
};

/**
 * Retrieve all operators under an institution / department
 * @param {string} institutionId 
 */
const getOperatorsByInstitution = async (institutionId) => {
    if (!institutionId) {
        const error = new Error('Institution/Authority ID is required');
        error.statusCode = 400;
        throw error;
    }
    const cleanId = institutionId.toUpperCase().trim();
    await ensureInitialOperators(cleanId);
    return await Operator.find({ institutionId: cleanId }).sort({ createdAt: -1 });
};

/**
 * Custom Generate / Create a new Operator ID by Master Admin
 * @param {Object} data 
 */
const createOperator = async (data) => {
    let { operatorId, institutionId, name, email, phone, deskRole, password, tier } = data;

    if (!institutionId || !name) {
        const error = new Error('Institution ID and Operator Name are required');
        error.statusCode = 400;
        throw error;
    }

    const cleanInstId = institutionId.toUpperCase().trim();
    
    // If no custom operatorId was provided, auto-generate one with standard prefix
    if (!operatorId || !operatorId.trim()) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        operatorId = `OP-${cleanInstId}-${randomNum}`;
    } else {
        operatorId = operatorId.toUpperCase().trim();
    }

    // Check for collision
    const existing = await Operator.findOne({ operatorId });
    if (existing) {
        const error = new Error(`Operator ID "${operatorId}" is already registered`);
        error.statusCode = 409;
        throw error;
    }

    if (!tier) {
        if (cleanInstId.startsWith('UNIV')) tier = 'university';
        else if (cleanInstId.startsWith('STATE')) tier = 'state';
        else if (['CBSE', 'CISCE'].includes(cleanInstId)) tier = 'board';
        else if (['ADMIN', 'MIN-EDU', 'UGC', 'AICTE'].includes(cleanInstId)) tier = 'central';
        else tier = 'school';
    }

    const operator = new Operator({
        operatorId,
        institutionId: cleanInstId,
        tier,
        name: name.trim(),
        email: email ? email.trim() : '',
        phone: phone ? phone.trim() : '',
        deskRole: deskRole ? deskRole.trim() : 'Desk Operator',
        password: password ? password.trim() : 'admin123',
        status: 'Active',
        createdBy: 'Master Admin'
    });

    await operator.save();
    return operator;
};

/**
 * Reset Operator Password by Master Admin
 * @param {string} operatorId 
 * @param {string} institutionId 
 * @param {string} newPassword 
 */
const resetOperatorPassword = async (operatorId, institutionId, newPassword) => {
    if (!operatorId || !newPassword) {
        const error = new Error('Operator ID and New Password are required');
        error.statusCode = 400;
        throw error;
    }

    const cleanOpId = operatorId.toUpperCase().trim();
    let operator = await Operator.findOne({ operatorId: cleanOpId });

    if (!operator && institutionId) {
        await ensureInitialOperators(institutionId.toUpperCase().trim());
        operator = await Operator.findOne({ operatorId: cleanOpId });
    }

    if (!operator) {
        const error = new Error(`Operator "${cleanOpId}" not found`);
        error.statusCode = 404;
        throw error;
    }

    operator.password = newPassword.trim();
    await operator.save();

    // Mark any pending reset requests for this operator as approved
    await PasswordResetRequest.updateMany(
        { operatorId: cleanOpId, status: 'Pending' },
        { 
            status: 'Approved', 
            temporaryPassword: newPassword.trim(),
            reviewedBy: institutionId ? institutionId.toUpperCase().trim() : 'Master Admin',
            reviewedAt: new Date()
        }
    );

    return {
        success: true,
        message: `Password for Operator ${cleanOpId} has been successfully updated by Master Admin.`,
        operatorId: cleanOpId
    };
};

/**
 * Toggle Operator Active / Suspended Status
 */
const toggleOperatorStatus = async (operatorId, institutionId, status) => {
    const cleanOpId = operatorId.toUpperCase().trim();
    const operator = await Operator.findOne({ operatorId: cleanOpId });
    if (!operator) {
        const error = new Error(`Operator "${cleanOpId}" not found`);
        error.statusCode = 404;
        throw error;
    }

    operator.status = status === 'Suspended' ? 'Suspended' : 'Active';
    await operator.save();
    return operator;
};

/**
 * Delete Operator
 */
const deleteOperator = async (operatorId, institutionId) => {
    const cleanOpId = operatorId.toUpperCase().trim();
    const result = await Operator.deleteOne({ operatorId: cleanOpId });
    if (result.deletedCount === 0) {
        const error = new Error(`Operator "${cleanOpId}" not found`);
        error.statusCode = 404;
        throw error;
    }
    return { success: true, message: `Operator ${cleanOpId} removed.` };
};

/**
 * Submit a Password Reset Request from Operator to Master Admin
 * @param {Object} data 
 */
const requestPasswordReset = async (data) => {
    const { operatorId, institutionId, requesterName, requesterContact, reason } = data;

    if (!operatorId || !institutionId) {
        const error = new Error('Operator ID and Institution/Authority Code are required to route reset request');
        error.statusCode = 400;
        throw error;
    }

    const cleanOpId = operatorId.toUpperCase().trim();
    const cleanInstId = institutionId.toUpperCase().trim();

    // Ensure operator exists or is known
    await ensureInitialOperators(cleanInstId);
    let operator = await Operator.findOne({ operatorId: cleanOpId, institutionId: cleanInstId });

    if (!operator) {
        // If operator not found under that institution
        const anyOp = await Operator.findOne({ operatorId: cleanOpId });
        if (anyOp) {
            const error = new Error(`Operator ${cleanOpId} belongs to institution ${anyOp.institutionId}, not ${cleanInstId}`);
            error.statusCode = 400;
            throw error;
        }
        // If completely new, register pending placeholder
        operator = { name: requesterName || cleanOpId, tier: 'school' };
    }

    const requestId = `RST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const resetReq = new PasswordResetRequest({
        requestId,
        operatorId: cleanOpId,
        institutionId: cleanInstId,
        tier: operator.tier || 'school',
        requesterName: requesterName ? requesterName.trim() : (operator.name || cleanOpId),
        requesterContact: requesterContact ? requesterContact.trim() : '',
        reason: reason ? reason.trim() : 'Forgot password during operations',
        status: 'Pending'
    });

    await resetReq.save();

    return {
        success: true,
        requestId: resetReq.requestId,
        message: `Password reset request routed to Master Admin of ${cleanInstId}. Master Admin can approve and issue new passkey.`,
        request: resetReq
    };
};

/**
 * Get all password reset requests for a Master Admin
 * @param {string} institutionId 
 */
const getResetRequests = async (institutionId) => {
    if (!institutionId) {
        return await PasswordResetRequest.find().sort({ createdAt: -1 });
    }
    const cleanInstId = institutionId.toUpperCase().trim();
    return await PasswordResetRequest.find({ institutionId: cleanInstId }).sort({ createdAt: -1 });
};

/**
 * Approve a password reset request by Master Admin
 * @param {string} requestId 
 * @param {string} newPassword 
 * @param {string} masterAdminId 
 */
const approveResetRequest = async (requestId, newPassword, masterAdminId) => {
    const req = await PasswordResetRequest.findOne({ requestId: requestId.trim() });
    if (!req) {
        const error = new Error('Reset request not found');
        error.statusCode = 404;
        throw error;
    }

    const passToSet = newPassword ? newPassword.trim() : `pass_${Math.floor(1000 + Math.random() * 9000)}`;

    // Update operator's actual password
    let operator = await Operator.findOne({ operatorId: req.operatorId });
    if (!operator) {
        await ensureInitialOperators(req.institutionId);
        operator = await Operator.findOne({ operatorId: req.operatorId });
    }

    if (operator) {
        operator.password = passToSet;
        await operator.save();
    }

    req.status = 'Approved';
    req.temporaryPassword = passToSet;
    req.reviewedBy = masterAdminId ? masterAdminId.toUpperCase().trim() : 'Master Admin';
    req.reviewedAt = new Date();
    await req.save();

    return {
        success: true,
        message: `Reset request approved. New password set for ${req.operatorId}: "${passToSet}"`,
        temporaryPassword: passToSet,
        request: req
    };
};

module.exports = {
    ensureInitialOperators,
    getOperatorsByInstitution,
    createOperator,
    resetOperatorPassword,
    toggleOperatorStatus,
    deleteOperator,
    requestPasswordReset,
    getResetRequests,
    approveResetRequest
};
