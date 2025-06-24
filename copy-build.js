// copy-build.js
import { existsSync } from 'fs';
import { cp, rm, mkdir } from 'fs/promises';
import path from 'path';

const __dirname = path.resolve(); // absolute base directory

const src  = path.join(__dirname, 'client', 'build');
const dest = path.join(__dirname, 'server', 'dist');

async function main() {
  if (!existsSync(src)) {
    console.error('❌  React build folder missing:', src);
    process.exit(1);
  }

  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  await cp(src, dest, { recursive: true });

  console.log('✅  Copied React build →', dest);
}

main().catch(err => {
  console.error('❌  Copy failed:', err);
  process.exit(1);
});
