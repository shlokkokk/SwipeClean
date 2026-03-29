import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Settings, 
  Info,
  Trash2, 
  Clock, 
  Folder,
  Zap
} from 'lucide-react';
import Tooltip from '../components/Tooltip';
import swipecleanLogo from '../assets/swipeclean_logo.png';
import type { RecentFolder } from '@shared/types';

interface HomeProps {
  onFolderSelect: (folderPath: string) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

const Home: React.FC<HomeProps> = ({ onFolderSelect, onOpenSettings, onOpenAbout }) => {
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appVersion, setAppVersion] = useState('Loading...');

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
    if (lowerName.includes('download')) return <Trash2 className="w-4 h-4 text-red-400" />;
    if (lowerName.includes('doc')) return <Folder className="w-4 h-4 text-blue-400" />;
    if (lowerName.includes('pic') || lowerName.includes('image') || lowerName.includes('screen')) return <Folder className="w-4 h-4 text-purple-400" />;
    if (lowerName.includes('desk')) return <Folder className="w-4 h-4 text-green-400" />;
    return <Folder className="w-4 h-4 text-indigo-400" />;
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

  const truncatePath = (path: string, maxLength: number = 65) => {
    if (path.length <= maxLength) return path;
    const charsToShow = maxLength - 3;
    const frontChars = Math.ceil(charsToShow * 0.35); // Show first 35% 
    const backChars = Math.floor(charsToShow * 0.65); // Show last 65% (preserves deep folder names)
    return path.substring(0, frontChars) + '...' + path.substring(path.length - backChars);
  };

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden relative custom-scrollbar">
      
      {/* ── Top Controls - Top Right ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed top-6 right-6 lg:top-8 lg:right-8 z-40 flex items-center gap-3 pointer-events-auto"
      >
        <Tooltip text="About SwipeClean" position="bottom">
          <button
            type="button"
            aria-label="Open About SwipeClean"
            onClick={() => onOpenAbout()}
            className="flex items-center justify-center p-3 bg-white/5 hover:bg-white/15 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/25 text-slate-400 hover:text-white transition-all duration-300 shadow-xl group ring-1 ring-inset ring-white/5"
          >
            <Info className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </button>
        </Tooltip>

        <Tooltip text="Application Settings" position="bottom-left-slant">
          <button
            type="button"
            aria-label="Open Application Settings"
            onClick={onOpenSettings}
            className="flex items-center justify-center p-3 bg-white/5 hover:bg-white/15 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/25 text-slate-400 hover:text-white transition-all duration-300 shadow-xl group ring-1 ring-inset ring-white/5"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          </button>
        </Tooltip>
      </motion.div>

      {/* ── Version - Bottom Right ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-30 pointer-events-none"
      >
        <div className="text-[10px] lg:text-[11px] font-bold text-slate-600 tracking-[0.2em] uppercase">
          Build {appVersion}
        </div>
      </motion.div>

      {/* ── Cinematic Hero Layout ── */}
      <div className="min-h-full w-full flex flex-col items-center justify-center p-4 sm:p-8 z-10 relative">
        
        {/* Main Hero Container */}
        <div className="flex flex-col items-center w-full max-w-4xl my-auto py-12 lg:py-0">
          
          {/* Logo Drop */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-8 relative group"
          >
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img 
              src={swipecleanLogo} 
              alt="SwipeClean" 
              className="w-32 h-32 lg:w-40 lg:h-40 object-contain drop-shadow-2xl grayscale-[5%] group-hover:grayscale-0 transition-all duration-500"
              draggable={false}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap leading-none flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Stable Production
              </span>
            </div>
          </motion.div>

          {/* Core Action CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
            className="w-full flex flex-col items-center"
          >
            <button
              onClick={handleSelectFolder}
              disabled={isLoading}
              className="group relative w-full sm:w-auto min-w-[300px]"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500 animate-gradient-xy" />
              <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-full border border-white/10 ring-1 ring-inset ring-white/5 shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <Zap className="w-5 h-5 text-indigo-300" />
                  </motion.div>
                ) : (
                  <FolderOpen className="w-5 h-5 text-indigo-300 transition-transform duration-300 group-hover:scale-110" />
                )}
                <span className="text-[15px] font-bold text-white tracking-wide">{isLoading ? 'Initializing...' : 'Select Folder to Clean'}</span>
              </div>
            </button>
            
            <p className="text-[13px] text-slate-400 mt-5 font-medium tracking-wide">
              Swipe through files. Keep what matters, delete what doesn't.
            </p>
          </motion.div>

          {/* Elegant Recents List */}
          {recentFolders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-full mt-16"
            >
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-5 flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Recent Workspaces
              </h3>
              
              <div className="flex flex-col gap-3 w-full">
                {recentFolders.slice(0, 4).map((folder) => (
                  <button
                    key={folder.path}
                    onClick={() => handleRecentFolderClick(folder.path)}
                    className="w-full flex sm:flex-row flex-col items-center justify-between px-6 sm:pl-8 sm:pr-14 py-4 sm:py-6 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] border border-white/5 hover:border-white/15 transition-all duration-300 group shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 ring-1 ring-inset ring-white/2 gap-4 sm:gap-0"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:min-w-0 pr-0 sm:pr-6">
                      {/* Icon Container */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-all duration-300 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 group-hover:scale-105">
                        <div className="scale-110 sm:scale-125">{getFolderIcon(folder.name)}</div>
                      </div>
                      
                      {/* Flex Left Aligned Titles */}
                      <div className="flex flex-col text-left min-w-0 flex-1 overflow-hidden">
                        <p className="font-bold text-[14px] sm:text-[15px] text-slate-200 group-hover:text-white transition-colors duration-300 truncate">
                          {folder.name}
                        </p>
                        <Tooltip text={folder.path} position="bottom" delay={300}>
                          <p className="text-[12px] sm:text-[13px] text-slate-500 group-hover:text-indigo-300/60 transition-colors mt-[2px] truncate w-full">
                            {truncatePath(folder.path, 80)}
                          </p>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Meta Data center aligned block */}
                    <div className="flex sm:flex-col flex-row items-center justify-between sm:justify-center w-full sm:w-32 shrink-0 sm:opacity-70 group-hover:opacity-100 transition-opacity duration-300 sm:ml-4 sm:pl-4 sm:border-l border-white/5 h-full sm:mt-0 mt-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span className="text-[11px] sm:text-[12px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 whitespace-nowrap">
                        {folder.fileCount} File{folder.fileCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap hidden sm:block">
                        {formatDate(folder.lastAccessed)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;
