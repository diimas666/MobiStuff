import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');

const SKIP = new Set([
  'constants/theme.ts',
  'constants/themePalettes.ts',
  'context/SettingsContext.tsx',
  'components/ThemeApplier.tsx',
  'components/home/ProductCard.tsx',
  'components/product/RelatedProductCard.tsx',
  'components/LoadingState.tsx',
  'components/navigation/BackButton.tsx',
  'components/profile/ProfileMenuItem.tsx',
  'components/settings/SettingThemeRow.tsx',
  'components/settings/SettingsSection.tsx',
  'components/settings/SettingToggleRow.tsx',
  'components/settings/SettingLinkRow.tsx',
  'components/settings/SettingOptionChips.tsx',
  'navigation/TabNavigator.tsx',
  'hooks/useThemedStyles.ts',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'scripts') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function hookImportPath(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(mobileRoot, 'hooks/useThemedStyles'));
  const normalized = rel.startsWith('.') ? rel : `./${rel}`;
  return normalized.replace(/\\/g, '/');
}

function convertFile(filePath) {
  const rel = path.relative(mobileRoot, filePath).replace(/\\/g, '/');
  if (SKIP.has(rel)) return false;

  let source = fs.readFileSync(filePath, 'utf8');
  if (!source.includes('StyleSheet.create') || !source.includes('colors.')) return false;
  if (source.includes('useThemedStyles')) return false;

  const stylesMatch = source.match(
    /\nconst styles = StyleSheet\.create\(\{([\s\S]*?)\}\);\s*$/,
  );
  if (!stylesMatch) return false;

  const stylesBody = stylesMatch[1].replace(/\bcolors\./g, 'c.');
  const stylesFactory = `const styles = useThemedStyles(c => ({${stylesBody}}));`;

  source = source.replace(/\nconst styles = StyleSheet\.create\(\{[\s\S]*?\}\);\s*$/, '\n');

  const themeImportMatch = source.match(
    /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]*constants\/theme)['"];/,
  );
  if (!themeImportMatch) return false;

  const imports = themeImportMatch[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const nonColorImports = imports.filter(i => i !== 'colors' && !i.startsWith('colors '));
  const themePath = themeImportMatch[2];

  if (nonColorImports.length > 0) {
    source = source.replace(
      themeImportMatch[0],
      `import { ${nonColorImports.join(', ')} } from '${themePath}';`,
    );
  } else {
    source = source.replace(`${themeImportMatch[0]}\n`, '');
  }

  const hookImport = `import { useThemedStyles } from '${hookImportPath(filePath)}';`;
  if (!source.includes(hookImport)) {
    const lastImport = [...source.matchAll(/^import .+;$/gm)].pop();
    if (!lastImport) return false;
    const insertAt = lastImport.index + lastImport[0].length;
    source = `${source.slice(0, insertAt)}\n${hookImport}${source.slice(insertAt)}`;
  }

  const fnPatterns = [
    /export function (\w+)\([^)]*\)\s*\{/,
    /export const (\w+) = memo\(function \1\([^)]*\)\s*\{/,
    /function (\w+)\([^)]*\)\s*\{/,
  ];

  let fnMatch = null;
  for (const pattern of fnPatterns) {
    fnMatch = source.match(pattern);
    if (fnMatch) break;
  }
  if (!fnMatch) return false;

  const braceIndex = fnMatch.index + fnMatch[0].length;
  source = `${source.slice(0, braceIndex)}\n  ${stylesFactory}\n${source.slice(braceIndex)}`;

  if (source.includes('StyleSheet.create')) {
    return false;
  }

  fs.writeFileSync(filePath, source);
  return true;
}

const files = walk(mobileRoot);
let converted = 0;

for (const file of files) {
  if (convertFile(file)) {
    converted += 1;
    console.log('converted:', path.relative(mobileRoot, file));
  }
}

console.log(`Done. Converted ${converted} files.`);
