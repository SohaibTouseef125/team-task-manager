import express from 'express';
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTask, validateTaskQuery, validateTaskUpdate } from '../middleware/validation.js';

const router = express.Router();

// Get all tasks with filters (legacy endpoint)
router.get('/all', requireAuth, validateTaskQuery, getAllTasks);

// Create a new task (legacy endpoint)
router.post('/add', requireAuth, validateTask, createTask);

// Get task by ID (legacy endpoint)
router.get('/get/:id', requireAuth, getTaskById);

// Update task (legacy endpoint)
router.put('/update/:id', requireAuth, validateTaskUpdate, updateTask);

// Delete task (legacy endpoint)
router.delete('/delete/:id', requireAuth, deleteTask);

// Get task statistics
router.get('/stats', requireAuth, getTaskStats);

// Standard REST endpoints (for future use)
router.get('/', requireAuth, validateTaskQuery, getAllTasks);
router.post('/', requireAuth, validateTask, createTask);
router.get('/:id', requireAuth, getTaskById);
router.put('/:id', requireAuth, validateTaskUpdate, updateTask);
router.delete('/:id', requireAuth, deleteTask);

export default router;