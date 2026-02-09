import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Command, Users, CheckSquare, Calendar, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Mock search results
  const mockResults = [
    { id: 1, type: 'task', title: 'Design new dashboard UI', icon: CheckSquare, path: '/my-tasks' },
    { id: 2, type: 'task', title: 'Review quarterly reports', icon: CheckSquare, path: '/all-tasks' },
    { id: 3, type: 'team', title: 'Marketing Team', icon: Users, path: '/teams' },
    { id: 4, type: 'task', title: 'Fix authentication bug', icon: CheckSquare, path: '/my-tasks' },
    { id: 5, type: 'page', title: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 6, type: 'page', title: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 7, type: 'team', title: 'Development Team', icon: Users, path: '/teams' },
    { id: 8, type: 'task', title: 'Prepare presentation slides', icon: CheckSquare, path: '/all-tasks' }
  ];

  const filteredResults = query
    ? mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase())
      )
    : mockResults;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter' && filteredResults.length > 0) {
      e.preventDefault();
      // Simulate navigation
      console.log('Navigating to:', filteredResults[selectedIndex].path);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative z-50 w-full max-w-2xl mx-4"
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search tasks, teams, members, and pages..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>↑↓ to navigate</span>
                  <span>⏎ to select</span>
                  <span>ESC to close</span>
                </div>
                <span>{filteredResults.length} results</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                  <p className="text-gray-500">Try adjusting your search query</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredResults.map((result, index) => {
                    const Icon = result.icon;
                    return (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 ${
                          index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => {
                          console.log('Navigating to:', result.path);
                          onClose();
                        }}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-400">
                          ⏎
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                  <span>Quick search</span>
                </div>
                <div>Team Task Manager Search</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;