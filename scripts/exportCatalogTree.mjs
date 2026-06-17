import { catalogCategory } from '../data/catalogCategory.ts';
import fs from 'node:fs';
import path from 'node:path';

const tree = catalogCategory.map(category => ({
  title: category.title,
  slug: category.slug,
  subcategories: category.subcategories.map(subcategory => ({
    title: subcategory.title,
    slug: subcategory.slug,
  })),
}));

const targets = [
  'data/catalogTree.json',
  'apps/mobile/data/catalogTree.json',
];

for (const target of targets) {
  fs.writeFileSync(
    path.resolve(target),
    `${JSON.stringify(tree, null, 2)}\n`,
  );
}

console.log(`Exported ${tree.length} categories to ${targets.join(', ')}`);
