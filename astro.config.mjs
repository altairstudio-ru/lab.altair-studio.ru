// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lab.altair-studio.ru',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'lab.altair-studio.ru',
      description:
        'Открытый инженерный журнал и playbook студии AltaiR: дизайн-системы, производительность, инженерные разборы, модули платформы и процессы.',
      logo: {
        src: './src/assets/monogram.svg',
        alt: 'AltaiR Lab — монограмма A',
        replacesTitle: true,
      },
      editLink: { enabled: false },
      lastUpdated: true,
      pagination: true,
      locales: {
        root: { label: 'Русский', lang: 'ru' },
      },
      components: {
        Header: './src/components/Header.astro',
        Hero: './src/components/Hero.astro',
        PageFrame: './src/components/PageFrame.astro',
        Page: './src/components/Page.astro',
        TwoColumnContent: './src/components/TwoColumnContent.astro',
        Footer: './src/components/Footer.astro',
      },
      customCss: ['./src/styles/theme.css'],
      sidebar: [
        {
          label: 'Лаборатория',
          items: [
            { label: 'О лаборатории', link: '/about' },
            { label: 'Контакты', link: '/contacts' },
          ],
        },
        {
          label: 'Система',
          items: [{ autogenerate: { directory: 'system', collapsed: false } }],
        },
        {
          label: 'Инженерия',
          items: [{ autogenerate: { directory: 'engineering' } }],
        },
        {
          label: 'Кейсы-разборы',
          items: [{ autogenerate: { directory: 'cases' } }],
        },
        {
          label: 'Модули платформы',
          items: [{ autogenerate: { directory: 'modules' } }],
        },
        {
          label: 'Playbook студии',
          items: [{ autogenerate: { directory: 'playbook' } }],
        },
      ],
    }),
    sitemap(),
  ],
});