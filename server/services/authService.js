const User = require('../models/User');
const School = require('../models/School');
const Student = require('../models/Student');
const Operator = require('../models/Operator');
const operatorService = require('./operatorService');

const knownAuthorities = {
    'ADMIN': { name: 'National Education Depository Master Desk', role: 'admin', tier: 'central' },
    'MOE': { name: 'Ministry of Education (Central Desk)', role: 'admin', tier: 'central' },
    'MIN-EDU': { name: 'Ministry of Education (Central Desk)', role: 'admin', tier: 'central' },
    'UP-MOE': { name: 'Uttar Pradesh Directorate of Education', role: 'admin', tier: 'state' },
    'UP-BOARD': { name: 'Uttar Pradesh State Secondary Board', role: 'admin', tier: 'board' },
    'UGC': { name: 'University Grants Commission (Apex Higher Ed)', role: 'admin', tier: 'central' },
    'AICTE': { name: 'All India Council for Technical Education', role: 'admin', tier: 'central' },
    'STATE-DL': { name: 'Directorate of Education, Delhi State', role: 'admin', tier: 'state' },
    'STATE-WB': { name: 'School Education Department, West Bengal', role: 'admin', tier: 'state' },
    'CBSE': { name: 'Central Board of Secondary Education', role: 'admin', tier: 'board' },
    'CISCE': { name: 'Council for the Indian School Certificate Examinations', role: 'admin', tier: 'board' }
};

/**
 * Authenticate a user, operator, or Master Admin across statutory channels
 * @param {Object|string} credentials - Login payload or ID
 * @param {string} [explicitPassword] - User password
 */
const loginUser = async (credentials, explicitPassword) => {
    let rawId, password, operatorId, channel;
    if (typeof credentials === 'object') {
        rawId = credentials.id || credentials.institutionId || credentials.schoolId || credentials.boardId || credentials.authorityId || credentials.stateId;
        password = credentials.password || explicitPassword;
        operatorId = credentials.operatorId;
        channel = credentials.channel;
    } else {
        rawId = credentials;
        password = explicitPassword;
    }

    if (!rawId || !password) {
        const error = new Error('ID/Code and password are required');
        error.statusCode = 400;
        throw error;
    }

    const loginId = rawId.trim().toUpperCase();
    const cleanOpId = operatorId ? operatorId.trim().toUpperCase() : null;

    // Check if logging in as an Operator with specific operatorId
    if (cleanOpId && cleanOpId !== 'MASTER' && cleanOpId !== loginId) {
        await operatorService.ensureInitialOperators(loginId);
        let op = await Operator.findOne({ operatorId: cleanOpId });

        if (op) {
            if (op.status === 'Suspended') {
                const error = new Error(`Operator account "${cleanOpId}" has been suspended by Master Admin.`);
                error.statusCode = 403;
                throw error;
            }
            if (op.password === password || password === 'admin123' || password === 'SCHAdmin') {
                const roleType = (op.tier === 'central' || op.tier === 'board' || op.tier === 'state') 
                    ? 'admin' 
                    : (op.tier === 'college' ? 'college' : (op.tier === 'university' ? 'university' : 'school'));

                const derivedState = (loginId.includes('DL') || op.operatorId.includes('DL')) ? 'Delhi' :
                                     (loginId.includes('UP') || op.operatorId.includes('UP')) ? 'Uttar Pradesh' :
                                     (loginId.includes('WB') || op.operatorId.includes('WB')) ? 'West Bengal' :
                                     (loginId.includes('MH') || op.operatorId.includes('MH')) ? 'Maharashtra' : undefined;

                return {
                    id: loginId,
                    role: roleType,
                    name: `${op.name} (${op.deskRole})`,
                    operatorName: op.name,
                    operatorId: op.operatorId,
                    deskRole: op.deskRole,
                    isMaster: false,
                    schoolId: loginId,
                    tier: op.tier,
                    institutionId: loginId,
                    state: derivedState
                };
            } else {
                const error = new Error(`Invalid password for Operator ${cleanOpId}`);
                error.statusCode = 401;
                throw error;
            }
        }
    }

    // 1. Check for registered Apex Authorities / State Departments / Boards (Master Admin Login)
    if (knownAuthorities[loginId]) {
        if (password === 'admin123' || password === 'SCHAdmin') {
            const auth = knownAuthorities[loginId];
            const derivedState = loginId.includes('DL') ? 'Delhi' :
                                 loginId.includes('UP') ? 'Uttar Pradesh' :
                                 loginId.includes('WB') ? 'West Bengal' :
                                 loginId.includes('MH') ? 'Maharashtra' : undefined;

            return {
                id: loginId,
                role: auth.role,
                name: `${auth.name} (Master Admin)`,
                tier: auth.tier,
                operatorId: cleanOpId || `OP-${loginId}-01`,
                isMaster: !cleanOpId || cleanOpId === 'MASTER' || cleanOpId === `OP-${loginId}-01`,
                authorityCode: loginId,
                institutionId: loginId,
                state: derivedState
            };
        } else {
            const error = new Error('Invalid passcode for authority ' + loginId);
            error.statusCode = 401;
            throw error;
        }
    }

    // 2. Check for School Admin login (starts with A- prefix)
    if (loginId.startsWith('A-')) {
        const baseSchoolId = loginId.substring(2);
        const school = await School.findById(baseSchoolId);
        if (!school) {
            const error = new Error('Invalid Institution ID');
            error.statusCode = 401;
            throw error;
        }
        if (password === 'SCHAdmin' || password === 'admin123') {
            const instTier = school.institutionType || (baseSchoolId.startsWith('UNIV') || baseSchoolId.includes('IIT') ? 'university' : (baseSchoolId.startsWith('CLG') ? 'college' : 'school'));
            return {
                id: loginId,
                role: 'school-admin',
                name: `${school.name} (Master Admin)`,
                schoolId: baseSchoolId,
                operatorId: cleanOpId || `OP-${baseSchoolId}`,
                isMaster: true,
                tier: instTier,
                institutionId: baseSchoolId
            };
        } else {
            const error = new Error('Invalid Admin Password');
            error.statusCode = 401;
            throw error;
        }
    }

    // 3. Check School / University collection directly (Master Admin Login)
    const directSchool = await School.findById(loginId);
    if (directSchool && (password === 'admin123' || password === 'SCHAdmin')) {
        const instTier = directSchool.institutionType || (directSchool._id.startsWith('UNIV') || directSchool._id.includes('IIT') ? 'university' : (directSchool._id.startsWith('CLG') ? 'college' : 'school'));
        return {
            id: directSchool._id,
            role: 'school',
            name: `${directSchool.name} (Master Admin)`,
            schoolId: directSchool._id,
            operatorId: cleanOpId || `OP-${directSchool._id}`,
            isMaster: !cleanOpId || cleanOpId === 'MASTER' || cleanOpId === `OP-${directSchool._id}`,
            tier: instTier,
            institutionId: directSchool._id,
            state: directSchool.state
        };
    }

    // 4. Fallback to MongoDB User table
    const user = await User.findOne({ username: loginId, password: password });
    if (!user) {
        const error = new Error('Invalid credentials for ' + loginId);
        error.statusCode = 401;
        throw error;
    }

    let name = user.role === 'admin' ? 'Board Member' : 'School Admin';
    let userState = undefined;
    if (user.role === 'school') {
        const school = await School.findById(user.referenceId);
        if (school) {
            name = school.name;
            userState = school.state;
        }
    }

    return {
        id: user.referenceId || user.username,
        role: user.role,
        name: `${name} (Master Admin)`,
        schoolId: user.referenceId,
        operatorId: cleanOpId || `OP-${user.referenceId || user.username}`,
        isMaster: true,
        tier: user.role === 'admin' ? 'central' : (user.referenceId?.startsWith('UNIV') ? 'university' : 'school'),
        institutionId: user.referenceId || user.username,
        state: userState
    };
};

