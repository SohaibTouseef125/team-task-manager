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
  Download,
  Columns,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { tasksAPI, teamsAPI } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AllTasksPage = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'board', or 'calendar'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [bulkActions, setBulkActions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(null); // Track if we're editing a task
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    teamId: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchTeams();
  }, [selectedStatus, selectedPriority, selectedTeam]);

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
          assigned_to: parseInt(taskForm.assignedTo) || null
          // Note: team_id is not included in update as backend doesn't allow changing team ownership
        };

        await tasksAPI.update(isEditingTask, updateData);
        toast.success('Task updated successfully!');
      } else {
        // Create new task
        const taskData = {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          due_date: taskForm.dueDate || null,
          assigned_to: parseInt(taskForm.assignedTo) || null
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
      toast.error(isEditingTask ? 'Failed to update task' : 'Failed to create task');
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        team: selectedTeam !== 'all' ? selectedTeam : undefined,
        search: searchQuery
      });
      // Ensure all tasks have required properties
      const tasksWithDefaults = (response.data.tasks || []).map(task => ({
        ...task,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.due_date || task.dueDate || null,
        assignedTo: task.assigned_to || task.assignedTo || 'Unassigned',
        team: task.team_name || task.team || 'No team',
        tags: Array.isArray(task.tags) ? task.tags : [],
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

  const fetchTeams = async () => {
    try {
      // Fetch teams from the API
      const response = await teamsAPI.getAll();
      const teamList = response.data.teams || [];
      // Format teams for the dropdown - ensure consistent object structure
      const formattedTeams = [
        { id: 'all', name: 'All Teams' },
        ...teamList.map(team => ({
          id: team.id,
          name: team.name || 'Unnamed Team'
        }))
      ];
      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Fallback to empty array
      setTeams([{ id: 'all', name: 'All Teams' }]);
    }
  };

  const statuses = [
    { id: 'all', name: 'All', count: tasks.length },
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
    const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesTeam = selectedTeam === 'all' || task.team === selectedTeam;

    return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
  });

  const handleTaskSelect = (taskId) => {
    if (bulkActions.includes(taskId)) {
      setBulkActions(bulkActions.filter(id => id !== taskId));
    } else {
      setBulkActions([...bulkActions, taskId]);
    }
  };

  const handleSelectAll = () => {
    if (bulkActions.length === filteredTasks.length) {
      setBulkActions([]);
    } else {
      setBulkActions(filteredTasks.map(task => task.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Tasks</h1>
          <p className="text-white mt-1">View and manage all tasks across teams</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedStatus === status.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } cursor-pointer`}
                >
                  {status.name} ({status.count})
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
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

              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Teams</option>
                {teams.slice(1).map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 border rounded-md ${
              viewMode === 'list' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'
            } cursor-pointer`}
          >
            <Columns className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 border rounded-md ${
              viewMode === 'board' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'
            } cursor-pointer`}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
          </button>
        </div>

        {bulkActions.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{bulkActions.length} selected</span>
            <button className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 cursor-pointer">
              Change Status
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 cursor-pointer">
              Assign
            </button>
            <button className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 cursor-pointer">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Tasks List */}
          {viewMode === 'list' ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 sm:min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={bulkActions.length === filteredTasks.length && filteredTasks.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task, index) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={bulkActions.includes(task.id)}
                            onChange={() => handleTaskSelect(task.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.title}
                                </h3>
                                {task.tags?.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-blue-600">
                                {task.assignedTo?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">{task.assignedTo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{task.team}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status?.replace('_', ' ') || 'todo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                navigate(`/tasks/${task.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
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
                                  dueDate: task.due_date || task.dueDate || '',
                                  assignedTo: task.assigned_to || task.assignedTo || ''
                                  // Don't set teamId when editing as backend doesn't allow changing team ownership
                                });
                                setShowTaskForm(true);
                                setIsEditingTask(task.id);
                              }}
                              className="text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <div className="flex-1 min-w-0 ml-2">
                              <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                <Flag className="h-3 w-3 mr-1 inline" />
                                {task.priority}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                {task.assignedTo?.charAt(0) || '?'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
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
          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedTeam !== 'all'
                  ? 'No tasks match your current filters.'
                  : 'There are no tasks in the system yet.'}
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
        </>
      )}

      {/* Task Creation Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setIsEditingTask(null); // Reset editing state
                  }}
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
                      <div className="relative">
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => handleInputChange('dueDate', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Calendar className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select team member</option>
                      {/* Add team members dynamically */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                    <select
                      value={taskForm.teamId}
                      onChange={(e) => handleInputChange('teamId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select team</option>
                      {teams.filter(team => team.id !== 'all').map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskForm(false);
                      setIsEditingTask(null); // Reset editing state
                    }}
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

export default AllTasksPage;