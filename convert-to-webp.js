const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Files to skip (keep as PNG for browser/crawler compatibility)
const SKIP = new Set([
  'images/favicon.png',
  'images/og-image.png',
]);

// Directories to scan
const DIRS = [
  'images',
  'images/covers',
  'images/icons',
  'images/branding',
  'images/branding2',
  'images/services',
];

const ROOT = path.resolve(__dirname);

async function convertDir(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return;

  const entries = fs.readdirSync(fullDir);
  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const rel = path.join(dir, entry).replace(/\\/g, '/');
    if (SKIP.has(rel)) {
      console.log(`  SKIP  ${rel}`);
      continue;
    }

    const src = path.join(fullDir, entry);
    const destName = entry.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const dest = path.join(fullDir, destName);

    if (fs.existsSync(dest)) {
      console.log(`  EXISTS ${rel} -> ${destName}`);
      continue;
    }

    try {
      await sharp(src)
        .webp({ quality: 85, effort: 6 })
        .toFile(dest);
      const srcSize = fs.statSync(src).size;
      const dstSize = fs.statSync(dest).size;
      const saving = Math.round((1 - dstSize / srcSize) * 100);
      console.log(`  OK    ${rel} -> ${destName}  (${saving}% smaller)`);
    } catch (e) {
      console.error(`  ERR   ${rel}: ${e.message}`);
    }
  }
}

(async () => {
  console.log('Converting images to WebP...\n');
  for (const d of DIRS) {
    await convertDir(d);
  }
  console.log('\nDone.');
})();
