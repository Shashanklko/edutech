import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AdmissionsHub from './pages/AdmissionsHub';
import StudentDetails from './pages/StudentDetails';
import SearchStudent from './pages/SearchStudent';
import CurrentStudents from './pages/CurrentStudents';
import AddSchool from './pages/AddSchool';
import ListedSchools from './pages/ListedSchools';
import SchoolProfile from './pages/SchoolProfile';
import OperatorManagement from './pages/OperatorManagement';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Public Verification & Ledger View */}
                <Route 
                    path="/track/:id" 
                    element={
                        <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
                            <Navbar />
                            <main className="max-w-6xl w-full mx-auto p-4 sm:p-8 flex-1">
                                <StudentDetails />
                            </main>
                            <Footer />
                        </div>
                    } 
                />
                
                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="admissions" element={<AdmissionsHub />} />
                    <Route path="addStudent" element={<AdmissionsHub />} />
                    <Route path="enroll" element={<AdmissionsHub />} />
                    <Route path="student/:id" element={<StudentDetails />} />
                    <Route path="search" element={<SearchStudent />} />
                    <Route path="students" element={<CurrentStudents />} />
                    <Route path="addSchool" element={<AddSchool />} />
                    <Route path="schools" element={<ListedSchools />} />
                    <Route path="schoolProfile" element={<SchoolProfile />} />
                    <Route path="operators" element={<OperatorManagement />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
};

export default App;