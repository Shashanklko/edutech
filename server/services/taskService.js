const Task = require('../models/Task');

/**
 * Generate Next Unique Task ID
 */
const generateTaskId = async () => {
    const year = new Date().getFullYear();
    const count = await Task.countDocuments();
    return `TSK-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get tasks filterable by tier, assignee, category, status, or priority
 */
const getTasks = async (query = {}) => {
    const filter = {};
    if (query.tier) filter.tier = query.tier;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.status && query.status !== 'All') filter.status = query.status;
    if (query.priority && query.priority !== 'All') filter.priority = query.priority;
    if (query.category && query.category !== 'All') filter.category = query.category;

    return await Task.find(filter).sort({ createdAt: -1 }).lean();
};

/**
 * Create a new administrative task
 */
const createTask = async (taskData) => {
    const taskId = taskData.taskId || await generateTaskId();
    const newTask = new Task({
        ...taskData,
        taskId,
        activityLog: [{
            action: 'Task Initiated',
            performedBy: taskData.assignedBy || 'System Workflow',
            note: taskData.title
        }]
    });
    return await newTask.save();
};

/**
 * Update task status or progress
 */
const updateTaskStatus = async (taskId, { status, remarks, updatedBy }) => {
    const task = await Task.findOne({ taskId });
    if (!task) {
        const error = new Error(`Task ${taskId} not found`);
        error.statusCode = 404;
        throw error;
    }

    const previousStatus = task.status;
    task.status = status;
    if (remarks) task.remarks = remarks;
    if (status === 'Completed' || status === 'Rejected') {
        task.resolutionDate = new Date();
    }

    task.activityLog.push({
        action: `Status changed from ${previousStatus} to ${status}`,
        performedBy: updatedBy || 'Administrative Desk',
        note: remarks || ''
    });

    return await task.save();
};

module.exports = {
    generateTaskId,
    getTasks,
    createTask,
    updateTaskStatus
};

