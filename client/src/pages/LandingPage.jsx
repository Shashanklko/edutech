import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    Search, ArrowRight, ShieldCheck, CheckCircle2, Building2, Landmark, GraduationCap, 
    Lock, KeyRound, Globe2, FileText, ArrowRightLeft, Sparkles, AlertCircle, Check, 
    ExternalLink, Activity, BookOpen, Layers, Award, User, Phone, Mail, Building, 
    Send, ShieldAlert, Atom, Stethoscope, Dna, Microscope, Cpu, Cog, DraftingCompass, 
    Calculator, Scale, Globe, Coins, Banknote, TrendingUp, FlaskConical, HeartPulse, 
    CircuitBoard, Orbit, School 
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const LandingPage = () => {
    // Login Modal State
    const [showLogin, setShowLogin] = useState(false);
    const [loginTab, setLoginTab] = useState("student"); // 'student', 'school', 'board', 'authority'
    
    // School / Board / Authority credentials
    const [userId, setUserId] = useState("");
    const [operatorId, setOperatorId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Student Direct Login (Student ID + Aadhaar Number)
    const [studentIdInput, setStudentIdInput] = useState("");
    const [aadhaarInput, setAadhaarInput] = useState("");
    const [studentLoading, setStudentLoading] = useState(false);

    // Agency Verification Request Modal State
    const [showAgencyModal, setShowAgencyModal] = useState(false);
    const [agencyForm, setAgencyForm] = useState({
        agencyName: "",
        agencyRegistrationId: "",
        requesterName: "",
        requesterEmail: "",
        requesterPhone: "",
        purpose: "Pre-Employment Background Verification",
        studentId: ""
    });
    const [agencyLoading, setAgencyLoading] = useState(false);
    const [agencySuccess, setAgencySuccess] = useState(null);
    const [agencyError, setAgencyError] = useState("");

    // Public Fast Track
    const [trackId, setTrackId] = useState("");
    
    // Operator Password Reset Request Modal State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetForm, setResetForm] = useState({
        institutionId: "",
        operatorId: "",
        requesterName: "",
        requesterContact: "",
        reason: "Forgot desk passcode"
    });
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(null);
    const [resetError, setResetError] = useState("");

    // Overview Stats
    const [stats, setStats] = useState({
        totalStudents: 5,
        activeStudents: 4,
        transferredStudents: 1,
        totalInstitutions: 4,
        schoolsCount: 3,
        univsCount: 1,
        retentionRate: '100.0'
    });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleShowLogin = (e) => {
            if (e.detail?.tab) {
                setLoginTab(e.detail.tab);
            }
            setShowLogin(true);
        };
        window.addEventListener("show-login-portal", handleShowLogin);
        
        // Fetch live stats
        axios.get('/api/stats/overview').then(res => {
            if (res.data) setStats(res.data);
        }).catch(() => {});

        return () => window.removeEventListener("show-login-portal", handleShowLogin);
    }, []);

    // Preset login helper
    const handlePresetChannelLogin = (tab, id, opId = "", pwd = "admin123") => {
        setLoginTab(tab);
        setUserId(id);
        setOperatorId(opId);
        setPassword(pwd);
        setErrorMsg("");
    };

    // Handle Institution / Board / Authority Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        try {
            const response = await axios.post("/api/login", {
                id: userId,
                institutionId: userId,
                schoolId: userId,
                boardId: userId,
                authorityId: userId,
                stateId: userId,
                operatorId: operatorId ? operatorId.trim() : undefined,
                password: password,
                channel: loginTab
            });

            login(response.data);
            setShowLogin(false);
            navigate("/dashboard");
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Authentication failed. Please verify credentials.");
        }
    };

    // Handle Direct Student Login (Student ID + Aadhaar)
    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setStudentLoading(true);
        try {
            const res = await axios.post("/api/student/login", {
                studentId: studentIdInput,
                aadhaarNumber: aadhaarInput
            });
            login(res.data);
            setShowLogin(false);
            navigate(`/track/${res.data.uniqueId}`);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || "Student authentication failed. Please verify your Student ID and Aadhaar Number.");
        } finally {
            setStudentLoading(false);
        }
    };

    // Fast Track Search
    const handleTrack = (e) => {
        e.preventDefault();
        if (trackId.trim()) {
            navigate(`/track/${trackId.trim().toUpperCase()}`);
        }
    };

    // Handle Agency Request Submission
    const handleAgencySubmit = async (e) => {
        e.preventDefault();
        setAgencyError("");
        setAgencyLoading(true);
        try {
            const res = await axios.post("/api/agency-requests", agencyForm);
            setAgencySuccess(res.data.request);
            setAgencyForm({
                agencyName: "",
                agencyRegistrationId: "",
                requesterName: "",
                requesterEmail: "",
                requesterPhone: "",
                purpose: "Pre-Employment Background Verification",
                studentId: ""
            });
        } catch (err) {
            setAgencyError(err.response?.data?.error || "Failed to submit agency verification request");
        } finally {
            setAgencyLoading(false);
        }
    };

    // Handle Operator Reset Request Submission to Master Admin
    const handleOperatorResetSubmit = async (e) => {
        e.preventDefault();
        setResetError("");
        setResetLoading(true);
        try {
            const res = await axios.post("/api/operators/reset-request", resetForm);
            setResetSuccess(res.data);
            setResetForm({
                institutionId: "",
                operatorId: "",
                requesterName: "",
                requesterContact: "",
                reason: "Forgot desk passcode"
            });
        } catch (err) {
            setResetError(err.response?.data?.error || "Failed to route reset request to Master Admin");
        } finally {
            setResetLoading(false);
        }
    };

    const handlePresetLogin = (presetTab, presetId) => {
        setLoginTab(presetTab);
        setUserId(presetId);
        setPassword("admin123");
    };

    const handleDashboardLaunch = (channel, id, opId = '') => {
        setLoginTab(channel);
        setUserId(id);
        setOperatorId(opId);
        setPassword("admin123");
        setErrorMsg("");
        setShowLogin(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-800 selection:text-white">
            <Navbar />

            {/* FULL HERO SECTION WITH EDUCATION-AGITATE.PNG ARTISTIC CANVAS */}
            <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                {/* Immersive Canvas Background with Feathered Edges */}
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-35 pointer-events-none">
                    <img 
                        src="/education-agitate.png" 
                        alt="EduVera Student Education & Migration Registry Infrastructure Canvas"
                        className="w-full h-full object-cover object-center scale-105"
                        style={{
                            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)',
                            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)'
                        }}
                    />
                </div>

                {/* Subtle Gradient Veil */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950 z-0"></div>

                {/* FLOATING ACADEMIC & PROFESSIONAL DISCIPLINE SYMBOLS LAYER */}
                <div className="absolute inset-0 z-[5] overflow-hidden pointer-events-none select-none">
                    
                    {/* --- 1. MATHEMATICS (Calculator, Pi, Sigma, Sqrt, Calculus) --- */}
                    <div className="absolute top-5 sm:top-10 left-3 sm:left-8 lg:left-14 animate-float-slow pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40 text-xs font-medium hover:border-cyan-400/60 hover:bg-cyan-900/40 transition-all cursor-default group">
                            <span className="p-1 rounded-full bg-cyan-500/20 text-cyan-300">
                                <Calculator size={14} className="group-hover:scale-110 transition-transform" />
                            </span>
                            <span className="font-mono font-bold tracking-wide text-cyan-200">π &bull; ∑ &bull; √x</span>
                            <span className="text-[11px] text-cyan-400/80 uppercase font-semibold tracking-wider hidden sm:inline">| Math</span>
                        </div>
                    </div>

                    <div className="absolute top-[20%] left-[22%] animate-float-drift text-cyan-400/70 font-serif font-black text-2xl drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] hidden md:block">
                        π
                    </div>
                    <div className="absolute top-[70%] left-[28%] animate-float-slow text-blue-400/70 font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] hidden md:block">
                        ∑
                    </div>
                    <div className="absolute top-[38%] left-[24%] animate-float-gentle text-sky-300/60 font-mono text-xs px-2 py-0.5 rounded bg-sky-950/30 border border-sky-500/20 hidden lg:block">
                        ∫ f(x) dx
                    </div>
                    <div className="absolute top-[14%] left-[45%] animate-float-reverse text-cyan-300/50 font-serif font-bold text-lg hidden md:block">
                        ∞
                    </div>

                    {/* --- 2. PHYSICS & QUANTUM (Atom, E=mc², Orbit, Thermodynamics) --- */}
                    <div className="absolute top-5 sm:top-10 right-3 sm:right-8 lg:right-14 animate-float-reverse pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-950/40 text-xs font-medium hover:border-indigo-400/60 hover:bg-indigo-900/40 transition-all cursor-default group">
                            <span className="p-1 rounded-full bg-indigo-500/20 text-indigo-300">
                                <Atom size={14} className="animate-spin-very-slow group-hover:scale-110 transition-transform" />
                            </span>
                            <span className="font-mono font-bold text-indigo-200">E = mc²</span>
                            <span className="text-[11px] text-indigo-400/80 uppercase font-semibold tracking-wider hidden sm:inline">| Physics</span>
                        </div>
                    </div>

                    <div className="absolute top-[18%] right-[22%] animate-spin-very-slow text-indigo-400/70 drop-shadow-[0_0_14px_rgba(129,140,248,0.6)] hidden md:block">
                        <Atom size={28} />
                    </div>
                    <div className="absolute top-[30%] right-[18%] animate-float-drift text-violet-300/70 font-mono font-semibold text-xs px-2 py-0.5 rounded bg-violet-950/30 border border-violet-500/20 hidden md:block">
                        λ &bull; hν = ΔE
                    </div>
                    <div className="absolute top-[72%] right-[28%] animate-float-gentle text-purple-400/60 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] hidden md:block">
                        <FlaskConical size={20} />
                    </div>
                    <div className="absolute top-[40%] right-[22%] animate-float-reverse text-indigo-300/50 hidden lg:block">
                        <Orbit size={22} />
                    </div>

                    {/* --- 3. MBBS & CLINICAL SCIENCES (Stethoscope, DNA, Heartbeat, Medicine) --- */}
                    <div className="absolute top-1/2 -translate-y-24 sm:-translate-y-16 left-2 sm:left-6 lg:left-10 animate-float-gentle pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 backdrop-blur-md shadow-lg shadow-rose-950/40 text-xs font-medium hover:border-rose-400/60 hover:bg-rose-900/40 transition-all cursor-default group">
                            <span className="p-1 rounded-full bg-rose-500/20 text-rose-300">
                                <Stethoscope size={14} className="group-hover:scale-110 transition-transform" />
                            </span>
                            <span className="font-mono font-bold text-rose-200">DNA &bull; Rx</span>
                            <span className="text-[11px] text-rose-400/80 uppercase font-semibold tracking-wider hidden sm:inline">| MBBS</span>
                        </div>
                    </div>

                    <div className="absolute top-[32%] left-[16%] animate-float-slow text-rose-400/70 drop-shadow-[0_0_12px_rgba(251,113,133,0.5)] hidden md:block">
                        <Dna size={22} />
                    </div>
                    <div className="absolute top-[58%] left-[10%] animate-float-drift text-pink-400/65 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)] hidden md:block">
                        <HeartPulse size={20} />
                    </div>
                    <div className="absolute bottom-[24%] left-[20%] animate-float-gentle text-rose-300/60 hidden lg:block">
                        <Microscope size={20} />
                    </div>

                    {/* --- 4. ENGINEERING & TECHNOLOGY (CPU, Cogs, Circuit, Drafting) --- */}
                    <div className="absolute top-1/2 -translate-y-24 sm:-translate-y-16 right-2 sm:right-6 lg:right-10 animate-float-drift pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-lg shadow-amber-950/40 text-xs font-medium hover:border-amber-400/60 hover:bg-amber-900/40 transition-all cursor-default group">
                            <span className="p-1 rounded-full bg-amber-500/20 text-amber-300">
                                <Cpu size={14} className="group-hover:scale-110 transition-transform" />
                            </span>
                            <span className="font-mono font-bold text-amber-200">CAD &bull; 0101</span>
                            <span className="text-[11px] text-amber-400/80 uppercase font-semibold tracking-wider hidden sm:inline">| Engineering</span>
                        </div>
                    </div>

                    <div className="absolute top-[36%] right-[10%] animate-spin-very-slow text-amber-400/70 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] hidden md:block">
                        <Cog size={24} />
                    </div>
                    <div className="absolute top-[64%] right-[16%] animate-float-reverse text-amber-300/65 drop-shadow-[0_0_10px_rgba(252,211,77,0.5)] hidden md:block">
                        <CircuitBoard size={20} />
                    </div>
                    <div className="absolute bottom-[24%] right-[12%] animate-float-slow text-orange-400/60 hidden lg:block">
                        <DraftingCompass size={20} />
                    </div>

                    {/* --- 5. BANKING & COMMERCE (Rupee ₹, Landmark Bank, Coins, Ledger) --- */}
                    <div className="absolute bottom-5 sm:bottom-10 left-3 sm:left-8 lg:left-14 animate-float-slow pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/40 text-xs font-medium hover:border-emerald-400/60 hover:bg-emerald-900/40 transition-all cursor-default group">
                            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                <Landmark size={14} className="group-hover:scale-110 transition-transform" />
                            </span>
                            <span className="font-mono font-bold text-emerald-200">₹ &bull; FinTech</span>
                            <span className="text-[11px] text-emerald-400/80 uppercase font-semibold tracking-wider hidden sm:inline">| Banking</span>
                        </div>
                    </div>

                    <div className="absolute bottom-[26%] left-[12%] animate-float-gentle text-emerald-400/75 font-serif font-black text-2xl drop-shadow-[0_0_14px_rgba(52,211,153,0.6)] hidden md:block">
                        ₹
                    </div>
                    <div className="absolute bottom-[16%] left-[26%] animate-float-reverse text-emerald-300/65 hidden lg:block">
                        <Coins size={20} />
                    </div>
                    <div className="absolute bottom-[22%] right-[34%] animate-float-slow text-green-400/65 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] hidden md:block">
                        <TrendingUp size={20} />
                    </div>

                    {/* --- 6. SOCIAL SCIENCE & LAW (Scale of Justice, Globe, Constitution) --- */}
                    <div className="absolute bottom-5 sm:bottom-10 right-3 sm:right-8 lg:right-14 animate-float-reverse pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-teal-950/40 border border-teal-500/30 text-teal-300 backdrop-blur-md shadow-lg shadow-teal-950/40 text-xs font-medium hover:border-teal-400/60 hover:bg-teal-900/40 transition-all cursor-default group">
                            <span className="p-1 rounded-full bg-teal-500/20 text-teal-300">
                                <Scale size={14} className="group-hover:scale-110 transition-transform" />
                            </span>
                            <span className="font-mono font-bold text-teal-200">Civics &bull; Law</span>
                            <span className="text-[11px] text-teal-400/80 uppercase font-semibold tracking-wider hidden sm:inline">| Social Science</span>
                        </div>
                    </div>

                    <div className="absolute top-[26%] right-[32%] animate-float-slow text-teal-400/65 drop-shadow-[0_0_12px_rgba(45,212,191,0.5)] hidden md:block">
                        <Scale size={22} />
                    </div>
                    <div className="absolute top-[14%] left-[32%] animate-float-reverse text-sky-400/60 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] hidden lg:block">
                        <Globe size={20} />
                    </div>
                    <div className="absolute bottom-[16%] right-[22%] animate-float-gentle text-teal-300/60 hidden lg:block">
                        <BookOpen size={20} />
                    </div>

                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
                    
                    {/* Official Authority Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-semibold backdrop-blur-sm animate-in fade-in duration-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        STUDENT EDUCATION & MIGRATION REGISTRY &bull; SOVEREIGN DIGITAL INFRASTRUCTURE
                    </div>

                    {/* Grand Title & Quote */}
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                            EduVera : Student Education & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">Migration Registry</span>
                        </h1>
                        
                        <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-4xl mx-auto shadow-2xl">
                            <p className="text-base sm:text-xl text-slate-200 font-serif italic leading-relaxed">
                                &ldquo;Uniting every classroom milestone, board certification, transfer clearance, and university degree into an unbroken, sovereign timeline for 1.4 billion learners.&rdquo;
                            </p>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed pt-1">
                            Interconnecting primary schools, 28 state education boards, CBSE, ICSE, polytechnics, and central universities under an Aadhaar-verified Unique Student Identifier (USI).
                        </p>
                    </div>
                </div>
            </section>

            {/* CHOOSE YOUR ADMINISTRATIVE DASHBOARD SECTION (#choose-dashboard) */}
            <section id="choose-dashboard" className="py-20 bg-slate-950 border-b border-slate-800 text-white text-left relative overflow-hidden scroll-mt-12">
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Layers size={12} /> Statutory Administrative Access
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Choose Your Administrative Dashboard
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Access dedicated governance consoles tailored specifically to your administrative jurisdiction, responsibilities, and operational mandate.
                        </p>
                    </div>

                    {/* Four Access Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* 1. Central Government */}
                        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-purple-400/60 hover:bg-slate-900 transition-all backdrop-blur-sm group shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        Tier 1 &bull; National Apex
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                                        <Landmark size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                                        Central Government
                                    </h3>
                                    <p className="text-[11px] text-purple-200/70 font-mono mt-0.5">Ministry of Education (MOE)</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    National monitoring authority. Monitors macro-educational indices, interstate student migration trends, scheme fund tracking, and evaluates State Government periodic returns.
                                </p>
                                <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-400 shrink-0" /> National Overview & Macro GER</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-400 shrink-0" /> Interstate Migration Matrix</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-400 shrink-0" /> State Report Review & Certification</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-400 shrink-0" /> National Scheme Monitoring</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleDashboardLaunch('authority', 'ADMIN', 'OP-ADMIN-01')}
                                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                Launch Central Dashboard <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* 2. State Government */}
                        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-amber-400/60 hover:bg-slate-900 transition-all backdrop-blur-sm group shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Tier 2 &bull; State Department
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                                        <Building2 size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                        State Government
                                    </h3>
                                    <p className="text-[11px] text-amber-200/70 font-mono mt-0.5">State Directorate of Education</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Supervises District Education Officers (DEO), in-state institutions, BEO retention investigations for unenrolled transitions, and submits statutory returns to the Central Ministry.
                                </p>
                                <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-400 shrink-0" /> District & Block DEO/BEO Management</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-400 shrink-0" /> Retention Radar & Field Visits</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-400 shrink-0" /> State Institutional Registry</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-400 shrink-0" /> Central MOE Reporting Desk</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleDashboardLaunch('authority', 'UP-MOE', 'OP-UP-MOE')}
                                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                Launch State Dashboard <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* 3. Education Boards */}
                        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-blue-400/60 hover:bg-slate-900 transition-all backdrop-blur-sm group shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        Tier 3 &bull; Examination Board
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                                        <Award size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                                        Education Boards
                                    </h3>
                                    <p className="text-[11px] text-blue-200/70 font-mono mt-0.5">CBSE, CISCE, UP Board, State Boards</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Independent examination authorities. Manages affiliated institutions, candidate roll number gazettes, board results, passing certificates, and third-party verification requests.
                                </p>
                                <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400 shrink-0" /> Affiliated Institution Registry</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400 shrink-0" /> Affiliation Application Inspection</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400 shrink-0" /> Candidate Roll Number Gazette</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400 shrink-0" /> Employer / Agency Verification</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleDashboardLaunch('board', 'CBSE', 'OP-CBSE-01')}
                                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                Launch Board Dashboard <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* 4. Educational Institutions */}
                        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-emerald-400/60 hover:bg-slate-900 transition-all backdrop-blur-sm group shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Tier 4 &bull; Institution Node
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                                        <GraduationCap size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                                        Educational Institutions
                                    </h3>
                                    <p className="text-[11px] text-emerald-200/70 font-mono mt-0.5">School, College, or University</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Adaptive institutional console. Adapts dynamically to K-12 Schools (Class 1-12, TCs), Degree Colleges (Semesters, Credits), and Universities (Degrees, Convocations).
                                </p>
                                <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400 shrink-0" /> Single-Seat Lock & In-Transfer</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400 shrink-0" /> Student Registry & Marksheets</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400 shrink-0" /> Digital TC / Migration Clearance</li>
                                    <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400 shrink-0" /> Operator Desks & Passkey Controls</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleDashboardLaunch('school', 'SCH-CBSE-01', 'OP-DPS-01')}
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                Launch Institution Desk <ArrowRight size={13} />
                            </button>
                        </div>

                    </div>

                    {/* Statutory Role Isolation Protocol Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                                <ShieldCheck size={16} />
                            </div>
                            <p className="text-slate-300 leading-snug">
                                <strong className="text-white">Strict Statutory Role Isolation:</strong> Each tier operates within strict constitutional boundaries. School operators are hard-locked to K-12 (Classes 1-12 & TCs), Higher Education desks operate independently under UGC protocols, State Ministries oversee district enforcement, and Central MOE monitors macro data.
                            </p>
                        </div>
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
                        >
                            Open Central Console &rarr;
                        </Link>
                    </div>

                </div>
            </section>

            {/* SOVEREIGN ACCESS & DATA PRIVACY GOVERNANCE GATEWAY (#governance) */}
            <section id="governance" className="py-16 bg-white border-b border-slate-200 text-left relative scroll-mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    
                    <div className="text-center max-w-3xl mx-auto space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                            <Lock size={12} /> DPDP Act &bull; Statutory Privacy Architecture
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Sovereign Data Privacy & Access Governance
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            To protect citizen privacy, academic transcripts and Transfer Certificates are never exposed via unauthenticated public search. Access is strictly governed through three authenticated statutory gateways.
                        </p>
                    </div>

                    {/* 3 Dedicated Access Gateway Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Channel 1: Student Sovereign Gateway */}
                        <div className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xs hover:border-blue-400 transition-all text-left">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
                                    <User size={20} />
                                </div>
                                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded">
                                    Channel 01 &bull; Citizen Self-Service
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    Student Sovereign Depository
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Learners authenticate directly using their <strong>Student USI (PEN)</strong> and <strong>12-Digit Aadhaar UIDAI Number</strong> to access their lifelong credentials, grade marksheets, and official Transfer Certificates.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setLoginTab("student");
                                    setShowLogin(true);
                                }}
                                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                                <User size={14} /> Open Student Portal (Aadhaar) &rarr;
                            </button>
                        </div>

                        {/* Channel 2: Agency & Employer BGV Request Gateway */}
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xs hover:border-slate-400 transition-all text-left">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                                    <Building size={20} />
                                </div>
                                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                                    Channel 02 &bull; Third-Party Verification
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    Agency & Employer Request Desk
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Recruiters, background check agencies (BGV), and foreign universities cannot browse student databases. They must dispatch an audited verification request directly to the <strong>Central Education Board</strong>.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAgencyModal(true)}
                                className="w-full py-3 bg-slate-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                                <Building size={14} /> Submit Verification Request &rarr;
                            </button>
                        </div>

                        {/* Channel 3: Accredited Institution Operator Desk */}
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xs hover:border-slate-400 transition-all text-left">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold shadow-xs">
                                    <Landmark size={20} />
                                </div>
                                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/60 px-2 py-0.5 rounded">
                                    Channel 03 &bull; Accredited Nodes
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    Institution Operator Console
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Designated school headmasters and university registrars sign in via their registered operator code (e.g., <code className="font-mono text-[11px] text-blue-700">SCH001</code>, <code className="font-mono text-[11px] text-blue-700">UNIV001</code>) to process transfer admissions and grade updates.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setLoginTab("school");
                                    setShowLogin(true);
                                }}
                                className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                                <Building2 size={14} /> Institution Operator Sign In &rarr;
                            </button>
                        </div>

                    </div>

                </div>
            </section>

            {/* HUMAN STORYTELLING SECTION: THE NECESSITY OF EDUCATION & ACADEMIC CONTINUITY */}
            <section id="necessity" className="py-20 bg-slate-50 border-b border-slate-200 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    
                    <div className="max-w-3xl space-y-2">
                        <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
                            The Human Imperative &bull; Why Education Cannot Be Lost
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            The Necessity of Education: Preserving Every Child's Future
                        </h2>
                        <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                            Education is not merely an administrative record—it is the foundational birthright that empowers citizens and drives national development. Explore how EduVera ensures no child falls through the cracks of migration, poverty, or paperwork.
                        </p>
                    </div>

                    {/* STORY PART 1: LEFT IMAGE (education.png) + RIGHT CONTENT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
                        
                        {/* Canvas Faded Image 1 (Left Side) */}
                        <div className="lg:col-span-5 relative flex items-center justify-center">
                            <div className="relative overflow-hidden rounded-2xl w-full p-2 bg-gradient-to-br from-blue-50/50 to-slate-100">
                                <img 
                                    src="/education.png" 
                                    alt="Education Necessity & Child Continuity"
                                    className="w-full h-72 sm:h-80 object-cover rounded-xl transition-transform duration-700 hover:scale-103"
                                    style={{
                                        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
                                        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)'
                                    }}
                                />
                                <div className="mt-2 text-center">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                        Pillar I: Unbroken Access to Fundamental Learning
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content Story */}
                        <div className="lg:col-span-7 space-y-4 text-left">
                            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded uppercase tracking-wider">
                                The Crisis of Discontinuity
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                                Why Inter-State Migration Must Never Cost a Child Their Schooling
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Every year, over 1.5 million students across India face educational disruption when their parents relocate for employment. In the legacy paper-bound era, taking admission in a new state meant physical visits to previous schools, character certificates lost in transit, and bureaucratic delays spanning months.
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                A delay of just 30 days is often the tipping point where vulnerable children permanently drop out of school and enter informal labor. A child's hard-earned grades and formative years must never be erased by state borders or lost paperwork.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                    <CheckCircle2 size={15} /> Instant Inter-State Transfer Clearance
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                    <CheckCircle2 size={15} /> 100% Retained Academic Standing
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* STORY PART 2: LEFT CONTENT + RIGHT IMAGE (edumind.png) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
                        
                        {/* Left Content Story */}
                        <div className="lg:col-span-7 space-y-4 text-left order-2 lg:order-1">
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded uppercase tracking-wider">
                                The Sovereign Digital Mind
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                                Empowering Every Citizen with a Lifelong, Tamper-Proof Depository
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                True educational empowerment requires a cumulative, lifelong academic timeline. From elementary foundational literacy to higher secondary sciences, vocational diplomas, and university degrees, every milestone must be preserved under the student's sovereign control.
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                EduVera equips every citizen with an immutable Unique Student Identifier (USI). When a student receives a Transfer Certificate (TC), an automated <strong>State Dropout Radar</strong> watches over them. If 30 days pass without enrollment, district Block Education Officers (BEO) receive real-time alerts for doorstep outreach—guaranteeing that every mind fulfills its potential.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                                <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                                    <Activity size={15} /> Automated 30-Day BEO Outreach Radar
                                </span>
                                <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                                    <Award size={15} /> Counterfeit-Proof Degrees & Transcripts
                                </span>
                            </div>
                        </div>

                        {/* Canvas Faded Image 2 (Right Side) */}
                        <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2">
                            <div className="relative overflow-hidden rounded-2xl w-full p-2 bg-gradient-to-br from-indigo-50/50 to-slate-100">
                                <img 
                                    src="/edumind.png" 
                                    alt="Lifelong Academic Mind & Depository"
                                    className="w-full h-72 sm:h-80 object-cover rounded-xl transition-transform duration-700 hover:scale-103"
                                    style={{
                                        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
                                        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)'
                                    }}
                                />
                                <div className="mt-2 text-center">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                        Pillar II: Sovereign Intelligence & Lifelong Progression
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* Statutory Operating Framework (GovTech SOPs) */}
            <section id="services" className="py-16 bg-white border-b border-slate-200 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    
                    <div className="max-w-3xl space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
                            Statutory Governance Pillars
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Standard Operating Protocols of EduVera Student Education & Migration Registry
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Engineered to address structural compliance requirements under the Ministry of Education guidelines.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* SOP 1 */}
                        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                            <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                                01
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Anti-Ghost Single Active Lock</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                A student profile can only be active in one recognized institution at any time. Eliminates duplicate grant claims for mid-day meals and textbooks.
                            </p>
                        </div>

                        {/* SOP 2 */}
                        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                            <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                                02
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Gated Transfer Protocol</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Subsequent admission is electronically restricted until the releasing institution's Principal digitally signs the Transfer Certificate (TC) clearance.
                            </p>
                        </div>

                        {/* SOP 3 */}
                        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                03
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Lifelong Cumulative Timeline</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Maintains an unbroken chronological record across Primary, Secondary, Higher Secondary, and Higher Education degrees with attached marksheets.
                            </p>
                        </div>

                        {/* SOP 4 */}
                        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                            <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                04
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Out-of-School Early Alarm</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Discharges without subsequent enrollment trigger automatic alerts to the specific Examination Board where the student last studied for field outreach.
                            </p>
                        </div>

                    </div>

                </div>
            </section>

            {/* Affiliated Boards & Institutional Councils */}
            <section id="boards" className="py-16 bg-slate-50 border-b border-slate-200 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                        <div>
                            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
                                Multi-Tier Statutory Governance Framework
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-1">
                                Apex Regulatory Councils & Accredited Institutional Networks
                            </h3>
                            <p className="text-xs text-slate-600 mt-1">
                                Standardized under Ministry of Education guidelines with regulatory oversight across K-12 schooling, technical education, and university degrees.
                            </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-center">
                            Pan-India Interconnected Protocol
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                        
                        {/* Apex 1: UGC & Higher Ed */}
                        <div className="p-5 bg-white border-2 border-purple-200 hover:border-purple-400 rounded-xl space-y-2 shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">UGC</span>
                                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono font-bold border border-purple-200">Apex Higher Ed</span>
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px]">University Grants Commission</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Supreme statutory regulator governing Central, State, Deemed & Private Universities. Enforces National Credit Framework (NCrF) & Academic Bank of Credits (ABC).
                            </p>
                        </div>

                        {/* Apex 2: AICTE & Technical */}
                        <div className="p-5 bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-xl space-y-2 shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">AICTE</span>
                                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono font-bold border border-indigo-200">Apex Technical</span>
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px]">All India Council for Technical Education</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Regulates engineering colleges, management institutes, and polytechnics. Standardizes technical accreditation and inter-college credit migration.
                            </p>
                        </div>

                        {/* Apex 3: CBSE & National Schooling */}
                        <div className="p-5 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-xl space-y-2 shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">CBSE & CISCE</span>
                                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono font-bold border border-blue-200">National Schooling</span>
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px]">Central & National Education Boards</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Standardized curriculum and secondary examination boards interconnecting 28,000+ senior secondary schools under single-active roll locks.
                            </p>
                        </div>

                        {/* Apex 4: State Secondary Boards */}
                        <div className="p-5 bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-xl space-y-2 shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">State Councils</span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">State / UT Level</span>
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px]">28 State & UT Education Departments</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Manages district-level Block Education Officers (BEO), state school rosters, and the 30-Day Floating TC Dropout Early Warning Radar.
                            </p>
                        </div>

                    </div>

                </div>
            </section>

            {/* National Census & Live Macro Data Strip (Positioned at Bottom) */}
            <section id="metrics" className="py-10 bg-slate-900 text-white border-b border-slate-800 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        
                        <div className="border-l-2 border-blue-500 pl-4 space-y-0.5">
                            <p className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Total Active Enrolled</p>
                            <p className="text-2xl font-black text-white">{stats.activeStudents || stats.totalStudents || 5}</p>
                            <p className="text-[11px] text-emerald-400 font-medium">100% Identity Locked</p>
                        </div>

                        <div className="border-l-2 border-indigo-500 pl-4 space-y-0.5">
                            <p className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Registered Institutions</p>
                            <p className="text-2xl font-black text-white">{stats.totalInstitutions || 4}</p>
                            <p className="text-[11px] text-slate-300 font-medium">{stats.schoolsCount || 3} K-12 &bull; {stats.univsCount || 1} Univs</p>
                        </div>

                        <div className="border-l-2 border-amber-500 pl-4 space-y-0.5">
                            <p className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Transfer Certifications</p>
                            <p className="text-2xl font-black text-white">{stats.transferredStudents || 1}</p>
                            <p className="text-[11px] text-amber-300 font-medium">Discharged with Endorsements</p>
                        </div>

                        <div className="border-l-2 border-emerald-500 pl-4 space-y-0.5">
                            <p className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Education Retention Rate</p>
                            <p className="text-2xl font-black text-white">{stats.retentionRate || '100.0'}%</p>
                            <p className="text-[11px] text-emerald-400 font-medium">0 Ghost Dropouts Tracked</p>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />

            {/* MODAL 1: AUTHENTICATION PORTAL (Student Aadhaar + School + Board) */}
            {showLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-lg p-6 sm:p-8 shadow-xl text-left relative text-slate-900">
                        
                        <button 
                            onClick={() => {
                                setShowLogin(false);
                                setOtpStep(1);
                                setErrorMsg("");
                            }}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            &times;
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                                Statutory Authentication Gateway
                            </span>
                            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Depository Sign In</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Select your designated access role to proceed.</p>
                        </div>

                        {/* 4 Multi-Channel Role Selector Tabs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-md mb-4 border border-slate-200 text-[11px] font-bold">
                            <button
                                type="button"
                                onClick={() => { setLoginTab("student"); setErrorMsg(""); }}
                                className={`py-1.5 px-2 rounded transition-all cursor-pointer text-center ${
                                    loginTab === "student"
                                        ? "bg-white text-blue-700 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Student (Aadhaar)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginTab("school"); setErrorMsg(""); }}
                                className={`py-1.5 px-2 rounded transition-all cursor-pointer text-center ${
                                    loginTab === "school"
                                        ? "bg-white text-slate-900 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                School / Univ
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginTab("board"); setErrorMsg(""); }}
                                className={`py-1.5 px-2 rounded transition-all cursor-pointer text-center ${
                                    loginTab === "board"
                                        ? "bg-white text-slate-900 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Board Desk
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginTab("authority"); setErrorMsg(""); }}
                                className={`py-1.5 px-2 rounded transition-all cursor-pointer text-center ${
                                    loginTab === "authority"
                                        ? "bg-white text-slate-900 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Central & State Gov
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-2.5 mb-4 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                <AlertCircle size={14} className="shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        {/* CHANNEL 1: DIRECT STUDENT ID + AADHAAR NUMBER LOGIN */}
                        {loginTab === "student" && (
                            <form onSubmit={handleStudentLogin} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Student Unique ID (L-USI / PEN)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={studentIdInput}
                                        onChange={(e) => setStudentIdInput(e.target.value)}
                                        placeholder="e.g. RAHUL052010 or ARJUN032009"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-0.5 block">Permanent Education Number / Lifelong USI</span>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        12-Digit Aadhaar Number
                                    </label>
                                    <input 
                                        type="text" 
                                        maxLength={12}
                                        value={aadhaarInput}
                                        onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                                        placeholder="e.g. 548921047890"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-0.5 block">UIDAI identification number (No OTP required)</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={studentLoading || (!studentIdInput.trim() && !aadhaarInput.trim())}
                                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-md text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                                >
                                    <User size={13} /> {studentLoading ? "Authenticating Credential..." : "Access Student Depository"}
                                </button>

                                {/* Quick Student 1-Click Test Profiles */}
                                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px]">
                                    <p className="font-bold text-slate-500 mb-1.5 font-mono uppercase">Quick Test Student Identifiers (K-12 to Higher Ed):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentIdInput('RAHUL052010');
                                                setAadhaarInput('548921047890');
                                            }}
                                            className="p-1.5 rounded bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left transition-colors cursor-pointer"
                                        >
                                            <p className="font-bold text-blue-900">Rahul (Class 10 CBSE)</p>
                                            <p className="font-mono text-[9px] text-blue-700">RAHUL052010</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentIdInput('DEVANSH-IITD-2024');
                                                setAadhaarInput('999900001111');
                                            }}
                                            className="p-1.5 rounded bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 text-left transition-colors cursor-pointer"
                                        >
                                            <p className="font-bold text-purple-900">Devansh (IIT Delhi Grad)</p>
                                            <p className="font-mono text-[9px] text-purple-700">DEVANSH-IITD-2024</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentIdInput('AARAV052015');
                                                setAadhaarInput('111122223333');
                                            }}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 text-left transition-colors cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">Aarav (Class 5 UP Board)</p>
                                            <p className="font-mono text-[9px] text-slate-600">AARAV052015</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentIdInput('ARJUN032009');
                                                setAadhaarInput('876543210987');
                                            }}
                                            className="p-1.5 rounded bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-colors cursor-pointer"
                                        >
                                            <p className="font-bold text-amber-900">Arjun (Class 10 TC)</p>
                                            <p className="font-mono text-[9px] text-amber-700">ARJUN032009</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentIdInput('PRIYA122007');
                                                setAadhaarInput('666677778888');
                                            }}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 text-left transition-colors cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">Priya (Class 12 CBSE)</p>
                                            <p className="font-mono text-[9px] text-slate-600">PRIYA122007</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentIdInput('KABIR2022CS');
                                                setAadhaarInput('777788889999');
                                            }}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 text-left transition-colors cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">Kabir (DU Undergrad)</p>
                                            <p className="font-mono text-[9px] text-slate-600">KABIR2022CS</p>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* CHANNEL 2: SCHOOL & UNIVERSITY OPERATOR LOGIN */}
                        {loginTab === "school" && (
                            <form onSubmit={handleLogin} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Institution Code (School / University ID)
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="e.g. SCH-CBSE-01, SCH-UP-01, IIT-DELHI, UNIV001"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Desk Operator ID (Optional)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={operatorId}
                                        onChange={(e) => setOperatorId(e.target.value)}
                                        placeholder="e.g. OP-DPS-01, OP-GIC-LKO, OP-IITD-01"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-semibold text-slate-700">Access Passcode</label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setResetForm({ ...resetForm, institutionId: userId || '', operatorId: operatorId || '' });
                                                setShowResetModal(true);
                                            }}
                                            className="text-[10px] text-blue-700 font-semibold hover:underline cursor-pointer"
                                        >
                                            Forgot Passcode?
                                        </button>
                                    </div>
                                    <input 
                                        type="password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter operator passcode (admin123)"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-slate-900 hover:bg-blue-800 text-white font-bold rounded-md text-xs transition-all shadow-xs cursor-pointer mt-1"
                                >
                                    Authorize School / Univ Console
                                </button>

                                {/* Quick Autofill Credentials */}
                                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px]">
                                    <p className="font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">Test School & University Desks:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('school', 'SCH-CBSE-01', 'OP-DPS-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">DPS Noida (CBSE)</p>
                                            <p className="text-[9px] text-slate-500">SCH-CBSE-01</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('school', 'SCH-UP-01', 'OP-GIC-LKO')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">GIC Lucknow (UP)</p>
                                            <p className="text-[9px] text-slate-500">SCH-UP-01</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('school', 'IIT-DELHI', 'OP-IITD-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-purple-900">IIT Delhi</p>
                                            <p className="text-[9px] text-slate-500">IIT-DELHI</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('school', 'SCH-CBSE-02', 'OP-KV-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">KV Delhi Cantt</p>
                                            <p className="text-[9px] text-slate-500">SCH-CBSE-02</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('school', 'SCH-UP-02', 'OP-VMSS-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">Varanasi Model</p>
                                            <p className="text-[9px] text-slate-500">SCH-UP-02</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('school', 'UNIV001', 'OP-UNIV001')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">DTU Univ</p>
                                            <p className="text-[9px] text-slate-500">UNIV001</p>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* CHANNEL 3: SECONDARY BOARD OPERATOR LOGIN */}
                        {loginTab === "board" && (
                            <form onSubmit={handleLogin} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Examination Board Code
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="e.g. CBSE or UP-BOARD"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Board Desk Operator ID (Optional)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={operatorId}
                                        onChange={(e) => setOperatorId(e.target.value)}
                                        placeholder="e.g. OP-CBSE-01 or OP-UPBOARD-01"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-semibold text-slate-700">Passcode</label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setResetForm({ ...resetForm, institutionId: userId || '', operatorId: operatorId || '' });
                                                setShowResetModal(true);
                                            }}
                                            className="text-[10px] text-blue-700 font-semibold hover:underline cursor-pointer"
                                        >
                                            Forgot Passcode?
                                        </button>
                                    </div>
                                    <input 
                                        type="password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter board passcode (admin123)"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-slate-900 hover:bg-blue-800 text-white font-bold rounded-md text-xs transition-all shadow-xs cursor-pointer mt-1"
                                >
                                    Authorize Board Desk
                                </button>

                                {/* Quick Autofill Credentials */}
                                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px]">
                                    <p className="font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">Test Secondary Boards:</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('board', 'CBSE', 'OP-CBSE-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">CBSE Central Board</p>
                                            <p className="text-[9px] text-slate-500">CBSE (OP-CBSE-01)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('board', 'UP-BOARD', 'OP-UPBOARD-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">UP Board (UPMSP)</p>
                                            <p className="text-[9px] text-slate-500">UP-BOARD (OP-UPBOARD-01)</p>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* CHANNEL 4: CENTRAL & STATE GOV APEX AUTHORITIES */}
                        {loginTab === "authority" && (
                            <form onSubmit={handleLogin} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Authority / State Code
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="e.g. ADMIN, MOE, UP-MOE, UGC, AICTE"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Authorized Operator ID (Optional)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={operatorId}
                                        onChange={(e) => setOperatorId(e.target.value)}
                                        placeholder="e.g. OP-ADMIN-01, OP-MOE-01, OP-UP-MOE"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-700 focus:bg-white uppercase"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-semibold text-slate-700">Passcode</label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setResetForm({ ...resetForm, institutionId: userId || '', operatorId: operatorId || '' });
                                                setShowResetModal(true);
                                            }}
                                            className="text-[10px] text-blue-700 font-semibold hover:underline cursor-pointer"
                                        >
                                            Forgot Passcode?
                                        </button>
                                    </div>
                                    <input 
                                        type="password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter passkey (admin123)"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-slate-900 hover:bg-blue-800 text-white font-bold rounded-md text-xs transition-all shadow-xs cursor-pointer mt-1"
                                >
                                    Authorize Government Apex Console
                                </button>

                                {/* Quick Autofill Credentials */}
                                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px]">
                                    <p className="font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">Test Apex & State Authority Consoles:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('authority', 'ADMIN', 'OP-ADMIN-01')}
                                            className="p-1.5 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 font-mono text-purple-900 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-purple-950">Platform Lead</p>
                                            <p className="text-[9px] text-purple-700">ADMIN (Lead Admin)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('authority', 'MOE', 'OP-MOE-01')}
                                            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 font-mono text-blue-900 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-blue-950">Central Ministry</p>
                                            <p className="text-[9px] text-blue-700">MOE (Central)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('authority', 'UP-MOE', 'OP-UP-MOE')}
                                            className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 font-mono text-amber-900 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-amber-950">UP Directorate</p>
                                            <p className="text-[9px] text-amber-700">UP-MOE (State)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('authority', 'UGC', 'OP-UGC-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">UGC Council</p>
                                            <p className="text-[9px] text-slate-500">UGC (Higher Ed)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('authority', 'AICTE', 'OP-AICTE-01')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">AICTE Council</p>
                                            <p className="text-[9px] text-slate-500">AICTE (Technical)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChannelLogin('authority', 'STATE-DL', 'OP-STATE-DL')}
                                            className="p-1.5 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 font-mono text-slate-700 text-left cursor-pointer"
                                        >
                                            <p className="font-bold text-slate-900">Delhi State</p>
                                            <p className="text-[9px] text-slate-500">STATE-DL</p>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}

            {/* MODAL 2: THIRD-PARTY AGENCY BACKGROUND VERIFICATION REQUEST */}
            {showAgencyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-lg p-6 sm:p-8 shadow-xl text-left relative text-slate-900">
                        
                        <button 
                            onClick={() => {
                                setShowAgencyModal(false);
                                setAgencySuccess(null);
                                setAgencyError("");
                            }}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            &times;
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                                Central Depository Service
                            </span>
                            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Third-Party Verification Gateway</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Employers, background verification agencies, and universities can submit official credential check requests to the Central Education Board.
                            </p>
                        </div>

                        {agencySuccess ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 text-xs text-emerald-900">
                                <div className="flex items-center gap-2 font-bold text-emerald-800">
                                    <CheckCircle2 size={18} /> Request Dispatched to Central Education Board
                                </div>
                                <p className="leading-relaxed">
                                    Your verification request for student <strong>{agencySuccess.studentName} ({agencySuccess.studentId})</strong> has been registered under Tracking ID:
                                </p>
                                <div className="p-2 bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-950 text-sm text-center">
                                    {agencySuccess.requestId}
                                </div>
                                <p className="text-[11px] text-emerald-700">
                                    An official operator at the Central Education Board will review and authenticate the candidate's academic dossier. You will receive an encrypted verification certificate via {agencySuccess.requesterEmail}.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowAgencyModal(false);
                                        setAgencySuccess(null);
                                    }}
                                    className="w-full py-2 bg-slate-900 text-white font-bold rounded-md text-xs"
                                >
                                    Close Window
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAgencySubmit} className="space-y-3.5 text-xs">
                                {agencyError && (
                                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                        <AlertCircle size={14} className="shrink-0" />
                                        {agencyError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Agency / Employer Name *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={agencyForm.agencyName}
                                            onChange={(e) => setAgencyForm({...agencyForm, agencyName: e.target.value})}
                                            placeholder="e.g. Tata Consultancy Services HR"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Agency Reg / CIN No.</label>
                                        <input 
                                            type="text" 
                                            value={agencyForm.agencyRegistrationId}
                                            onChange={(e) => setAgencyForm({...agencyForm, agencyRegistrationId: e.target.value})}
                                            placeholder="e.g. CIN-L72200MH1995"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Requester Full Name *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={agencyForm.requesterName}
                                            onChange={(e) => setAgencyForm({...agencyForm, requesterName: e.target.value})}
                                            placeholder="e.g. Anil Deshmukh"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                                        <input 
                                            type="email" 
                                            required 
                                            value={agencyForm.requesterEmail}
                                            onChange={(e) => setAgencyForm({...agencyForm, requesterEmail: e.target.value})}
                                            placeholder="e.g. bgv@tcs.com"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Verification Purpose *</label>
                                    <select 
                                        value={agencyForm.purpose}
                                        onChange={(e) => setAgencyForm({...agencyForm, purpose: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-medium"
                                    >
                                        <option value="Pre-Employment Background Verification">Pre-Employment Background Verification</option>
                                        <option value="Higher Education Admission Clearance">Higher Education Admission Clearance</option>
                                        <option value="Immigration & Visa Verification">Immigration & Visa Verification</option>
                                        <option value="Government Grant & Scholarship Audit">Government Grant & Scholarship Audit</option>
                                        <option value="Legal & Judicial Clearance">Legal & Judicial Clearance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Target Student USI / Identifier *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={agencyForm.studentId}
                                        onChange={(e) => setAgencyForm({...agencyForm, studentId: e.target.value})}
                                        placeholder="e.g. RAHUL052010 or SNEHA012003"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono uppercase"
                                    />
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 font-mono">
                                    Routing: Direct Dispatch to Central Education Board Registry
                                </div>

                                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAgencyModal(false)}
                                        className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={agencyLoading}
                                        className="px-5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                                    >
                                        {agencyLoading ? "Dispatching..." : "Submit Verification Request"}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}

            {/* MODAL 3: OPERATOR PASSWORD RECOVERY / RESET REQUEST TO MASTER ADMIN */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-lg p-6 sm:p-7 shadow-xl text-left relative text-slate-900">
                        <button 
                            onClick={() => {
                                setShowResetModal(false);
                                setResetSuccess(null);
                                setResetError("");
                            }}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            &times;
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                                Sub-Desk Credential Recovery
                            </span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">Request Operator Passcode Reset</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Sub-desk operators can request their institution's Master Admin to reset or generate a new passkey.
                            </p>
                        </div>

                        {resetSuccess ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 text-xs text-emerald-900">
                                <div className="flex items-center gap-2 font-bold text-emerald-800">
                                    <CheckCircle2 size={18} /> Request Routed to Master Admin
                                </div>
                                <p className="leading-relaxed">
                                    Your passcode reset request has been routed to the Master Admin of institution <strong>{resetSuccess.request?.institutionId}</strong>.
                                </p>
                                <div className="p-2 bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-950 text-xs text-center">
                                    Tracking ID: {resetSuccess.requestId}
                                </div>
                                <p className="text-[11px] text-emerald-700">
                                    Please inform your Principal / Registrar / Master Admin. They can approve this reset request and issue your new passkey directly inside their <strong>Operator Governance Console</strong>.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowResetModal(false);
                                        setResetSuccess(null);
                                    }}
                                    className="w-full py-2 bg-slate-900 text-white font-bold rounded-md text-xs cursor-pointer"
                                >
                                    Close Window
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleOperatorResetSubmit} className="space-y-3 text-xs">
                                {resetError && (
                                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                        <AlertCircle size={14} className="shrink-0" />
                                        {resetError}
                                    </div>
                                )}

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Institution / Department Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={resetForm.institutionId}
                                        onChange={(e) => setResetForm({ ...resetForm, institutionId: e.target.value })}
                                        placeholder="e.g. SCH002, UNIV001, CBSE, STATE-DL"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono uppercase focus:border-blue-700 focus:bg-white"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-0.5 block">Your parent school or board code</span>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Operator ID *</label>
                                    <input
                                        type="text"
                                        required
                                        value={resetForm.operatorId}
                                        onChange={(e) => setResetForm({ ...resetForm, operatorId: e.target.value })}
                                        placeholder="e.g. OP-SCH002 or OP-CBSE-01"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono uppercase focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Staff / Operator Name</label>
                                    <input
                                        type="text"
                                        value={resetForm.requesterName}
                                        onChange={(e) => setResetForm({ ...resetForm, requesterName: e.target.value })}
                                        placeholder="e.g. Ravi Verma"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Contact Email / Phone</label>
                                    <input
                                        type="text"
                                        value={resetForm.requesterContact}
                                        onChange={(e) => setResetForm({ ...resetForm, requesterContact: e.target.value })}
                                        placeholder="e.g. ravi@school.edu or 9876543210"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Reason for Passcode Reset</label>
                                    <textarea
                                        rows={2}
                                        value={resetForm.reason}
                                        onChange={(e) => setResetForm({ ...resetForm, reason: e.target.value })}
                                        placeholder="Brief reason e.g. Forgot passkey during admission cycle"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:border-blue-700 focus:bg-white"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowResetModal(false)}
                                        className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={resetLoading}
                                        className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {resetLoading ? "Submitting..." : "Submit Reset Request"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default LandingPage;