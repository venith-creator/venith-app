const fs = require('fs');
const path = require('path');

const buildSrc = path.join(__dirname, 'client', 'build');
const buildDest = path.join(__dirname, 'server', 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(buildSrc)) {
  copyRecursive(buildSrc, buildDest);
  console.log(`✅  Copied React build → ${buildDest}`);
} else {
  console.error(`❌  React build folder missing: ${buildSrc}`);
}
