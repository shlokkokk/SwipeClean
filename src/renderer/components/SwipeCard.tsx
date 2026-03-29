import React, { useState, useEffect } from 'react';
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
  SkipForward
} from 'lucide-react';
import Tooltip from './Tooltip';
import type { FileItem, SwipeDirection } from '@shared/types';

interface SwipeCardProps {
  file: FileItem;
  onSwipe: (direction: SwipeDirection) => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenFile: () => void;
}

const getFileIcon = (category: string) => {
  const cls = 'w-16 h-16';
  switch (category) {
    case 'image': return <Image className={`${cls} text-purple-400`} />;
    case 'video': return <Video className={`${cls} text-red-400`} />;
    case 'pdf': return <FileText className={`${cls} text-red-400`} />;
    case 'document': return <FileText className={`${cls} text-blue-400`} />;
    case 'spreadsheet': return <Table className={`${cls} text-green-400`} />;
    case 'code': return <Code className={`${cls} text-cyan-400`} />;
    case 'archive': return <Package className={`${cls} text-orange-400`} />;
    case 'audio': return <Music className={`${cls} text-pink-400`} />;
    default: return <File className={`${cls} text-slate-400`} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'image': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'video': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'pdf': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'document': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'spreadsheet': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'code': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'archive': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'audio': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
  onOpenFile 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Transform for opacity of indicators
  const keepOpacity = useTransform(x, [0, 100], [0, 1]);
  const deleteOpacity = useTransform(x, [0, -100], [0, 1]);
  const skipOpacity = useTransform(y, [0, -100], [0, 1]);

  // Keep directional feedback but avoid over-aggressive glow jumps.
  const glowShadow = useTransform(
    x,
    [-200, -80, 0, 80, 200],
    [
      '0 20px 48px -14px rgba(239, 68, 68, 0.35), 0 0 24px rgba(239, 68, 68, 0.12)',
      '0 16px 32px -12px rgba(239, 68, 68, 0.18)',
      '0 20px 40px -16px rgba(0, 0, 0, 0.45)',
      '0 16px 32px -12px rgba(34, 197, 94, 0.18)',
      '0 20px 48px -14px rgba(34, 197, 94, 0.35), 0 0 24px rgba(34, 197, 94, 0.12)'
    ]
  );

  // Background color transforms - V2 dark glass
  const backgroundColor = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [
      'rgba(239, 68, 68, 0.15)',
      'rgba(239, 68, 68, 0.05)',
      'rgba(15, 23, 42, 0.45)',
      'rgba(34, 197, 94, 0.05)',
      'rgba(34, 197, 94, 0.15)'
    ]
  );

  useEffect(() => {
    loadPreview();
  }, [file]);

  const loadPreview = async () => {
    setPreviewUrl(null);
    if (file.category === 'image' || file.category === 'pdf') {
      setIsLoadingPreview(true);
      try {
        const preview = await window.electronAPI.generatePreview(file.path, file.category);
        if (preview) {
          setPreviewUrl(preview);
        }
      } catch (error) {
        console.error('[Preview] Error loading preview:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    }
  };

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
    <div className="relative w-full max-w-xl mx-auto">
      {/* Main Card */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.25}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, backgroundColor, boxShadow: glowShadow }}
        whileDrag={{ cursor: 'grabbing', scale: 1.01 }}
        className="relative rounded-3xl overflow-hidden cursor-grab select-none border border-white/10 backdrop-blur-2xl z-10"
      >
        {/* Keep Indicator */}
        <motion.div
          style={{ opacity: keepOpacity }}
          className="absolute top-8 right-8 z-20 px-4 py-2 bg-green-500 rounded-xl border-4 border-green-400 transform rotate-12 shadow-lg shadow-green-500/30"
        >
          <span className="text-white font-bold text-xl uppercase tracking-wider flex items-center gap-2">
            <Check className="w-6 h-6" />
            KEEP
          </span>
        </motion.div>

        {/* Delete Indicator */}
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="absolute top-8 left-8 z-20 px-4 py-2 bg-red-500 rounded-xl border-4 border-red-400 transform -rotate-12 shadow-lg shadow-red-500/30"
        >
          <span className="text-white font-bold text-xl uppercase tracking-wider flex items-center gap-2">
            <X className="w-6 h-6" />
            DELETE
          </span>
        </motion.div>

        {/* Skip Indicator */}
        <motion.div
          style={{ opacity: skipOpacity }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-blue-500 rounded-xl border-4 border-blue-400 shadow-lg shadow-blue-500/30"
        >
          <span className="text-white font-bold text-xl uppercase tracking-wider flex items-center gap-2">
            <SkipForward className="w-6 h-6" />
            SKIP
          </span>
        </motion.div>

        {/* Preview Area */}
        <div className="h-112 w-full bg-slate-950/40 border-b border-white/5 flex items-center justify-center relative overflow-hidden group">
          {/* Subtle grid pattern inside preview */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] mask-[linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : isLoadingPreview ? (
            <div className="w-full h-full animate-shimmer bg-slate-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
                </motion.div>
                <span className="text-slate-400 text-xs font-medium">Loading preview...</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="p-5 rounded-3xl bg-slate-800/50 border border-white/5 shadow-inner">
                {getFileIcon(file.category)}
              </div>
              <span className="text-slate-400 text-[13px] font-bold uppercase tracking-[0.2em]">
                {file.category}
              </span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="p-6">
          {/* Category Badge + Extension */}
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-xl border ${getCategoryColor(file.category)}`}>
              {file.category}
            </span>
            <span className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              {file.extension || 'no ext'}
            </span>
          </div>

          {/* Filename */}
          <h3 className="text-xl font-bold text-white mb-1.5 truncate tracking-tight" title={file.name}>
            {file.name}
          </h3>

          {/* Full file path */}
          <p className="text-xs text-slate-400 mb-2 break-all leading-relaxed" title={file.path}>
            {file.path}
          </p>

          {/* File Details */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              {formatFileSize(file.size)}
            </span>
            <span className="text-slate-300">•</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Action Buttons with Labels ── */}
      <div className="flex items-end justify-center gap-7 mt-10">
        {/* Undo */}
        <Tooltip text="Undo last action" shortcut="Ctrl+Z" position="bottom">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex flex-col items-center gap-1.5 ${
              canUndo 
                ? 'text-indigo-400' 
                : 'text-indigo-300/80 cursor-not-allowed'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              canUndo 
                ? 'bg-slate-800 hover:bg-slate-700 border border-white/10 shadow-md shadow-black/20' 
                : 'bg-slate-900/80 border border-indigo-500/25 shadow-md shadow-indigo-500/10'
            }`}>
              <RotateCcw className={`w-5 h-5 ${canUndo ? 'text-indigo-400' : 'text-indigo-300/80'}`} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Undo</span>
          </motion.button>
        </Tooltip>

        {/* Delete */}
        <Tooltip text="Move to trash" shortcut="← / A" position="bottom">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipe('left')}
            className="flex flex-col items-center gap-2 text-red-400"
          >
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-red-500/20 hover:bg-slate-800 text-red-500 flex items-center justify-center shadow-xl shadow-red-500/10 hover:shadow-red-500/30 hover:border-red-500/50 transition-all duration-300">
              <X className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Delete</span>
          </motion.button>
        </Tooltip>

        {/* Skip */}
        <Tooltip text="Skip for later" shortcut="↑ / W" position="bottom">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipe('up')}
            className="flex flex-col items-center gap-2 text-blue-400"
          >
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-blue-500/20 hover:bg-slate-800 text-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
              <SkipForward className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Skip</span>
          </motion.button>
        </Tooltip>

        {/* Keep */}
        <Tooltip text="Keep this file" shortcut="→ / D" position="bottom">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipe('right')}
            className="flex flex-col items-center gap-2 text-emerald-400"
          >
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-emerald-500/20 hover:bg-slate-800 text-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
              <Check className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Keep</span>
          </motion.button>
        </Tooltip>

        {/* Open File */}
        <Tooltip text="Open in default app" shortcut="Space" position="bottom">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenFile}
            className="flex flex-col items-center gap-2 text-slate-300"
          >
            <div className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-white flex items-center justify-center shadow-lg hover:shadow-white/5 transition-all duration-300">
              <ExternalLink className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Open</span>
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
};

export default SwipeCard;
