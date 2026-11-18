const Student = require('../models/Student');
const School = require('../models/School');
const Task = require('../models/Task');
const academicProgressionService = require('./academicProgressionService');

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
        semester: semester || null,
        classLevel: markData.classLevel || student.currentClass || null,
        isPreviousClass: markData.isPreviousClass || false
    });

    await student.save();
    return student;
};

/**
 * Rectify / Update an existing academic mark record for a student
 * @param {string} id - Student Unique ID
 * @param {string} markId - Mark document ID
 * @param {Object} markData - Updated grade/mark fields
 */
const updateStudentMark = async (id, markId, markData) => {
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    const mark = student.marks.id(markId) || student.marks.find(m => m._id.toString() === markId.toString());
    if (!mark) {
        const error = new Error('Mark record not found');
        error.statusCode = 404;
        throw error;
    }

    const {
        subjectName, marksObtained, maxMarks, grade,
        theoryMarks, practicalMarks, term, academicYear,
        courseCode, courseTitle, credits, gradePoint, letterGrade, semester,
        classLevel, isPreviousClass
    } = markData;

    if (subjectName !== undefined) mark.subjectName = subjectName;
    if (academicYear !== undefined) mark.academicYear = academicYear;
    if (term !== undefined) mark.term = term;
    if (semester !== undefined) mark.semester = semester;
    if (classLevel !== undefined) mark.classLevel = classLevel;
    if (isPreviousClass !== undefined) mark.isPreviousClass = isPreviousClass;

    // School marks
    if (theoryMarks !== undefined) mark.theoryMarks = (theoryMarks !== '' && theoryMarks !== null) ? parseFloat(theoryMarks) : null;
    if (practicalMarks !== undefined) mark.practicalMarks = (practicalMarks !== '' && practicalMarks !== null) ? parseFloat(practicalMarks) : null;
    if (marksObtained !== undefined) mark.marksObtained = parseFloat(marksObtained) || 0;
    if (maxMarks !== undefined) mark.maxMarks = parseFloat(maxMarks) || 100;
    if (grade !== undefined) mark.grade = grade;

    // Higher Ed marks
    if (courseCode !== undefined) mark.courseCode = courseCode;
    if (courseTitle !== undefined) mark.courseTitle = courseTitle;
    if (credits !== undefined) mark.credits = parseFloat(credits) || 4;
    if (gradePoint !== undefined) mark.gradePoint = parseFloat(gradePoint) || 0;
    if (letterGrade !== undefined) {
        mark.letterGrade = letterGrade;
        if (!grade) mark.grade = letterGrade;
    }

    await student.save();
    return { student, mark };
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

/**
 * Promote a student to the next academic standard or graduate Class 12 with official Transfer Certificate (TC)
 * @param {string} id - Student Unique ID
 * @param {Object} promotionData - { nextClass, academicSession, section, stream, conduct, reasonForLeaving, tcRemarks, isGraduation }
 */
const promoteStudent = async (id, promotionData = {}) => {
    const student = await Student.findById(id.toUpperCase());
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    const { 
        nextClass, 
        academicSession, 
        section, 
        stream, 
        conduct, 
        reasonForLeaving, 
        tcRemarks, 
        isGraduation,
        note
    } = promotionData;

    const currentClass = student.currentClass || student.qualification || 'Class 10';
    const isClass12 = currentClass.includes('12') || isGraduation || nextClass === 'Class 12 Passed' || nextClass === 'Passed';

    const currentYear = String(new Date().getFullYear());
    const session = academicSession || student.currentAcademicSession || `${currentYear}-${parseInt(currentYear, 10) + 1}`;

    if (isClass12) {
        // Senior Secondary (Class 12) Graduation & Statutory Transfer Certificate Generation for College/University Admission
        const generatedTcNumber = promotionData.tcNumber || `TC-${student.currentSchoolId || 'CBSE'}-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

        student.previousClass = 'Class 12';
        student.currentClass = 'Class 12 Passed (Alumni)';
        student.qualification = 'Class 12 Passed';
        student.course = 'Higher Secondary Examination (Class 12 Passed)';
        student.courseType = 'Senior Secondary';
        student.status = 'Transferred'; // Discharged with TC clearance for College / University Degree Admission
        student.conduct = conduct || 'Excellent';
        student.reasonForLeaving = reasonForLeaving || 'Higher Secondary Concluded / Eligible for College & University Degree Admission';
        student.tcNumber = generatedTcNumber;
        student.tcIssueDate = new Date();
        student.dateOfLeaving = new Date();
        student.tcRemarks = tcRemarks || 'Senior Secondary (Class 12) Examination certified passed. Statutory Transfer Certificate (TC) clearance issued for College & University Degree Admission.';

        // Tag all marks of Class 12 as concluded
        if (student.marks && student.marks.length > 0) {
            student.marks.forEach(m => {
                m.isPreviousClass = true;
                if (!m.classLevel) m.classLevel = 'Class 12';
            });
        }

        // Close active history timeline entry
        const activeHistory = student.history.find(h => h.leftYear === 'Present');
        if (activeHistory) {
            activeHistory.leftYear = currentYear;
            activeHistory.lastClass = 'Class 12';
            activeHistory.lastCourse = 'Higher Secondary Examination (Class 12 Passed)';
        }

        if (!student.promotionHistory) student.promotionHistory = [];
        student.promotionHistory.push({
            fromClass: 'Class 12',
            toClass: 'Class 12 Passed (Alumni)',
            academicSession: session,
            promotedAt: new Date(),
            note: note || tcRemarks || 'Graduated Class 12 Senior Secondary. Discharge Transfer Certificate (TC) generated for College/University admission.'
        });
    } else {
        // Standard K-12 Promotion (Class 1 to 11)
        const targetClass = nextClass || 'Class 11';

        student.previousClass = currentClass;
        student.currentClass = targetClass;
        student.qualification = targetClass;
        student.course = `Standard Schooling (${targetClass})`;
        if (['Class 11', 'Class 12'].includes(targetClass)) {
            student.courseType = 'Senior Secondary';
        }
        if (session) {
            student.currentAcademicSession = session;
        }
        if (section) {
            student.section = section;
        }
        if (stream) {
            student.stream = stream;
            student.branch = stream;
        }

        student.lastPromotionDate = new Date();

        // Mark previous marks as concluded previous class
        if (student.marks && student.marks.length > 0) {
            student.marks.forEach(m => {
                m.isPreviousClass = true;
                if (!m.classLevel) {
                    m.classLevel = currentClass;
                }
            });
        }

        // Update active history entry
        const activeHistory = student.history.find(h => h.leftYear === 'Present');
        if (activeHistory) {
            activeHistory.lastClass = targetClass;
            activeHistory.lastCourse = student.course;
            if (student.branch) activeHistory.lastBranch = student.branch;
        }

        if (!student.promotionHistory) student.promotionHistory = [];
        student.promotionHistory.push({
            fromClass: currentClass,
            toClass: targetClass,
            academicSession: session,
            promotedAt: new Date(),
            note: note || `Operator certified annual academic promotion from ${currentClass} to ${targetClass}.`
        });
    }

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

    if (student.status === 'Transferred' || (student.status === 'Passed' && !!student.tcNumber)) {
        const lastHist = student.history && student.history.length > 0 ? student.history[student.history.length - 1] : null;
        return {
            eligible: true,
            status: student.status,
            message: 'CLEARANCE VERIFIED: Student has an official Transfer Certificate (TC) clearance and is eligible for admission.',
            student: {
                uniqueId: student.uniqueId,
                status: student.status,
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

/**
 * Update BEO Dropout Investigation status or mark case resolved
 * @param {string} studentId
 * @param {Object} investigationData
 */
const updateDropoutInvestigation = async (studentId, investigationData) => {
    const { status, assignedBEO, notes, resolvedBy } = investigationData;
    const student = await Student.findById(studentId.toUpperCase());
    if (!student) {
        const error = new Error('Student record not found');
        error.statusCode = 404;
        throw error;
    }

    student.dropoutInvestigationStatus = status || 'Assigned_BEO';
    student.dropoutInvestigationNotes = notes || student.dropoutInvestigationNotes;

    if (status === 'Assigned_BEO') {
        student.assignedBEO = assignedBEO || 'BEO Field Unit';
        
        // Dispatch official state Task for District & Block Education Office
        const year = new Date().getFullYear();
        const count = await Task.countDocuments();
        const taskId = `TSK-${year}-${String(count + 1).padStart(4, '0')}`;
        
        const newTask = new Task({
            taskId,
            title: `BEO Field Visit: Investigate Floating TC for ${student.name} (${student.uniqueId})`,
            description: `State Retention Directive: Conduct field inspection for candidate ${student.name} (S/O ${student.fatherName || 'Guardian'}), residing at ${student.address || 'recorded residence'}. Student has been floating on TC #${student.tcNumber} from ${student.currentSchoolName || 'releasing school'} without verified enrollment. Directive notes: ${notes || 'Verify local school admission or family migration.'}`,
            category: 'DROPOUT_INVESTIGATION',
            tier: 'state',
            assignedTo: assignedBEO || 'BEO-FIELD-SQUAD',
            assignedBy: resolvedBy || 'State Education Directorate',
            priority: 'High',
            status: 'Pending',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            relatedEntityId: student.uniqueId,
            relatedEntityType: 'Student',
            activityLog: [{
                action: 'BEO Directive Dispatched',
                performedBy: resolvedBy || 'State Education Directorate',
                note: `Field assignment allocated to ${assignedBEO || 'BEO Field Squad'}`
            }]
        });
        await newTask.save().catch(err => console.warn('Could not persist task:', err.message));
    } else if (status === 'Resolved') {
        student.dropoutInvestigationStatus = 'Resolved';
        student.dropoutResolvedAt = new Date();
        student.dropoutResolvedBy = resolvedBy || 'State Directorate Officer';
        
        // Mark associated task as completed if any exists
        await Task.updateMany(
            { relatedEntityId: student.uniqueId, category: 'DROPOUT_INVESTIGATION' },
            { 
                status: 'Completed',
                $push: {
                    activityLog: {
                        action: 'Investigation Concluded',
                        performedBy: resolvedBy || 'State Directorate Officer',
                        note: notes || 'Case marked resolved. Candidate verified/cleared from dropout radar.'
                    }
                }
            }
        ).catch(() => {});
    }

    await student.save();
    return student;
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
    updateStudentMark,
    deleteStudentMark,
    promoteStudent,
    checkEnrollmentEligibility,
    createAgencyRequest,
    getAgencyRequests,
    reviewAgencyRequest,
    updateDropoutInvestigation
};

