import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ShieldCheck, LogOut, User, Menu, X, Building2, Landmark, GraduationCap, KeyRound, ExternalLink, Activity, LayoutDashboard, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [activeDemoTab, setActiveDemoTab] = useState('authorities'); // 'authorities', 'boards', 'schools', 'students'
    const [isScrolled, setIsScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isLanding = location.pathname === '/';
    const isSolid = !isLanding || isScrolled || user;

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsOpen(false);
    };

    const handleDemoLogin = (role, id, name, schoolId, isMaster = true, operatorId = null, tier = null, state = null) => {
        const cleanId = String(id || '').toUpperCase();
        const derivedState = state || (cleanId.includes('DL') ? 'Delhi' : cleanId.includes('UP') ? 'Uttar Pradesh' : cleanId.includes('WB') ? 'West Bengal' : cleanId.includes('MH') ? 'Maharashtra' : undefined);
        login({
            id,
            role,
            name,
            schoolId: schoolId || id,
            institutionId: id,
            isMaster,
            operatorId: operatorId || (isMaster ? undefined : `OP-${id}`),
            tier: tier || (role === 'admin' ? (cleanId.includes('MOE') && !cleanId.includes('UP') ? 'central' : cleanId.includes('UP') || cleanId.includes('DL') ? 'state' : 'central') : undefined),
            state: derivedState
        });
        setShowDemoModal(false);
        setIsOpen(false);
        navigate('/dashboard');
    };

    const handleStudentDemoLogin = (studentId, name, aadhaarNumber) => {
        login({
            id: studentId,
            role: 'student',
            name: name,
            studentId: studentId,
            uniqueId: studentId,
            aadhaarNumber: aadhaarNumber
        });
        setShowDemoModal(false);
        setIsOpen(false);
        navigate(`/track/${studentId}`);
    };

    return (
        <>
            {/* Top National Government Authority Banner */}
            <div className={`transition-colors duration-300 text-[11px] font-medium border-b ${isSolid
                    ? "bg-slate-900 text-slate-300 border-slate-800"
                    : "bg-slate-950 text-slate-300 border-slate-800/80"
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            GOVERNMENT OF INDIA &bull; MINISTRY OF EDUCATION
                        </span>
                        <span className="hidden sm:inline text-slate-600">|</span>
                        <span className="hidden sm:inline text-slate-400">EduVera &bull; Student Education & Migration Registry</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono">
                        <span className="hidden md:inline-flex items-center gap-1 text-emerald-400">
                            <Activity size={12} />
                            State Nodes: Synchronized
                        </span>
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="text-amber-300 hover:text-amber-200 underline font-sans font-semibold cursor-pointer"
                        >
                            ⚡ Quick Test Access
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Application Navigation Header */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isSolid
                    ? "bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm"
                    : "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 text-white"
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        {/* Brand Logo & Authority Label */}
                        <div className="flex items-center gap-8">
                            <Link to={user ? (user.role === 'student' ? `/track/${user.studentId || user.id}` : "/dashboard") : "/"} className="flex items-center gap-3 group">
                                <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold shadow-xs transition-colors ${isSolid ? "bg-slate-900 text-white group-hover:bg-blue-800" : "bg-blue-700 text-white group-hover:bg-blue-600"
                                    }`}>
                                    <ShieldCheck size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-base font-black tracking-tight ${isSolid ? "text-slate-900" : "text-white"}`}>
                                            Edu<span className="text-blue-500">Vera</span>
                                        </span>
                                        
                                    </div>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider leading-none ${isSolid ? "text-slate-500" : "text-slate-400"
                                        }`}>
                                        Student Education & Migration Registry
                                    </p>
                                </div>
                            </Link>

                            {/* Public Navigation Links */}
                            {!user && (
                                <nav className={`hidden md:flex items-center gap-1 pl-4 border-l ${isSolid ? "border-slate-200" : "border-slate-800"
                                    }`}>
                                    <a href="#breakdown" className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${isSolid
                                            ? "text-slate-700 hover:text-blue-700 hover:bg-slate-50"
                                            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
                                        }`}>
                                        Governance Breakdown
                                    </a>
                                    <a href="#governance" className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${isSolid
                                            ? "text-slate-700 hover:text-blue-700 hover:bg-slate-50"
                                            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
                                        }`}>
                                        Access Channels
                                    </a>
                                    <a href="#necessity" className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${isSolid
                                            ? "text-slate-700 hover:text-blue-700 hover:bg-slate-50"
                                            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
                                        }`}>
                                        Why EduVera
                                    </a>
                                    <a href="#services" className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${isSolid
                                            ? "text-slate-700 hover:text-blue-700 hover:bg-slate-50"
                                            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
                                        }`}>
                                        Statutory Framework
                                    </a>
                                    <a href="#metrics" className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${isSolid
                                            ? "text-slate-700 hover:text-blue-700 hover:bg-slate-50"
                                            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
                                        }`}>
                                        National Census Data
                                    </a>
                                </nav>
                            )}
                        </div>

                        {/* Action Controls & User Status */}
                        <div className="hidden md:flex items-center gap-2.5">
                            {user ? (
                                <div className={`flex items-center gap-3 pl-3 border-l ${isSolid ? "border-slate-200" : "border-slate-700"}`}>

                                    {/* Direct Button to Dashboard */}
                                    <Link
                                        to={user.role === 'student' ? `/track/${user.studentId || user.id}` : "/dashboard"}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                                    >
                                        <LayoutDashboard size={14} />
                                        <span>{user.role === 'student' ? 'My Depository' : 'Go to Dashboard'}</span>
                                        <ArrowRight size={13} />
                                    </Link>

                                    {/* Clickable User Profile Pill */}
                                    <Link
                                        to={user.role === 'student' ? `/track/${user.studentId || user.id}` : "/dashboard"}
                                        title="Click to open console"
                                        className={`flex items-center gap-2.5 px-3 py-1 rounded-md border transition-all hover:border-blue-400 ${isSolid ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-700"
                                            }`}
                                    >
                                        <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-xs font-bold max-w-[140px] truncate leading-tight ${isSolid ? "text-slate-900" : "text-white"}`}>{user.name}</p>
                                            <p className="text-[10px] text-blue-500 font-mono font-bold leading-none">
                                                {user.tier === 'state' ? 'State Directorate' : user.tier === 'central' ? (user.id === 'ADMIN' ? 'Platform Lead Admin' : 'Central Ministry') : user.tier === 'board' ? 'Examination Board' : (user.operatorId || user.id)}
                                            </p>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-all cursor-pointer"
                                    >
                                        <LogOut size={13} />
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent("show-login-portal", { detail: { tab: "student" } });
                                            window.dispatchEvent(event);
                                        }}
                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 border ${isSolid
                                                ? "text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200"
                                                : "text-blue-200 bg-blue-950/60 hover:bg-blue-900/80 border-blue-500/40"
                                            }`}
                                    >
                                        <User size={13} />
                                        Student Portal (Aadhaar)
                                    </button>

                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent("show-login-portal", { detail: { tab: "school" } });
                                            window.dispatchEvent(event);
                                        }}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 ${isSolid
                                                ? "text-white bg-slate-900 hover:bg-blue-800"
                                                : "text-slate-900 bg-white hover:bg-slate-100"
                                            }`}
                                    >
                                        <Building2 size={13} />
                                        Institution Desk
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            {user && (
                                <Link
                                    to={user.role === 'student' ? `/track/${user.studentId || user.id}` : "/dashboard"}
                                    className="px-2.5 py-1 text-xs font-bold rounded bg-blue-600 text-white"
                                >
                                    Dashboard
                                </Link>
                            )}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`p-2 rounded-md focus:outline-none transition-colors ${isSolid
                                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        : "text-slate-200 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Mobile Drawer */}
                {isOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-md">
                        {!user ? (
                            <div className="space-y-1 pt-1 text-left">
                                <a href="#breakdown" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Governance Breakdown</a>
                                <a href="#governance" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Access Channels</a>
                                <a href="#necessity" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Why EduVera</a>
                                <a href="#services" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Statutory Framework</a>
                                <a href="#metrics" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">National Census Data</a>
                                <div className="pt-3 space-y-2">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            const event = new CustomEvent("show-login-portal", { detail: { tab: "student" } });
                                            window.dispatchEvent(event);
                                        }}
                                        className="w-full text-center px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-md cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <User size={13} /> Student Portal (Aadhaar Access)
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            const event = new CustomEvent("show-login-portal", { detail: { tab: "school" } });
                                            window.dispatchEvent(event);
                                        }}
                                        className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-md cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <Building2 size={13} /> Institution Desk Sign In
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2 text-left">
                                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Operator Session</p>
                                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                                    <p className="text-[11px] font-mono text-blue-700">{user.operatorId || user.id}</p>
                                </div>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-bold text-blue-700 bg-blue-50">👉 Open Dashboard Console</Link>
                                <Link to="/dashboard/admissions" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Admissions & Transfers</Link>
                                <Link to="/dashboard/students" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Student Roster</Link>
                                <Link to="/dashboard/operators" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100">Operator Desks & Keys</Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-red-700 bg-red-50 border border-red-200 cursor-pointer"
                                >
                                    <LogOut size={13} />
                                    Sign Out Session
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Quick Multi-Tier Role Access Modal */}
            {showDemoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl p-6 sm:p-7 shadow-2xl text-left relative text-slate-900 max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setShowDemoModal(false)}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-1.5">
                                <KeyRound size={11} /> National Sandbox Operator Console
                            </span>
                            <h3 className="text-base font-bold text-slate-900">Direct Multi-Tier Identity Evaluation Hub</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Select any verified statutory node, board, school desk, or citizen to simulate live operations:</p>
                        </div>

                        {/* Navigation Category Tabs */}
                        <div className="flex border-b border-slate-200 gap-2 mb-4">
                            <button
                                onClick={() => setActiveDemoTab('authorities')}
                                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeDemoTab === 'authorities'
                                        ? "border-blue-700 text-blue-800"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                🏛️ Apex & Ministries
                            </button>
                            <button
                                onClick={() => setActiveDemoTab('boards')}
                                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeDemoTab === 'boards'
                                        ? "border-blue-700 text-blue-800"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                📋 CBSE & UP Board
                            </button>
                            <button
                                onClick={() => setActiveDemoTab('schools')}
                                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeDemoTab === 'schools'
                                        ? "border-blue-700 text-blue-800"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                🏫 Schools & IIT Delhi
                            </button>
                            <button
                                onClick={() => setActiveDemoTab('students')}
                                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeDemoTab === 'students'
                                        ? "border-blue-700 text-blue-800"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                🎓 10 Students (Ladder)
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">

                            {/* TAB 1: APEX & MINISTRIES */}
                            {activeDemoTab === 'authorities' && (
                                <div className="space-y-2">
                                    {/* 1. Top Administrator Lead */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">Platform Top Administrator</span>
                                                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">ADMIN (Lead Console)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Main top operator system lead with full national oversight & master authority</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'ADMIN', 'National Depository Lead System Admin', null, true, 'OP-ADMIN-01', 'central')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Master Lead
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'ADMIN', 'Platform Administrator Desk (OP-ADMIN-01)', null, false, 'OP-ADMIN-01', 'central')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator Desk
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Central Ministry of Education (MOE) */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">Ministry of Education (MOE - Central)</span>
                                                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">MOE (Central Gov)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">National education census, cross-state migration policy, central dropout alarms</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'MOE', 'Ministry of Education (Master Admin)', null, true, 'OP-MOE-01', 'central')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Master Admin
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'MOE', 'MOE Central Desk (OP-MOE-01)', null, false, 'OP-MOE-01', 'central')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator Desk
                                            </button>
                                        </div>
                                    </div>

                                    {/* 3. Uttar Pradesh Directorate of Education (UP-MOE) */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">UP Ministry of Education (UP-MOE)</span>
                                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">UP-MOE (State Gov)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Uttar Pradesh state student records, BEO dropout alerts, inter-district transfer tracker</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'UP-MOE', 'UP Directorate of Education (Master Admin)', null, true, 'OP-UP-MOE', 'state')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Master Admin
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'UP-MOE', 'UP MOE State Desk (OP-UP-MOE)', null, false, 'OP-UP-MOE', 'state')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator Desk
                                            </button>
                                        </div>
                                    </div>

                                    {/* 4. Delhi Directorate of Education (STATE-DL) */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">Delhi Directorate of Education (STATE-DL)</span>
                                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">STATE-DL (Delhi State Gov)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">National Capital Territory of Delhi, 11 districts, GNCTD schools & higher education monitoring</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'STATE-DL', 'Directorate of Education, Delhi State (Master Admin)', null, true, 'OP-STATE-DL', 'state')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Master Admin
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'STATE-DL', 'Sanjay Tyagi (Delhi Directorate of Education Officer)', null, false, 'OP-STATE-DL', 'state')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator Desk
                                            </button>
                                        </div>
                                    </div>

                                    {/* 5. Apex Higher Education (UGC / AICTE) */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">University Grants Commission (UGC)</span>
                                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">UGC (Higher Ed)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">National university credit ledger, degree verification & accreditation node</p>
                                        </div>
                                        <button
                                            onClick={() => handleDemoLogin('admin', 'UGC', 'UGC Apex Council (Master Admin)', null, true, 'OP-UGC-01', 'central')}
                                            className="px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer shrink-0"
                                        >
                                            Sign In Desk
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: EXAMINATION BOARDS */}
                            {activeDemoTab === 'boards' && (
                                <div className="space-y-2">
                                    {/* CBSE Board */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">Central Board of Secondary Education (CBSE)</span>
                                                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">CBSE</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">National Board desk: DPS Noida & KV Delhi Cantt affiliated records & Class 10/12 exams</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'CBSE', 'CBSE Examination Board (Master Admin)', null, true, 'OP-CBSE-01', 'board')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Master Admin
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'CBSE', 'CBSE Examinations Operator (OP-CBSE-01)', null, false, 'OP-CBSE-01', 'board')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator Desk
                                            </button>
                                        </div>
                                    </div>

                                    {/* UP Board (UPMSP) */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">UP Board of High School & Intermediate (UPMSP)</span>
                                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">UP-BOARD</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">State Board desk: GIC Lucknow & Varanasi Model High affiliated records</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'UP-BOARD', 'UP Board Madhyamik (Master Admin)', null, true, 'OP-UPBOARD-01', 'board')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Master Admin
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('admin', 'UP-BOARD', 'UP Board Desk Operator (OP-UPBOARD-01)', null, false, 'OP-UPBOARD-01', 'board')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator Desk
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: SCHOOLS & UNIVERSITIES */}
                            {activeDemoTab === 'schools' && (
                                <div className="space-y-2">
                                    {/* CBSE School: DPS Noida */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">DPS Noida (Delhi Public School)</span>
                                                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">SCH-CBSE-01 (CBSE)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Active school roster: Rahul Sharma (Class 10), Vikramaditya (11), Priya (12)</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('school', 'SCH-CBSE-01', 'Delhi Public School Noida', 'SCH-CBSE-01', true)}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Principal
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('school', 'SCH-CBSE-01', 'DPS Noida Admissions (OP-DPS-01)', 'SCH-CBSE-01', false, 'OP-DPS-01')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator
                                            </button>
                                        </div>
                                    </div>

                                    {/* UP Board School: GIC Lucknow */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">Government Inter College (GIC Lucknow)</span>
                                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">SCH-UP-01 (UP Board)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">UP Board school desk: Aarav Verma (Class 5), student TC discharge/intake</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('school', 'SCH-UP-01', 'Government Inter College Lucknow', 'SCH-UP-01', true)}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Principal
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('school', 'SCH-UP-01', 'GIC Lucknow Desk (OP-GIC-LKO)', 'SCH-UP-01', false, 'OP-GIC-LKO')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator
                                            </button>
                                        </div>
                                    </div>

                                    {/* IIT Delhi (Apex Higher Ed) */}
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">Indian Institute of Technology Delhi (IIT Delhi)</span>
                                                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">IIT-DELHI (Apex Institute)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Higher Ed node: B.Tech Graduation records (Devansh Saxena, 9.42 CGPA)</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('university', 'IIT-DELHI', 'IIT Delhi Registrar Office', 'IIT-DELHI', true, null, 'university')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Registrar
                                            </button>
                                            <button
                                                onClick={() => handleDemoLogin('university', 'IIT-DELHI', 'IIT Delhi Academic Desk (OP-IITD-01)', 'IIT-DELHI', false, 'OP-IITD-01', 'university')}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                            >
                                                Operator
                                            </button>
                                        </div>
                                    </div>

                                    {/* College: St. Stephen's */}
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">St. Stephen's College (University of Delhi)</span>
                                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">CLG-DU-01 (Degree College)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Undergraduate node: B.A. (Hons) Economics (Kabir Mehta)</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDemoLogin('college', 'CLG-DU-01', "St. Stephen's College Principal Desk", 'CLG-DU-01', true, null, 'college')}
                                                className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-blue-800 rounded cursor-pointer"
                                            >
                                                Principal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: 10 STUDENTS (FULL ACADEMIC LADDER) */}
                            {activeDemoTab === 'students' && (
                                <div className="space-y-1.5 text-xs">
                                    <p className="text-[11px] text-slate-500 mb-2">Click any citizen to login with their verified USI and Aadhaar record:</p>

                                    {[
                                        { class: "Class 5", name: "Aarav Verma", id: "AARAV052015", aadhaar: "111122223333", board: "UP Board (GIC Lucknow)" },
                                        { class: "Class 6", name: "Ananya Patel", id: "ANANYA062014", aadhaar: "222233334444", board: "CBSE (KV Delhi Cantt)" },
                                        { class: "Class 7", name: "Rohan Gupta", id: "ROHAN072013", aadhaar: "333344445555", board: "CBSE (KV Delhi Cantt)" },
                                        { class: "Class 9", name: "Sneha Sen", id: "SNEHA092011", aadhaar: "444455556666", board: "CBSE (DPS Noida)" },
                                        { class: "Class 10 (Active)", name: "Rahul Sharma", id: "RAHUL052010", aadhaar: "548921047890", board: "CBSE (DPS Noida - 100% Retained)" },
                                        { class: "Class 10 (TC Discharged)", name: "Arjun Kapoor", id: "ARJUN032009", aadhaar: "876543210987", board: "UP Board (Floating TC - 35 Days / Radar Active)" },
                                        { class: "Class 11 (PCM)", name: "Vikramaditya Rao", id: "VIKRAM112008", aadhaar: "555566667777", board: "CBSE (DPS Noida - Science Stream)" },
                                        { class: "Class 12 (Commerce)", name: "Priya Sharma", id: "PRIYA122007", aadhaar: "666677778888", board: "CBSE (DPS Noida - Board Candidate)" },
                                        { class: "Undergrad B.Tech", name: "Kabir Mehta", id: "KABIR2022CS", aadhaar: "777788889999", board: "Delhi University (2nd Year B.Tech CSE)" },
                                        { class: "IIT Delhi B.Tech Grad", name: "Devansh Saxena", id: "DEVANSH-IITD-2024", aadhaar: "999900001111", board: "IIT Delhi B.Tech CSE Graduate (9.42 CGPA)" }
                                    ].map((s, idx) => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleStudentDemoLogin(s.id, s.name, s.aadhaar)}
                                            className="w-full p-2.5 rounded bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 flex items-center justify-between text-left transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 group-hover:text-blue-800">{s.name}</span>
                                                        <span className="text-[10px] font-mono text-slate-500">({s.class})</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-mono">USI: <span className="text-blue-700 font-bold">{s.id}</span> &bull; {s.board}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-0.5 rounded transition-all">
                                                Aadhaar Login &rarr;
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <span>Admin Passcode: <strong className="text-slate-800">admin123</strong> | Student: USI + 12-Digit Aadhaar</span>
                            <span className="text-emerald-700 font-bold">● Active Sandbox</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
