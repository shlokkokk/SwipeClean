import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trash2, FolderTree, Eye, RotateCcw, Image as ImageIcon,
  Save, Check, Shield, RefreshCcw, Info, X, SkipForward,
  Keyboard, MonitorPlay, Zap
} from 'lucide-react';
import type { AppSettings } from '@shared/types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onCancel: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  confirmBeforeDelete: false,
  recursiveScan: true,
  showSystemFiles: false,
  maxUndoActions: 10,
  previewCacheSize: 100
};

export default function Settings({ settings, onSave, onCancel }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleToggle = (key: keyof AppSettings) => {
    updateSetting(key, !localSettings[key] as any);
  };

  const handleSave = () => {
    if (!hasChanges) return;
    onSave(localSettings);
  };

  const handleResetDefaults = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    setShowResetConfirm(false);
  };

  const handleClearCache = async () => {
    try {
      await window.electronAPI.clearPreviewCache();
      setCacheCleared(true);
      setShowClearCacheConfirm(false);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-[3.5rem] h-[1.75rem] transition-all duration-300 shrink-0 border ${
        checked ? 'bg-white border-white' : 'bg-black/50 border-white/20 hover:border-white/50'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-[2px] w-[22px] h-[22px] shadow-md ${checked ? 'bg-black' : 'bg-white/50'}`}
      />
    </button>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#050505] relative font-sans text-slate-200 selection:bg-white/20">
      
      {/* ── Strict Brutalist Header ── */}
      <header className="shrink-0 flex items-center justify-between px-10 xl:px-16 py-8 z-20 sticky top-0 bg-[#050505] border-b border-white/10 shadow-2xl">
        <div className="flex items-center gap-10">
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors group flex items-center justify-center p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          </button>
          <h1 className="text-[28px] font-medium tracking-tight text-white drop-shadow-sm uppercase">Preferences</h1>
        </div>
        
        <div className="flex items-center gap-12">
          <button onClick={() => setShowResetConfirm(true)} className="text-[13px] font-bold tracking-[0.2em] text-white/40 hover:text-white transition-colors uppercase">
            Restore Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-12 py-5 text-[14px] font-bold tracking-[0.2em] uppercase transition-all duration-300 border-2 ${hasChanges ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-transparent text-white/30 border-white/10 hover:border-white/30 cursor-not-allowed'}`}
          >
            <span className="relative flex items-center gap-4">
              <Save className="w-5 h-5" /> {hasChanges ? 'Save Changes' : 'Unchanged'}
            </span>
          </button>
        </div>
      </header>

      {/* ── Padded Brutalist Boxes ── */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto premium-scroll z-10 px-8 sm:px-16 xl:px-32 w-full pb-60">
        <div className="w-full flex flex-col max-w-[1920px] mx-auto pt-16 gap-[8rem]">
          
          {/* 1. Engine & Workflow */}
          <section className="w-full">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/50 mb-10 border-b border-white/10 pb-6 flex items-center gap-4 select-none">
              <MonitorPlay className="w-5 h-5" /> Workflow Engine
            </h2>
            
            <div className="flex flex-col gap-6">
              {/* Row: Confirm */}
              <div className="flex items-start justify-between p-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start gap-10 flex-1 pr-16 min-w-0">
                  <Shield className="w-8 h-8 text-white/20 group-hover:text-white/60 group-hover:drop-shadow-[0_0_16px_rgba(59,130,246,0.4)] mt-0.5 transition-all" />
                  <div className="flex flex-col gap-4 min-w-0">
                    <h3 className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Confirm Deletions</h3>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed max-w-4xl transition-all">Prompt for explicit confirmation before moving files to the system trash to prevent accidental wipes of critical folders.</p>
                  </div>
                </div>
                <div className="mt-2 shrink-0"><Toggle checked={localSettings.confirmBeforeDelete} onChange={() => handleToggle('confirmBeforeDelete')} /></div>
              </div>

              {/* Row: Recursive */}
              <div className="flex items-start justify-between p-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start gap-10 flex-1 pr-16 min-w-0">
                  <FolderTree className="w-8 h-8 text-white/20 group-hover:text-white/60 group-hover:drop-shadow-[0_0_16px_rgba(34,197,94,0.4)] mt-0.5 transition-all" />
                  <div className="flex flex-col gap-4 min-w-0">
                    <h3 className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Deep Recursive Scan</h3>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed max-w-4xl transition-all">Sequentially crawl and index files entirely through all nested subdirectories inside the workspace instead of just scanning the top-level files.</p>
                  </div>
                </div>
                <div className="mt-2 shrink-0"><Toggle checked={localSettings.recursiveScan} onChange={() => handleToggle('recursiveScan')} /></div>
              </div>

              {/* Row: Hidden Files */}
              <div className="flex items-start justify-between p-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start gap-10 flex-1 pr-16 min-w-0">
                  <Eye className="w-8 h-8 text-white/20 group-hover:text-white/60 group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.4)] mt-0.5 transition-all" />
                  <div className="flex flex-col gap-4 min-w-0">
                    <h3 className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Reveal System Files</h3>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed max-w-4xl transition-all">Expose hidden OS dotfiles, metadata caches (like .DS_Store), and internal system configuration files for deep storage cleaning.</p>
                  </div>
                </div>
                <div className="mt-2 shrink-0"><Toggle checked={localSettings.showSystemFiles} onChange={() => handleToggle('showSystemFiles')} /></div>
              </div>
            </div>
          </section>

          {/* 2. Tuners */}
          <section className="w-full">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/50 mb-10 border-b border-white/10 pb-6 flex items-center gap-4 select-none">
              <Zap className="w-5 h-5" /> Performance Tuners
            </h2>

            <div className="flex flex-col gap-6">
              {/* Depth Slider */}
              <div className="flex flex-col p-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start gap-10 w-full min-w-0">
                  <RotateCcw className="w-8 h-8 text-white/20 group-hover:text-white/60 group-hover:drop-shadow-[0_0_16px_rgba(147,51,234,0.4)] mt-0.5 transition-all" />
                  <div className="flex flex-col gap-5 flex-1 min-w-0">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Undo History Depth</h3>
                      <span className="font-mono text-[14px] font-bold text-white/50 group-hover:text-white/80 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] tracking-[0.2em] transition-all">{localSettings.maxUndoActions} ACTIONS</span>
                    </div>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed max-w-4xl mb-6 transition-all">Maximum state branches kept alive simultaneously in active RAM for instant rewinds.</p>
                    <div className="flex items-center w-full max-w-4xl pt-2 px-4 py-3 bg-white/[0.01] border border-white/5 rounded-lg group-hover:border-white/20 group-hover:bg-white/[0.03] transition-all">
                       <input 
                         type="range" min={1} max={50} 
                         value={localSettings.maxUndoActions}
                         onChange={(e) => updateSetting('maxUndoActions', parseInt(e.target.value))}
                         className="w-full h-[2px] bg-white/20 appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0)] hover:[&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:[&::-webkit-slider-thumb]:scale-110 transition-all cursor-pointer rounded-none border-none"
                         style={{ background: `linear-gradient(to right, #ffffff ${(localSettings.maxUndoActions / 50) * 100}%, transparent ${(localSettings.maxUndoActions / 50) * 100}%)` }}
                       />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cache Slider */}
              <div className="flex flex-col p-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all relative group">
                <div className="flex items-start gap-10 w-full min-w-0">
                  <ImageIcon className="w-8 h-8 text-white/20 group-hover:text-white/60 group-hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.4)] mt-0.5 transition-all" />
                  <div className="flex flex-col gap-5 flex-1 min-w-0">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Preview Cache Limit</h3>
                      <span className="font-mono text-[14px] font-bold text-white/50 group-hover:text-white/80 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] tracking-[0.2em] transition-all">{localSettings.previewCacheSize} PRELOADS</span>
                    </div>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed max-w-4xl mb-6 transition-all">Maximum full-quality image blobs to dynamically preload sequentially into active operating memory.</p>
                    <div className="flex items-center w-full max-w-4xl pt-2 px-4 py-3 bg-white/[0.01] border border-white/5 rounded-lg group-hover:border-white/20 group-hover:bg-white/[0.03] transition-all">
                       <input 
                         type="range" min={10} max={500} step={10}
                         value={localSettings.previewCacheSize}
                         onChange={(e) => updateSetting('previewCacheSize', parseInt(e.target.value))}
                         className="w-full h-[2px] bg-white/20 appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0)] hover:[&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:[&::-webkit-slider-thumb]:scale-110 transition-all cursor-pointer rounded-none border-none"
                         style={{ background: `linear-gradient(to right, #ffffff ${((localSettings.previewCacheSize - 10) / 490) * 100}%, transparent ${((localSettings.previewCacheSize - 10) / 490) * 100}%)` }}
                       />
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {cacheCleared && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#050505]/95 flex items-center justify-center gap-6 border-y border-white/10"
                    >
                      <Check className="w-8 h-8 text-emerald-400" />
                      <p className="text-[20px] font-medium text-white tracking-wide">Image Memory Purged Successfully</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* 3. Mechanics Grid Boxes */}
          <section className="w-full">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/50 mb-10 border-b border-white/10 pb-6 flex items-center gap-4 select-none">
              <Info className="w-5 h-5" /> Structural Mechanics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
               <div className="flex flex-col gap-6 p-12 px-16 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group min-w-0">
                 <div className="w-14 h-14 flex items-center justify-center">
                   <div className="relative">
                     <div className="absolute inset-0 bg-emerald-400/0 rounded-full blur-md group-hover:bg-emerald-400/30 transition-all duration-300" />
                     <Check className="w-12 h-12 text-white/20 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_16px_rgba(16,185,129,0.5)] transition-all relative z-10" />
                   </div>
                 </div>
                 <div className="flex flex-col flex-1 gap-4 min-w-0">
                   <h3 className="text-[32px] font-light text-white tracking-tight leading-none group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all">Keep File</h3>
                   <p className="text-[16px] text-white/40 group-hover:text-white/50 leading-relaxed flex-1 transition-colors">Secures the payload permanently and smoothly leaps past your filters safe and sound.</p>
                   <div className="mt-auto pt-6">
                     <div className="text-[13px] font-mono font-bold tracking-[0.4em] text-white/30 uppercase group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all">Press [D] or [→]</div>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col gap-6 p-12 px-16 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group min-w-0">
                 <div className="w-14 h-14 flex items-center justify-center">
                   <div className="relative">
                     <div className="absolute inset-0 bg-red-400/0 rounded-full blur-md group-hover:bg-red-400/30 transition-all duration-300" />
                     <X className="w-12 h-12 text-white/20 group-hover:text-red-400 group-hover:drop-shadow-[0_0_16px_rgba(248,113,113,0.5)] transition-all relative z-10" />
                   </div>
                 </div>
                 <div className="flex flex-col flex-1 gap-4 min-w-0">
                   <h3 className="text-[32px] font-light text-white tracking-tight leading-none group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all">Delete File</h3>
                   <p className="text-[16px] text-white/40 group-hover:text-white/50 leading-relaxed flex-1 transition-colors">Marks the file for destruction. Safely reversible via system trash bins.</p>
                   <div className="mt-auto pt-6">
                     <div className="text-[13px] font-mono font-bold tracking-[0.4em] text-white/30 uppercase group-hover:text-red-400 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.4)] transition-all">Press [A] or [←]</div>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col gap-6 p-12 px-16 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group min-w-0">
                 <div className="w-14 h-14 flex items-center justify-center">
                   <div className="relative">
                     <div className="absolute inset-0 bg-blue-400/0 rounded-full blur-md group-hover:bg-blue-400/30 transition-all duration-300" />
                     <SkipForward className="w-12 h-12 text-white/20 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_16px_rgba(96,165,250,0.5)] transition-all relative z-10" />
                   </div>
                 </div>
                 <div className="flex flex-col flex-1 gap-4 min-w-0">
                   <h3 className="text-[32px] font-light text-white tracking-tight leading-none group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all">Skip File</h3>
                   <p className="text-[16px] text-white/40 group-hover:text-white/50 leading-relaxed flex-1 transition-colors">By-passes the current index silently and retains the file completely untouched.</p>
                   <div className="mt-auto pt-6">
                     <div className="text-[13px] font-mono font-bold tracking-[0.4em] text-white/30 uppercase group-hover:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.4)] transition-all">Press [W] or [↑]</div>
                   </div>
                 </div>
               </div>
            </div>
          </section>

          {/* 4. Structural List for Shortcuts */}
          <section className="w-full">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/50 mb-10 border-b border-white/10 pb-6 flex items-center gap-4 select-none">
              <Keyboard className="w-5 h-5" /> Global Keybinds
            </h2>
            
            <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between px-12 py-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <span className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Focus Current File</span>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed transition-all">Spawn a native OS preview window of the currently active file without leaving your session flow.</p>
                  </div>
                  <div className="flex items-center justify-center shrink-0 ml-14 pl-12 border-l border-white/5 w-40">
                    <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 group-hover:border-white/20 group-hover:bg-black/60 group-hover:text-white group-hover:shadow-[0_0_16px_rgba(255,255,255,0.3)] transition-all whitespace-nowrap">SPACEBAR</span>
                  </div>
               </div>

               <div className="flex items-center justify-between px-12 py-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <span className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Revert Session Action</span>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed transition-all">Pull the last categorized file back instantly from the void if your fingers move too fast.</p>
                  </div>
                  <div className="flex items-center justify-center shrink-0 ml-14 pl-12 border-l border-white/5 w-40">
                    <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 group-hover:border-white/20 group-hover:bg-black/60 group-hover:text-white group-hover:shadow-[0_0_16px_rgba(255,255,255,0.3)] transition-all whitespace-nowrap">CTRL + Z</span>
                  </div>
               </div>

               <div className="flex items-center justify-between px-12 py-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <span className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Bail Out & Terminate</span>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed transition-all">Disengage your current session cleanly or exit any active modal instantly back to baseline.</p>
                  </div>
                  <div className="flex items-center justify-center shrink-0 ml-14 pl-12 border-l border-white/5 w-40">
                    <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 group-hover:border-white/20 group-hover:bg-black/60 group-hover:text-white group-hover:shadow-[0_0_16px_rgba(255,255,255,0.3)] transition-all whitespace-nowrap">ESCAPE</span>
                  </div>
               </div>

               <div className="flex items-center justify-between px-12 py-12 bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all group">
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <span className="text-[22px] font-medium text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">Summon Context HUD</span>
                    <p className="text-[16px] text-white/40 group-hover:text-white/60 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] leading-relaxed transition-all">Invoke the minimal graphical reference overlay directly above the stack without exiting.</p>
                  </div>
                  <div className="flex items-center justify-center shrink-0 ml-14 pl-12 border-l border-white/5 w-40">
                    <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 group-hover:border-white/20 group-hover:bg-black/60 group-hover:text-white group-hover:shadow-[0_0_16px_rgba(255,255,255,0.3)] transition-all whitespace-nowrap">SHIFT + ?</span>
                  </div>
               </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="w-full mt-10">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-red-500/80 mb-10 border-b border-red-500/20 pb-6 flex items-center gap-4 select-none group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all">
              <Trash2 className="w-5 h-5 group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all" /> Destructive Operations
            </h2>
            <div className="flex items-center justify-between px-12 py-12 bg-red-500/5 hover:bg-red-500/[0.08] transition-all border-2 border-red-500/10 hover:border-red-500/30 group">
              <div className="flex flex-col gap-5 flex-1 min-w-0">
                <h3 className="text-[24px] font-medium text-red-500 group-hover:text-red-400 group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all">Purge Internal Cache Memory</h3>
                <p className="text-[16px] text-red-400/60 group-hover:text-red-400/80 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.2)] leading-relaxed transition-all">
                  Manually wipe the active image preview cache mappings. This forces SwipeClean to structurally re-read raw data chunks sequentially upon next session start, completely resetting the index tree map. Use only when experiencing severe memory pressure.
                </p>
              </div>
              <div className="flex items-center justify-center shrink-0 ml-14 pl-12 border-l border-red-500/10 w-40">
                <button onClick={() => setShowClearCacheConfirm(true)} className="px-6 py-2.5 bg-red-500/15 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/80 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:text-red-200 text-red-400 font-bold transition-all duration-300 uppercase tracking-[0.3em] text-[12px] whitespace-nowrap">
                  Nuke Setup
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ── Strict Modals ── */}
      <AnimatePresence>
        {showClearCacheConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505]/95 flex items-center justify-center z-50 p-8"
          >
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#050505] p-16 w-full max-w-3xl border border-red-500/30 flex flex-col items-center text-center shadow-[0_0_120px_-20px_rgba(239,68,68,0.2)]"
            >
              <div className="w-24 h-24 bg-red-500/10 flex items-center justify-center mb-10 border border-red-500/30">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-[36px] font-medium text-white mb-6 tracking-tight uppercase">Execute Protocol?</h3>
              <p className="text-white/50 text-[18px] leading-relaxed mb-16 max-w-xl">
                This will delete all locally mapped image descriptors to free memory. The app will organically reconstruct thumbnails dynamically on demand.
              </p>
              <div className="flex w-full gap-8">
                <button onClick={() => setShowClearCacheConfirm(false)}
                  className="flex-1 py-6 bg-white/5 hover:bg-white/10 text-white text-[16px] font-bold tracking-widest uppercase transition-all border border-white/5 hover:border-white/20"
                >Abort</button>
                <button onClick={handleClearCache}
                  className="flex-1 py-6 bg-red-500/20 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 text-[16px] font-bold tracking-widest uppercase transition-all"
                >Execute</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505]/95 flex items-center justify-center z-50 p-8"
          >
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#050505] p-16 w-full max-w-3xl border border-white/20 flex flex-col items-center text-center shadow-[0_0_120px_-20px_rgba(255,255,255,0.1)]"
            >
              <div className="w-24 h-24 bg-white/5 flex items-center justify-center mb-10 border border-white/20">
                <RefreshCcw className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[36px] font-medium text-white mb-6 tracking-tight uppercase">Restore Defaults?</h3>
              <p className="text-white/50 text-[18px] leading-relaxed mb-16 max-w-xl">
                This will reset all engine settings to sequential baseline parameters. Hit Save strictly after applying to store.
              </p>
              <div className="flex w-full gap-8">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-6 bg-white/5 hover:bg-white/10 text-white text-[16px] font-bold tracking-widest uppercase transition-all border border-white/5 hover:border-white/20"
                >Retain</button>
                <button onClick={handleResetDefaults}
                  className="flex-1 py-6 bg-white hover:bg-slate-200 text-black text-[16px] font-bold tracking-[0.2em] uppercase transition-all border border-white"
                >Reset Array</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
