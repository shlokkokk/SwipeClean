import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Settings, 
  Sparkles, 
  Trash2, 
  Clock, 
  ChevronRight,
  Folder,
  Zap
} from 'lucide-react';
import type { RecentFolder } from '@shared/types';

interface HomeProps {
  onFolderSelect: (folderPath: string) => void;
  onOpenSettings: () => void;
}

const Home: React.FC<HomeProps> = ({ onFolderSelect, onOpenSettings }) => {
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    loadRecentFolders();
    loadAppVersion();
  }, []);

  const loadRecentFolders = async () => {
    try {
      const folders = await window.electronAPI.getRecentFolders();
      setRecentFolders(folders);
    } catch (error) {
      console.error('Error loading recent folders:', error);
    }
  };

  const loadAppVersion = async () => {
    try {
      const version = await window.electronAPI.getAppVersion();
      setAppVersion(version);
    } catch (error) {
      console.error('Error loading app version:', error);
    }
  };

  const handleSelectFolder = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.selectFolder();
      if (!result.canceled && result.filePaths.length > 0) {
        onFolderSelect(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentFolderClick = (folderPath: string) => {
    onFolderSelect(folderPath);
  };

  const getFolderIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('download')) return <Trash2 className="w-6 h-6 text-red-400" />;
    if (lowerName.includes('doc')) return <Folder className="w-6 h-6 text-blue-400" />;
    if (lowerName.includes('pic') || lowerName.includes('image')) return <Folder className="w-6 h-6 text-purple-400" />;
    if (lowerName.includes('desk')) return <Folder className="w-6 h-6 text-green-400" />;
    return <Folder className="w-6 h-6 text-indigo-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-glow">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent"
        >
          SwipeClean
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg text-center mb-10"
        >
          Clean folders, have fun. Swipe through files like never before.
        </motion.p>

        {/* Select Folder Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSelectFolder}
          disabled={isLoading}
          className="group relative w-full max-w-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-semibold text-lg shadow-xl">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Zap className="w-6 h-6" />
              </motion.div>
            ) : (
              <FolderOpen className="w-6 h-6" />
            )}
            {isLoading ? 'Opening...' : 'Select Folder to Clean'}
          </div>
        </motion.button>

        {/* Recent Folders */}
        {recentFolders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md mt-10"
          >
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Folders
            </h3>
            <div className="space-y-2">
              {recentFolders.slice(0, 5).map((folder, index) => (
                <motion.button
                  key={folder.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecentFolderClick(folder.path)}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    {getFolderIcon(folder.name)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                      {folder.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {folder.fileCount} files • {formatDate(folder.lastAccessed)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settings Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="mt-8 flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </motion.button>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-4 text-xs text-slate-600"
        >
          v{appVersion}
        </motion.p>
      </div>
    </div>
  );
};

export default Home;
