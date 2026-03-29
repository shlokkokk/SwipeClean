# ✨ SwipeClean

> **Turn boring file cleanup into an addictive Tinder-style game**

Clean up any folder while having fun! SwipeClean gamifies file management with a sleek desktop app that makes deleting files feel satisfying.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()
[![GitHub](https://img.shields.io/badge/GitHub-shlokkokk-black?logo=github)](https://github.com/shlokkokk/SwipeClean)

## 🕹️ Play Mode

**[🎮 Jump To Swipe Arena Interactive](#play-game)**

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

## ️ Tech Stack

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

<a id="play-game"></a>
## 🎮 Swipe Arena Interactive (Click To Play)

<p align="center">
        <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=22&pause=850&color=00E676&center=true&vCenter=true&width=900&lines=SWIPE+ARENA+%2F%2F+INTERACTIVE+MODE;5+ROUNDS+%7C+SCORE+ATTACK+%7C+ONE+LIFE;Click+choices+to+play+inside+README" alt="Swipe Arena interactive banner" />
</p>

<p align="center">
    <b>Arcade Cleanup Protocol Activated</b><br/>
    <sub>Fast decisions. Smart deletes. Zero regret.</sub>
</p>

| HUD | Value |
|-----|-------|
| Start Score | **0** |
| Perfect Move | **+3** |
| Safe Move | **+1** |
| Bad Move | **-2** |
| Win Condition | **12+ points** |

### Mission Map

`Start` -> `Round 1` -> `Round 2` -> `Round 3` -> `Round 4` -> `Round 5` -> `Rank`

- Quick jump: [Start Mission](#arena-start)
- Quick jump: [Final Rank](#arena-rank)

### Start Mission

<a id="arena-start"></a>
You are dropped into a chaotic Downloads folder at 2:17 AM.

Choose your first move: **[▶ Enter Round 1](#arena-r1)**

---

### Round 1

<a id="arena-r1"></a>
> **File Card:** `IMG_4021_blurry_duplicate.jpg` (8.4 MB)
>
> **Signal:** Duplicate + blurry image
>
> **Risk:** Low

- [👉 Keep](#arena-r1-keep)
- [👈 Delete](#arena-r1-delete)
- [👆 Skip](#arena-r1-skip)

<a id="arena-r1-keep"></a>
<details>
<summary>Reveal result if you picked Keep</summary>

**R1 Keep** -> Clutter survives. **-2** points.  
Next: [Go to Round 2](#arena-r2)

</details>

<a id="arena-r1-delete"></a>
<details>
<summary>Reveal result if you picked Delete</summary>

**R1 Delete** -> Sharp cleanup call. **+3** points.  
Next: [Go to Round 2](#arena-r2)

</details>

<a id="arena-r1-skip"></a>
<details>
<summary>Reveal result if you picked Skip</summary>

**R1 Skip** -> Cautious scan complete. **+1** point.  
Next: [Go to Round 2](#arena-r2)

</details>

---

### Round 2

<a id="arena-r2"></a>
> **File Card:** `tax_receipts_2025.zip` (62 MB)
>
> **Signal:** Legal/finance archive
>
> **Risk:** High

- [👉 Keep](#arena-r2-keep)
- [👈 Delete](#arena-r2-delete)
- [👆 Skip](#arena-r2-skip)

<a id="arena-r2-keep"></a>
<details>
<summary>Reveal result if you picked Keep</summary>

**R2 Keep** -> Correct. Legal docs should stay. **+3** points.  
Next: [Go to Round 3](#arena-r3)

</details>

<a id="arena-r2-delete"></a>
<details>
<summary>Reveal result if you picked Delete</summary>

**R2 Delete** -> High risk decision. **-2** points.  
Next: [Go to Round 3](#arena-r3)

</details>

<a id="arena-r2-skip"></a>
<details>
<summary>Reveal result if you picked Skip</summary>

**R2 Skip** -> Defensive move accepted. **+1** point.  
Next: [Go to Round 3](#arena-r3)

</details>

---

### Round 3

<a id="arena-r3"></a>
> **File Card:** `screen_recording_test_export_v9.mp4` (2.1 GB)
>
> **Signal:** Temporary export candidate
>
> **Risk:** Medium

- [👉 Keep](#arena-r3-keep)
- [👈 Delete](#arena-r3-delete)
- [👆 Skip](#arena-r3-skip)

<a id="arena-r3-keep"></a>
<details>
<summary>Reveal result if you picked Keep</summary>

**R3 Keep** -> Storage pain unlocked. **-2** points.  
Next: [Go to Round 4](#arena-r4)

</details>

<a id="arena-r3-delete"></a>
<details>
<summary>Reveal result if you picked Delete</summary>

**R3 Delete** -> Massive cleanup win. **+3** points.  
Next: [Go to Round 4](#arena-r4)

</details>

<a id="arena-r3-skip"></a>
<details>
<summary>Reveal result if you picked Skip</summary>

**R3 Skip** -> Acceptable caution. **+1** point.  
Next: [Go to Round 4](#arena-r4)

</details>

---

### Round 4

<a id="arena-r4"></a>
> **File Card:** `resume_2023_old_draft.pdf` (0.9 MB)
>
> **Signal:** Old but potentially useful document
>
> **Risk:** Medium

- [👉 Keep](#arena-r4-keep)
- [👈 Delete](#arena-r4-delete)
- [👆 Skip](#arena-r4-skip)

<a id="arena-r4-keep"></a>
<details>
<summary>Reveal result if you picked Keep</summary>

**R4 Keep** -> Not wrong, still useful. **+1** point.  
Next: [Go to Round 5](#arena-r5)

</details>

<a id="arena-r4-delete"></a>
<details>
<summary>Reveal result if you picked Delete</summary>

**R4 Delete** -> Maybe too aggressive. **-2** points.  
Next: [Go to Round 5](#arena-r5)

</details>

<a id="arena-r4-skip"></a>
<details>
<summary>Reveal result if you picked Skip</summary>

**R4 Skip** -> Best strategic move. **+3** points.  
Next: [Go to Round 5](#arena-r5)

</details>

---

### Round 5

<a id="arena-r5"></a>
> **File Card:** `setup_tmp_cache.log` (420 MB)
>
> **Signal:** Temporary cache/log data
>
> **Risk:** Low

- [👉 Keep](#arena-r5-keep)
- [👈 Delete](#arena-r5-delete)
- [👆 Skip](#arena-r5-skip)

<a id="arena-r5-keep"></a>
<details>
<summary>Reveal result if you picked Keep</summary>

**R5 Keep** -> Bloat remains. **-2** points.  
Finish: [Open Final Rank](#arena-rank)

</details>

<a id="arena-r5-delete"></a>
<details>
<summary>Reveal result if you picked Delete</summary>

**R5 Delete** -> Clean final strike. **+3** points.  
Finish: [Open Final Rank](#arena-rank)

</details>

<a id="arena-r5-skip"></a>
<details>
<summary>Reveal result if you picked Skip</summary>

**R5 Skip** -> Safe but slower cleanup. **+1** point.  
Finish: [Open Final Rank](#arena-rank)

</details>

---

### Final Rank

<a id="arena-rank"></a>
Add your score and claim your title:

| Score | Rank | Title |
|------:|------|-------|
| 12 to 15 | 🏆 S Tier | Folder Assassin |
| 7 to 11 | ⚔️ A Tier | Clean-up Knight |
| 2 to 6 | 🧹 B Tier | Organized Human |
| -10 to 1 | 🐢 C Tier | Sentimental Hoarder |

<p align="center">
    <b>[🔁 Play Again](#arena-start)</b> • <b>[⬆ Back To Top](#-swipeclean)</b>
</p>

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
