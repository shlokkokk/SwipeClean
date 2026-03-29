import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  FileType, 
  HardDrive, 
  ArrowUpDown,
  X,
  Check,
  CalendarRange,
  Sparkles,
  Info
} from 'lucide-react';
import Tooltip from './Tooltip';
import type { SortOrder } from '@shared/types';

interface SortingModalProps {
  folderPath: string;
  onConfirm: (sortOrder: SortOrder, startDate?: string, endDate?: string) => void;
  onCancel: () => void;
}

const sortOptions: { value: SortOrder; label: string; description: string; icon: React.ElementType; tip: string }[] = [
  { 
    value: 'oldest', 
    label: 'Oldest First', 
    description: 'Start with the oldest files',
    icon: Clock,
    tip: 'Great for clearing out forgotten files that have been sitting around for months'
  },
  { 
    value: 'newest', 
    label: 'Newest First', 
    description: 'Start with the most recent files',
    icon: Clock,
    tip: 'Perfect for organizing recent downloads before they pile up'
  },
  { 
    value: 'daterange', 
    label: 'Date Range', 
    description: 'Only show files within a specific date range',
    icon: CalendarRange,
    tip: 'Useful when you know roughly when the junk files were created'
  },
  { 
    value: 'largest', 
    label: 'Largest First', 
    description: 'Start with the biggest files',
    icon: HardDrive,
    tip: 'Free up the most disk space as quickly as possible'
  },
  { 
    value: 'type', 
    label: 'By File Type', 
    description: 'Group similar file types together',
    icon: FileType,
    tip: 'Review all images together, then all PDFs, etc. — easier to batch-decide'
  }
];

const SortingModal: React.FC<SortingModalProps> = ({ folderPath, onConfirm, onCancel }) => {
  const [selectedSort, setSelectedSort] = useState<SortOrder>('oldest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleConfirm = () => {
    if (selectedSort === 'daterange') {
      onConfirm(selectedSort, startDate || undefined, endDate || undefined);
    } else {
      onConfirm(selectedSort);
    }
  };

  const folderName = folderPath.split(/[/\\]/).pop() || 'Unknown Folder';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full max-w-2xl bg-[#0f172a]/95 backdrop-blur-3xl shadow-2xl overflow-hidden border-4 border-white/20 flex flex-col max-h-[85vh]"
      style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 shrink-0 relative bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div
                className="w-10 h-10 bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/40"
                style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
              >
                <ArrowUpDown className="w-5 h-5 text-indigo-400" />
              </div>
              Choose File Order
            </h2>
            <p className="text-slate-400 mt-2 text-[14px]">
              How should we organize files from <span className="text-white font-semibold">{folderName}</span>?
            </p>
          </div>
          <Tooltip text="Cancel and go back" position="left">
            <button
              onClick={onCancel}
              className="p-3 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:rotate-90 group border border-white/10 hover:border-white/30"
              style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Sort Options (Scrollable Flexible Body) */}
      <div className="p-8 pb-12 flex-1 overflow-y-auto premium-scroll flex flex-col gap-6">
        {sortOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedSort === option.value;
          const isDateRange = option.value === 'daterange';

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <button
                onClick={() => setSelectedSort(option.value)}
                className={`w-full flex items-start gap-6 p-6 border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_8px_32px_-8px_rgba(99,102,241,0.2)]'
                    : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
                }`}
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
              >
                {/* Visual Ring for Selected State */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                )}

                <motion.div 
                  className={`w-14 h-14 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isSelected ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30' : 'bg-slate-800 border-2 border-white/10 group-hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                </motion.div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[17px] font-bold transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {option.label}
                    </span>
                    {option.value === 'oldest' && (
                      <span
                        className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 flex items-center gap-1.5 shadow-sm"
                        style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className={`text-[14px] mt-1.5 leading-relaxed transition-colors duration-300 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {option.description}
                  </p>
                  
                  {/* The seamless context tip instead of fake (i) buttons */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[13px] text-indigo-300/80 italic border-l-2 border-indigo-500/30 pl-3 py-0.5 font-medium">
                          {option.tip}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={`w-7 h-7 border-2 flex items-center justify-center shrink-0 transition-all duration-300 self-center ${
                  isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-500 group-hover:border-slate-400'
                }`}
                style={{ clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)' }}
              >
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </button>

              {/* Date Range Inputs */}
              <AnimatePresence>
                {isDateRange && isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 ml-[5.5rem] grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border-2 border-white/10 text-white text-[14px] font-medium focus:outline-none focus:border-indigo-500 transition-all duration-300 shadow-inner hover:bg-slate-800"
                        style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border-2 border-white/10 text-white text-[14px] font-medium focus:outline-none focus:border-indigo-500 transition-all duration-300 shadow-inner hover:bg-slate-800"
                        style={{ clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)' }}
                      />
                    </div>
                    {selectedSort === 'daterange' && startDate && endDate && new Date(startDate) > new Date(endDate) && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-2 text-[12px] font-bold text-red-400 flex items-center gap-1.5 mt-1"
                      >
                        <X className="w-4 h-4" />
                        Start date must be before end date
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer (Pinned to bottom, never chopped) */}
      <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] shrink-0 flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 text-white font-bold transition-all duration-200 border-2 border-white/10 hover:border-white/20 shadow-sm text-[15px]"
          style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={selectedSort === 'daterange' && (!startDate || !endDate)}
          className="flex-[2] px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 text-[15px] border-2 border-indigo-400/30 hover:border-indigo-400/60"
          style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
        >
          <Sparkles className="w-5 h-5" />
          Start Cleaning Deck
        </button>
      </div>
    </motion.div>
  );
};

export default SortingModal;
