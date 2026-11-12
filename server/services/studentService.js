const Student = require('../models/Student');
const School = require('../models/School');

/**
 * Retrieve students with dynamic filters: schoolId, state, board, status, level, search, limit
 */
const getAllStudents = async (query = {}) => {
    const andConditions = [];

    if (query.schoolId && query.schoolId !== 'All') {
        andConditions.push({ currentSchoolId: query.schoolId.toUpperCase() });
    }

    if (query.status && query.status !== 'All') {
        andConditions.push({ status: query.status });
    }

    if (query.level && query.level !== 'All') {
        andConditions.push({
            $or: [
                { academicLevel: query.level.toLowerCase() },
                { courseType: query.level }
            ]
        });
    }

    if (query.state && query.state !== 'All') {
        const sClean = query.state.trim();
        const stateSchools = await School.find({
            $or: [
                { state: new RegExp(`^${sClean}$`, 'i') },
                { region: new RegExp(sClean, 'i') }
            ]
        }).select('_id');
        const schoolIds = stateSchools.map(s => s._id);
        andConditions.push({ currentSchoolId: { $in: schoolIds } });
    }

    if (query.board && query.board !== 'All') {
        const bClean = query.board.trim();
        const boardSchools = await School.find({
            $or: [
                { boardCode: new RegExp(bClean, 'i') },
                { affiliation: new RegExp(bClean, 'i') }
            ]
        }).select('_id');
        const schoolIds = boardSchools.map(s => s._id);
        andConditions.push({ currentSchoolId: { $in: schoolIds } });
    }

    if (query.search && query.search.trim()) {
        const searchRegex = new RegExp(query.search.trim(), 'i');
        andConditions.push({
            $or: [
                { uniqueId: searchRegex },
                { name: searchRegex },
                { rollNumber: searchRegex },
                { aadhaarNumber: searchRegex },
                { penNumber: searchRegex },
                { currentSchoolName: searchRegex }
            ]
        });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};
    const limit = parseInt(query.limit) || 100;
    return await Student.find(filter).sort({ name: 1 }).limit(limit);
};

/**
 * Search students across registered institutions
 * @param {string} query 
 */
const searchStudents = async (query) => {
    const trimmed = query ? query.trim() : '';
    if (!trimmed) return [];

    const regex = new RegExp(trimmed, 'i');
    return await Student.find({
        $or: [{ uniqueId: regex }, { name: regex }, { rollNumber: regex }]
    })
    .select('uniqueId name status currentClass qualification courseType course branch rollNumber currentSchoolName')
    .limit(10);
};

/**
 * Retrieve complete student details by unique ID
 * @param {string} id 
 */
const getStudentById = async (id) => {
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found in registry');
        error.statusCode = 404;
        throw error;
    }
    return student;
};

/**
 * Register a fresh student record with unique ID generation
 * @param {Object} data 
 */
