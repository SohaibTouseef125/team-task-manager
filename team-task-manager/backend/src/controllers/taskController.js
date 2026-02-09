import db from '../config/database.js';
import { createNotification } from './notificationController.js';

// Get all tasks with filters
export const getAllTasks = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;
    let { team, assignee, userId: requestedUserId, status, priority, limit = 20, offset = 0 } = req.query;

    // Build the query
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
      );

    // Apply authorization logic
    if (requestedUserId) {
      // If userId is specified in query, user can only see tasks assigned to that user
      // Check if the requested user is the authenticated user or if they share a team
      if (requestedUserId != userId) {
        // Check if they share at least one team
        const sharedMembership = await db('memberships as m1')
          .join('memberships as m2', 'm1.team_id', 'm2.team_id')
          .where('m1.user_id', userId)
          .andWhere('m2.user_id', requestedUserId)
          .first();

        if (!sharedMembership) {
          return res.status(403).json({ error: 'Not authorized to view tasks for this user' });
        }
      }

      // Only get tasks assigned to the requested user
      query = query.where('tasks.assigned_to', requestedUserId);
    } else {
      // Original logic: user can see tasks from teams they belong to OR tasks assigned to them
      query = query.where(function() {
        // User can see tasks from teams they belong to
        this.whereExists(
          db('memberships').whereRaw('memberships.team_id = tasks.team_id').andWhere('memberships.user_id', userId)
        );

        // Or tasks assigned to them
        this.orWhere('tasks.assigned_to', userId);
      });
    }

    query = query.orderBy('tasks.created_at', 'desc');

    // Apply filters
    if (team) {
      query = query.andWhere('tasks.team_id', team);
    }
    if (assignee) {
      query = query.andWhere('tasks.assigned_to', assignee);
    }
    if (status) {
      query = query.andWhere('tasks.status', status);
    }
    if (priority) {
      query = query.andWhere('tasks.priority', priority);
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const tasks = await query;

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Create a new task
export const createTask = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, description, team_id, assigned_to, status = 'todo', priority = 'medium', due_date } = req.body;
    const userId = req.user.id;

    // Check if user is a member of the team
    const membership = await db('memberships')
      .where({ team_id, user_id: userId })
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    const assignedTo = assigned_to ? Number(assigned_to) : userId; // Default to current user if not specified

    // Check if assigned user is a member of the team (if assigning to someone else)
    if (assignedTo && assignedTo != userId) {
      const assignedUserMembership = await db('memberships')
        .where({ team_id, user_id: assignedTo })
        .first();

      if (!assignedUserMembership) {
        return res.status(400).json({ error: 'Assigned user is not a member of this team' });
      }
    }

    // Create the task
    const insertedIds = await db('tasks').insert({
      title,
      description,
      team_id,
      assigned_to: assignedTo, // Use the validated and converted assigned user ID
      status,
      priority,
      due_date: due_date ? new Date(due_date) : null,
      created_by: userId,
      created_at: new Date()
    }).returning('id');

    const taskId = insertedIds[0].id;

    // Get the created task
    const task = await db('tasks')
      .where({ 'tasks.id': taskId })
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
      .first();

    // Send notification to the assigned user if it's different from the creator
    if (assignedTo && assignedTo !== userId) {
      await createNotification(
        assignedTo,
        'New task assigned',
        `You have been assigned to "${title}"`,
        'task_assignment',
        taskId,
        'task'
      );
    }

    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    next(error);
  }
};

// Get task by ID
export const getTaskById = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user.id;

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
        'creator_user.name as created_by_name'
      )
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is a member of the team or assigned to the task
    const membership = await db('memberships')
      .where({ team_id: task.team_id, user_id: userId })
      .first();

    const isAssigned = task.assigned_to_id == userId;

    if (!membership && !isAssigned) {
      return res.status(403).json({ error: 'Not authorized to view this task' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// Update task
export const updateTask = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { title, description, assigned_to, status, priority, due_date } = req.body;
    const userId = req.user.id;

    // Get the current task
    const currentTask = await db('tasks').where({ id }).first();
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is a member of the team or assigned to the task
    const membership = await db('memberships')
      .where({ team_id: currentTask.team_id, user_id: userId })
      .first();

    const isAssigned = currentTask.assigned_to == userId;

    if (!membership && !isAssigned) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Convert assigned_to to number if it's a string representation of a number
    let processedAssignedTo = assigned_to;
    if (typeof assigned_to === 'string' && /^\d+$/.test(assigned_to)) {
      processedAssignedTo = parseInt(assigned_to, 10);
    } else if (assigned_to === '' || assigned_to === 'null' || assigned_to === 'undefined') {
      processedAssignedTo = null;
    }

    // Check if assigned user is a member of the team (if changing assignee)
    if (processedAssignedTo && processedAssignedTo != currentTask.assigned_to) {
      const assignedUserMembership = await db('memberships')
        .where({ team_id: currentTask.team_id, user_id: processedAssignedTo })
        .first();

      if (!assignedUserMembership) {
        return res.status(400).json({ error: 'Assigned user is not a member of this team' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigned_to !== undefined) updateData.assigned_to = processedAssignedTo;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;
    updateData.updated_at = new Date();

    // Get the current task before update to compare changes
    const existingTask = await db('tasks').where({ id }).first();

    // Update the task
    const [updatedTask] = await db('tasks')
      .where({ id })
      .update(updateData)
      .returning('*');

    // Get the updated task with joins
    const task = await db('tasks')
      .where({ 'tasks.id': updatedTask.id })
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
      .first();

    // Send notification if the task was reassigned
    if (updateData.assigned_to && updateData.assigned_to !== existingTask.assigned_to) {
      await createNotification(
        updateData.assigned_to,
        'Task reassigned to you',
        `"${updateData.title || existingTask.title}" has been reassigned to you`,
        'task_reassignment',
        updatedTask.id,
        'task'
      );
    }

    // Send notification if the status changed to completed
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      // Notify the creator that the task is completed
      if (existingTask.created_by !== updateData.assigned_to) {
        await createNotification(
          existingTask.created_by,
          'Task completed',
          `"${updateData.title || existingTask.title}" has been completed by ${req.user.name}`,
          'task_completion',
          updatedTask.id,
          'task'
        );
      }
    }

    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Get the current task
    const currentTask = await db('tasks').where({ id }).first();
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is the creator of the task or an admin of the team
    const membership = await db('memberships')
      .where({ team_id: currentTask.team_id, user_id: userId })
      .where({ role: 'admin' })
      .first();

    const isCreator = currentTask.created_by == userId;

    if (!membership && !isCreator) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    // Delete the task
    await db('tasks').where({ id }).del();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get task statistics
export const getTaskStats = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;

    // Get stats for tasks in teams user belongs to or tasks assigned to user
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

    // Get total tasks
    const totalTasks = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', userId)
      .orWhere('tasks.assigned_to', userId)
      .count('*', { as: 'total' })
      .first();

    // Get overdue tasks
    const overdueTasks = await db('tasks')
      .join('teams', 'tasks.team_id', 'teams.id')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', userId)
      .orWhere('tasks.assigned_to', userId)
      .where('tasks.due_date', '<', new Date())
      .whereNot('tasks.status', 'completed')
      .count('*', { as: 'overdue' })
      .first();

    res.json({
      stats: stats.reduce((acc, stat) => ({ ...acc, [stat.status]: parseInt(stat.count) }), {}),
      total: parseInt(totalTasks.total),
      overdue: parseInt(overdueTasks.overdue)
    });
  } catch (error) {
    next(error);
  }
};