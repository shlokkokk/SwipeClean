const fs = require('fs');
const path = require('path');

const distMainPath = path.join(__dirname, '..', 'dist', 'main');

// Check if dist/main exists
if (!fs.existsSync(distMainPath)) {
  console.log('dist/main does not exist yet');
  process.exit(0);
}

const files = fs.readdirSync(distMainPath);

// Rename .cjs files to .js
files.forEach(file => {
  if (file.endsWith('.cjs')) {
    const oldPath = path.join(distMainPath, file);
    const newPath = path.join(distMainPath, file.replace('.cjs', '.js'));
    
    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${file} -> ${file.replace('.cjs', '.js')}`);
    }
  }
});

console.log('Build fix complete!');
