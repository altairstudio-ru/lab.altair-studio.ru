// Инъекция OG-картинки (og:image / twitter:image) в статику после сборки.
// Текстовые OG-теги (og:title / og:description / og:url) Starlight генерирует сам,
// поэтому скрипт добавляет только image-теги, если их ещё нет.
// Запуск: node scripts/inject-og.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist', import.meta.url));
const IMG = 'https://lab.altair-studio.ru/og-banner.png';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = await walk(root);
let count = 0;

for (const file of files) {
  if (extname(file) !== '.html') continue;
  let html = await readFile(file, 'utf8');
  if (html.includes('property="og:image"')) continue;

  const tags = [
    '<meta property="og:image" content="' + IMG + '" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:type" content="image/png" />',
    '<meta name="twitter:image" content="' + IMG + '" />',
  ].join('\n');

  const idx = html.indexOf('</head>');
  if (idx === -1) continue;
  html = html.slice(0, idx) + tags + '\n' + html.slice(idx);
  await writeFile(file, html, 'utf8');
  count++;
  console.log(`[inject-og] ${file.replace(root + sep, '')} +og:image`);
}

console.log(`[inject-og] Обработано HTML: ${count}`);