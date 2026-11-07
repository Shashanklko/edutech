const School = require('../models/School');
const User = require('../models/User');
const Student = require('../models/Student');

/**
 * Automatically generate a unique system Registry ID based on institution type
 * (School vs College vs University)
 * @param {string} [type='school'] - 'school' | 'college' | 'university'
 */
const generateNextInstitutionId = async (type = 'school') => {
    const cleanType = String(type || 'school').toLowerCase();
    let prefix = 'UDISE-0701';
    let codePrefix = 'SCH';
    if (cleanType === 'college' || cleanType === 'clg') {
        prefix = 'AISHE-C';
        codePrefix = 'CLG';
    } else if (cleanType === 'university' || cleanType === 'univ') {
        prefix = 'AISHE-U';
        codePrefix = 'UNIV';
    }

    // Find all institutions starting with this prefix or code
    const existing = await School.find({
        $or: [
            { _id: new RegExp(`^${prefix}`, 'i') },
            { _id: new RegExp(`^${codePrefix}`, 'i') }
        ]
    }).select('_id');

    let serial = existing.length + 1;
    let padLength = cleanType === 'college' ? 5 : (cleanType === 'university' ? 4 : 3);
    let generatedId = `${prefix}-${String(serial).padStart(padLength, '0')}`;

    // Guarantee uniqueness
    while (await School.findById(generatedId)) {
        serial++;
        generatedId = `${prefix}-${String(serial).padStart(padLength, '0')}`;
    }

    return {
        id: generatedId,
        institutionType: cleanType === 'college' ? 'college' : (cleanType === 'university' ? 'university' : 'school')
    };
};

/**
 * Retrieve all registered schools & universities with optional jurisdiction & board filtering
 */
