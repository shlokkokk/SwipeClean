import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Plugin to rename .cjs files to .js after build
const renameCjsPlugin = () => ({
  name: 'rename-cjs',
  closeBundle() {
    const distMainPath = path.join(__dirname, 'dist', 'main')
    if (fs.existsSync(distMainPath)) {
      const files = fs.readdirSync(distMainPath)
      files.forEach(file => {
        if (file.endsWith('.cjs')) {
          const oldPath = path.join(distMainPath, file)
          const newPath = path.join(distMainPath, file.replace('.cjs', '.js'))
          if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
            fs.renameSync(oldPath, newPath)
            console.log(`[rename-cjs] ${file} -> ${file.replace('.cjs', '.js')}`)
          }
        }
      })
    }
  }
})

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), renameCjsPlugin()],
    build: {
      lib: {
        entry: path.join(__dirname, 'src/main/main.ts'),
        formats: ['cjs'],
        fileName: () => 'main.js'
      },
      outDir: 'dist/main',
      emptyOutDir: true,
      rollupOptions: {
        external: ['electron', 'better-sqlite3', 'sharp', 'pdf2pic', 'trash']
      }
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
        '@main': path.join(__dirname, 'src/main'),
        '@shared': path.join(__dirname, 'src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin(), renameCjsPlugin()],
    build: {
      lib: {
        entry: path.join(__dirname, 'src/main/preload.ts'),
        formats: ['cjs'],
        fileName: () => 'preload.js'
      },
      outDir: 'dist/main',
      emptyOutDir: false,
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    root: path.join(__dirname, 'src/renderer'),
    build: {
      outDir: path.join(__dirname, 'dist/renderer'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.join(__dirname, 'src/renderer/index.html')
      }
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
        '@renderer': path.join(__dirname, 'src/renderer'),
        '@shared': path.join(__dirname, 'src/shared')
      }
    }
  }
})
