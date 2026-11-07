import React from 'react';
import { ShieldCheck, Lock, Globe2, ArrowUpRight, CheckCircle2, Shield, FileCheck, Phone, HelpCircle } from 'lucide-react';

const Footer = () => {
    const handleScrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-14 pb-8 text-left text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Upper Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    
                    {/* Brand & Authority Box */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-md bg-white text-slate-900 flex items-center justify-center font-bold">
                                <ShieldCheck size={18} className="text-slate-900" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white tracking-tight block">
                                    EduVera
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    Student Education & Migration Registry
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            National digital public infrastructure for lifelong student migration tracking, single-active school roll locks, and document-gated Transfer Certificate verification.
                        </p>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 rounded border border-slate-700 w-fit text-[11px] text-emerald-400 font-mono">
                            <CheckCircle2 size={12} className="shrink-0" />
                            <span>ISO 27001 &bull; AES-256 Encrypted</span>
                        </div>
                    </div>

                    {/* Citizen & Public Services */}
                    <div className="space-y-2.5">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                            Public Registry Services
                        </h4>
                        <ul className="space-y-1.5 text-xs">
                            <li><a href="#verify" className="hover:text-white transition-colors">Public Student USI Verification</a></li>
                            <li><a href="#services" className="hover:text-white transition-colors">Standard Operating Protocols (SOPs)</a></li>
                            <li><a href="#metrics" className="hover:text-white transition-colors">National Census & Migration Analytics</a></li>
                            <li><a href="#boards" className="hover:text-white transition-colors">Affiliated Boards & Councils</a></li>
                            <li><a href="#" onClick={handleScrollToTop} className="hover:text-blue-400 transition-colors">Return to Top &uarr;</a></li>
                        </ul>
                    </div>

                    {/* Statutory Accreditation & Boards */}
                    <div className="space-y-2.5">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                            Affiliated Education Bodies
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                            <li><span className="text-slate-200">CBSE:</span> Central Board of Secondary Education</li>
                            <li><span className="text-slate-200">CISCE:</span> Indian Certificate of Secondary Education</li>
                            <li><span className="text-slate-200">State Boards:</span> 28 State Secondary Education Boards</li>
                            <li><span className="text-slate-200">UGC & AICTE:</span> Technical & University Councils</li>
                        </ul>
                    </div>

                    {/* Support & Governance Helpline */}
                    <div className="space-y-2.5">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                            Technical Helpdesk & Grievance
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            For inter-state migration disputes, duplicate identifier resolutions, or institutional onboarding:
                        </p>
                        <div className="space-y-1 text-[11px] font-mono text-slate-300">
                            <p>Toll-Free Helpline: 1800-11-2026</p>
                            <p>Support Desk: support@eduvera.gov.in</p>
                            <p className="text-slate-500">Hours: Mon - Fri (09:00 - 18:00 IST)</p>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar & Legal Notice */}
                <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
                    <p>&copy; {new Date().getFullYear()} Ministry of Education &bull; EduVera &bull; Student Education & Migration Registry. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-slate-400">
                        <span>Statutory Single-Active Roll Lock</span>
                        <span>&bull;</span>
                        <span>Gazette Act 2026</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
