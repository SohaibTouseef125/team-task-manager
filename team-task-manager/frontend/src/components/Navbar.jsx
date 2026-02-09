import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, Moon, Sun, Settings, Plus, ChevronDown, LogOut } from 'lucide-react';
import { useAnimate } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useDarkMode } from '../contexts/DarkModeContext';
import { tasksAPI, notificationsAPI } from '../services/api';

const Navbar = ({ setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Load notifications from API only when authenticated
  useEffect(() => {
    if (!user) {
      // If user is not authenticated, don't try to fetch notifications
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        // Fetch real notifications from the backend
        const response = await notificationsAPI.getAll({ filter: 'all', limit: 5 });
        setNotifications(response.data.notifications || []);

        // Also fetch the total unread count
        const countResponse = await notificationsAPI.getCount();
        setNotificationCount(countResponse.data.count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Check if the error is due to authentication
        if (error.response?.status === 401) {
          // Don't set notifications if unauthorized
          return;
        }
        // Fallback to empty array if there's an error
        setNotifications([]);
        setNotificationCount(0);
      }
    };

    fetchNotifications();
  }, [user]); // Only run when user changes

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center flex-1 min-w-0">
          <button
            type="button"
            className="lg:hidden -ml-2 mr-3 h-10 w-10 rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            <Link to= "/"  className="flex items-center cursor-pointer">
              <img
                src="/team_work.jpg"
                alt="Team Logo"
                className="h-8 w-8 mr-2 rounded"
              />
              <span className="text-lg font-bold text-gray-900">Team</span>
            </Link>
          </div>

          <div className="relative flex-1 ml-4">
            <form onSubmit={handleSearch} className="flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks, teams, members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-gray-900 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
              />
            </form>
          </div>
        </div>

        {/* Right section - Collapsed on smaller screens */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0 ml-2">
          {/* Quick create dropdown - Hidden on small screens */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Create</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 relative transition-colors cursor-pointer"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {notificationCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <a
                        key={index}
                        href="#"
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100 first:border-t-0"
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </a>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No new notifications</div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">View all</Link>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center space-x-1 sm:space-x-2 p-1 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors cursor-pointer"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
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
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[80px] truncate">{user?.name || 'User'}</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Your Profile</a>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Settings</Link>
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Team Settings</a>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;