const createStudent = async (data) => {
    const { 
        name, fatherName, motherName, dob, gender, address, currentClass, schoolId,
        courseType, course, branch, rollNumber, admissionYear, graduationYear, email, phoneNumber,
        bloodGroup, nationality, casteCategory,
        aadhaarNumber, abcId, penNumber, isDifferentlyAbled, religion, guardianIncomeCategory, motherTongue, height, weight, identificationMark
    } = data;

    if (!name || !schoolId) {
        const error = new Error('Name and School ID are required');
        error.statusCode = 400;
        throw error;
    }

    if (phoneNumber && phoneNumber.trim()) {
        const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            const error = new Error('Mobile number must be exactly 10 digits');
            error.statusCode = 400;
            throw error;
        }
    }

    if (!aadhaarNumber || aadhaarNumber.trim().replace(/[-\s]/g, '').length !== 12) {
        const error = new Error('A valid 12-digit Aadhaar number is mandatory for national depository registration');
        error.statusCode = 400;
        throw error;
    }

    // Fetch school name
    const school = await School.findById(schoolId);
    const schoolName = school ? school.name : 'Registered Institution';

    // Strict Institutional Tier & Domain Locking (Schools strictly K-12, Colleges/Universities Higher Ed)
    const instType = school?.institutionType || (schoolId.startsWith('UNIV') || schoolId.includes('IIT') ? 'university' : (schoolId.startsWith('CLG') ? 'college' : 'school'));
    const academicLevel = instType;

    // Generate base ID: e.g. RAHUL052010
    const firstName = name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const dobParts = dob ? String(dob).split('-') : ['0000', '00']; 
    const year = dobParts[0] || '0000'; 
    const month = dobParts[1] || '00';
    const baseId = `${firstName}${month}${year}`;

    // Calculate unique serial number if duplicates exist
    const existingStudents = await Student.find({ uniqueId: new RegExp(`^${baseId}`) });
    
    let uniqueId = baseId;
    if (existingStudents.length > 0) {
        let maxSerial = -1;
        for (let s of existingStudents) {
            if (s.uniqueId === baseId) {
                if (maxSerial < 0) maxSerial = 0;
            } else {
                const suffix = s.uniqueId.replace(baseId, '');
                if (!isNaN(suffix) && suffix !== '') {
                    const num = parseInt(suffix, 10);
                    if (num > maxSerial) maxSerial = num;
                }
            }
        }
        if (maxSerial >= 0) {
            uniqueId = `${baseId}${maxSerial + 1}`;
        }
    }

    const currentYr = new Date().getFullYear();

    // Differentiate payload based on strict institutional type
    let newStudentData = {
        _id: uniqueId,
        uniqueId,
        name,
        fatherName,
        motherName,
        dob: dob ? new Date(dob) : null,
        gender: gender || 'Male',
        address,
        status: 'Active',
        academicLevel,
        currentSchoolId: schoolId,
        currentSchoolName: schoolName,
        rollNumber: rollNumber || null,
        admissionYear: admissionYear || currentYr,
        graduationYear: graduationYear || (currentYr + (academicLevel === 'school' ? 2 : 4)),
        email: email || null,
        phoneNumber: phoneNumber || null,
        bloodGroup: bloodGroup || null,
        nationality: nationality || 'Indian',
        casteCategory: casteCategory || 'General',
        religion: religion || 'Hinduism',
        guardianIncomeCategory: guardianIncomeCategory || 'APL',
        motherTongue: motherTongue || 'Hindi',
        isDifferentlyAbled: isDifferentlyAbled || 'No',
        height: height ? parseInt(height, 10) : null,
        weight: weight ? parseInt(weight, 10) : null,
        identificationMark: identificationMark || null,
        aadhaarNumber: aadhaarNumber || null,
        marks: []
    };

    if (academicLevel === 'school') {
        // K-12 School Only (No Degrees, No Semesters, No PRN)
        const stdClass = currentClass || course || 'Class 10';
        newStudentData.currentClass = stdClass;
        newStudentData.qualification = stdClass;
        newStudentData.course = stdClass;
        newStudentData.branch = data.stream || branch || 'General';
        newStudentData.section = data.section || 'A';
        newStudentData.stream = data.stream || 'General';
        newStudentData.boardRollNumber = data.boardRollNumber || rollNumber || null;
        newStudentData.penNumber = penNumber || null;
        newStudentData.attendancePercentage = data.attendancePercentage ? parseFloat(data.attendancePercentage) : 85;
        newStudentData.courseType = (['Class 11', 'Class 12'].includes(stdClass)) ? 'Senior Secondary' : (['Class 9', 'Class 10'].includes(stdClass) ? 'Secondary School' : 'Primary/Middle School');
        newStudentData.degree = null;
        newStudentData.department = null;
        newStudentData.semester = null;
        newStudentData.prnNumber = null;
        newStudentData.abcId = null;
    } else {
        // College / University Higher Ed Only (No K-12 Standards, Sections)
        const deg = data.degree || course || 'B.Tech';
        const dept = data.department || branch || 'General';
        const sem = data.semester || 'Semester 1';
        newStudentData.degree = deg;
        newStudentData.department = dept;
        newStudentData.semester = sem;
        newStudentData.course = `${deg} in ${dept}`;
        newStudentData.qualification = `${deg} (${sem})`;
        newStudentData.branch = dept;
        newStudentData.currentClass = `${deg} (${sem})`;
        newStudentData.courseType = academicLevel === 'college' ? 'Graduation' : 'Higher Education';
        newStudentData.prnNumber = data.prnNumber || null;
        newStudentData.abcId = abcId || null;
        newStudentData.creditsEarned = data.creditsEarned ? parseInt(data.creditsEarned, 10) : 0;
        newStudentData.totalCreditsRequired = data.totalCreditsRequired ? parseInt(data.totalCreditsRequired, 10) : 160;
        newStudentData.section = null;
        newStudentData.stream = null;
        newStudentData.boardRollNumber = null;
    }

    newStudentData.history = [{
        schoolId: schoolId,
        schoolName: schoolName,
        joinedYear: String(currentYr),
        leftYear: 'Present',
        lastClass: newStudentData.currentClass,
        lastCourse: newStudentData.course,
        lastBranch: newStudentData.branch
    }];

    const newStudent = new Student(newStudentData);

    await newStudent.save();
    return { uniqueId, student: newStudent };
};

