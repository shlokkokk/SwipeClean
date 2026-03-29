import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Trash2, 
  SkipForward, 
  HardDrive, 
  FileText,
  Sparkles,
  RotateCcw,
  Home,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import Tooltip from '../components/Tooltip';

interface SummaryProps {
  stats: {
    totalFiles: number;
    keptCount: number;
    deletedCount: number;
    skippedCount: number;
    spaceFreed: number;
  };
  onCleanAnother: () => void;
  onBackToHome: () => void;
}

// Animated counter hook
const useCountUp = (end: number, duration: number = 1200, delay: number = 0) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * end));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, delay]);

  return count;
};

// Mini Donut Chart Component
const DonutChart: React.FC<{
  kept: number;
  deleted: number;
  skipped: number;
}> = ({ kept, deleted, skipped }) => {
  const total = kept + deleted + skipped;
  if (total === 0) return null;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  
  const keptLen = (kept / total) * circumference;
  const deletedLen = (deleted / total) * circumference;
  const skippedLen = (skipped / total) * circumference;
  
  const keptOffset = 0;
  const deletedOffset = keptLen;
  const skippedOffset = keptLen + deletedLen;

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        {/* Keep segment */}
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="12"
          strokeDasharray={`${keptLen} ${circumference - keptLen}`}
          strokeDashoffset={-keptOffset}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
          opacity={0.9}
        />
        {/* Delete segment */}
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth="12"
          strokeDasharray={`${deletedLen} ${circumference - deletedLen}`}
          strokeDashoffset={-deletedOffset}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          opacity={0.9}
        />
        {/* Skip segment */}
        {skipped > 0 && (
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            strokeDasharray={`${skippedLen} ${circumference - skippedLen}`}
            strokeDashoffset={-skippedOffset}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
            opacity={0.9}
          />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{total}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Files</span>
      </div>
    </div>
  );
};

const Summary: React.FC<SummaryProps> = ({ stats, onCleanAnother, onBackToHome }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; color: string; left: number; delay: number; size: number; shape: 'circle' | 'square' | 'triangle' }>>([]);

  const animatedReviewed = useCountUp(stats.keptCount + stats.deletedCount + stats.skippedCount, 1000, 600);
  const animatedKept = useCountUp(stats.keptCount, 1000, 700);
  const animatedDeleted = useCountUp(stats.deletedCount, 1000, 800);
  const animatedSkipped = useCountUp(stats.skippedCount, 1000, 900);

  useEffect(() => {
    // Generate varied confetti
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#3b82f6', '#f59e0b', '#06b6d4'];
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    const newConfetti = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      size: Math.random() * 8 + 4,
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    }));
    setConfetti(newConfetti);

    const timer = setTimeout(() => setConfetti([]), 5000);
    return () => clearTimeout(timer);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const reviewedCount = stats.keptCount + stats.deletedCount + stats.skippedCount;
  const deletePercentage = reviewedCount > 0 ? Math.round((stats.deletedCount / reviewedCount) * 100) : 0;
  const keepPercentage = reviewedCount > 0 ? Math.round((stats.keptCount / reviewedCount) * 100) : 0;

  // Achievement messages
  const getAchievement = () => {
    if (stats.deletedCount >= 50) return { icon: Trophy, title: 'Cleanup Master!', message: 'You deleted 50+ files! Your disk is breathing easier.' };
    if (stats.spaceFreed >= 1024 * 1024 * 1024) return { icon: HardDrive, title: 'Space Saver!', message: 'Over 1GB freed! That\'s legendary.' };
    if (stats.deletedCount >= 20) return { icon: Target, title: 'Great Job!', message: 'You deleted 20+ files! Solid cleanup session.' };
    if (stats.deletedCount > 0) return { icon: Zap, title: 'Good Start!', message: 'You cleaned up some files. Keep going!' };
    return { icon: Sparkles, title: 'All Done!', message: 'Session completed! Your files are organized.' };
  };

  const achievement = getAchievement();
  const AchievementIcon = achievement.icon;

  const getConfettiStyle = (shape: string, size: number) => {
    if (shape === 'circle') return { borderRadius: '50%', width: size, height: size };
    if (shape === 'triangle') return { 
      width: 0, height: 0,
      borderLeft: `${size/2}px solid transparent`,
      borderRight: `${size/2}px solid transparent`,
      borderBottom: `${size}px solid`,
      backgroundColor: 'transparent'
    };
    return { width: size, height: size, borderRadius: '2px' };
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto z-10 flex items-center justify-center h-full">
      {/* Confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: 0, 
            rotate: 720 + Math.random() * 360,
            x: (Math.random() - 0.5) * 300
          }}
          transition={{ 
            duration: 3 + Math.random(), 
            delay: c.delay,
            ease: 'easeOut'
          }}
          className="fixed pointer-events-none"
          style={{ 
            ...getConfettiStyle(c.shape, c.size),
            backgroundColor: c.shape !== 'triangle' ? c.color : 'transparent',
            borderBottomColor: c.shape === 'triangle' ? c.color : undefined,
            left: `${c.left}%`,
            top: 0,
            zIndex: 60
          }}
        />
      ))}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="glass rounded-4xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl w-full"
      >
        <div className="flex flex-col md:flex-row">
          
          {/* ── Left Column: Achievement & Stats ── */}
          <div className="flex-1 p-10 md:p-16 border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
            {/* Soft background glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

            {/* Achievement Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative z-10 flex items-center gap-6 mb-10"
            >
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse-soft" />
                <div className="relative w-20 h-20 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl border border-white/20">
                  <AchievementIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-white mb-2 tracking-tight"
                >
                  {achievement.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400 text-[15px] leading-relaxed max-w-sm"
                >
                  {achievement.message}
                </motion.p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8 relative z-10">
              {/* Reviewed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 shadow-inner"
              >
                <div className="w-10 h-10 mb-4 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/20">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{animatedReviewed}</p>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Reviewed</p>
              </motion.div>

              {/* Kept */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 shadow-inner"
              >
                <div className="w-10 h-10 mb-4 rounded-xl bg-green-500/15 flex items-center justify-center border border-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{animatedKept}</p>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Kept ({keepPercentage}%)</p>
              </motion.div>

              {/* Deleted */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 shadow-inner"
              >
                <div className="w-10 h-10 mb-4 rounded-xl bg-red-500/15 flex items-center justify-center border border-red-500/20">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{animatedDeleted}</p>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Deleted ({deletePercentage}%)</p>
              </motion.div>

              {/* Skipped */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 shadow-inner"
              >
                <div className="w-10 h-10 mb-4 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                  <SkipForward className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{animatedSkipped}</p>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Skipped</p>
              </motion.div>
            </div>
          </div>

          {/* ── Right Column: Space Freed & Actions ── */}
          <div className="md:w-96 p-10 md:p-16 flex flex-col items-center justify-between bg-black/10">
            
            <div className="w-full">
              {/* Space Freed Highlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="w-full text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-300 font-bold text-[11px] uppercase tracking-widest">Space Freed</span>
                </div>
                <h3 className="text-5xl font-black bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  {formatFileSize(stats.spaceFreed)}
                </h3>
              </motion.div>

              {/* Donut Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="mb-12"
              >
                <DonutChart 
                  kept={stats.keptCount} 
                  deleted={stats.deletedCount} 
                  skipped={stats.skippedCount} 
                />
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kept</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Deleted</span>
                  </div>
                  {stats.skippedCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Skipped</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-6">
              <Tooltip text="Start a new cleanup session" position="top" fullWidth>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCleanAnother}
                  className="w-full relative group"
                >
                  <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-300" />
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl font-bold text-[15px] text-white shadow-xl ring-1 ring-white/20">
                    <RotateCcw className="w-5 h-5" />
                    Clean Next Folder
                  </div>
                </motion.button>
              </Tooltip>

              <Tooltip text="Return to the home screen" position="bottom" fullWidth>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBackToHome}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl font-bold text-[15px] text-white transition-all duration-300 border border-white/5 shadow-inner"
                >
                  <Home className="w-5 h-5 opacity-70" />
                  Return Home
                </motion.button>
              </Tooltip>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Summary;
