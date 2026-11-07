const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    schoolId: { 
        type: String, 
        required: true 
    },
    schoolName: { 
        type: String, 
        required: true 
    },
    joinedYear: { 
        type: String, 
        required: true 
    },
    leftYear: { 
        type: String, 
        default: 'Present' 
    },
    lastClass: { 
        type: String, 
        default: null 
    },
    lastCourse: { 
        type: String, 
        default: null 
    },
    lastBranch: { 
        type: String, 
        default: null 
    }
});

const markSchema = new mongoose.Schema({
    schoolId: { 
        type: String, 
        default: null 
    },
    academicYear: { 
        type: String, 
        required: true 
    },
    subjectName: { 
        type: String, 
        required: true 
    },
    marksObtained: { 
        type: Number, 
        required: true 
    },
    maxMarks: { 
        type: Number, 
        default: 100 
    },
    grade: { 
        type: String, 
        default: null 
    },
    // School-specific mark fields
    theoryMarks: {
        type: Number,
        default: null
    },
    practicalMarks: {
        type: Number,
        default: null
    },
    term: {
        type: String,
        default: 'Annual'
    },
    // College/University-specific mark fields
    courseCode: {
        type: String,
        default: null
    },
    courseTitle: {
        type: String,
        default: null
    },
    credits: {
        type: Number,
        default: 4
    },
    gradePoint: {
        type: Number,
        default: 10
    },
    letterGrade: {
        type: String,
        default: null
    },
    semester: {
        type: String,
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const studentSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true, 
        uppercase: true, 
        trim: true 
    }, // Unique ID like 'RAHUL052010'
    uniqueId: { 
        type: String, 
        required: true, 
        uppercase: true, 
        trim: true 
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    fatherName: { 
        type: String, 
        default: null 
    },
    motherName: { 
        type: String, 
        default: null 
    },
    dob: { 
        type: Date, 
        default: null 
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other'], 
        default: 'Male' 
    },
    address: { 
        type: String, 
        default: null 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Transferred', 'Passed'], 
        default: 'Active' 
    },

    // Tier / Academic Level: 'school', 'college', 'university'
    academicLevel: {
        type: String,
        enum: ['school', 'college', 'university'],
        default: 'school'
    },

    // Institutional Enrollment
    currentSchoolId: { 
        type: String, 
        ref: 'School', 
        default: null 
    },
    currentSchoolName: { 
        type: String, 
        default: null 
    },

    // School Specific Fields (K-12)
    currentClass: { 
        type: String, 
        default: null 
    }, // e.g. 'Class 10', 'Class 12'
    section: {
        type: String,
        default: 'A'
    },
    stream: {
        type: String,
        default: 'General'
    }, // Science (PCM), Science (PCB), Commerce, Arts
    boardRollNumber: {
        type: String,
        default: null
    },
    attendancePercentage: {
        type: Number,
        default: 85
    },

    // College / University Specific Fields (Higher Ed)
    degree: {
        type: String,
        default: null
    }, // B.Tech, B.Sc, B.Com, BA, MBA, MBBS, Ph.D
    department: {
        type: String,
        default: null
    }, // Computer Science, Electrical, Economics, etc.
    semester: {
        type: String,
        default: null
    }, // 'Semester 1', 'Semester 2', ... 'Semester 8'
    prnNumber: {
        type: String,
        default: null
    }, // Permanent Registration Number (PRN)
    cgpa: {
        type: Number,
        default: null
    },
    sgpa: {
        type: Number,
        default: null
    },
    creditsEarned: {
        type: Number,
        default: 0
    },
    totalCreditsRequired: {
        type: Number,
        default: 160
    },

    // Common Academic Program Fields
    qualification: { 
        type: String, 
        default: null 
    },
    courseType: { 
        type: String, 
        default: 'High School (9-10)' 
    },
    course: { 
        type: String, 
        default: null 
    },
    branch: { 
        type: String, 
        default: null 
    },
    rollNumber: { 
        type: String, 
        default: null 
    },
    admissionYear: { 
        type: Number, 
        default: null 
    },
    graduationYear: { 
        type: Number, 
        default: null 
    },
    email: { 
        type: String, 
        default: null 
    },
    phoneNumber: { 
        type: String, 
        default: null 
    },

    // Demographics & Statutory Attributes
    bloodGroup: { type: String, default: null },
    nationality: { type: String, default: 'Indian' },
    casteCategory: { type: String, default: 'General' },
    religion: { type: String, default: 'Hinduism' },
    guardianIncomeCategory: { type: String, default: 'APL' },
    motherTongue: { type: String, default: 'Hindi' },
    isDifferentlyAbled: { type: String, default: 'No' },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    identificationMark: { type: String, default: null },

    // National Sovereign Identifiers
    aadhaarNumber: { type: String, default: null },
    abcId: { type: String, default: null }, // Academic Bank of Credits (12-digit)
    penNumber: { type: String, default: null }, // Permanent Education Number
    tcNumber: { type: String, default: null },
    tcIssueDate: { type: Date, default: null },
    tcRemarks: { type: String, default: null },
    mcNumber: { type: String, default: null },
    dateOfLeaving: { type: Date, default: null },

    // Conduct & Leaving Clearance
    conduct: { type: String, default: 'Good' },
    reasonForLeaving: { type: String, default: null },
    academicAchievements: { type: String, default: null },
    extracurricularActivities: { type: String, default: null },

    // Embedded Timeline & Marksheets
    history: [historySchema],
    marks: [markSchema]
}, { 
    timestamps: true 
});

// Virtual ID getter for standardized JSON responses
studentSchema.virtual('id').get(function() {
    return this._id;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
