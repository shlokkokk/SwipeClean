# SwipeClean - Quick Start Guide

## ⚠️ IMPORTANT: This is a DESKTOP APP (not a web app!)

SwipeClean is an **Electron desktop application** that runs on Windows, macOS, and Linux. It is NOT a website you open in a browser.

---

## 🚀 How to Run

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run in Development Mode
```bash
npm run dev
```

This will:
1. Start the Vite dev server (for the UI)
2. Launch Electron (the desktop app wrapper)
3. Open a desktop window with SwipeClean

**A window should pop up** - that's the app! Not a browser tab.

---

## 🏗️ Build for Production

### Build Installer for Your Platform:
```bash
npm run dist
```

This creates an installer in the `release/` folder:
- **Windows**: `SwipeClean-1.0.0.exe` - Double-click to install
- **macOS**: `SwipeClean-1.0.0.dmg` - Open and drag to Applications
- **Linux**: `SwipeClean-1.0.0.AppImage` - Make executable and run

---

## ❓ Troubleshooting

### "No electron app entry file found"

**Solution**: Clear and rebuild
```bash
# Delete old builds
rmdir /s /q dist        (Windows)
rm -rf dist             (Mac/Linux)

# Reinstall and rebuild
npm install
npm run dev
```

### "Cannot find module"

**Solution**: Make sure all dependencies are installed
```bash
npm install
npm run postinstall
```

### App opens but shows blank screen

**Solution**: Check if port 5173 is in use
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

Then run `npm run dev` again.

---

## 🎮 How to Use

1. **Click "Select Folder to Clean"** - Choose your Downloads folder
2. **Pick sorting** - Usually "Oldest First" works best
3. **Swipe through files**:
   - 👉 Swipe Right (or press D) = Keep
   - 👈 Swipe Left (or press A) = Delete
   - 👆 Swipe Up (or press W) = Skip
4. **View your stats** at the end!

---

## 📁 What Gets Created

The app stores data in:
- **Windows**: `%APPDATA%/SwipeClean/`
- **macOS**: `~/Library/Application Support/SwipeClean/`
- **Linux**: `~/.config/SwipeClean/`

This includes:
- `swipeclean.db` - Your settings and history
- `previews/` - Cached file previews

---

## 🔧 Development vs Production

| Mode | Command | What happens |
|------|---------|--------------|
| Development | `npm run dev` | Hot reload, dev tools open |
| Production | `npm run dist` | Build installer for distribution |

---

## 💡 Tips

- The app works **offline** - no internet needed
- Files are moved to **system trash** (not permanently deleted)
- Use **keyboard shortcuts** for faster cleaning
- Check **Settings** to customize behavior

---

**Need more help?** See DEPLOYMENT.md for detailed instructions.
