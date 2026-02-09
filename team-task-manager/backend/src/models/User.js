import db from '../config/database.js';

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.avatar_url = userData.avatar_url;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Find user by ID
  static async findById(id) {
    const user = await db('users').where({ id }).first();
    return user ? new User(user) : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const user = await db('users').where({ email }).first();
    return user ? new User(user) : null;
  }

  // Create new user
  static async create(userData) {
    const [user] = await db('users').insert({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      avatar_url: userData.avatar_url || null,
      created_at: new Date()
    }).returning('*');

    return user ? new User(user) : null;
  }

  // Update user
  async update(updates) {
    const [updatedUser] = await db('users')
      .where({ id: this.id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');

    Object.assign(this, updatedUser);
    return this;
  }

  // Delete user
  async delete() {
    return await db('users').where({ id: this.id }).del();
  }

  // Get user's teams
  async getTeams() {
    const teams = await db('teams')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', this.id)
      .select(
        'teams.id',
        'teams.name',
        'teams.description',
        'teams.creator_id',
        'teams.created_at',
        'teams.updated_at',
        'memberships.role'
      );

    return teams;
  }

  // Get user's assigned tasks
  async getAssignedTasks() {
    const tasks = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .where('tasks.assigned_to', this.id)
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

    return tasks;
  }

  // Get user's created tasks
  async getCreatedTasks() {
    const tasks = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .where('tasks.created_by', this.id)
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

    return tasks;
  }
}

export default User;