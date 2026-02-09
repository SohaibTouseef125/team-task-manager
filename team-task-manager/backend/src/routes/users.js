import express from 'express';
import { getAllUsers, getUserById, getUserTasks, updateUserProfile, uploadAvatar } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all users (for team invitations)
router.get('/all', requireAuth, getAllUsers);

// Get user by ID
router.get('/get/:id', requireAuth, getUserById);

// Get user's tasks
router.get('/get/:id/tasks', requireAuth, getUserTasks);

// Update user profile
router.put('/update/:id', requireAuth, updateUserProfile);

// Upload avatar
router.post('/upload-avatar', requireAuth, upload.single('avatar'), uploadAvatar);

export default router;