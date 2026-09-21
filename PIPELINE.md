# Pipeline: lab.altair-studio.ru

Статус оркестрации (обновляется по ходу).

## Todo
- [x] Проверка окружения (Node, npm, сеть, SFTP-инструменты)
- [x] Скаффолд проекта Astro + Starlight
- [x] Токены Modern Tech (Slate) + шрифты Inter / JetBrains Mono
- [x] Component Overrides: Header (монограмма A + возврат на altair-studio.ru), Hero (blueprint-сетка)
- [x] Структура контента: 5 колонок + «О лаборатории» + контакты + главная
- [x] Стартовые статьи (5 шт, русский, MDX с Callouts/таблицами/кодом)
- [x] SEO: sitemap, RSS, OG-теги, мета-описания
- [x] Сборка и локальная проверка (build + preview)
- [x] Деплой на Beget (SFTP, ssh2-sftp-client)
- [x] Верификация файлов на сервере + итоговый отчёт

## Приведение к канону Modern Tech (2026-09-21, сделано)
- Сверка с эталоном: активирована тема «3. Modern Tech» в живом переключателе на altair-studio.ru/themes; канон — **Digital Blue без Cyan** (accent #3B82F6, вторичный #60A5FA, текст #FFFFFF/#CBD5E1/#94A3B8, сетка rgba(255,255,255,.05))
- Удалён Cyan #38BDF8 из всех компонентов: sidebar-hover, Header (точка монограммы, ховер «← altair-studio.ru»), тэги карточек разделов/статей
- Кнопка primary (ранее градиент #3B82F6→#38BDF8) → сплошной Digital Blue #3B82F6, блит #60A5FA, скругление 10px→6px (как rounded-sm канона)
- Текст #F8FAFC → #FFFFFF (канон text-main); blueprint-сетка фона rgba(148,163,184,…) → rgba(255,255,255,.05), в hero — тоже
- Hero переделан под эталон: чип-бейдж с пульсатором («AltaiR Lab / инженерный журнал студии»), extrabold-заголовок (800, tracking-tight, leading 1.12), метрики-постамент 4× (5 колонок · 100/100 PageSpeed · 0.4 с · 1–2 недели) с mono-цифрами и чипами
- Коммит `8566240`, CI-деплой успешен; прод проверен (og:image на месте, cyan страниц нет)

## Исправления при доводке (2026-09-21)
- Starlight 0.42: `social: {}` убран; autogenerate-группы сайдбара переведены на новый синтаксис `{ label, items: [{ autogenerate }] }`
- Callouts (`:::{note}`/`:::{tip}`) перенесены из MDX в `.md` (в Starlight директивы работают только в Markdown); в `index.mdx` калл-аут заменён на блок-цитату
- Удалён дубликат `src/pages/404.astro` (коллизия со встроенной страницей Starlight)
- `scripts/deploy.mjs`: `ssh2-sftp-client` v12 — импорт через `.default`; целевой путь — корень chroot Beget (путь из SFTP.md недоступен); удаляется placeholder `index.php`
- Текстовые OG-теги (og:title/description/url) генерирует сам Starlight; `inject-og.mjs` теперь добавляет только og:image/twitter:image

## Что осталось у заказчика
- Ничего критичного: сайт работает по HTTPS, CI-деплой настроен

## HTTPS выдан и работает (2026-09-21)
- Beget выпустил wildcard-сертификат Let's Encrypt `*.altair-studio.ru` (CN altair-studio.ru), выдан 2026-09-21, действует до 2026-12-20 (автообновление — за панелью)
- Проверено: https://lab.altair-studio.ru/ → 200, og-banner.png / rss.xml / sitemap-index.xml → 200; canonical и og:url уже https (site в astro.config.mjs изначально https)
- Захардкоженных «http://lab.altair-studio.ru» в коде нет

## GitHub-репозиторий и CI (2026-09-21, сделано)
- Репозиторий: `https://github.com/altairstudio-ru/lab.altair-studio.ru` (публичный)
- Первый коммит `0707128` (31 файл), ветка `main`, LF через `.gitattributes`
- `SFTP.md` в `.gitignore` (содержит пароль); в CI креды — GitHub Secrets: `SFTP_HOST`, `SFTP_LOGIN`, `SFTP_PASS`, `SFTP_DIR`
- `scripts/deploy.mjs`: креды теперь env-приоритетнее (`SFTP_HOST/SFTP_LOGIN/SFTP_PASS/SFTP_DIR`), иначе из `SFTP.md` (`LAB_SFTP_PASS` — обратная совместимость)
- `.github/workflows/deploy.yml`: push в `main` → npm ci → build → inject:og → деплой по SFTP (concurrency + workflow_dispatch)
- Первый запуск — успех за 1м21с; прод проверен после CI-деплоя (200, og:image OK)
- Локальный `npm run release` остаётся запасным путём деплоя

## OG-картинка (2026-09-21, сделано)
- `public/og-banner.png` — 1200×630, диз. стиль Modern Tech (Slate): blueprint-сетка, свечения Digital Blue/Cyan, монограмма «A», заголовок «Лаборатория AltaiR», линия «инженерный журнал», статы PageSpeed 100/100 · CWV ✓ · TTFB ≈0.4s
- Источник для перегенерации: `tools/og/og-preview.html` (рендер → скриншот; контент строго в 630px, html/body overflow hidden)
- `scripts/inject-og.mjs` переписан: Starlight уже даёт текстовые OG-теги, скрипт добавляет только og:image/og:image:width|height|type и twitter:image (9 страниц)
- Задеплоено; проверено: https://lab.altair-studio.ru/og-banner.png (200, 1200×630), og:image и twitter:image на всех страницах

## Решения
- Тема: Modern Tech (Slate) — переопределение токенов Starlight в `src/styles/theme.css`
- Starlight: Pagefind поиск, Expressive Code, TOC, MDX — из коробки
- Деплой: `scripts/deploy.mjs` (ssh2-sftp-client), креды из SFTP.md, в `dist/`