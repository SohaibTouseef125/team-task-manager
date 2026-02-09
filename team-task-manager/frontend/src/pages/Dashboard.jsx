import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  Bell,
  ChevronDown,
  BarChart3,
  Clock,
  Target,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { tasksAPI, teamsAPI } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedThisWeek: 0,
    overdue: 0,
    activeTeams: 0
  });
  const [tasks, setTasks] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch tasks for the user
      const tasksResponse = await tasksAPI.getAll({ assignedTo: user?.id });
      setTasks(tasksResponse.data.tasks || []);

      // Fetch teams for the user
      const teamsResponse = await teamsAPI.getAll();
      const userTeams = teamsResponse.data.teams || [];

      // Fetch task statistics
      const statsResponse = await tasksAPI.getStats();
      const taskStats = statsResponse.data.stats || {};

      // Set stats
      setStats({
        totalTasks: taskStats.total || 0,
        completedThisWeek: taskStats.completedThisWeek || 0,
        overdue: taskStats.overdue || 0,
        activeTeams: userTeams.length
      });

      // Set upcoming deadlines based on tasks
      const deadlines = tasksResponse.data.tasks
        ?.filter(task => task.dueDate && new Date(task.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3)
        .map((task, index) => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let dueText = '';
          let urgency = 'normal';

          if (diffDays <= 0) {
            dueText = 'Today';
            urgency = 'urgent';
          } else if (diffDays === 1) {
            dueText = 'Tomorrow';
            urgency = 'urgent';
          } else if (diffDays <= 3) {
            dueText = `In ${diffDays} days`;
            urgency = 'soon';
          } else {
            dueText = `In ${diffDays} days`;
          }

          return {
            id: task.id,
            title: task.title,
            dueDate: dueText,
            urgency
          };
        }) || [];

      setUpcomingDeadlines(deadlines);

      // Set recent activity (would come from a real activity feed API)
      // For now, we'll simulate with recent tasks
      const recentActivities = tasksResponse.data.tasks
        ?.slice(0, 4)
        .map((task, index) => ({
          id: task.id,
          user: task.assignedToUser?.name || 'Unknown User',
          action: task.status === 'completed' ? 'completed task' : 'updated task',
          target: task.title,
          time: `${index + 1} ${index === 0 ? 'hour' : 'hours'} ago`,
          avatar: task.assignedToUser?.name?.split(' ').map(n => n[0]).join('') || 'UU'
        })) || [];

      setRecentActivity(recentActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'todo': return 'bg-gray-200 text-gray-800';
      case 'in_progress': return 'bg-blue-200 text-blue-800';
      case 'in_review': return 'bg-yellow-200 text-yellow-800';
      case 'completed': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.name || 'User'}! 👋
                </h1>
                <p className="text-blue-100 text-lg">Here's what's happening with your teams today.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Task
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalTasks}</div>
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.completedThisWeek}</div>
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{stats.overdue}</div>
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                    -2 from last week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Teams</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.activeTeams}</div>
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +1 new team
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}

      {/* Main Content Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Task Overview - Kanban Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Task Overview
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        className="pl-10 text-gray-900 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="text-sm  border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Filter className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { title: 'To Do', status: 'todo', tasks: tasks.filter(t => t.status === 'todo') },
                      { title: 'In Progress', status: 'in_progress', tasks: tasks.filter(t => t.status === 'in_progress') },
                      { title: 'In Review', status: 'in_review', tasks: tasks.filter(t => t.status === 'in_review') },
                      { title: 'Completed', status: 'completed', tasks: tasks.filter(t => t.status === 'completed') }
                    ].map((column, index) => (
                      <div key={column.title} className="bg-gray-50 rounded-xl p-4 min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-700">{column.title}</h3>
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {column.tasks.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {column.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => navigate(`/tasks/${task.id}`)}
                              className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                            >
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {task.title}
                                </h4>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(task.priority)}`} />
                                  <span className="text-xs text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                                </div>
                              </div>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 mr-2">
                                  {task.assignedToUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </div>
                                {task.assignedToUser?.name || 'Unassigned'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Deadlines and Quick Actions */}
            <div className="space-y-6">
              {/* Upcoming Deadlines */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingDeadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className={`p-4 rounded-xl border-l-4 ${
                            deadline.urgency === 'urgent'
                              ? 'bg-red-50 border-red-500'
                              : deadline.urgency === 'soon'
                              ? 'bg-yellow-50 border-yellow-500'
                              : 'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                          <p className={`text-xs mt-1 ${
                            deadline.urgency === 'urgent' ? 'text-red-600 font-semibold' :
                            deadline.urgency === 'soon' ? 'text-yellow-600' : 'text-blue-600'
                          }`}>
                            Due {deadline.dueDate}
                          </p>
                          <button
                            onClick={() => navigate(`/tasks/${deadline.id}`)}
                            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            View Details →
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Plus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Create Task</div>
                          <div className="text-xs text-gray-500">Add a new task to your project</div>
                        </div>
                      </button>
                      <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Invite Team Member</div>
                          <div className="text-xs text-gray-500">Add someone to your team</div>
                        </div>
                      </button>
                      <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Schedule Meeting</div>
                          <div className="text-xs text-gray-500">Set up a team meeting</div>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Activity Feed and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => navigate(`/tasks/${activity.id}`)}
                        className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">
                            {activity.avatar}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                            <span className="text-blue-600">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Completion Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Task Completion
                  </CardTitle>
                  <select className="text-sm border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Task Completion Overview</h3>
                      <p className="text-gray-600 mb-4">Visualize your team's progress</p>
                      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalTasks > 0 ? Math.round((stats.completedThisWeek / stats.totalTasks) * 100) : 0}%</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.totalTasks > 0 ? Math.round(((stats.totalTasks - stats.completedThisWeek - stats.overdue) / stats.totalTasks) * 100) : 0}%</div>
                          <div className="text-xs text-gray-500">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.totalTasks > 0 ? Math.round((stats.overdue / stats.totalTasks) * 100) : 0}%</div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;