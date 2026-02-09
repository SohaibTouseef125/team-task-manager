import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  Tag,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { tasksAPI, teamsAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../utils/helpers';

const MyTasksPage = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(null); // Track if we're editing a task
  const [teams, setTeams] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    teamId: '' // Add team selection
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [selectedFilter, selectedPriority]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Validate that a team is selected for new tasks only
      if (!isEditingTask && !taskForm.teamId) {
        toast.error('Please select a team for the task');
        return;
      }

      // Validate that the teamId is a valid number for new tasks only
      if (!isEditingTask && taskForm.teamId && isNaN(parseInt(taskForm.teamId))) {
        toast.error('Invalid team selection');
        return;
      }

      if (isEditingTask) {
        // Update existing task
        const updateData = {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          due_date: taskForm.dueDate || null,
          assigned_to: taskForm.assignedTo ? parseInt(taskForm.assignedTo) : (user?.id || null) // Use form value or current user
        };

        // Validate that assigned_to is a valid number if provided
        if (updateData.assigned_to && isNaN(updateData.assigned_to)) {
          toast.error('Invalid user assignment');
          return;
        }

        const response = await tasksAPI.update(isEditingTask, updateData);
        toast.success('Task updated successfully!');
      } else {
        // Create new task
        const taskData = {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          due_date: taskForm.dueDate || null,
          assigned_to: user?.id // Assign to current user
        };

        // Only add team_id if it's provided and valid
        if (taskForm.teamId && !isNaN(parseInt(taskForm.teamId))) {
          taskData.team_id = parseInt(taskForm.teamId);
        } else if (!isEditingTask) {
          // For new tasks, team is required
          toast.error('Please select a team for the task');
          return;
        }

        await tasksAPI.create(taskData);
        toast.success('Task created successfully!');
      }

      setShowTaskForm(false);
      setIsEditingTask(null); // Reset editing state
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: '',
        teamId: ''
      });
      fetchTasks(); // Refresh the task list
    } catch (error) {
      // Extract error message from response if available
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          (isEditingTask ? 'Failed to update task' : 'Failed to create task');
      toast.error(errorMessage);
      console.error(isEditingTask ? 'Error updating task:' : 'Error creating task:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateTask = async (taskId, updateData) => {
    try {
      const response = await tasksAPI.update(taskId, updateData);
      // Update the task in the local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...response.data.task } : task
        )
      );
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.delete(taskId);
      // Remove the task from the local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamsAPI.getAll();
      const teamList = response.data.teams || [];
      // Format teams for the dropdown - only show teams the user belongs to
      setTeams(teamList);
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Fallback to empty array
      setTeams([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTeams(); // Fetch teams as well
  }, [selectedFilter, selectedPriority]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // In a real app, we would filter by user ID
      const response = await tasksAPI.getAll({ userId: user?.id });
      // Ensure all tasks have required properties
      const tasksWithDefaults = (response.data.tasks || []).map(task => ({
        ...task,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.due_date || task.dueDate || null,
        assignedTo: task.assigned_to || task.assignedTo || user?.name || 'Unassigned',
        team: task.team_name || task.team || 'No team',
        tags: task.tags || [],
        completed: task.status === 'completed' || false
      }));
      setTasks(tasksWithDefaults);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', name: 'All Tasks', count: tasks.length },
    { id: 'todo', name: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { id: 'in_progress', name: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { id: 'in_review', name: 'In Review', count: tasks.filter(t => t.status === 'in_review').length },
    { id: 'completed', name: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
  ];

  const priorities = [
    { id: 'all', name: 'All Priorities' },
    { id: 'high', name: 'High', color: 'text-red-600' },
    { id: 'medium', name: 'Medium', color: 'text-yellow-600' },
    { id: 'low', name: 'Low', color: 'text-green-600' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || task.status === selectedFilter;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesFilter && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-white mt-1">Manage your personal tasks and assignments</p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedFilter === filter.id
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.name} ({filter.count})
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute  left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-white pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {priorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 border rounded-md ${
              viewMode === 'list' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-4 h-1 bg-current rounded-sm"></div>
              <div className="w-4 h-1 bg-current rounded-sm"></div>
              <div className="w-4 h-1 bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 border rounded-md ${
              viewMode === 'board' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'
            }`}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {task.assignedTo || 'Unassigned'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.created_at ? formatTimeAgo(task.created_at) : 'Just now'}
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {task.team || 'No team'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      {task.tags && task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      navigate(`/tasks/${task.id}`);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Open edit form with task data
                      setTaskForm({
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        dueDate: task.dueDate || '',
                        assignedTo: task.assigned_to || task.assignedTo || '',
                        teamId: task.team_id || task.teamId || '' // Include teamId to satisfy backend validation
                        // Note: teamId won't be updated in the backend, but we need it for validation
                      });
                      setShowTaskForm(true);
                      // Also set a flag to indicate we're editing
                      setIsEditingTask(task.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['todo', 'in_progress', 'in_review', 'completed'].map((status) => {
            const statusTasks = filteredTasks.filter(task => task.status === status);
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-700 capitalize">
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title || 'Untitled Task'}
                        </h4>
                      </div>

                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                          <Flag className="h-3 w-3 mr-1 inline" />
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1 inline" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.created_at ? formatTimeAgo(task.created_at) : 'Just now'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedFilter !== 'all' || selectedPriority !== 'all'
              ? 'No tasks match your current filters.'
              : 'You have no tasks assigned to you.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </div>
        </div>
      )}
      {/* Task Creation Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      rows="3"
                      placeholder="Enter task description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                    <select
                      value={taskForm.teamId}
                      onChange={(e) => handleInputChange('teamId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    >
                      <option value="">Select a team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {isEditingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;