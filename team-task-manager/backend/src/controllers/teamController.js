import db from '../config/database.js';

// Get all teams for the authenticated user
export const getAllTeams = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;

    const teams = await db('teams')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', userId)
      .select(
        'teams.id',
        'teams.name',
        'teams.description',
        'teams.creator_id',
        'teams.created_at',
        'teams.updated_at',
        'memberships.role'
      );

    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

// Create a new team
export const createTeam = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, description } = req.body;
    const userId = req.user.id;

    // Create the team and return the created team data
    const [team] = await db('teams').insert({
      name,
      description,
      creator_id: userId,
      created_at: new Date()
    }).returning(['id', 'name', 'description', 'creator_id', 'created_at', 'updated_at']);

    // Add the creator as an admin member
    await db('memberships').insert({
      user_id: userId,
      team_id: team.id,
      role: 'admin',
      joined_at: new Date()
    });

    res.status(201).json({ team, message: 'Team created successfully' });
  } catch (error) {
    console.error('Error creating team:', error);
    next(error);
  }
};

// Get team by ID
export const getTeamById = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the team
    const membership = await db('memberships')
      .where({ team_id: id, user_id: userId })
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    const team = await db('teams')
      .where({ id })
      .select('id', 'name', 'description', 'creator_id', 'created_at', 'updated_at')
      .first();

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
};

// Update team
export const updateTeam = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Check if user is an admin of the team
    const membership = await db('memberships')
      .where({ team_id: id, user_id: userId })
      .where({ role: 'admin' })
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const [updatedTeam] = await db('teams')
      .where({ id })
      .update({ name, description, updated_at: new Date() })
      .returning('*');

    res.json({ team: updatedTeam, message: 'Team updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete team
export const deleteTeam = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the creator of the team
    const team = await db('teams')
      .where({ id, creator_id: userId })
      .first();

    if (!team) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await db.transaction(async (trx) => {
      // Delete all tasks in the team
      await trx('tasks').where({ team_id: id }).del();

      // Delete all memberships
      await trx('memberships').where({ team_id: id }).del();

      // Delete the team
      await trx('teams').where({ id }).del();
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get team members
export const getTeamMembers = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the team
    const membership = await db('memberships')
      .where({ team_id: id, user_id: userId })
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    const members = await db('memberships')
      .where({ team_id: id })
      .join('users', 'memberships.user_id', 'users.id')
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.avatar_url',
        'memberships.role',
        'memberships.joined_at'
      )
      .orderBy('memberships.joined_at', 'asc');

    res.json({ members });
  } catch (error) {
    next(error);
  }
};

// Add member to team
export const addMemberToTeam = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params; // team id
    const { userId, role = 'member' } = req.body;
    const currentUserId = req.user.id;

    // Validate inputs - be more flexible with userId type
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (!numericUserId || isNaN(numericUserId) || numericUserId <= 0) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either admin or member' });
    }

    console.log('Attempting to add member to team:', { teamId: id, currentUserId, userId, role }); // Debug log

    // Check if current user is an admin of the team
    const currentMembership = await db('memberships')
      .where({ team_id: id, user_id: currentUserId })
      .first();

    console.log('Current user membership:', currentMembership); // Debug log
    console.log('Current user ID:', currentUserId, 'Team ID:', id); // Debug log

    if (!currentMembership || currentMembership.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Only team admins can add members',
        userRole: currentMembership?.role || 'not a member'
      });
    }

    // Check if user exists
    const user = await db('users').where({ id: numericUserId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMembership = await db('memberships')
      .where({ team_id: id, user_id: numericUserId })
      .first();

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add user to team
    const [membership] = await db('memberships').insert({
      user_id: numericUserId,
      team_id: id,
      role,
      joined_at: new Date()
    }).returning('*'); // Explicitly return the inserted record

    res.status(201).json({ membership, message: 'Member added to team successfully' });
  } catch (error) {
    console.error('Error adding member to team:', error);
    // Check if it's a specific database constraint error
    if (error.code === '23505') { // Unique violation in PostgreSQL
      return res.status(400).json({ error: 'User is already a member of this team' });
    }
    next(error);
  }
};

// Remove member from team
export const removeMemberFromTeam = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id, userId: userIdParam } = req.params; // team id and user id
    const currentUserId = req.user.id;

    // Convert userId to number if it's a string
    const userId = typeof userIdParam === 'string' ? parseInt(userIdParam, 10) : userIdParam;

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    console.log('Attempting to remove member from team:', { teamId: id, currentUserId, userIdToRemove: userId }); // Debug log

    // Check if current user is an admin of the team
    const currentMembership = await db('memberships')
      .where({ team_id: id, user_id: currentUserId })
      .first();

    console.log('Current user membership for removal:', currentMembership); // Debug log

    if (!currentMembership || currentMembership.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Only team admins can remove members',
        userRole: currentMembership?.role || 'not a member'
      });
    }

    // Check if user to be removed is a member of the team
    const userMembership = await db('memberships')
      .where({ team_id: id, user_id: userId })
      .first();

    if (!userMembership) {
      return res.status(404).json({ error: 'User is not a member of this team' });
    }

    // Check if user to be removed is the team creator
    const team = await db('teams').where({ id }).first();
    if (team && team.creator_id == userId) {
      return res.status(400).json({ error: 'Cannot remove the team creator' });
    }

    // Check if the user to be removed is an admin and is the last admin
    if (userMembership.role === 'admin') {
      const adminCount = await db('memberships')
        .where({ team_id: id, role: 'admin' })
        .count('*', { as: 'count' })
        .first();

      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin from the team. Make another member an admin first.' });
      }
    }

    // Remove user from team
    await db('memberships').where({ team_id: id, user_id: userId }).del();

    res.json({ message: 'Member removed from team successfully' });
  } catch (error) {
    console.error('Error removing member from team:', error);
    next(error);
  }
};

// Update member role
export const updateMemberRole = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id, userId: userIdParam } = req.params; // team id and user id
    const { role } = req.body;
    const currentUserId = req.user.id;

    // Convert userId to number if it's a string
    const userId = typeof userIdParam === 'string' ? parseInt(userIdParam, 10) : userIdParam;

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    console.log('Attempting to update member role:', { teamId: id, currentUserId, userIdToUpdate: userId, newRole: role }); // Debug log

    // Check if current user is an admin of the team
    const currentMembership = await db('memberships')
      .where({ team_id: id, user_id: currentUserId })
      .first();

    console.log('Current user membership for role update:', currentMembership); // Debug log

    if (!currentMembership || currentMembership.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Only team admins can update member roles',
        userRole: currentMembership?.role || 'not a member'
      });
    }

    // Check if user to be updated is a member of the team
    const userMembership = await db('memberships')
      .where({ team_id: id, user_id: userId })
      .first();

    if (!userMembership) {
      return res.status(404).json({ error: 'User is not a member of this team' });
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either admin or member' });
    }

    // Update user role
    const [updatedMembership] = await db('memberships')
      .where({ team_id: id, user_id: userId })
      .update({ role })
      .returning('*');

    res.json({ membership: updatedMembership, message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Error updating member role:', error);
    next(error);
  }
};