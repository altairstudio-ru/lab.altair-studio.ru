import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET(context) {
  const skip = new Set(['index', 'about', 'contacts']);
  const docs = await getCollection('docs');
  const items = docs
    .filter((d) => !skip.has(d.id.split('/').pop()))
    .filter((d) => d.data.pubDate)
    .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
    .map((d) => ({
      title: d.data.title,
      description: d.data.description ?? '',
      pubDate: d.data.pubDate,
      link: `/${d.id.replace(/\/index$/, '')}/`,
    }));

  return rss({
    title: 'lab.altair-studio.ru — инженерный журнал AltaiR',
    description:
      'Открытый инженерный журнал и playbook студии AltaiR: дизайн-системы, производительность, инженерные разборы, модули платформы и процессы.',
    site: context.site,
    items,
    customData: '<language>ru</language>',
  });
}