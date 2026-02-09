import express from 'express';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationCount
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications
router.get('/', requireAuth, getAllNotifications);

// Get notification count
router.get('/count', requireAuth, getNotificationCount);

// Mark notification as read
router.put('/read/:id', requireAuth, markAsRead);

// Mark all notifications as read
router.put('/read-all', requireAuth, markAllAsRead);

export default router;