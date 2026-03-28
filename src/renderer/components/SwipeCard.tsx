import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
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
  HardDrive
} from 'lucide-react';
import type { FileItem, SwipeDirection } from '@shared/types';

interface SwipeCardProps {
  file: FileItem;
  onSwipe: (direction: SwipeDirection) => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenFile: () => void;
}

const getFileIcon = (category: string) => {
  const iconProps = { className: 'w-16 h-16' };
  switch (category) {
    case 'image': return <Image {...iconProps} className="w-16 h-16 text-purple-400" />;
    case 'video': return <Video {...iconProps} className="w-16 h-16 text-red-400" />;
    case 'pdf': return <FileText {...iconProps} className="w-16 h-16 text-red-400" />;
    case 'document': return <FileText {...iconProps} className="w-16 h-16 text-blue-400" />;
    case 'spreadsheet': return <Table {...iconProps} className="w-16 h-16 text-green-400" />;
    case 'code': return <Code {...iconProps} className="w-16 h-16 text-cyan-400" />;
    case 'archive': return <Package {...iconProps} className="w-16 h-16 text-orange-400" />;
    case 'audio': return <Music {...iconProps} className="w-16 h-16 text-pink-400" />;
    default: return <File {...iconProps} className="w-16 h-16 text-slate-400" />;
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

  // Background color transforms
  const backgroundColor = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [
      'rgba(239, 68, 68, 0.3)',
      'rgba(239, 68, 68, 0.1)',
      'rgba(255, 255, 255, 1)',
      'rgba(34, 197, 94, 0.1)',
      'rgba(34, 197, 94, 0.3)'
    ]
  );

  useEffect(() => {
    loadPreview();
  }, [file]);

  const loadPreview = async () => {
    console.log('[Preview] loadPreview called for:', file.name, file.category);
    if (file.category === 'image' || file.category === 'pdf') {
      setIsLoadingPreview(true);
      try {
        const preview = await window.electronAPI.generatePreview(file.path, file.category);
        console.log('[Preview] IPC returned:', preview);
        if (preview) {
          console.log('[Preview] Setting previewUrl to:', preview);
          setPreviewUrl(preview);
        } else {
          console.log('[Preview] No previewreturned (null/undefined)');
        }
      } catch (error) {
        console.error('[Preview] Error loading preview:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    } else {
      console.log('[Preview] Skipping preview for category:', file.category);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const verticalThreshold = 80;

    if (info.offset.x > threshold) {
      // Swiped right - Keep
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      // Swiped left - Delete
      onSwipe('left');
    } else if (info.offset.y < -verticalThreshold) {
      // Swiped up - Skip
      onSwipe('up');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Stack Effect - Next Card */}
      <div className="absolute inset-0 bg-slate-700 rounded-3xl transform scale-95 translate-y-4 opacity-50" />
      
      {/* Main Card */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, backgroundColor }}
        whileDrag={{ cursor: 'grabbing' }}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab select-none"
      >
        {/* Keep Indicator */}
        <motion.div
          style={{ opacity: keepOpacity }}
          className="absolute top-8 right-8 z-20 px-4 py-2 bg-green-500 rounded-lg border-4 border-green-400 transform rotate-12"
        >
          <span className="text-white font-bold text-xl uppercase tracking-wider flex items-center gap-2">
            <Check className="w-6 h-6" />
            KEEP
          </span>
        </motion.div>

        {/* Delete Indicator */}
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="absolute top-8 left-8 z-20 px-4 py-2 bg-red-500 rounded-lg border-4 border-red-400 transform -rotate-12"
        >
          <span className="text-white font-bold text-xl uppercase tracking-wider flex items-center gap-2">
            <X className="w-6 h-6" />
            DELETE
          </span>
        </motion.div>

        {/* Skip Indicator */}
        <motion.div
          style={{ opacity: skipOpacity }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-blue-500 rounded-lg border-4 border-blue-400"
        >
          <span className="text-white font-bold text-xl uppercase tracking-wider">
            SKIP
          </span>
        </motion.div>

        {/* Preview Area */}
        <div className="h-80 bg-slate-100 flex items-center justify-center relative overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : isLoadingPreview ? (
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
              </motion.div>
              <span className="text-slate-400 text-sm">Loading preview...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {getFileIcon(file.category)}
              <span className="text-slate-400 text-sm uppercase tracking-wider">
                {file.category}
              </span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full border ${getCategoryColor(file.category)}`}>
              {file.category}
            </span>
            <span className="text-slate-400 text-xs uppercase">
              {file.extension || 'no extension'}
            </span>
          </div>

          {/* Filename */}
          <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={file.name}>
            {file.name}
          </h3>

          {/* File Details */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <HardDrive className="w-4 h-4" />
              {formatFileSize(file.size)}
            </span>
            <span>•</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Undo Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            canUndo 
              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-6 h-6" />
        </motion.button>

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
        >
          <X className="w-8 h-8" />
        </motion.button>

        {/* Skip Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSwipe('up')}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <span className="text-lg font-bold">↷</span>
        </motion.button>

        {/* Keep Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/30"
        >
          <Check className="w-8 h-8" />
        </motion.button>

        {/* Open File Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenFile}
          className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
        >
          <ExternalLink className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default SwipeCard;
