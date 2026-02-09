import express from 'express';
import {
  getAllTeams,
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addMemberToTeam,
  removeMemberFromTeam,
  updateMemberRole
} from '../controllers/teamController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTeam } from '../middleware/validation.js';

const router = express.Router();

// Get all teams for the authenticated user
router.get('/all', requireAuth, getAllTeams);

// Create a new team
router.post('/add', requireAuth, validateTeam, createTeam);

// Get team by ID
router.get('/get/:id', requireAuth, getTeamById);

// Update team
router.put('/update/:id', requireAuth, validateTeam, updateTeam);

// Delete team
router.delete('/delete/:id', requireAuth, deleteTeam);

// Get team members
router.get('/:id/members', requireAuth, getTeamMembers);

// Add member to team
router.post('/:id/members', requireAuth, addMemberToTeam);

// Remove member from team
router.delete('/:id/members/:userId', requireAuth, removeMemberFromTeam);

// Update member role
router.put('/:id/members/:userId', requireAuth, updateMemberRole);

export default router;