import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  CheckSquare,
  Square,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../contexts/DarkModeContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
    { name: 'All Tasks', href: '/all-tasks', icon: Square },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? '4rem' : '16rem',
          transition: { duration: 0.3 }
        }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 flex flex-col overflow-hidden`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Link to="/" className="flex items-center cursor-pointer">
              <img
                src="/team_work.jpg"
                alt="Team Logo"
                className="h-8 w-8 mr-2 rounded"
              />
              <span className="text-lg font-bold text-gray-900 dark:text-gray-900">Team</span>
            </Link>
          </div>
          <button
            type="button"
            className="lg:hidden -mr-2 h-10 w-10 rounded-md p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when navigating
                  className={`${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isCollapsed ? 'justify-center' : 'justify-start'
                  } cursor-pointer`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Quick actions */}
          <div className="mt-6 px-2">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              {!isCollapsed && 'Create Task'}
            </button>
          </div>

          {/* Collapsible section */}
          <div className="mt-8 px-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <span>Collapse</span>
                  <ChevronLeft className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={toggleDarkMode}
                className="p-1 text-gray-500 hover:text-gray-600 cursor-pointer"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;