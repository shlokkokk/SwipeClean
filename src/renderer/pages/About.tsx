import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Shield,
  Gauge,
  Keyboard,
  Workflow,
  Folder,
  Eye,
  HardDrive,
  Bug,
  Sparkles,
  Github,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Gamepad2
} from 'lucide-react';
import Tooltip from '../components/Tooltip';

interface AboutProps {
  onBack: () => void;
  onOpenSettings: () => void;
}

const techStack = [
  'Electron + electron-vite',
  'React 19 + TypeScript',
  'Framer Motion animations',
  'SQLite (better-sqlite3)',
  'Sharp + PDF preview tooling'
];

const keybinds = [
  { action: 'Keep File', keys: 'D / Right Arrow' },
  { action: 'Delete File', keys: 'A / Left Arrow' },
  { action: 'Skip File', keys: 'W / Up Arrow' },
  { action: 'Undo Last Action', keys: 'Ctrl + Z' },
  { action: 'Open Current File', keys: 'Space' },
  { action: 'Exit / Close Dialog', keys: 'Escape' },
  { action: 'Shortcut Overlay', keys: '?' }
];

const pillars = [
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'SwipeClean is designed to keep cleanup deliberate, reversible, and visible. The workflow is built around quick decisions with clear feedback.'
  },
  {
    icon: Gauge,
    title: 'Fast Decisions',
    description:
      'Card-based review plus keyboard controls keeps you in flow. You can process large folders significantly faster than manual drag-to-trash cleanup.'
  },
  {
    icon: Workflow,
    title: 'Structured Sessions',
    description:
      'Each run follows a consistent pipeline: select folder, choose sorting mode, swipe decisions, review summary stats, repeat.'
  }
];

const workflow = [
  {
    icon: Folder,
    title: '1. Select Folder',
    description: 'Pick the directory you want to clean. Recent folders are available for instant relaunch.'
  },
  {
    icon: Sparkles,
    title: '2. Choose Sort Strategy',
    description: 'Start oldest-first, newest-first, largest-first, file-type grouped, or date-range focused.'
  },
  {
    icon: Eye,
    title: '3. Review Cards',
    description: 'Inspect previews and metadata, then keep, delete, or skip with swipe gestures or keys.'
  },
  {
    icon: HardDrive,
    title: '4. Track Progress',
    description: 'Live HUD shows kept/deleted/skipped counts and total storage impact in real time.'
  },
  {
    icon: CheckCircle2,
    title: '5. Finish Session',
    description: 'Get summary stats and immediately launch another cleanup round if needed.'
  }
];

