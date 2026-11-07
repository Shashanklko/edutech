import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, Users, Building2, Landmark, LogOut, ShieldCheck, FileCheck, ExternalLink, School, GraduationCap, KeyRound, Award, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const uId = (user?.id || user?.authorityCode || user?.username || '').toUpperCase();
    const isTopAdmin = uId === 'ADMIN';
    const isBoard = user?.tier === 'board' || ['CBSE', 'UP-BOARD', 'CISCE'].includes(uId);
    const isStateGov = user?.tier === 'state' || uId.includes('UP-MOE') || uId.startsWith('STATE-');
    const isCentralGov = (user?.tier === 'central' && !isTopAdmin) || uId === 'MOE' || uId === 'MIN-EDU';
    const canCreateInstitution = isTopAdmin || isBoard;

    const isAdmin = user?.role === 'admin' || user?.tier === 'central' || user?.tier === 'state' || user?.tier === 'board';
    const tier = user?.tier || (user?.schoolId?.startsWith('UNIV') ? 'university' : (user?.schoolId?.startsWith('CLG') ? 'college' : 'school'));
    const isUniversity = !isAdmin && (user?.role === 'university' || tier === 'university');
    const isCollege = !isAdmin && (user?.role === 'college' || tier === 'college');
    const isSchool = !isAdmin && !isUniversity && !isCollege;

    const getRoleBadge = () => {
        if (isAdmin) {
            if (isStateGov) return 'State Directorate (Audit)';
            if (isCentralGov) return 'Central Ministry (Audit)';
            if (isBoard) return 'Board Desk';
            return 'Master Admin';
        }
        if (isUniversity) return 'University Desk';
        if (isCollege) return 'College Desk';
        return 'K-12 School Desk';
    };

    return (
        <aside className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 w-64 select-none shrink-0 text-left">
            
            {/* Header / Brand */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
                    <ShieldCheck size={20} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-black text-slate-900 tracking-tight">Edu<span className="text-blue-600">Vera</span></h2>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            isAdmin 
                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                : isUniversity
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : isCollege
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                            {getRoleBadge()}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">
                        Student Education & Migration Registry
                    </p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Operational Modules
                </p>

                {/* Dashboard Home */}
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                            isActive
                                ? "bg-slate-900 text-white font-bold shadow-xs"
                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        }`
                    }
                >
                    <LayoutDashboard size={15} />
                    <span>
                        {user?.tier === 'central' 
                            ? 'National Overview' 
                            : user?.tier === 'state' 
                                ? 'State Overview' 
                                : user?.tier === 'board' 
                                    ? 'Board Overview' 
                                    : isUniversity 
                                        ? 'University Overview' 
                                        : isCollege 
                                            ? 'College Overview' 
                                            : 'School Overview'}
                    </span>
                </NavLink>

                {/* 1. School Desk Items */}
                {isSchool && (
                    <>
                        <NavLink
                            to="/dashboard/admissions"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <ArrowRightLeft size={15} />
                            <span>K-12 Admissions & TC</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/students"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Users size={15} />
                            <span>Class 1-12 Roster</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/schoolProfile"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <School size={15} />
                            <span>School Profile & Seal</span>
                        </NavLink>
                    </>
                )}

                {/* 2. College Desk Items */}
                {isCollege && (
                    <>
                        <NavLink
                            to="/dashboard/admissions"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <ArrowRightLeft size={15} />
                            <span>Degree Admissions & Migration</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/students"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Users size={15} />
                            <span>Undergraduate Registry</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/schoolProfile"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Building2 size={15} />
                            <span>College Profile & Seal</span>
                        </NavLink>
                    </>
                )}

                {/* 3. University Desk Items */}
                {isUniversity && (
                    <>
                        <NavLink
                            to="/dashboard/admissions"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <ArrowRightLeft size={15} />
                            <span>Higher Ed Admissions</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/students"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <GraduationCap size={15} />
                            <span>University Registry</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/schoolProfile"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Landmark size={15} />
                            <span>Campus Profile & Charters</span>
                        </NavLink>
                    </>
                )}

                {/* 4. Governance & Institutions Registry */}
                {isAdmin && (
                    <>
                        <NavLink
                            to="/dashboard/schools"
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                    isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Building2 size={15} />
                            <span>
                                {isStateGov 
                                    ? 'In-State Institutions (View Only)' 
                                    : isCentralGov 
                                        ? 'National Registry (View Only)' 
                                        : isBoard 
                                            ? 'Affiliated Institutions' 
                                            : 'All Registered Institutions'}
                            </span>
                        </NavLink>

                        {/* ONLY Master Admin or Examination Boards can create/register institutions */}
                        {canCreateInstitution && (
                            <NavLink
                                to="/dashboard/addSchool"
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                                        isActive
                                            ? "bg-slate-900 text-white font-bold shadow-xs"
                                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                    }`
                                }
                            >
                                <Landmark size={15} />
                                <span>{isBoard ? 'Accredit New Institution' : 'Register New Institution'}</span>
                            </NavLink>
                        )}
                    </>
                )}

                {/* Operator Governance (All Administrative Desks) */}
                <NavLink
                    to="/dashboard/operators"
                    className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                            isActive
                                ? "bg-slate-900 text-white font-bold shadow-xs"
                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        }`
                    }
                >
                    <KeyRound size={15} />
                    <span>Operator Desks & Passkeys</span>
                </NavLink>

                <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Statutory Verification
                </p>

                <a
                    href="/track/RAHUL052010"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                    <span className="flex items-center gap-2">
                        <FileCheck size={15} className="text-emerald-700" />
                        Sample Public Ledger
                    </span>
                    <ExternalLink size={11} className="text-slate-400" />
                </a>

            </nav>

            {/* Footer / User Profile & Logout */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-left">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 mb-2 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Authenticated Operator</p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-blue-700 font-mono font-bold truncate">{user?.operatorId || user?.id || 'AUTH-00'}</p>
                </div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                >
                    <LogOut size={13} />
                    Sign Out Session
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;
