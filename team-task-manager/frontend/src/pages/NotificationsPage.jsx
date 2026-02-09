import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCircle, X, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { tasksAPI, notificationsAPI } from '../services/api';
import { formatTimeAgo } from '../utils/helpers';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch real notifications from the backend
      const response = await notificationsAPI.getAll({ filter });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Update the backend
      await notificationsAPI.markAsRead(notificationId);

      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      ));

      // Update the notification count in the navbar by triggering a refresh
      // We can't directly access the navbar state, so we'll just update locally here
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update the backend
      await notificationsAPI.markAllAsRead();

      setNotifications(notifications.map(notification => ({ ...notification, read: true })));

      // Update the notification count in the navbar by triggering a refresh
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) || 
                         (filter === 'read' && notification.read);
    
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your tasks and teams</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
              unreadCount === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Unread ({unreadCount})</span>
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              filter === 'read'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({notifications.length - unreadCount})
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
          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${
                    notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.read ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium ${
                            notification.read ? 'text-gray-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {notification.created_at ? formatTimeAgo(notification.created_at) : notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        
                        {/* Notification type badge */}
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === 'task_assignment' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'task_completion' ? 'bg-green-100 text-green-800' :
                          notification.type === 'team_invite' ? 'bg-purple-100 text-purple-800' :
                          notification.type === 'deadline_reminder' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'comment_added' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery 
                    ? 'No notifications match your search.' 
                    : filter === 'unread' 
                      ? 'You have no unread notifications.' 
                      : filter === 'read' 
                        ? 'You have no read notifications.' 
                        : 'You have no notifications right now.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;