import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      /** Дата публикации (для ленты «Последние статьи» и RSS) */
      pubDate: z.coerce.date().optional(),
      /** Авторы статьи */
      authors: z.array(z.string()).default(['AltaiR Lab']),
      /** Теги для фильтрации и SEO */
      tags: z.array(z.string()).optional(),
    }),
  }),
});

export const collections = { docs };