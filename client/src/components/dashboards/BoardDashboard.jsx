import React, { useState, useEffect } from 'react';
import { 
    Award, Building2, Users, FileText, CheckCircle2, 
    AlertCircle, Search, RefreshCw, Send, Check, X, 
    BookOpen, Layers, ShieldCheck, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import TaskManagementHub from './TaskManagementHub';

const BoardDashboard = ({ stats, user, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'schools' | 'affiliations' | 'candidates' | 'results' | 'verifications' | 'tasks'
    const [schools, setSchools] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [agencyRequests, setAgencyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const boardCode = user?.authorityCode || user?.id || 'CBSE';
    const isCbse = boardCode.includes('CBSE');
    const isUpBoard = boardCode.includes('UP');
    const isCisce = boardCode.includes('CISCE');

    const boardTitle = isCbse 
        ? 'Central Board of Secondary Education (CBSE)'
        : isUpBoard 
            ? 'Uttar Pradesh Madhyamik Shiksha Parishad (UPMSP)'
            : isCisce 
                ? 'Council for the Indian School Certificate Examinations (CISCE)'
                : `${boardCode} Secondary Examination Board`;

    // Sample Affiliation Applications by Board
    const applications = isUpBoard ? [
        { appId: 'AFF-UP-2026-01', schoolName: 'Government Inter College (GIC Lucknow)', code: 'UP-LKO-001', category: 'Intermediate Science Stream Accreditation', status: 'Approved', submittedDate: '2026-01-20' },
        { appId: 'AFF-UP-2026-02', schoolName: 'Varanasi Model Senior Secondary School', code: 'UP-VNS-002', category: 'Vocational High School Wing Addition', status: 'Under Inspection', submittedDate: '2026-02-04' }
    ] : isCisce ? [
        { appId: 'AFF-ICSE-2026-01', schoolName: "St. Xavier's Model High School", code: 'MH042', category: 'ICSE/ISC Permanent Affiliation Renewal', status: 'Approved', submittedDate: '2026-01-10' }
    ] : [
        { appId: 'AFF-2026-8801', schoolName: 'Delhi Public School (DPS Noida)', code: '2130018', category: 'Affiliation Extension (Class 1-12)', status: 'Under Review', submittedDate: '2026-01-15' },
        { appId: 'AFF-2026-8802', schoolName: 'Modern Senior Secondary School', code: '1930211', category: 'Senior Secondary Stream Addition (Commerce)', status: 'Pending Inspection', submittedDate: '2026-02-01' }
    ];

    const fetchBoardData = async () => {
        setLoading(true);
        try {
            const [schoolsRes, studentsRes, agencyRes] = await Promise.all([
                axios.get(`/api/schools?board=${encodeURIComponent(currentBoard)}`),
                axios.get(`/api/students?board=${encodeURIComponent(currentBoard)}`),
                axios.get('/api/agency-requests')
            ]);

            // Filter schools affiliated with this specific board
            const allSchools = schoolsRes.data || [];
            const boardSchools = allSchools.filter(s => {
                const bCode = (s.boardCode || '').toUpperCase();
                const aff = (s.affiliation || '').toLowerCase();
                const name = (s.name || '').toLowerCase();
                if (isCbse) return bCode === 'CBSE' || aff.includes('cbse') || name.includes('cbse') || name.includes('kendriya');
                if (isUpBoard) return bCode === 'UP-BOARD' || aff.includes('up') || aff.includes('upmsp') || name.includes('gic') || name.includes('varanasi');
                if (isCisce) return bCode === 'CISCE' || aff.includes('icse') || aff.includes('cisce') || name.includes('xavier');
                return true;
            });
            setSchools(boardSchools);

            // Filter students enrolled in this board's schools
            const allStudents = studentsRes.data || [];
            const boardSchoolIds = new Set(boardSchools.map(s => s._id));
            const boardStudents = allStudents.filter(s => boardSchoolIds.has(s.currentSchoolId));
            setCandidates(boardStudents);

            setAgencyRequests(agencyRes.data || []);
        } catch (err) {
            console.error("Failed to load board data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardData();
    }, [boardCode]);

    return (
        <div className="space-y-6 text-left">
            
            {/* Board Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Tier 3 &bull; Statutory Examination Authority
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                            Board Code: {boardCode}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                        {boardTitle} &mdash; Independent Examination Portal
                    </h1>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Statutory examination portal managing affiliated institution accreditations, candidate examination registrations, digital marksheet publications, and academic verification requests.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'Board Overview', icon: Award },
                    { id: 'schools', label: 'Affiliated Institutions', icon: Building2, badge: schools.length },
                    { id: 'affiliations', label: 'Affiliation Applications', icon: FileText, badge: applications.length },
                    { id: 'candidates', label: 'Candidate Records', icon: Users, badge: candidates.length },
                    { id: 'verifications', label: 'Third-Party Verifications', icon: ShieldCheck, badge: agencyRequests.filter(r => r.status === 'Pending').length },
                    { id: 'tasks', label: 'Pending Approvals', icon: CheckCircle2 }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                                isActive
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
                            }`}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                            {tab.badge > 0 && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                    isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Top KPI Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-blue-800">Affiliated Institutions</span>
                            <p className="text-2xl font-black text-blue-950 mt-1">{schools.length}</p>
                            <p className="text-[11px] text-blue-700 mt-0.5">Under {boardCode} Jurisdiction</p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Registered Candidates</span>
                            <p className="text-2xl font-black text-slate-900 mt-1">{candidates.length}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Active Class 10 & 12 Cohorts</p>
                        </div>
                        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-purple-800">Pending Affiliation Reviews</span>
                            <p className="text-2xl font-black text-purple-950 mt-1">{applications.length}</p>
                            <p className="text-[11px] text-purple-700 mt-0.5">School Extension Applications</p>
                        </div>
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Third-Party BGV Requests</span>
                            <p className="text-2xl font-black text-emerald-900 mt-1">{agencyRequests.length}</p>
                            <p className="text-[11px] text-emerald-800 mt-0.5">Employer / Embassy Verifications</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-blue-600" />
                            Statutory Scope: Board-Specific Jurisdiction
                        </p>
                        <p className="leading-relaxed">
                            Each education board operates autonomously. {boardTitle} manages only its own affiliated institutions, curriculum roll numbers, and examination results without mixing records from other national or state boards.
                        </p>
                    </div>

                    <TaskManagementHub tier="board" assignedTo={boardCode} title={`${boardCode} Examination Directives & Approvals`} />
                </div>
            )}

            {/* TAB 2: AFFILIATED SCHOOLS */}
            {activeTab === 'schools' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Board Registry</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Affiliated Schools ({schools.length})</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">School Name</th>
                                    <th className="py-3 px-4">UDISE+ Code</th>
                                    <th className="py-3 px-4">Statutory Affiliation #</th>
                                    <th className="py-3 px-4">Region</th>
                                    <th className="py-3 px-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {schools.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-800">{s._id}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{s.affiliation}</td>
                                        <td className="py-3.5 px-4 text-slate-500">{s.region}</td>
                                        <td className="py-3.5 px-4 text-right">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                Accredited
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: AFFILIATION APPLICATIONS */}
            {activeTab === 'affiliations' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Accreditation Desk</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Affiliation & Extension Applications</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {applications.map((app) => (
                            <div key={app.appId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                            {app.appId}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                                            {app.status}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-900">{app.schoolName} (Code #{app.code})</h4>
                                    <p className="text-[11px] text-slate-600">{app.category}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => alert(`Affiliation Inspection report generated for ${app.schoolName}`)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                                    >
                                        Inspect Documents
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: CANDIDATE RECORDS */}
            {activeTab === 'candidates' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Examination Roll Gazette</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Enrolled Board Candidates</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{candidates.length} Registered Candidates</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Candidate Name</th>
                                    <th className="py-3 px-4">USI / APAAR ID</th>
                                    <th className="py-3 px-4">Board Roll #</th>
                                    <th className="py-3 px-4">Class & Stream</th>
                                    <th className="py-3 px-4">Enrolled School</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {candidates.map((c) => (
                                    <tr key={c.uniqueId} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-800">{c.uniqueId}</td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{c.boardRollNumber || `BR-${c.uniqueId.slice(-6)}`}</td>
                                        <td className="py-3.5 px-4 font-medium text-slate-700">{c.currentClass} ({c.stream})</td>
                                        <td className="py-3.5 px-4 text-slate-500">{c.currentSchoolName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: THIRD-PARTY VERIFICATIONS */}
            {activeTab === 'verifications' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Employer & Background Verification</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Third-Party Verification Requests</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {agencyRequests.map((req) => (
                            <div key={req.requestId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                            {req.requestId}
                                        </span>
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-900">{req.agencyName}</h4>
                                    <p className="text-[11px] text-slate-600">Candidate: <strong>{req.studentName}</strong> (ID: {req.studentId})</p>
                                    <p className="text-[10px] text-slate-400 font-mono">Purpose: {req.purpose}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => alert(`Official clearance certificate issued for ${req.studentName}`)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                    >
                                        <Check size={12} /> Issue Clearance
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 6: TASKS */}
            {activeTab === 'tasks' && (
                <TaskManagementHub tier="board" assignedTo={boardCode} title={`${boardCode} Directives & Approvals`} />
            )}

        </div>
    );
};

export default BoardDashboard;

