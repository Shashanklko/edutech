import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Building, Send, ShieldAlert, Key, Globe, RotateCw, Landmark, GraduationCap, CheckCircle2, Eye, ShieldCheck, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddSchool = () => {
    const { user } = useContext(AuthContext);
    const uId = (user?.id || user?.authorityCode || user?.username || '').toUpperCase();
    const opId = (user?.operatorId || '').toUpperCase();
    const isTopAdmin = uId === 'ADMIN' || opId.includes('ADMIN');
    const isBoard = user?.tier === 'board' || ['CBSE', 'UP-BOARD', 'CISCE'].includes(uId) || uId.startsWith('OP-CBSE') || uId.startsWith('OP-UPBOARD') || uId.startsWith('OP-CISCE') || opId.includes('CBSE') || opId.includes('UPBOARD') || opId.includes('CISCE');
    const canCreate = isTopAdmin || isBoard;

    const [formData, setFormData] = useState({
        institutionType: 'school', // 'school' | 'college' | 'university'
        schoolId: '',
        name: '',
        state: isBoard && uId.includes('UP') ? 'Uttar Pradesh' : 'Delhi',
        region: '',
        boardCode: isBoard ? uId : 'CBSE',
        affiliation: isBoard && uId.includes('UP') ? 'UP Board (UPMSP) Affiliated' : 'Central Board of Secondary Education (CBSE)',
        password: 'admin123'
    });
    const [generatingId, setGeneratingId] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchGeneratedId = async (type = 'school') => {
        setGeneratingId(true);
        try {
            const res = await axios.get(`/api/schools/generate-id?type=${type}`);
            setFormData(prev => ({
                ...prev,
                institutionType: type,
                schoolId: res.data.id
            }));
        } catch (err) {
            console.error("Failed to generate institution ID", err);
        } finally {
            setGeneratingId(false);
        }
    };

    useEffect(() => {
        if (canCreate) {
            fetchGeneratedId('school');
        }
    }, [canCreate]);

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, institutionType: type }));
        fetchGeneratedId(type);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const res = await axios.post('/api/schools', {
                ...formData,
                caller: user
            });
            const assignedId = res.data.generatedId || formData.schoolId;
            setSuccessMessage(`Successfully registered ${formData.institutionType.toUpperCase()}: "${formData.name}" with System Registry ID [${assignedId}].`);
            setFormData({
                institutionType: formData.institutionType,
                schoolId: '',
                name: '',
                state: formData.state,
                region: '',
                boardCode: formData.boardCode,
                affiliation: '',
                password: 'admin123'
            });
            fetchGeneratedId(formData.institutionType);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Failed to register institution.');
        }
    };

    // If logged in as Government (Central MOE or State MOE), deny access with clear explanation
    if (!canCreate) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-left space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <ShieldAlert size={26} />
                    </div>
                    <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded">
                            Statutory Governance Separation
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-2">
                            Institution Registration Restricted to Boards & Master Admin
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed mt-2">
                            Under the Federal Education Regulatory Framework, <strong>Government Ministries and State Directorates hold supervisory audit oversight only</strong>. Institution registration, school charter issuance, and accreditation are strictly delegated to autonomous <strong>Examination Boards (CBSE, UPMSP, CISCE, UGC/AICTE)</strong> and the <strong>Master Depository Administrator</strong>.
                        </p>
                    </div>

                    <div className="p-3.5 bg-white border border-amber-200 rounded-xl text-xs space-y-1.5 font-mono text-slate-700">
                        <p><strong>Your Authenticated Role:</strong> {user?.name || user?.id} ({user?.tier?.toUpperCase()} GOV)</p>
                        <p><strong>Permitted Actions:</strong> Institutional Auditing, District Monitoring, Enrolment Verification, State-to-Central Reporting.</p>
                        <p><strong>Restricted Action:</strong> Institution Charter & Profile Creation.</p>
                    </div>

                    <div className="pt-2">
                        <Link
                            to="/dashboard/schools"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs transition-all shadow-xs"
                        >
                            <ArrowLeft size={14} /> Back to Institutions Directory (View Only)
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-300 space-y-6 text-left">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Building size={24} />
                    </div>
                    Register New Academic Institution
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Authorize a new K-12 school, college, or university on the EduVera Student Education & Migration Registry.
                </p>
            </div>

            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 font-medium animate-in fade-in">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2.5 font-medium animate-in fade-in">
                    <ShieldAlert size={18} className="text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Form Box */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Institution Classification Selector */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Select Institution Classification *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => handleTypeSelect('school')}
                                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                                    formData.institutionType === 'school'
                                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs ring-2 ring-blue-500/20'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-medium'
                                }`}
                            >
                                <span className="block text-xl mb-1">🏫</span>
                                <span className="text-xs font-bold block">K-12 School</span>
                                <span className="text-[10px] font-mono text-gray-400">Prefix: SCH-</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeSelect('college')}
                                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                                    formData.institutionType === 'college'
                                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-500/20'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-medium'
                                }`}
                            >
                                <span className="block text-xl mb-1">🎓</span>
                                <span className="text-xs font-bold block">Degree College</span>
                                <span className="text-[10px] font-mono text-gray-400">Prefix: CLG-</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeSelect('university')}
                                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                                    formData.institutionType === 'university'
                                        ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold shadow-xs ring-2 ring-purple-500/20'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-medium'
                                }`}
                            >
                                <span className="block text-xl mb-1">🏛️</span>
                                <span className="text-xs font-bold block">University / Apex</span>
                                <span className="text-[10px] font-mono text-gray-400">Prefix: UNIV-</span>
                            </button>
                        </div>
                    </div>

                    {/* System-Generated Registry ID Card */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                                    System-Assigned Registry ID
                                </span>
                                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                                    Auto-Assigned
                                </span>
                            </div>
                            <p className="font-mono font-black text-lg text-blue-800 mt-1">
                                {generatingId ? 'Generating ID...' : (formData.schoolId || 'Loading...')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchGeneratedId(formData.institutionType)}
                            disabled={generatingId}
                            className="text-xs text-slate-700 hover:text-blue-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-300 transition-colors cursor-pointer"
                        >
                            <RotateCw size={13} className={generatingId ? 'animate-spin' : ''} />
                            <span>Regenerate ID</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* School Name */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Building size={16} className="text-gray-400" />
                                Institution Full Official Name *
                            </label>
                            <input 
                                required 
                                type="text"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder={
                                    formData.institutionType === 'university'
                                        ? "e.g. Jawaharlal Nehru University"
                                        : formData.institutionType === 'college'
                                        ? "e.g. St. Stephen's College (University of Delhi)"
                                        : "e.g. Delhi Public School R.K. Puram"
                                }
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Region/District */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Globe size={16} className="text-gray-400" />
                                Region / District *
                            </label>
                            <input 
                                required 
                                type="text"
                                value={formData.region} 
                                onChange={(e) => setFormData({...formData, region: e.target.value})}
                                placeholder="e.g. North Zone, New Delhi"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Initial Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Key size={16} className="text-gray-400" />
                                Default Access Passcode *
                            </label>
                            <input 
                                required 
                                type="text"
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="Default passcode"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono font-bold"
                            />
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-xs text-amber-700">
                        <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-bold">National Depository Compliance Notice</p>
                            <p className="mt-1 leading-relaxed">
                                Once registered, this academic institution will be authorized to access the centralized migration registry, process Transfer Certificates, and submit official grade marks.
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={generatingId}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 flex items-center gap-2 text-sm cursor-pointer"
                        >
                            <Send size={16} /> 
                            Authorize & Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSchool;
