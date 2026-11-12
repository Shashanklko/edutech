import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UserPlus, ArrowRightLeft, ShieldCheck, AlertCircle, CheckCircle2, User, Phone, Mail, BookOpen, GraduationCap, Building, ArrowRight, Eye, School, Award, Landmark, FileText, Check } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SCHOOL_CONFIG = {
    "Primary (Class 1-5)": {
        standards: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
        streams: ["General Foundation"]
    },
    "Middle School (Class 6-8)": {
        standards: ["Class 6", "Class 7", "Class 8"],
        streams: ["General Foundation"]
    },
    "Secondary (Class 9-10)": {
        standards: ["Class 9", "Class 10"],
        streams: ["General Secondary"]
    },
    "Senior Secondary (Class 11-12)": {
        standards: ["Class 11", "Class 12"],
        streams: ["Science (PCM)", "Science (PCB)", "Commerce & Economics", "Arts & Humanities", "Vocational Stream"]
    }
};

const COLLEGE_CONFIG = {
    "Undergraduate Degree": {
        degrees: ["B.Tech", "B.Sc (Hons)", "B.Com", "B.A. (Hons)", "BBA", "BCA", "Diploma"],
        departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Comm.", "Mechanical Engineering", "Civil Engineering", "Economics & Statistics", "Commerce & Finance", "Physics", "Chemistry", "General Sciences"]
    }
};

const UNIVERSITY_CONFIG = {
    "Undergraduate Degree": {
        degrees: ["B.Tech", "B.Sc (Hons)", "B.Com", "B.A. (Hons)", "MBBS", "LLB"],
        departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Comm.", "Mechanical Engineering", "Civil Engineering", "Economics & Statistics", "Commerce & Finance", "Medicine & Surgery", "General Sciences"]
    },
    "Postgraduate Degree": {
        degrees: ["M.Tech", "M.Sc", "M.Com", "M.A.", "MBA", "MCA", "MD / MS"],
        departments: ["Computer Science & AI", "Finance & Analytics", "Marketing Management", "Data Science", "Economics", "Bio-Technology", "General"]
    },
    "Doctoral / Research (Ph.D)": {
        degrees: ["Ph.D in Engineering", "Ph.D in Sciences", "Ph.D in Humanities", "Ph.D in Economics"],
        departments: ["Applied Computing", "Theoretical Physics", "Quantitative Economics", "Materials Science"]
    }
};

