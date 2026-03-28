# SwipeClean - START HERE

## ⚠️ READ THIS FIRST

**This is a DESKTOP APPLICATION, not a website!**

You CANNOT use this in a web browser. It opens as a desktop window (like VS Code or Discord).

---

## 🚀 Quick Start (Do This Now)

### Step 1: Clean Everything
```bash
# Windows Command Prompt or PowerShell:
cd C:\Users\Admin\OneDrive\projects\SwipeClean\swipeclean
rmdir /s /q dist
rmdir /s /q node_modules
del package-lock.json

# Or PowerShell:
Remove-Item -Recurse -Force dist, node_modules
Remove-Item package-lock.json
```

### Step 2: Install Dependencies
```bash
npm install
```

Wait for this to complete (2-5 minutes).

### Step 3: Run the App
```bash
npm run dev
```

**A DESKTOP WINDOW will open** - that's SwipeClean!

---

## ❓ "But I see a browser tab!"

**IGNORE THE BROWSER TAB!** Close it!

Look for a **separate window** that opened - that's the actual app.

The browser tab is just the dev server running in the background.

---

## ❓ "The buttons don't work!"

**You're looking at the browser tab!** 

The browser CANNOT:
- Access your files
- Open folder dialogs
- Move files to trash

**Only the Electron desktop window can do these things.**

---

## 🖼️ What You Should See

When the app opens, you should see:

```
┌─────────────────────────────────────────────┐
│  SwipeClean                              [X]│
├─────────────────────────────────────────────┤
│                                             │
│           [Sparkle Logo Icon]               │
│                                             │
│         S W I P E C L E A N                 │
│                                             │
│     Clean folders, have fun                 │
│                                             │
│    ┌─────────────────────────┐              │
│    │  Select Folder to Clean │              │
│    └─────────────────────────┘              │
│                                             │
│    Recent Folders                           │
│    ┌─────┐ ┌─────┐ ┌─────┐                 │
│    │ DL  │ │ Doc │ │ Pic │                 │
│    └─────┘ └─────┘ └─────┘                 │
│                                             │
│              [Settings]                     │
│                                             │
└─────────────────────────────────────────────┘
```

This is a **desktop window**, not a browser page.

---

## 🔧 If It Still Doesn't Work

### Problem: "No electron app entry file found"

**Fix**: The build output has wrong extension
```bash
# Check what files were created
dir dist\main\

# You should see:
# main.js
# preload.js

# If you see .cjs files, the config is wrong
# Reinstall and try again:
npm install
npm run dev
```

### Problem: "Cannot find module '@shared/types'"

**Fix**: The path aliases aren't resolving
```bash
# Try building first
npm run build

# Then start
npm start
```

### Problem: "better-sqlite3" errors

**Fix**: Rebuild native modules
```bash
npm run postinstall
npm run dev
```

### Problem: White/blank screen

**Fix**: Check if port 5173 is in use
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Then restart
npm run dev
```

---

## 📋 Commands Reference

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start development mode (hot reload) |
| `npm run build` | Build for production |
| `npm start` | Build and run production version |
| `npm run dist` | Build installer for your platform |
| `npm run postinstall` | Rebuild native modules |

---

## 🏗️ Build for Distribution

To create an installer you can share:

```bash
npm run dist
```

This creates:
- **Windows**: `release/SwipeClean-1.0.0.exe`
- **macOS**: `release/SwipeClean-1.0.0.dmg`
- **Linux**: `release/SwipeClean-1.0.0.AppImage`

---

## 🎮 How to Use the App

1. **Click "Select Folder to Clean"**
   - Choose your Downloads folder or any folder

2. **Pick how to sort files**
   - "Oldest First" is recommended
   - Or choose by size, type, or date range

3. **Swipe through files**
   - 👉 Swipe Right (or press **D**) = **Keep**
   - 👈 Swipe Left (or press **A**) = **Delete** (goes to trash)
   - 👆 Swipe Up (or press **W**) = **Skip**

4. **View your stats**
   - See how much space you freed!

---

## 📁 Files You Should Know About

| File | Purpose |
|------|---------|
| `START_HERE.md` | This file - quick start guide |
| `FIXES.md` | What was fixed and why |
| `QUICKSTART.md` | Detailed quick start |
| `DEPLOYMENT.md` | Full deployment guide |
| `README.md` | Complete documentation |

---

## 💡 Tips

- **Keyboard shortcuts** make it faster: D=Keep, A=Delete, W=Skip
- Files go to **trash** (not permanently deleted)
- Your **history is saved** - see recent folders on the home screen
- **Settings** let you customize behavior

---

## 🆘 Still Stuck?

1. Read `FIXES.md` for common issues
2. Read `DEPLOYMENT.md` for detailed troubleshooting
3. Check the console output for error messages

---

**This is a desktop app. Use the desktop window, not the browser!**
