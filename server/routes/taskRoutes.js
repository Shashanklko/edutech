const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.listTasks);
router.post('/', taskController.createTask);
router.put('/:taskId', taskController.updateTask);

module.exports = router;

