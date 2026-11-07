import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, Search, MapPin, Key, GraduationCap, Plus, Landmark, 
    CheckCircle2, ShieldAlert, X, Globe, UserCheck, Lock, RotateCw, 
    Copy, Check, School, Award, Layers, ShieldCheck, Filter, ArrowRight, Eye
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ListedSchools = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTierFilter, setActiveTierFilter] = useState('ALL'); // 'ALL' | 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY'
    const [copiedId, setCopiedId] = useState(null);

    // Statutory Jurisdictional Classification
    const uId = (user?.id || user?.authorityCode || user?.username || '').toUpperCase();
    const uName = (user?.name || '').toLowerCase();

    // State Government Jurisdiction Detection
    const isDelhiUser = uId.includes('DL') || uName.includes('delhi') || user?.state === 'Delhi';
    const isUPUser = (uId.includes('UP') || uName.includes('uttar pradesh') || user?.state === 'Uttar Pradesh') && !isDelhiUser;
    const isWBUser = uId.includes('WB') || uName.includes('bengal') || user?.state === 'West Bengal';

    const isStateGov = user?.tier === 'state' || uId.includes('UP-MOE') || uId.startsWith('STATE-') || uName.includes('directorate') || isDelhiUser || isUPUser || isWBUser;
    const lockedState = isStateGov ? (isDelhiUser ? 'Delhi' : isUPUser ? 'Uttar Pradesh' : isWBUser ? 'West Bengal' : (user?.state || null)) : null;

    // Board Authority Detection (Autonomous Examination Boards)
    const isBoard = user?.tier === 'board' || ['CBSE', 'UP-BOARD', 'CISCE'].includes(uId) || uId.startsWith('OP-CBSE') || uId.startsWith('OP-UPBOARD') || uId.startsWith('OP-CISCE');
    const lockedBoard = isBoard ? (uId.includes('UP') ? 'UP-BOARD' : (uId.includes('CISCE') || uId.includes('ICSE')) ? 'CISCE' : 'CBSE') : null;

    // Top Admin & Central MOE
    const isTopAdmin = uId === 'ADMIN';
    const isCentralGov = (user?.tier === 'central' && !isTopAdmin) || uId === 'MOE' || uId === 'MIN-EDU';

    // Authority Rules: ONLY Top Admin or Examination Boards can register/provision institutions!
    const canCreateInstitution = isTopAdmin || isBoard;
    const isGovernmentUser = isStateGov || isCentralGov;

    // Interactive State Filter (for Admin / Central MOE)
    const [selectedState, setSelectedState] = useState(lockedState || 'ALL');

    useEffect(() => {
        if (lockedState) {
            setSelectedState(lockedState);
        }
    }, [lockedState]);

    // Password Reset Modal State (Admin / Board Only)
    const [selectedSchoolForPass, setSelectedSchoolForPass] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [passResetSuccess, setPassResetSuccess] = useState('');

    // Add School Modal State (Admin / Board Only)
    const [showAddModal, setShowAddModal] = useState(false);
    const [generatingId, setGeneratingId] = useState(false);
    const [addForm, setAddForm] = useState({
        institutionType: 'school',
        schoolId: '',
        name: '',
        state: lockedState || 'Delhi',
        region: '',
        boardCode: lockedBoard || 'CBSE',
        affiliation: lockedBoard ? `${lockedBoard} Affiliated` : 'CBSE - Central Board of Secondary Education',
        password: 'admin123'
    });
    const [addSuccess, setAddSuccess] = useState('');

    const fetchSchools = async () => {
        setLoading(true);
        try {
            let url = '/api/schools';
            const effectiveState = lockedState || (selectedState !== 'ALL' ? selectedState : null);
            if (effectiveState) {
                url += `?state=${encodeURIComponent(effectiveState)}`;
            } else if (lockedBoard) {
                url += `?board=${encodeURIComponent(lockedBoard)}`;
            }
            const res = await axios.get(url);
            setSchools(res.data || []);
        } catch (err) {
            console.error("Failed to fetch institutions directory", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, [lockedState, lockedBoard, selectedState]);

    const handleCopy = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const helperGetState = (school) => {
        if (school.state) return school.state;
        const check = `${school.region || ''} ${school.address || ''} ${school.name || ''}`.toLowerCase();
        if (check.includes('uttar pradesh') || check.includes('lucknow') || check.includes('varanasi') || check.includes('noida') || (school._id || '').includes('UP')) {
            return 'Uttar Pradesh';
        }
        if (check.includes('kolkata') || check.includes('west bengal')) return 'West Bengal';
        if (check.includes('mumbai') || check.includes('maharashtra')) return 'Maharashtra';
        return 'Delhi';
    };

    // 1. Jurisdictional Scoping:
    // Strictly enforce territorial boundary (e.g. Uttar Pradesh vs Delhi)!
    // Delhi institutions (DTU, IIT Delhi, DU, St. Stephen's) can NEVER bleed into Uttar Pradesh!
    const scopedSchools = schools.filter(school => {
        const sState = helperGetState(school);
        const effectiveState = lockedState || (selectedState !== 'ALL' ? selectedState : null);
        if (effectiveState) {
            return sState.toLowerCase() === effectiveState.toLowerCase();
        }
        if (lockedBoard) {
            const aff = (school.affiliation || '').toUpperCase();
            const code = (school.boardCode || '').toUpperCase();
            return code.includes(lockedBoard) || aff.includes(lockedBoard);
        }
        return true;
    });

    // 2. Search & Tier Filter
    const filteredSchools = scopedSchools.filter(school => {
        const sId = (school.id || school._id || '').toUpperCase();
        const sName = (school.name || '').toLowerCase();
        const sRegion = (school.region || '').toLowerCase();
        const sAffiliation = (school.affiliation || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = sName.includes(search) || sId.toLowerCase().includes(search) || sRegion.includes(search) || sAffiliation.includes(search);
        if (!matchesSearch) return false;

        const isUniv = school.institutionType === 'university' || sId.startsWith("UNIV") || sId.startsWith("IIT") || sId.startsWith("AISHE-U") || sName.includes("university") || sName.includes("technology");
        const isCollege = school.institutionType === 'college' || sId.startsWith("CLG") || sId.startsWith("COL") || sId.startsWith("AISHE-C") || (sName.includes("college") && !sName.includes("inter college"));
        const isSchool = !isUniv && !isCollege;

        if (activeTierFilter === 'SCHOOL') return isSchool;
        if (activeTierFilter === 'COLLEGE') return isCollege;
        if (activeTierFilter === 'UNIVERSITY') return isUniv;
        return true;
    });

    // Jurisdiction-specific KPI Counts
    const totalCount = scopedSchools.length;
    const k12Count = scopedSchools.filter(s => {
        const id = (s.id || s._id || '').toUpperCase();
        const name = (s.name || '').toLowerCase();
        const isUniv = s.institutionType === 'university' || id.startsWith("UNIV") || id.startsWith("IIT") || name.includes("university") || name.includes("technology");
        const isCollege = s.institutionType === 'college' || id.startsWith("CLG") || id.startsWith("COL") || (name.includes("college") && !name.includes("inter college"));
        return !isUniv && !isCollege;
    }).length;

    const collegeCount = scopedSchools.filter(s => {
        const id = (s.id || s._id || '').toUpperCase();
        const name = (s.name || '').toLowerCase();
        return s.institutionType === 'college' || id.startsWith("CLG") || id.startsWith("COL") || (name.includes("college") && !name.includes("inter college"));
    }).length;

    const universityCount = scopedSchools.filter(s => {
        const id = (s.id || s._id || '').toUpperCase();
        const name = (s.name || '').toLowerCase();
        return s.institutionType === 'university' || id.startsWith("UNIV") || id.startsWith("IIT") || name.includes("university") || name.includes("technology");
    }).length;

    const handleImpersonate = (school) => {
        if (!canCreateInstitution) return;
        const sId = school.id || school._id;
        const isUniv = school.institutionType === 'university' || sId?.startsWith("UNIV") || sId?.startsWith("IIT") || school.name?.toLowerCase().includes("university") || school.name?.toLowerCase().includes("technology");
        const isCollege = school.institutionType === 'college' || sId?.startsWith("CLG") || sId?.startsWith("COL") || (school.name?.toLowerCase().includes("college") && !school.name?.toLowerCase().includes("inter college"));
        const tier = isUniv ? 'university' : (isCollege ? 'college' : 'school');

        login({
            id: sId,
            role: 'school',
            name: `${school.name} (Desk Operator)`,
            schoolId: sId,
            institutionId: sId,
            isMaster: false,
            operatorId: `OP-${sId}`,
            tier
        });
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-medium">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading institutions directory...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-left">
            
            {/* Header & Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            lockedState
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : lockedBoard
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-purple-50 text-purple-800 border-purple-300'
                        }`}>
                            {lockedState ? `Territorial Scope: ${lockedState} State Jurisdiction` : lockedBoard ? `Board Registry: ${lockedBoard}` : 'National Education Depository Registry'}
                        </span>
                        {isGovernmentUser && (
                            <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                                <Eye size={12} className="text-blue-600" /> Read-Only Supervisory Audit Mode
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                            <Building2 size={20} className="text-blue-400" />
                        </div>
                        {lockedState ? `${lockedState} Educational Institutions Directory` : 'Educational Institutions & Desks Directory'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        {lockedState 
                            ? `Comprehensive statutory register of primary, secondary schools, degree colleges, and universities operating within ${lockedState} borders.`
                            : 'Central registry of statutory institutions categorized by governance tiers (Central MOE, State MOE, UGC Councils, K-12 Boards).'}
                    </p>
                </div>

                {/* Top Action Area: Government is READ-ONLY, only Admin/Boards can register institutions */}
                <div className="flex items-center gap-2.5 shrink-0">
                    {canCreateInstitution ? (
                        <button
                            onClick={() => navigate('/dashboard/addSchool')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                            <Plus size={15} /> {isBoard ? 'Accredit New Institution' : 'Register New Institution'}
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Government Audit Authority &bull; View Only
                        </div>
                    )}
                </div>
            </div>

            {/* Scope Specific Metric Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Total In-Scope Nodes */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {lockedState ? `${lockedState.toUpperCase()} TOTAL` : 'TOTAL NODES'}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                            <Layers size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalCount}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">Active Institutions</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Within Jurisdiction Scope</p>
                </div>

                {/* Metric 2: K-12 Foundational Schools */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            K-12 &bull; UDISE+
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                            <Building2 size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{k12Count}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">Secondary Schools</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Classes 1-12 & Single-Seat TCs</p>
                </div>

                {/* Metric 3: Degree Colleges */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            AISHE-C &bull; COLLEGES
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <GraduationCap size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{collegeCount}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">Undergraduate Colleges</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">UG Degrees & Credit Bank (ABC)</p>
                </div>

                {/* Metric 4: Universities & Apex */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                            AISHE-U &bull; APEX
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                            <Landmark size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{universityCount}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">Universities & Research</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Postgrad, Doctoral & Degrees</p>
                </div>

            </div>

            {/* Filter Bar & Search Box */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3.5 shadow-2xs">
                
                {/* Jurisdiction / State Filter for Admin & Central Authorities */}
                {!lockedState && (isTopAdmin || isCentralGov) && (
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 flex-wrap text-xs">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                            <MapPin size={12} /> State Jurisdiction Filter:
                        </span>
                        {['ALL', 'Uttar Pradesh', 'Delhi', 'West Bengal', 'Maharashtra'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setSelectedState(st)}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedState === st
                                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {st === 'ALL' ? 'All States (National)' : st}
                            </button>
                        ))}
                    </div>
                )}

                {/* Institutional Classification Filter Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
                        <span className="text-[10px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
                            <Filter size={12} /> Classification:
                        </span>
                        
                        <button
                            onClick={() => setActiveTierFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                activeTierFilter === 'ALL'
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            All {lockedState ? `${lockedState} Nodes` : 'Nodes'} ({totalCount})
                        </button>

                        <button
                            onClick={() => setActiveTierFilter('SCHOOL')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTierFilter === 'SCHOOL'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            🏫 K-12 Schools ({k12Count})
                        </button>

                        <button
                            onClick={() => setActiveTierFilter('COLLEGE')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTierFilter === 'COLLEGE'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                        >
                            🎓 Degree Colleges ({collegeCount})
                        </button>

                        <button
                            onClick={() => setActiveTierFilter('UNIVERSITY')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTierFilter === 'UNIVERSITY'
                                    ? 'bg-purple-600 text-white shadow-2xs'
                                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                            }`}
                        >
                            🏛️ Universities & Apex ({universityCount})
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                        Showing {filteredSchools.length} of {totalCount} Nodes
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={lockedState ? `Search ${lockedState} institutions, Registry ID, or district...` : "Search institution name, Registry ID (e.g. SCH-CBSE-01, CLG-DU-01, IIT-DELHI), or region..."} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                </div>
            </div>

            {/* Directory Cards / Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-3.5 px-5">Institution & Desk Tier</th>
                                <th className="py-3.5 px-4">System Registry ID</th>
                                <th className="py-3.5 px-4">Governance & Affiliation</th>
                                <th className="py-3.5 px-4">Academic Boundary</th>
                                <th className="py-3.5 px-5 text-right">Statutory Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSchools.map((school) => {
                                const sId = (school._id || school.id || school.schoolId || 'N/A').toString().toUpperCase();
                                const sName = school.name || '';
                                const sState = helperGetState(school);
                                
                                const isUniv = school.institutionType === 'university' || sId.startsWith("UNIV") || sId.startsWith("IIT") || sId.startsWith("AISHE-U") || sName.toLowerCase().includes("university") || sName.toLowerCase().includes("technology");
                                const isCollege = school.institutionType === 'college' || sId.startsWith("CLG") || sId.startsWith("COL") || sId.startsWith("AISHE-C") || (sName.toLowerCase().includes("college") && !sName.toLowerCase().includes("inter college"));
                                
                                let icon = <Building2 size={16} />;
                                let iconStyle = 'bg-blue-50 text-blue-600 border-blue-200';
                                let tierLabel = 'K-12 School Desk';
                                let tierPill = 'bg-blue-50 text-blue-800 border-blue-200';
                                let codeType = 'UDISE+';
                                let affiliation = school.affiliation || (sState === 'Uttar Pradesh' ? 'UPMSP Secondary Board' : 'CBSE Central Secondary Board');
                                let boundaryLabel = 'K-12 (Classes 1 to 12) & Digital TCs';
                                let boundaryBadge = 'bg-slate-100 text-slate-700';

                                if (isUniv) {
                                    icon = <Landmark size={16} />;
                                    iconStyle = 'bg-purple-50 text-purple-600 border-purple-200';
                                    tierLabel = 'Apex University / Research Institute';
                                    tierPill = 'bg-purple-50 text-purple-800 border-purple-200';
                                    codeType = 'AISHE-U';
                                    affiliation = school.affiliation || 'UGC / AICTE Central Authority';
                                    boundaryLabel = 'Postgrad, Doctoral (Ph.D) & Convocation Degrees';
                                    boundaryBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                                } else if (isCollege) {
                                    icon = <GraduationCap size={16} />;
                                    iconStyle = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                                    tierLabel = 'Undergraduate Degree College';
                                    tierPill = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                    codeType = 'AISHE-C';
                                    affiliation = school.affiliation || 'Affiliated Degree College / UGC';
                                    boundaryLabel = 'Undergraduate (Sem 1-8), ABC Credits & Degrees';
                                    boundaryBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                } else if (sName.toLowerCase().includes("inter college") || sId.includes("UP")) {
                                    tierLabel = 'State Senior Secondary School';
                                    tierPill = 'bg-amber-50 text-amber-800 border-amber-200';
                                    codeType = 'UDISE+ / UPMSP';
                                    affiliation = school.affiliation || 'UPMSP - Uttar Pradesh Madhyamik Shiksha Parishad';
                                    boundaryLabel = 'K-12 (Class 1-12) & Inter Certificates';
                                    boundaryBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                                }

                                const isCentral = sId.includes("CBSE") || sId.startsWith("IIT") || sId.startsWith("UNIV-DU") || sName.toLowerCase().includes("cbse") || sName.toLowerCase().includes("kendriya vidyalaya") || sName.toLowerCase().includes("delhi public");

                                return (
                                    <tr key={sId} className="hover:bg-slate-50/70 transition-colors">
                                        
                                        {/* Institution Name & Type */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 border ${iconStyle}`}>
                                                    {icon}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-slate-900 block text-xs leading-snug">
                                                        {school.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${tierPill}`}>
                                                            {tierLabel}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            State: <strong className="text-slate-700">{sState}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Registry ID with Copy Button */}
                                        <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                                            <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 px-2.5 py-1 rounded-md transition-colors group">
                                                <span className="tracking-wider text-slate-900 font-bold">
                                                    {sId}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(sId)}
                                                    title="Copy Registry ID"
                                                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                >
                                                    {copiedId === sId ? (
                                                        <Check size={12} className="text-emerald-600" />
                                                    ) : (
                                                        <Copy size={12} />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-semibold">
                                                {codeType}
                                            </p>
                                        </td>

                                        {/* Governance & Region */}
                                        <td className="py-4 px-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                                                        isCentral 
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {isCentral ? 'National Board / Central' : 'State Jurisdiction'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-700 font-semibold truncate max-w-[170px]" title={affiliation}>
                                                        {affiliation}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                                                    <MapPin size={11} className="text-slate-400" />
                                                    {school.region || `${sState} Jurisdiction`}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Academic Boundary */}
                                        <td className="py-4 px-4">
                                            <div className="space-y-0.5">
                                                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${boundaryBadge}`}>
                                                    {boundaryLabel}
                                                </span>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {isUniv || isCollege ? 'Academic Bank of Credits (ABC)' : 'Zero Ghost Single-Seat Protocol'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Administrative Actions */}
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canCreateInstitution ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleImpersonate(school)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                                                            title={`Sign in directly as ${school.name} desk operator`}
                                                        >
                                                            <UserCheck size={12} /> Test Operator Login
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSchoolForPass(school);
                                                                setNewPassword('');
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-colors border border-amber-200 cursor-pointer"
                                                            title="Reset institution access passcode"
                                                        >
                                                            <Key size={12} /> Passcode
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/dashboard/students')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                                                        title={`Inspect enrolled student roster in ${school.name}`}
                                                    >
                                                        <Eye size={12} /> Inspect Roster
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredSchools.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                        No registered institutions match the selected governance tier or search criteria within this jurisdiction.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListedSchools;
