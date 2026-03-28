import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  FileType, 
  HardDrive, 
  ArrowUpDown,
  X,
  Check,
  CalendarRange
} from 'lucide-react';
import type { SortOrder } from '@shared/types';

interface SortingModalProps {
  folderPath: string;
  onConfirm: (sortOrder: SortOrder, startDate?: string, endDate?: string) => void;
  onCancel: () => void;
}

const sortOptions: { value: SortOrder; label: string; description: string; icon: React.ElementType }[] = [
  { 
    value: 'oldest', 
    label: 'Oldest First', 
    description: 'Start with the oldest files (Recommended)',
    icon: Clock 
  },
  { 
    value: 'newest', 
    label: 'Newest First', 
    description: 'Start with the most recent files',
    icon: Clock 
  },
  { 
    value: 'daterange', 
    label: 'Date Range', 
    description: 'Only show files within a specific date range',
    icon: CalendarRange 
  },
  { 
    value: 'largest', 
    label: 'Largest First', 
    description: 'Start with the biggest files to free up space quickly',
    icon: HardDrive 
  },
  { 
    value: 'type', 
    label: 'By File Type', 
    description: 'Group similar file types together',
    icon: FileType 
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Choose File Order</h2>
            <p className="text-sm text-slate-400 mt-1">
              How should we organize files from <span className="text-indigo-400 font-medium">{folderName}</span>?
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="p-6 space-y-3">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedSort === option.value;
          const isDateRange = option.value === 'daterange';

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sortOptions.indexOf(option) * 0.05 }}
            >
              <button
                onClick={() => setSelectedSort(option.value)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-700/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-indigo-500' : 'bg-slate-700'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {option.label}
                    </span>
                    {option.value === 'oldest' && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {option.description}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>

              {/* Date Range Inputs */}
              {isDateRange && isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 ml-14 grid grid-cols-2 gap-3"
                >
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-slate-700/50 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={selectedSort === 'daterange' && (!startDate || !endDate)}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Cleaning
        </button>
      </div>
    </motion.div>
  );
};

export default SortingModal;
