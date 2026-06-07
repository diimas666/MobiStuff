import fs from 'fs';
import path from 'path';

const MMA_GRAPHQL = 'https://api.mma.ua/graphql';

const ICON_BY_SLUG = {
  'category-chehli': 'TabletSmartphone',
  'category-zashtita-ekrana': 'ShieldCheck',
  'category-akkumulyatori-i-powerbank': 'BatteryFull',
  'category-avtomobilynaya-tematika': 'CarFront',
  'category-gadzheti': 'Watch',
  'category-zaryadki-i-kabeli': 'Cable',
  'category-kompyyuternaya-periferiya': 'Keyboard',
  'category-kompyyuternaya-mebely': 'Armchair',
  'category-naushniki': 'Headset',
  'category-audio-i-video': 'Speaker',
  'category-poleznie-aksessuari': 'Wrench',
};

function collectSubs(children, acc = []) {
  for (const child of children || []) {
    acc.push({
      title: child.translation.name,
      slug: child.slug,
    });
    if (child.children?.length) {
      collectSubs(child.children, acc);
    }
  }
  return acc;
}

async function fetchCategories() {
  const res = await fetch(MMA_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query {
        siteCategories(filtering: { root: true }) {
          slug
          translation { name }
          children {
            slug
            translation { name }
            children {
              slug
              translation { name }
            }
          }
        }
      }`,
    }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data.siteCategories;
}

function escape(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildFile(roots) {
  const imports = new Set(['Wrench']);

  const items = roots.map((root) => {
    const title = root.translation.name;
    const slug = root.slug;
    const icon = ICON_BY_SLUG[slug] || 'Wrench';
    imports.add(icon);
    const subs = collectSubs(root.children);

    const subLines = subs
      .map(
        (s) => `      {
        title: '${escape(s.title)}',
        slug: '${s.slug}',
        seoTitle: '${escape(s.title)} – ${escape(title)} | MobiStuff',
        seoDescription: 'Купити «${escape(s.title)}» у категорії «${escape(title)}». Актуальний асортимент на MobiStuff.',
      }`
      )
      .join(',\n');

    return `  {
    title: '${escape(title)}',
    slug: '${slug}',
    icon: ${icon},
    seoTitle: 'Купити ${escape(title)} | MobiStuff',
    seoDescription: 'Широкий вибір товарів у категорії «${escape(title)}». Доставка по Україні.',
    subcategories: [
${subLines}
    ],
  }`;
  });

  return `// Автогенерация из MMA — npm run generate-mma-catalog
import {
  ${[...imports].sort().join(',\n  ')},
} from 'lucide-react';

export const catalogCategory = [
${items.join(',\n')}
].map((item) => ({
  ...item,
  subcategories: item.subcategories.map((sub) => ({
    ...sub,
  })),
}));
`;
}

const roots = await fetchCategories();
const content = buildFile(roots);
const out = path.join(process.cwd(), 'data/catalogCategory.ts');
fs.writeFileSync(out, content);
console.log(`✅ Записано ${roots.length} категорий → data/catalogCategory.ts`);
console.log(`   Подкатегорий: ${roots.reduce((n, r) => n + collectSubs(r.children).length, 0)}`);
