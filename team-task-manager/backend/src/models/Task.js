import db from '../config/database.js';

class Task {
  constructor(taskData) {
    this.id = taskData.id;
    this.title = taskData.title;
    this.description = taskData.description;
    this.status = taskData.status;
    this.priority = taskData.priority;
    this.team_id = taskData.team_id;
    this.assigned_to = taskData.assigned_to;
    this.created_by = taskData.created_by;
    this.due_date = taskData.due_date;
    this.created_at = taskData.created_at;
    this.updated_at = taskData.updated_at;
  }

  // Find task by ID
  static async findById(id) {
    const task = await db('tasks').where({ id }).first();
    return task ? new Task(task) : null;
  }

  // Create new task
  static async create(taskData, createdBy) {
    const [task] = await db('tasks').insert({
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      team_id: taskData.team_id,
      assigned_to: taskData.assigned_to || createdBy,
      created_by: createdBy,
      due_date: taskData.due_date ? new Date(taskData.due_date) : null,
      created_at: new Date()
    }).returning('*');

    return task ? new Task(task) : null;
  }

  // Update task
  async update(updates) {
    const [updatedTask] = await db('tasks')
      .where({ id: this.id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');

    Object.assign(this, updatedTask);
    return this;
  }

  // Delete task
  async delete() {
    return await db('tasks').where({ id: this.id }).del();
  }

  // Get task with relations
  static async findByIdWithRelations(id) {
    const task = await db('tasks')
      .where({ 'tasks.id': id })
      .join('teams', 'tasks.team_id', 'teams.id')
      .leftJoin('users as assignee_user', 'tasks.assigned_to', 'assignee_user.id')
      .leftJoin('users as creator_user', 'tasks.created_by', 'creator_user.id')
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'teams.id as team_id',
        'teams.name as team_name',
        'assignee_user.id as assigned_to_id',
        'assignee_user.name as assigned_to_name',
        'creator_user.id as created_by_id',
        'creator_user.name as created_by_name'
      )
      .first();

    return task;
  }

  // Get all tasks with filters
  static async findAll(filters = {}, userId) {
    let query = db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .leftJoin('users as assignee_user', 'tasks.assigned_to', 'assignee_user.id')
      .leftJoin('users as creator_user', 'tasks.created_by', 'creator_user.id')
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'teams.id as team_id',
        'teams.name as team_name',
        'assignee_user.id as assigned_to_id',
        'assignee_user.name as assigned_to_name',
        'creator_user.name as created_by_name'
      )
      .where(function() {
        // User can see tasks from teams they belong to
        this.whereExists(
          db('memberships').whereRaw('memberships.team_id = tasks.team_id').andWhere('memberships.user_id', userId)
        );

        // Or tasks assigned to them
        this.orWhere('tasks.assigned_to', userId);
      })
      .orderBy('tasks.created_at', 'desc');

    // Apply filters
    if (filters.team) {
      query = query.andWhere('tasks.team_id', filters.team);
    }
    if (filters.assignee) {
      query = query.andWhere('tasks.assigned_to', filters.assignee);
    }
    if (filters.status) {
      query = query.andWhere('tasks.status', filters.status);
    }
    if (filters.priority) {
      query = query.andWhere('tasks.priority', filters.priority);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  // Get tasks by team
  static async findByTeam(teamId, userId) {
    const tasks = await db('tasks')
      .where({ team_id: teamId })
      .join('teams', 'tasks.team_id', 'teams.id')
      .leftJoin('users as assignee_user', 'tasks.assigned_to', 'assignee_user.id')
      .leftJoin('users as creator_user', 'tasks.created_by', 'creator_user.id')
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'teams.id as team_id',
        'teams.name as team_name',
        'assignee_user.id as assigned_to_id',
        'assignee_user.name as assigned_to_name',
        'creator_user.name as created_by_name'
      )
      .orderBy('tasks.created_at', 'desc');

    return tasks;
  }

  // Get tasks by assignee
  static async findByAssignee(assigneeId, userId) {
    // Only allow user to see tasks assigned to themselves or tasks in teams they belong to
    const tasks = await db('tasks')
      .where('tasks.assigned_to', assigneeId)
      .join('teams', 'tasks.team_id', 'teams.id')
      .leftJoin('users as creator_user', 'tasks.created_by', 'creator_user.id')
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'teams.id as team_id',
        'teams.name as team_name',
        'creator_user.name as created_by_name'
      )
      .where(function() {
        // User can see tasks from teams they belong to
        this.whereExists(
          db('memberships').whereRaw('memberships.team_id = tasks.team_id').andWhere('memberships.user_id', userId)
        );

        // Or their own assigned tasks
        this.orWhere('tasks.assigned_to', userId);
      })
      .orderBy('tasks.created_at', 'desc');

    return tasks;
  }

  // Get task statistics for user
  static async getUserStats(userId) {
    const stats = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', userId)
      .orWhere('tasks.assigned_to', userId)
      .groupBy('tasks.status')
      .select(
        'tasks.status',
        db.raw('COUNT(*) as count')
      );

    const totalTasks = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', userId)
      .orWhere('tasks.assigned_to', userId)
      .count('*', { as: 'total' })
      .first();

    const overdueTasks = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', userId)
      .orWhere('tasks.assigned_to', userId)
      .where('tasks.due_date', '<', new Date())
      .whereNot('tasks.status', 'completed')
      .count('*', { as: 'overdue' })
      .first();

    return {
      stats: stats.reduce((acc, stat) => ({ ...acc, [stat.status]: parseInt(stat.count) }), {}),
      total: parseInt(totalTasks.total),
      overdue: parseInt(overdueTasks.overdue)
    };
  }
}

export default Task;