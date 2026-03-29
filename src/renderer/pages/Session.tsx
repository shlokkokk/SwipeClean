import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  X, 
  HardDrive,
  Trash2,
  SkipForward,
  Folder,
  Keyboard,
  Info,
  Zap,
  RotateCcw
} from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import Tooltip from '../components/Tooltip';
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
  const [showGuide, setShowGuide] = useState(true);
  const [exitDirections, setExitDirections] = useState<Record<string, SwipeDirection>>({});
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentFile = fileList[currentIndex];
  const progress = files.length > 0 ? ((currentIndex) / files.length) * 100 : 0;
  const folderName = folderPath.split(/[/\\]/).pop() || 'Unknown';

  // Auto-dismiss the first-time guide
  useEffect(() => {
    if (showGuide) {
      const timer = setTimeout(() => setShowGuide(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showGuide]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentFile && !((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey))) return;
      if (showConfirmDialog) return;
      if (isSwipeTransitioning) return;

      const isSwipeOrOpenKey =
        e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' ||
        e.key === 'd' || e.key === 'D' || e.key === 'a' || e.key === 'A' ||
        e.key === 'w' || e.key === 'W' || e.key === ' ';

      if (e.repeat && isSwipeOrOpenKey) return;

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
  }, [currentFile, showConfirmDialog, undoStack, currentIndex, isSwipeTransitioning]);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (!currentFile || isSwipeTransitioning) return;

    if (direction === 'left' && settings.confirmBeforeDelete) {
      setPendingDelete(currentFile);
      setShowConfirmDialog(true);
      return;
    }

    processSwipe(direction);
  }, [currentFile, settings.confirmBeforeDelete, isSwipeTransitioning]);

  const processSwipe = async (direction: SwipeDirection) => {
    if (!currentFile || isSwipeTransitioning) return;
    setIsSwipeTransitioning(true);

    // Dismiss guide on first action
    if (showGuide) setShowGuide(false);

    setExitDirections(prev => ({ ...prev, [currentFile.id]: direction }));

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

    // Add to undo stack and handle dropout
    setUndoStack(prev => {
      const newStack = [action, ...prev];
      if (newStack.length > settings.maxUndoActions) {
        const dropped = newStack.pop();
        if (dropped && dropped.newStatus === 'deleted') {
          const droppedFile = updatedFiles.find(f => f.id === dropped.fileId);
          if (droppedFile) {
            void window.electronAPI.moveToTrash(droppedFile.path).catch(error => {
              console.error('Error moving to trash:', error);
            });
          }
        }
      }
      return newStack;
    });

    // Update stats immediately for responsive footer updates.
    if (direction === 'right') {
      setKeptCount(prev => prev + 1);
    } else if (direction === 'left') {
      setDeletedCount(prev => prev + 1);
      setSpaceFreed(prev => prev + currentFile.size);
    } else if (direction === 'up') {
      setSkippedCount(prev => prev + 1);
    }

    // Give AnimatePresence time to play directional exit for all key/button actions.
    window.setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsSwipeTransitioning(false);
    }, 240);
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
      setSpaceFreed(prev => prev - fileList[fileIndex].size);
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

  const getUndoTooltip = () => {
    if (undoStack.length > 0) return "Undo last action";
    if (currentIndex > 0) return `Undo limit reached (Max ${settings.maxUndoActions} actions)`;
    return "No actions to undo";
  };

  const handleSessionComplete = async () => {
    setIsProcessing(true);
    // Process remaining pendings in undo stack (older ones are already trashed dynamically)
    const pendingDeletesInStack = undoStack
      .filter(a => a.newStatus === 'deleted')
      .map(a => fileList.find(f => f.id === a.fileId))
      .filter((f): f is FileItem => f !== undefined);

    for (const file of pendingDeletesInStack) {
      await window.electronAPI.moveToTrash(file.path).catch(error => {
        console.error('Error moving to trash:', error);
      });
    }
    onComplete({ keptCount, deletedCount, skippedCount, spaceFreed });
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
          <motion.div 
            className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Check className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Session Complete</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">Great work. You've reviewed every file in this folder.</p>
          <button
            onClick={handleSessionComplete}
            disabled={isProcessing}
            className={`px-8 py-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/25 flex items-center gap-3 mx-auto ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-400 hover:to-purple-500 hover:shadow-2xl hover:shadow-indigo-500/40'}`}
          >
            {isProcessing ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Zap className="w-5 h-5" />
            )}
            {isProcessing ? 'Processing cleanup...' : 'View Summary'}
          </button>
          <div className="mt-6 flex justify-center">
            <Tooltip 
              text={getUndoTooltip()} 
              position="bottom" 
              shortcut="Ctrl+Z"
            >
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0 || isProcessing}
                className={`text-sm font-medium flex items-center justify-center gap-2 outline-none transition-colors ${
                  undoStack.length === 0 || isProcessing
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Undo Last Action
              </button>
            </Tooltip>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <Tooltip text="Return to home" shortcut="Esc" position="bottom">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </Tooltip>
          <div>
            <h1 className="font-semibold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              {folderName}
            </h1>
            <p className="text-xs text-slate-500">
              File <span className="text-indigo-400 font-medium">{currentIndex + 1}</span> of <span className="text-slate-300">{files.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip text="View keyboard shortcuts" shortcut="?" position="bottom">
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 hover:bg-white/5 rounded-xl transition-all duration-200 group"
            >
              <Keyboard className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="px-8 py-4 w-full max-w-lg mx-auto z-20">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          <span>Progress</span>
          <span className="text-indigo-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div
            className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%`, backgroundPosition: ['0% 50%', '100% 50%'] }}
            transition={{ width: { duration: 0.5, ease: 'easeOut' }, backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' } }}
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
      </div>

      {/* ── First-Time Guide ── */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mx-6 mb-2"
          >
            <div className="flex items-center gap-3 px-5 py-4 bg-indigo-500/10 border border-indigo-500/20 shadow-lg rounded-2xl mx-auto max-w-lg mb-4">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-[13px] text-indigo-300">
                <span className="font-bold">Swipe right</span> to keep, <span className="font-bold">left</span> to delete, <span className="font-bold">up</span> to skip
              </p>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-1 hover:bg-indigo-500/20 rounded-lg transition-colors shrink-0 ml-auto"
              >
                <X className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content (Real Stack) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {fileList.slice(currentIndex, currentIndex + 4).reverse().map((file, i, arr) => {
            const isTop = i === arr.length - 1;
            const stackDepth = arr.length - 1 - i;
            const direction = exitDirections[file.id] || null;
            
            // Scattered desk aesthetic: Fanning out perfectly from exactly behind the main box
            const cornerSign = stackDepth % 2 === 0 ? 1 : -1;
            const xOffset = stackDepth === 0 ? 0 : cornerSign * stackDepth * 24;
            const rotateAngle = stackDepth === 0 ? 0 : cornerSign * stackDepth * 4;
            
            // Because dummy and real cards now have identical total heights, 
            // relying purely on scale shrinking to exactly center it behind the main card seamlessly!
            const yOffset = 0;
            
            const scale = 1 - Math.max(0, stackDepth * 0.05);
            const stackOpacity = Math.max(0, 1 - stackDepth * 0.25);
            const zIndex = 10 - stackDepth;

            return (
              <motion.div
                key={file.id}
                custom={direction}
                initial={{ opacity: 0, scale: 0.8, y: stackDepth * -10, x: xOffset * 1.5 }}
                animate={{ 
                  opacity: stackOpacity,
                  scale: scale,
                  x: xOffset,
                  y: yOffset,
                  rotate: rotateAngle,
                  zIndex: zIndex
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 35 }}
                exit={{
                  opacity: 0,
                  x: direction === 'right' ? 400 : direction === 'left' ? -400 : 0,
                  y: direction === 'up' ? -400 : 20,
                  rotate: direction === 'right' ? 15 : direction === 'left' ? -15 : 0,
                  transition: { duration: 0.28, ease: 'easeOut' }
                }}
                className="absolute w-full max-w-xl z-10"
                style={{ pointerEvents: isTop ? 'auto' : 'none', transformOrigin: 'center center' }}
              >
                {isTop ? (
                  <SwipeCard
                    file={file}
                    onSwipe={handleSwipe}
                    onUndo={handleUndo}
                    canUndo={undoStack.length > 0}
                    undoTooltipText={getUndoTooltip()}
                    onOpenFile={handleOpenFile}
                  />
                ) : (
                  <div className="relative w-full mx-auto">
                    <div className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
                      {/* Top section: Preview skeleton */}
                      <div className="h-112 w-full bg-slate-950/40 border-b border-white/5 relative flex items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-800/40 border border-white/10 shadow-inner" />
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] mask-[linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
                      </div>
                      {/* Bottom section: Metadata skeleton matching SwipeCard dimensions */}
                      <div className="p-6 flex flex-col justify-start">
                        <div className="w-20 h-5 bg-slate-800/40 rounded-lg mb-3" />
                        <div className="w-3/4 h-7 bg-slate-800/50 rounded-lg mb-1.5" />
                        <div className="w-full h-3 bg-slate-800/30 rounded-md mb-2" />
                        <div className="w-1/2 h-3 bg-slate-800/20 rounded-md mb-2.5" />
                        <div className="w-1/3 h-4 bg-slate-800/40 rounded-lg mt-1" />
                      </div>
                    </div>
                    {/* Invisible geometric clone of Action Buttons to guarantee 100% pixel-perfect identical flex container alignment */}
                    <div className="flex items-end justify-center gap-7 mt-10 invisible pointer-events-none">
                      <div className="flex flex-col items-center gap-1.5"><div className="w-14 h-14" /><span className="text-[11px] font-bold uppercase tracking-widest">Undo</span></div>
                      <div className="flex flex-col items-center gap-2"><div className="w-16 h-16" /><span className="text-[11px] font-bold uppercase tracking-widest">Delete</span></div>
                      <div className="flex flex-col items-center gap-2"><div className="w-14 h-14" /><span className="text-[11px] font-bold uppercase tracking-widest">Skip</span></div>
                      <div className="flex flex-col items-center gap-2"><div className="w-16 h-16" /><span className="text-[11px] font-bold uppercase tracking-widest">Keep</span></div>
                      <div className="flex flex-col items-center gap-2"><div className="w-14 h-14" /><span className="text-[11px] font-bold uppercase tracking-widest">Open</span></div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Stats Footer ── */}
      <footer className="px-8 py-6 border-t border-white/5 z-20">
        <div className="flex items-center justify-center gap-6">
          <Tooltip text="Files you chose to keep" shortcut="→ / D" position="top">
            <div className="flex items-center gap-2 text-green-400 cursor-default">
              <Check className="w-4 h-4" />
              <motion.span 
                key={keptCount} 
                className="font-bold text-lg"
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {keptCount}
              </motion.span>
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Kept</span>
            </div>
          </Tooltip>
          
          <Tooltip text="Files moved to trash" shortcut="← / A" position="top">
            <div className="flex items-center gap-2 text-red-400 cursor-default">
              <Trash2 className="w-4 h-4" />
              <motion.span 
                key={deletedCount} 
                className="font-bold text-lg"
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {deletedCount}
              </motion.span>
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Deleted</span>
            </div>
          </Tooltip>
          
          <Tooltip text="Files skipped for later" shortcut="↑ / W" position="top">
            <div className="flex items-center gap-2 text-blue-400 cursor-default">
              <SkipForward className="w-4 h-4" />
              <motion.span 
                key={skippedCount} 
                className="font-bold text-lg"
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {skippedCount}
              </motion.span>
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Skipped</span>
            </div>
          </Tooltip>
          
          <Tooltip text="Disk space freed by deletions" position="top">
            <div className="flex items-center gap-2 text-purple-400 cursor-default">
              <HardDrive className="w-4 h-4" />
              <motion.span 
                key={spaceFreed} 
                className="font-bold"
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {formatFileSize(spaceFreed)}
              </motion.span>
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Freed</span>
            </div>
          </Tooltip>
        </div>
      </footer>

      {/* ── Confirm Delete Dialog ── */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-orange-500" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Delete File?</h3>
                  <p className="text-slate-400 text-[13px]">
                    This will be moved to system trash
                  </p>
                </div>
              </div>
              <p className="text-slate-300 bg-slate-900/50 p-4 rounded-xl mb-8 truncate text-sm border border-white/5 font-medium leading-relaxed">
                {pendingDelete?.name}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-5 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
                >
                  Delete File
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyboard Shortcuts Modal ── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass rounded-2xl p-6 max-w-md w-full border border-slate-700/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-indigo-400" />
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* File Actions */}
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">File Actions</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-green-400" /></div>
                      <span className="text-slate-300 text-sm">Keep file</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="kbd">→</kbd>
                      <kbd className="kbd">D</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-400" /></div>
                      <span className="text-slate-300 text-sm">Delete file</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="kbd">←</kbd>
                      <kbd className="kbd">A</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center"><SkipForward className="w-3.5 h-3.5 text-blue-400" /></div>
                      <span className="text-slate-300 text-sm">Skip file</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="kbd">↑</kbd>
                      <kbd className="kbd">W</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">Other</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <span className="text-slate-300 text-sm">Open file in default app</span>
                    <kbd className="kbd">Space</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <span className="text-slate-300 text-sm">Undo last action</span>
                    <kbd className="kbd">Ctrl+Z</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <span className="text-slate-300 text-sm">Go back to home</span>
                    <kbd className="kbd">Esc</kbd>
                  </div>
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
