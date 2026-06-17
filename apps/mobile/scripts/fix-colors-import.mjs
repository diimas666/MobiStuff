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

function themeImportPath(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(mobileRoot, 'constants/theme'));
  const normalized = rel.startsWith('.') ? rel : `./${rel}`;
  return normalized.replace(/\\/g, '/');
}

function fixFile(filePath) {
  let source = fs.readFileSync(filePath, 'utf8');
  if (!source.includes('colors.')) return false;
  if (source.includes("from '../constants/theme'") || source.includes('from "../constants/theme"')) {
    return false;
  }
  if (source.match(/from ['"][^'"]*constants\/theme['"]/)) {
    return false;
  }
  if (source.includes('useSettings')) {
    return false;
  }

  const importLine = `import { colors } from '${themeImportPath(filePath)}';`;
  const lastImport = [...source.matchAll(/^import .+;$/gm)].pop();
  if (!lastImport) return false;

  const insertAt = lastImport.index + lastImport[0].length;
  source = `${source.slice(0, insertAt)}\n${importLine}${source.slice(insertAt)}`;
  fs.writeFileSync(filePath, source);
  return true;
}

let fixed = 0;
for (const file of walk(mobileRoot)) {
  if (fixFile(file)) {
    fixed += 1;
    console.log('fixed:', path.relative(mobileRoot, file));
  }
}
console.log(`Done. Fixed ${fixed} files.`);
