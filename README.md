# ✨ SwipeClean

> **Turn boring file cleanup into an addictive Tinder-style game**

Clean up any folder while having fun! SwipeClean gamifies file management with a sleek desktop app that makes deleting files feel satisfying.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()
[![GitHub](https://img.shields.io/badge/GitHub-shlokkokk-black?logo=github)](https://github.com/shlokkokk/SwipeClean)

---

## 🎮 What Is SwipeClean?

SwipeClean is a **desktop application** that transforms file cleanup from a chore into an enjoyable experience. Simply select a folder, and SwipeClean presents your files one-by-one as swipeable cards—just like Tinder, but for your cluttered folders.

**The action is simple:**
- 👉 **Swipe Right** → Keep the file
- 👈 **Swipe Left** → Delete to trash
- 👆 **Swipe Up** → Skip for later

---

## ⚡ Why SwipeClean?

| Why You'll Love It |
|------------------|
| 🎯 **Faster than manual deletion** – Blast through files in seconds |
| 🔄 **Undo-friendly** – Change your mind anytime (Ctrl+Z) |
| 👁️ **Smart previews** – See images, PDFs before deciding |
| ⌨️ **Keyboard shortcuts** – D=Keep, A=Delete, W=Skip |
| 💾 **Track progress** – See how much space you're freeing |
| 🛡️ **Safe by default** – Files go to trash, not permanently deleted |
| 🎨 **Beautiful dark theme** – Easy on the eyes during long sessions |
| 🚀 **Lightning fast** – Built on Electron + React |

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the App
```bash
npm run dev
```

A desktop window opens (not in your browser!) with SwipeClean ready to go.

### Step 3: Select a Folder
Click **"Select Folder to Clean"** and choose any directory you want to organize.

### Step 4: Start Swiping!
Pick your sort order and begin the cleanup game.

---

## 🎯 Features

### 📁 Smart File Scanning
- Recursive folder scanning (toggle in settings)
- Filters system files automatically (.DS_Store, Thumbs.db, etc.)
- Works with any folder size

### 👀 Intelligent Previews
| File Type | Preview |
|-----------|---------|
| 📷 Images | Full display (JPG, PNG, GIF, WebP) |
| 🎬 Videos | Thumbnail at 10% mark |
| 📄 PDFs | First page rendered |
| 📊 Documents | Type-specific previews |
| 💻 Code | Syntax-highlighted snippet |
| ❓ Unknown | Generic file icon + size |

### 🎮 Multiple Sorting Modes
- **Oldest First** ⭐ (recommended) – Vintage files first
- **Newest First** – Fresh files first
- **Date Range** – Custom time window
- **Largest First** – Heavy files first
- **By Type** – Grouped by extension

### ⌨️ Full Keyboard Control
| Key | Action |
|-----|--------|
| **→** or **D** | Keep |
| **←** or **A** | Delete |
| **↑** or **W** | Skip |
| **Space** | Open file |
| **Ctrl+Z** | Undo |
| **Esc** | Pause |

### 📊 Live Stats Dashboard
- Files kept / deleted / skipped
- Space freed in real-time
- Progress bar with file count
- Session history

### 🔒 Safety First
- ✅ Default move to trash (recoverable)
- ✅ Protected system directories
- ✅ Full undo history (10+ actions)
- ✅ Optional delete confirmation
- ✅ 0 permanent data loss by default

---

## 🎨 User Interface

### Dark Brutalist Design
Our interface uses a modern dark theme with:
- High-contrast white-on-dark text
- Smooth Framer Motion animations
- Sharp geometric UI elements
- Responsive hover effects
- Accessibility-first color scheme

### Visual Hierarchy
```
Home Screen (Select Folder)
    ↓
Sorting Modal (Choose Order)
    ↓
Session Screen (Swipe Cards)
    ↓
Summary Screen (Celebrate!)
```

---

## 💾 Installation

### Requirements
- **Node.js** v20 or higher
- **npm** (comes with Node.js)
- Windows 10+, macOS 11+, or Ubuntu 20.04+

### From Source
```bash
# Clone the repository
git clone https://github.com/shlokkokk/SwipeClean.git
cd swipeclean

# Install dependencies
npm install

# Run development mode
npm run dev
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Framework** | Electron + electron-vite |
| **UI Library** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Database** | Better-SQLite3 |
| **Image Processing** | Sharp |
| **Code Style** | ESLint + Prettier |

---

## 📖 How to Use

### 1️⃣ Launch & Select Folder
- Open SwipeClean
- Click "Select Folder to Clean"
- Choose any folder you want to organize
- SwipeClean scans the folder and counts files

### 2️⃣ Choose Sorting Order
A modal appears with sorting options:
- **Oldest First** — Start with ancient files
- **Newest First** — Fresh clutter first
- **Largest First** — Free up space fast
- **By Type** — Clean by category
- **Date Range** — Custom date window

Click **"Start"** to begin!

### 3️⃣ Swipe Through Files
Cards appear one-by-one with:
- 📸 **Preview** (images, PDFs, code)
- 📝 **Filename** with full path
- 📊 **File size & date**
- 3 action buttons or swipe gestures

**Actions:**
- Drag left/right to swipe
- Or click buttons
- Or use keyboard (A/D/W keys)

### 4️⃣ Watch Your Progress
Real-time stats at the bottom:
- ✅ Files kept
- 🗑️ Files deleted
- 💾 Space freed

### 5️⃣ Celebrate Your Clean Folder!
After all files, see your achievement:
- Total files reviewed
- Space freed (MB/GB)
- Comparison to starting state
- Option to clean another folder

---

## ⚙️ Settings

Customize SwipeClean in the **Settings** screen:

### Toggle Options
- 🛡️ **Recursive Scanning** — Go into subfolders
- 👁️ **Show Previews** — Enable/disable image previews
- 📋 **Confirm on Delete** — Ask before deleting

### Performance Tuning
- 🖼️ **Preview Quality** — Adjust image resolution
- ↪️ **Rotation Detection** — Auto-rotate image previews
- 🎚️ **Cache Size** — Limit preview storage

### Danger Zone
- 🗑️ **Clear Preview Cache** — Free up disk space
- ⚠️ **Advanced Settings** — Debug options

---

## 🐛 Troubleshooting

### App won't start?
```bash
# Clean install
rm -rf node_modules dist package-lock.json
npm install
npm run dev
```

### Previews not loading?
```bash
# Clear preview cache from settings or delete manually
rm -rf ~/.config/SwipeClean/previews  # Linux/macOS
rmdir /s %APPDATA%\SwipeClean\previews  # Windows
```

### Still stuck?
[Open an issue on GitHub](https://github.com/shlokkokk/SwipeClean/issues) — I'll help!

---

## 📦 Project Structure

```
swipeclean/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts              # App entry & IPC handlers
│   │   ├── preload.ts           # Secure IPC bridge
│   │   ├── fileScanner.ts       # File discovery
│   │   ├── previewGenerator.ts  # Image/PDF generation
│   │   └── database.ts          # SQLite session storage
│   ├── renderer/                # React app
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Folder selection
│   │   │   ├── Session.tsx      # Main swipe interface
│   │   │   ├── Summary.tsx      # Results & stats
│   │   │   └── Settings.tsx     # User preferences
│   │   ├── components/
│   │   │   ├── SwipeCard.tsx    # Draggable file card
│   │   │   ├── SortingModal.tsx # Sort selection
│   │   │   └── Tooltip.tsx      # Hover tooltips
│   │   └── styles/
│   │       └── index.css        # Tailwind + custom styles
│   └── shared/
│       └── types.ts             # TypeScript models
├── electron.vite.config.ts      # Build config
├── vite.config.ts               # Dev config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/awesome-thing`)
3. **Commit** your changes (`git commit -m 'Add awesome feature'`)
4. **Push** to the branch (`git push origin feature/awesome-thing`)
5. **Open** a Pull Request

### Code Style
- TypeScript for type safety
- ESLint + Prettier for formatting
- Descriptive commit messages
- No console.logs in production code

---

## 🚀 Roadmap

### Version 2.0 (Planned)
- [ ] AI-powered file recommendations ("Similar to files you kept")
- [ ] Duplicate file detection & batch removal
- [ ] Cloud storage support (Google Drive, Dropbox)
- [ ] Scheduled automatic cleanups
- [ ] Achievement badges & gamification

### Version 3.0+ (Future)
- [ ] Browser extension version
- [ ] iOS/Android companion app
- [ ] Team/family shared cleaning sessions
- [ ] Real-time download folder auto-cleanup

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

See [LICENSE](./LICENSE) for details.

---

## 💬 Support

Having issues? Check these first:

1. **[Open an Issue](https://github.com/shlokkokk/SwipeClean/issues)** — Report bugs

---

## 📊 Stats

<!-- These would update automatically with a GitHub action -->
- 👥 Active Contributors: 1
- ⭐ Stars: Coming soon!
- 🍴 Forks: Get forking!
- 🐛 Open Issues: 0

---

## 🎯 Why I Built This

I was tired of spending **hours** dragging files to trash one-by-one. SwipeClean was born from frustration with boring file management. By combining the satisfaction of a swiping game with actual productivity, file cleanup became something I actually look forward to.

Maybe you will too! 🎮

---

## 🙏 Acknowledgments

- **Electron** for the fantastic desktop framework
- **React** for the component magic
- **Framer Motion** for smooth animations
- **Tailwind CSS** for beautiful styling
- **Lucide React** for gorgeous icons
- **Better-SQLite3** for fast data storage

---

<div align="center">

**Made with 💜 by a developer tired of cluttered folders**

[⬆ Back to top](#-swipeclean)

</div>
