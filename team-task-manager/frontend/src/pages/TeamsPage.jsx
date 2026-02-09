import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Users,
  Calendar,
  CheckCircle,
  ChevronDown,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { teamsAPI, tasksAPI } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const TeamsPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: ''
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll();
      setTeams(response.data.teams || []);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await teamsAPI.create(teamForm);
      setTeams([...teams, response.data.team]);
      setTeamForm({ name: '', description: '' });
      setShowTeamForm(false);
      toast.success('Team created successfully!');
    } catch (error) {
      toast.error('Failed to create team');
      console.error('Error creating team:', error);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await teamsAPI.update(editingTeam.id, teamForm);
      setTeams(teams.map(team => team.id === editingTeam.id ? response.data.team : team));
      setEditingTeam(null);
      setTeamForm({ name: '', description: '' });
      setShowTeamForm(false);
      toast.success('Team updated successfully!');
    } catch (error) {
      toast.error('Failed to update team');
      console.error('Error updating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await teamsAPI.delete(teamId);
      setTeams(teams.filter(team => team.id !== teamId));
      toast.success('Team deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete team');
      console.error('Error deleting team:', error);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description
    });
    setShowTeamForm(true);
  };

  const handleCreateTask = (team) => {
    setSelectedTeam(team);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setSelectedTeam(null);
  };

  const handleCloseTeamForm = () => {
    setShowTeamForm(false);
    setEditingTeam(null);
    setTeamForm({ name: '', description: '' });
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          <p className="text-white mt-1">Manage your teams and collaborate effectively</p>
        </div>
        <button
          onClick={() => setShowTeamForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-white pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 border rounded-md ${
              viewMode === 'grid' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'
            } cursor-pointer`}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 border rounded-md ${
              viewMode === 'list' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'
            } cursor-pointer`}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-4 h-1 bg-current rounded-sm"></div>
              <div className="w-4 h-1 bg-current rounded-sm"></div>
              <div className="w-4 h-1 bg-current rounded-sm"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Teams Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-black">{team.name}</CardTitle>
                            <p className="text-sm text-gray-600">{team.members?.length || 0} members</p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === team.id ? null : team.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                            title="Team Options"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {openDropdown === team.id && (
                            <div className="dropdown-container absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => {
                                  handleEditTeam(team);
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              >
                                Edit Team
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteTeam(team.id);
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                Delete Team
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{team.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4" />
                          <span>{team.tasks?.length || 0} tasks</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCreateTask(team)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                          >
                            Create Task
                          </button>
                          <button
                            onClick={() => navigate(`/teams/${team.id}`)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                          >
                            View details
                          </button>
                        </div>
                      </div>

                      {/* Team members */}
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {team.members?.slice(0, 4).map((member, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white cursor-pointer"
                              title={member.name || member.email}
                            >
                              {member.name?.charAt(0) || member.email?.charAt(0) || '?'}
                            </div>
                          ))}
                          {team.members && team.members.length > 4 && (
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white cursor-pointer">
                              +{team.members.length - 4}
                            </div>
                          )}
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                          Invite
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 sm:min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeams.map((team, index) => (
                      <motion.tr
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{team.name}</div>
                              <div className="text-xs sm:text-sm text-gray-500">{team.members?.length || 0} members</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <div className="text-sm text-gray-900 max-w-[80px] sm:max-w-xs truncate">{team.description}</div>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex -space-x-1 sm:-space-x-2">
                              {team.members?.slice(0, 3).map((member, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 border border-white cursor-pointer"
                                  title={member.name || member.email}
                                >
                                  {member.name?.charAt(0) || member.email?.charAt(0) || '?'}
                                </div>
                              ))}
                            </div>
                            {team.members && team.members.length > 3 && (
                              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">+{team.members.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {team.tasks?.length || 0} tasks
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleCreateTask(team)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                              title="Create Task"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/teams/${team.id}`)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="text-gray-600 hover:text-gray-900 cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Delete"
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
          )}

          {/* Empty state */}
          {filteredTeams.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No teams match your search.' : 'Get started by creating a new team.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowTeamForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Team
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
                <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
                <button
                  onClick={handleCloseTaskForm}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.target);
                  const taskData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    status: 'todo',
                    priority: formData.get('priority'),
                    due_date: formData.get('dueDate'),
                    assigned_to: parseInt(formData.get('assignTo')),
                    team_id: selectedTeam?.id // Assign task to the selected team
                  };

                  // Use the tasksAPI to create the task
                  const response = await tasksAPI.create(taskData);
                  toast.success('Task created successfully!');
                  handleCloseTaskForm();
                } catch (error) {
                  toast.error('Failed to create task');
                  console.error('Error creating task:', error);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input
                      name="title"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      rows="3"
                      placeholder="Enter task description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
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
                        name="dueDate"
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <select
                      name="assignTo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select team member</option>
                      {selectedTeam?.members?.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name || member.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseTaskForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Creation/Update Modal */}
      {showTeamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTeam ? 'Edit Team' : 'Create New Team'}
                </h3>
                <button
                  onClick={handleCloseTeamForm}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter team name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      rows="3"
                      placeholder="Enter team description"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseTeamForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {editingTeam ? 'Update Team' : 'Create Team'}
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

export default TeamsPage;