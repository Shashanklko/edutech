import React, { useState, useEffect, useContext } from 'react';
import { Users, Eye, GraduationCap, Building2, Search, Filter, Download, LayoutGrid, Table, ArrowRightLeft, UserPlus, School, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CurrentStudents = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    const isAdmin = user?.role === 'admin' || user?.tier === 'central' || user?.tier === 'board' || user?.tier === 'state';
    const userTier = user?.tier || (user?.schoolId?.startsWith('UNIV') ? 'university' : (user?.schoolId?.startsWith('CLG') ? 'college' : 'school'));
    const isSchool = !isAdmin && (user?.role === 'school' || userTier === 'school');
    const isCollege = !isAdmin && (user?.role === 'college' || userTier === 'college');
    const isUniversity = !isAdmin && (user?.role === 'university' || userTier === 'university');

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                let url = '/api/students';
                const targetId = user?.schoolId || user?.institutionId || user?.id;
                const uId = (targetId || '').toUpperCase();
                
                // If institutional user (school/college/university), filter by that school
                if (!isAdmin && (user?.role === 'school' || userTier === 'school' || userTier === 'college' || userTier === 'university')) {
                    url = `/api/schools/${targetId}/students`;
                } else if (user?.tier === 'state' || uId.includes('UP') || uId.includes('DL')) {
                    const st = (uId.includes('UP') || user?.state === 'Uttar Pradesh') ? 'Uttar Pradesh' : 'Delhi';
                    url += `?state=${encodeURIComponent(st)}`;
                } else if (user?.tier === 'board') {
                    const bd = uId.includes('UP') ? 'UP-BOARD' : (uId.includes('CISCE') ? 'CISCE' : 'CBSE');
                    url += `?board=${encodeURIComponent(bd)}`;
                }
                const res = await axios.get(url);
                setStudents(res.data || []);
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStudents();
    }, [user, isAdmin, userTier]);

    // Filtering
    const filteredStudents = students.filter(s => {
        const matchesSearch = 
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.prnNumber && s.prnNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesLevel = selectedLevel === 'All' || s.courseType === selectedLevel || s.academicLevel === selectedLevel;
        const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

        return matchesSearch && matchesLevel && matchesStatus;
    });

    // CSV Roster Export
    const handleExportCsv = () => {
        if (filteredStudents.length === 0) return;
        const headers = ["Unique Student ID (USI)", "Student Name", "Father Name", "Date of Birth", "Gender", "Status", "Academic Level", "Cohort / Degree", "Stream / Department", "Roll / PRN Number", "Phone Number", "Email"];
        const rows = filteredStudents.map(s => [
            `"${s.uniqueId}"`,
            `"${s.name}"`,
            `"${s.fatherName || ''}"`,
            `"${s.dob ? s.dob.split('T')[0] : ''}"`,
            `"${s.gender || ''}"`,
            `"${s.status}"`,
            `"${s.academicLevel || s.courseType || ''}"`,
            `"${s.degree || s.course || s.currentClass || ''}"`,
            `"${s.department || s.stream || s.branch || ''}"`,
            `"${s.prnNumber || s.rollNumber || ''}"`,
            `"${s.phoneNumber || ''}"`,
            `"${s.email || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Student_Roster_${user?.id || 'Export'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-medium">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading institution student roster...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 text-left">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                            {isSchool ? <School size={20} /> : isCollege ? <Building2 size={20} /> : <GraduationCap size={20} />}
                        </div>
                        {isSchool ? 'Class 1–12 School Student Roster' : isCollege ? 'Undergraduate Student Registry' : 'Apex University Student Registry'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Active student directory for <strong className="text-slate-800">{user?.name}</strong>. Inspect profiles, enter grades, and manage student migration clearances.
                    </p>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleExportCsv}
                        disabled={filteredStudents.length === 0}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                    <Link
                        to="/dashboard/admissions"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs"
                    >
                        <UserPlus size={14} /> Add Student
                    </Link>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                
                {/* Search Box */}
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={isSchool ? "Search student name, USI, or roll number..." : "Search student name, USI, PRN, or roll number..."}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                </div>

                {/* Level Filter Differentiated strictly by Statutory Scope */}
                <div className="flex items-center gap-2">
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
                    >
                        <option value="All">{isSchool ? 'All K-12 Standards' : isCollege ? 'All Degree Cohorts' : 'All Academic Levels'}</option>
                        {isSchool ? (
                            <>
                                <option value="Primary/Middle School">Primary / Middle (1-8)</option>
                                <option value="Secondary School">Secondary (Class 9-10)</option>
                                <option value="Senior Secondary">Senior Secondary (Class 11-12)</option>
                            </>
                        ) : isCollege ? (
                            <>
                                <option value="Graduation">Undergraduate Degrees</option>
                                <option value="Diploma">Technical Diplomas</option>
                            </>
                        ) : (
                            <>
                                <option value="Higher Education">Undergraduate Programs</option>
                                <option value="Post Graduation">Postgraduate Masters</option>
                                <option value="Ph.D">Doctoral Research (Ph.D)</option>
                            </>
                        )}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active Enrolled</option>
                        <option value="Transferred">Transferred Out</option>
                    </select>

                    {/* View Switcher */}
                    <div className="flex p-0.5 bg-slate-200 rounded-xl border border-slate-300">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                            title="Table View"
                        >
                            <Table size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                            title="Grid Cards View"
                        >
                            <LayoutGrid size={14} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Showing {filteredStudents.length} of {students.length} students</span>
            </div>

            {/* TABLE VIEW */}
            {viewMode === 'table' ? (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-5">Student Details</th>
                                    <th className="py-3 px-4">Unique Student ID (USI)</th>
                                    <th className="py-3 px-4">{isSchool ? 'Standard & Section' : 'Degree & Department'}</th>
                                    <th className="py-3 px-4">Enrollment Status</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.uniqueId} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                                                    {student.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{student.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium font-mono">
                                                        {student.prnNumber ? `PRN: ${student.prnNumber}` : `Roll: ${student.rollNumber || 'N/A'}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                                            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-blue-700 font-bold">
                                                {student.uniqueId}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className="font-bold text-slate-800 block text-xs">
                                                {isSchool 
                                                    ? `${student.currentClass || student.course || 'Class 10'} ${student.section ? `(Sec ${student.section})` : ''}` 
                                                    : `${student.degree || student.course || 'Degree Program'}`}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {isSchool 
                                                    ? (student.stream || student.branch || 'General') 
                                                    : `${student.department || student.branch || 'General'} &bull; ${student.semester || 'Semester 1'}`}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                student.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {student.status}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-5 text-right">
                                            <Link
                                                to={`/dashboard/student/${student.uniqueId}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors border border-blue-200/60"
                                            >
                                                <Eye size={13} /> View Ledger
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                            No matching students found in this roster view.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                        <div key={student.uniqueId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-blue-500 transition-all space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                                            {student.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{student.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                {student.prnNumber ? `PRN: ${student.prnNumber}` : `Roll: ${student.rollNumber || 'N/A'}`}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                        student.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {student.status}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">USI:</span>
                                        <span className="font-bold text-blue-700">{student.uniqueId}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">{isSchool ? 'Class:' : 'Degree:'}</span>
                                        <span className="font-semibold text-slate-800">
                                            {isSchool 
                                                ? `${student.currentClass || student.course || 'Class 10'} ${student.section ? `(Sec ${student.section})` : ''}` 
                                                : `${student.degree || student.course || 'Degree Program'}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/dashboard/student/${student.uniqueId}`}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs"
                            >
                                <Eye size={13} /> View Student Ledger
                            </Link>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default CurrentStudents;
