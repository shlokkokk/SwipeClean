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
  RotateCcw,
  LogOut,
  Gamepad2,
  Target,
  Layers
} from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import Tooltip from '../components/Tooltip';
import LiveStackPanel from '../components/LiveStackPanel';
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FileItem | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [exitDirections, setExitDirections] = useState<Record<string, SwipeDirection>>({});
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLiveStack, setShowLiveStack] = useState(false);
  const [committedToTrash, setCommittedToTrash] = useState<{
    action: Action;
    file: FileItem | null;
  } | null>(null);

  const currentFile = fileList[currentIndex];
  // Calculate progress on 0 to 100 scale based on index + 1
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
      if (showExitConfirm && e.key !== 'Escape') return;
      if (isSwipeTransitioning) return;

      const isSwipeOrOpenKey =
        e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' ||
        e.key === 'd' || e.key === 'D' || e.key === 'a' || e.key === 'A' ||
        e.key === 'w' || e.key === 'W' || e.key === ' ';

      if (e.repeat && isSwipeOrOpenKey) return;

      switch (e.key) {
        case 'e':
        case 'E':
          e.preventDefault();
          setShowLiveStack(prev => !prev);
          break;
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
          if (showExitConfirm) {
            setShowExitConfirm(false);
          } else if (showShortcuts) {
            setShowShortcuts(false);
          } else {
            setShowExitConfirm(true);
          }
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, showConfirmDialog, showExitConfirm, undoStack, currentIndex, isSwipeTransitioning]);

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
            setCommittedToTrash({ action: dropped, file: droppedFile });
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

  const commitPendingDeletes = async () => {
    const pendingDeletesInStack = undoStack
      .filter(a => a.newStatus === 'deleted')
      .map(a => fileList.find(f => f.id === a.fileId))
      .filter((f): f is FileItem => f !== undefined);

    for (const file of pendingDeletesInStack) {
      await window.electronAPI.moveToTrash(file.path).catch(error => {
        console.error('Error moving to trash:', error);
      });
    }
  };

  const handleSessionComplete = async () => {
    setIsProcessing(true);
    await commitPendingDeletes();
    onComplete({ keptCount, deletedCount, skippedCount, spaceFreed });
  };

  const handleAbandonSession = async () => {
    setIsProcessing(true);
    await commitPendingDeletes();
    setShowExitConfirm(false);
    onBack();
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
            className="w-24 h-24 rounded-[24px] bg-[#00e5ff]/10 flex items-center justify-center mx-auto mb-6 border border-[#00e5ff]/20"
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(0,229,255,0)", "0 0 20px rgba(0,229,255,0.2)", "0 0 0 rgba(0,229,255,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gamepad2 className="w-12 h-12 text-[#00e5ff]" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-widest uppercase">Stage Cleared</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto uppercase text-xs tracking-widest font-bold">All targets analyzed.</p>
          <button
            onClick={handleSessionComplete}
            disabled={isProcessing}
            className={`px-8 py-4 bg-[#0a1120] border-2 border-[#00e5ff] text-white font-black rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.3)] flex items-center justify-center gap-3 mx-auto uppercase tracking-widest ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#00e5ff]/20 hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]'}`}
          >
            {isProcessing ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#00e5ff]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Gamepad2 className="w-5 h-5 text-[#00e5ff]" />
            )}
            {isProcessing ? 'Syncing...' : 'View Stats'}
          </button>
          <div className="mt-8 flex justify-center">
            <Tooltip 
              text={getUndoTooltip()} 
              position="bottom" 
              shortcut="Ctrl+Z"
            >
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0 || isProcessing}
                className={`text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 outline-none transition-colors ${
                  undoStack.length === 0 || isProcessing
                    ? 'text-slate-700 cursor-not-allowed opacity-50'
                    : 'text-[#00e5ff]/80 hover:text-[#00e5ff]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                CTRL+Z Undo
              </button>
            </Tooltip>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {/* ── Game Controller Header & Top Section ── */}
      <div className="w-full flex flex-col">
        <header className="flex items-center justify-between px-8 py-6 z-20">
          <div className="flex flex-1 items-start gap-4">
            <Tooltip text="Return to home" shortcut="Esc" position="bottom">
              <button
                onClick={() => setShowExitConfirm(true)}
                className="w-11 h-11 bg-[#0d1320] border border-white/5 rounded-xl hover:bg-[#151f32] hover:border-[#00e5ff]/30 flex items-center justify-center transition-all duration-200 group shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-[#00e5ff] transition-colors" />
              </button>
            </Tooltip>
            {/* Center aligned title */}
            <div className="flex flex-col flex-1 justify-center max-w-lg mx-auto pl-16">
              <h1 className="font-bold text-white text-xl flex items-center gap-2 tracking-widest font-mono">
                <Folder className="w-5 h-5 text-[#00e5ff]" />
                {folderName}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-left">
                <span>Target </span>
                <span className="text-[#00e5ff]">{currentIndex + 1}</span>
                <span className="mx-1">/</span>
                <span>{files.length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text={showLiveStack ? 'Hide live stack HUD' : 'Show live stack HUD'} shortcut="HUD" position="bottom">
              <button
                onClick={() => setShowLiveStack(prev => !prev)}
                className={`w-11 h-11 border rounded-xl flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-200 group ${
                  showLiveStack
                    ? 'border-[#00e5ff]/50 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/15'
                    : 'border-white/5 bg-[#0d1320] hover:bg-[#151f32] hover:border-[#00e5ff]/30'
                }`}
              >
                <Layers className={`w-5 h-5 transition-colors ${showLiveStack ? 'text-[#00e5ff]' : 'text-slate-500 group-hover:text-[#00e5ff]'}`} />
              </button>
            </Tooltip>

            <Tooltip text="Keyboard Shortcuts" shortcut="?" position="bottom">
              <button 
                onClick={() => setShowShortcuts(true)}
                className="w-11 h-11 border border-white/5 rounded-xl bg-[#0d1320] flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:bg-[#151f32] hover:border-[#00e5ff]/30 transition-all duration-200 group"
              >
                <Gamepad2 className="w-5 h-5 text-slate-500 group-hover:text-[#00e5ff] transition-colors" />
              </button>
            </Tooltip>
          </div>
        </header>

        {/* ── Center Target Progress ── */}
        <div className="gc-progress-container z-20 px-8 py-0">
          <div className="gc-progress-header">
            <div className="flex items-center gap-2 text-[#00e5ff]">
              <Target className="w-4 h-4" />
              <span>PROGRESS</span>
            </div>
            <span className="text-[#00e5ff] font-mono text-[11px]">{Math.round(progress)}%</span>
          </div>
          <div className="gc-progress-track">
            <motion.div
              className="gc-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            >
              {progress > 0 && <div className="gc-progress-glow" />}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main Stack Display ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {fileList.slice(currentIndex, currentIndex + 4).reverse().map((file, i, arr) => {
            const isTop = i === arr.length - 1;
            const stackDepth = arr.length - 1 - i;
            const direction = exitDirections[file.id] || null;
            
            // Floating depth calculations
            const scale = 1 - Math.max(0, stackDepth * 0.05);
            const stackOpacity = Math.max(0, 1 - stackDepth * 0.25);
            
            // Fanning effect with alternating sign
            const cornerSign = stackDepth % 2 === 0 ? 1 : -1;
            const xOffset = stackDepth === 0 ? 0 : cornerSign * stackDepth * 20;
            // Only rotate if not the top card
            const rotateAngle = stackDepth === 0 ? 0 : cornerSign * stackDepth * 3;
            const yOffset = stackDepth * -6; // Slight arc up for bottom cards

            const zIndex = 10 - stackDepth;

            return (
              <motion.div
                key={file.id}
                custom={direction}
                initial={{ opacity: 0, scale: 0.8, y: stackDepth * 20, x: xOffset * 1.5 }}
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
                  x: direction === 'right' ? 500 : direction === 'left' ? -500 : 0,
                  y: direction === 'up' ? -500 : 50,
                  rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
                className="absolute w-full z-10 flex items-center justify-center"
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
                  <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
                    <div className="gc-card w-full overflow-hidden flex flex-col opacity-60 pointer-events-none">
                      <div className="gc-brackets absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-[#00e5ff] rounded-tl-[11px] opacity-70" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-[#00e5ff] rounded-tr-[11px] opacity-70" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-[#00e5ff] rounded-bl-[11px] opacity-70" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-[#00e5ff] rounded-br-[11px] opacity-70" />
                      </div>
                      <div className="gc-preview-area h-104 w-full flex items-center justify-center relative p-1">
                        <div className="gc-icon-container" />
                      </div>
                      <div className="gc-file-info px-6 py-5 flex items-center gap-6">
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <div className="w-12 h-4 bg-white/5 rounded" />
                            <div className="w-8 h-3 bg-white/5 rounded" />
                          </div>
                          <div className="w-48 h-6 bg-white/10 rounded mb-1" />
                          <div className="w-64 h-3 bg-white/5 rounded" />
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 border-l border-white/5 pl-6">
                          <div className="w-16 h-4 bg-white/10 rounded" />
                          <div className="w-20 h-3 bg-white/5 rounded mt-1" />
                        </div>
                      </div>
                    </div>
                    {/* Ghost button container to keep heights identical */}
                    <div className="relative flex justify-center items-end w-full mt-8 h-36 invisible pointer-events-none" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {showLiveStack && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="hidden xl:flex absolute right-6 top-0 bottom-0 items-center z-30 pointer-events-auto"
            >
              <LiveStackPanel
                fileList={fileList}
                currentIndex={currentIndex}
                undoStack={undoStack}
                maxUndoActions={settings.maxUndoActions}
                committed={committedToTrash}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stats HUD Footer ── */}
      <footer className="px-8 pb-8 pt-4 z-20 border-t border-white/5 bg-[#0a0e17]/50 mt-auto">
        <div className="gc-stats-bar uppercase">
          <Tooltip text="Files you chose to keep" shortcut="→ / B" position="top">
            <div className="gc-stat-item">
              <div className="gc-stat-icon-wrapper border-emerald-500/30 bg-emerald-500/10">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <motion.span 
                key={keptCount} 
                className="gc-stat-value"
                initial={{ scale: 1.4, color: '#00e5ff' }}
                animate={{ scale: 1, color: '#fff' }}
              >
                {keptCount}
              </motion.span>
              <span className="text-[10px] text-slate-500 font-bold">Kept</span>
            </div>
          </Tooltip>
          
          <Tooltip text="Files moved to trash" shortcut="← / X" position="top">
            <div className="gc-stat-item border-l border-white/5 pl-8">
              <div className="gc-stat-icon-wrapper border-rose-500/30 bg-rose-500/10">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <motion.span 
                key={deletedCount} 
                className="gc-stat-value"
                initial={{ scale: 1.4, color: '#00e5ff' }}
                animate={{ scale: 1, color: '#fff' }}
              >
                {deletedCount}
              </motion.span>
              <span className="text-[10px] text-slate-500 font-bold">Del</span>
            </div>
          </Tooltip>
          
          <Tooltip text="Files skipped for later" shortcut="↑ / Y" position="top">
            <div className="gc-stat-item border-l border-white/5 pl-8">
              <div className="gc-stat-icon-wrapper border-blue-500/30 bg-blue-500/10">
                <SkipForward className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <motion.span 
                key={skippedCount} 
                className="gc-stat-value"
                initial={{ scale: 1.4, color: '#00e5ff' }}
                animate={{ scale: 1, color: '#fff' }}
              >
                {skippedCount}
              </motion.span>
              <span className="text-[10px] text-slate-500 font-bold">Skip</span>
            </div>
          </Tooltip>
          
          <Tooltip text="Disk space freed by deletions" position="top">
            <div className="gc-stat-item border-l border-white/5 pl-8">
              <div className="gc-stat-icon-wrapper border-purple-500/30 bg-purple-500/10">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <motion.span 
                key={spaceFreed} 
                className="gc-stat-value"
                initial={{ scale: 1.2, color: '#00e5ff' }}
                animate={{ scale: 1, color: '#fff' }}
              >
                {formatFileSize(spaceFreed).split(' ')[0]}
              </motion.span>
              <span className="text-[10px] text-slate-500 font-bold">{formatFileSize(spaceFreed).split(' ')[1]} Freed</span>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="gc-card p-8 max-w-sm w-full shadow-[0_0_40px_rgba(244,63,94,0.15)] overflow-hidden"
            >
              <div className="gc-brackets absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-rose-500/50 rounded-tl-[11px]" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-rose-500/50 rounded-tr-[11px]" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-rose-500/50 rounded-bl-[11px]" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-rose-500/50 rounded-br-[11px]" />
              </div>
              <div className="flex items-center gap-4 mb-6 relative z-30">
                <div className="w-14 h-14 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
                  <X className="w-7 h-7 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-bold text-white tracking-widest uppercase mb-1">Warning</h3>
                  <p className="text-rose-400/80 text-[10px] uppercase font-bold tracking-wider">
                    Delete Target?
                  </p>
                </div>
              </div>
              <p className="text-slate-300 font-mono text-xs bg-black/30 p-4 rounded-xl mb-8 break-all border border-rose-500/10 leading-relaxed max-h-24 overflow-y-auto relative z-30">
                {pendingDelete?.name}
              </p>
              <div className="flex gap-4 relative z-30">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-5 py-3.5 bg-[#0a1120] hover:bg-[#111827] text-slate-400 font-bold uppercase text-[11px] tracking-widest rounded-xl transition-all duration-200 border border-white/5 focus:outline-none hover:border-slate-500/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-5 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-400 font-black uppercase text-[11px] tracking-widest rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(244,63,94,0.2)] focus:outline-none focus:bg-rose-500 focus:text-white"
                >
                  <span className="flex items-center justify-center gap-2">
                    <X className="w-4 h-4" strokeWidth={3} />
                    Confirm
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Exit Dialog ── */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="gc-card p-8 max-w-sm w-full shadow-[0_0_40px_rgba(249,115,22,0.15)] relative overflow-hidden"
            >
              <div className="gc-brackets absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-orange-500/50 rounded-tl-[11px]" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-orange-500/50 rounded-tr-[11px]" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-orange-500/50 rounded-bl-[11px]" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-orange-500/50 rounded-br-[11px]" />
              </div>
              <div className="flex items-center gap-4 mb-6 relative z-30">
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
                  <LogOut className="w-7 h-7 text-orange-500 ml-1" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-bold text-white tracking-widest uppercase mb-1">Abort Mission?</h3>
                  <p className="text-orange-400/80 text-[10px] uppercase font-bold tracking-wider">
                    Return to Menu
                  </p>
                </div>
              </div>
              <p className="text-slate-300 bg-black/30 p-4 rounded-xl mb-8 text-xs font-mono border border-orange-500/10 leading-relaxed relative z-30">
                Are you sure you want to end the current session? You will lose your current spot, but completely deleted targets will remain destroyed.
              </p>
              <div className="flex gap-4 relative z-30">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-5 py-3.5 bg-[#0a1120] hover:bg-[#111827] text-slate-400 font-bold uppercase text-[11px] tracking-widest rounded-xl transition-all duration-200 border border-white/5 hover:border-slate-500/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAbandonSession}
                  disabled={isProcessing}
                  className="flex-1 px-5 py-3.5 bg-orange-500/20 border border-orange-500/50 text-orange-400 font-black uppercase text-[11px] tracking-widest rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:bg-orange-500 hover:text-white"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isProcessing ? 'Saving...' : 'Abandon'}
                  </span>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="gc-card p-6 max-w-md w-full shadow-[0_0_40px_rgba(0,229,255,0.1)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="gc-brackets absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-[#00e5ff]/30 rounded-tl-[11px]" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-[#00e5ff]/30 rounded-tr-[11px]" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-[#00e5ff]/30 rounded-bl-[11px]" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-[#00e5ff]/30 rounded-br-[11px]" />
              </div>
              
              <div className="flex items-center justify-between mb-6 border-b border-[#00e5ff]/10 pb-4 relative z-30">
                <h3 className="text-lg font-mono font-bold text-white tracking-widest uppercase flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-[#00e5ff]" />
                  Controls
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 bg-[#0a1120] hover:bg-white/5 rounded-lg transition-all duration-200 border border-white/5 hover:border-[#00e5ff]/20 text-[#00e5ff]/50 hover:text-[#00e5ff]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File Actions */}
              <div className="mb-6 relative z-30">
                <p className="text-[10px] font-black text-[#00e5ff]/60 uppercase tracking-[0.2em] mb-4">Core Actions</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1120]/80 border border-white/5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-black text-emerald-400 text-xs">D</div>
                      <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider">Keep Target</span>
                    </div>
                    <div className="flex gap-2">
                       <kbd className="kbd border-emerald-500/30 text-emerald-400 bg-emerald-500/5">→</kbd>
                       <kbd className="kbd border-emerald-500/30 text-emerald-400 bg-emerald-500/5">D</kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1120]/80 border border-white/5 hover:border-rose-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-rose-500/30 bg-rose-500/10 flex items-center justify-center font-black text-rose-400 text-xs">A</div>
                      <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider">Delete Target</span>
                    </div>
                    <div className="flex gap-2">
                       <kbd className="kbd border-rose-500/30 text-rose-400 bg-rose-500/5">←</kbd>
                       <kbd className="kbd border-rose-500/30 text-rose-400 bg-rose-500/5">A</kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1120]/80 border border-white/5 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center font-black text-blue-400 text-xs">W</div>
                      <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider">Skip Target</span>
                    </div>
                    <div className="flex gap-2">
                       <kbd className="kbd border-blue-500/30 text-blue-400 bg-blue-500/5">↑</kbd>
                       <kbd className="kbd border-blue-500/30 text-blue-400 bg-blue-500/5">W</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other */}
              <div className="relative z-30">
                <p className="text-[10px] font-black text-[#00e5ff]/60 uppercase tracking-[0.2em] mb-4">Tactics</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1120]/80 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 rounded border border-[#00e5ff]/30 bg-[#00e5ff]/10 flex items-center justify-center font-black text-[#00e5ff] text-[10px]">CTRL+Z</div>
                      <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider">Undo Move</span>
                    </div>
                    <kbd className="kbd border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/5">Ctrl+Z</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1120]/80 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 rounded border border-[#00e5ff]/30 bg-[#00e5ff]/10 flex items-center justify-center font-black text-[#00e5ff] text-[10px]">E</div>
                      <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider">Toggle Stack HUD</span>
                    </div>
                    <kbd className="kbd border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/5">E</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1120]/80 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 rounded border border-[#00e5ff]/30 bg-[#00e5ff]/10 flex items-center justify-center font-black text-[#00e5ff] text-[10px]">SPACE</div>
                      <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider">Open File</span>
                    </div>
                    <kbd className="kbd border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/5">Space</kbd>
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
