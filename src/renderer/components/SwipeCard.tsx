import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
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
  X,
  RotateCcw,
  ExternalLink,
  HardDrive,
  SkipForward,
  Gamepad2
} from 'lucide-react';
import Tooltip from './Tooltip';
import type { FileItem, SwipeDirection, TextPreview } from '@shared/types';

interface SwipeCardProps {
  file: FileItem;
  onSwipe: (direction: SwipeDirection) => void;
  onUndo: () => void;
  canUndo: boolean;
  undoTooltipText?: string;
  onOpenFile: () => void;
}

const getFileIcon = (category: string) => {
  const cls = 'w-14 h-14';
  switch (category) {
    case 'image': return <Image className={`${cls} text-purple-400`} />;
    case 'video': return <Video className={`${cls} text-red-400`} />;
    case 'pdf': return <FileText className={`${cls} text-red-400`} />;
    case 'document': return <FileText className={`${cls} text-blue-400`} />;
    case 'spreadsheet': return <Table className={`${cls} text-emerald-400`} />;
    case 'code': return <Code className={`${cls} text-cyan-400`} />;
    case 'archive': return <Package className={`${cls} text-orange-400`} />;
    case 'audio': return <Music className={`${cls} text-pink-400`} />;
    default: return <File className={`${cls} text-slate-400`} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'image': return 'gc-badge-purple';
    case 'video': return 'gc-badge-red';
    case 'pdf': return 'gc-badge-red';
    case 'document': return 'gc-badge-blue';
    case 'spreadsheet': return 'gc-badge-green';
    case 'code': return 'gc-badge-cyan';
    case 'archive': return 'gc-badge-orange';
    case 'audio': return 'gc-badge-pink';
    default: return 'gc-badge-slate';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  file, 
  onSwipe, 
  onUndo, 
  canUndo, 
  undoTooltipText,
  onOpenFile 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<TextPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [maxVisibleLines, setMaxVisibleLines] = useState(10);
  const textBodyRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  
  // Transform for opacity of indicators
  const keepOpacity = useTransform(x, [0, 80], [0, 1]);
  const deleteOpacity = useTransform(x, [0, -80], [0, 1]);
  const skipOpacity = useTransform(y, [0, -80], [0, 1]);

  useEffect(() => {
    let isCancelled = false;

    const loadPreview = async () => {
      setPreviewUrl(null);
      setTextPreview(null);

      const needsImagePreview = file.category === 'image' || file.category === 'pdf';
      const needsTextPreview = file.category === 'code' || file.category === 'document' || file.category === 'spreadsheet';

      if (!needsImagePreview && !needsTextPreview) {
        setIsLoadingPreview(false);
        return;
      }

      setIsLoadingPreview(true);

      try {
        const [imagePreview, extractedTextPreview] = await Promise.all([
          needsImagePreview
            ? window.electronAPI.generatePreview(file.path, file.category)
            : Promise.resolve(null),
          needsTextPreview
            ? window.electronAPI.getTextPreview(file.path, file.category)
            : Promise.resolve(null)
        ]);

        if (isCancelled) return;
        setPreviewUrl(imagePreview);
        setTextPreview(extractedTextPreview);
      } catch (error) {
        if (!isCancelled) {
          console.error('[Preview] Error loading preview:', error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPreview(false);
        }
      }
    };

    void loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [file.path, file.category]);

  useEffect(() => {
    if (!textBodyRef.current) return;

    const lineHeightPx = 18;

    const recompute = () => {
      if (!textBodyRef.current) return;
      const availableHeight = textBodyRef.current.clientHeight;
      const reserveForTruncationNote = textPreview?.truncated ? 24 : 0;
      const fitCount = Math.max(4, Math.floor((availableHeight - reserveForTruncationNote) / lineHeightPx));
      setMaxVisibleLines(fitCount);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(textBodyRef.current);

    return () => observer.disconnect();
  }, [textPreview?.truncated, file.id]);

  const visibleTextLines = useMemo(() => {
    if (!textPreview) return [];
    return textPreview.lines.slice(0, maxVisibleLines);
  }, [textPreview, maxVisibleLines]);

  const shouldShowMoreLines = !!textPreview && (textPreview.truncated || textPreview.lines.length > visibleTextLines.length);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 100;
    const verticalThreshold = 80;

    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    } else if (info.offset.y < -verticalThreshold) {
      onSwipe('up');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Main Card */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.25}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate }}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        className="gc-card w-full cursor-grab select-none z-10"
      >
        {/* Sci-Fi Corner Brackets */}
        <div className="gc-brackets absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-[#00e5ff] rounded-tl-[11px] opacity-70" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-[#00e5ff] rounded-tr-[11px] opacity-70" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-[#00e5ff] rounded-bl-[11px] opacity-70" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-[#00e5ff] rounded-br-[11px] opacity-70" />
        </div>

        {/* Keep Indicator */}
        <motion.div
          style={{ opacity: keepOpacity }}
          className="absolute top-8 right-8 z-30 px-5 py-2.5 bg-emerald-500/90 rounded border border-emerald-400 transform rotate-12 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <span className="text-white font-black text-2xl uppercase tracking-widest flex items-center gap-2">
            <Check className="w-8 h-8" strokeWidth={3} />
            KEEP
          </span>
        </motion.div>

        {/* Delete Indicator */}
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="absolute top-8 left-8 z-30 px-5 py-2.5 bg-rose-500/90 rounded border border-rose-400 transform -rotate-12 shadow-[0_0_30px_rgba(244,63,94,0.5)]"
        >
          <span className="text-white font-black text-2xl uppercase tracking-widest flex items-center gap-2">
            <X className="w-8 h-8" strokeWidth={3} />
            DELETE
          </span>
        </motion.div>

        {/* Skip Indicator */}
        <motion.div
          style={{ opacity: skipOpacity }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 bg-blue-500/90 rounded border border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        >
          <span className="text-white font-black text-2xl uppercase tracking-widest flex items-center gap-2">
            <SkipForward className="w-8 h-8" strokeWidth={3} />
            SKIP
          </span>
        </motion.div>

        {/* Preview Area */}
        <div className="gc-preview-area h-104 w-full flex items-center justify-center relative group p-1">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-contain relative z-10"
              draggable={false}
            />
          ) : textPreview ? (
            <div className="relative z-10 w-full h-full overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden px-5 py-4 font-mono text-[11px] sm:text-[12px] leading-[18px] text-slate-300 flex flex-col relative" ref={textBodyRef}>
                {(file.extension === 'md' || file.extension === 'markdown') ? (
                  <div className="flex-1 overflow-hidden relative">
                    <div className="prose prose-sm prose-invert max-w-none pb-4 font-sans leading-normal pointer-events-none select-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {textPreview.lines.join('\n')}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-hidden">
                    {visibleTextLines.map((line, index) => (
                      <div key={`${index}-${line}`} className="flex items-start gap-4 min-h-[18px]">
                        <span className="text-[#00e5ff]/50 w-6 text-right shrink-0 select-none opacity-50 font-medium">{index + 1}</span>
                        <span className="truncate whitespace-pre relative z-10 text-slate-200">{line}</span>
                      </div>
                    ))}
                    </div>
                    {shouldShowMoreLines && (
                      <div className="pt-2 pb-1 text-[#00e5ff]/70 text-[10px] uppercase tracking-widest font-bold shrink-0 select-none">
                        ...more lines below
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : isLoadingPreview ? (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-[3px] border-[#00e5ff] border-t-transparent rounded-full"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 relative z-10 scale-110">
              <div className="gc-icon-container">
                {getFileIcon(file.category)}
              </div>
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.25em]">
                {file.category}
              </span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="gc-file-info px-6 py-5 flex items-center gap-6">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <span className={`gc-badge ${getCategoryColor(file.category)}`}>
                {file.category}
              </span>
              <span className="text-slate-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                {file.extension || 'none'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white truncate tracking-wide" title={file.name}>
              {file.name}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={file.path}>
              {file.path}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-slate-400 border-l border-white/5 pl-6">
             <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00e5ff]/80">
               <HardDrive className="w-3.5 h-3.5" />
               <span className="tracking-wider">{formatFileSize(file.size)}</span>
             </div>
             <span className="text-[10px] font-mono tracking-wider">{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Game Controller Action Buttons (T-Shape Layout) ── */}
      <div className="relative flex justify-center items-end w-full mt-8 h-36">
        {/* L1 — Undo */}
        <div className="absolute left-6 bottom-2">
          <Tooltip text={undoTooltipText || "Undo last action"} shortcut="Ctrl+Z" position="bottom">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              disabled={!canUndo}
              className={`gc-bumper-btn flex flex-col items-center gap-2 ${
                canUndo ? '' : 'gc-bumper-disabled opacity-30 select-none'
              }`}
            >
              <div className={`gc-bumper ${canUndo ? 'hover:bg-[#1f2937] hover:border-white/10 hover:text-white' : ''} shadow-[inset_0_2px_5px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.3)]`}>
                <RotateCcw className="w-5 h-5 shrink-0" />
              </div>
              <span className="gc-btn-label">CTRL+Z</span>
            </motion.button>
          </Tooltip>
        </div>

        {/* Action Cluster */}
        <div className="flex flex-col items-center gap-3">
          {/* Y - Skip (Top) */}
          <Tooltip text="Skip for later" shortcut="↑ / W" position="top">
            <button
              onClick={() => onSwipe('up')}
              className="gc-circle-btn gc-circle-skip outline-none focus:outline-none"
            >
              <SkipForward className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-black tracking-wider text-blue-500 mt-1 uppercase">W</span>
            </button>
          </Tooltip>

          {/* Bottom Row: X, Gamepad, B */}
          <div className="flex items-center gap-4">
            {/* X - Delete (Left) */}
            <Tooltip text="Move to trash" shortcut="← / A" position="bottom">
              <button
                onClick={() => onSwipe('left')}
                className="gc-circle-btn gc-circle-delete outline-none focus:outline-none"
              >
                <X className="w-6 h-6 mb-0.5" strokeWidth={2.5} />
                <span className="text-[10px] font-black tracking-wider text-rose-500 mt-1 uppercase">A</span>
              </button>
            </Tooltip>

            {/* Center (Gamepad icon/menu) */}
            <div className="w-11 h-11 rounded-full border border-[#00e5ff]/20 bg-[#111827] flex items-center justify-center opacity-80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.02),0_0_15px_rgba(0,229,255,0.15)] cursor-default">
              <Gamepad2 className="w-4 h-4 text-[#00e5ff]/60" />
            </div>

            {/* B - Keep (Right) */}
            <Tooltip text="Keep this file" shortcut="→ / D" position="bottom">
              <button
                onClick={() => onSwipe('right')}
                className="gc-circle-btn gc-circle-keep outline-none focus:outline-none"
              >
                <Check className="w-6 h-6 mb-0.5" strokeWidth={3} />
                <span className="text-[10px] font-black tracking-wider text-emerald-500 mt-1 uppercase">D</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* R1 — Open */}
        <div className="absolute right-6 bottom-2">
          <Tooltip text="Open in default app" shortcut="Space" position="bottom">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenFile}
              className="gc-bumper-btn flex flex-col items-center gap-2"
            >
              <div className="gc-bumper hover:bg-[#1f2937] hover:border-white/10 hover:text-white shadow-[inset_0_2px_5px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.3)]">
                <ExternalLink className="w-5 h-5 shrink-0 ml-0.5" />
              </div>
              <span className="gc-btn-label tracking-widest">SPACE</span>
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
