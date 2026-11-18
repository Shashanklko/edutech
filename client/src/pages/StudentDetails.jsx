import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    User, MapPin, Calendar, BookOpen, GraduationCap, ArrowLeft, Building, FileCheck, 
    Edit, Edit2, Save, X, Phone, Mail, Award, CheckCircle2, Plus, Trash2, Printer, ShieldAlert, 
    Upload, Copy, Check, FileText, ArrowRightLeft, ShieldCheck, History, AlertCircle, 
    QrCode, ExternalLink, Lock, CheckCheck, Landmark, School, BadgePercent, ArrowUpRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StudentDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isStudent = user?.role === 'student';
    const isPublicTrack = location.pathname.startsWith('/track');

    const [student, setStudent] = useState(null);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Tab state: 'profile', 'marksheets', 'timeline'
    const [activeTab, setActiveTab] = useState('profile');
    
    // Copy to clipboard state
    const [copiedId, setCopiedId] = useState(false);
    const [copiedHash, setCopiedHash] = useState(null);

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Add mark modal state
    const [showAddMarkModal, setShowAddMarkModal] = useState(false);
    const [newMark, setNewMark] = useState({
        academicYear: '2024-2025',
        subjectName: '',
        marksObtained: '',
        maxMarks: '100',
        grade: 'A1',
        theoryMarks: '',
        practicalMarks: '',
        term: 'Annual',
        courseCode: '',
        courseTitle: '',
        credits: '4',
        gradePoint: '10',
        letterGrade: 'O',
        semester: 'Semester 1'
    });

    // CSV Import modal state
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvRows, setCsvRows] = useState([]);
    const [csvError, setCsvError] = useState('');

    // TC Discharge modal state
    const [showTCModal, setShowTCModal] = useState(false);
    const [tcFields, setTcFields] = useState({
        conduct: 'Excellent',
        reasonForLeaving: 'Completed Standard / Migrating for Higher Studies',
        tcRemarks: 'Exemplary conduct and active participant in co-curricular activities. Cleared all institutional dues.'
    });

    // Rectify / Edit mark modal state
    const [showEditMarkModal, setShowEditMarkModal] = useState(false);
    const [editMarkForm, setEditMarkForm] = useState({
        _id: '',
        academicYear: '2024-2025',
        classLevel: '',
        subjectName: '',
        theoryMarks: '',
        practicalMarks: '',
        marksObtained: '',
        maxMarks: '100',
        grade: 'A1',
        term: 'Annual',
        courseCode: '',
        courseTitle: '',
        credits: '4',
        gradePoint: '10',
        letterGrade: 'O',
        semester: 'Semester 1'
    });

    // Promotion / Class 12 Graduation modal state
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [promoteForm, setPromoteForm] = useState({
        nextClass: '',
        academicSession: '2025-2026',
        section: 'A',
        stream: 'General',
        conduct: 'Excellent',
        reasonForLeaving: 'Higher Secondary Concluded / Eligible for College & University Degree Admission',
        remarks: ''
    });

    // Marksheet session filter state
    const [sessionFilter, setSessionFilter] = useState('all');

    const isHigherEd = student?.academicLevel === 'college' || student?.academicLevel === 'university' || ["Graduation", "Post Graduation", "Ph.D", "Higher Education"].includes(student?.courseType);
    
    const isMaster = user?.isMaster !== false;
    const assignedOps = user?.assignedOperations || (isMaster ? ['admissions', 'transfers', 'students', 'marks', 'tasks', 'operators'] : ['students', 'tasks']);

    const canManageBase = !isStudent && (user?.role === 'admin' || user?.tier === 'central' || user?.tier === 'board' || user?.tier === 'state' || (user?.schoolId && user?.schoolId === student?.currentSchoolId) || (user?.id && user?.id === student?.currentSchoolId) || (user?.institutionId && user?.institutionId === student?.currentSchoolId));

    const canEditProfile = canManageBase && (isMaster || assignedOps.includes('admissions'));
    const canIssueTC = canManageBase && (isMaster || assignedOps.includes('transfers'));
    const canManageMarks = canManageBase && (isMaster || assignedOps.includes('marks'));

    const fetchStudentData = async () => {
        setLoading(true);
        setError('');
        try {
            const studentRes = await axios.get(`/api/student/${id.toUpperCase()}`);
            setStudent(studentRes.data);
            
            setEditForm({
                name: studentRes.data.name || '',
                fatherName: studentRes.data.fatherName || '',
                motherName: studentRes.data.motherName || '',
                dob: studentRes.data.dob ? studentRes.data.dob.split('T')[0] : '',
                gender: studentRes.data.gender || 'Male',
                address: studentRes.data.address || '',
                courseType: studentRes.data.courseType || 'High School (9-10)',
                course: studentRes.data.course || '',
                branch: studentRes.data.branch || '',
                currentClass: studentRes.data.currentClass || '',
                section: studentRes.data.section || 'A',
                stream: studentRes.data.stream || 'General',
                degree: studentRes.data.degree || '',
                department: studentRes.data.department || '',
                semester: studentRes.data.semester || '',
                prnNumber: studentRes.data.prnNumber || '',
                abcId: studentRes.data.abcId || '',
                rollNumber: studentRes.data.rollNumber || '',
                boardRollNumber: studentRes.data.boardRollNumber || '',
                admissionYear: studentRes.data.admissionYear || '',
                graduationYear: studentRes.data.graduationYear || '',
                email: studentRes.data.email || '',
                phoneNumber: studentRes.data.phoneNumber || '',
                bloodGroup: studentRes.data.bloodGroup || '',
                nationality: studentRes.data.nationality || 'Indian',
                casteCategory: studentRes.data.casteCategory || 'General',
                academicAchievements: studentRes.data.academicAchievements || '',
                conduct: studentRes.data.conduct || 'Good',
                reasonForLeaving: studentRes.data.reasonForLeaving || '',
                aadhaarNumber: studentRes.data.aadhaarNumber || '',
                penNumber: studentRes.data.penNumber || ''
            });

            // Fetch Marks
            const marksRes = await axios.get(`/api/student/${studentRes.data.uniqueId}/marks`);
            setMarks(marksRes.data || []);
        } catch (err) {
            setError(err.response?.data?.error || `Student with ID "${id}" could not be found.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [id]);

    const handleCopyId = () => {
        if (!student) return;
        navigator.clipboard.writeText(student.uniqueId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleCopyHash = (hash) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(hash);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (editForm.phoneNumber) {
            const cleanPhone = editForm.phoneNumber.trim().replace(/\D/g, '');
            if (cleanPhone.length !== 10) {
                alert('Mobile number must be strictly 10 numeric digits.');
                return;
            }
            editForm.phoneNumber = cleanPhone;
        }
        if (editForm.aadhaarNumber) {
            const cleanAadhaar = editForm.aadhaarNumber.trim().replace(/\D/g, '');
            if (cleanAadhaar.length !== 12) {
                alert('Aadhaar number must be strictly 12 digits.');
                return;
            }
            editForm.aadhaarNumber = cleanAadhaar;
        }
        try {
            await axios.put(`/api/student/${student.uniqueId}`, {
                ...editForm,
                qualification: editForm.course || editForm.degree || editForm.currentClass
            });
            setIsEditing(false);
            fetchStudentData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update student profile");
        }
    };

    const handleIssueTC = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/student/${student.uniqueId}/transfer`, {
                lastClass: student.course || student.qualification || student.degree || student.currentClass,
                conduct: tcFields.conduct,
                reasonForLeaving: tcFields.reasonForLeaving,
                tcRemarks: tcFields.tcRemarks
            });
            setShowTCModal(false);
            fetchStudentData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to discharge student and issue Transfer Certificate");
        }
    };

    const handleAddMark = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                schoolId: student.currentSchoolId,
                academicYear: newMark.academicYear
            };

            if (isHigherEd) {
                payload.courseCode = newMark.courseCode || 'CRS101';
                payload.courseTitle = newMark.courseTitle || newMark.subjectName || 'Academic Course';
                payload.subjectName = payload.courseTitle;
                payload.credits = parseFloat(newMark.credits) || 4;
                payload.gradePoint = parseFloat(newMark.gradePoint) || 10;
                payload.letterGrade = newMark.letterGrade || 'O';
                payload.marksObtained = payload.gradePoint;
                payload.maxMarks = 10;
                payload.grade = payload.letterGrade;
                payload.semester = newMark.semester || 'Semester 1';
            } else {
                payload.subjectName = newMark.subjectName;
                payload.theoryMarks = parseFloat(newMark.theoryMarks) || null;
                payload.practicalMarks = parseFloat(newMark.practicalMarks) || null;
                payload.marksObtained = parseFloat(newMark.marksObtained);
                payload.maxMarks = parseFloat(newMark.maxMarks) || 100;
                payload.grade = newMark.grade;
                payload.term = newMark.term;
            }

            await axios.post(`/api/student/${student.uniqueId}/marks`, payload);
            setShowAddMarkModal(false);
            
            // Refetch marks
            const marksRes = await axios.get(`/api/student/${student.uniqueId}/marks`);
            setMarks(marksRes.data);
            
            // Reset modal form
            setNewMark({
                academicYear: '2024-2025',
                subjectName: '',
                marksObtained: '',
                maxMarks: '100',
                grade: 'A1',
                theoryMarks: '',
                practicalMarks: '',
                term: 'Annual',
                courseCode: '',
                courseTitle: '',
                credits: '4',
                gradePoint: '10',
                letterGrade: 'O',
                semester: 'Semester 1'
            });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add grade record");
        }
    };

    const handleDeleteMark = async (markId) => {
        if (!window.confirm("Are you sure you want to delete this academic grade record?")) return;
        try {
            await axios.delete(`/api/student/${student.uniqueId}/marks/${markId}`);
            const marksRes = await axios.get(`/api/student/${student.uniqueId}/marks`);
            setMarks(marksRes.data);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to remove mark entry");
        }
    };

    const handleOpenEditMark = (m) => {
        setEditMarkForm({
            _id: m._id || m.id,
            academicYear: m.academicYear || '2024-2025',
            classLevel: m.classLevel || student?.previousClass || student?.currentClass || 'Class 10',
            subjectName: m.subjectName || m.courseTitle || '',
            theoryMarks: m.theoryMarks !== null && m.theoryMarks !== undefined ? m.theoryMarks : '',
            practicalMarks: m.practicalMarks !== null && m.practicalMarks !== undefined ? m.practicalMarks : '',
            marksObtained: m.marksObtained !== null && m.marksObtained !== undefined ? m.marksObtained : '',
            maxMarks: m.maxMarks || 100,
            grade: m.grade || m.letterGrade || 'A1',
            term: m.term || 'Annual',
            courseCode: m.courseCode || '',
            courseTitle: m.courseTitle || m.subjectName || '',
            credits: m.credits || 4,
            gradePoint: m.gradePoint || 10,
            letterGrade: m.letterGrade || m.grade || 'O',
            semester: m.semester || 'Semester 1'
        });
        setShowEditMarkModal(true);
    };

    const handleUpdateMark = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                academicYear: editMarkForm.academicYear,
                classLevel: editMarkForm.classLevel
            };
            if (isHigherEd) {
                payload.courseCode = editMarkForm.courseCode;
                payload.courseTitle = editMarkForm.courseTitle || editMarkForm.subjectName;
                payload.subjectName = payload.courseTitle;
                payload.credits = parseFloat(editMarkForm.credits) || 4;
                payload.gradePoint = parseFloat(editMarkForm.gradePoint) || 10;
                payload.letterGrade = editMarkForm.letterGrade || 'O';
                payload.marksObtained = payload.gradePoint;
                payload.maxMarks = 10;
                payload.grade = payload.letterGrade;
                payload.semester = editMarkForm.semester || 'Semester 1';
            } else {
                payload.subjectName = editMarkForm.subjectName;
                payload.theoryMarks = editMarkForm.theoryMarks !== '' ? parseFloat(editMarkForm.theoryMarks) : null;
                payload.practicalMarks = editMarkForm.practicalMarks !== '' ? parseFloat(editMarkForm.practicalMarks) : null;
                payload.marksObtained = parseFloat(editMarkForm.marksObtained);
                payload.maxMarks = parseFloat(editMarkForm.maxMarks) || 100;
                payload.grade = editMarkForm.grade;
                payload.term = editMarkForm.term || 'Annual';
            }

            await axios.put(`/api/student/${student.uniqueId}/marks/${editMarkForm._id}`, payload);
            setShowEditMarkModal(false);
            fetchStudentData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to rectify academic mark");
        }
    };

    const handleOpenPromote = () => {
        const curr = student?.currentClass || 'Class 10';
        let next = 'Class 11';
        const numMatch = curr.match(/\d+/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num >= 1 && num < 12) {
                next = `Class ${num + 1}`;
            } else if (num === 12) {
                next = 'Class 12 Passed';
            }
        }
        setPromoteForm({
            nextClass: next,
            academicSession: '2025-2026',
            section: student?.section || 'A',
            stream: student?.stream || 'Science (PCM)',
            conduct: student?.conduct || 'Excellent',
            reasonForLeaving: 'Higher Secondary Concluded / Eligible for College & University Degree Admission',
            remarks: curr.includes('12') 
                ? 'Senior Secondary (Class 12) Examination certified passed. Discharged with statutory Transfer Certificate (TC) clearance for College/University Degree Admission.'
                : `Annual academic examination verified and passed. Promoted to ${next}.`
        });
        setShowPromoteModal(true);
    };

    const handlePromoteStudent = async (e) => {
        e.preventDefault();
        try {
            const is12 = student?.currentClass?.includes('12') || promoteForm.nextClass.includes('Passed');
            const res = await axios.post(`/api/student/${student.uniqueId}/promote`, {
                ...promoteForm,
                isGraduation: is12
            });
            setShowPromoteModal(false);
            fetchStudentData();
            if (is12) {
                alert(`Class 12 Graduation certified! Official Transfer Certificate (${res.data.student.tcNumber}) generated. Candidate is now unlocked for College/University degree admission.`);
            } else {
                alert(`Student successfully promoted to ${res.data.student.currentClass}!`);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Failed to certify promotion");
        }
    };

    // Document Printing Engine
    const handlePrintDocument = (type) => {
        const printWindow = window.open('', '_blank');
        const formattedDob = student.dob ? student.dob.split('T')[0] : 'N/A';
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        let bodyContent = "";

        if (type === "TC") {
            bodyContent = `
                <div style="border: 3px double #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; position: relative;">
                    <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
                        <p style="font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #475569; text-transform: uppercase; margin: 0;">Department of School & Higher Education &bull; National Sovereign Depository</p>
                        <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 6px 0;">Official Transfer Certificate (TC)</h1>
                        <p style="font-size: 12px; color: #64748b; margin: 0; font-family: monospace;">USI: ${student.uniqueId} | PEN: ${student.penNumber || 'N/A'}</p>
                    </div>

                    <div style="line-height: 2; font-size: 14px; color: #1e293b;">
                        <p>This is to certify that <strong>${student.name}</strong>, Son/Daughter of Shri <strong>${student.fatherName}</strong> and Smt. <strong>${student.motherName || 'N/A'}</strong>, was on the active rolls of <strong>${student.currentSchoolName}</strong>.</p>
                        <p>Date of Birth: <strong>${formattedDob}</strong> (${student.gender}). Nationality: <strong>${student.nationality || 'Indian'}</strong>.</p>
                        <p>Completed Standard: <strong>${student.qualification || student.course || student.currentClass || student.degree}</strong> (${student.branch || student.department || 'General'}).</p>
                        <p>General Conduct & Moral Character: <strong>${student.conduct || 'Good'}</strong>.<br>
                        Reason for Leaving: <strong>${student.reasonForLeaving || 'Standard Completed / Migrating for Higher Studies'}</strong>.</p>
                    </div>

                    <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold;">
                        <div style="border-top: 1px solid #94a3b8; width: 140px; text-align: center; padding-top: 6px;">Prepared By</div>
                        <div style="border-top: 1px solid #94a3b8; width: 140px; text-align: center; padding-top: 6px;">Registrar Seal</div>
                        <div style="border-top: 1px solid #94a3b8; width: 160px; text-align: center; padding-top: 6px;">Principal / Dean Stamp</div>
                    </div>

                    <div style="margin-top: 32px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; font-family: monospace; text-align: center;">
                        Digitally verified against EduVera Student Education & Migration Registry &bull; Tamper-Proof Stamp ED-TC-${student.uniqueId}
                    </div>
                </div>
            `;
        } else {
            // Transcript
            const rowsHtml = marks.map((m, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 12px; font-weight: bold;">${m.academicYear || m.semester || '-'}</td>
                    <td style="padding: 8px 12px;">${m.courseCode ? `<strong>${m.courseCode}</strong> - ` : ''}${m.subjectName || m.courseTitle}</td>
                    <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${m.marksObtained}</td>
                    <td style="padding: 8px 12px; text-align: center;">${m.maxMarks}</td>
                    <td style="padding: 8px 12px; text-align: center; font-weight: bold; color: #2563eb;">${m.grade || m.letterGrade || '-'}</td>
                </tr>
            `).join('');

            bodyContent = `
                <div style="border: 2px solid #0f172a; padding: 36px; max-width: 850px; margin: 0 auto; font-family: Arial, sans-serif;">
                    <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
                        <p style="font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #475569; text-transform: uppercase; margin: 0;">National Education Board Registry &bull; Verified Academic Record</p>
                        <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 6px 0;">Official Academic Transcript & Grade Report</h1>
                        <p style="font-size: 12px; color: #64748b; margin: 0; font-family: monospace;">USI: ${student.uniqueId} | Issued: ${today}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; font-size: 12px; margin-bottom: 20px;">
                        <div><strong>Student Name:</strong> ${student.name}</div>
                        <div><strong>Institution:</strong> ${student.currentSchoolName}</div>
                        <div><strong>Program / Standard:</strong> ${student.qualification || student.degree || student.currentClass}</div>
                        <div><strong>Academic Identifier:</strong> ${student.rollNumber || student.prnNumber || 'N/A'}</div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
                        <thead>
                            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left;">
                                <th style="padding: 8px 12px;">Term / Sem</th>
                                <th style="padding: 8px 12px;">Course / Subject</th>
                                <th style="padding: 8px 12px; text-align: center;">Obtained</th>
                                <th style="padding: 8px 12px; text-align: center;">Maximum</th>
                                <th style="padding: 8px 12px; text-align: center;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>

                    <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold;">
                        <div style="border-top: 1px solid #94a3b8; width: 140px; text-align: center; padding-top: 6px;">Evaluation Controller</div>
                        <div style="border-top: 1px solid #94a3b8; width: 160px; text-align: center; padding-top: 6px;">Dean / Headmaster Signature</div>
                    </div>
                </div>
            `;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Official Record - ${student.uniqueId}</title>
                    <style>@page { size: portrait; margin: 15mm; } body { margin: 0; }</style>
                </head>
                <body>
                    ${bodyContent}
                    <script>window.onload = function() { window.print(); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Calculate Summary Metrics
    let summaryMetrics = { cgpa: "0.00", totalCredits: 0, percentage: "0.00", totalMarks: 0, maxMarks: 0 };
    if (isHigherEd && marks.length > 0) {
        let weighted = 0;
        let credits = 0;
        marks.forEach(m => {
            const gp = parseFloat(m.gradePoint) || parseFloat(m.marksObtained) || 0;
            const c = parseFloat(m.credits) || 4;
            weighted += (gp * c);
            credits += c;
        });
        summaryMetrics.cgpa = credits > 0 ? (weighted / credits).toFixed(2) : (student.cgpa ? student.cgpa.toFixed(2) : "0.00");
        summaryMetrics.totalCredits = student.creditsEarned || credits;
    } else if (marks.length > 0) {
        let total = 0;
        let max = 0;
        marks.forEach(m => {
            total += parseFloat(m.marksObtained) || 0;
            max += parseFloat(m.maxMarks) || 100;
        });
        summaryMetrics.totalMarks = total;
        summaryMetrics.maxMarks = max;
        summaryMetrics.percentage = max > 0 ? ((total / max) * 100).toFixed(1) : "0.00";
    }

    if (loading) {
        return (
            <div className="py-20 text-center text-slate-500 space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold">Retrieving Sovereign Ledger Dossier...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="p-8 max-w-lg mx-auto bg-white border border-red-200 rounded-2xl shadow-xs text-center space-y-4">
                <AlertCircle size={32} className="text-red-500 mx-auto" />
                <h2 className="text-base font-bold text-slate-900">Student Record Not Found</h2>
                <p className="text-xs text-slate-600">{error || "The requested Unique Student Identifier does not exist in the registry."}</p>
                <Link to={isStudent ? "/" : "/dashboard"} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800">
                    <ArrowLeft size={14} /> {isStudent ? 'Back to Portal' : 'Back to Dashboard'}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left max-w-6xl mx-auto pb-16">
            
            {/* Breadcrumb Bar */}
            <div className="flex items-center justify-between text-xs">
                {isStudent ? (
                    <div className="inline-flex items-center gap-2">
                        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold transition-colors">
                            <ArrowLeft size={14} /> Back to Portal
                        </Link>
                        <span className="text-slate-300">|</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                            <GraduationCap size={13} className="text-blue-600" />
                            Student Academic Depository
                        </span>
                    </div>
                ) : isPublicTrack ? (
                    <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold transition-colors">
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                ) : (
                    <Link to="/dashboard/students" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold transition-colors">
                        <ArrowLeft size={14} /> Back to Roster
                    </Link>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {isHigherEd ? 'Higher Education Degree Schema' : 'K-12 School Schema'}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-[10px] font-mono text-slate-500">Registry ID: {student.uniqueId}</span>
                </div>
            </div>

            {/* Student Header Profile Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                            {student.name?.charAt(0)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl font-black text-white tracking-tight">{student.name}</h1>
                                
                                {/* Copyable USI Badge */}
                                <button
                                    onClick={handleCopyId}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-blue-400 font-bold transition-all cursor-pointer"
                                    title="Click to copy USI"
                                >
                                    {student.uniqueId}
                                    {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-slate-400" />}
                                </button>

                                {/* Status Pill */}
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                    student.status === 'Active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                    {student.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                                <span className="flex items-center gap-1.5">
                                    <Building size={14} className="text-blue-400" />
                                    {student.currentSchoolName || 'EduVera Registered Institution'}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap size={14} className="text-blue-400" />
                                    {isHigherEd 
                                        ? `${student.degree || student.course || 'Degree Program'} (${student.department || student.branch || 'General'})`
                                        : `${student.currentClass || student.qualification || 'Standard Level'} (${student.section ? `Sec ${student.section}` : student.stream || 'General'})`}
                                </span>
                                {student.previousClass && (
                                    <>
                                        <span>&bull;</span>
                                        <span className="text-amber-300 font-medium">
                                            Prev: {student.previousClass}
                                        </span>
                                    </>
                                )}
                                {(student.rollNumber || student.prnNumber) && (
                                    <>
                                        <span>&bull;</span>
                                        <span className="font-mono text-slate-400">
                                            {isHigherEd ? `PRN: ${student.prnNumber || student.rollNumber}` : `Roll: ${student.rollNumber}`}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                            onClick={() => handlePrintDocument('TC')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs"
                        >
                            <FileText size={14} className="text-blue-400" />
                            Print TC
                        </button>

                        <button
                            onClick={() => handlePrintDocument('MARKS')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs"
                        >
                            <Printer size={14} className="text-blue-400" />
                            Print Transcript
                        </button>

                        {canIssueTC && student.status === 'Active' && (
                            <button
                                onClick={() => setShowTCModal(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-bold text-red-300 transition-all cursor-pointer"
                            >
                                <ShieldAlert size={14} />
                                Issue Discharge TC
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                        activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <User size={14} />
                    Profile & Academic Details
                </button>

                <button
                    onClick={() => setActiveTab('marksheets')}
                    className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                        activeTab === 'marksheets'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Award size={14} />
                    {isHigherEd ? `Semester Grades (${marks.length})` : `Academic Marksheets (${marks.length})`}
                </button>

                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                        activeTab === 'timeline'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <History size={14} />
                    Lifelong Migration History ({student.history?.length || 1})
                </button>
            </div>

            {/* ========================================================
                TAB 1: PROFILE & DEMOGRAPHICS
               ======================================================== */}
            {activeTab === 'profile' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
                    
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Demographic & Educational Dossier</h3>
                            <p className="text-xs text-slate-500 mt-0.5">National student migration and academic credential attributes.</p>
                        </div>
                        {canEditProfile && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <Edit size={13} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth & Gender</p>
                                <p className="font-semibold text-slate-800 mt-1">{student.dob?.split('T')[0] || 'N/A'} ({student.gender || 'N/A'})</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Father / Guardian Name</p>
                                <p className="font-semibold text-slate-800 mt-1">{student.fatherName || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mother's Name</p>
                                <p className="font-semibold text-slate-800 mt-1">{student.motherName || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UIDAI Aadhaar Reference</p>
                                <p className="font-mono font-semibold text-slate-800 mt-1">{student.aadhaarNumber ? `XXXX-XXXX-${student.aadhaarNumber.slice(-4)}` : 'Not Linked'}</p>
                            </div>

                            {/* Differentiated Academic Fields */}
                            {isHigherEd ? (
                                <>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Degree & Department</p>
                                        <p className="font-semibold text-slate-800 mt-1">{student.degree || student.course || 'B.Tech'} ({student.department || student.branch || 'General'})</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Semester</p>
                                        <p className="font-semibold text-slate-800 mt-1">{student.semester || 'Semester 4'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permanent Reg. Number (PRN)</p>
                                        <p className="font-mono font-semibold text-slate-800 mt-1">{student.prnNumber || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Bank of Credits (ABC ID)</p>
                                        <p className="font-mono font-semibold text-blue-700 mt-1 font-bold">{student.abcId || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Earned Credits / Required</p>
                                        <p className="font-semibold text-slate-800 mt-1">{student.creditsEarned || summaryMetrics.totalCredits} / {student.totalCreditsRequired || 160} Credits</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class & Section</p>
                                        <p className="font-semibold text-slate-800 mt-1">{student.currentClass || student.qualification || 'Class 10'} {student.section ? `(Section ${student.section})` : ''}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Stream</p>
                                        <p className="font-semibold text-slate-800 mt-1">{student.stream || student.branch || 'General'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Board Roll Number</p>
                                        <p className="font-mono font-semibold text-slate-800 mt-1">{student.boardRollNumber || student.rollNumber || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permanent Education No. (PEN)</p>
                                        <p className="font-mono font-semibold text-slate-800 mt-1">{student.penNumber || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Track</p>
                                        <p className="font-semibold text-slate-800 mt-1">{student.attendancePercentage || 92}% Verified Presence</p>
                                    </div>
                                </>
                            )}

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Phone</p>
                                <p className="font-semibold text-slate-800 mt-1">{student.phoneNumber || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                                <p className="font-semibold text-slate-800 mt-1">{student.email || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Residential Address</p>
                                <p className="font-semibold text-slate-800 mt-1">{student.address || 'N/A'}</p>
                            </div>

                            {student.status === 'Transferred' && (
                                <div className="sm:col-span-2 md:col-span-3 p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono flex items-center gap-1.5">
                                            <FileText size={13} /> Official Transfer Certificate (TC) Details
                                        </span>
                                        <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                                            {student.tcNumber || `TC-${student.uniqueId}`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-800">
                                        <strong>Reason for Leaving:</strong> {student.reasonForLeaving || 'Standard Completed'} &bull; <strong>Moral Conduct:</strong> {student.conduct || 'Good'}
                                    </p>
                                    {student.tcRemarks && (
                                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200/80">
                                            <strong>Principal / Headmaster Remark:</strong> <em>"{student.tcRemarks}"</em>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Edit Profile Form */
                        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Father Name</label>
                                    <input type="text" value={editForm.fatherName} onChange={(e) => setEditForm({...editForm, fatherName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Mother Name</label>
                                    <input type="text" value={editForm.motherName} onChange={(e) => setEditForm({...editForm, motherName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Phone Number <span className="text-red-500 font-mono text-[11px]">(10 Digits)</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        maxLength={10} 
                                        value={editForm.phoneNumber} 
                                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                        placeholder="10-digit mobile number" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono" 
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Address</label>
                                    <input type="text" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer">Save Changes</button>
                            </div>
                        </form>
                    )}

                </div>
            )}

            {/* ========================================================
                TAB 2: ACADEMIC MARKSHEETS & GRADES
               ======================================================== */}
            {activeTab === 'marksheets' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xs">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                {isHigherEd ? 'Semester Grade Cards & Credits Evaluation' : 'Academic Marksheets & Subject Grades'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isHigherEd ? 'Course codes, credit points, and semester grade performance.' : 'Cumulative subject-level scores and annual progress report.'}
                            </p>
                        </div>
                        
                        {canManageMarks && (
                            <div className="flex flex-wrap items-center gap-2">
                                {!isHigherEd && student?.status === 'Active' && (
                                    student?.currentClass?.includes('12') ? (
                                        <button
                                            onClick={handleOpenPromote}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                                        >
                                            <GraduationCap size={15} /> Graduate Class 12 & Issue TC
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleOpenPromote}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                                        >
                                            <ArrowUpRight size={15} /> Promote to Next Standard
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => setShowAddMarkModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                                >
                                    <Plus size={14} /> Add Grade
                                </button>
                                <button
                                    onClick={() => setShowCsvModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
                                >
                                    <Upload size={14} /> Import CSV
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Summary Metrics Bar */}
                    {marks.length > 0 && (
                        <div className="space-y-3">
                            {!isHigherEd && (
                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-200/80 text-amber-900 border border-amber-300">
                                                Academic Evaluation Desk
                                            </span>
                                            <span className="text-xs font-bold text-amber-950">
                                                {student.previousClass ? `Previous Standard: ${student.previousClass}` : `Standard: ${student.currentClass || 'Class 10'}`}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded self-start sm:self-auto">
                                            Current Status: {student.status === 'Transferred' ? 'Graduated / Discharged (TC Active)' : (student.currentClass || 'Class 10')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                                        <strong>Operator Promotion & Rectification Governance:</strong> Students do not advance automatically. The authorized examination operator evaluates academic performance, rectifies previous records if necessary, and explicitly certifies promotion to the next standard or issues a Transfer Certificate (TC) upon completion of Class 12 for university admission.
                                    </p>
                                </div>
                            )}

                            {student?.tcNumber && (
                                <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
                                        <span className="text-xs font-bold">
                                            Statutory Transfer Certificate Clearance: <span className="font-mono text-emerald-800">{student.tcNumber}</span>
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded self-start sm:self-auto">
                                        Cleared for Higher Education Admission
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {isHigherEd ? (
                                    <>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Accumulated Credits</p>
                                            <p className="text-xl font-black text-slate-900 mt-0.5">{summaryMetrics.totalCredits} / {student.totalCreditsRequired || 160}</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono">Cumulative CGPA</p>
                                            <p className="text-xl font-black text-blue-900 mt-0.5">{student.cgpa || summaryMetrics.cgpa} / 10.0</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Degree Standing</p>
                                            <p className="text-xs font-bold text-emerald-900 mt-1">
                                                {summaryMetrics.totalCredits >= 160 ? 'Degree Completed (Distinction)' : 'Active Good Standing'}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                                                Previous Class ({student.previousClass || (student.currentClass?.includes('11') ? 'Class 10' : student.currentClass?.includes('12') ? 'Class 11' : 'Class 10')}) Aggregate
                                            </p>
                                            <p className="text-xl font-black text-slate-900 mt-0.5">{summaryMetrics.totalMarks} / {summaryMetrics.maxMarks}</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono">Cumulative Percentage</p>
                                            <p className="text-xl font-black text-blue-900 mt-0.5">{summaryMetrics.percentage}%</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Board Division</p>
                                            <p className="text-xs font-bold text-emerald-900 mt-1">
                                                {parseFloat(summaryMetrics.percentage) >= 75 ? 'First Division with Distinction' : 'First Division'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Grades Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-2.5 px-4">{isHigherEd ? 'Semester / Session' : 'Academic Term & Session'}</th>
                                    {!isHigherEd && <th className="py-2.5 px-4">Standard / Class</th>}
                                    <th className="py-2.5 px-4">{isHigherEd ? 'Course Code & Subject Title' : 'Subject Name'}</th>
                                    {!isHigherEd && <th className="py-2.5 px-4 text-center">Theory</th>}
                                    {!isHigherEd && <th className="py-2.5 px-4 text-center">Practical</th>}
                                    <th className="py-2.5 px-4 text-center">{isHigherEd ? 'Grade Point' : 'Total Marks'}</th>
                                    <th className="py-2.5 px-4 text-center">{isHigherEd ? 'Credits' : 'Max Marks'}</th>
                                    <th className="py-2.5 px-4 text-center">Grade</th>
                                    {canManageMarks && <th className="py-2.5 px-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {marks.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-2.5 px-4 font-bold text-slate-900">
                                            {m.semester || m.academicYear}
                                            {(!isHigherEd && (m.academicYear === '2024-2025' || m.isPreviousClass)) && (
                                                <span className="block text-[9px] font-mono text-amber-700 font-normal">
                                                    Concluded Session
                                                </span>
                                            )}
                                        </td>
                                        {!isHigherEd && (
                                            <td className="py-2.5 px-4 font-semibold text-slate-800">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                    {m.classLevel || student.previousClass || (m.academicYear === '2024-2025' ? 'Class 10' : student.currentClass)}
                                                </span>
                                                <span className="block text-[9px] text-slate-500 mt-0.5 font-medium">Previous Class</span>
                                            </td>
                                        )}
                                        <td className="py-2.5 px-4 font-medium text-slate-800">
                                            {m.courseCode ? <span className="font-mono font-bold text-blue-700 mr-1.5">{m.courseCode}</span> : null}
                                            {m.subjectName || m.courseTitle}
                                        </td>
                                        {!isHigherEd && <td className="py-2.5 px-4 text-center text-slate-600 font-mono">{m.theoryMarks ?? '-'}</td>}
                                        {!isHigherEd && <td className="py-2.5 px-4 text-center text-slate-600 font-mono">{m.practicalMarks ?? '-'}</td>}
                                        <td className="py-2.5 px-4 text-center font-bold font-mono text-slate-900">{m.marksObtained}</td>
                                        <td className="py-2.5 px-4 text-center text-slate-500 font-mono">{isHigherEd ? (m.credits || 4) : (m.maxMarks || 100)}</td>
                                        <td className="py-2.5 px-4 text-center">
                                            <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                                {m.grade || m.letterGrade || '-'}
                                            </span>
                                        </td>
                                        {canManageMarks && (
                                            <td className="py-2.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenEditMark(m)}
                                                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                                        title="Rectify grade record"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMark(m._id || m.id)}
                                                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Delete mark entry"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {marks.length === 0 && (
                                    <tr>
                                        <td colSpan={canManageMarks ? 8 : 7} className="py-12 text-center text-slate-400 font-medium">
                                            No academic grade records currently recorded for this student.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}

            {/* ========================================================
                TAB 3: LIFELONG MIGRATION TIMELINE
               ======================================================== */}
            {activeTab === 'timeline' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
                    
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Lifelong Institutional Migration Timeline</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Chronological record of all institutions attended with verified transfer clearances.</p>
                    </div>

                    <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {student.history?.map((h, index) => (
                            <div key={index} className="relative group">
                                
                                <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                                    h.leftYear === 'Present' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-blue-600'
                                }`}></div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                            <Building size={14} className="text-blue-600" />
                                            {h.schoolName}
                                        </h4>
                                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                            {h.joinedYear} &rarr; {h.leftYear}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-600 space-y-1">
                                        {h.leftYear === 'Present' ? (
                                            <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                                                <CheckCircle2 size={13} /> Currently Enrolled & Active in this Institution
                                            </p>
                                        ) : (
                                            <p className="text-slate-600">
                                                Discharged after standard: <strong>{h.lastClass || 'N/A'}</strong> {h.lastBranch ? `(${h.lastBranch})` : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                        <span>Ledger Verified Event &bull; Record #{index + 1}</span>
                                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                            <ShieldCheck size={12} /> TC Clearance Stamp
                                        </span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                </div>
            )}

            {/* ========================================================
                MODAL: ADD GRADE RECORD
               ======================================================== */}
            {showAddMarkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl text-left relative">
                        <button onClick={() => setShowAddMarkModal(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                            <X size={18} />
                        </button>
                        <h3 className="text-base font-bold text-slate-900 mb-4">
                            {isHigherEd ? 'Record Course Grade & Credits' : 'Record Subject Marks & Grade'}
                        </h3>
                        
                        <form onSubmit={handleAddMark} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">{isHigherEd ? 'Academic Semester *' : 'Academic Year / Term *'}</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newMark.academicYear} 
                                    onChange={(e) => setNewMark({...newMark, academicYear: e.target.value})} 
                                    placeholder={isHigherEd ? "e.g. 2024-2025" : "e.g. 2024-2025"} 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                />
                            </div>

                            {isHigherEd ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={newMark.courseCode} 
                                                onChange={(e) => setNewMark({...newMark, courseCode: e.target.value})} 
                                                placeholder="e.g. CS301" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                                            <select 
                                                value={newMark.semester} 
                                                onChange={(e) => setNewMark({...newMark, semester: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            >
                                                {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={newMark.courseTitle} 
                                            onChange={(e) => setNewMark({...newMark, courseTitle: e.target.value})} 
                                            placeholder="e.g. Distributed Computing" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Credits *</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={newMark.credits} 
                                                onChange={(e) => setNewMark({...newMark, credits: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Grade Point *</label>
                                            <input 
                                                type="number" 
                                                step="0.1" 
                                                required 
                                                value={newMark.gradePoint} 
                                                onChange={(e) => setNewMark({...newMark, gradePoint: e.target.value})} 
                                                placeholder="10.0" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Letter Grade</label>
                                            <select 
                                                value={newMark.letterGrade} 
                                                onChange={(e) => setNewMark({...newMark, letterGrade: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            >
                                                <option value="O">O (Outstanding - 10)</option>
                                                <option value="A+">A+ (Excellent - 9)</option>
                                                <option value="A">A (Very Good - 8)</option>
                                                <option value="B+">B+ (Good - 7)</option>
                                                <option value="B">B (Above Average - 6)</option>
                                                <option value="C">C (Pass - 5)</option>
                                                <option value="F">F (Fail - 0)</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={newMark.subjectName} 
                                            onChange={(e) => setNewMark({...newMark, subjectName: e.target.value})} 
                                            placeholder="e.g. Mathematics, Science" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Theory Marks</label>
                                            <input 
                                                type="number" 
                                                value={newMark.theoryMarks} 
                                                onChange={(e) => setNewMark({...newMark, theoryMarks: e.target.value})} 
                                                placeholder="e.g. 74" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Practical Marks</label>
                                            <input 
                                                type="number" 
                                                value={newMark.practicalMarks} 
                                                onChange={(e) => setNewMark({...newMark, practicalMarks: e.target.value})} 
                                                placeholder="e.g. 20" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Total Marks *</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={newMark.marksObtained} 
                                                onChange={(e) => setNewMark({...newMark, marksObtained: e.target.value})} 
                                                placeholder="94" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Max Marks *</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={newMark.maxMarks} 
                                                onChange={(e) => setNewMark({...newMark, maxMarks: e.target.value})} 
                                                placeholder="100" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Grade</label>
                                            <select 
                                                value={newMark.grade} 
                                                onChange={(e) => setNewMark({...newMark, grade: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            >
                                                <option value="A1">A1</option>
                                                <option value="A2">A2</option>
                                                <option value="B1">B1</option>
                                                <option value="B2">B2</option>
                                                <option value="C1">C1</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddMarkModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer">
                                    Save Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL: ISSUE TRANSFER CERTIFICATE (TC)
               ======================================================== */}
            {showTCModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl text-left relative">
                        <button onClick={() => setShowTCModal(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                            <X size={18} />
                        </button>
                        
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                            <ShieldAlert size={24} />
                        </div>

                        <h3 className="text-base font-bold text-slate-900">Issue Statutory Transfer Certificate (TC)</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                            This will discharge the student profile from your institution and set their status to <strong>Transferred</strong>, allowing subsequent institutions to admit them.
                        </p>

                        <form onSubmit={handleIssueTC} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Moral Conduct & Character *</label>
                                <select 
                                    value={tcFields.conduct} 
                                    onChange={(e) => setTcFields({...tcFields, conduct: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                >
                                    <option value="Excellent">Excellent</option>
                                    <option value="Very Good">Very Good</option>
                                    <option value="Good">Good / Satisfactory</option>
                                    <option value="Fair">Fair</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Reason for Leaving *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={tcFields.reasonForLeaving} 
                                    onChange={(e) => setTcFields({...tcFields, reasonForLeaving: e.target.value})} 
                                    placeholder="e.g. Completed Standard / Relocation" 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Official Remarks / Headmaster Note</label>
                                <textarea 
                                    rows={2}
                                    value={tcFields.tcRemarks} 
                                    onChange={(e) => setTcFields({...tcFields, tcRemarks: e.target.value})} 
                                    placeholder="e.g. Diligent student, active in co-curriculars. All dues cleared." 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowTCModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer">
                                    Confirm & Discharge
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL: RECTIFY / EDIT ACADEMIC MARK
               ======================================================== */}
            {showEditMarkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowEditMarkModal(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                            <X size={18} />
                        </button>
                        
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <Edit2 size={24} />
                        </div>

                        <h3 className="text-base font-bold text-slate-900">Rectify Academic Grade Record</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                            Adjust scores, theory/practical breakdown, session, standard, or letter grade for this academic entry.
                        </p>

                        <form onSubmit={handleUpdateMark} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Academic Session *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={editMarkForm.academicYear} 
                                        onChange={(e) => setEditMarkForm({...editMarkForm, academicYear: e.target.value})} 
                                        placeholder="2024-2025" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                                {!isHigherEd ? (
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Standard / Class *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={editMarkForm.classLevel} 
                                            onChange={(e) => setEditMarkForm({...editMarkForm, classLevel: e.target.value})} 
                                            placeholder="e.g. Class 10" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                                        <select 
                                            value={editMarkForm.semester} 
                                            onChange={(e) => setEditMarkForm({...editMarkForm, semester: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        >
                                            {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {isHigherEd ? (
                                <>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                                            <input 
                                                type="text" 
                                                value={editMarkForm.courseCode} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, courseCode: e.target.value})} 
                                                placeholder="e.g. CS501" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={editMarkForm.courseTitle} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, courseTitle: e.target.value, subjectName: e.target.value})} 
                                                placeholder="Course title" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Credits *</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={editMarkForm.credits} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, credits: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Grade Point *</label>
                                            <input 
                                                type="number" 
                                                step="0.1" 
                                                required 
                                                value={editMarkForm.gradePoint} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, gradePoint: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Letter Grade</label>
                                            <select 
                                                value={editMarkForm.letterGrade} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, letterGrade: e.target.value, grade: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            >
                                                <option value="O">O (10)</option>
                                                <option value="A+">A+ (9)</option>
                                                <option value="A">A (8)</option>
                                                <option value="B+">B+ (7)</option>
                                                <option value="B">B (6)</option>
                                                <option value="C">C (5)</option>
                                                <option value="F">F (0)</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={editMarkForm.subjectName} 
                                            onChange={(e) => setEditMarkForm({...editMarkForm, subjectName: e.target.value})} 
                                            placeholder="e.g. Mathematics Standard" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Theory Marks</label>
                                            <input 
                                                type="number" 
                                                value={editMarkForm.theoryMarks} 
                                                onChange={(e) => {
                                                    const theory = e.target.value;
                                                    const prac = editMarkForm.practicalMarks;
                                                    const tot = (parseFloat(theory) || 0) + (parseFloat(prac) || 0);
                                                    setEditMarkForm({
                                                        ...editMarkForm, 
                                                        theoryMarks: theory,
                                                        marksObtained: (theory !== '' || prac !== '') ? String(tot) : editMarkForm.marksObtained
                                                    });
                                                }} 
                                                placeholder="e.g. 75" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Practical Marks</label>
                                            <input 
                                                type="number" 
                                                value={editMarkForm.practicalMarks} 
                                                onChange={(e) => {
                                                    const prac = e.target.value;
                                                    const theory = editMarkForm.theoryMarks;
                                                    const tot = (parseFloat(theory) || 0) + (parseFloat(prac) || 0);
                                                    setEditMarkForm({
                                                        ...editMarkForm, 
                                                        practicalMarks: prac,
                                                        marksObtained: (theory !== '' || prac !== '') ? String(tot) : editMarkForm.marksObtained
                                                    });
                                                }} 
                                                placeholder="e.g. 20" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Total Marks *</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={editMarkForm.marksObtained} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, marksObtained: e.target.value})} 
                                                placeholder="95" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Max Marks *</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={editMarkForm.maxMarks} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, maxMarks: e.target.value})} 
                                                placeholder="100" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Grade</label>
                                            <select 
                                                value={editMarkForm.grade} 
                                                onChange={(e) => setEditMarkForm({...editMarkForm, grade: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                            >
                                                <option value="A1">A1</option>
                                                <option value="A2">A2</option>
                                                <option value="B1">B1</option>
                                                <option value="B2">B2</option>
                                                <option value="C1">C1</option>
                                                <option value="C2">C2</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowEditMarkModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer">
                                    Update Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL: OPERATOR PROMOTION & CLASS 12 GRADUATION
               ======================================================== */}
            {showPromoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowPromoteModal(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                            <X size={18} />
                        </button>

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                            student?.currentClass?.includes('12') ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                            {student?.currentClass?.includes('12') ? <GraduationCap size={24} /> : <ArrowUpRight size={24} />}
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                            {student?.currentClass?.includes('12') 
                                ? 'Senior Secondary (Class 12) Graduation & Transfer TC Issuance' 
                                : 'Promote Student to Next Standard'}
                        </h3>
                        
                        {student?.currentClass?.includes('12') ? (
                            <div className="my-3 p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 space-y-1.5 text-xs">
                                <p className="font-bold flex items-center gap-1.5">
                                    <CheckCircle2 size={15} className="text-emerald-700" />
                                    Statutory Higher Education Eligibility Pathway
                                </p>
                                <p className="leading-relaxed text-emerald-900/90">
                                    Certifying completion of Class 12 automatically marks the student as <strong>Passed</strong>, issues an official <strong>Discharge Transfer Certificate (TC)</strong>, and clears their single-institution lock. This allows any College or University to immediately admit them into degree programs (B.Tech, B.Sc, B.Com, BA, etc.) in the Admissions Hub.
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 mt-1 mb-4">
                                Certify the student's progression to the next academic standard upon successful evaluation of annual examination marks.
                            </p>
                        )}

                        <form onSubmit={handlePromoteStudent} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Current Standard</label>
                                    <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800">
                                        {student?.currentClass || 'Class 10'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        {student?.currentClass?.includes('12') ? 'Target Outcome' : 'Promoted Standard *'}
                                    </label>
                                    {student?.currentClass?.includes('12') ? (
                                        <div className="w-full bg-emerald-100/70 border border-emerald-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-900">
                                            Class 12 Passed (Alumni)
                                        </div>
                                    ) : (
                                        <select 
                                            value={promoteForm.nextClass} 
                                            onChange={(e) => setPromoteForm({...promoteForm, nextClass: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                                        >
                                            {['Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Target Academic Session *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={promoteForm.academicSession} 
                                        onChange={(e) => setPromoteForm({...promoteForm, academicSession: e.target.value})} 
                                        placeholder="2025-2026" 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                                {!student?.currentClass?.includes('12') ? (
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Assigned Section</label>
                                        <select 
                                            value={promoteForm.section} 
                                            onChange={(e) => setPromoteForm({...promoteForm, section: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        >
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                            <option value="C">Section C</option>
                                            <option value="D">Section D</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Moral Conduct & Character *</label>
                                        <select 
                                            value={promoteForm.conduct} 
                                            onChange={(e) => setPromoteForm({...promoteForm, conduct: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                                        >
                                            <option value="Excellent">Excellent</option>
                                            <option value="Very Good">Very Good</option>
                                            <option value="Good">Good / Satisfactory</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Stream selection for 11 & 12 */}
                            {!student?.currentClass?.includes('12') && ['Class 11', 'Class 12'].includes(promoteForm.nextClass) && (
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Academic Stream</label>
                                    <select 
                                        value={promoteForm.stream} 
                                        onChange={(e) => setPromoteForm({...promoteForm, stream: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
                                    >
                                        <option value="Science (PCM)">Science (PCM - Physics, Chemistry, Math)</option>
                                        <option value="Science (PCB)">Science (PCB - Physics, Chemistry, Biology)</option>
                                        <option value="Commerce">Commerce (Accounts, Economics, Business Studies)</option>
                                        <option value="Arts">Humanities / Arts</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    {student?.currentClass?.includes('12') ? 'Graduation & TC Discharge Remarks *' : 'Promotion Assessment Remarks'}
                                </label>
                                <textarea 
                                    rows={3} 
                                    required={student?.currentClass?.includes('12')}
                                    value={promoteForm.remarks} 
                                    onChange={(e) => setPromoteForm({...promoteForm, remarks: e.target.value})} 
                                    placeholder="Enter examination board / desk verification notes..." 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowPromoteModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`px-5 py-2 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 ${
                                        student?.currentClass?.includes('12') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {student?.currentClass?.includes('12') ? (
                                        <>
                                            <GraduationCap size={16} /> Certify Class 12 Passed & Issue TC
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpRight size={16} /> Certify Promotion
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentDetails;
