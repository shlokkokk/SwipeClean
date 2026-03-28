# SwipeClean - Fixes Applied

## Issues Fixed

### 1. "No electron app entry file found" Error
**Problem**: electron-vite was outputting `.cjs` files but Electron was looking for `.js`

**Solution**: Updated `electron.vite.config.ts` to explicitly set output filename to `main.js`

### 2. Import Path Issues
**Problem**: `@shared/types.js` alias wasn't resolving correctly

**Solution**: Changed all imports in `main/` folder to use relative paths `../shared/types.js`

### 3. Simplified npm Scripts
**Problem**: Complex dev script with concurrent processes was failing

**Solution**: Simplified to just `electron-vite dev` which handles everything

---

## How to Run (After Fixes)

### Clean Start (RECOMMENDED)

```bash
# 1. Delete old build files and node_modules
# Windows:
rmdir /s /q dist
rmdir /s /q node_modules
del package-lock.json

# Mac/Linux:
rm -rf dist node_modules package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Run the app
npm run dev
```

---

## What Should Happen

When you run `npm run dev`:

1. **electron-vite** starts up
2. **Vite dev server** starts on http://localhost:5173 (for the UI)
3. **Electron** launches with a desktop window
4. **A window pops up** showing SwipeClean - this is your app!

**NOT a browser tab** - it's a proper desktop application window.

---

## If It Still Doesn't Work

### Check 1: Is the build output correct?

After running `npm run dev`, check if these files exist:
```
swipeclean/
├── dist/
│   ├── main/
│   │   ├── main.js          <-- Should exist
│   │   └── preload.js       <-- Should exist
│   └── renderer/
│       ├── index.html       <-- Should exist
│       └── assets/          <-- Should exist
```

### Check 2: Are native modules built?

```bash
npm run postinstall
```

This rebuilds native modules like better-sqlite3 for your platform.

### Check 3: Try building first

```bash
npm run build
npm start
```

This builds everything first, then launches Electron.

---

## Files Changed

1. `electron.vite.config.ts` - Fixed output filenames and structure
2. `package.json` - Simplified scripts
3. `src/main/main.ts` - Fixed imports
4. `src/main/preload.ts` - Fixed imports
5. `src/main/database.ts` - Fixed imports
6. `src/main/fileScanner.ts` - Fixed imports
7. `src/main/previewGenerator.ts` - Fixed imports
8. Deleted `electron.vite.preload.config.ts` (not needed)

---

## Understanding the Architecture

```
┌─────────────────────────────────────────────┐
│           ELECTRON (Desktop App)            │
├─────────────────────────────────────────────┤
│  Main Process        │  Renderer Process    │
│  (Node.js)           │  (Chromium)          │
│                      │                      │
│  • main.ts           │  • React App         │
│  • database.ts       │  • Swipe UI          │
│  • fileScanner.ts    │  • File previews     │
│  • preload.ts        │                      │
│                      │                      │
│  IPC Calls <─────────┼─────────> IPC API    │
└─────────────────────────────────────────────┘
```

**Main Process**: Has full Node.js access (file system, database, etc.)
**Renderer Process**: The UI you see, communicates with Main via IPC

---

## Common Confusion

### "Why does it open localhost:5173 in my browser?"

It DOESN'T! The Vite server runs on localhost:5173, but **Electron loads it in a desktop window**, not your browser.

If you see a browser tab open, that's just the dev server - close it and look for the Electron window.

### "The buttons don't work in the browser"

**DON'T USE THE BROWSER!** Use the Electron desktop window that opens.

The browser version won't work because:
- It doesn't have access to Node.js APIs
- It can't access your file system
- It can't move files to trash

**This is a DESKTOP APP, not a website!**

---

## Need More Help?

See:
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `README.md` - Full project documentation
