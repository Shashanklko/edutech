import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
    Users, ShieldAlert, KeyRound, UserPlus, RefreshCw, CheckCircle2, 
    AlertCircle, Lock, Trash2, Ban, Check, ShieldCheck, Sparkles, HelpCircle 
} from 'lucide-react';

const OperatorManagement = () => {
    const { user } = useContext(AuthContext);
    const institutionId = user?.institutionId || user?.schoolId || user?.id || 'SCH002';

    const [operators, setOperators] = useState([]);
    const [resetRequests, setResetRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // New Operator Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        operatorId: '',
        name: '',
        deskRole: 'Admissions & Records Officer',
        email: '',
        phone: '',
        password: 'admin123'
    });
    const [createLoading, setCreateLoading] = useState(false);

    // Direct Reset Password State
    const [resetModalOp, setResetModalOp] = useState(null);
    const [newPasswordInput, setNewPasswordInput] = useState('admin123');
    const [resetLoading, setResetLoading] = useState(false);

    // Approve Request Modal State
    const [approveModalReq, setApproveModalReq] = useState(null);
    const [approvePassInput, setApprovePassInput] = useState('admin123');

    const fetchAllData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const [opsRes, reqsRes] = await Promise.all([
                axios.get(`/api/operators?institutionId=${institutionId}`),
                axios.get(`/api/operators/reset-requests?institutionId=${institutionId}`)
            ]);
            setOperators(opsRes.data || []);
            setResetRequests(reqsRes.data || []);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to retrieve operator records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [institutionId]);

    // Handle Custom Operator Creation
    const handleCreateOperator = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await axios.post('/api/operators', {
                ...createForm,
                institutionId
            });
            setSuccessMsg(`Operator ${res.data.operator.operatorId} created and authorized successfully!`);
            setShowCreateModal(false);
            setCreateForm({
                operatorId: '',
                name: '',
                deskRole: 'Admissions & Records Officer',
                email: '',
                phone: '',
                password: 'admin123'
            });
            fetchAllData();
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to create operator');
        } finally {
            setCreateLoading(false);
        }
    };

    // Auto-suggest custom Operator ID
    const suggestOperatorId = (role) => {
        const cleanRole = role ? role.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) : 'DESK';
        const randomNum = Math.floor(10 + Math.random() * 90);
        return `OP-${institutionId}-${cleanRole}-${randomNum}`;
    };

    // Handle Direct Password Reset by Master Admin
    const handleDirectReset = async (e) => {
        e.preventDefault();
        if (!resetModalOp) return;
        setResetLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await axios.put(`/api/operators/${resetModalOp.operatorId}/password`, {
                institutionId,
                newPassword: newPasswordInput
            });
            setSuccessMsg(`Passcode for Operator "${resetModalOp.operatorId}" updated to "${newPasswordInput}".`);
            setResetModalOp(null);
            fetchAllData();
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setResetLoading(false);
        }
    };

    // Handle Approve Password Reset Request
    const handleApproveRequest = async (e) => {
        e.preventDefault();
        if (!approveModalReq) return;
        try {
            const res = await axios.put(`/api/operators/reset-requests/${approveModalReq.requestId}/approve`, {
                newPassword: approvePassInput,
                masterAdminId: institutionId
            });
            setSuccessMsg(`Approved! New temporary passkey "${res.data.temporaryPassword}" issued for ${approveModalReq.operatorId}.`);
            setApproveModalReq(null);
            fetchAllData();
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to approve reset request');
        }
    };

    // Toggle Active / Suspended Status
    const handleToggleStatus = async (op) => {
        const nextStatus = op.status === 'Active' ? 'Suspended' : 'Active';
        try {
            await axios.put(`/api/operators/${op.operatorId}/status`, {
                institutionId,
                status: nextStatus
            });
            setSuccessMsg(`Operator ${op.operatorId} is now ${nextStatus}.`);
            fetchAllData();
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to change operator status');
        }
    };

    // Delete Operator
    const handleDeleteOperator = async (operatorId) => {
        if (!window.confirm(`Are you sure you want to permanently revoke Operator ID "${operatorId}"?`)) return;
        try {
            await axios.delete(`/api/operators/${operatorId}?institutionId=${institutionId}`);
            setSuccessMsg(`Operator ${operatorId} deleted.`);
            fetchAllData();
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to delete operator');
        }
    };

    const pendingRequests = resetRequests.filter(r => r.status === 'Pending');

    return (
        <div className="space-y-6 text-left">
            
            {/* Header Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                            Master Admin Governance
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            Institution: {institutionId}
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mt-1">Operator Access & Passcode Governance</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Create custom operator IDs, supervise sub-desk access, and approve password resets for your department staff.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAllData}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        title="Refresh Operator List"
                    >
                        <RefreshCw size={14} />
                    </button>

                    <button
                        onClick={() => {
                            setCreateForm({
                                ...createForm,
                                operatorId: suggestOperatorId(createForm.deskRole)
                            });
                            setShowCreateModal(true);
                        }}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <UserPlus size={14} /> Custom Generate Operator
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                        {successMsg}
                    </div>
                    <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold hover:underline text-[11px]">&times;</button>
                </div>
            )}

            {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertCircle size={16} className="text-red-700 shrink-0" />
                        {errorMsg}
                    </div>
                    <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold hover:underline text-[11px]">&times;</button>
                </div>
            )}

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Authorized Operators</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{operators.length}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Active sub-desk operator accounts</p>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-700">Pending Reset Requests</span>
                    <p className="text-2xl font-black text-amber-900 mt-1">{pendingRequests.length}</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">Staff waiting for Master Admin passkey reset</p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-800">Master Authority Tier</span>
                    <p className="text-base font-bold text-blue-950 mt-1 truncate">{user?.name || institutionId}</p>
                    <p className="text-[11px] text-blue-700 mt-0.5 font-mono">ID: {institutionId}</p>
                </div>
            </div>

            {/* SECTION 1: PENDING OPERATOR PASSWORD RESET REQUESTS */}
            {pendingRequests.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={16} className="text-amber-800" />
                            <h2 className="text-xs font-bold text-amber-950 uppercase font-mono tracking-wider">
                                Urgent: Operator Password Reset Requests ({pendingRequests.length})
                            </h2>
                        </div>
                        <span className="text-[10px] text-amber-800 font-mono">Action Required by Master Admin</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingRequests.map((req) => (
                            <div key={req.requestId} className="p-3 bg-white border border-amber-200 rounded-lg shadow-2xs space-y-2 text-xs">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900">{req.requesterName} <span className="font-mono text-blue-700 font-bold">({req.operatorId})</span></p>
                                        <p className="text-[11px] text-slate-500 font-mono">Contact: {req.requesterContact || 'N/A'}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">Pending</span>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                                    <span className="font-semibold text-slate-500">Reason: </span> {req.reason}
                                </div>
                                <div className="pt-1 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 font-mono">{new Date(req.createdAt).toLocaleString()}</span>
                                    <button
                                        onClick={() => {
                                            setApproveModalReq(req);
                                            setApprovePassInput(`pass_${Math.floor(1000 + Math.random() * 9000)}`);
                                        }}
                                        className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] rounded transition-all cursor-pointer flex items-center gap-1"
                                    >
                                        <KeyRound size={12} /> Approve & Issue Passcode
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SECTION 2: OPERATOR ROSTER TABLE */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-700" />
                        <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                            Authorized Operator Desks ({operators.length})
                        </h2>
                    </div>
                    <span className="text-[11px] text-slate-500">Supervised by Master Admin Desk</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading operator registry...</div>
                ) : operators.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                        No sub-operators created yet. Click "Custom Generate Operator" above to add desk personnel.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100/70 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-600">
                                <tr>
                                    <th className="py-2.5 px-3">Operator ID</th>
                                    <th className="py-2.5 px-3">Staff Name</th>
                                    <th className="py-2.5 px-3">Desk Role</th>
                                    <th className="py-2.5 px-3">Contact</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Master Governance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {operators.map((op) => (
                                    <tr key={op.operatorId} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                                            {op.operatorId}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                                            {op.name}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]">
                                                {op.deskRole}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                                            {op.email || op.phone || 'N/A'}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                                op.status === 'Active' 
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                                    : 'bg-red-50 text-red-800 border border-red-200'
                                            }`}>
                                                {op.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right space-x-1.5">
                                            <button
                                                onClick={() => {
                                                    setResetModalOp(op);
                                                    setNewPasswordInput('admin123');
                                                }}
                                                className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-800 font-semibold text-[10px] cursor-pointer"
                                                title="Reset Passcode"
                                            >
                                                Reset Pass
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(op)}
                                                className={`px-2 py-1 rounded border text-[10px] font-semibold cursor-pointer ${
                                                    op.status === 'Active'
                                                        ? 'bg-slate-100 hover:bg-red-50 border-slate-200 hover:border-red-300 text-red-700'
                                                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                                                }`}
                                            >
                                                {op.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOperator(op.operatorId)}
                                                className="p-1 rounded text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                                title="Revoke Operator"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL 1: CUSTOM GENERATE OPERATOR */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-lg p-6 shadow-xl text-left text-slate-900 relative">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                            &times;
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                                Master Admin Provisioning
                            </span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">Custom Generate Operator ID</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Provision a new desk operator ID under institution <strong>{institutionId}</strong>.
                            </p>
                        </div>

                        <form onSubmit={handleCreateOperator} className="space-y-3 text-xs">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-semibold text-slate-700">Custom Operator ID *</label>
                                    <button
                                        type="button"
                                        onClick={() => setCreateForm({ ...createForm, operatorId: suggestOperatorId(createForm.deskRole) })}
                                        className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Sparkles size={11} /> Auto Suggest
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={createForm.operatorId}
                                    onChange={(e) => setCreateForm({ ...createForm, operatorId: e.target.value })}
                                    placeholder={`e.g. OP-${institutionId}-ADMISSIONS`}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-mono uppercase focus:border-blue-700 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Operator Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder="e.g. Rajesh Kumar"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:border-blue-700 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Desk Role / Function *</label>
                                <select
                                    value={createForm.deskRole}
                                    onChange={(e) => setCreateForm({ ...createForm, deskRole: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:border-blue-700 focus:bg-white"
                                >
                                    <option value="Admissions & Records Officer">Admissions & Records Officer</option>
                                    <option value="Academic Examination Controller">Academic Examination Controller</option>
                                    <option value="Transfer & TC Clearance Officer">Transfer & TC Clearance Officer</option>
                                    <option value="Verification & Census Desk">Verification & Census Desk</option>
                                    <option value="IT Operations Desk">IT Operations Desk</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        placeholder="operator@inst.edu"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Initial Passcode *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        placeholder="admin123"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 rounded-md bg-slate-900 hover:bg-blue-800 text-white font-bold transition-all shadow-xs"
                                >
                                    {createLoading ? 'Provisioning...' : 'Authorize Operator'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: DIRECT RESET PASSWORD */}
            {resetModalOp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white border border-slate-200 w-full max-w-sm rounded-lg p-6 shadow-xl text-left text-slate-900 relative">
                        <button
                            onClick={() => setResetModalOp(null)}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                            &times;
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                                Master Admin Override
                            </span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">Reset Operator Passcode</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Set a new passcode for <strong>{resetModalOp.name} ({resetModalOp.operatorId})</strong>.
                            </p>
                        </div>

                        <form onSubmit={handleDirectReset} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">New Operator Passcode *</label>
                                <input
                                    type="text"
                                    required
                                    value={newPasswordInput}
                                    onChange={(e) => setNewPasswordInput(e.target.value)}
                                    placeholder="Enter new passkey"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-mono focus:border-blue-700 focus:bg-white"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setResetModalOp(null)}
                                    className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all shadow-xs"
                                >
                                    {resetLoading ? 'Updating...' : 'Set Passcode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: APPROVE RESET REQUEST */}
            {approveModalReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-lg p-6 shadow-xl text-left text-slate-900 relative">
                        <button
                            onClick={() => setApproveModalReq(null)}
                            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                            &times;
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                                Operator Password Recovery
                            </span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">Approve Operator Reset Request</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Issue a temporary or updated password to <strong>{approveModalReq.operatorId}</strong>.
                            </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1 mb-3">
                            <p><strong>Requester:</strong> {approveModalReq.requesterName}</p>
                            <p><strong>Contact:</strong> {approveModalReq.requesterContact || 'N/A'}</p>
                            <p><strong>Reason:</strong> {approveModalReq.reason}</p>
                        </div>

                        <form onSubmit={handleApproveRequest} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Passcode to Issue *</label>
                                <input
                                    type="text"
                                    required
                                    value={approvePassInput}
                                    onChange={(e) => setApprovePassInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-mono font-bold text-blue-900"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setApproveModalReq(null)}
                                    className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-bold transition-all shadow-xs"
                                >
                                    Approve & Issue Passcode
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OperatorManagement;
