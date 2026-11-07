const taskService = require('../services/taskService');

const listTasks = async (req, res, next) => {
    try {
        const tasks = await taskService.getTasks(req.query);
        res.json(tasks);
    } catch (err) {
        next(err);
    }
};

const createTask = async (req, res, next) => {
    try {
        const task = await taskService.createTask(req.body);
        res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
        next(err);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await taskService.updateTaskStatus(taskId, req.body);
        res.json({ message: 'Task updated successfully', task });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listTasks,
    createTask,
    updateTask
};

