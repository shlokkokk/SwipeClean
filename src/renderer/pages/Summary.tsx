import React, { useEffect, useState } from 'react';
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

const Summary: React.FC<SummaryProps> = ({ stats, onCleanAnother, onBackToHome }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; color: string; left: number; delay: number }>>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#3b82f6', '#f59e0b'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setConfetti(newConfetti);

    // Cleanup confetti after animation
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 5000);

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
    if (stats.deletedCount >= 50) return { icon: Trophy, title: 'Cleanup Master!', message: 'You deleted 50+ files!' };
    if (stats.spaceFreed >= 1024 * 1024 * 1024) return { icon: HardDrive, title: 'Space Saver!', message: 'You freed over 1GB!' };
    if (stats.deletedCount >= 20) return { icon: Target, title: 'Great Job!', message: 'You deleted 20+ files!' };
    if (stats.deletedCount > 0) return { icon: Zap, title: 'Good Start!', message: 'You cleaned up some files!' };
    return { icon: Sparkles, title: 'All Done!', message: 'Session completed!' };
  };

  const achievement = getAchievement();
  const AchievementIcon = achievement.icon;

  return (
    <div className="relative w-full max-w-lg">
      {/* Confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: 0, 
            rotate: 720,
            x: (Math.random() - 0.5) * 200
          }}
          transition={{ 
            duration: 3, 
            delay: c.delay,
            ease: 'easeOut'
          }}
          className="fixed w-3 h-3 rounded-sm"
          style={{ 
            backgroundColor: c.color, 
            left: `${c.left}%`,
            top: 0
          }}
        />
      ))}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-8 py-10 text-center overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
          
          {/* Achievement Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
          >
            <AchievementIcon className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 text-3xl font-bold text-white mb-2"
          >
            {achievement.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 text-slate-300"
          >
            {achievement.message}
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="px-8 py-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 text-center">
            Your Stats
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Reviewed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-700/50 rounded-2xl p-4 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">{reviewedCount}</p>
              <p className="text-xs text-slate-400">Reviewed</p>
            </motion.div>

            {/* Kept */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-700/50 rounded-2xl p-4 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.keptCount}</p>
              <p className="text-xs text-slate-400">Kept ({keepPercentage}%)</p>
            </motion.div>

            {/* Deleted */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-slate-700/50 rounded-2xl p-4 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.deletedCount}</p>
              <p className="text-xs text-slate-400">Deleted ({deletePercentage}%)</p>
            </motion.div>

            {/* Skipped */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-slate-700/50 rounded-2xl p-4 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                <SkipForward className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.skippedCount}</p>
              <p className="text-xs text-slate-400">Skipped</p>
            </motion.div>
          </div>

          {/* Space Freed - Highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 text-center border border-indigo-500/30"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <HardDrive className="w-6 h-6 text-indigo-400" />
              <span className="text-slate-300 font-medium">Space Freed</span>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formatFileSize(stats.spaceFreed)}
            </p>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-slate-700/50 space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCleanAnother}
            className="w-full group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-white shadow-xl">
              <RotateCcw className="w-5 h-5" />
              Clean Another Folder
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Summary;
