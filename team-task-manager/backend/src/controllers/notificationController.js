import db from '../config/database.js';

// Get all notifications for a user
export const getAllNotifications = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { filter = 'all', limit = 20, offset = 0 } = req.query;

    let query = db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    // Apply filter
    if (filter === 'unread') {
      query = query.where({ read: false });
    } else if (filter === 'read') {
      query = query.where({ read: true });
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const notifications = await query;

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification belongs to user
    const notification = await db('notifications')
      .where({ id, user_id: userId })
      .first();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db('notifications')
      .where({ id })
      .update({ read: true, updated_at: new Date() });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;

    await db('notifications')
      .where({ user_id: userId, read: false })
      .update({ read: true, updated_at: new Date() });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Create a notification (internal function for other controllers to use)
export const createNotification = async (userId, title, description, type, relatedId = null, relatedType = null) => {
  try {
    const [notification] = await db('notifications')
      .insert({
        user_id: userId,
        title,
        description,
        type,
        related_id: relatedId,
        related_type: relatedType,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notification count for a user
export const getNotificationCount = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;

    const countResult = await db('notifications')
      .where({ user_id: userId, read: false })
      .count('*', { as: 'count' })
      .first();

    const count = parseInt(countResult.count) || 0;

    res.json({ count });
  } catch (error) {
    next(error);
  }
};