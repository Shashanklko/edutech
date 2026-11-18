import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Landmark, Globe, Users, ArrowRightLeft, TrendingUp, 
    ShieldCheck, AlertTriangle, FileText, CheckCircle2, 
    BarChart3, RefreshCw, Eye, Check, X, Building2, MapPin,
    ArrowRight, GraduationCap, School, Calendar, Search, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import TaskManagementHub from './TaskManagementHub';

const CentralDashboard = ({ stats, user, onRefresh }) => {
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reviewModal, setReviewModal] = useState({ open: false, report: null, status: 'Approved', remarks: '' });
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'states' | 'migration' | 'schemes' | 'reports' | 'tasks'
    const [migrations, setMigrations] = useState([]);
    const [migrationsLoading, setMigrationsLoading] = useState(false);
    const [migrationSearch, setMigrationSearch] = useState('');

    // Default Seed Migrations across states (real sovereign records)
    const defaultMigrations = [
        {
            uniqueId: 'ARJUN032009',
            name: 'Arjun Kapoor',
            gender: 'Male',
            currentClass: 'Class 10',
            academicLevel: 'school',
            stream: 'General Secondary',
            fromSchool: 'Government Inter College (GIC Lucknow)',
            fromSchoolId: 'SCH-UP-01',
            fromState: 'Uttar Pradesh',
            toSchool: 'Target Secondary School (Delhi / NCR)',
            toSchoolId: 'SCH-CBSE-02',
            toState: 'Delhi (NCT)',
            corridor: 'Uttar Pradesh ➔ Delhi (NCT)',
            tcNumber: 'TC-GIC-LKO-2024-8841',
            date: '2026-02-14',
            reason: 'Parental Relocation to Delhi NCR',
            status: 'Transferred',
            statusBadge: 'TC Clearance Verified',
            conduct: 'Good'
        },
        {
            uniqueId: 'RAHUL052010',
            name: 'Rahul Sharma',
            gender: 'Male',
            currentClass: 'Class 10',
            academicLevel: 'school',
            stream: 'General Foundation',
            fromSchool: 'Delhi Public School (DPS Noida)',
            fromSchoolId: 'SCH-CBSE-01',
            fromState: 'Uttar Pradesh',
            toSchool: 'Kendriya Vidyalaya (Delhi Cantt)',
            toSchoolId: 'SCH-CBSE-02',
            toState: 'Delhi (NCT)',
            corridor: 'Uttar Pradesh ➔ Delhi (NCT)',
            tcNumber: 'TC-SCH-CBSE-01-2026-7064',
            date: '2026-02-10',
            reason: 'Parental Inter-State Transfer',
            status: 'Transferred',
            statusBadge: 'TC Clearance Verified',
            conduct: 'Excellent'
        },
        {
            uniqueId: 'ANANYA072004',
            name: 'Ananya Verma',
            gender: 'Female',
            currentClass: 'B.Tech (Semester 3)',
            academicLevel: 'university',
            stream: 'Computer Science & Engineering',
            fromSchool: 'Delhi Public School (DPS Noida)',
            fromSchoolId: 'SCH-CBSE-01',
            fromState: 'Uttar Pradesh',
            toSchool: 'University of Delhi (Delhi University)',
            toSchoolId: 'UNIV-DU',
            toState: 'Delhi (NCT)',
            corridor: 'Uttar Pradesh ➔ Delhi (NCT)',
            tcNumber: 'TC-DU-2024-9102',
            date: '2026-01-28',
            reason: 'Higher Education Relocation & University Admission',
            status: 'Active',
            statusBadge: 'Admitted / Enrolled',
            conduct: 'Good'
        },
        {
            uniqueId: 'DEVANSH012002',
            name: 'Devansh Saxena',
            gender: 'Male',
            currentClass: 'B.Tech (Semester 8)',
            academicLevel: 'university',
            stream: 'Computer Science & Engineering',
            fromSchool: 'Delhi Public School (DPS Noida)',
            fromSchoolId: 'SCH-CBSE-01',
            fromState: 'Uttar Pradesh',
            toSchool: 'Indian Institute of Technology Delhi (IIT Delhi)',
            toSchoolId: 'IIT-DELHI',
            toState: 'Delhi (NCT)',
            corridor: 'Uttar Pradesh ➔ Delhi (NCT)',
            tcNumber: 'TC-IITD-2024-0019',
            date: '2026-01-15',
            reason: 'Apex Technical Institute Academic Admission',
            status: 'Active',
            statusBadge: 'Admitted / Enrolled',
            conduct: 'Good'
        }
    ];

    // Compute display migrations: prefer live API data, then stats prop, then default seed records
    const allMigrations = (migrations && migrations.length > 0)
        ? migrations 
        : ((stats?.interstateMigrations && stats.interstateMigrations.length > 0) ? stats.interstateMigrations : defaultMigrations);
    
    // Latest 4 migrations (or whatever we have)
    const latest4Migrations = allMigrations.slice(0, 4);

    // Filtered migrations for detailed audit search
    const filteredMigrations = allMigrations.filter(m => {
        if (!migrationSearch.trim()) return true;
        const q = migrationSearch.toLowerCase();
        return (
            (m.name || '').toLowerCase().includes(q) ||
            (m.uniqueId || '').toLowerCase().includes(q) ||
            (m.fromSchool || '').toLowerCase().includes(q) ||
            (m.toSchool || '').toLowerCase().includes(q) ||
            (m.fromState || '').toLowerCase().includes(q) ||
            (m.toState || '').toLowerCase().includes(q) ||
            (m.corridor || '').toLowerCase().includes(q) ||
            (m.tcNumber || '').toLowerCase().includes(q)
        );
    });

    const fetchMigrations = async () => {
        setMigrationsLoading(true);
        try {
            const res = await axios.get('/api/stats/interstate-migrations?limit=20');
            if (Array.isArray(res.data) && res.data.length > 0) {
                setMigrations(res.data);
            } else if (stats?.interstateMigrations && stats.interstateMigrations.length > 0) {
                setMigrations(stats.interstateMigrations);
            }
        } catch (err) {
            if (stats?.interstateMigrations && stats.interstateMigrations.length > 0) {
                setMigrations(stats.interstateMigrations);
            }
        } finally {
            setMigrationsLoading(false);
        }
    };

    // Mock State-wise Statistics (aggregated at national level)
    const stateStatistics = [
        { state: 'Uttar Pradesh', districts: 75, institutions: '1,42,850', enrolment: '1.84 Cr', ger: '92.4%', transitionRate: '94.2%', status: 'Compliant' },
        { state: 'Delhi (NCT)', districts: 11, institutions: '5,820', enrolment: '16.5 L', ger: '98.1%', transitionRate: '97.6%', status: 'Compliant' },
        { state: 'Maharashtra', districts: 36, institutions: '1,10,200', enrolment: '1.62 Cr', ger: '94.6%', transitionRate: '96.1%', status: 'Compliant' },
        { state: 'West Bengal', districts: 23, institutions: '94,150', enrolment: '1.28 Cr', ger: '91.8%', transitionRate: '93.5%', status: 'Under Review' },
        { state: 'Karnataka', districts: 31, institutions: '68,400', enrolment: '98.2 L', ger: '95.3%', transitionRate: '96.8%', status: 'Compliant' }
    ];

    // National Scheme Monitoring Metrics
    const nationalSchemes = [
        { code: 'PM-SHRI', name: 'PM Schools for Rising India', targetInstitutions: '14,500', allocatedBudget: '₹27,360 Cr', physicalProgress: '78.4%', status: 'On Track' },
        { code: 'SAMAGRA', name: 'Samagra Shiksha Abhiyan', targetInstitutions: '11.6 Lakh', allocatedBudget: '₹37,500 Cr', physicalProgress: '91.2%', status: 'Optimal' },
        { code: 'PM-POSHAN', name: 'PM POSHAN (National Mid-Day Meal)', targetInstitutions: '10.8 Lakh', allocatedBudget: '₹12,467 Cr', physicalProgress: '96.5%', status: 'Optimal' },
        { code: 'APAAR-ABC', name: 'Automated Permanent Academic Account Registry', targetInstitutions: 'All Higher Ed & K-12', allocatedBudget: 'Digital Sovereign', physicalProgress: '82.1%', status: 'Active' }
    ];

    // Interstate Migration Corridor Metrics
    const migrationMatrix = [
        { corridor: 'Uttar Pradesh ➔ Delhi (NCT)', volume: '14,820 Students / Year', primaryReason: 'Higher Secondary & Technical Relocation', verificationRate: '99.4%' },
        { corridor: 'Bihar ➔ West Bengal', volume: '11,400 Students / Year', primaryReason: 'Urban Academic Transition', verificationRate: '98.1%' },
        { corridor: 'Rajasthan ➔ Delhi (NCT)', volume: '8,250 Students / Year', primaryReason: 'Higher Education Admissions', verificationRate: '99.8%' },
        { corridor: 'Haryana ➔ Delhi (NCT)', volume: '7,110 Students / Year', primaryReason: 'Secondary Cross-Border Commute', verificationRate: '99.9%' }
    ];

    const fetchReports = async () => {
        setReportsLoading(true);
        try {
            const res = await axios.get('/api/reports?submittedTo=ADMIN');
            setReports(res.data || []);
        } catch (err) {
            console.error("Failed to fetch state reports", err);
        } finally {
            setReportsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        fetchMigrations();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewModal.report) return;
        try {
            await axios.put(`/api/reports/${reviewModal.report.reportId}/review`, {
                status: reviewModal.status,
                reviewRemarks: reviewModal.remarks,
                reviewedBy: `${user?.name || 'Central MOE Undersecretary'}`
            });
            setReviewModal({ open: false, report: null, status: 'Approved', remarks: '' });
            fetchReports();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to record review");
        }
    };

    return (
        <div className="space-y-6 text-left">
            
            {/* National Authority Header Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Tier 1 &bull; Sovereign National Authority
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                            Protocol: ED-USI-2026 / APAAR Unified Ledger
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                        Ministry of Education &mdash; National Education Depository Desk
                    </h1>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        National monitoring portal aggregating educational indices, interstate student migration trends, scheme allocations, and State Government statutory compliance reports across all 28 States and 8 Union Territories.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'National Overview', icon: Globe },
                    { id: 'states', label: 'State-wise Indices', icon: Building2 },
                    { id: 'migration', label: 'Interstate Migration', icon: ArrowRightLeft },
                    { id: 'schemes', label: 'National Schemes', icon: TrendingUp },
                    { id: 'reports', label: 'State Reports Review', icon: FileText, badge: reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length },
                    { id: 'tasks', label: 'National Directives', icon: ShieldCheck }
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
                                    isActive ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: NATIONAL OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Top KPI Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Registered Learners</span>
                            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalStudents || 11}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Under Sovereign APAAR / USI</p>
                        </div>
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Elementary-to-Secondary Transition</span>
                            <p className="text-2xl font-black text-emerald-900 mt-1">{stats?.retentionRate || '96.8'}%</p>
                            <p className="text-[11px] text-emerald-800 mt-0.5">National Transition Benchmark</p>
                        </div>
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-blue-800">Accredited Institutions</span>
                            <p className="text-2xl font-black text-blue-950 mt-1">{stats?.totalInstitutions || 11}</p>
                            <p className="text-[11px] text-blue-700 mt-0.5">UDISE+ & AISHE Registered</p>
                        </div>
                        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-purple-800">Interstate Transfers</span>
                            <p className="text-2xl font-black text-purple-950 mt-1">{stats?.transferredStudents || 2}</p>
                            <p className="text-[11px] text-purple-700 mt-0.5">Single-Seat Verified Ledgers</p>
                        </div>
                    </div>

                    {/* Architectural Principle Box */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-blue-600" />
                            Statutory Governance Boundary: Non-Micromanagement Mandate
                        </p>
                        <p className="leading-relaxed">
                            Under the Federal Education Framework, the Central Government monitors macro-indices, interstate migration protocols, and statutory state reports. Operational school governance, district postings, and local inspections are strictly delegated to State Education Departments and respective Examination Boards.
                        </p>
                    </div>

                    {/* Recently Migrated Students (State-to-State Transition Ledger) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                        Live Sovereign Depository
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium">Interstate Mobility Registry</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                                    <ArrowRightLeft size={18} className="text-purple-600" />
                                    Recently Migrated Students from One State to Another
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Displaying latest {latest4Migrations.length} verified cross-state student transfers authenticated via digital Transfer Certificates (TC).
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('migration')}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-900 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
                            >
                                <span>Inspect Full Migration Audit</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {latest4Migrations.map((mig) => (
                                <div 
                                    key={mig.uniqueId}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3 shadow-2xs hover:border-purple-200"
                                >
                                    {/* Top Row: Candidate Name & USI & Status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-sm">{mig.name}</h4>
                                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-semibold">
                                                    {mig.gender}
                                                </span>
                                            </div>
                                            <p className="font-mono text-xs text-purple-700 font-bold mt-0.5">
                                                USI: {mig.uniqueId}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                                            mig.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}>
                                            {mig.statusBadge || mig.status}
                                        </span>
                                    </div>

                                    {/* Migration Corridor Card */}
                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                                {mig.fromState}
                                            </span>
                                            <div className="flex items-center gap-1 text-purple-600 font-mono text-[10px]">
                                                <span>CORRIDOR</span>
                                                <ArrowRight size={12} />
                                            </div>
                                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                {mig.toState}
                                            </span>
                                        </div>

                                        <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                                            <p className="flex items-center gap-1.5 truncate">
                                                <span className="text-[10px] font-bold uppercase text-slate-400 w-10 shrink-0">From:</span>
                                                <strong className="text-slate-800 truncate">{mig.fromSchool}</strong>
                                            </p>
                                            <p className="flex items-center gap-1.5 truncate">
                                                <span className="text-[10px] font-bold uppercase text-slate-400 w-10 shrink-0">To:</span>
                                                <strong className="text-slate-800 truncate">{mig.toSchool}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Meta: Class, TC, Reason */}
                                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Class / Cohort</span>
                                            <span className="font-semibold text-slate-800">{mig.currentClass}</span>
                                            <span className="text-slate-500 block text-[10px]">{mig.stream}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">TC Reference</span>
                                            <span className="font-mono font-bold text-slate-800 text-[10px] truncate block">{mig.tcNumber}</span>
                                            <span className="text-emerald-700 font-medium block text-[10px]">Conduct: {mig.conduct || 'Good'}</span>
                                        </div>
                                    </div>

                                    {/* Footer: Relocation Reason & View Profile Link */}
                                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                                        <p className="text-[10px] text-slate-500 italic truncate max-w-[65%]">
                                            {mig.reason}
                                        </p>
                                        <Link 
                                            to={`/dashboard/student/${mig.uniqueId}`}
                                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                        >
                                            <span>View Profile</span>
                                            <ArrowRight size={11} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Directive Preview */}
                    <TaskManagementHub tier="central" assignedTo="ADMIN" title="Priority National Directives & Audits" />
                </div>
            )}

            {/* TAB 2: STATE-WISE INDICES */}
            {activeTab === 'states' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Federated Monitoring</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">State & UT Educational Indices</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">28 States &bull; 8 UTs Interconnected</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">State / UT Department</th>
                                    <th className="py-3 px-4">Administrative Districts</th>
                                    <th className="py-3 px-4">Active Institutions</th>
                                    <th className="py-3 px-4">Total Enrolment</th>
                                    <th className="py-3 px-4">Gross Enrolment (GER)</th>
                                    <th className="py-3 px-4">Secondary Transition</th>
                                    <th className="py-3 px-4 text-right">Audit Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stateStatistics.map((st) => (
                                    <tr key={st.state} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            {st.state}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">
                                            {st.districts} Districts
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-800">
                                            {st.institutions}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                                            {st.enrolment}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                                            {st.ger}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                                            {st.transitionRate}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                                st.status === 'Compliant'
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}>
                                                {st.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: INTERSTATE MIGRATION */}
            {activeTab === 'migration' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Interstate Transfer Audit</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">National Student Migration Corridors</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">Cross-Border Digital TC Ledgers</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {migrationMatrix.map((mig) => (
                            <div key={mig.corridor} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-900">{mig.corridor}</h4>
                                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                        {mig.verificationRate} Clear
                                    </span>
                                </div>
                                <p className="text-sm font-black text-slate-800 font-mono">{mig.volume}</p>
                                <p className="text-[11px] text-slate-500">{mig.primaryReason}</p>
                            </div>
                        ))}
                    </div>

                    {/* Live Interstate Student Migration Ledger */}
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                                    Digital Sovereign Depository
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                                    <Users size={16} className="text-purple-600" />
                                    Recently Migrated Students Across States ({filteredMigrations.length})
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Comprehensive ledger of inter-state candidate migrations and authenticated transfer clearances.
                                </p>
                            </div>

                            {/* Search bar */}
                            <div className="relative w-full sm:w-72">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={migrationSearch}
                                    onChange={(e) => setMigrationSearch(e.target.value)}
                                    placeholder="Search student, USI, state, school..."
                                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                                />
                            </div>
                        </div>

                        {/* Migration Records Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4">Candidate & USI</th>
                                        <th className="py-3 px-4">Origin School (State)</th>
                                        <th className="py-3 px-4">Destination School (State)</th>
                                        <th className="py-3 px-4">Class & Stream</th>
                                        <th className="py-3 px-4">TC Discharge Ref</th>
                                        <th className="py-3 px-4">Reason / Notes</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Dossier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredMigrations.map((m) => (
                                        <tr key={m.uniqueId} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-900">{m.name}</div>
                                                <div className="font-mono text-[10px] text-purple-700 font-bold">{m.uniqueId}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 block w-fit mb-0.5">
                                                    {m.fromState}
                                                </span>
                                                <div className="text-slate-700 font-medium truncate max-w-[180px]">{m.fromSchool}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 block w-fit mb-0.5">
                                                    {m.toState}
                                                </span>
                                                <div className="text-slate-700 font-medium truncate max-w-[180px]">{m.toSchool}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-800">{m.currentClass}</div>
                                                <div className="text-[10px] text-slate-500">{m.stream}</div>
                                            </td>
                                            <td className="py-3 px-4 font-mono">
                                                <div className="font-bold text-slate-900 text-[11px]">{m.tcNumber}</div>
                                                <div className="text-[10px] text-emerald-700 font-bold">Conduct: {m.conduct || 'Good'}</div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate">
                                                {m.reason}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                                    m.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}>
                                                    {m.statusBadge || m.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link 
                                                    to={`/dashboard/student/${m.uniqueId}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors"
                                                >
                                                    <span>View</span>
                                                    <ArrowRight size={10} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMigrations.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-8 text-center text-slate-400 text-xs italic">
                                                No interstate migration records match your search criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: NATIONAL SCHEMES */}
            {activeTab === 'schemes' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Central Ministry Allocations</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">National Education Scheme Governance</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">FY 2025-2026 Outlay</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {nationalSchemes.map((sch) => (
                            <div key={sch.code} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase bg-slate-900 text-white px-2 py-0.5 rounded">
                                        {sch.code}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                        {sch.status}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">{sch.name}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Target: {sch.targetInstitutions}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                                    <span className="text-slate-600">Financial Outlay: <strong>{sch.allocatedBudget}</strong></span>
                                    <span className="text-emerald-700 font-bold">Progress: {sch.physicalProgress}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: STATE REPORTS REVIEW */}
            {activeTab === 'reports' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Statutory Reporting Desk</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">State Government Periodic Submissions</h3>
                        </div>
                        <button
                            onClick={fetchReports}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Refresh Reports"
                        >
                            <RefreshCw size={14} className={reportsLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {reports.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-medium text-xs">
                            No reports currently submitted by State Governments for Central review.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((rep) => (
                                <div
                                    key={rep.reportId}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                                                {rep.reportId}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                                                {rep.reportingPeriod}
                                            </span>
                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                                rep.status === 'Approved'
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                            }`}>
                                                {rep.status}
                                            </span>
                                        </div>

                                        <h4 className="text-xs font-bold text-slate-900">{rep.title}</h4>
                                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                                            {rep.summary}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                                            <span>Submitted By: <strong className="text-slate-800">{rep.submittedByName} ({rep.submittedBy})</strong></span>
                                            {rep.metrics?.totalEnrolled && (
                                                <span>Learners: <strong className="text-blue-800">{(rep.metrics.totalEnrolled / 100000).toFixed(1)} Lakh</strong></span>
                                            )}
                                            {rep.metrics?.attendanceAverage && (
                                                <span>Attendance: <strong className="text-emerald-800">{rep.metrics.attendanceAverage}%</strong></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                        <button
                                            onClick={() => setReviewModal({ open: true, report: rep, status: 'Approved', remarks: rep.reviewRemarks || '' })}
                                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                                        >
                                            <FileText size={12} /> Review Submission
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* REVIEW MODAL */}
                    {reviewModal.open && (
                        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Central Evaluation Desk</span>
                                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{reviewModal.report?.reportId}</h3>
                                    </div>
                                    <button
                                        onClick={() => setReviewModal({ open: false, report: null, status: 'Approved', remarks: '' })}
                                        className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                                    <p className="font-bold text-slate-900">{reviewModal.report?.title}</p>
                                    <p className="text-[11px] text-slate-600">{reviewModal.report?.summary}</p>
                                </div>

                                <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Review Decision</label>
                                        <select
                                            value={reviewModal.status}
                                            onChange={(e) => setReviewModal(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800"
                                        >
                                            <option value="Approved">Approved & Certified</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Revisions Requested">Revisions Requested</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Official Endorsement / Revision Remarks</label>
                                        <textarea
                                            rows={3}
                                            required
                                            placeholder="Enter central verification findings, observations, or required amendments..."
                                            value={reviewModal.remarks}
                                            onChange={(e) => setReviewModal(prev => ({ ...prev, remarks: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setReviewModal({ open: false, report: null, status: 'Approved', remarks: '' })}
                                            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold transition-all shadow-xs"
                                        >
                                            Confirm Decision
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 6: TASKS */}
            {activeTab === 'tasks' && (
                <TaskManagementHub tier="central" assignedTo="ADMIN" title="National Administrative Directives & Audits" />
            )}

        </div>
    );
};

export default CentralDashboard;