const AdmissionsHub = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Determine strict statutory tier & domain
    const isAdmin = user?.role === 'admin' || user?.tier === 'central' || user?.tier === 'board' || user?.tier === 'state';
    const userTier = user?.tier || (user?.schoolId?.startsWith('UNIV') || user?.id?.startsWith('UNIV') ? 'university' : (user?.schoolId?.startsWith('CLG') || user?.id?.startsWith('CLG') ? 'college' : 'school'));
    const isSchool = !isAdmin && (user?.role === 'school' || userTier === 'school');
    const isCollege = !isAdmin && (user?.role === 'college' || userTier === 'college');
    const isUniversity = !isAdmin && (user?.role === 'university' || userTier === 'university');

    // Admin domain toggle state (ONLY accessible by Central / State Board Admins)
    const [adminSelectedMode, setAdminMode] = useState('school');

    // HARD LOCK: School operators are strictly 'school'. College & University operators are strictly 'higher_ed'.
    const institutionMode = isAdmin ? adminSelectedMode : (isSchool ? 'school' : 'higher_ed');

    const isMaster = user?.isMaster !== false;
    const assignedOps = user?.assignedOperations || (isMaster ? ['admissions', 'transfers', 'students', 'marks', 'tasks', 'operators'] : ['students', 'tasks']);
    const canDoFresh = isMaster || assignedOps.includes('admissions');
    const canDoTransfer = isMaster || assignedOps.includes('transfers');

    const [activeTab, setActiveTab] = useState(canDoTransfer ? 'transfer' : (canDoFresh ? 'fresh' : 'none'));

    // Transfer-In State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedStudent, setSearchedStudent] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [enrollSuccess, setEnrollSuccess] = useState('');

    // Transfer-In Form State
    const [transferEnrollForm, setTransferEnrollForm] = useState({
        // School fields
        currentClass: 'Class 11',
        section: 'A',
        stream: 'Science (PCM)',
        boardRollNumber: '',
        // Higher Ed fields
        degree: 'B.Tech',
        department: 'Computer Science & Engineering',
        semester: 'Semester 3',
        prnNumber: '',
        abcId: '',
        // Common
        rollNumber: '',
        admissionYear: new Date().getFullYear(),
        graduationYear: new Date().getFullYear() + (institutionMode === 'higher_ed' ? 4 : 2)
    });

    // Fresh Student Registration Form State
    const [freshForm, setFreshForm] = useState({
        name: '',
        fatherName: '',
        motherName: '',
        dob: '2010-05-15',
        gender: 'Male',
        address: '',
        phoneNumber: '',
        email: '',
        bloodGroup: 'O+',
        nationality: 'Indian',
        casteCategory: 'General',
        aadhaarNumber: '',
        // School Specific
        schoolLevel: 'Secondary (Class 9-10)',
        currentClass: 'Class 10',
        section: 'A',
        stream: 'General Secondary',
        boardRollNumber: '',
        penNumber: '',
        attendancePercentage: '85',
        // College / University Specific
        higherEdLevel: 'Undergraduate Degree',
        degree: 'B.Tech',
        department: 'Computer Science & Engineering',
        semester: 'Semester 1',
        prnNumber: '',
        abcId: '',
        totalCreditsRequired: '160',
        // Common
        rollNumber: '',
        admissionYear: new Date().getFullYear(),
        graduationYear: new Date().getFullYear() + 2
    });

    const [freshLoading, setFreshLoading] = useState(false);
    const [freshSuccess, setFreshSuccess] = useState(null);
    const [freshError, setFreshError] = useState('');

    // Instant Predicted ID calculation
    const predictedId = (() => {
        if (!freshForm.name.trim() || !freshForm.dob) return 'AUTO-GENERATED';
        const firstName = freshForm.name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const parts = freshForm.dob.split('-');
        if (parts.length < 2) return 'AUTO-GENERATED';
        return `${firstName}${parts[1]}${parts[0]}`;
    })();

    // Search for student to Transfer-In
    const handleSearchStudent = async (e) => {
        e?.preventDefault();
        setSearchError('');
        setSearchedStudent(null);
        setEnrollSuccess('');

        if (!searchQuery.trim()) {
            setSearchError('Please provide a valid Unique Student ID (USI), PEN, or 12-Digit Aadhaar.');
            return;
        }

        setSearchLoading(true);
        try {
            const cleanQuery = searchQuery.trim().replace(/[-\s]/g, '');
            const res = await axios.get(`/api/student/${cleanQuery.toUpperCase()}/eligibility`);
            
            if (res.data && res.data.student) {
                setSearchedStudent({
                    ...res.data.student,
                    eligibilityStatus: res.data.status,
                    eligibilityMessage: res.data.message,
                    eligible: res.data.eligible
                });
            } else {
                setSearchError(res.data.message || 'No student record found with this identifier.');
            }
        } catch (err) {
            setSearchError(err.response?.data?.message || err.response?.data?.error || 'Student not found in registry');
        } finally {
            setSearchLoading(false);
        }
    };

    // Execute Transfer-In Enrollment
    const handleExecuteTransfer = async (e) => {
        e.preventDefault();
        if (!searchedStudent) return;

        try {
            const schoolId = user?.schoolId || user?.institutionId || user?.id;
            const payload = {
                schoolId: schoolId,
                academicLevel: institutionMode === 'higher_ed' ? (userTier === 'college' ? 'college' : 'university') : 'school',
                admissionYear: parseInt(transferEnrollForm.admissionYear, 10),
                graduationYear: parseInt(transferEnrollForm.graduationYear, 10),
                rollNumber: transferEnrollForm.rollNumber
            };

            if (institutionMode === 'higher_ed') {
                payload.degree = transferEnrollForm.degree;
                payload.department = transferEnrollForm.department;
                payload.semester = transferEnrollForm.semester;
                payload.course = `${transferEnrollForm.degree} (${transferEnrollForm.department})`;
                payload.qualification = `${transferEnrollForm.degree} - ${transferEnrollForm.semester}`;
                payload.branch = transferEnrollForm.department;
                payload.prnNumber = transferEnrollForm.prnNumber;
                payload.abcId = transferEnrollForm.abcId;
            } else {
                payload.currentClass = transferEnrollForm.currentClass;
                payload.section = transferEnrollForm.section;
                payload.stream = transferEnrollForm.stream;
                payload.course = transferEnrollForm.currentClass;
                payload.qualification = transferEnrollForm.currentClass;
                payload.branch = transferEnrollForm.stream;
                payload.boardRollNumber = transferEnrollForm.boardRollNumber;
            }

            await axios.post(`/api/student/${searchedStudent.uniqueId}/enroll`, payload);

            setEnrollSuccess(`Success! Student ${searchedStudent.name} (${searchedStudent.uniqueId}) is now officially enrolled in your institution.`);
            setSearchedStudent(null);
            setSearchQuery('');
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Error executing transfer');
        }
    };

    // Submit Fresh Student Registration
    const handleFreshSubmit = async (e) => {
        e.preventDefault();
        setFreshError('');
        setFreshSuccess(null);

        if (!canDoFresh) {
            setFreshError('Access Denied: Student admissions operations are not assigned to your desk account. Contact Master Admin.');
            return;
        }

        if (!freshForm.aadhaarNumber || freshForm.aadhaarNumber.length !== 12) {
            setFreshError('A valid 12-digit Aadhaar number is mandatory for national sovereign depository verification.');
            return;
        }

        const cleanPhone = freshForm.phoneNumber ? freshForm.phoneNumber.trim().replace(/\D/g, '') : '';
        if (cleanPhone.length !== 10) {
            setFreshError('A valid 10-digit mobile number is mandatory for statutory registration.');
            return;
        }

        setFreshLoading(true);
        try {
            const targetSchoolId = user?.schoolId || user?.institutionId || user?.id;
            const academicLevel = institutionMode === 'higher_ed' ? (userTier === 'college' ? 'college' : 'university') : 'school';

            const payload = {
                name: freshForm.name,
                fatherName: freshForm.fatherName,
                motherName: freshForm.motherName,
                dob: freshForm.dob,
                gender: freshForm.gender,
                address: freshForm.address,
                phoneNumber: freshForm.phoneNumber,
                email: freshForm.email,
                bloodGroup: freshForm.bloodGroup,
                nationality: freshForm.nationality,
                casteCategory: freshForm.casteCategory,
                aadhaarNumber: freshForm.aadhaarNumber,
                schoolId: targetSchoolId,
                academicLevel: academicLevel,
                admissionYear: parseInt(freshForm.admissionYear, 10),
                graduationYear: parseInt(freshForm.graduationYear, 10),
                rollNumber: freshForm.rollNumber
            };

            if (institutionMode === 'higher_ed') {
                payload.degree = freshForm.degree;
                payload.department = freshForm.department;
                payload.semester = freshForm.semester;
                payload.course = `${freshForm.degree} in ${freshForm.department}`;
                payload.qualification = `${freshForm.degree} (${freshForm.semester})`;
                payload.branch = freshForm.department;
                payload.courseType = freshForm.higherEdLevel;
                payload.prnNumber = freshForm.prnNumber || `PRN-${targetSchoolId}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                payload.abcId = freshForm.abcId || `ABC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
                payload.totalCreditsRequired = parseInt(freshForm.totalCreditsRequired, 10) || 160;
            } else {
                payload.currentClass = freshForm.currentClass;
                payload.section = freshForm.section;
                payload.stream = freshForm.stream;
                payload.course = freshForm.currentClass;
                payload.qualification = freshForm.currentClass;
                payload.branch = freshForm.stream;
                payload.courseType = freshForm.schoolLevel;
                payload.boardRollNumber = freshForm.boardRollNumber;
                payload.penNumber = freshForm.penNumber || `PEN-${targetSchoolId}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                payload.attendancePercentage = parseFloat(freshForm.attendancePercentage) || 85;
            }

            const res = await axios.post('/api/student', payload);
            setFreshSuccess(res.data);
            
            // Reset core fields
            setFreshForm(prev => ({
                ...prev,
                name: '',
                fatherName: '',
                motherName: '',
                address: '',
                phoneNumber: '',
                email: '',
                aadhaarNumber: '',
                rollNumber: '',
                boardRollNumber: '',
                prnNumber: ''
            }));
        } catch (err) {
            setFreshError(err.response?.data?.error || err.response?.data?.message || 'Error registering student into registry');
        } finally {
            setFreshLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
            
            {/* Header with Classification Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <GraduationCap className="text-blue-600" size={24} />
                        Admissions & Sovereign Student Registrar Hub
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage anti-ghost transfer clearances, K-12 class enrollments, and university degree registrations.
                    </p>
                </div>

                {/* Regulatory Scope: Switcher for Board Admins, Strictly Scope-Locked for School/College/University Desks */}
                {isAdmin ? (
                    <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setAdminMode('school')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                institutionMode === 'school'
                                    ? 'bg-white text-blue-700 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <School size={14} />
                            K-12 School Regulatory Domain
                        </button>
                        <button
                            type="button"
                            onClick={() => setAdminMode('higher_ed')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                institutionMode === 'higher_ed'
                                    ? 'bg-white text-indigo-700 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Landmark size={14} />
                            Higher Education Council Domain
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl border bg-slate-50 border-slate-200">
                        <span className={`w-2 h-2 rounded-full ${isSchool ? 'bg-blue-600' : isCollege ? 'bg-indigo-600' : 'bg-amber-600'}`}></span>
                        <span className="text-xs font-bold text-slate-800">
                            {isSchool 
                                ? 'K-12 School Admissions (Classes 1 - 12 Only)' 
                                : isCollege 
                                    ? 'Undergraduate Degree Admissions Desk' 
                                    : 'Apex University Registrations Desk'}
                        </span>
                    </div>
                )}
            </div>

            {/* Active Operation Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-200">
                <div className="flex gap-2">
                    {canDoTransfer && (
                        <button
                            onClick={() => setActiveTab('transfer')}
                            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'transfer'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <ArrowRightLeft size={15} />
                            Admit Transferred Student (TC Clearance Verification)
                        </button>
                    )}

                    {canDoFresh && (
                        <button
                            onClick={() => setActiveTab('fresh')}
                            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'fresh'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <UserPlus size={15} />
                            Fresh Student Ledger Enrollment (New L-USI)
                        </button>
                    )}

                    {!canDoTransfer && !canDoFresh && (
                        <span className="py-3 px-2 text-xs font-bold text-red-600 font-mono">
                            ⚠ No Admission or Transfer operations assigned to this desk account.
                        </span>
                    )}
                </div>

                <span className="text-[11px] font-mono font-bold text-slate-500 hidden sm:inline-block">
                    Format: <span className="text-slate-900 uppercase font-black">{institutionMode === 'school' ? 'K-12 Primary to 12th' : 'Degree / Semesters / Credits'}</span>
                </span>
            </div>

            {/* TAB 1: TRANSFER-IN STUDENT */}
            {activeTab === 'transfer' && (
                <div className="space-y-6">
                    
                    {/* Search & Audit Bar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
                        <h2 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
                            <Search size={16} className="text-blue-600" />
                            Verify Migration & Transfer Certificate Clearance
                        </h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Input the candidate's Aadhaar Number, Lifelong USI, or PEN to inspect their verified Transfer Certificate (TC) and academic transcripts.
                        </p>

                        <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. ARJUN032009 or 876543210987 or RAHUL052010"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searchLoading}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
                            >
                                <Search size={14} />
                                {searchLoading ? 'Verifying...' : 'Search & Verify TC'}
                            </button>
                        </form>

                        {searchError && (
                            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0 text-red-600" />
                                {searchError}
                            </div>
                        )}

                        {enrollSuccess && (
                            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-bold">
                                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                                {enrollSuccess}
                            </div>
                        )}
                    </div>

                    {/* Searched Student Clearance Dossier */}
                    {searchedStudent && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
                            
                            {/* Clearance Banner */}
                            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                searchedStudent.status === 'Transferred'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                    : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}>
                                <div className="flex items-start sm:items-center gap-3">
                                    <ShieldCheck size={20} className={searchedStudent.status === 'Transferred' ? 'text-emerald-600' : 'text-amber-600'} />
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-wide">
                                            {searchedStudent.status === 'Transferred' ? 'Official TC Clearance Verified' : 'Single-Active Institution Lock'}
                                        </p>
                                        <p className="text-xs mt-0.5 leading-relaxed font-medium">
                                            {searchedStudent.eligibilityMessage}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold self-start sm:self-auto uppercase border ${
                                    searchedStudent.status === 'Transferred' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}>
                                    Status: {searchedStudent.status}
                                </span>
                            </div>

                            {/* Student Metadata Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Name</span>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5">{searchedStudent.name}</p>
                                    <p className="font-mono text-[10px] text-blue-600 mt-0.5 font-bold">USI: {searchedStudent.uniqueId}</p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Releasing Institution</span>
                                    <p className="font-bold text-slate-900 mt-0.5">{searchedStudent.lastSchoolName || searchedStudent.currentSchoolName}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Code: {searchedStudent.currentSchoolId}</p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Standard Attended</span>
                                    <p className="font-bold text-slate-900 mt-0.5">{searchedStudent.lastClass || searchedStudent.qualification || searchedStudent.course}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Stream: {searchedStudent.branch || 'General'}</p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TC Discharge Reference</span>
                                    <p className="font-bold text-slate-900 font-mono mt-0.5">{searchedStudent.tcNumber || 'TC-ISSUED'}</p>
                                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                                        <Check size={11} /> Moral Conduct: {searchedStudent.conduct || 'Good'}
                                    </p>
                                </div>
                            </div>

                            {/* Destination Enrollment Form */}
                            {searchedStudent.status === 'Transferred' ? (
                                <form onSubmit={handleExecuteTransfer} className="space-y-4 pt-4 border-t border-slate-200">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <GraduationCap size={16} className="text-blue-600" />
                                        Complete Admission into Your {institutionMode === 'higher_ed' ? 'Degree College / University' : 'K-12 School'}
                                    </h3>

                                    {institutionMode === 'higher_ed' ? (
                                        /* College / University Fields */
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Admitted Degree Program *</label>
                                                <select 
                                                    value={transferEnrollForm.degree}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, degree: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                >
                                                    {(isCollege ? COLLEGE_CONFIG : UNIVERSITY_CONFIG)["Undergraduate Degree"].degrees.map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                    {isUniversity && (
                                                        <>
                                                            <option value="M.Tech">M.Tech (Postgraduate)</option>
                                                            <option value="MBA">MBA (Management)</option>
                                                            <option value="Ph.D">Ph.D (Doctoral Research)</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty / Department *</label>
                                                <select 
                                                    value={transferEnrollForm.department}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, department: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                >
                                                    {(isCollege ? COLLEGE_CONFIG : UNIVERSITY_CONFIG)["Undergraduate Degree"].departments.map(dept => (
                                                        <option key={dept} value={dept}>{dept}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Admitted Semester *</label>
                                                <select 
                                                    value={transferEnrollForm.semester}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, semester: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                >
                                                    {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Reg. Number (PRN)</label>
                                                <input 
                                                    type="text"
                                                    value={transferEnrollForm.prnNumber}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, prnNumber: e.target.value})}
                                                    placeholder="e.g. PRN-2024-8841"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Bank of Credits (ABC ID)</label>
                                                <input 
                                                    type="text"
                                                    value={transferEnrollForm.abcId}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, abcId: e.target.value})}
                                                    placeholder="12-digit ABC ID"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Roll / Seat No. *</label>
                                                <input 
                                                    type="text"
                                                    required
                                                    value={transferEnrollForm.rollNumber}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, rollNumber: e.target.value})}
                                                    placeholder="e.g. CS2024-102"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* K-12 School Fields */
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Standard / Class *</label>
                                                <select 
                                                    value={transferEnrollForm.currentClass}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, currentClass: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                >
                                                    {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                                                <select 
                                                    value={transferEnrollForm.section}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, section: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                >
                                                    {["A", "B", "C", "D"].map(sec => (
                                                        <option key={sec} value={sec}>Section {sec}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Stream *</label>
                                                <select 
                                                    value={transferEnrollForm.stream}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, stream: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                >
                                                    {["General Foundation", "Science (PCM)", "Science (PCB)", "Commerce & Economics", "Arts & Humanities"].map(str => (
                                                        <option key={str} value={str}>{str}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Roll Number *</label>
                                                <input 
                                                    type="text"
                                                    required
                                                    value={transferEnrollForm.rollNumber}
                                                    onChange={(e) => setTransferEnrollForm({...transferEnrollForm, rollNumber: e.target.value})}
                                                    placeholder="e.g. 1045"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <p className="text-[11px] text-slate-500">
                                            Admitting candidate will re-activate their lifelong timeline and link their academic records to your institution.
                                        </p>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                                        >
                                            <CheckCircle2 size={16} />
                                            Confirm Admission & Lock Seat
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                    Student cannot be admitted until their current active institution issues an official Transfer Certificate (TC).
                                </div>
                            )}

                        </div>
                    )}

                </div>
            )}

            {/* TAB 2: FRESH STUDENT REGISTRATION */}
            {activeTab === 'fresh' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
                    
                    {/* Live USI Preview Box */}
                    <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">National Sovereign Identifier (L-USI)</span>
                            <p className="text-xl font-bold font-mono tracking-tight text-white mt-0.5">{predictedId}</p>
                        </div>
                        <div className="text-right sm:text-right">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 border border-blue-500/30 text-blue-300 font-bold uppercase">
                                Format: {institutionMode === 'higher_ed' ? 'Higher Education Degree' : 'K-12 School Standard'}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">Automatic collision resolution and sovereign registry enrollment.</p>
                        </div>
                    </div>

                    {freshSuccess && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <span>Student <strong>{freshSuccess.name || freshSuccess.student?.name}</strong> registered successfully with Sovereign USI: <strong className="font-mono">{freshSuccess.uniqueId}</strong></span>
                            </div>
                            <Link
                                to={`/dashboard/student/${freshSuccess.uniqueId}`}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                            >
                                View Profile & Transcripts →
                            </Link>
                        </div>
                    )}

                    {freshError && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
                            <AlertCircle size={16} className="shrink-0 text-red-600" />
                            {freshError}
                        </div>
                    )}

                    <form onSubmit={handleFreshSubmit} className="space-y-6">
                        
                        {/* 1. Core Identity & Demographics */}
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <User size={14} className="text-blue-600" /> 1. Personal Identity & Guardian Credentials
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={freshForm.name} 
                                        onChange={(e) => setFreshForm({...freshForm, name: e.target.value})} 
                                        placeholder="e.g. Rahul Sharma" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={freshForm.dob} 
                                        onChange={(e) => setFreshForm({...freshForm, dob: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                                    <select 
                                        value={freshForm.gender} 
                                        onChange={(e) => setFreshForm({...freshForm, gender: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Father / Guardian Name *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={freshForm.fatherName} 
                                        onChange={(e) => setFreshForm({...freshForm, fatherName: e.target.value})} 
                                        placeholder="e.g. Rajesh Sharma" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Name</label>
                                    <input 
                                        type="text" 
                                        value={freshForm.motherName} 
                                        onChange={(e) => setFreshForm({...freshForm, motherName: e.target.value})} 
                                        placeholder="e.g. Sunita Sharma" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        UIDAI Aadhaar Number <span className="text-red-500 font-bold">* (12 Digits)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        maxLength={12}
                                        value={freshForm.aadhaarNumber} 
                                        onChange={(e) => setFreshForm({...freshForm, aadhaarNumber: e.target.value.replace(/\D/g, '')})} 
                                        placeholder="12-digit Aadhaar Number" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact & Address */}
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Phone size={14} className="text-blue-600" /> 2. Contact & Residence
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Contact Phone Number * <span className="text-red-500 font-bold font-mono">(10 Digits)</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        required 
                                        maxLength={10}
                                        value={freshForm.phoneNumber} 
                                        onChange={(e) => setFreshForm({...freshForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                        placeholder="10-digit mobile number" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={freshForm.email} 
                                        onChange={(e) => setFreshForm({...freshForm, email: e.target.value})} 
                                        placeholder="student@example.com" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={freshForm.address} 
                                        onChange={(e) => setFreshForm({...freshForm, address: e.target.value})} 
                                        placeholder="City, District, State" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Differentiated Academic Placement */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen size={14} className="text-blue-600" />
                                    3. {institutionMode === 'higher_ed' ? 'Higher Education Degree Architecture' : 'K-12 School Standard & Stream'}
                                </h3>
                                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                    {institutionMode === 'higher_ed' ? 'College / University Schema' : 'K-12 School Schema'}
                                </span>
                            </div>

                            {institutionMode === 'higher_ed' ? (
                                /* College / University Specific Form */
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Program *</label>
                                        <select 
                                            value={freshForm.degree}
                                            onChange={(e) => setFreshForm({...freshForm, degree: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        >
                                            {(isCollege ? COLLEGE_CONFIG : UNIVERSITY_CONFIG)["Undergraduate Degree"].degrees.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                            {isUniversity && (
                                                <>
                                                    <option value="M.Tech">M.Tech (Postgraduate)</option>
                                                    <option value="MBA">MBA (Management)</option>
                                                    <option value="Ph.D">Ph.D (Doctoral Research)</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department / Major *</label>
                                        <select 
                                            value={freshForm.department}
                                            onChange={(e) => setFreshForm({...freshForm, department: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        >
                                            {(isCollege ? COLLEGE_CONFIG : UNIVERSITY_CONFIG)["Undergraduate Degree"].departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Current Enrolled Semester *</label>
                                        <select 
                                            value={freshForm.semester}
                                            onChange={(e) => setFreshForm({...freshForm, semester: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        >
                                            {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"].map(sem => (
                                                <option key={sem} value={sem}>{sem}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">University Roll / Seat Number *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={freshForm.rollNumber} 
                                            onChange={(e) => setFreshForm({...freshForm, rollNumber: e.target.value})} 
                                            placeholder="e.g. 2024-CSE-042" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Reg. Number (PRN)</label>
                                        <input 
                                            type="text" 
                                            value={freshForm.prnNumber} 
                                            onChange={(e) => setFreshForm({...freshForm, prnNumber: e.target.value})} 
                                            placeholder="e.g. PRN-2024-8841" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Bank of Credits (ABC ID)</label>
                                        <input 
                                            type="text" 
                                            value={freshForm.abcId} 
                                            onChange={(e) => setFreshForm({...freshForm, abcId: e.target.value})} 
                                            placeholder="12-digit ABC / APAAR ID" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* K-12 School Specific Form */
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Standard *</label>
                                        <select 
                                            value={freshForm.currentClass}
                                            onChange={(e) => setFreshForm({...freshForm, currentClass: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        >
                                            {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                                        <select 
                                            value={freshForm.section}
                                            onChange={(e) => setFreshForm({...freshForm, section: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        >
                                            {["A", "B", "C", "D"].map(s => (
                                                <option key={s} value={s}>Section {s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Stream *</label>
                                        <select 
                                            value={freshForm.stream}
                                            onChange={(e) => setFreshForm({...freshForm, stream: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        >
                                            {["General Secondary", "General Foundation", "Science (PCM)", "Science (PCB)", "Commerce & Economics", "Arts & Humanities"].map(str => (
                                                <option key={str} value={str}>{str}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Class Roll Number *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={freshForm.rollNumber} 
                                            onChange={(e) => setFreshForm({...freshForm, rollNumber: e.target.value})} 
                                            placeholder="e.g. 1021" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Board / State Roll Number</label>
                                        <input 
                                            type="text" 
                                            value={freshForm.boardRollNumber} 
                                            onChange={(e) => setFreshForm({...freshForm, boardRollNumber: e.target.value})} 
                                            placeholder="e.g. CBSE-10-88192" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Education No. (PEN)</label>
                                        <input 
                                            type="text" 
                                            value={freshForm.penNumber} 
                                            onChange={(e) => setFreshForm({...freshForm, penNumber: e.target.value})} 
                                            placeholder="e.g. PEN-2024-9901" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Record (%)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            value={freshForm.attendancePercentage} 
                                            onChange={(e) => setFreshForm({...freshForm, attendancePercentage: e.target.value})} 
                                            placeholder="85" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Registration creates an immutable national record and provisions the student's official timeline.
                            </p>
                            <button
                                type="submit"
                                disabled={freshLoading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                            >
                                <UserPlus size={16} />
                                {freshLoading ? "Generating Record..." : "Register Student into Sovereign Ledger"}
                            </button>
                        </div>

                    </form>
                </div>
            )}

        </div>
    );
};

export default AdmissionsHub;
