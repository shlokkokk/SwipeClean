# SwipeClean 🧹

A gamified file cleanup desktop application that turns boring file organization into a fun Tinder-style swiping experience.

![SwipeClean Preview](https://img.shields.io/badge/SwipeClean-v1.0.0-indigo)
![Electron](https://img.shields.io/badge/Electron-35+-blue)
![React](https://img.shields.io/badge/React-19+-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)

## ✨ Features

- **Tinder-Style Swiping**: Swipe right to keep, left to delete, up to skip
- **File Previews**: See previews for images, PDFs, and documents
- **Smart Sorting**: Sort by date, size, or file type
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Undo System**: Reverse your last actions
- **Session Tracking**: Track your cleanup progress and stats
- **Safe Deletion**: Files moved to system trash (recoverable)
- **Dark Theme**: Beautiful modern dark UI

## 🚀 Tech Stack (2026 Latest)

- **Framework**: Electron 35+ with Vite
- **Frontend**: React 19 + TypeScript 5.8
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Database**: Better-SQLite3
- **Image Processing**: Sharp
- **PDF Previews**: pdf2pic

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 20+ (Download from [nodejs.org](https://nodejs.org))
- **npm** 10+ (comes with Node.js)
- **Git** (optional, for cloning)

### Step 1: Clone or Download

```bash
# If using git
git clone <repository-url>
cd swipeclean

# Or just navigate to the project folder
cd swipeclean
```

### Step 2: Install Dependencies

```bash
npm install
```

> **Note**: This will download all required packages. It may take a few minutes.

### Step 3: Run in Development Mode

```bash
npm run dev
```

This will:
1. Start the Vite development server
2. Launch Electron with hot-reload
3. Open the app window

## 🏗️ Building for Production

### Build for Current Platform

```bash
npm run dist
```

This creates:
- **Windows**: `.exe` installer in `release/`
- **macOS**: `.dmg` installer in `release/`
- **Linux**: `.AppImage` in `release/`

### Platform-Specific Builds

```bash
# Windows only
npm run dist:win

# macOS only
npm run dist:mac

# Linux only
npm run dist:linux
```

### Build Output Location

After building, find your installers in:
```
swipeclean/
├── release/
│   ├── SwipeClean-1.0.0.exe        (Windows)
│   ├── SwipeClean-1.0.0.dmg        (macOS)
│   ├── SwipeClean-1.0.0.AppImage   (Linux)
│   └── ...
```

## 🎮 How to Use

### 1. Select a Folder
- Click "Select Folder to Clean"
- Choose a folder (usually Downloads, Desktop, etc.)

### 2. Choose Sorting
- **Oldest First**: Start with oldest files (recommended)
- **Newest First**: Start with recent files
- **Date Range**: Filter by specific dates
- **Largest First**: Free up space quickly
- **By Type**: Group similar files

### 3. Swipe Through Files
- **Swipe Right** (→) or press **D**: Keep file
- **Swipe Left** (←) or press **A**: Delete file
- **Swipe Up** (↑) or press **W**: Skip file
- **Space**: Open file externally
- **Ctrl+Z**: Undo last action
- **Esc**: Go back

### 4. View Summary
See your cleanup stats and celebrate your achievements!

## ⚙️ Settings

Access settings from the home screen to customize:

- **Confirm Before Delete**: Show confirmation dialog
- **Recursive Scan**: Include subdirectories
- **Show System Files**: Include hidden files
- **Undo History**: Number of actions to remember
- **Preview Cache**: Cache size for file previews

## 🛠️ Troubleshooting

### Common Issues

#### 1. `npm install` fails

**Solution**: Clear npm cache and try again
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. Build fails with native module errors

**Solution**: Rebuild native modules
```bash
npm run postinstall
```

#### 3. App won't start in development

**Solution**: Check if port 5173 is available
```bash
# Kill any process on port 5173
npx kill-port 5173
npm run dev
```

#### 4. Preview not showing for images/PDFs

**Solution**: Clear preview cache in Settings → Clear Preview Cache

#### 5. Permission denied on macOS

**Solution**: Grant permissions in System Preferences → Security & Privacy

### Platform-Specific Notes

#### macOS
- You may need to allow the app in Security settings
- For M1/M2 Macs, the app is built as Universal (works on both Intel and Apple Silicon)

#### Windows
- Windows Defender may flag the app - click "More info" → "Run anyway"
- Requires Windows 10 or later

#### Linux
- May need additional dependencies:
  ```bash
  sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0
  ```

## 📁 Project Structure

```
swipeclean/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   ├── preload.ts     # IPC bridge
│   │   ├── database.ts    # SQLite database
│   │   ├── fileScanner.ts # File scanning logic
│   │   └── previewGenerator.ts # Preview generation
│   ├── renderer/          # React frontend
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS styles
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Renderer entry
│   └── shared/            # Shared types
│       └── types.ts       # TypeScript types
├── previews/              # Preview cache (auto-created)
├── assets/                # Static assets
├── dist/                  # Build output (auto-created)
├── release/               # Installers (auto-created)
├── package.json           # Dependencies & scripts
├── vite.config.ts         # Vite config
├── electron.vite.config.ts # Electron Vite config
└── tsconfig.json          # TypeScript config
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build main process only
npm run build:main

# Build renderer only
npm run build:renderer

# Create installers
npm run dist

# Create Windows installer
npm run dist:win

# Create macOS installer
npm run dist:mac

# Create Linux installer
npm run dist:linux
```

## 📝 Environment Variables

Create a `.env` file in the root for custom configuration:

```env
# Development port
VITE_DEV_SERVER_PORT=5173

# App name
VITE_APP_NAME=SwipeClean
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Credits

- Icons by [Lucide](https://lucide.dev)
- UI powered by [Tailwind CSS](https://tailwindcss.com)
- Animations by [Framer Motion](https://www.framer.com/motion)

## 💬 Support

Having issues? Check the [Troubleshooting](#-troubleshooting) section or create an issue!

---

**Enjoy cleaning your files!** 🎉
