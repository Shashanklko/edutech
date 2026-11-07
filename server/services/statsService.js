 const Student = require('../models/Student');
const School = require('../models/School');

/**
 * Aggregate platform-wide statistics for Central Ministry, State Ministries, and Boards
 * Supports query: { state, board }
 */
const getPlatformStats = async (query = {}) => {
    let studentMatch = {};
    let schoolMatch = {};

    const andSchoolConditions = [];

    if (query.state && query.state !== 'All') {
        const sClean = query.state.trim();
        const stateRegex = new RegExp(`^${sClean}$`, 'i');
        andSchoolConditions.push({
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
        andSchoolConditions.push({
            $or: [
                { boardCode: new RegExp(bClean, 'i') },
                { affiliation: new RegExp(bClean, 'i') }
            ]
        });
    }

    if (andSchoolConditions.length > 0) {
        schoolMatch = { $and: andSchoolConditions };
        const matchingSchools = await School.find(schoolMatch).select('_id');
        const schoolIds = matchingSchools.map(s => s._id);
        studentMatch = { currentSchoolId: { $in: schoolIds } };
    }

    const totalStudents = await Student.countDocuments(studentMatch);
    const activeStudents = await Student.countDocuments({ ...studentMatch, status: 'Active' });
    const transferredStudents = await Student.countDocuments({ ...studentMatch, status: 'Transferred' });

    const totalInstitutions = await School.countDocuments(schoolMatch);
    const schoolsCount = await School.countDocuments({ 
        ...schoolMatch, 
        institutionType: 'school' 
    });
    const collegesCount = await School.countDocuments({ 
        ...schoolMatch, 
        institutionType: 'college' 
    });
    const univsCount = await School.countDocuments({ 
        ...schoolMatch, 
        institutionType: 'university' 
    });

    // Graduation Forecast by Year (Next 4 Years)
    const graduationAggregate = await Student.aggregate([
        { $match: { ...studentMatch, graduationYear: { $ne: null } } },
        { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    const graduationForecast = graduationAggregate.map(g => ({
        year: g._id,
        count: g.count
    }));

    // Gender Parity Distribution
    const genderAggregate = await Student.aggregate([
        { $match: studentMatch },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const genderStats = {
        male: genderAggregate.find(g => g._id === 'Male')?.count || 0,
        female: genderAggregate.find(g => g._id === 'Female')?.count || 0,
        other: genderAggregate.find(g => g._id === 'Other')?.count || 0
    };

    // Education Level Distribution (Literacy / Transition Ladder)
    const levelAggregate = await Student.aggregate([
        { $match: studentMatch },
        { $group: { _id: '$courseType', count: { $sum: 1 } } }
    ]);
    const levelDistribution = levelAggregate.map(l => ({
        level: l._id || 'General',
        count: l.count
    }));

    // Retention & Transition Index
    const retentionRate = totalStudents > 0 
        ? (((activeStudents + transferredStudents) / totalStudents) * 100).toFixed(1) 
        : '100.0';

    const recentTransfers = await Student.find({
        ...studentMatch,
        $or: [{ status: 'Transferred' }, { 'history.leftYear': { $ne: 'Present' } }]
    })
    .select('uniqueId name status currentClass qualification currentSchoolName tcRemarks conduct tcNumber')
    .sort({ updatedAt: -1 })
    .limit(6);

    return {
        totalStudents,
        activeStudents,
        transferredStudents,
        totalInstitutions,
        schoolsCount,
        collegesCount,
        univsCount,
        retentionRate,
        graduationForecast,
        genderStats,
        levelDistribution,
        recentTransfers,
        scope: query.state || query.board || 'National'
    };
};

/**
 * Retrieve Out-of-School / Dropout Alarms with optional board and state filtering
 * @param {string} boardQuery - Optional filter e.g. 'CBSE', 'UP-BOARD', 'All'
 * @param {string} stateQuery - Optional filter e.g. 'Uttar Pradesh', 'Delhi', 'All'
 */
const getBoardDropoutAlarms = async (boardQuery, stateQuery) => {
    const transferredStudents = await Student.find({ status: 'Transferred' });
    const schools = await School.find();
    const schoolMap = new Map();
    schools.forEach(s => schoolMap.set(s._id, s));

    const now = new Date();
    const alarms = [];

    for (const student of transferredStudents) {
        const lastHist = student.history && student.history.length > 0 ? student.history[student.history.length - 1] : null;
        const schoolId = student.currentSchoolId || lastHist?.schoolId;
        const school = schoolMap.get(schoolId);
        const schoolAffiliation = school?.affiliation || 'Affiliated Board / Directorate of Education';
        const schoolRegion = school?.region || 'National Registry Region';
        const schoolState = school?.state || (schoolRegion.toLowerCase().includes('uttar pradesh') || schoolRegion.toLowerCase().includes('lucknow') || schoolRegion.toLowerCase().includes('noida') ? 'Uttar Pradesh' : 'Delhi');

        // Determine which board governs this releasing institution
        let boardName = 'State Board / Regional Council';
        if (schoolAffiliation.toLowerCase().includes('cbse')) boardName = 'CBSE (Central Board of Secondary Education)';
        else if (schoolAffiliation.toLowerCase().includes('icse') || schoolAffiliation.toLowerCase().includes('cisce')) boardName = 'CISCE / ICSE Board';
        else if (schoolAffiliation.toLowerCase().includes('aicte') || schoolAffiliation.toLowerCase().includes('ugc')) boardName = 'UGC / AICTE University Council';
        else if (schoolAffiliation.toLowerCase().includes('upmsp') || schoolAffiliation.toLowerCase().includes('up board')) boardName = 'UPMSP / Uttar Pradesh State Secondary Board';
        else if (schoolAffiliation.toLowerCase().includes('state')) boardName = 'State Secondary Education Board';

        // Filter by board if specified
        if (boardQuery && boardQuery !== 'All') {
            const matchesBoard = boardName.toLowerCase().includes(boardQuery.toLowerCase()) || 
                                 schoolAffiliation.toLowerCase().includes(boardQuery.toLowerCase()) ||
                                 (school?.boardCode && school.boardCode.toLowerCase().includes(boardQuery.toLowerCase()));
            if (!matchesBoard) continue;
        }

        // Filter by state if specified
        if (stateQuery && stateQuery !== 'All') {
            const matchesState = schoolState.toLowerCase() === stateQuery.toLowerCase() ||
                                 schoolRegion.toLowerCase().includes(stateQuery.toLowerCase()) ||
                                 (student.address && student.address.toLowerCase().includes(stateQuery.toLowerCase()));
            if (!matchesState) continue;
        }

        const issueDate = student.tcIssueDate || student.dateOfLeaving || new Date(now.getTime() - (35 * 24 * 60 * 60 * 1000));
        const diffMs = now - new Date(issueDate);
        const daysElapsed = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        let riskLevel = 'TRANSITION_GRACE_PERIOD';
        let alertBadge = 'Transitioning';
        if (daysElapsed >= 45) {
            riskLevel = 'CRITICAL_DROPOUT_RISK';
            alertBadge = 'High Dropout Alarm';
        } else if (daysElapsed >= 20) {
            riskLevel = 'WARNING_UNENROLLED_TRANSITION';
            alertBadge = 'Unenrolled Notice';
        }

        alarms.push({
            studentId: student.uniqueId,
            name: student.name,
            fatherName: student.fatherName,
            phoneNumber: student.phoneNumber,
            address: student.address,
            gender: student.gender,
            state: schoolState,
            lastCompletedClass: lastHist?.lastClass || student.qualification || student.course,
            releasingSchoolId: schoolId,
            releasingSchoolName: school?.name || student.currentSchoolName,
            releasingSchoolAffiliation: schoolAffiliation,
            releasingBoardName: boardName,
            releasingRegion: schoolRegion,
            tcNumber: student.tcNumber || `TC-${student.uniqueId}`,
            tcRemarks: student.tcRemarks,
            conduct: student.conduct,
            tcIssueDate: issueDate,
            daysElapsed,
            riskLevel,
            alertBadge
        });
    }

    // Sort with highest days elapsed first
    alarms.sort((a, b) => b.daysElapsed - a.daysElapsed);

    return {
        totalAlarms: alarms.length,
        criticalCount: alarms.filter(a => a.riskLevel === 'CRITICAL_DROPOUT_RISK').length,
        warningCount: alarms.filter(a => a.riskLevel === 'WARNING_UNENROLLED_TRANSITION').length,
        alarms
    };
};

module.exports = {
    getPlatformStats,
    getBoardDropoutAlarms
};
