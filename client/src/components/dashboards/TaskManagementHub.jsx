import React, { useState, useEffect, useContext } from 'react';
import { 
    CheckCircle2, Clock, AlertCircle, Filter, ArrowUpRight, 
    RefreshCw, Check, X, ShieldAlert, FileText, ChevronRight,
    User, Calendar, Flag
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const TaskManagementHub = ({ tier, assignedTo, title = "Administrative Tasks & Approvals" }) => {
    const { user } = useContext(AuthContext);
    const isMaster = user?.isMaster !== false;
    const canManageTasks = isMaster || (user?.assignedOperations && user.assignedOperations.includes('tasks'));

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [selectedTask, setSelectedTask] = useState(null);
    const [actionModal, setActionModal] = useState({ open: false, task: null, newStatus: '', remarks: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            let url = `/api/tasks?`;
            if (tier) url += `tier=${tier}&`;
            if (assignedTo && assignedTo !== 'ADMIN') url += `assignedTo=${assignedTo}&`;
            if (statusFilter !== 'All') url += `status=${statusFilter}&`;
            if (priorityFilter !== 'All') url += `priority=${priorityFilter}&`;

            const res = await axios.get(url);
            setTasks(res.data || []);
        } catch (err) {
            console.error("Failed to fetch administrative tasks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [tier, assignedTo, statusFilter, priorityFilter]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!actionModal.task || !actionModal.newStatus) return;

        if (actionModal.newStatus === 'Completed' && !actionModal.remarks.trim()) {
            alert('Mandatory Requirement: Please provide resolution remarks and audit justification to mark this directive as Completed.');
            return;
        }

        setSubmitting(true);
        try {
            const operatorIdentifier = user?.operatorId 
                ? `${user.operatorId} (${user.operatorName || user.name})` 
                : (user?.name || assignedTo || 'Administrative Desk');

            await axios.put(`/api/tasks/${actionModal.task.taskId}`, {
                status: actionModal.newStatus,
                remarks: actionModal.remarks.trim(),
                updatedBy: operatorIdentifier
            });
            setActionModal({ open: false, task: null, newStatus: '', remarks: '' });
            fetchTasks();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update task status");
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'Urgent':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'High':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'Medium':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getStatusBadge = (s) => {
        switch (s) {
            case 'Completed':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'Under Review':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'In Progress':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Overdue':
                return 'bg-rose-50 text-rose-800 border-rose-200';
            default:
                return 'bg-amber-50 text-amber-800 border-amber-200';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-5 shadow-xs">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                            Workflow Engine
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                            {tasks.length} Active Directives
                        </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{title}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-600"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-600"
                    >
                        <option value="All">All Priorities</option>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <button
                        onClick={fetchTasks}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Refresh Tasks"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Task Cards List */}
            {loading ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                    Loading statutory tasks...
                </div>
            ) : tasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-xl">
                    No pending administrative tasks matching the selected filters.
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div
                            key={task.taskId}
                            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                                        {task.taskId}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getPriorityBadge(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${getStatusBadge(task.status)}`}>
                                        {task.status}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                    {task.title}
                                </h4>
                                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                                    {task.description}
                                </p>

                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                                    <span>Assigned To: <strong className="text-slate-800">{task.assignedTo}</strong></span>
                                    {task.relatedEntityId && (
                                        <span>Entity: <strong className="text-blue-800">{task.relatedEntityId}</strong> ({task.relatedEntityType})</span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                {task.status !== 'Completed' && canManageTasks && (
                                    <>
                                        <button
                                            onClick={() => setActionModal({ open: true, task, newStatus: 'In Progress', remarks: '' })}
                                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors border border-blue-200 cursor-pointer"
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            onClick={() => setActionModal({ open: true, task, newStatus: 'Completed', remarks: '' })}
                                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                        >
                                            <Check size={12} /> Resolve
                                        </button>
                                    </>
                                )}
                                {task.status !== 'Completed' && !canManageTasks && (
                                    <span className="text-slate-400 text-[10px] font-mono italic">
                                        View Only (Task Action Desk Restricted)
                                    </span>
                                )}
                                {task.status === 'Completed' && (
                                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 font-mono">
                                        <CheckCircle2 size={14} /> Resolved
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ACTION MODAL */}
            {actionModal.open && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Update Directive</span>
                                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{actionModal.task?.taskId}</h3>
                            </div>
                            <button
                                onClick={() => setActionModal({ open: false, task: null, newStatus: '', remarks: '' })}
                                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Set New Status</label>
                                <select
                                    value={actionModal.newStatus}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, newStatus: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800"
                                >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Completed">Completed / Resolved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Official Remarks & Resolution Audit Note</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Enter administrative action taken, inspection findings, or verification comments..."
                                    value={actionModal.remarks}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, remarks: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setActionModal({ open: false, task: null, newStatus: '', remarks: '' })}
                                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-blue-800 text-white font-bold transition-all shadow-xs"
                                >
                                    {submitting ? 'Recording...' : 'Confirm Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManagementHub;

