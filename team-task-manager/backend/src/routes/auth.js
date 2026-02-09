import express from 'express';
import passport from 'passport';
import { register, login, logout, getCurrentUser, updateProfile, changePassword } from '../controllers/authController.js';
import { validateRegistration, validateLogin, validateProfileUpdate, validatePasswordChange } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register', validateRegistration, register);

// Login user
router.post('/login', validateLogin, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message:  `Welcome  ${user.name} ✅`, success: true });
    });
  })(req, res, next);
});

// Logout user
router.post('/logout', logout);

// Get current user
router.get('/me', getCurrentUser);

// Update profile
router.put('/profile', validateProfileUpdate, updateProfile);

// Change password
router.put('/password', validatePasswordChange, changePassword);

export default router;