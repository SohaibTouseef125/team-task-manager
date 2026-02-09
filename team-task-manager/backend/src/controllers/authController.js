import bcrypt from 'bcrypt';
import db from '../config/database.js';

// Register new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists ❌', success: false });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user and return the inserted data
    const [user] = await db('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        created_at: new Date()
      })
      .returning(['id', 'name', 'email', 'created_at']);

    if (!user) {
      console.error('Failed to create user in database ❌');
      return res.status(500).json({ error: 'Failed to create user ❌', success: false });
    }

    console.log('Successfully created user: ✅', user);

    req.login(user, (err) => {
      if (err) {
        console.error('Passport login error: ❌ ', err);
        return next(err);
      }
      res.status(201).json({ user, message: 'User registered successfully ✅', success: true });
    });
  } catch (error) {
    next(error);
  }
};


// Logout user
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      req.session = null;
      res.json({ message: 'Logout successful ✅', success: true });
    });
  });
};

// Get current user
export const getCurrentUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword, success: true });
  } else {
    res.status(401).json({ error: 'Not authenticated', success: false });
  }
};

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated', success: false });
    }

    const { name, email, bio, timezone, language, theme, notifications, privacy, location, job_title, company, website, phone } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await db('users').where({ email }).whereNot({ id: userId }).first();
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken', success: false });
      }
    }

    // Prepare update data with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (theme !== undefined) updateData.theme = theme;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (privacy !== undefined) updateData.privacy = privacy;
    if (location !== undefined) updateData.location = location;
    if (job_title !== undefined) updateData.job_title = job_title;
    if (company !== undefined) updateData.company = company;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;
    if (req.body.avatar_url !== undefined) updateData.avatar_url = req.body.avatar_url;

    // Update the user record
    const [updatedUser] = await db('users')
      .where({ id: userId })
      .update(updateData)
      .returning('*');

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword, message: 'Profile updated successfully ✅', success: true });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated', success: false });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user to verify old password
    const user = await db('users').where({ id: userId }).first();
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await db('users')
      .where({ id: userId })
      .update({ password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};