export default function About({ onBack, onOpenSettings }: AboutProps) {
  return (
    <div className="h-full w-full overflow-y-auto premium-scroll bg-[#05080f] text-slate-200 relative">
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-48 -right-16 w-[28rem] h-[28rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-16 left-1/3 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-10">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <Tooltip text="Back to Home" shortcut="Esc" position="bottom">
              <button
                onClick={onBack}
                className="w-11 h-11 bg-[#0d1320] border border-white/10 rounded-xl hover:bg-[#151f32] hover:border-cyan-400/40 flex items-center justify-center transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-cyan-300" />
              </button>
            </Tooltip>
            <div>
              <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-cyan-300/70">Knowledge Deck</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">About SwipeClean</h1>
            </div>
          </div>

          <Tooltip text="Open Settings" position="left">
            <button
              onClick={onOpenSettings}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-200 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </Tooltip>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mb-10 rounded-3xl border border-cyan-400/20 bg-[#0a1120]/80 backdrop-blur-xl p-8 shadow-[0_20px_80px_-30px_rgba(0,229,255,0.35)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-cyan-300/70 mb-2">Mission</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                Turn folder cleanup into a fast, focused, game-like workflow.
              </h2>
              <p className="text-slate-300/90 leading-relaxed">
                SwipeClean transforms repetitive file management into rapid decision rounds. You review one file at a time with previews,
                consistent controls, and live progress telemetry so cleanup feels intentional instead of exhausting.
              </p>
            </div>

            <div className="min-w-[220px] rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-3">Built With</p>
              <ul className="space-y-2 text-sm text-slate-200">
                {techStack.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-cyan-300 mt-0.5">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + idx * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-white/10 bg-[#0b1222]/80 p-6 hover:border-cyan-400/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-cyan-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300/90">{pillar.description}</p>
              </motion.article>
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35 }}
          className="rounded-3xl border border-white/10 bg-[#0a1020]/80 p-8 mb-10"
        >
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-cyan-300" />
            Full Workflow Blueprint
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-4 h-4 text-cyan-300" />
                    <p className="font-bold text-white text-sm uppercase tracking-wider">{step.title}</p>
                  </div>
                  <p className="text-sm text-slate-300/90 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33, duration: 0.35 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-300" />
              Safety + Trust
            </h3>
            <ul className="space-y-2 text-sm text-slate-200/95">
              <li className="flex gap-2"><span className="text-emerald-300">-</span>Optional confirmation before delete in Settings.</li>
              <li className="flex gap-2"><span className="text-emerald-300">-</span>Undo support for quick recovery during active session.</li>
              <li className="flex gap-2"><span className="text-emerald-300">-</span>Protected directory checks in scanner to avoid critical system paths.</li>
              <li className="flex gap-2"><span className="text-emerald-300">-</span>Session summary gives full visibility into decisions and impact.</li>
            </ul>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.35 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              Current Limitations
            </h3>
            <ul className="space-y-2 text-sm text-slate-200/95">
              <li className="flex gap-2"><span className="text-amber-300">-</span>Video thumbnails are currently not generated.</li>
              <li className="flex gap-2"><span className="text-amber-300">-</span>Very large folders can be slower depending on disk speed.</li>
              <li className="flex gap-2"><span className="text-amber-300">-</span>Preview and native module behavior can vary by OS packaging target.</li>
            </ul>
          </motion.article>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.35 }}
          className="rounded-3xl border border-white/10 bg-[#0a0f1d]/80 p-8 mb-10"
        >
          <h3 className="text-xl font-black text-white mb-5 flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-cyan-300" />
            Keyboard Control Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keybinds.map((item) => (
              <div key={item.action} className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-200">{item.action}</span>
                <kbd className="text-[11px] font-mono px-2 py-1 rounded border border-cyan-400/40 text-cyan-300 bg-cyan-500/10">
                  {item.keys}
                </kbd>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.35 }}
          className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-8"
        >
          <h3 className="text-xl font-black text-white mb-5 flex items-center gap-3">
            <Bug className="w-5 h-5 text-cyan-300" />
            Support, Feedback, and Source
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/shlokkokk/SwipeClean"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-black/25 p-4 hover:border-cyan-400/40 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Github className="w-4 h-4 text-cyan-300" />
                <span className="font-bold text-white text-sm">Repository</span>
              </div>
              <p className="text-sm text-slate-300/90">View source code and releases.</p>
              <div className="mt-3 text-cyan-300 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                Open <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>

            <a
              href="https://github.com/shlokkokk/SwipeClean/issues"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-black/25 p-4 hover:border-cyan-400/40 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-cyan-300" />
                <span className="font-bold text-white text-sm">Issue Tracker</span>
              </div>
              <p className="text-sm text-slate-300/90">Report bugs and request features.</p>
              <div className="mt-3 text-cyan-300 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                Open <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>

            <button
              onClick={onOpenSettings}
              className="text-left rounded-xl border border-white/10 bg-black/25 p-4 hover:border-cyan-400/40 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-cyan-300" />
                <span className="font-bold text-white text-sm">Tune Preferences</span>
              </div>
              <p className="text-sm text-slate-300/90">Adjust undo depth, cache settings, and delete confirmation behavior.</p>
              <div className="mt-3 text-cyan-300 text-xs uppercase tracking-wider font-bold">Open Settings</div>
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