/**
 * Update an existing student's profile information
 * @param {string} id 
 * @param {Object} updateData 
 */
const updateStudent = async (id, updateData) => {
    const data = { ...updateData };
    if (data.phoneNumber && data.phoneNumber.trim()) {
        const cleanPhone = data.phoneNumber.trim().replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            const error = new Error('Mobile number must be exactly 10 digits');
            error.statusCode = 400;
            throw error;
        }
        data.phoneNumber = cleanPhone;
    }
    if (data.aadhaarNumber && data.aadhaarNumber.trim()) {
        const cleanAadhaar = data.aadhaarNumber.trim().replace(/\D/g, '');
        if (cleanAadhaar.length !== 12) {
            const error = new Error('Aadhaar number must be exactly 12 digits');
            error.statusCode = 400;
            throw error;
        }
        data.aadhaarNumber = cleanAadhaar;
    }
    if (data.course) {
        data.currentClass = data.course;
        data.qualification = data.course;
    }
    if (data.dob) {
        data.dob = new Date(data.dob);
    }

    const student = await Student.findByIdAndUpdate(id.toUpperCase(), data, { new: true });
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    return student;
};

/**
 * Issue a Transfer Certificate and finalize school timeline
 * @param {string} id 
 * @param {Object} transferData 
 */