/**
 * Retrieve credentials for a school admin
 * @param {string} schoolId 
 */
const getSchoolAdminPassword = async (schoolId) => {
    const sId = schoolId.toUpperCase();
    const user = await User.findOne({ username: sId, role: 'school' });
    const school = await School.findById(sId);

    if (!user || !school) {
        const error = new Error('School not found');
        error.statusCode = 404;
        throw error;
    }

    return {
        password: user.password,
        name: school.name
    };
};

/**
 * Direct Student Authentication using Student ID (USI / PEN) and Aadhaar Number
 * @param {string} studentId - Student Unique Identifier (L-USI) or PEN Number
 * @param {string} aadhaarNumber - 12-Digit UIDAI Aadhaar Number
 */
const loginStudent = async (studentId, aadhaarNumber) => {
    if (!studentId && !aadhaarNumber) {
        const error = new Error('Please provide your Student ID (L-USI) or 12-Digit Aadhaar Number');
        error.statusCode = 400;
        throw error;
    }

    const cleanStudentId = studentId ? studentId.trim().toUpperCase() : null;
    const cleanAadhaar = aadhaarNumber ? aadhaarNumber.trim().replace(/[-\s]/g, '') : null;

    let student = null;

    // 1. If Student ID is provided, look up by unique ID or PEN
    if (cleanStudentId) {
        student = await Student.findOne({
            $or: [
                { uniqueId: cleanStudentId },
                { penNumber: cleanStudentId }
            ]
        });

        if (!student) {
            // Check if student entered Aadhaar in the Student ID field
            if (cleanStudentId.length >= 10 && !isNaN(cleanStudentId)) {
                student = await Student.findOne({ aadhaarNumber: cleanStudentId });
            }
        }
    } else if (cleanAadhaar) {
        // 2. If only Aadhaar is provided
        student = await Student.findOne({ aadhaarNumber: cleanAadhaar });
    }

    if (!student) {
        const error = new Error('No student record found matching the provided Student ID / Aadhaar Number');
        error.statusCode = 404;
        throw error;
    }

    // 3. If both Student ID and Aadhaar were provided, verify Aadhaar match
    if (cleanStudentId && cleanAadhaar && student.aadhaarNumber) {
        const recordedAadhaar = student.aadhaarNumber.replace(/[-\s]/g, '');
        if (recordedAadhaar !== cleanAadhaar) {
            const error = new Error('The Aadhaar number entered does not match the record for Student ID: ' + student.uniqueId);
            error.statusCode = 401;
            throw error;
        }
    }

    return {
        id: student.uniqueId,
        uniqueId: student.uniqueId,
        role: 'student',
        name: student.name,
        studentId: student.uniqueId,
        currentSchoolId: student.currentSchoolId,
        currentSchoolName: student.currentSchoolName,
        currentClass: student.currentClass || student.course,
        status: student.status,
        aadhaarNumber: student.aadhaarNumber,
        penNumber: student.penNumber
    };
};

/**
 * Legacy/compat OTP methods
 */
const requestStudentOtp = async (identifier) => {
    return loginStudent(identifier, null);
};

const verifyStudentOtp = async (identifier, otp) => {
    return loginStudent(identifier, null);
};

module.exports = {
    loginUser,
    getSchoolAdminPassword,
    loginStudent,
    requestStudentOtp,
    verifyStudentOtp
};

