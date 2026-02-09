import db from '../config/database.js';

// Get all users (for team invitations)
export const getAllUsers = async (req, res, next) => {
  try {
    const { q } = req.query; // Search query

    let query = db('users').select('id', 'name', 'email', 'avatar_url', 'created_at');

    if (q) {
      query = query.where('name', 'ilike', `%${q}%`).orWhere('email', 'ilike', `%${q}%`);
    }

    const users = await query;

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .where({ id })
      .select('id', 'name', 'email', 'avatar_url', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Get user's tasks
export const getUserTasks = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's tasks
    const tasks = await db('tasks')
      .where({ assigned_to: id })
      .join('teams', 'tasks.team_id', 'teams.id')
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'teams.name as team_name'
      )
      .orderBy('tasks.created_at', 'desc');

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { name, email, avatar_url } = req.body;
    const currentUserId = req.user.id;

    // Only allow user to update their own profile
    if (currentUserId != id) {
      return res.status(403).json({ error: 'Cannot update other user\'s profile' });
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await db('users').where({ email }).whereNot({ id: currentUserId }).first();
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    const [updatedUser] = await db('users')
      .where({ id: currentUserId })
      .update({ name, email, avatar_url })
      .returning('*');

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated', success: false });
    }

    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded', success: false });
    }

    // Update user's avatar_url in the database
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const [updatedUser] = await db('users')
      .where({ id: userId })
      .update({ avatar_url: avatarUrl })
      .returning('*');

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword, message: 'Avatar updated successfully ✅', success: true });
  } catch (error) {
    next(error);
  }
};