const issueTransferCertificate = async (id, transferData) => {
    const { lastClass, conduct, reasonForLeaving, tcRemarks, tcNumber } = transferData;
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    const currentYear = String(new Date().getFullYear());
    const generatedTcNumber = tcNumber || `TC-${student.currentSchoolId || 'REG'}-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    student.status = 'Transferred';
    student.conduct = conduct || 'Good';
    student.reasonForLeaving = reasonForLeaving || 'Course Completed';
    student.tcRemarks = tcRemarks || null;
    student.tcNumber = generatedTcNumber;
    student.tcIssueDate = new Date();
    student.dateOfLeaving = new Date();

    const activeHistory = student.history.find(h => h.leftYear === 'Present');
    if (activeHistory) {
        activeHistory.leftYear = currentYear;
        if (lastClass) activeHistory.lastClass = lastClass;
        activeHistory.lastCourse = student.course;
        activeHistory.lastBranch = student.branch;
    }

    await student.save();
    return student;
};

/**
 * Enroll a transferred student into a new institution
 * @param {string} id 
 * @param {Object} enrollmentData 
 */
const enrollStudent = async (id, enrollmentData) => {
    const { 
        schoolId, currentClass, 
        courseType, course, branch, rollNumber, admissionYear, graduationYear,
        academicLevel, section, stream, boardRollNumber, degree, department, semester, prnNumber, abcId
    } = enrollmentData;

    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    const school = await School.findById(schoolId);
    const schoolName = school ? school.name : 'Registered Institution';

    // Strict Institutional Tier & Domain Locking
    const instType = school?.institutionType || (schoolId.startsWith('UNIV') || schoolId.includes('IIT') ? 'university' : (schoolId.startsWith('CLG') ? 'college' : 'school'));
    student.academicLevel = instType;
    student.status = 'Active';
    student.currentSchoolId = schoolId;
    student.currentSchoolName = schoolName;
    student.rollNumber = rollNumber || null;
    student.admissionYear = admissionYear || new Date().getFullYear();
    student.graduationYear = graduationYear || (new Date().getFullYear() + (instType === 'school' ? 2 : 4));

    if (instType === 'school') {
        const stdClass = currentClass || course || 'Class 11';
        student.currentClass = stdClass;
        student.qualification = stdClass;
        student.course = stdClass;
        student.section = section || 'A';
        student.stream = stream || 'General';
        student.branch = stream || 'General';
        student.boardRollNumber = boardRollNumber || rollNumber || null;
        student.courseType = (['Class 11', 'Class 12'].includes(stdClass)) ? 'Senior Secondary' : 'Secondary School';
        student.degree = null;
        student.department = null;
        student.semester = null;
        student.prnNumber = null;
    } else {
        const deg = degree || course || 'B.Tech';
        const dept = department || branch || 'General';
        const sem = semester || 'Semester 1';
        student.degree = deg;
        student.department = dept;
        student.semester = sem;
        student.course = `${deg} in ${dept}`;
        student.qualification = `${deg} (${sem})`;
        student.branch = dept;
        student.currentClass = `${deg} (${sem})`;
        student.courseType = instType === 'college' ? 'Graduation' : 'Higher Education';
        student.prnNumber = prnNumber || null;
        student.abcId = abcId || student.abcId || null;
        student.section = null;
        student.stream = null;
        student.boardRollNumber = null;
    }

    student.history.push({
        schoolId: schoolId,
        schoolName: schoolName,
        joinedYear: String(new Date().getFullYear()),
        leftYear: 'Present',
        lastClass: student.currentClass,
        lastCourse: student.course,
        lastBranch: student.branch
    });

    await student.save();
    return student;
};

/**
 * Retrieve academic marks for a student
 * @param {string} id 
 */
const getStudentMarks = async (id) => {
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    return student.marks || [];
};

/**
 * Add a mark record to a student
 * @param {string} id 
 * @param {Object} markData 
 */
const addStudentMark = async (id, markData) => {
    const { 
        schoolId, academicYear, subjectName, marksObtained, maxMarks, grade,
        theoryMarks, practicalMarks, term,
        courseCode, courseTitle, credits, gradePoint, letterGrade, semester
    } = markData;
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    student.marks.push({
        schoolId: schoolId || student.currentSchoolId,
        academicYear,
        subjectName: subjectName || courseTitle || courseCode || 'Subject',
        marksObtained: parseFloat(marksObtained) || (gradePoint ? parseFloat(gradePoint) : 0),
        maxMarks: parseFloat(maxMarks) || 100,
        grade: grade || letterGrade || null,
        theoryMarks: theoryMarks ? parseFloat(theoryMarks) : null,
        practicalMarks: practicalMarks ? parseFloat(practicalMarks) : null,
        term: term || 'Annual',
        courseCode: courseCode || null,
        courseTitle: courseTitle || subjectName || null,
        credits: credits ? parseFloat(credits) : 4,
        gradePoint: gradePoint ? parseFloat(gradePoint) : (grade === 'A+' ? 10 : (grade === 'A' ? 9 : 8)),
        letterGrade: letterGrade || grade || null,
        semester: semester || null
    });

    await student.save();
    return student;
};

/**
 * Delete a mark record from a student
 * @param {string} id 
 * @param {string} markId 
 */
const deleteStudentMark = async (id, markId) => {
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    student.marks = student.marks.filter(m => m._id.toString() !== markId);
    await student.save();
    return student;
};

const AccessRequest = require('../models/AccessRequest');

/**
 * Check if a student is eligible for enrollment in a new institution
 * @param {string} query - Student USI, Aadhaar, or Roll Number
 */
const checkEnrollmentEligibility = async (query) => {
    if (!query) {
        const error = new Error('Student identifier is required');
        error.statusCode = 400;
        throw error;
    }

    const cleanQuery = query.trim().replace(/[-\s]/g, '');
    const student = await Student.findOne({
        $or: [
            { uniqueId: cleanQuery.toUpperCase() },
            { _id: cleanQuery.toUpperCase() },
            { aadhaarNumber: cleanQuery },
            { penNumber: cleanQuery.toUpperCase() }
        ]
    });

    if (!student) {
        return {
            eligible: false,
            status: 'Not_Found',
            message: 'No student record found with this identifier in the National Depository.'
        };
    }

    if (student.status === 'Transferred') {
        const lastHist = student.history && student.history.length > 0 ? student.history[student.history.length - 1] : null;
        return {
            eligible: true,
            status: 'Transferred',
            message: 'CLEARANCE VERIFIED: Student has an official Transfer Certificate (TC) clearance and is eligible for admission.',
            student: {
                uniqueId: student.uniqueId,
                name: student.name,
                fatherName: student.fatherName,
                motherName: student.motherName,
                dob: student.dob,
                gender: student.gender,
                bloodGroup: student.bloodGroup,
                nationality: student.nationality,
                casteCategory: student.casteCategory,
                courseType: student.courseType,
                course: student.course,
                branch: student.branch,
                currentClass: student.currentClass,
                qualification: student.qualification,
                currentSchoolName: student.currentSchoolName,
                currentSchoolId: student.currentSchoolId,
                tcNumber: student.tcNumber,
                tcRemarks: student.tcRemarks,
                tcIssueDate: student.tcIssueDate,
                conduct: student.conduct,
                reasonForLeaving: student.reasonForLeaving,
                lastClass: lastHist?.lastClass || student.qualification || student.course,
                lastSchoolName: lastHist?.schoolName || student.currentSchoolName,
                marks: student.marks || [],
                history: student.history || []
            }
        };
    }

    // If student is currently active elsewhere
    return {
        eligible: false,
        status: 'Active',
        message: `LOCKED IN INSTITUTION: Student is currently active in "${student.currentSchoolName}". To prevent duplicate ghost enrollment, an official Transfer Certificate (TC) must be issued by the current school before admission.`,
        student: {
            uniqueId: student.uniqueId,
            name: student.name,
            currentSchoolName: student.currentSchoolName,
            currentSchoolId: student.currentSchoolId,
            currentClass: student.currentClass || student.course,
            status: student.status
        }
    };
};

/**
 * Submit a third-party agency background verification request
 * @param {Object} requestData 
 */
const createAgencyRequest = async (requestData) => {
    const { agencyName, agencyRegistrationId, requesterName, requesterEmail, requesterPhone, purpose, studentId } = requestData;

    if (!agencyName || !requesterName || !requesterEmail || !studentId) {
        const error = new Error('Agency name, requester details, and student USI are required');
        error.statusCode = 400;
        throw error;
    }

    const cleanStudentId = studentId.trim().toUpperCase();
    const student = await Student.findById(cleanStudentId);
    if (!student) {
        const error = new Error(`Student with USI "${cleanStudentId}" not found in national registry`);
        error.statusCode = 404;
        throw error;
    }

    const requestId = `REQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRequest = new AccessRequest({
        _id: requestId,
        requestId,
        agencyName,
        agencyRegistrationId: agencyRegistrationId || null,
        requesterName,
        requesterEmail,
        requesterPhone: requesterPhone || null,
        purpose: purpose || 'Pre-Employment Background Verification',
        studentId: student.uniqueId,
        studentName: student.name,
        targetBoard: 'Central Depository / Central Education Board',
        status: 'Pending'
    });

    await newRequest.save();
    return newRequest;
};