const getAllSchools = async (query = {}) => {
    const andConditions = [];

    if (query.state && query.state !== 'All') {
        const sClean = query.state.trim();
        const stateRegex = new RegExp(`^${sClean}$`, 'i');
        andConditions.push({
            $or: [
                { state: stateRegex },
                { 
                    $and: [
                        { $or: [{ state: { $exists: false } }, { state: null }, { state: '' }] },
                        { region: new RegExp(sClean, 'i') }
                    ]
                }
            ]
        });
    }

    if (query.board && query.board !== 'All') {
        const bClean = query.board.trim();
        andConditions.push({
            $or: [
                { boardCode: new RegExp(bClean, 'i') },
                { affiliation: new RegExp(bClean, 'i') }
            ]
        });
    }

    if (query.type && query.type !== 'All') {
        andConditions.push({ institutionType: query.type.toLowerCase() });
    }

    if (query.region && query.region !== 'All') {
        andConditions.push({ region: new RegExp(query.region.trim(), 'i') });
    }

    if (query.search && query.search.trim()) {
        const searchRegex = new RegExp(query.search.trim(), 'i');
        andConditions.push({
            $or: [
                { name: searchRegex },
                { _id: searchRegex },
                { region: searchRegex },
                { affiliation: searchRegex },
                { address: searchRegex },
                { principalName: searchRegex }
            ]
        });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const schools = await School.find(filter).sort({ name: 1 }).lean();
    return schools.map(s => {
        let type = s.institutionType;
        if (!type) {
            const sId = (s._id || '').toUpperCase();
            const sName = (s.name || '').toLowerCase();
            if (sId.startsWith('UNIV') || sId.startsWith('IIT') || sId.startsWith('NIT') || sName.includes('university') || sName.includes('technology')) {
                type = 'university';
            } else if (sId.startsWith('CLG') || sId.startsWith('COL') || (sName.includes('college') && !sName.includes('inter college'))) {
                type = 'college';
            } else {
                type = 'school';
            }
        }
        return {
            ...s,
            id: s._id,
            _id: s._id,
            state: s.state || (s.region?.includes('Uttar Pradesh') || s.region?.includes('Lucknow') || s.region?.includes('Varanasi') || s.region?.includes('Noida') ? 'Uttar Pradesh' : (s.region?.includes('Kolkata') ? 'West Bengal' : (s.region?.includes('Mumbai') ? 'Maharashtra' : 'Delhi'))),
            institutionType: type
        };
    });
};

/**
 * Register a new educational institution along with its default admin credentials
 * @param {Object} schoolData 
 * @param {Object} [caller] - Requesting user (must be ADMIN or Board)
 */
const registerSchool = async (schoolData, caller = null) => {
    if (caller) {
        const callerTier = (caller.tier || '').toLowerCase();
        const callerId = (caller.id || caller.username || '').toUpperCase();
        if (callerTier === 'state' || (callerTier === 'central' && callerId !== 'ADMIN')) {
            const error = new Error('Government monitoring authorities hold read-only oversight privileges. Institution profile registration is strictly reserved for Examination Boards (CBSE, UPMSP, etc.) or Master Depository Administrator.');
            error.statusCode = 403;
            throw error;
        }
    }

    let { schoolId, name, state, region, boardCode, password, institutionType, establishedYear, affiliation, address, email, phone, principalName, website } = schoolData;
    if (!name || !name.trim()) {
        const error = new Error('Institution Official Name is required');
        error.statusCode = 400;
        throw error;
    }

    let cleanType = (institutionType || 'school').toLowerCase();
    if (!['school', 'college', 'university'].includes(cleanType)) {
        cleanType = 'school';
    }

    let sId = schoolId ? schoolId.trim().toUpperCase() : '';
    // If not provided or user requests auto-generation
    if (!sId) {
        const generated = await generateNextInstitutionId(cleanType);
        sId = generated.id;
    }

    // Check if ID already exists
    const existing = await School.findById(sId);
    if (existing) {
        const error = new Error(`Institution ID "${sId}" already registered in EduVera.`);
        error.statusCode = 409;
        throw error;
    }

    let defaultAffiliation = affiliation;
    if (!defaultAffiliation) {
        if (cleanType === 'university') defaultAffiliation = 'Apex Higher Ed / UGC & AICTE';
        else if (cleanType === 'college') defaultAffiliation = 'Undergraduate Affiliated College / UGC';
        else defaultAffiliation = 'CBSE / State Secondary Board';
    }

    // Auto-derive state if missing
    let derivedState = state;
    if (!derivedState) {
        const checkStr = `${region || ''} ${address || ''} ${name}`.toLowerCase();
        if (checkStr.includes('uttar pradesh') || checkStr.includes('lucknow') || checkStr.includes('varanasi') || checkStr.includes('noida') || sId.includes('UP')) {
            derivedState = 'Uttar Pradesh';
        } else if (checkStr.includes('kolkata') || checkStr.includes('west bengal')) {
            derivedState = 'West Bengal';
        } else if (checkStr.includes('mumbai') || checkStr.includes('maharashtra')) {
            derivedState = 'Maharashtra';
        } else {
            derivedState = 'Delhi';
        }
    }

    // 1. Create School document
    const newSchool = new School({
        _id: sId,
        name: name.trim(),
        state: derivedState,
        region: region ? region.trim() : `${derivedState} Jurisdiction`,
        boardCode: boardCode || (cleanType === 'university' ? 'UGC' : (cleanType === 'college' ? 'UGC' : (derivedState === 'Uttar Pradesh' ? 'UP-BOARD' : 'CBSE'))),
        institutionType: cleanType,
        establishedYear: establishedYear || new Date().getFullYear(),
        affiliation: defaultAffiliation,
        address: address || null,
        email: email || null,
        phone: phone || null,
        principalName: principalName || null,
        website: website || null
    });
    await newSchool.save();

    // 2. Create User login credentials
    const newUser = new User({
        username: sId,
        password: password || 'admin123',
        role: 'school',
        referenceId: sId
    });
    await newUser.save();

    return { 
        school: {
            ...newSchool.toObject(),
            id: newSchool._id,
            _id: newSchool._id
        }, 
        user: newUser,
        generatedId: sId 
    };
};

/**
 * Retrieve institution profile by ID
 * @param {string} id 
 */
const getSchoolById = async (id) => {
    const sId = id.toUpperCase();
    const school = await School.findById(sId).lean();
    if (!school) {
        const error = new Error('Institution not found');
        error.statusCode = 404;
        throw error;
    }
    let type = school.institutionType;
    if (!type) {
        const sName = (school.name || '').toLowerCase();
        if (sId.startsWith('UNIV') || sId.startsWith('IIT') || sId.startsWith('NIT') || sName.includes('university') || sName.includes('technology')) {
            type = 'university';
        } else if (sId.startsWith('CLG') || sId.startsWith('COL') || (sName.includes('college') && !sName.includes('inter college'))) {
            type = 'college';
        } else {
            type = 'school';
        }
    }
    return {
        ...school,
        id: school._id,
        _id: school._id,
        institutionType: type
    };
};

/**
 * Update institution profile details
 * @param {string} id 
 * @param {Object} profileData 
 */
const updateSchoolProfile = async (id, profileData) => {
    const { name, region, establishedYear, affiliation, address, email, phone, principalName, website } = profileData;
    const school = await School.findByIdAndUpdate(id.toUpperCase(), {
        name,
        region,
        establishedYear: establishedYear || null,
        affiliation: affiliation || null,
        address: address || null,
        email: email || null,
        phone: phone || null,
        principalName: principalName || null,
        website: website || null
    }, { new: true });

    if (!school) {
        const error = new Error('Institution not found');
        error.statusCode = 404;
        throw error;
    }
    return school;
};

/**
 * Get all students currently enrolled in a school
 * @param {string} schoolId 
 */
const getSchoolStudents = async (schoolId) => {
    return await Student.find({ currentSchoolId: schoolId.toUpperCase() }).sort({ name: 1 });
};

/**
 * Reset password for a school user
 * @param {string} schoolId 
 * @param {string} newPassword 
 */
const resetSchoolPassword = async (schoolId, newPassword) => {
    if (!newPassword) {
        const error = new Error('New password is required');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOneAndUpdate(
        { referenceId: schoolId.toUpperCase(), role: 'school' },
        { password: newPassword }
    );
    if (!user) {
        const error = new Error('School user not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

module.exports = {
    getAllSchools,
    registerSchool,
    getSchoolById,
    updateSchoolProfile,
    getSchoolStudents,
    resetSchoolPassword,
    generateNextInstitutionId
};
