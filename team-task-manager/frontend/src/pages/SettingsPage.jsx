import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Globe,
  Bell,
  Sun,
  Moon,
  Shield,
  Key,
  LogOut,
  Camera,
  Save,
  X,
  Palette,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usersAPI, authAPI } from '../services/api';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { logout, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    timezone: user?.timezone || 'America/New_York',
    language: user?.language || 'English',
    theme: user?.theme || 'light',
    notifications: {
      email: user?.notifications?.email || true,
      push: user?.notifications?.push || true,
      mentions: user?.notifications?.mentions || true,
      reminders: user?.notifications?.reminders || true
    },
    privacy: {
      profileVisibility: user?.privacy?.profileVisibility || 'public',
      activityVisibility: user?.privacy?.activityVisibility || 'friends'
    },
    location: user?.location || '',
    jobTitle: user?.job_title || '',
    company: user?.company || '',
    website: user?.website || '',
    phone: user?.phone || ''
  });

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Update profile using real API - now supports all profile fields
      const profileUpdateData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        timezone: formData.timezone,
        language: formData.language,
        theme: formData.theme,
        notifications: formData.notifications,
        privacy: formData.privacy,
        location: formData.location,
        job_title: formData.jobTitle,
        company: formData.company,
        website: formData.website,
        phone: formData.phone
      };

      // Only include fields that have actual values (not empty strings, null, or undefined)
      const filteredProfileData = {};
      Object.keys(profileUpdateData).forEach(key => {
        const value = profileUpdateData[key];
        if (value !== undefined && value !== null && value !== '') {
          filteredProfileData[key] = value;
        }
      });

      const result = await updateProfile(filteredProfileData);

      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    try {
      setIsUploading(true);
      const response = await usersAPI.uploadAvatar(file);

      if (response.data.success) {
        // The uploadAvatar endpoint returns the updated user object
        // Update the user context with the new user data that includes the avatar
        // Call updateProfile to update the user in the context with the new avatar URL
        await updateProfile({ avatar_url: response.data.user.avatar_url });

        toast.success('Avatar updated successfully!');
      } else {
        toast.error(response.data.error || 'Failed to update avatar');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload avatar');
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <nav className="flex flex-col space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg m-2 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } cursor-pointer`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <LogOut className="h-5 w-5 mr-2 text-red-600" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </button>

                <button className="w-full inline-flex items-center px-4 py-3 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl flex items-center">
                {tabs.find(tab => tab.id === activeTab)?.icon && (
                  <>
                    {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon, { className: "h-5 w-5 mr-2 text-blue-600" })}
                  </>
                )}
                {tabs.find(tab => tab.id === activeTab)?.name} Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar_url ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.avatar_url.startsWith('/') ? user.avatar_url : `/${user.avatar_url}`}`}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('Avatar failed to load:', e.target.src);
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-medium text-white">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-white hover:shadow-xl transition-shadow cursor-pointer">
                        <Camera className="h-4 w-4 text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                      <p className="text-sm text-gray-500 mt-1">Upload a new photo or change your avatar</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Berlin">Berlin (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Security</h3>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                              <Key className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                              <p className="text-sm text-gray-500">Update your account password</p>
                            </div>
                          </div>
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer">
                            Change
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                              <Lock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-500">Add an extra layer of security</p>
                            </div>
                          </div>
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer">
                            Enable
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('email', !formData.notifications.email)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                        } cursor-pointer`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.notifications.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('push', !formData.notifications.push)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                        } cursor-pointer`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.notifications.push ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <Activity className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Mentions & Replies</h4>
                          <p className="text-sm text-gray-500">Get notified when someone mentions you</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('mentions', !formData.notifications.mentions)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.notifications.mentions ? 'bg-blue-600' : 'bg-gray-200'
                        } cursor-pointer`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.notifications.mentions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                          <Bell className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Task Reminders</h4>
                          <p className="text-sm text-gray-500">Get reminded about upcoming deadlines</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('reminders', !formData.notifications.reminders)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.notifications.reminders ? 'bg-blue-600' : 'bg-gray-200'
                        } cursor-pointer`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.notifications.reminders ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Visibility
                      </label>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Anyone on the internet can see your profile' },
                          { value: 'friends', label: 'Friends Only', desc: 'Only people you follow can see your profile' },
                          { value: 'private', label: 'Private', desc: 'Only you can see your profile' }
                        ].map((option) => (
                          <div key={option.value} className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={formData.privacy.profileVisibility === option.value}
                              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-gray-900">
                                {option.label}
                              </label>
                              <p className="text-sm text-gray-500">{option.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Activity Visibility
                      </label>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Your activity is visible to everyone' },
                          { value: 'friends', label: 'Friends Only', desc: 'Only your friends can see your activity' },
                          { value: 'private', label: 'Private', desc: 'Your activity is only visible to you' }
                        ].map((option) => (
                          <div key={option.value} className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <input
                              type="radio"
                              name="activityVisibility"
                              value={option.value}
                              checked={formData.privacy.activityVisibility === option.value}
                              onChange={(e) => handlePrivacyChange('activityVisibility', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-gray-900">
                                {option.label}
                              </label>
                              <p className="text-sm text-gray-500">{option.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleInputChange('theme', 'light')}
                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                          formData.theme === 'light'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                            : 'border-gray-300 hover:border-gray-400'
                        } cursor-pointer`}
                      >
                        <Sun className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">Light</div>
                        <div className="text-xs text-gray-500 mt-1">Clean and bright</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('theme', 'dark')}
                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                          formData.theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                            : 'border-gray-300 hover:border-gray-400'
                        } cursor-pointer`}
                      >
                        <Moon className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">Dark</div>
                        <div className="text-xs text-gray-500 mt-1">Easy on the eyes</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('theme', 'auto')}
                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                          formData.theme === 'auto'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                            : 'border-gray-300 hover:border-gray-400'
                        } cursor-pointer`}
                      >
                        <Globe className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">Auto</div>
                        <div className="text-xs text-gray-500 mt-1">System preference</div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;