/**
 * Retrieve all agency verification requests for Central Board Operators
 * @param {string} statusFilter 
 */
const getAgencyRequests = async (statusFilter) => {
    const query = {};
    if (statusFilter && statusFilter !== 'All') {
        query.status = statusFilter;
    }
    return await AccessRequest.find(query).sort({ createdAt: -1 });
};

/**
 * Review an agency verification request (Approve or Reject by Central Board Operator)
 * @param {string} requestId 
 * @param {Object} reviewData 
 */
const reviewAgencyRequest = async (requestId, reviewData) => {
    const { status, reviewRemarks, operatorName } = reviewData;

    const request = await AccessRequest.findById(requestId.toUpperCase());
    if (!request) {
        const error = new Error('Verification request not found');
        error.statusCode = 404;
        throw error;
    }

    request.status = status; // 'Approved' or 'Rejected'
    request.reviewRemarks = reviewRemarks || (status === 'Approved' ? 'Academic credentials authenticated against National Depository.' : 'Verification request declined.');
    request.reviewedBy = operatorName || 'Central Board Operator';
    request.reviewedAt = new Date();

    if (status === 'Approved') {
        request.verificationToken = `CERT-AUTH-${request.studentId}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }

    await request.save();
    return request;
};

module.exports = {
    getAllStudents,
    searchStudents,
    getStudentById,
    createStudent,
    updateStudent,
    issueTransferCertificate,
    enrollStudent,
    getStudentMarks,
    addStudentMark,
    deleteStudentMark,
    checkEnrollmentEligibility,
    createAgencyRequest,
    getAgencyRequests,
    reviewAgencyRequest
};

