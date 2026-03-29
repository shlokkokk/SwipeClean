import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Session from './pages/Session';
import Summary from './pages/Summary';
import Settings from './pages/Settings';
import SortingModal from './components/SortingModal';
import type { FileItem, SortOrder, Session as SessionType, AppSettings } from '@shared/types';

type View = 'home' | 'sorting' | 'session' | 'summary' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [sessionStats, setSessionStats] = useState({
    totalFiles: 0,
    keptCount: 0,
    deletedCount: 0,
    skippedCount: 0,
    spaceFreed: 0
  });
  const [settings, setSettings] = useState<AppSettings>({
    confirmBeforeDelete: false,
    recursiveScan: true,
    showSystemFiles: false,
    maxUndoActions: 10,
    previewCacheSize: 100
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath);
    setCurrentView('sorting');
  };

  const handleSortingConfirm = async (order: SortOrder, startDate?: string, endDate?: string) => {
    setSortOrder(order);
    if (startDate) setDateRange(prev => ({ ...prev, start: startDate }));
    if (endDate) setDateRange(prev => ({ ...prev, end: endDate }));
    
    // Scan folder
    try {
      const scannedFiles = await window.electronAPI.scanFolder(selectedFolder, {
        recursive: settings.recursiveScan,
        showSystemFiles: settings.showSystemFiles,
        sortOrder: order,
        dateRangeStart: startDate,
        dateRangeEnd: endDate
      });
      
      setFiles(scannedFiles);
      setSessionStats(prev => ({ ...prev, totalFiles: scannedFiles.length }));
      setCurrentView('session');
      
      // Add to recent folders
      const folderName = selectedFolder.split(/[/\\]/).pop() || 'Unknown';
      await window.electronAPI.addRecentFolder({
        path: selectedFolder,
        name: folderName,
        lastAccessed: new Date().toISOString(),
        fileCount: scannedFiles.length
      });
    } catch (error) {
      console.error('Error scanning folder:', error);
      alert('Error scanning folder. Please try again.');
      setCurrentView('home');
    }
  };

  const handleSessionComplete = (stats: {
    keptCount: number;
    deletedCount: number;
    skippedCount: number;
    spaceFreed: number;
  }) => {
    setSessionStats(prev => ({
      ...prev,
      ...stats
    }));
    setCurrentView('summary');
    
    // Save session to database
    const session: SessionType = {
      id: crypto.randomUUID(),
      folderPath: selectedFolder,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      totalFiles: files.length,
      keptCount: stats.keptCount,
      deletedCount: stats.deletedCount,
      skippedCount: stats.skippedCount,
      spaceFreed: stats.spaceFreed,
      sortOrder,
      dateRangeStart: dateRange.start,
      dateRangeEnd: dateRange.end
    };
    
    window.electronAPI.saveSession(session);
  };

  const handleCleanAnother = () => {
    setSelectedFolder('');
    setFiles([]);
    setSessionStats({
      totalFiles: 0,
      keptCount: 0,
      deletedCount: 0,
      skippedCount: 0,
      spaceFreed: 0
    });
    setCurrentView('home');
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
  };

  const handleSettingsSave = async (newSettings: AppSettings) => {
    try {
      await window.electronAPI.saveSettings(newSettings);
      setSettings(newSettings);
      setCurrentView('home');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="app-shell text-slate-200">
      {/* ── Deep Animated Background ── */}
      <div className="ambient-bg">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
      </div>

      {/* ── Central Frosted Glass Window ── */}
      <div className="glass-panel">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Home 
                onFolderSelect={handleFolderSelect}
                onOpenSettings={handleOpenSettings}
              />
            </motion.div>
          )}
          
          {currentView === 'sorting' && (
            <motion.div
              key="sorting"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-full w-full flex items-center justify-center p-8"
            >
              <SortingModal
                folderPath={selectedFolder}
                onConfirm={handleSortingConfirm}
                onCancel={handleBackToHome}
              />
            </motion.div>
          )}
          
          {currentView === 'session' && (
            <motion.div
              key="session"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Session
                files={files}
                folderPath={selectedFolder}
                settings={settings}
                onComplete={handleSessionComplete}
                onBack={handleBackToHome}
              />
            </motion.div>
          )}
          
          {currentView === 'summary' && (
            <motion.div
              key="summary"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-full w-full flex items-center justify-center p-8"
            >
              <Summary
                stats={sessionStats}
                onCleanAnother={handleCleanAnother}
                onBackToHome={handleBackToHome}
              />
            </motion.div>
          )}
          
          {currentView === 'settings' && (
            <motion.div
              key="settings"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Settings
                settings={settings}
                onSave={handleSettingsSave}
                onCancel={handleBackToHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
