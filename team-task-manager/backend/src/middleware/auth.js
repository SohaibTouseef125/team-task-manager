import db from '../config/database.js';

// Require authentication middleware
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Require team member access
export const requireTeamMember = async (req, res, next) => {
  const { teamId } = req.params;
  const userId = req.user.id;

  // Check if user is a member of the team
  const membership = await db('memberships')
    .where({ team_id: teamId, user_id: userId })
    .first();

  if (!membership) {
    return res.status(403).json({ error: 'Not a team member' });
  }

  req.membership = membership;
  next();
};

// Require team admin access
export const requireTeamAdmin = async (req, res, next) => {
  const { teamId } = req.params;
  const userId = req.user.id;

  // Check if user is an admin of the team
  const membership = await db('memberships')
    .where({ team_id: teamId, user_id: userId })
    .where({ role: 'admin' })
    .first();

  if (!membership) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  req.membership = membership;
  next();
};

// Require user to be the creator of the team
export const requireTeamCreator = async (req, res, next) => {
  const { teamId } = req.params;
  const userId = req.user.id;

  // Check if user is the creator of the team
  const team = await db('teams')
    .where({ id: teamId, creator_id: userId })
    .first();

  if (!team) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  next();
};