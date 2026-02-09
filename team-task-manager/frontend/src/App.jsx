import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { useAuth, AuthProvider } from './hooks/useAuth'; // Import both useAuth and AuthProvider
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TeamsPage from './pages/TeamsPage';
import MyTasksPage from './pages/MyTasksPage';
import AllTasksPage from './pages/AllTasksPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to access auth context and conditionally render
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // If still loading auth status, show a loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children(isAuthenticated, user);
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
              <AuthWrapper>
                {(isAuthenticated, user) => (
                  <>
                    {/* Show sidebar only when user is authenticated */}
                    {isAuthenticated && (
                      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
                    )}

                    <div className={`flex flex-col ${isAuthenticated ? 'flex-1' : 'w-full'} w-0 overflow-hidden`}>
                      <Navbar setSidebarOpen={setSidebarOpen} />

                      <main className="flex-1 relative z-0 overflow-y-auto py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            <Route
                              path="/app"
                              element={
                                <ProtectedRoute>
                                  <Navigate to="/dashboard" replace />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute>
                                  <Dashboard />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/teams"
                              element={
                                <ProtectedRoute>
                                  <TeamsPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/my-tasks"
                              element={
                                <ProtectedRoute>
                                  <MyTasksPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/all-tasks"
                              element={
                                <ProtectedRoute>
                                  <AllTasksPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/calendar"
                              element={
                                <ProtectedRoute>
                                  <CalendarPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/analytics"
                              element={
                                <ProtectedRoute>
                                  <AnalyticsPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute>
                                  <SettingsPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/notifications"
                              element={
                                <ProtectedRoute>
                                  <NotificationsPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/tasks/:taskId"
                              element={
                                <ProtectedRoute>
                                  <TaskDetailsPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/teams/:teamId"
                              element={
                                <ProtectedRoute>
                                  <TeamDetailsPage />
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </>
                )}
              </AuthWrapper>
            </div>
            <Toaster position="top-right" />
          </Router>
        </QueryClientProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
