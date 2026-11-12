import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    School, Building2, Landmark, GraduationCap, Users, 
    ArrowRightLeft, FileText, CheckCircle2, AlertCircle, 
    KeyRound, RefreshCw, Award, BookOpen, Layers, 
    Clock, ShieldCheck, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import TaskManagementHub from './TaskManagementHub';

const InstitutionDashboard = ({ stats, user, onRefresh }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const instId = user?.schoolId || user?.institutionId || user?.id;
    const instName = user?.name?.replace(' (Master Admin)', '') || 'Educational Institution';
    
    // Detect type
    const isUniv = user?.tier === 'university' || instId?.startsWith('UNIV') || instId?.startsWith('IIT') || instName.toLowerCase().includes('university') || instName.toLowerCase().includes('technology');
    const isCollege = user?.tier === 'college' || instId?.startsWith('CLG') || instId?.startsWith('COL') || (instName.toLowerCase().includes('college') && !instName.toLowerCase().includes('inter college'));
    const isSchool = !isUniv && !isCollege;

    const instType = isUniv ? 'university' : (isCollege ? 'college' : 'school');

    const isMaster = user?.isMaster !== false;
    const assignedOps = user?.assignedOperations || (isMaster ? ['admissions', 'students', 'transfers', 'marks', 'tasks', 'operators'] : ['students', 'tasks']);
    const hasAdmissions = isMaster || assignedOps.includes('admissions') || assignedOps.includes('transfers');
    const hasStudents = isMaster || assignedOps.includes('students');

    const typeDetails = isUniv ? {
        title: 'Apex University / Research Institute',
        badge: 'AISHE-U & UGC Apex',
        codePrefix: 'AISHE-U',
        rosterTitle: 'University Scholar Registry',
        curriculumLabel: 'Faculties & Academic Programs',
        transferTerm: 'Degree Charters & Migration Certificates',
        studentTerm: 'Undergraduate & Postgraduate Scholars'
    } : isCollege ? {
        title: 'Undergraduate Degree College',
        badge: 'AISHE-C & UGC Affiliated',
        codePrefix: 'AISHE-C',
        rosterTitle: 'College Enrolment Roster',
        curriculumLabel: 'Departments & Degree Majors',
        transferTerm: 'Degree Migration & ABC Credit Portability',
        studentTerm: 'Undergraduate Degree Students'
    } : {
        title: 'Secondary / Senior Secondary School',
        badge: 'UDISE+ & Board Affiliated',
        codePrefix: 'UDISE+',
        rosterTitle: 'Class 1-12 Student Roster',
        curriculumLabel: 'Classes 1-12 & Academic Streams',
        transferTerm: 'Digital Transfer Certificates (TCs)',
        studentTerm: 'K-12 School Pupils'
    };

    const fetchInstitutionData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/schools/${instId}/students`);
            setStudents(res.data || []);
        } catch (err) {
            console.error("Failed to fetch institution students", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (instId) {
            fetchInstitutionData();
        }
    }, [instId]);

    const activeCount = students.filter(s => s.status === 'Active').length;
    const transferredCount = students.filter(s => s.status === 'Transferred').length;

    return (
        <div className="space-y-6 text-left">
            
            {/* Institution Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isUniv 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : isCollege
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                            Tier 4 &bull; {typeDetails.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                            Statutory ID: {instId}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                        {instName}
                    </h1>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Dedicated institutional administrative console. Managing {typeDetails.studentTerm.toLowerCase()}, continuous evaluations, academic marksheets, single-seat seat locks, and {typeDetails.transferTerm.toLowerCase()}.
                    </p>
                </div>
            </div>

            {/* Sub-Desk Operator Active Session Notice */}
            {!isMaster && (
                <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-white">{user?.name}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] border border-blue-500/30 font-bold">
                                    {user?.operatorId}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                    Sub-Desk Operator
                                </span>
                            </div>
                            <p className="text-slate-300 text-[11px] mt-0.5">
                                Assigned Desk Role: <strong>{user?.deskRole || 'Operational Staff'}</strong>. Universal access is restricted to Master Admin.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
                        <span className="text-[10px] font-mono text-slate-400 mr-1">Permitted Operations:</span>
                        {assignedOps.map((op) => (
                            <span key={op} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-[10px] font-bold">
                                ✓ {op.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hasAdmissions ? (
                    <Link
                        to="/dashboard/admissions"
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                                <ArrowRightLeft size={16} />
                            </span>
                            <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-900">
                                {isSchool ? 'Admissions & TC Hub' : 'Admissions & Migration'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                                {isSchool ? 'Class 1-12 Single-Seat Lock' : 'Semester & ABC Admission'}
                            </p>
                        </div>
                    </Link>
                ) : (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 opacity-60 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-slate-200 text-slate-500">
                                <ArrowRightLeft size={16} />
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Locked</span>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-700">Admissions & TC</p>
                            <p className="text-[10px] text-slate-400">Desk Permission Required</p>
                        </div>
                    </div>
                )}

                {hasStudents ? (
                    <Link
                        to="/dashboard/students"
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-purple-50 text-purple-700">
                                <Users size={16} />
                            </span>
                            <ArrowRight size={13} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-900">{typeDetails.rosterTitle}</p>
                            <p className="text-[10px] text-slate-500">{students.length} Enrolled Profiles</p>
                        </div>
                    </Link>
                ) : (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 opacity-60 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-slate-200 text-slate-500">
                                <Users size={16} />
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Locked</span>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-700">{typeDetails.rosterTitle}</p>
                            <p className="text-[10px] text-slate-400">Desk Permission Required</p>
                        </div>
                    </div>
                )}

                {isMaster ? (
                    <Link
                        to="/dashboard/schoolProfile"
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                                {isUniv ? <Landmark size={16} /> : isCollege ? <GraduationCap size={16} /> : <School size={16} />}
                            </span>
                            <ArrowRight size={13} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-900">Institution Charter & Profile</p>
                            <p className="text-[10px] text-slate-500">Official Seal & Accreditation</p>
                        </div>
                    </Link>
                ) : (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 opacity-60 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-slate-200 text-slate-500">
                                <School size={16} />
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Master Only</span>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-700">Institution Charter</p>
                            <p className="text-[10px] text-slate-400">Master Authority Only</p>
                        </div>
                    </div>
                )}

                {isMaster ? (
                    <Link
                        to="/dashboard/operators"
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                                <KeyRound size={16} />
                            </span>
                            <ArrowRight size={13} className="text-slate-300 group-hover:text-amber-600 transition-colors" />
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-900">Desk Operators & Passkeys</p>
                            <p className="text-[10px] text-slate-500">Universal Access Console</p>
                        </div>
                    </Link>
                ) : (
                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="p-2 rounded-lg bg-blue-100 text-blue-700">
                                <KeyRound size={16} />
                            </span>
                            <span className="text-[9px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold uppercase">
                                Sub-Desk
                            </span>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-900 truncate">{user?.deskRole || 'Assigned Desk'}</p>
                            <p className="text-[10px] text-blue-700 font-mono">Role-Scoped Operator</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Institution Specific Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Active Learners</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{activeCount}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Currently Enrolled & Attending</p>
                </div>
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-800">Transferred Out / Discharged</span>
                    <p className="text-2xl font-black text-purple-950 mt-1">{transferredCount}</p>
                    <p className="text-[11px] text-purple-700 mt-0.5">Counter-Signed TCs Issued</p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Single-Seat Compliance</span>
                    <p className="text-2xl font-black text-emerald-900 mt-1">100.0%</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">Zero Ghost Single-Active Enrolment</p>
                </div>
            </div>

            {/* Recent Enrolled Learners Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Institutional Register</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">Recently Active Enrolments</h3>
                    </div>
                    <Link
                        to="/dashboard/students"
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 font-mono"
                    >
                        View Full Roster <ArrowRight size={12} />
                    </Link>
                </div>

                {students.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-medium text-xs">
                        No students currently registered under this institution node.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-2.5 px-3">Student Name</th>
                                    <th className="py-2.5 px-3">USI / APAAR ID</th>
                                    <th className="py-2.5 px-3">{isSchool ? 'Class & Stream' : 'Degree & Semester'}</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Ledger View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.slice(0, 6).map((s) => (
                                    <tr key={s.uniqueId} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                                        <td className="py-3 px-3 font-mono font-bold text-blue-800">{s.uniqueId}</td>
                                        <td className="py-3 px-3 text-slate-700 font-medium">
                                            {isSchool ? `${s.currentClass || 'General'} (${s.stream || 'A'})` : `${s.degree || s.qualification || 'UG'} - ${s.semester || 'Semester 1'}`}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                                s.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <Link
                                                to={`/dashboard/student/${s.uniqueId}`}
                                                className="text-blue-700 hover:text-blue-900 font-bold text-[11px] font-mono hover:underline"
                                            >
                                                Open Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Institution Tasks */}
            <TaskManagementHub tier={instType} assignedTo={instId} title="Institutional Action Items & Submissions" />

        </div>
    );
};

export default InstitutionDashboard;

