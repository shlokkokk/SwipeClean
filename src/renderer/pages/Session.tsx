import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  Check, 
  X, 
  RotateCcw,
  HardDrive,
  Trash2,
  SkipForward,
  Folder,
  Keyboard
} from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import type { FileItem, SwipeDirection, AppSettings, Action } from '@shared/types';

interface SessionProps {
  files: FileItem[];
  folderPath: string;
  settings: AppSettings;
  onComplete: (stats: {
    keptCount: number;
    deletedCount: number;
    skippedCount: number;
    spaceFreed: number;
  }) => void;
  onBack: () => void;
}

const Session: React.FC<SessionProps> = ({ 
  files, 
  folderPath, 
  settings, 
  onComplete, 
  onBack 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileList, setFileList] = useState<FileItem[]>(files);
  const [keptCount, setKeptCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [spaceFreed, setSpaceFreed] = useState(0);
  const [undoStack, setUndoStack] = useState<Action[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FileItem | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const currentFile = fileList[currentIndex];
  const progress = files.length > 0 ? ((currentIndex) / files.length) * 100 : 0;
  const folderName = folderPath.split(/[/\\]/).pop() || 'Unknown';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentFile) return;
      if (showConfirmDialog) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleSwipe('right');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleSwipe('up');
          break;
        case ' ':
          e.preventDefault();
          handleOpenFile();
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onBack();
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, showConfirmDialog, undoStack, currentIndex]);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (!currentFile) return;

    if (direction === 'left' && settings.confirmBeforeDelete) {
      setPendingDelete(currentFile);
      setShowConfirmDialog(true);
      return;
    }

    processSwipe(direction);
  }, [currentFile, settings.confirmBeforeDelete]);

  const processSwipe = async (direction: SwipeDirection) => {
    if (!currentFile) return;

    const action: Action = {
      id: crypto.randomUUID(),
      fileId: currentFile.id,
      previousStatus: currentFile.status,
      newStatus: direction === 'right' ? 'kept' : direction === 'left' ? 'deleted' : 'skipped',
      timestamp: Date.now()
    };

    // Update file status
    const updatedFiles = [...fileList];
    updatedFiles[currentIndex] = { ...currentFile, status: action.newStatus };
    setFileList(updatedFiles);

    // Add to undo stack
    setUndoStack(prev => {
      const newStack = [action, ...prev];
      return newStack.slice(0, settings.maxUndoActions);
    });

    // Update stats
    if (direction === 'right') {
      setKeptCount(prev => prev + 1);
    } else if (direction === 'left') {
      setDeletedCount(prev => prev + 1);
      setSpaceFreed(prev => prev + currentFile.size);
      
      // Move to trash
      try {
        await window.electronAPI.moveToTrash(currentFile.path);
      } catch (error) {
        console.error('Error moving to trash:', error);
      }
    } else if (direction === 'up') {
      setSkippedCount(prev => prev + 1);
    }

    // Move to next file
    if (currentIndex < files.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session complete
      onComplete({
        keptCount: direction === 'right' ? keptCount + 1 : keptCount,
        deletedCount: direction === 'left' ? deletedCount + 1 : deletedCount,
        skippedCount: direction === 'up' ? skippedCount + 1 : skippedCount,
        spaceFreed: direction === 'left' ? spaceFreed + currentFile.size : spaceFreed
      });
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[0];
    const fileIndex = fileList.findIndex(f => f.id === lastAction.fileId);
    
    if (fileIndex === -1) return;

    // Revert the action
    const updatedFiles = [...fileList];
    updatedFiles[fileIndex] = { 
      ...updatedFiles[fileIndex], 
      status: lastAction.previousStatus 
    };
    setFileList(updatedFiles);

    // Update stats
    if (lastAction.newStatus === 'kept') {
      setKeptCount(prev => prev - 1);
    } else if (lastAction.newStatus === 'deleted') {
      setDeletedCount(prev => prev - 1);
      // Note: We can't restore from trash, so we just update the count
    } else if (lastAction.newStatus === 'skipped') {
      setSkippedCount(prev => prev - 1);
    }

    // Go back to that file
    setCurrentIndex(fileIndex);

    // Remove from undo stack
    setUndoStack(prev => prev.slice(1));
  };

  const handleOpenFile = async () => {
    if (!currentFile) return;
    try {
      await window.electronAPI.openExternally(currentFile.path);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    if (pendingDelete) {
      processSwipe('left');
      setPendingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setPendingDelete(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">All Done!</h2>
          <p className="text-slate-400 mb-6">You've reviewed all files in this folder.</p>
          <button
            onClick={() => onComplete({ keptCount, deletedCount, skippedCount, spaceFreed })}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
          >
            View Summary
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="font-semibold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              {folderName}
            </h1>
            <p className="text-xs text-slate-400">
              File {currentIndex + 1} of {files.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <SwipeCard
              file={currentFile}
              onSwipe={handleSwipe}
              onUndo={handleUndo}
              canUndo={undoStack.length > 0}
              onOpenFile={handleOpenFile}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <footer className="px-6 py-4 border-t border-slate-800">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-semibold">{keptCount}</span>
            <span className="text-slate-400 text-sm">Kept</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <Trash2 className="w-5 h-5" />
            <span className="font-semibold">{deletedCount}</span>
            <span className="text-slate-400 text-sm">Deleted</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <SkipForward className="w-5 h-5" />
            <span className="font-semibold">{skippedCount}</span>
            <span className="text-slate-400 text-sm">Skipped</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <HardDrive className="w-5 h-5" />
            <span className="font-semibold">{formatFileSize(spaceFreed)}</span>
            <span className="text-slate-400 text-sm">Freed</span>
          </div>
        </div>
      </footer>

      {/* Confirm Delete Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
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
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete File?</h3>
                  <p className="text-slate-400 text-sm">
                    Are you sure you want to move this file to trash?
                  </p>
                </div>
              </div>
              <p className="text-slate-300 bg-slate-700/50 p-3 rounded-lg mb-6 truncate">
                {pendingDelete?.name}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Keep file</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">→</kbd>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">D</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Delete file</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">←</kbd>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">A</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Skip file</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">↑</kbd>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">W</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Open file</span>
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">Space</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Undo last action</span>
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">Ctrl+Z</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Go back</span>
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-sm">Esc</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Session;
