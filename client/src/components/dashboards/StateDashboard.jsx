import React, { useState, useEffect } from 'react';
import { 
    Building2, MapPin, Users, AlertTriangle, ShieldCheck, 
    FileText, CheckCircle2, RefreshCw, Send, Plus, 
    ArrowRightLeft, Eye, Check, X, Phone, UserCheck, Flag
} from 'lucide-react';
import axios from 'axios';
import TaskManagementHub from './TaskManagementHub';

const StateDashboard = ({ stats, user, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'districts' | 'institutions' | 'dropouts' | 'reports' | 'tasks'
    const [schools, setSchools] = useState([]);
    const [dropoutAlarms, setDropoutAlarms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic State & Territorial Jurisdiction Detection
    const uId = (user?.id || user?.institutionId || user?.operatorId || '').toUpperCase();
    const uName = (user?.name || '').toLowerCase();
    const isDelhi = uId.includes('DL') || uName.includes('delhi') || user?.state === 'Delhi';
    const isUP = (uId.includes('UP') || uName.includes('uttar pradesh') || user?.state === 'Uttar Pradesh') && !isDelhi;
    const isWB = uId.includes('WB') || uName.includes('bengal') || user?.state === 'West Bengal';
    const isMH = uId.includes('MH') || uName.includes('maharashtra') || user?.state === 'Maharashtra';

    const currentState = isDelhi ? 'Delhi' : isUP ? 'Uttar Pradesh' : isWB ? 'West Bengal' : isMH ? 'Maharashtra' : (user?.state || 'Delhi');
    const stateDisplayName = isDelhi ? 'National Capital Territory of Delhi (GNCTD)' :
                             isUP ? 'State of Uttar Pradesh' :
                             isWB ? 'State of West Bengal' :
                             isMH ? 'State of Maharashtra' : currentState;

    // State Specific Districts Directory
    const stateDistrictsMap = {
        'Delhi': [
            { name: 'Central Delhi (Daryaganj / Karol Bagh)', code: 'DL-CD-01', schools: 420, colleges: 38, enrolment: '2.85 Lakh', deoName: 'Dr. Rameshwar Singh (DEO Central)', status: 'Active' },
            { name: 'North Delhi (Civil Lines / North Campus)', code: 'DL-ND-02', schools: 510, colleges: 54, enrolment: '3.10 Lakh', deoName: 'Mrs. Sunita Mehra (DEO North)', status: 'Active' },
            { name: 'South Delhi (Hauz Khas / Saket)', code: 'DL-SD-03', schools: 680, colleges: 65, enrolment: '4.20 Lakh', deoName: 'Shri Anil K. Sharma (DEO South)', status: 'Active' },
            { name: 'West Delhi (Rajouri Garden / Punjabi Bagh)', code: 'DL-WD-04', schools: 590, colleges: 42, enrolment: '3.45 Lakh', deoName: 'Dr. Neha Bhasin (DEO West)', status: 'Active' },
            { name: 'South West Delhi (Delhi Cantt / Dwarka)', code: 'DL-SW-05', schools: 740, colleges: 48, enrolment: '4.60 Lakh', deoName: 'Shri Vikramaditya Mathur (DEO SW)', status: 'Active' },
            { name: 'East Delhi (Preet Vihar / Mayur Vihar)', code: 'DL-ED-06', schools: 520, colleges: 32, enrolment: '3.25 Lakh', deoName: 'Mrs. Geeta Aggarwal (DEO East)', status: 'Active' },
            { name: 'North West Delhi (Rohini / Pitampura)', code: 'DL-NW-07', schools: 610, colleges: 36, enrolment: '3.80 Lakh', deoName: 'Shri Rajeshwar Gupta (DEO NW)', status: 'Active' }
        ],
        'Uttar Pradesh': [
            { name: 'Lucknow', code: 'LKO-01', schools: 1420, colleges: 86, enrolment: '4.85 Lakh', deoName: 'Shri R. P. Mishra (DEO)', status: 'Active' },
            { name: 'Gautam Buddh Nagar (Noida)', code: 'GBN-02', schools: 940, colleges: 64, enrolment: '3.42 Lakh', deoName: 'Dr. Anita Saxena (DEO)', status: 'Active' },
            { name: 'Varanasi', code: 'VNS-03', schools: 1280, colleges: 72, enrolment: '4.15 Lakh', deoName: 'Shri S. K. Tiwari (DEO)', status: 'Active' },
            { name: 'Kanpur Nagar', code: 'KNP-04', schools: 1560, colleges: 94, enrolment: '5.20 Lakh', deoName: 'Mrs. Vandana Verma (DEO)', status: 'Active' },
            { name: 'Prayagraj (Allahabad)', code: 'PRY-05', schools: 1680, colleges: 110, enrolment: '5.60 Lakh', deoName: 'Shri A. K. Dubey (DEO)', status: 'Active' }
        ]
    };
    const districts = stateDistrictsMap[currentState] || stateDistrictsMap['Delhi'];
    const totalStateDistricts = currentState === 'Delhi' ? '11 Revenue Districts' : currentState === 'Uttar Pradesh' ? '75 Revenue Districts' : `${districts.length} Districts`;

    // State Submission Form State
    const [reportModal, setReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({
        title: `${currentState} Directorate of Education State Quarterly Return (Q2-2026)`,
        reportingPeriod: 'Q2-2026',
        reportType: 'STATE_ANNUAL_ENROLMENT',
        summary: `State-level statutory return covering ${currentState === 'Delhi' ? '11' : '75'} districts across ${stateDisplayName} with high transition rates and zero ghost enrolment.`,
        totalEnrolled: currentState === 'Delhi' ? 1650000 : 18500000,
        attendanceAverage: currentState === 'Delhi' ? 92.4 : 89.2,
        transitionRate: currentState === 'Delhi' ? 97.6 : 94.6,
        dropoutsInvestigated: currentState === 'Delhi' ? 120 : 480
    });
    const [submittingReport, setSubmittingReport] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState('');

    // BEO Dropout Investigation State
    const [beoModal, setBeoModal] = useState({ open: false, alarm: null, assignedBEO: '', notes: '', actionType: 'assign' });
    const [actionLoading, setActionLoading] = useState(false);
    const [actionFeedback, setActionFeedback] = useState('');

    const handleOpenBeoModal = (alm, actionType = 'assign') => {
        const defaultBEO = alm.address?.toLowerCase().includes('lucknow')
            ? 'BEO - Lucknow Central Block'
            : alm.address?.toLowerCase().includes('noida')
                ? 'BEO - Gautam Buddh Nagar East Block'
                : alm.address?.toLowerCase().includes('varanasi')
                    ? 'BEO - Varanasi Cantonment Block'
                    : 'BEO - District Retention Unit';
        
        setBeoModal({
            open: true,
            alarm: alm,
            assignedBEO: alm.assignedBEO || defaultBEO,
            notes: actionType === 'resolve' 
                ? 'Field verification completed. Student admission confirmed in target institution.'
                : `Conduct physical home inspection at ${alm.address || 'recorded residence'} to verify admission status for floating TC #${alm.tcNumber}.`,
            actionType
        });
    };

    const handleSaveBeoAction = async (e) => {
        e.preventDefault();
        if (!beoModal.alarm) return;
        setActionLoading(true);
        setActionFeedback('');

        const studentId = beoModal.alarm.studentId;
        const isResolve = beoModal.actionType === 'resolve';

        try {
            await axios.put(`/api/student/${studentId}/dropout-investigation`, {
                status: isResolve ? 'Resolved' : 'Assigned_BEO',
                assignedBEO: beoModal.assignedBEO,
                notes: beoModal.notes,
                resolvedBy: `${user?.name || 'State Directorate Officer'}`
            });

            if (isResolve) {
                // If status or review is marked done or resolved, remove it from active radar!
                setDropoutAlarms(prev => prev.filter(a => a.studentId !== studentId));
                setActionFeedback(`Success: Case for ${beoModal.alarm.name} (${studentId}) marked DONE & RESOLVED. Record removed from active investigation radar.`);
            } else {
                setDropoutAlarms(prev => prev.map(a => {
                    if (a.studentId === studentId) {
                        return {
                            ...a,
                            dropoutInvestigationStatus: 'Assigned_BEO',
                            assignedBEO: beoModal.assignedBEO,
                            dropoutInvestigationNotes: beoModal.notes
                        };
                    }
                    return a;
                }));
                setActionFeedback(`Success: BEO Field Investigation directive assigned to ${beoModal.assignedBEO} for ${beoModal.alarm.name}. Task added to District Roster.`);
            }

            setBeoModal({ open: false, alarm: null, assignedBEO: '', notes: '', actionType: 'assign' });
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update investigation');
        } finally {
            setActionLoading(false);
        }
    };

    const fetchStateData = async () => {
        setLoading(true);
        try {
            const [schoolsRes, alarmsRes] = await Promise.all([
                axios.get(`/api/schools?state=${encodeURIComponent(currentState)}`),
                axios.get(`/api/stats/board-dropout-alarms?board=All&state=${encodeURIComponent(currentState)}`)
            ]);

            // Strictly enforce state boundary: only in-state schools
            const rawSchools = schoolsRes.data || [];
            const inStateSchools = rawSchools.filter(s => {
                const sState = s.state || (s.region?.toLowerCase().includes(currentState.toLowerCase()) ? currentState : '');
                return sState.toLowerCase() === currentState.toLowerCase();
            });
            setSchools(inStateSchools);

            // Filter dropout alarms for in-state jurisdiction
            const rawAlarms = alarmsRes.data?.alarms || [];
            const inStateAlarms = rawAlarms.filter(alm => {
                const almText = `${alm.releasingSchoolName || ''} ${alm.address || ''} ${alm.releasingBoardName || ''}`.toLowerCase();
                if (currentState.toLowerCase() === 'delhi') {
                    return almText.includes('delhi') || almText.includes('new delhi');
                }
                if (currentState.toLowerCase() === 'uttar pradesh') {
                    return almText.includes('uttar pradesh') || almText.includes('lucknow') || almText.includes('varanasi') || almText.includes('noida') || almText.includes('up board');
                }
                return true;
            });
            setDropoutAlarms(inStateAlarms);
        } catch (err) {
            console.error("Failed to load state data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStateData();
    }, [currentState]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReport(true);
        try {
            await axios.post('/api/reports', {
                ...reportForm,
                reportingTier: 'state',
                submittedBy: user?.id || 'UP-MOE',
                submittedByName: user?.name || 'Uttar Pradesh Directorate of Education',
                submittedTo: 'ADMIN',
                metrics: {
                    totalEnrolled: reportForm.totalEnrolled,
                    attendanceAverage: reportForm.attendanceAverage,
                    transitionRate: reportForm.transitionRate,
                    dropoutsInvestigated: reportForm.dropoutsInvestigated
                }
            });
            setSubmitSuccess('Report successfully transmitted to Central Ministry of Education for statutory certification.');
            setReportModal(false);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to submit report");
        } finally {
            setSubmittingReport(false);
        }
    };

    return (
        <div className="space-y-6 text-left">
            
            {/* State Education Ministry Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Tier 2 &bull; State Education Department
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                            Jurisdiction: {stateDisplayName}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                        {user?.name || stateDisplayName} &mdash; State Monitoring Desk
                    </h1>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        State-level governance governing District Education Offices (DEO), Block Education Offices (BEO), institutional accreditation, out-of-school retention investigations, and State-to-Central periodic reporting.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'State Overview', icon: Building2 },
                    { id: 'districts', label: 'District Management', icon: MapPin },
                    { id: 'institutions', label: 'State School Registry', icon: Building2 },
                    { id: 'dropouts', label: 'Dropout Investigation Radar', icon: AlertTriangle, badge: dropoutAlarms.length },
                    { id: 'reports', label: 'Central Submissions Desk', icon: FileText },
                    { id: 'tasks', label: 'State Directives', icon: ShieldCheck }
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
                                    isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
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
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Jurisdiction Districts</span>
                            <p className="text-2xl font-black text-slate-900 mt-1">{districts.length}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Active DEO & BEO Networks</p>
                        </div>
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-700">Follow-up Retention Cases</span>
                            <p className="text-2xl font-black text-amber-900 mt-1">{dropoutAlarms.length}</p>
                            <p className="text-[11px] text-amber-800 mt-0.5">30+ Day Floating TC Alerts</p>
                        </div>
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-blue-800">State Schools & Colleges</span>
                            <p className="text-2xl font-black text-blue-950 mt-1">{schools.length}</p>
                            <p className="text-[11px] text-blue-700 mt-0.5">UDISE+ & AISHE Accredited</p>
                        </div>
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">State Secondary Transition</span>
                            <p className="text-2xl font-black text-emerald-900 mt-1">94.6%</p>
                            <p className="text-[11px] text-emerald-800 mt-0.5">District Aggregate Ratio</p>
                        </div>
                    </div>

                    {/* Operational Directive Box */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-amber-600" />
                            Statutory Responsibility: District Administration & Field Inspections
                        </p>
                        <p className="leading-relaxed">
                            The State Education Department supervises District Education Officers (DEOs) and Block Education Officers (BEOs). Unenrolled student transitions trigger administrative investigation directives rather than automated dropout declarations, guaranteeing field verification.
                        </p>
                    </div>

                    <TaskManagementHub tier="state" assignedTo={user?.id || 'UP-MOE'} title="State Priority Directives & BEO Follow-ups" />
                </div>
            )}

            {/* TAB 2: DISTRICT MANAGEMENT */}
            {activeTab === 'districts' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Jurisdiction Directory</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">District Education Officer (DEO) Cadre &mdash; {currentState}</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{totalStateDistricts}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {districts.map((d) => (
                            <div key={d.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                        {d.code}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                        {d.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">{d.name}</h4>
                                <p className="text-[11px] text-slate-600 font-medium">Head: {d.deoName}</p>
                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span>{d.schools} Schools</span>
                                    <span>{d.colleges} Colleges</span>
                                    <span className="font-bold text-slate-800">{d.enrolment}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: INSTITUTIONS */}
            {activeTab === 'institutions' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">State Registry</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Registered In-State Schools & Colleges ({currentState})</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{schools.length} {currentState} Institutions</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Institution Name</th>
                                    <th className="py-3 px-4">Registry ID</th>
                                    <th className="py-3 px-4">Classification</th>
                                    <th className="py-3 px-4">Affiliation</th>
                                    <th className="py-3 px-4">District / Region</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {schools.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-800">{s._id}</td>
                                        <td className="py-3.5 px-4 uppercase text-[10px] font-bold font-mono">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                {s.institutionType || 'school'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[200px]">{s.affiliation}</td>
                                        <td className="py-3.5 px-4 text-slate-500">{s.region}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: DROPOUT INVESTIGATION RADAR */}
            {activeTab === 'dropouts' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Retention Governance</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Unenrolled Student Transition & Field Investigation Radar</h3>
                        </div>
                        <span className="text-xs font-mono text-amber-700 font-bold">{dropoutAlarms.length} Discharged TCs Under Tracking</span>
                    </div>

                    {actionFeedback && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-bold">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <span>{actionFeedback}</span>
                            </div>
                            <button onClick={() => setActionFeedback('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-700 shrink-0" />
                        <span>
                            <strong>No Automatic Dropout Declaration:</strong> EduVera flags students who have been issued a Transfer Certificate but have not enrolled in a receiving institution after 20+ days. State officers assign Block Education Officers (BEO) to conduct field visits before any status change.
                        </span>
                    </div>

                    {dropoutAlarms.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-medium text-xs">
                            No unadmitted student transition alarms active in state jurisdiction. All cases verified or resolved.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dropoutAlarms.map((alm) => (
                                <div
                                    key={alm.studentId}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                                                {alm.studentId}
                                            </span>
                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                                                alm.daysElapsed >= 30
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                            }`}>
                                                {alm.daysElapsed} Days Floating TC
                                            </span>
                                            {alm.dropoutInvestigationStatus === 'Assigned_BEO' && (
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-blue-50 text-blue-800 border-blue-200">
                                                    BEO Assigned: {alm.assignedBEO || 'Field Unit'}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                TC #{alm.tcNumber}
                                            </span>
                                        </div>

                                        <h4 className="text-xs font-bold text-slate-900">
                                            {alm.name} &bull; S/O {alm.fatherName}
                                        </h4>
                                        <p className="text-[11px] text-slate-600">
                                            Releasing School: <strong>{alm.releasingSchoolName}</strong> ({alm.releasingBoardName})
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                                            <span>Residence: {alm.address || 'Address on TC record'}</span>
                                            <span>Contact: {alm.phoneNumber || 'N/A'}</span>
                                        </div>
                                        {alm.dropoutInvestigationNotes && (
                                            <p className="text-[10px] text-blue-700 font-mono pt-0.5 italic">
                                                Investigation Directive: {alm.dropoutInvestigationNotes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons: Assign BEO & Mark Done / Resolve */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleOpenBeoModal(alm, 'assign')}
                                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                                        >
                                            <UserCheck size={12} /> {alm.dropoutInvestigationStatus === 'Assigned_BEO' ? 'Update Directive' : 'Assign BEO Investigation'}
                                        </button>
                                        <button
                                            onClick={() => handleOpenBeoModal(alm, 'resolve')}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 size={12} /> Mark Done / Resolve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BEO INVESTIGATION & RESOLUTION MODAL */}
                    {beoModal.open && beoModal.alarm && (
                        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4 text-left">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                            {beoModal.actionType === 'resolve' ? 'Case Resolution Desk' : 'BEO Field Task Directive'}
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                                            {beoModal.actionType === 'resolve' ? 'Mark Investigation Resolved' : 'Assign Block Education Officer (BEO)'}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setBeoModal({ open: false, alarm: null, assignedBEO: '', notes: '', actionType: 'assign' })} 
                                        className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">{beoModal.alarm.name}</span>
                                        <span className="font-mono text-blue-700 font-bold">{beoModal.alarm.studentId}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600">Releasing School: {beoModal.alarm.releasingSchoolName}</p>
                                    <p className="text-[11px] text-slate-600">Residence: {beoModal.alarm.address || 'Address on record'}</p>
                                    <p className="text-[10px] text-amber-800 font-mono font-semibold">Floating TC Duration: {beoModal.alarm.daysElapsed} Days</p>
                                </div>

                                <form onSubmit={handleSaveBeoAction} className="space-y-3 text-xs">
                                    {/* Action Toggle */}
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setBeoModal(prev => ({ ...prev, actionType: 'assign' }))}
                                            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                                                beoModal.actionType === 'assign' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Assign BEO Field Unit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBeoModal(prev => ({ ...prev, actionType: 'resolve' }))}
                                            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                                                beoModal.actionType === 'resolve' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Mark Done / Resolve Alarm
                                        </button>
                                    </div>

                                    {beoModal.actionType === 'assign' ? (
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Assigned BEO Unit / Officer *</label>
                                            <input
                                                type="text"
                                                required
                                                value={beoModal.assignedBEO}
                                                onChange={(e) => setBeoModal(prev => ({ ...prev, assignedBEO: e.target.value }))}
                                                placeholder="e.g. BEO - Lucknow Central Block"
                                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                                            Marking this case resolved will clear the alert and remove this candidate from the active Dropout Radar.
                                        </div>
                                    )}

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            {beoModal.actionType === 'resolve' ? 'Resolution Remarks & Field Findings *' : 'Field Inspection Directive & Instructions *'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={beoModal.notes}
                                            onChange={(e) => setBeoModal(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder={beoModal.actionType === 'resolve' 
                                                ? 'e.g. Field visit completed. Student verified enrolled in receiving school / verified genuine migration.' 
                                                : 'e.g. Conduct physical visit to residence, verify enrollment in local institutions.'}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setBeoModal({ open: false, alarm: null, assignedBEO: '', notes: '', actionType: 'assign' })}
                                            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={actionLoading}
                                            className={`px-4 py-2 rounded-lg text-white font-bold transition-all shadow-xs cursor-pointer ${
                                                beoModal.actionType === 'resolve'
                                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                                    : 'bg-amber-600 hover:bg-amber-700'
                                            }`}
                                        >
                                            {actionLoading ? 'Processing...' : (beoModal.actionType === 'resolve' ? 'Confirm & Remove from Radar' : 'Dispatch BEO Task Directive')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: CENTRAL SUBMISSIONS DESK */}
            {activeTab === 'reports' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Federal Compliance</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">State-to-Central Submissions & Returns</h3>
                        </div>
                        <button
                            onClick={() => setReportModal(true)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Send size={13} /> Submit New Return to Central MOE
                        </button>
                    </div>

                    {submitSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center justify-between">
                            <span>{submitSuccess}</span>
                            <button onClick={() => setSubmitSuccess('')} className="font-bold">&times;</button>
                        </div>
                    )}

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Latest Endorsed Return</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                Certified
                            </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                            REP-STATE-UP-2026-Q1: Annual Enrolment & GER Return 2025-2026
                        </h4>
                        <p className="text-[11px] text-slate-600">
                            Comprehensive state annual return documenting 96.8% elementary transition, 4,210 verified out-of-school interventions, and mid-day meal coverage across 75 districts.
                        </p>
                    </div>

                    {/* REPORT MODAL */}
                    {reportModal && (
                        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Formal Statutory Return</span>
                                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">Submit Report to Central Ministry</h3>
                                    </div>
                                    <button onClick={() => setReportModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Return Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={reportForm.title}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Reporting Period *</label>
                                            <input
                                                type="text"
                                                required
                                                value={reportForm.reportingPeriod}
                                                onChange={(e) => setReportForm(prev => ({ ...prev, reportingPeriod: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Return Classification *</label>
                                            <select
                                                value={reportForm.reportType}
                                                onChange={(e) => setReportForm(prev => ({ ...prev, reportType: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                                            >
                                                <option value="STATE_ANNUAL_ENROLMENT">Annual Enrolment & GER Return</option>
                                                <option value="INTERSTATE_MIGRATION_AUDIT">Interstate Migration Audit</option>
                                                <option value="SCHEME_UTILIZATION">Scheme Utilization Return</option>
                                                <option value="DROPOUT_INTERVENTION_SUMMARY">Retention Intervention Report</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Executive Summary *</label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={reportForm.summary}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, summary: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-900"
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setReportModal(false)}
                                            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingReport}
                                            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold transition-all shadow-xs"
                                        >
                                            {submittingReport ? 'Transmitting...' : 'Transmit Return'}
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
                <TaskManagementHub tier="state" assignedTo={user?.id || 'UP-MOE'} title="State Education Department Tasks & Directives" />
            )}

        </div>
    );
};

export default StateDashboard;

