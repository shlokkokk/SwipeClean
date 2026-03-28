# SwipeClean - Deployment Guide

This guide will walk you through deploying and running SwipeClean on your system.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the App](#running-the-app)
5. [Building for Production](#building-for-production)
6. [Platform-Specific Instructions](#platform-specific-instructions)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

If you just want to run the app quickly:

```bash
# 1. Navigate to the project folder
cd swipeclean

# 2. Install dependencies
npm install

# 3. Run the app
npm run dev
```

---

## Prerequisites

### Required Software

1. **Node.js** (version 20 or higher)
   - Download from: https://nodejs.org
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com

### System Requirements

| Platform | Minimum Version | Architecture |
|----------|----------------|--------------|
| Windows  | Windows 10     | x64          |
| macOS    | macOS 11+      | Intel/Apple Silicon |
| Linux    | Ubuntu 20.04+  | x64          |

---

## Installation

### Step 1: Extract/Navigate to Project

If you received this as a zip file, extract it first:

```bash
# Windows (PowerShell)
Expand-Archive -Path swipeclean.zip -DestinationPath swipeclean
cd swipeclean

# macOS/Linux
cd swipeclean
```

### Step 2: Install Dependencies

```bash
npm install
```

This will download all required packages. It may take 2-5 minutes depending on your internet speed.

**What gets installed:**
- Electron (desktop app framework)
- React (UI library)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Better-SQLite3 (database)
- Sharp (image processing)
- And more...

---

## Running the App

### Development Mode (Recommended for testing)

```bash
npm run dev
```

This will:
1. Start the development server
2. Launch Electron
3. Open the SwipeClean window
4. Enable hot-reload (changes update automatically)

### Production Mode (Test the built app)

```bash
# First, build the app
npm run build

# Then run the built version
npm run preview
```

---

## Building for Production

### Build for Your Current Platform

```bash
npm run dist
```

This creates an installer in the `release/` folder:
- **Windows**: `SwipeClean-1.0.0.exe`
- **macOS**: `SwipeClean-1.0.0.dmg`
- **Linux**: `SwipeClean-1.0.0.AppImage`

### Build for Specific Platforms

```bash
# Windows only
npm run dist:win

# macOS only
npm run dist:mac

# Linux only
npm run dist:linux
```

### Build Output Location

After building, installers are located at:

```
swipeclean/
└── release/
    ├── SwipeClean-1.0.0.exe          (Windows installer)
    ├── SwipeClean-1.0.0.dmg          (macOS installer)
    ├── SwipeClean-1.0.0.AppImage     (Linux portable)
    ├── SwipeClean-1.0.0.deb          (Linux Debian package)
    └── ...
```

---

## Platform-Specific Instructions

### Windows

#### Building on Windows

1. Open PowerShell or Command Prompt as Administrator
2. Navigate to the project folder
3. Run the build commands

```powershell
cd swipeclean
npm install
npm run dist:win
```

#### Running the Installer

1. Go to `release/` folder
2. Double-click `SwipeClean-1.0.0.exe`
3. Follow the installation wizard
4. Launch SwipeClean from Start Menu or Desktop

#### Windows Defender

If Windows Defender shows a warning:
1. Click "More info"
2. Click "Run anyway"
3. The app is safe - it's just not signed with a commercial certificate

### macOS

#### Building on macOS

```bash
cd swipeclean
npm install
npm run dist:mac
```

#### Running the Installer

1. Open `release/SwipeClean-1.0.0.dmg`
2. Drag SwipeClean to Applications folder
3. Launch from Applications

#### Security Permissions (Important!)

macOS may block the app. To fix:

**Method 1: System Preferences**
1. Go to System Preferences → Security & Privacy
2. Click "Open Anyway" next to SwipeClean
3. Click "Open" in the dialog

**Method 2: Terminal**
```bash
# Remove the quarantine attribute
xattr -dr com.apple.quarantine /Applications/SwipeClean.app
```

**Method 3: Right-click**
1. Right-click on SwipeClean app
2. Select "Open"
3. Click "Open" in the dialog

#### Apple Silicon (M1/M2/M3)

The app is built as a Universal binary and works on both Intel and Apple Silicon Macs.

### Linux

#### Building on Linux

```bash
cd swipeclean
npm install
npm run dist:linux
```

#### Running the AppImage

```bash
# Make it executable
chmod +x release/SwipeClean-1.0.0.AppImage

# Run it
./release/SwipeClean-1.0.0.AppImage
```

#### Installing .deb Package (Debian/Ubuntu)

```bash
sudo dpkg -i release/swipeclean_1.0.0_amd64.deb
sudo apt-get install -f  # Fix any dependency issues
```

#### Required Dependencies

If the app doesn't start, install these:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  libgtk-3-0 \
  libnotify4 \
  libnss3 \
  libxss1 \
  libxtst6 \
  xdg-utils \
  libatspi2.0-0 \
  libuuid1 \
  libsecret-1-0 \
  libappindicator3-1

# Fedora
sudo dnf install \
  gtk3 \
  libnotify \
  nss \
  libXScrnSaver \
  libXtst \
  xdg-utils \
  at-spi2-core \
  libuuid \
  libsecret
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: `npm install` fails with permission errors

**Solution**: Use a Node version manager or fix permissions

```bash
# Option 1: Use npx (recommended)
npx npm install

# Option 2: Change npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install

# Option 3: Use sudo (not recommended)
sudo npm install --unsafe-perm
```

#### Issue 2: Native module compilation fails

**Solution**: Install build tools

```bash
# Windows
npm install --global windows-build-tools

# macOS
xcode-select --install

# Linux (Ubuntu/Debian)
sudo apt-get install build-essential python

# Then rebuild
npm run postinstall
```

#### Issue 3: App shows blank screen

**Solution**: Check if development server is running

```bash
# Kill any existing processes
npx kill-port 5173

# Clear cache and restart
rm -rf dist node_modules/.vite
npm run dev
```

#### Issue 4: Preview images not loading

**Solution**: Clear preview cache

1. Open Settings in the app
2. Click "Clear Preview Cache"
3. Restart the app

Or manually:
```bash
# Delete preview cache folder
rm -rf ~/Library/Application\ Support/SwipeClean/previews  # macOS
rm -rf ~/.config/SwipeClean/previews                        # Linux
rmdir /s /q "%APPDATA%\SwipeClean\previews"                # Windows
```

#### Issue 5: Database errors

**Solution**: Reset the database

```bash
# Delete database file
rm ~/Library/Application\ Support/SwipeClean/swipeclean.db  # macOS
rm ~/.config/SwipeClean/swipeclean.db                       # Linux
del "%APPDATA%\SwipeClean\swipeclean.db"                   # Windows
```

#### Issue 6: Build fails with "out of memory"

**Solution**: Increase Node memory limit

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Issue 7: Electron won't start on Linux

**Solution**: Check for missing dependencies

```bash
# Check what's missing
ldd release/SwipeClean-1.0.0.AppImage

# Install missing libraries based on output
```

### Getting Help

If you're still having issues:

1. Check the console output for error messages
2. Look at the logs in:
   - macOS: `~/Library/Logs/SwipeClean/`
   - Linux: `~/.config/SwipeClean/logs/`
   - Windows: `%APPDATA%\SwipeClean\logs\`

3. Run with debug mode:
   ```bash
   DEBUG=* npm run dev
   ```

---

## Updating the App

To update to a new version:

```bash
# 1. Pull latest changes (if using git)
git pull

# 2. Update dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Rebuild
npm run dist
```

---

## Uninstalling

### Windows
1. Go to Settings → Apps
2. Find SwipeClean
3. Click Uninstall

### macOS
```bash
# Remove app
rm -rf /Applications/SwipeClean.app

# Remove data
rm -rf ~/Library/Application\ Support/SwipeClean
rm -rf ~/Library/Preferences/com.swipeclean.app.plist
```

### Linux
```bash
# If installed via .deb
sudo apt-get remove swipeclean

# If using AppImage, just delete the file
rm ~/Applications/SwipeClean-1.0.0.AppImage

# Remove data
rm -rf ~/.config/SwipeClean
```

---

## Development Tips

### Enable Debug Mode

Add this to your `.env` file:
```
DEBUG=true
NODE_ENV=development
```

### View Logs

```bash
# macOS
tail -f ~/Library/Logs/SwipeClean/main.log

# Linux
tail -f ~/.config/SwipeClean/logs/main.log

# Windows
Get-Content "$env:APPDATA\SwipeClean\logs\main.log" -Wait
```

### Hot Reload Not Working?

Press `Ctrl+R` (or `Cmd+R` on Mac) to reload the window.

---

**That's it! Enjoy using SwipeClean!** 🎉

For more information, see the main [README.md](README.md).
