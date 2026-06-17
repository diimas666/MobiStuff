import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'scripts') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

let fixed = 0;
for (const file of walk(mobileRoot)) {
  let source = fs.readFileSync(file, 'utf8');
  if (!source.includes('useThemedStyles')) continue;
  const next = source.replace(
    /const styles = useThemedStyles/g,
    'const { styles, colors } = useThemedStyles',
  );
  if (next !== source) {
    fs.writeFileSync(file, next);
    fixed += 1;
    console.log('fixed:', path.relative(mobileRoot, file));
  }
}
console.log(`Done. Fixed ${fixed} files.`);
