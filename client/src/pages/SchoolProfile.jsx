import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Building2, Calendar, Award, Phone, Mail, Globe, MapPin, User, Save, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SchoolProfile = () => {
    const { user } = useContext(AuthContext);
    
    const [profile, setProfile] = useState({
        id: '',
        name: '',
        region: '',
        establishedYear: '',
        affiliation: '',
        address: '',
        email: '',
        phone: '',
        principalName: '',
        website: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const targetSchoolId = user?.schoolId || user?.id;

    useEffect(() => {
        const fetchSchoolProfile = async () => {
            if (!targetSchoolId) return;
            try {
                const res = await axios.get(`/api/schools/${targetSchoolId}`);
                const data = res.data;
                setProfile({
                    id: data.id || '',
                    name: data.name || '',
                    region: data.region || '',
                    establishedYear: data.establishedYear || '',
                    affiliation: data.affiliation || '',
                    address: data.address || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    principalName: data.principalName || '',
                    website: data.website || ''
                });
            } catch (err) {
                console.error("Failed to load school profile", err);
                setError("Failed to fetch institution profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchSchoolProfile();
    }, [targetSchoolId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        try {
            await axios.put(`/api/schools/${targetSchoolId}`, profile);
            setMessage("Institution profile details updated successfully!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-medium">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading institution profile...
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto text-left pb-10">
            
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                            <Building2 size={20} />
                        </div>
                        Institution Profile & Credentials
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage official public profile, board affiliation, campus contact details, and certificate seal credentials.
                    </p>
                </div>
            </div>

            {/* Notification Alert */}
            {message && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Profile Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                
                {/* 1. Core Identification */}
                <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
                        <Building2 size={14} className="text-blue-600" /> 1. Institutional Identity
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Registry Identifier (USI-ID)</label>
                            <input 
                                type="text" 
                                disabled 
                                value={profile.id} 
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block font-semibold text-slate-700 mb-1">Institution Full Official Name *</label>
                            <input 
                                type="text" 
                                required 
                                name="name"
                                value={profile.name} 
                                onChange={handleChange}
                                placeholder="e.g. ABC Public Senior Secondary School"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Region / District *</label>
                            <input 
                                type="text" 
                                required 
                                name="region"
                                value={profile.region} 
                                onChange={handleChange}
                                placeholder="e.g. North Region, New Delhi"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Year of Establishment</label>
                            <input 
                                type="number" 
                                name="establishedYear"
                                value={profile.establishedYear} 
                                onChange={handleChange}
                                placeholder="e.g. 1998"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Board Affiliation / Code</label>
                            <input 
                                type="text" 
                                name="affiliation"
                                value={profile.affiliation} 
                                onChange={handleChange}
                                placeholder="e.g. CBSE Affiliated #2130045"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Campus & Administration Details */}
                <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
                        <MapPin size={14} className="text-blue-600" /> 2. Campus Administration & Contact
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div className="sm:col-span-2">
                            <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
                            <input 
                                type="text" 
                                name="address"
                                value={profile.address} 
                                onChange={handleChange}
                                placeholder="Street Address, Sector, City, Postal Code"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Principal / Head of Institution</label>
                            <input 
                                type="text" 
                                name="principalName"
                                value={profile.principalName} 
                                onChange={handleChange}
                                placeholder="e.g. Dr. Alok Verma"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                value={profile.email} 
                                onChange={handleChange}
                                placeholder="principal@school.edu.in"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Official Phone Number</label>
                            <input 
                                type="text" 
                                name="phone"
                                value={profile.phone} 
                                onChange={handleChange}
                                placeholder="+91 11 2786 4401"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Institution Website URL</label>
                            <input 
                                type="text" 
                                name="website"
                                value={profile.website} 
                                onChange={handleChange}
                                placeholder="https://school.edu.in"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                        <Save size={14} />
                        {saving ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                </div>

            </form>

        </div>
    );
};

export default SchoolProfile;
