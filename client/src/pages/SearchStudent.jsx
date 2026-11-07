import React, { useState } from 'react';
import { Search, UserX, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchStudent = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setError("");

        const q = searchQuery.trim().toUpperCase();
        if (!q) return;

        setLoading(true);
        try {
            await axios.get(`/api/student/${q}`);
            navigate(`/dashboard/student/${q}`);
        } catch (err) {
            setError(err.response?.data?.error || `No student found with ID: ${q}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8 text-left">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                        <Search size={20} />
                    </div>
                    Search Student Registry
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Lookup any student across all institutions by their Lifelong Unique Student Identifier (L-USI).
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter USI (e.g. RAHUL052010)"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 uppercase"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? "Searching..." : "Inspect Academic Record"} <ArrowRight size={14} />
                    </button>
                </form>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                        <UserX size={16} className="text-red-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">Quick Test Records in Database:</p>
                    <div className="flex flex-wrap gap-2">
                        {['RAHUL052010', 'PRIYA082012', 'ARJUN032009', 'SNEHA012003', 'VIKRAM112011'].map(id => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setSearchQuery(id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 transition-colors"
                            >
                                {id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchStudent;
