import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Trash2, 
  FolderTree, 
  Eye, 
  RotateCcw, 
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle,
  Check
} from 'lucide-react';
import type { AppSettings } from '@shared/types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onCancel: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onCancel }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleToggle = (key: keyof AppSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNumberChange = (key: 'maxUndoActions' | 'previewCacheSize', value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: Math.max(1, Math.min(100, value))
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleClearCache = async () => {
    try {
      await window.electronAPI.clearPreviewCache();
      setCacheCleared(true);
      setShowClearCacheConfirm(false);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    children 
  }: { 
    icon: React.ElementType; 
    title: string; 
    description: string; 
    children: React.ReactNode 
  }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-3">{description}</p>
        {children}
      </div>
    </div>
  );

  const Toggle = ({ 
    checked, 
    onChange 
  }: { 
    checked: boolean; 
    onChange: () => void 
  }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-indigo-500' : 'bg-slate-600'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
      />
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Safety Section */}
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Safety
            </h2>
            <SettingItem
              icon={Trash2}
              title="Confirm Before Delete"
              description="Show a confirmation dialog before moving files to trash"
            >
              <Toggle 
                checked={localSettings.confirmBeforeDelete} 
                onChange={() => handleToggle('confirmBeforeDelete')} 
              />
            </SettingItem>
          </div>

          {/* Scanning Section */}
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Scanning
            </h2>
            <div className="space-y-3">
              <SettingItem
                icon={FolderTree}
                title="Recursive Scan"
                description="Include files from subdirectories"
              >
                <Toggle 
                  checked={localSettings.recursiveScan} 
                  onChange={() => handleToggle('recursiveScan')} 
                />
              </SettingItem>

              <SettingItem
                icon={Eye}
                title="Show System Files"
                description="Include hidden and system files in scan results"
              >
                <Toggle 
                  checked={localSettings.showSystemFiles} 
                  onChange={() => handleToggle('showSystemFiles')} 
                />
              </SettingItem>
            </div>
          </div>

          {/* Performance Section */}
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Performance
            </h2>
            <div className="space-y-3">
              <SettingItem
                icon={RotateCcw}
                title="Undo History"
                description="Number of actions to keep in undo history"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={localSettings.maxUndoActions}
                    onChange={(e) => handleNumberChange('maxUndoActions', parseInt(e.target.value) || 10)}
                    className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-sm text-slate-400">actions</span>
                </div>
              </SettingItem>

              <SettingItem
                icon={ImageIcon}
                title="Preview Cache"
                description="Maximum number of previews to cache"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={localSettings.previewCacheSize}
                    onChange={(e) => handleNumberChange('previewCacheSize', parseInt(e.target.value) || 100)}
                    className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-sm text-slate-400">previews</span>
                </div>
              </SettingItem>

              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">Clear Preview Cache</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Delete all cached previews to free up disk space
                  </p>
                  <button
                    onClick={() => setShowClearCacheConfirm(true)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors"
                  >
                    Clear Cache
                  </button>
                  {cacheCleared && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-green-400 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Cache cleared successfully!
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              About
            </h2>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">SwipeClean</h3>
                  <p className="text-sm text-slate-400">Version 1.0.0</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                SwipeClean is a gamified file cleanup application that makes organizing your files fun and easy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cache Confirmation Dialog */}
      {showClearCacheConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear Cache?</h3>
                <p className="text-slate-400 text-sm">
                  This will delete all cached previews. They will be regenerated when needed.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearCacheConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
