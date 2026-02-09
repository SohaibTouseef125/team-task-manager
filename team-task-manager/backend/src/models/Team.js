import db from '../config/database.js';

class Team {
  constructor(teamData) {
    this.id = teamData.id;
    this.name = teamData.name;
    this.description = teamData.description;
    this.creator_id = teamData.creator_id;
    this.created_at = teamData.created_at;
    this.updated_at = teamData.updated_at;
  }

  // Find team by ID
  static async findById(id) {
    const team = await db('teams').where({ id }).first();
    return team ? new Team(team) : null;
  }

  // Create new team
  static async create(teamData, creatorId) {
    const [team] = await db('teams').insert({
      name: teamData.name,
      description: teamData.description || '',
      creator_id: creatorId,
      created_at: new Date()
    }).returning('*');

    return team ? new Team(team) : null;
  }

  // Update team
  async update(updates) {
    const [updatedTeam] = await db('teams')
      .where({ id: this.id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');

    Object.assign(this, updatedTeam);
    return this;
  }

  // Delete team
  async delete() {
    return await db.transaction(async (trx) => {
      // Delete all tasks in the team
      await trx('tasks').where({ team_id: this.id }).del();

      // Delete all memberships
      await trx('memberships').where({ team_id: this.id }).del();

      // Delete the team
      return await trx('teams').where({ id: this.id }).del();
    });
  }

  // Get team members
  async getMembers() {
    const members = await db('memberships')
      .where({ team_id: this.id })
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

    return members;
  }

  // Add member to team
  async addMember(userId, role = 'member') {
    const [membership] = await db('memberships').insert({
      user_id: userId,
      team_id: this.id,
      role,
      joined_at: new Date()
    });

    return membership;
  }

  // Remove member from team
  async removeMember(userId) {
    return await db('memberships').where({
      team_id: this.id,
      user_id: userId
    }).del();
  }

  // Update member role
  async updateMemberRole(userId, role) {
    const [updatedMembership] = await db('memberships')
      .where({
        team_id: this.id,
        user_id: userId
      })
      .update({ role })
      .returning('*');

    return updatedMembership;
  }

  // Get all tasks for this team
  async getTasks(filters = {}) {
    let query = db('tasks')
      .where({ team_id: this.id })
      .join('users as assignee_user', 'tasks.assigned_to', 'assignee_user.id')
      .join('users as creator_user', 'tasks.created_by', 'creator_user.id')
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'assignee_user.name as assigned_to_name',
        'creator_user.name as created_by_name'
      )
      .orderBy('tasks.created_at', 'desc');

    // Apply filters
    if (filters.status) {
      query = query.andWhere('tasks.status', filters.status);
    }
    if (filters.priority) {
      query = query.andWhere('tasks.priority', filters.priority);
    }
    if (filters.assigned_to) {
      query = query.andWhere('tasks.assigned_to', filters.assigned_to);
    }

    return await query;
  }

  // Get team statistics
  async getStats() {
    const stats = await db('tasks')
      .where({ team_id: this.id })
      .groupBy('status')
      .select(
        'status',
        db.raw('COUNT(*) as count')
      );

    const totalTasks = await db('tasks')
      .where({ team_id: this.id })
      .count('*', { as: 'total' })
      .first();

    const overdueTasks = await db('tasks')
      .where({ team_id: this.id })
      .where('due_date', '<', new Date())
      .whereNot('status', 'completed')
      .count('*', { as: 'overdue' })
      .first();

    return {
      stats: stats.reduce((acc, stat) => ({ ...acc, [stat.status]: parseInt(stat.count) }), {}),
      total: parseInt(totalTasks.total),
      overdue: parseInt(overdueTasks.overdue)
    };
  }
}

export default Team;