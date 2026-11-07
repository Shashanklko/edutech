import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
    const location = useLocation();
    const pathSegment = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';

    const getBreadcrumbTitle = (segment) => {
        switch (segment) {
            case 'admissions':
            case 'addStudent':
            case 'enroll':
                return 'Admissions & Student Transfer Protocol';
            case 'students':
                return 'Active Student Enrolled Roster';
            case 'schools':
                return 'Affiliated Institutions Directory';
            case 'addSchool':
                return 'Institutional Registration Desk';
            case 'schoolProfile':
                return 'Institutional Identity & Official Seal';
            case 'operators':
                return 'Operator Access Governance & Desk Keys';
            default:
                return 'National Executive Metrics & Operations Console';
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            <Navbar />
            
            {/* Top Sub-Header & Breadcrumb Bar */}
            <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 text-left text-xs w-full">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                        <span>NAD Console</span>
                        <span>/</span>
                        <span className="text-slate-900 font-bold font-sans">{getBreadcrumbTitle(pathSegment)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold hidden sm:inline">
                        ● Single-Active Lock: Active
                    </span>
                </div>
            </div>

            <div className="flex-1 flex w-full items-stretch">
                {/* Modern Enterprise Left-Corner Sticky Sidebar */}
                <div className="hidden md:block w-64 shrink-0 bg-white border-r border-slate-200 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
                    <Sidebar />
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-slate-50/70 overflow-y-auto">
                    <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-7 text-left">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;