const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const School = require('./models/School');
const Student = require('./models/Student');
const User = require('./models/User');
const Operator = require('./models/Operator');
const AccessRequest = require('./models/AccessRequest');
const Task = require('./models/Task');
const Report = require('./models/Report');

const makeSha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

async function seedMongoDB() {
    try {
        const primaryUri = process.env.MONGODB_URI;
        const fallbackUri = 'mongodb://127.0.0.1:27017/eduvera_db';
        let connected = false;

        if (primaryUri) {
            try {
                console.log(`Connecting to primary MongoDB Atlas at ${primaryUri.substring(0, 35)}...`);
                await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 10000 });
                connected = true;
                console.log("Connected to primary MongoDB Atlas successfully for Seeding!");
            } catch (err) {
                console.warn(`Primary connection failed (${err.message}). Trying local MongoDB...`);
                try { await mongoose.disconnect(); } catch (_) {}
            }
        }

        if (!connected) {
            console.log(`Connecting to local MongoDB at ${fallbackUri}...`);
            await mongoose.connect(fallbackUri);
            console.log("Connected to local MongoDB successfully for Seeding!");
        }

        // 1. Clear Existing Collections
        await School.deleteMany({});
        await Student.deleteMany({});
        await User.deleteMany({});
        await Operator.deleteMany({});
        await AccessRequest.deleteMany({});
        await Task.deleteMany({});
        await Report.deleteMany({});
        console.log("Cleaned all collections (School, Student, User, Operator, AccessRequest, Task, Report).");

        // 2. Insert Official Statutory Institutions
        const schools = [
            {
                _id: 'SCH-CBSE-01',
                name: 'Delhi Public School (DPS Noida)',
                state: 'Uttar Pradesh',
                region: 'NCR Region - Noida / Gautam Buddh Nagar, UP',
                institutionType: 'school',
                boardCode: 'CBSE',
                establishedYear: 1982,
                affiliation: 'Central Board of Secondary Education (CBSE) #2130018',
                address: 'Sector 30, Noida, Gautam Buddh Nagar, UP 201301',
                email: 'principal@dpsnoida.co.in',
                phone: '+91 120 450 9100',
                principalName: 'Mrs. Kamini Bhasin',
                website: 'https://dpsnoida.co.in'
            },
            {
                _id: 'SCH-CBSE-02',
                name: 'Kendriya Vidyalaya Sangathan (KV Delhi Cantt)',
                state: 'Delhi',
                region: 'North Region - New Delhi',
                institutionType: 'school',
                boardCode: 'CBSE',
                establishedYear: 1968,
                affiliation: 'Central Board of Secondary Education (CBSE) #2700012',
                address: 'Delhi Cantonment, New Delhi 110010',
                email: 'kvdelhicantt@kvs.gov.in',
                phone: '+91 11 2569 2211',
                principalName: 'Shri R. K. Meena',
                website: 'https://delhicantt.kvs.ac.in'
            },
            {
                _id: 'SCH-UP-01',
                name: 'Government Inter College (GIC Lucknow)',
                state: 'Uttar Pradesh',
                region: 'Uttar Pradesh Central - Lucknow',
                institutionType: 'school',
                boardCode: 'UP-BOARD',
                establishedYear: 1921,
                affiliation: 'UP Board (UPMSP) Affiliated #UP0102',
                address: 'Nishatganj, Lucknow, Uttar Pradesh 226007',
                email: 'gic.lucknow@upmsp.edu.in',
                phone: '+91 522 233 4455',
                principalName: 'Dr. Suresh Chandra Shukla',
                website: 'https://upmsp.edu.in/giclko'
            },
            {
                _id: 'SCH-UP-02',
                name: 'Varanasi Model Senior Secondary School',
                state: 'Uttar Pradesh',
                region: 'Uttar Pradesh East - Varanasi',
                institutionType: 'school',
                boardCode: 'UP-BOARD',
                establishedYear: 1975,
                affiliation: 'UP Board (UPMSP) Affiliated #UP1409',
                address: 'Cantonment, Varanasi, Uttar Pradesh 221002',
                email: 'contact@varanasimodel.edu.in',
                phone: '+91 542 250 8891',
                principalName: 'Dr. R. K. Pandey',
                website: 'https://varanasimodel.edu.in'
            },
            // Degree Colleges
            {
                _id: 'CLG-DU-01',
                name: "St. Stephen's College (University of Delhi)",
                state: 'Delhi',
                region: 'North Campus - New Delhi',
                institutionType: 'college',
                boardCode: 'UGC',
                establishedYear: 1881,
                affiliation: 'UGC Affiliated Undergraduate College',
                address: 'University Enclave, North Campus, Delhi 110007',
                email: 'admissions@ststephens.edu',
                phone: '+91 11 2766 7200',
                principalName: 'Prof. John Varghese',
                website: 'https://ststephens.edu'
            },
            {
                _id: 'CLG-UP-01',
                name: 'National Post Graduate College (Autonomous Lucknow)',
                state: 'Uttar Pradesh',
                region: 'Uttar Pradesh Central - Lucknow',
                institutionType: 'college',
                boardCode: 'UGC',
                establishedYear: 1974,
                affiliation: 'University of Lucknow Affiliated / UGC AISHE-C-27418',
                address: '2 Rana Pratap Marg, Hazratganj, Lucknow, UP 226001',
                email: 'support@npgc.in',
                phone: '+91 522 261 8312',
                principalName: 'Prof. Devendra Kumar',
                website: 'https://npgc.in'
            },
            // Apex Higher Education / Universities
            {
                _id: 'IIT-DELHI',
                name: 'Indian Institute of Technology Delhi (IIT Delhi)',
                state: 'Delhi',
                region: 'National Capital Region - New Delhi',
                institutionType: 'university',
                boardCode: 'UGC',
                establishedYear: 1961,
                affiliation: 'Institute of National Importance (INI) / Apex Technical Council',
                address: 'Hauz Khas, New Delhi 110016',
                email: 'registrar@admin.iitd.ac.in',
                phone: '+91 11 2659 1000',
                principalName: 'Prof. Rangan Banerjee (Director)',
                website: 'https://home.iitd.ac.in'
            },
            {
                _id: 'UNIV-DU',
                name: 'University of Delhi (Delhi University)',
                state: 'Delhi',
                region: 'North Campus - New Delhi',
                institutionType: 'university',
                boardCode: 'UGC',
                establishedYear: 1922,
                affiliation: 'UGC Recognized Central University',
                address: 'Benito Juarez Road, South Campus, New Delhi 110021',
                email: 'admissions@du.ac.in',
                phone: '+91 11 2700 6900',
                principalName: 'Prof. Yogesh Singh (Vice Chancellor)',
                website: 'https://du.ac.in'
            },
            {
                _id: 'UNIV-UP-01',
                name: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU Lucknow)',
                state: 'Uttar Pradesh',
                region: 'Uttar Pradesh Central - Lucknow',
                institutionType: 'university',
                boardCode: 'AICTE',
                establishedYear: 2000,
                affiliation: 'State Technical University / UGC & AICTE Recognized AISHE-U-0504',
                address: 'Sec-11, Jankipuram Vistar, Lucknow, UP 226031',
                email: 'registrar@aktu.ac.in',
                phone: '+91 522 277 1079',
                principalName: 'Prof. J. P. Pandey (Vice Chancellor)',
                website: 'https://aktu.ac.in'
            },
            {
                _id: 'UNIV-BHU',
                name: 'Banaras Hindu University (BHU Varanasi)',
                state: 'Uttar Pradesh',
                region: 'Uttar Pradesh East - Varanasi',
                institutionType: 'university',
                boardCode: 'UGC',
                establishedYear: 1916,
                affiliation: 'Central University / UGC & AICTE Recognized AISHE-U-0500',
                address: 'Ajagara, Varanasi, Uttar Pradesh 221005',
                email: 'registrar@bhu.ac.in',
                phone: '+91 542 236 8558',
                principalName: 'Prof. Sudhir K. Jain (Vice Chancellor)',
                website: 'https://bhu.ac.in'
            },
            // Legacy / Sandbox Aliases
            {
                _id: 'SCH001',
                name: 'ABC Public School (CBSE)',
                state: 'Delhi',
                region: 'North Region - New Delhi',
                institutionType: 'school',
                boardCode: 'CBSE',
                establishedYear: 1998,
                affiliation: 'CBSE Affiliated #2130045',
                address: 'Rohini Sector 14, New Delhi 110085',
                email: 'contact@abcpublic.edu.in',
                phone: '+91 11 2786 4401',
                principalName: 'Dr. Alok Verma',
                website: 'https://abcpublic.edu.in'
            },
            {
                _id: 'SCH002',
                name: 'Modern Senior Secondary School (CBSE)',
                state: 'West Bengal',
                region: 'East Region - Kolkata',
                institutionType: 'school',
                boardCode: 'CBSE',
                establishedYear: 2004,
                affiliation: 'CBSE Affiliated #1930211',
                address: 'Park Street, Kolkata 700016',
                email: 'office@modernsec.edu.in',
                phone: '+91 33 2229 8812',
                principalName: 'Mrs. S. Sengupta',
                website: 'https://modernsec.edu.in'
            },
            {
                _id: 'SCH003',
                name: "St. Xavier's Model High School (ICSE)",
                state: 'Maharashtra',
                region: 'West Region - Mumbai',
                institutionType: 'school',
                boardCode: 'CISCE',
                establishedYear: 1985,
                affiliation: 'ICSE Affiliated #MH042',
                address: 'Fort Campus, South Mumbai 400001',
                email: 'admin@stxaviersmumbai.org',
                phone: '+91 22 2262 0661',
                principalName: "Fr. Thomas D'Souza",
                website: 'https://stxaviersmumbai.org'
            },
            {
                _id: 'UNIV001',
                name: 'Delhi Technological University (DTU)',
                state: 'Delhi',
                region: 'Central Region - New Delhi',
                institutionType: 'university',
                boardCode: 'UGC',
                establishedYear: 1941,
                affiliation: 'AICTE / UGC Recognized',
                address: 'Shahbad Daulatpur, Bawana Road, Delhi 110042',
                email: 'admissions@dtu.ac.in',
                phone: '+91 11 2787 1018',
                principalName: 'Prof. Prateek Sharma (Vice Chancellor)',
                website: 'https://dtu.ac.in'
            }
        ];
        await School.insertMany(schools);
        console.log(`✅ Seeded ${schools.length} institutions (CBSE, UP Board, IIT Delhi, DU, DTU, St. Stephen's)`);

        // 3. Insert Master Administrative Users
        const users = [
            { username: 'ADMIN', password: 'admin123', role: 'admin', referenceId: 'ADMIN' },
            { username: 'MOE', password: 'admin123', role: 'admin', referenceId: 'MOE' },
            { username: 'UP-MOE', password: 'admin123', role: 'admin', referenceId: 'UP-MOE' },
            { username: 'STATE-DL', password: 'admin123', role: 'admin', referenceId: 'STATE-DL' },
            { username: 'CBSE', password: 'admin123', role: 'admin', referenceId: 'CBSE' },
            { username: 'UP-BOARD', password: 'admin123', role: 'admin', referenceId: 'UP-BOARD' },
            { username: 'SCH-CBSE-01', password: 'admin123', role: 'school', referenceId: 'SCH-CBSE-01' },
            { username: 'SCH-CBSE-02', password: 'admin123', role: 'school', referenceId: 'SCH-CBSE-02' },
            { username: 'SCH-UP-01', password: 'admin123', role: 'school', referenceId: 'SCH-UP-01' },
            { username: 'SCH-UP-02', password: 'admin123', role: 'school', referenceId: 'SCH-UP-02' },
            { username: 'CLG-DU-01', password: 'admin123', role: 'college', referenceId: 'CLG-DU-01' },
            { username: 'CLG-UP-01', password: 'admin123', role: 'college', referenceId: 'CLG-UP-01' },
            { username: 'IIT-DELHI', password: 'admin123', role: 'university', referenceId: 'IIT-DELHI' },
            { username: 'UNIV-DU', password: 'admin123', role: 'university', referenceId: 'UNIV-DU' },
            { username: 'UNIV-UP-01', password: 'admin123', role: 'university', referenceId: 'UNIV-UP-01' },
            { username: 'UNIV-BHU', password: 'admin123', role: 'university', referenceId: 'UNIV-BHU' },
            // Legacy / Compat
            { username: 'SCH001', password: 'admin123', role: 'school', referenceId: 'SCH001' },
            { username: 'SCH002', password: 'admin123', role: 'school', referenceId: 'SCH002' },
            { username: 'SCH003', password: 'admin123', role: 'school', referenceId: 'SCH003' },
            { username: 'UNIV001', password: 'admin123', role: 'university', referenceId: 'UNIV001' }
        ];
        await User.insertMany(users);
        console.log(`✅ Seeded ${users.length} Master Admin accounts`);

        // 4. Insert Sub-Desk Operators across all tiers
        const operators = [
            {
                operatorId: 'OP-ADMIN-01',
                institutionId: 'ADMIN',
                tier: 'central',
                name: 'EduVera System Lead',
                deskRole: 'Top System Manager & Core Platform Lead',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-MOE-01',
                institutionId: 'MOE',
                tier: 'central',
                name: 'Dr. K. S. Murthy',
                deskRole: 'National Education Census & Migration Lead',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-UP-MOE',
                institutionId: 'UP-MOE',
                tier: 'state',
                name: 'Shri Virendra Tripathi',
                deskRole: 'Uttar Pradesh State Education Directorate Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-CBSE-01',
                institutionId: 'CBSE',
                tier: 'board',
                name: 'Meenakshi Sundaram',
                deskRole: 'CBSE National Verification & Certification Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-UPBOARD-01',
                institutionId: 'UP-BOARD',
                tier: 'board',
                name: 'Dinesh Chandra Rawat',
                deskRole: 'UPMSP State Registrar & Transfer Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-DPS-01',
                institutionId: 'SCH-CBSE-01',
                tier: 'school',
                name: 'Pooja Anand',
                deskRole: 'Senior Admissions & Migration Officer',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-KV-DELHI',
                institutionId: 'SCH-CBSE-02',
                tier: 'school',
                name: 'Kavita Chhabra',
                deskRole: 'Enrollment & Academic Records Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-GIC-LKO',
                institutionId: 'SCH-UP-01',
                tier: 'school',
                name: 'Manoj Kumar Gupta',
                deskRole: 'State Secondary Records & TC Clearance Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-VMSS-01',
                institutionId: 'SCH-UP-02',
                tier: 'school',
                name: 'Santosh Yadav',
                deskRole: 'Secondary Student Roster Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            // Degree Colleges
            {
                operatorId: 'OP-STEPHENS-01',
                institutionId: 'CLG-DU-01',
                tier: 'college',
                name: 'Dr. Renish Geevarghese Abraham',
                deskRole: "St. Stephen's College Admissions Registrar",
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            // Higher Education / Universities
            {
                operatorId: 'OP-IITD-01',
                institutionId: 'IIT-DELHI',
                tier: 'university',
                name: 'Dr. Neelam Srivastava',
                deskRole: 'IIT Delhi Academic Dean & Degree Verification Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-DU-01',
                institutionId: 'UNIV-DU',
                tier: 'university',
                name: 'Prof. Harsh Vardhan',
                deskRole: 'Delhi University Undergraduate Registrar',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            // Legacy / Sandbox Operators
            {
                operatorId: 'OP-SCH002',
                institutionId: 'SCH002',
                tier: 'school',
                name: 'Ravi Verma',
                deskRole: 'Senior Admissions Registrar',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-SCH003',
                institutionId: 'SCH003',
                tier: 'school',
                name: 'Sister Theresa',
                deskRole: 'Enrollment & TC Clearance Desk',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            },
            {
                operatorId: 'OP-UNIV001',
                institutionId: 'UNIV001',
                tier: 'university',
                name: 'Prof. Ramesh Chandra',
                deskRole: 'University Registrar',
                password: 'admin123',
                status: 'Active',
                createdBy: 'Master Admin'
            }
        ];
        await Operator.insertMany(operators);
        console.log(`✅ Seeded ${operators.length} sub-desk operator accounts`);

        // 5. Insert Detailed Students with Rich Academic Records
        const students = [
            // Student 1: Class 5 (Primary Education - School)
            {
                _id: 'AARAV052015',
                uniqueId: 'AARAV052015',
                name: 'Aarav Verma',
                fatherName: 'Prakash Verma',
                motherName: 'Meera Verma',
                dob: new Date('2015-08-20'),
                gender: 'Male',
                bloodGroup: 'B+',
                nationality: 'Indian',
                address: 'House 14, Hazratganj, Lucknow, Uttar Pradesh 226001',
                phoneNumber: '+91 98390 12345',
                aadhaarNumber: '111122223333',
                penNumber: 'PEN-UP-2015-5541',
                academicLevel: 'school',
                section: 'A',
                stream: 'General',
                boardRollNumber: 'UP-GIC-2024-501',
                attendancePercentage: 94.5,
                courseType: 'Primary Education',
                course: 'Primary School (Class 1-5)',
                currentClass: 'Class 5',
                qualification: 'Class 5',
                status: 'Active',
                admissionYear: 2020,
                graduationYear: 2026,
                currentSchoolId: 'SCH-UP-01',
                currentSchoolName: 'Government Inter College (GIC Lucknow)',
                history: [
                    {
                        schoolId: 'SCH-UP-01',
                        schoolName: 'Government Inter College (GIC Lucknow)',
                        joinedYear: '2020',
                        leftYear: 'Present',
                        lastClass: 'Class 5',
                        lastCourse: 'Primary School'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Mathematics', theoryMarks: 74, practicalMarks: 20, marksObtained: 94, maxMarks: 100, grade: 'A+', term: 'Annual' },
                    { academicYear: '2024-2025', subjectName: 'Environmental Studies', theoryMarks: 68, practicalMarks: 20, marksObtained: 88, maxMarks: 100, grade: 'A', term: 'Annual' },
                    { academicYear: '2024-2025', subjectName: 'Hindi Language', theoryMarks: 70, practicalMarks: 20, marksObtained: 90, maxMarks: 100, grade: 'A+', term: 'Annual' },
                    { academicYear: '2024-2025', subjectName: 'English Primer', theoryMarks: 66, practicalMarks: 20, marksObtained: 86, maxMarks: 100, grade: 'A', term: 'Annual' }
                ]
            },

            // Student 2: Class 6 (Middle School)
            {
                _id: 'ANANYA062014',
                uniqueId: 'ANANYA062014',
                name: 'Ananya Patel',
                fatherName: 'Sunil Patel',
                motherName: 'Ritu Patel',
                dob: new Date('2014-03-12'),
                gender: 'Female',
                bloodGroup: 'O+',
                nationality: 'Indian',
                address: 'A-204, Stellar Park, Sector 62, Noida 201309',
                phoneNumber: '+91 98110 56789',
                aadhaarNumber: '222233334444',
                penNumber: 'PEN-CBSE-2014-8812',
                academicLevel: 'school',
                section: 'B',
                stream: 'General',
                boardRollNumber: 'CBSE-DPS-2024-602',
                attendancePercentage: 96.0,
                courseType: 'Middle School',
                course: 'Middle School (Class 6-8)',
                currentClass: 'Class 6',
                qualification: 'Class 6',
                status: 'Active',
                admissionYear: 2019,
                graduationYear: 2027,
                currentSchoolId: 'SCH-CBSE-01',
                currentSchoolName: 'Delhi Public School (DPS Noida)',
                history: [
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2019',
                        leftYear: 'Present',
                        lastClass: 'Class 6',
                        lastCourse: 'Middle School'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Mathematics', theoryMarks: 76, practicalMarks: 20, marksObtained: 96, maxMarks: 100, grade: 'A1', term: 'Term 1' },
                    { academicYear: '2024-2025', subjectName: 'General Science', theoryMarks: 72, practicalMarks: 20, marksObtained: 92, maxMarks: 100, grade: 'A1', term: 'Term 1' },
                    { academicYear: '2024-2025', subjectName: 'Social Science', theoryMarks: 70, practicalMarks: 20, marksObtained: 90, maxMarks: 100, grade: 'A1', term: 'Term 1' },
                    { academicYear: '2024-2025', subjectName: 'English Literature', theoryMarks: 75, practicalMarks: 20, marksObtained: 95, maxMarks: 100, grade: 'A1', term: 'Term 1' }
                ]
            },

            // Student 3: Class 7
            {
                _id: 'ROHAN072013',
                uniqueId: 'ROHAN072013',
                name: 'Rohan Gupta',
                fatherName: 'Manoj Gupta',
                motherName: 'Suman Gupta',
                dob: new Date('2013-11-05'),
                gender: 'Male',
                bloodGroup: 'A+',
                nationality: 'Indian',
                address: 'C-45, Defence Colony, New Delhi 110024',
                phoneNumber: '+91 98188 34567',
                aadhaarNumber: '333344445555',
                penNumber: 'PEN-CBSE-2013-1092',
                academicLevel: 'school',
                section: 'C',
                stream: 'General',
                boardRollNumber: 'KV-DEL-2024-703',
                attendancePercentage: 91.0,
                courseType: 'Middle School',
                course: 'Middle School (Class 6-8)',
                currentClass: 'Class 7',
                qualification: 'Class 7',
                status: 'Active',
                admissionYear: 2018,
                graduationYear: 2026,
                currentSchoolId: 'SCH-CBSE-02',
                currentSchoolName: 'Kendriya Vidyalaya Sangathan (KV Delhi Cantt)',
                history: [
                    {
                        schoolId: 'SCH-CBSE-02',
                        schoolName: 'Kendriya Vidyalaya Sangathan (KV Delhi Cantt)',
                        joinedYear: '2018',
                        leftYear: 'Present',
                        lastClass: 'Class 7',
                        lastCourse: 'Middle School'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Mathematics', theoryMarks: 68, practicalMarks: 20, marksObtained: 88, maxMarks: 100, grade: 'A2' },
                    { academicYear: '2024-2025', subjectName: 'Science', theoryMarks: 65, practicalMarks: 20, marksObtained: 85, maxMarks: 100, grade: 'A2' },
                    { academicYear: '2024-2025', subjectName: 'Social Studies', theoryMarks: 67, practicalMarks: 20, marksObtained: 87, maxMarks: 100, grade: 'A2' },
                    { academicYear: '2024-2025', subjectName: 'Sanskrit', theoryMarks: 72, practicalMarks: 20, marksObtained: 92, maxMarks: 100, grade: 'A1' }
                ]
            },

            // Student 4: Class 9
            {
                _id: 'SNEHA092011',
                uniqueId: 'SNEHA092011',
                name: 'Sneha Sen',
                fatherName: 'Dr. Debabrata Sen',
                motherName: 'Mousumi Sen',
                dob: new Date('2011-07-19'),
                gender: 'Female',
                bloodGroup: 'B-',
                nationality: 'Indian',
                address: 'B-12, Godowlia Road, Varanasi, Uttar Pradesh 221001',
                phoneNumber: '+91 94150 67890',
                aadhaarNumber: '444455556666',
                penNumber: 'PEN-UP-2011-3390',
                academicLevel: 'school',
                section: 'A',
                stream: 'General',
                boardRollNumber: 'UP-VMSS-2024-904',
                attendancePercentage: 93.0,
                courseType: 'Secondary School',
                course: 'High School Foundation (Class 9-10)',
                currentClass: 'Class 9',
                qualification: 'Class 9',
                status: 'Active',
                admissionYear: 2017,
                graduationYear: 2026,
                currentSchoolId: 'SCH-UP-02',
                currentSchoolName: 'Varanasi Model Senior Secondary School',
                history: [
                    {
                        schoolId: 'SCH-UP-02',
                        schoolName: 'Varanasi Model Senior Secondary School',
                        joinedYear: '2017',
                        leftYear: 'Present',
                        lastClass: 'Class 9',
                        lastCourse: 'Secondary Education'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Science & Technology', theoryMarks: 71, practicalMarks: 20, marksObtained: 91, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Advanced Mathematics', theoryMarks: 73, practicalMarks: 20, marksObtained: 93, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Hindi Sahitya', theoryMarks: 69, practicalMarks: 20, marksObtained: 89, maxMarks: 100, grade: 'A2' },
                    { academicYear: '2024-2025', subjectName: 'Social Sciences', theoryMarks: 67, practicalMarks: 20, marksObtained: 87, maxMarks: 100, grade: 'A2' }
                ]
            },

            // Student 5: Class 10 (Active Secondary Board Candidate with Verified Marksheet)
            {
                _id: 'RAHUL052010',
                uniqueId: 'RAHUL052010',
                name: 'Rahul Sharma',
                fatherName: 'Rajesh Sharma',
                motherName: 'Sunita Sharma',
                dob: new Date('2010-05-14'),
                gender: 'Male',
                bloodGroup: 'O+',
                nationality: 'Indian',
                address: 'Flat 402, Greenfield Heights, Sector 50, Noida 201301',
                phoneNumber: '+91 98765 43210',
                aadhaarNumber: '548921047890',
                penNumber: 'PEN-CBSE-2010-9901',
                academicLevel: 'school',
                section: 'A',
                stream: 'General Secondary',
                boardRollNumber: 'CBSE-10-88192',
                attendancePercentage: 95.8,
                courseType: 'Secondary School',
                course: 'Secondary School Examination (Class 10)',
                currentClass: 'Class 10',
                qualification: 'Class 10',
                status: 'Active',
                admissionYear: 2016,
                graduationYear: 2026,
                currentSchoolId: 'SCH-CBSE-01',
                currentSchoolName: 'Delhi Public School (DPS Noida)',
                history: [
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2016',
                        leftYear: 'Present',
                        lastClass: 'Class 10',
                        lastCourse: 'Secondary Education'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Mathematics Standard', theoryMarks: 75, practicalMarks: 20, marksObtained: 95, maxMarks: 100, grade: 'A1', term: 'Pre-Board' },
                    { academicYear: '2024-2025', subjectName: 'Science Theory & Practical', theoryMarks: 71, practicalMarks: 20, marksObtained: 91, maxMarks: 100, grade: 'A1', term: 'Pre-Board' },
                    { academicYear: '2024-2025', subjectName: 'English Language & Lit', theoryMarks: 68, practicalMarks: 20, marksObtained: 88, maxMarks: 100, grade: 'A2', term: 'Pre-Board' },
                    { academicYear: '2024-2025', subjectName: 'Social Science', theoryMarks: 69, practicalMarks: 20, marksObtained: 89, maxMarks: 100, grade: 'A2', term: 'Pre-Board' },
                    { academicYear: '2024-2025', subjectName: 'Hindi Course-A', theoryMarks: 70, practicalMarks: 20, marksObtained: 90, maxMarks: 100, grade: 'A1', term: 'Pre-Board' }
                ]
            },

            // Student 6: Class 10 (Transferred / Floating TC Student on 30-Day Dropout Radar)
            {
                _id: 'ARJUN032009',
                uniqueId: 'ARJUN032009',
                name: 'Arjun Kapoor',
                fatherName: 'Vikram Kapoor',
                motherName: 'Ananya Kapoor',
                dob: new Date('2009-03-22'),
                gender: 'Male',
                bloodGroup: 'AB+',
                nationality: 'Indian',
                address: 'Civil Lines, Lucknow, Uttar Pradesh 226001',
                phoneNumber: '+91 91234 56789',
                aadhaarNumber: '876543210987',
                penNumber: 'PEN-UP-2009-4402',
                academicLevel: 'school',
                section: 'B',
                stream: 'General Secondary',
                boardRollNumber: 'UP-GIC-2024-1002',
                attendancePercentage: 88.0,
                courseType: 'Secondary School',
                course: 'Secondary School Certificate (Class 10)',
                currentClass: 'Class 10',
                qualification: 'Class 10',
                status: 'Transferred',
                tcNumber: 'TC-GIC-LKO-2024-8841',
                tcIssueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago (triggers dropout alarm!)
                tcRemarks: 'Parental job transfer to Varanasi. Permitted to seek admission in affiliated school.',
                conduct: 'Good',
                reasonForLeaving: 'Parental Relocation to Eastern UP',
                admissionYear: 2015,
                graduationYear: 2025,
                currentSchoolId: 'SCH-UP-01',
                currentSchoolName: 'Government Inter College (GIC Lucknow)',
                history: [
                    {
                        schoolId: 'SCH-UP-01',
                        schoolName: 'Government Inter College (GIC Lucknow)',
                        joinedYear: '2015',
                        leftYear: '2024',
                        lastClass: 'Class 10',
                        lastCourse: 'Secondary Education'
                    }
                ],
                marks: [
                    { academicYear: '2023-2024', subjectName: 'Mathematics', theoryMarks: 62, practicalMarks: 20, marksObtained: 82, maxMarks: 100, grade: 'B1' },
                    { academicYear: '2023-2024', subjectName: 'Science', theoryMarks: 64, practicalMarks: 20, marksObtained: 84, maxMarks: 100, grade: 'B1' },
                    { academicYear: '2023-2024', subjectName: 'Social Science', theoryMarks: 68, practicalMarks: 20, marksObtained: 88, maxMarks: 100, grade: 'A2' },
                    { academicYear: '2023-2024', subjectName: 'Hindi', theoryMarks: 70, practicalMarks: 20, marksObtained: 90, maxMarks: 100, grade: 'A1' }
                ]
            },

            // Student 7: Class 11 (Senior Secondary - Science Stream)
            {
                _id: 'VIKRAM112008',
                uniqueId: 'VIKRAM112008',
                name: 'Vikramaditya Rao',
                fatherName: 'G. V. Rao',
                motherName: 'Kalyani Rao',
                dob: new Date('2008-09-15'),
                gender: 'Male',
                bloodGroup: 'B+',
                nationality: 'Indian',
                address: 'House 8, Rajendra Nagar, New Delhi 110060',
                phoneNumber: '+91 98119 45678',
                aadhaarNumber: '555566667777',
                penNumber: 'PEN-CBSE-2008-7712',
                academicLevel: 'school',
                section: 'A',
                stream: 'Science (PCM)',
                boardRollNumber: 'CBSE-11-9921',
                attendancePercentage: 92.0,
                courseType: 'Senior Secondary',
                course: 'Senior School Certificate (Class 11 Science)',
                currentClass: 'Class 11',
                branch: 'PCM (Physics, Chem, Math + CS)',
                qualification: 'Class 11 Science',
                status: 'Active',
                admissionYear: 2014,
                graduationYear: 2026,
                currentSchoolId: 'SCH-CBSE-01',
                currentSchoolName: 'Delhi Public School (DPS Noida)',
                history: [
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2014',
                        leftYear: 'Present',
                        lastClass: 'Class 11',
                        lastCourse: 'Senior Secondary Science'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Physics Theory & Practical', theoryMarks: 67, practicalMarks: 28, marksObtained: 95, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Chemistry Theory & Lab', theoryMarks: 65, practicalMarks: 29, marksObtained: 94, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Mathematics Core', theoryMarks: 78, practicalMarks: 20, marksObtained: 98, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Computer Science (Python)', theoryMarks: 68, practicalMarks: 28, marksObtained: 96, maxMarks: 100, grade: 'A1' }
                ]
            },

            // Student 8: Class 12 (Senior Secondary Final Board Candidate - Commerce)
            {
                _id: 'PRIYA122007',
                uniqueId: 'PRIYA122007',
                name: 'Priya Sharma',
                fatherName: 'Dinesh Sharma',
                motherName: 'Geeta Sharma',
                dob: new Date('2007-12-04'),
                gender: 'Female',
                bloodGroup: 'A+',
                nationality: 'Indian',
                address: 'Plot 88, Sigra, Varanasi, Uttar Pradesh 221010',
                phoneNumber: '+91 94151 22334',
                aadhaarNumber: '666677778888',
                penNumber: 'PEN-UP-2007-9102',
                academicLevel: 'school',
                section: 'B',
                stream: 'Commerce & Economics',
                boardRollNumber: 'UP-12-33019',
                attendancePercentage: 94.0,
                courseType: 'Senior Secondary',
                course: 'Intermediate Certificate (Class 12 Commerce)',
                currentClass: 'Class 12',
                branch: 'Commerce & Economics',
                qualification: 'Class 12 Commerce',
                status: 'Active',
                admissionYear: 2013,
                graduationYear: 2025,
                currentSchoolId: 'SCH-UP-02',
                currentSchoolName: 'Varanasi Model Senior Secondary School',
                history: [
                    {
                        schoolId: 'SCH-UP-02',
                        schoolName: 'Varanasi Model Senior Secondary School',
                        joinedYear: '2013',
                        leftYear: 'Present',
                        lastClass: 'Class 12',
                        lastCourse: 'Intermediate Commerce'
                    }
                ],
                marks: [
                    { academicYear: '2024-2025', subjectName: 'Financial Accountancy', theoryMarks: 76, practicalMarks: 20, marksObtained: 96, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Macroeconomics & Indian Economy', theoryMarks: 74, practicalMarks: 20, marksObtained: 94, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Business Studies', theoryMarks: 72, practicalMarks: 20, marksObtained: 92, maxMarks: 100, grade: 'A1' },
                    { academicYear: '2024-2025', subjectName: 'Applied Mathematics', theoryMarks: 69, practicalMarks: 20, marksObtained: 89, maxMarks: 100, grade: 'A2' }
                ]
            },

            // Student 9: College Undergraduate (University Level - DU)
            {
                _id: 'KABIR2022CS',
                uniqueId: 'KABIR2022CS',
                name: 'Kabir Mehta',
                fatherName: 'Sanjay Mehta',
                motherName: 'Shalini Mehta',
                dob: new Date('2004-06-18'),
                gender: 'Male',
                bloodGroup: 'B+',
                nationality: 'Indian',
                address: '15/22, Roop Nagar, Near North Campus, Delhi 110007',
                phoneNumber: '+91 98101 77889',
                aadhaarNumber: '777788889999',
                penNumber: 'PEN-DU-2022-1082',
                academicLevel: 'university',
                degree: 'Bachelor of Technology (B.Tech)',
                department: 'Computer Engineering',
                semester: 'Semester 4',
                prnNumber: 'PRN-DU-2022-88129',
                abcId: 'ABC-7721-9943-1284',
                cgpa: 8.74,
                sgpa: 8.90,
                creditsEarned: 88,
                totalCreditsRequired: 160,
                courseType: 'Higher Education',
                course: 'Bachelor of Technology (B.Tech)',
                branch: 'Computer Engineering',
                currentClass: 'B.Tech 2nd Year (Semester 4)',
                qualification: 'B.Tech (Pursuing)',
                status: 'Active',
                admissionYear: 2022,
                graduationYear: 2026,
                currentSchoolId: 'UNIV-DU',
                currentSchoolName: 'University of Delhi (Delhi University)',
                history: [
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2010',
                        leftYear: '2022',
                        lastClass: 'Class 12',
                        lastCourse: 'Senior Secondary (CBSE)'
                    },
                    {
                        schoolId: 'UNIV-DU',
                        schoolName: 'University of Delhi (Delhi University)',
                        joinedYear: '2022',
                        leftYear: 'Present',
                        lastClass: 'B.Tech 2nd Year',
                        lastCourse: 'Bachelor of Technology'
                    }
                ],
                marks: [
                    { academicYear: '2023-2024', subjectName: 'Data Structures & Algorithms', courseCode: 'CS201', courseTitle: 'Data Structures & Algorithms', credits: 4, gradePoint: 10, letterGrade: 'O', semester: 'Semester 3', marksObtained: 92, maxMarks: 100, grade: 'O' },
                    { academicYear: '2023-2024', subjectName: 'Operating Systems & Concurrency', courseCode: 'CS202', courseTitle: 'Operating Systems & Concurrency', credits: 4, gradePoint: 9, letterGrade: 'A+', semester: 'Semester 3', marksObtained: 88, maxMarks: 100, grade: 'A+' },
                    { academicYear: '2023-2024', subjectName: 'Computer Networks & Protocols', courseCode: 'CS203', courseTitle: 'Computer Networks & Protocols', credits: 4, gradePoint: 10, letterGrade: 'O', semester: 'Semester 3', marksObtained: 90, maxMarks: 100, grade: 'O' },
                    { academicYear: '2023-2024', subjectName: 'Discrete Mathematics', courseCode: 'MA201', courseTitle: 'Discrete Mathematics', credits: 4, gradePoint: 10, letterGrade: 'O', semester: 'Semester 3', marksObtained: 94, maxMarks: 100, grade: 'O' }
                ]
            },

            // Student 10: IIT Delhi B.Tech Graduate (Full Sovereign Record & Degree Awarded)
            {
                _id: 'DEVANSH-IITD-2024',
                uniqueId: 'DEVANSH-IITD-2024',
                name: 'Devansh Saxena',
                fatherName: 'Dr. Vivek Saxena',
                motherName: 'Prof. Anupama Saxena',
                dob: new Date('2002-04-10'),
                gender: 'Male',
                bloodGroup: 'O+',
                nationality: 'Indian',
                address: 'Faculty Housing B-4, IIT Delhi Campus, Hauz Khas, New Delhi 110016',
                phoneNumber: '+91 99990 12345',
                aadhaarNumber: '999900001111',
                penNumber: 'PEN-IITD-2020-0042',
                academicLevel: 'university',
                degree: 'Bachelor of Technology (B.Tech)',
                department: 'Computer Science & Engineering (CSE)',
                semester: 'Graduated / Degree Conferred',
                prnNumber: 'PRN-IITD-2020-0042',
                abcId: 'ABC-9912-3841-5502',
                cgpa: 9.42,
                sgpa: 9.80,
                creditsEarned: 168,
                totalCreditsRequired: 160,
                courseType: 'Higher Education',
                course: 'Bachelor of Technology in Computer Science & Engineering',
                branch: 'Computer Science & Engineering (CSE)',
                currentClass: 'B.Tech Graduated (Class of 2024)',
                qualification: 'B.Tech CSE (First Class with Distinction - 9.42 CGPA)',
                status: 'Active',
                admissionYear: 2020,
                graduationYear: 2024,
                currentSchoolId: 'IIT-DELHI',
                currentSchoolName: 'Indian Institute of Technology Delhi (IIT Delhi)',
                history: [
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2008',
                        leftYear: '2018',
                        lastClass: 'Class 10',
                        lastCourse: 'Secondary School (CBSE 96.8%)'
                    },
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2018',
                        leftYear: '2020',
                        lastClass: 'Class 12',
                        lastCourse: 'Senior Secondary Science (CBSE 98.2%)'
                    },
                    {
                        schoolId: 'IIT-DELHI',
                        schoolName: 'Indian Institute of Technology Delhi (IIT Delhi)',
                        joinedYear: '2020',
                        leftYear: '2024',
                        lastClass: 'B.Tech CSE Final Year',
                        lastCourse: 'Bachelor of Technology (Graduated - CGPA 9.42)'
                    }
                ],
                marks: [
                    { academicYear: '2023-2024', subjectName: 'Advanced Distributed Systems & Consensus', courseCode: 'COL732', courseTitle: 'Advanced Distributed Systems & Consensus', credits: 4, gradePoint: 10, letterGrade: 'Ex', semester: 'Semester 8', marksObtained: 98, maxMarks: 100, grade: 'Ex (10.0)' },
                    { academicYear: '2023-2024', subjectName: 'Deep Learning & Neural Architectures', courseCode: 'COL774', courseTitle: 'Deep Learning & Neural Architectures', credits: 4, gradePoint: 10, letterGrade: 'Ex', semester: 'Semester 8', marksObtained: 95, maxMarks: 100, grade: 'Ex (10.0)' },
                    { academicYear: '2023-2024', subjectName: 'Cryptographic Protocols & Ledger Security', courseCode: 'COL759', courseTitle: 'Cryptographic Protocols & Ledger Security', credits: 4, gradePoint: 9, letterGrade: 'A', semester: 'Semester 8', marksObtained: 94, maxMarks: 100, grade: 'A (9.0)' },
                    { academicYear: '2023-2024', subjectName: 'B.Tech Major Capstone Thesis (AI Systems)', courseCode: 'COD492', courseTitle: 'B.Tech Major Capstone Thesis', credits: 8, gradePoint: 10, letterGrade: 'Ex', semester: 'Semester 8', marksObtained: 99, maxMarks: 100, grade: 'Ex (10.0)' }
                ]
            },

            // Student 11: Undergraduate College Student at St. Stephen's College
            {
                _id: 'ROHAN092003',
                uniqueId: 'ROHAN092003',
                name: 'Rohan Roy',
                fatherName: 'Alok Roy',
                motherName: 'Malini Roy',
                dob: new Date('2003-09-14'),
                gender: 'Male',
                bloodGroup: 'A+',
                nationality: 'Indian',
                address: 'Room 24, Rudra Hostel, St. Stephen\'s College, North Campus, Delhi 110007',
                phoneNumber: '+91 98111 22334',
                aadhaarNumber: '334455667788',
                penNumber: 'PEN-CLG-2022-4419',
                academicLevel: 'college',
                degree: 'Bachelor of Arts (Hons) Economics',
                department: 'Economics',
                semester: 'Semester 4',
                prnNumber: 'PRN-STEPHENS-2022-041',
                abcId: 'ABC-3344-5566-7788',
                cgpa: 8.85,
                sgpa: 9.10,
                creditsEarned: 84,
                totalCreditsRequired: 148,
                courseType: 'Graduation',
                course: 'Bachelor of Arts (Honours)',
                branch: 'Economics & Statistics',
                currentClass: 'B.A. (Hons) 2nd Year (Semester 4)',
                qualification: 'B.A. Economics (Pursuing)',
                status: 'Active',
                admissionYear: 2022,
                graduationYear: 2025,
                currentSchoolId: 'CLG-DU-01',
                currentSchoolName: "St. Stephen's College (University of Delhi)",
                history: [
                    {
                        schoolId: 'SCH-CBSE-01',
                        schoolName: 'Delhi Public School (DPS Noida)',
                        joinedYear: '2010',
                        leftYear: '2022',
                        lastClass: 'Class 12',
                        lastCourse: 'Senior Secondary Humanities (97.4%)'
                    },
                    {
                        schoolId: 'CLG-DU-01',
                        schoolName: "St. Stephen's College (University of Delhi)",
                        joinedYear: '2022',
                        leftYear: 'Present',
                        lastClass: 'B.A. (Hons) 2nd Year',
                        lastCourse: 'Bachelor of Arts (Honours)'
                    }
                ],
                marks: [
                    { academicYear: '2023-2024', subjectName: 'Intermediate Microeconomics', courseCode: 'ECON201', courseTitle: 'Intermediate Microeconomics', credits: 4, gradePoint: 10, letterGrade: 'O', semester: 'Semester 3', marksObtained: 91, maxMarks: 100, grade: 'O' },
                    { academicYear: '2023-2024', subjectName: 'Macroeconomic Policy & Growth', courseCode: 'ECON202', courseTitle: 'Macroeconomic Policy & Growth', credits: 4, gradePoint: 9, letterGrade: 'A+', semester: 'Semester 3', marksObtained: 87, maxMarks: 100, grade: 'A+' },
                    { academicYear: '2023-2024', subjectName: 'Econometrics & Statistical Models', courseCode: 'ECON203', courseTitle: 'Econometrics & Statistical Models', credits: 4, gradePoint: 10, letterGrade: 'O', semester: 'Semester 3', marksObtained: 94, maxMarks: 100, grade: 'O' }
                ]
            }
        ];
        await Student.insertMany(students);
        console.log(`✅ Seeded ${students.length} comprehensive student records (Class 5, 6, 7, 9, 10, 11, 12, St. Stephen's College, DU Undergrad, IIT Delhi B.Tech Graduate) with academic records`);

        // 6. Insert Sample Third-Party Verification Access Request
        const sampleRequest = {
            _id: 'REQ-2026-90412',
            requestId: 'REQ-2026-90412',
            agencyName: 'Tata Consultancy Services Background Verification',
            agencyRegistrationId: 'CIN-L72200MH1995PLC085699',
            requesterName: 'Anil Deshmukh (Lead HR Officer)',
            requesterEmail: 'bgv.clearance@tcs.com',
            requesterPhone: '+91 22 6778 9999',
            purpose: 'Pre-Employment Background Verification',
            studentId: 'DEVANSH-IITD-2024',
            studentName: 'Devansh Saxena',
            targetBoard: 'Central Education Board & IIT Delhi Registrar',
            status: 'Pending'
        };
        await AccessRequest.create(sampleRequest);
        console.log("✅ Seeded sample agency verification request");

        // 7. Insert Realistic Administrative Tasks across Governance Tiers
        const tasks = [
            // Central MOE Tasks
            {
                taskId: 'TSK-2026-0001',
                title: 'Review Uttar Pradesh Annual Enrolment & GER Return 2025-2026',
                description: 'Review state-submitted gross enrolment ratio metrics, secondary transition rates, and district-level disparities.',
                category: 'STATE_REPORT_REVIEW',
                tier: 'central',
                assignedTo: 'ADMIN',
                assignedBy: 'National Education Depository Workflow',
                priority: 'High',
                status: 'Under Review',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                relatedEntityId: 'REP-STATE-UP-2026-Q1',
                relatedEntityType: 'Report',
                activityLog: [
                    { action: 'Task Initiated', performedBy: 'System Workflow', note: 'Auto-generated upon UP-MOE report submission' }
                ]
            },
            {
                taskId: 'TSK-2026-0002',
                title: 'National PM-SHRI Model School Scheme Fund Allocation Audit',
                description: 'Audit fund distribution and laboratory modernization milestones across 14,500 designated PM-SHRI institutions.',
                category: 'SCHEME_AUDIT',
                tier: 'central',
                assignedTo: 'ADMIN',
                assignedBy: 'Ministry of Education Finance Cell',
                priority: 'Medium',
                status: 'In Progress',
                dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                activityLog: [
                    { action: 'Audit Initialized', performedBy: 'Finance Undersecretary', note: 'Phase 2 physical verification in progress' }
                ]
            },
            {
                taskId: 'TSK-2026-0003',
                title: 'Resolve Interstate Migration Discrepancy (Delhi - Haryana Corridor)',
                description: 'Cross-verify 42 unverified student migration records released from Delhi schools with pending admissions in Haryana.',
                category: 'DATA_QUALITY_DISCREPANCY',
                tier: 'central',
                assignedTo: 'ADMIN',
                assignedBy: 'Interstate Data Quality Engine',
                priority: 'Urgent',
                status: 'Pending',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                activityLog: [
                    { action: 'Discrepancy Flagged', performedBy: 'System Audit', note: 'Mismatch between issued TCs and receiving admissions' }
                ]
            },

            // State Education Department Tasks (UP-MOE, STATE-DL)
            {
                taskId: 'TSK-2026-0004',
                title: 'Field Investigation: 35-Day Unenrolled Student Transition (Lucknow)',
                description: 'Assign Block Education Officer (BEO) Aliganj to conduct field visit for Rahul Sharma (TC issued, unadmitted 35 days).',
                category: 'DROPOUT_INVESTIGATION',
                tier: 'state',
                assignedTo: 'UP-MOE',
                assignedBy: 'State Retention Radar',
                priority: 'High',
                status: 'In Progress',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                relatedEntityId: 'RAHUL052010',
                relatedEntityType: 'Student',
                activityLog: [
                    { action: 'Investigation Opened', performedBy: 'Directorate of Education UP', note: 'BEO Aliganj assigned for physical contact' }
                ]
            },
            {
                taskId: 'TSK-2026-0005',
                title: 'District Education Officer (DEO) Quarterly Review - Varanasi',
                description: 'Review infrastructure compliance, mid-day meal nutritional standards, and science lab kits in 64 Government Inter Colleges.',
                category: 'GENERAL_ADMINISTRATIVE',
                tier: 'state',
                assignedTo: 'UP-MOE',
                assignedBy: 'Additional Director (Madhyamik)',
                priority: 'Medium',
                status: 'Pending',
                dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                activityLog: [
                    { action: 'Quarterly Audit Scheduled', performedBy: 'State Secretariat', note: 'DEO Varanasi designated' }
                ]
            },

            // Education Boards Tasks (CBSE, CISCE, UP-BOARD)
            {
                taskId: 'TSK-2026-0006',
                title: 'Review School Affiliation Extension Application - DPS Noida #2130018',
                description: 'Verify statutory playground area, fire safety certification, and teacher-student ratio (1:30) for senior secondary affiliation.',
                category: 'AFFILIATION_APPLICATION',
                tier: 'board',
                assignedTo: 'CBSE',
                assignedBy: 'CBSE Affiliation Portal',
                priority: 'Medium',
                status: 'Under Review',
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                relatedEntityId: 'SCH-CBSE-01',
                relatedEntityType: 'School',
                activityLog: [
                    { action: 'Application Received', performedBy: 'Affiliation Desk', note: 'Physical inspection report uploaded' }
                ]
            },
            {
                taskId: 'TSK-2026-0007',
                title: 'Board Examination Roll Number Gazette Finalization (Class 10 & 12)',
                description: 'Lock sovereign roll numbers and exam centre assignments for 312 registered candidates across affiliated NCR zone.',
                category: 'EXAM_RESULT_VERIFICATION',
                tier: 'board',
                assignedTo: 'CBSE',
                assignedBy: 'Controller of Examinations',
                priority: 'Urgent',
                status: 'Pending',
                dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                activityLog: [
                    { action: 'Gazette Draft Prepared', performedBy: 'IT Department CBSE', note: 'Pre-exam validation in progress' }
                ]
            },

            // Institutional Tasks (Schools, Colleges, Universities)
            {
                taskId: 'TSK-2026-0008',
                title: 'Issue Counter-Signed Transfer Certificate & Character Certificate',
                description: 'Issue official digital TC and conduct ledger clearance for Priya Sharma applying for Kendriya Vidyalaya relocation.',
                category: 'STUDENT_MIGRATION_CLEARANCE',
                tier: 'school',
                assignedTo: 'SCH-CBSE-01',
                assignedBy: 'Vice Principal Academic Office',
                priority: 'High',
                status: 'Pending',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                relatedEntityId: 'PRIYA062010',
                relatedEntityType: 'Student',
                activityLog: [
                    { action: 'TC Application Received', performedBy: 'Student Parent Request', note: 'Library clearance complete' }
                ]
            },
            {
                taskId: 'TSK-2026-0009',
                title: 'Academic Bank of Credits (ABC/APAAR) Semester Credit Synchronization',
                description: 'Push 24 earned semester credits to National ABC depository for 60 enrolled B.Tech Computer Science students.',
                category: 'EXAM_RESULT_VERIFICATION',
                tier: 'university',
                assignedTo: 'IIT-DELHI',
                assignedBy: 'Dean of Academic Affairs',
                priority: 'Medium',
                status: 'In Progress',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                activityLog: [
                    { action: 'Batch Grade Finalized', performedBy: 'Controller of Examinations', note: 'Credits ready for transmission' }
                ]
            }
        ];
        await Task.insertMany(tasks);
        console.log(`✅ Seeded ${tasks.length} realistic administrative tasks across Central, State, Board, and Institutional tiers`);

        // 8. Insert Realistic Periodic Reports
        const reports = [
            {
                reportId: 'REP-STATE-UP-2026-Q1',
                title: 'Uttar Pradesh State Annual Education & Enrolment Progress Report 2025-2026',
                reportingTier: 'state',
                submittedBy: 'UP-MOE',
                submittedByName: 'Directorate of Education, Uttar Pradesh',
                submittedTo: 'ADMIN',
                reportingPeriod: 'Annual 2025-2026',
                reportType: 'STATE_ANNUAL_ENROLMENT',
                summary: 'Comprehensive annual return documenting 96.8% elementary transition, 4,210 verified out-of-school interventions, and mid-day meal coverage across 75 districts.',
                metrics: {
                    totalEnrolled: 18450000,
                    attendanceAverage: 88.4,
                    transitionRate: 94.2,
                    dropoutsInvestigated: 4210,
                    schemeBeneficiaries: 14200000
                },
                status: 'Under Review',
                reviewRemarks: 'Under review by Central Undersecretary. Primary metrics align with UDISE+ state benchmark.'
            },
            {
                reportId: 'REP-STATE-DL-2026-Q1',
                title: 'Delhi Directorate of Education - Interstate Migration & Enrolment Assessment',
                reportingTier: 'state',
                submittedBy: 'STATE-DL',
                submittedByName: 'Directorate of Education, Delhi State',
                submittedTo: 'ADMIN',
                reportingPeriod: 'Q1-2026',
                reportType: 'INTERSTATE_MIGRATION_AUDIT',
                summary: 'Quarterly review tracking 1,420 interstate in-migrations and 1,180 out-migrations across NCR border districts with 100% digital TC ledger clearance.',
                metrics: {
                    totalEnrolled: 1650000,
                    attendanceAverage: 91.2,
                    transitionRate: 97.6,
                    dropoutsInvestigated: 340,
                    schemeBeneficiaries: 1200000
                },
                status: 'Approved',
                reviewRemarks: 'Approved by Central Ministry. Ledger integrity verified.',
                reviewedBy: 'Central Education Depository Admin',
                reviewedAt: new Date()
            },
            {
                reportId: 'REP-INST-DPS-2026',
                title: 'Institutional Academic & Infrastructure Return - DPS Noida',
                reportingTier: 'institution',
                submittedBy: 'SCH-CBSE-01',
                submittedByName: 'Delhi Public School (DPS Noida)',
                submittedTo: 'CBSE',
                reportingPeriod: 'Academic 2025-2026',
                reportType: 'INSTITUTION_INFRA_AUDIT',
                summary: 'Mandatory annual institutional return reporting full laboratory adherence, 100% board examination pass rate, and zero ghost enrolment.',
                metrics: {
                    totalEnrolled: 4200,
                    attendanceAverage: 94.5,
                    transitionRate: 99.8,
                    dropoutsInvestigated: 2,
                    schemeBeneficiaries: 340
                },
                status: 'Approved',
                reviewRemarks: 'Annual return verified and accredited by CBSE Northern Regional Office.',
                reviewedBy: 'CBSE Regional Director',
                reviewedAt: new Date()
            }
        ];
        await Report.insertMany(reports);
        console.log(`✅ Seeded ${reports.length} realistic statutory reports`);

        console.log("\n==================================================================");
        console.log("🎉 Complete EduVera MongoDB Seeding Succeeded!");
        console.log("==================================================================");
        process.exit(0);

    } catch (err) {
        console.error("❌ MongoDB Seeding Error:", err);
        process.exit(1);
    }
}

seedMongoDB();
