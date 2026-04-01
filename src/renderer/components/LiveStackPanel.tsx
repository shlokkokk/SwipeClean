import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  Image,
  Video,
  FileText,
  Table,
  Code,
  Package,
  Music,
  File,
  Check,
  Trash2,
  SkipForward,
  ArrowDown
} from 'lucide-react';
import type { Action, FileItem, FileStatus } from '@shared/types';

type CommittedInfo = {
  action: Action;
  file: FileItem | null;
};

interface LiveStackPanelProps {
  fileList: FileItem[];
  currentIndex: number;
  undoStack: Action[];
  maxUndoActions: number;
  committed?: CommittedInfo | null;
}

const getSmallCategoryIcon = (category: string) => {
  const cls = 'w-4 h-4 shrink-0';
  switch (category) {
    case 'image':
      return <Image className={`${cls} text-purple-400`} />;
    case 'video':
      return <Video className={`${cls} text-red-400`} />;
    case 'pdf':
      return <FileText className={`${cls} text-red-400`} />;
    case 'document':
      return <FileText className={`${cls} text-blue-400`} />;
    case 'spreadsheet':
      return <Table className={`${cls} text-emerald-400`} />;
    case 'code':
      return <Code className={`${cls} text-cyan-400`} />;
    case 'archive':
      return <Package className={`${cls} text-orange-400`} />;
    case 'audio':
      return <Music className={`${cls} text-pink-400`} />;
    default:
      return <File className={`${cls} text-slate-400`} />;
  }
};

const statusLabel = (s: FileStatus) => {
  if (s === 'kept') return 'KEPT';
  if (s === 'deleted') return 'DELETED';
  if (s === 'skipped') return 'SKIPPED';
  return 'PENDING';
};

const statusPillClass = (s: FileStatus) => {
  switch (s) {
    case 'kept':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    case 'deleted':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
    case 'skipped':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    default:
      return 'border-slate-500/30 bg-slate-500/10 text-slate-300';
  }
};

const rowMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const crispLayoutTransition = {
  type: 'spring' as const,
  stiffness: 900,
  damping: 80,
  mass: 0.35
};

const LiveStackPanel: React.FC<LiveStackPanelProps> = ({
  fileList,
  currentIndex,
  undoStack,
  maxUndoActions,
  committed
}) => {
  const [flashCommitted, setFlashCommitted] = useState<CommittedInfo | null>(null);

  useEffect(() => {
    if (!committed) return;
    setFlashCommitted(committed);
    const t = window.setTimeout(() => setFlashCommitted(null), 1800);
    return () => window.clearTimeout(t);
  }, [committed?.action.id]);

  const incoming = useMemo(() => {
    return fileList.slice(currentIndex + 1, currentIndex + 6);
  }, [fileList, currentIndex]);

  const undoTop = useMemo(() => {
    return undoStack.slice(0, 5);
  }, [undoStack]);

  return (
    <LayoutGroup>
      <div className="w-[320px] shrink-0">
        <div className="gc-card overflow-hidden border border-white/5 bg-[#0a0e17]/60 max-h-[calc(100vh-260px)] overflow-y-auto">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00e5ff]/70">
              Incoming Deck
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              {Math.max(0, fileList.length - currentIndex)} in stack
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="text-[11px] font-black uppercase tracking-widest text-white/90 mb-3 flex items-center gap-2">
              <ArrowDown className="w-3.5 h-3.5 text-[#00e5ff]/70" />
              INCOMING DECK
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {incoming.length === 0 ? (
                  <motion.div
                    key="incoming-empty"
                    {...rowMotion}
                    className="px-4 py-3 text-[11px] font-mono text-slate-500"
                  >
                    No targets queued.
                  </motion.div>
                ) : (
                  incoming.map((f) => (
                    <motion.div
                      key={f.id}
                      layout="position"
                      layoutId={`incoming-${f.id}`}
                      {...rowMotion}
                      transition={crispLayoutTransition}
                      className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5 first:border-t-0"
                    >
                      {getSmallCategoryIcon(f.category)}
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono font-bold text-slate-200 truncate">
                          {f.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest truncate">
                          {f.extension || 'none'}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-white/5 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-black uppercase tracking-widest text-white/90">
                UNDO BUFFER
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Active: {undoStack.length} / {maxUndoActions} Slots
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {undoTop.length === 0 ? (
                  <motion.div
                    key="undo-empty"
                    {...rowMotion}
                    className="px-4 py-3 text-[11px] font-mono text-slate-500"
                  >
                    Buffer empty.
                  </motion.div>
                ) : (
                  undoTop.map((a) => {
                    const file = fileList.find((f) => f.id === a.fileId);
                    return (
                      <motion.div
                        key={a.id}
                        layout="position"
                        layoutId={`undo-${a.fileId}`}
                        {...rowMotion}
                        transition={crispLayoutTransition}
                        className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5 first:border-t-0"
                      >
                        {a.newStatus === 'kept' ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : a.newStatus === 'deleted' ? (
                          <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <SkipForward className="w-4 h-4 text-blue-400 shrink-0" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-mono font-bold text-slate-200 truncate">
                            {file?.name ?? 'Unknown file'}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest truncate">
                            {file?.extension || 'none'}
                          </div>
                        </div>

                        <div
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${statusPillClass(
                            a.newStatus
                          )}`}
                        >
                          {statusLabel(a.newStatus)}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {flashCommitted?.action && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400/90">
                        Committed to Trash
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-200 truncate mt-1">
                        {flashCommitted.file?.name ?? 'Unknown file'}
                      </div>
                    </div>
                    <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
};

export default LiveStackPanel;
