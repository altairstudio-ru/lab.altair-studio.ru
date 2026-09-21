#!/usr/bin/env node
// Деплой статики dist/ на Beget по SFTP.
// Креды: env SFTP_HOST/SFTP_LOGIN/SFTP_PASS/SFTP_DIR приоритетнее, иначе читаются из SFTP.md.
// Пароль никуда не пишется и не логируется.
// Запуск: node scripts/deploy.mjs [--clean]
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const credsFile = join(root, 'SFTP.md');

const cleanMode = process.argv.includes('--clean');

function parseCreds(text) {
  const get = (key) => {
    const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const m = text.match(re);
    return m ? m[1].trim() : null;
  };
  return { host: get('SFTP'), login: get('LOGIN'), pass: get('PASS'), dir: get('DIR') };
}

const env = {
  host: process.env.SFTP_HOST,
  login: process.env.SFTP_LOGIN,
  pass: process.env.SFTP_PASS ?? process.env.LAB_SFTP_PASS,
  dir: process.env.SFTP_DIR,
};

const file = await readFile(credsFile, 'utf8').then(parseCreds).catch(() => null);

const creds = {
  host: env.host ?? file?.host,
  login: env.login ?? file?.login,
  pass: env.pass ?? file?.pass,
  dir: env.dir ?? file?.dir,
};

if (!creds.host || !creds.login || !creds.pass || !creds.dir) {
  console.error('[deploy] Не удалось получить креды: задайте SFTP_HOST/SFTP_LOGIN/SFTP_PASS/SFTP_DIR или заполните SFTP.md (SFTP/LOGIN/PASS/DIR).');
  process.exit(1);
}

const { default: Client } = await import('ssh2-sftp-client');
const sftp = new Client();

async function localFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await localFiles(p, base)));
    else out.push({ abs: p, rel: relative(base, p).split('\\').join('/') });
  }
  return out;
}

async function rmRemote(sftp, remoteDir) {
  const items = await sftp.list(remoteDir).catch(() => []);
  for (const it of items) {
    const p = `${remoteDir}/${it.name}`;
    if (it.type === 'd') {
      await rmRemote(sftp, p);
      await sftp.rmdir(p).catch(() => {});
    } else {
      await sftp.delete(p).catch(() => {});
    }
  }
}

try {
  await sftp.connect({
    host: creds.host,
    port: 22,
    username: creds.login,
    password: creds.pass,
    readyTimeout: 30000,
  });

  const configuredRoot = creds.dir.replace(/\/+$/, '');

  // Beget chroot'ит SFTP-аккаунт в каталог сайта: если настроенный путь недоступен,
  // работаем с корнем текущего chroot.
  const canUseConfigured = await sftp.list(configuredRoot).then(() => true).catch(() => false);
  const remoteRoot = canUseConfigured ? configuredRoot : '.';
  console.log(`[deploy] Удалённый корень: ${remoteRoot}${canUseConfigured ? ' (из SFTP.md)' : ' (chroot, путь из SFTP.md недоступен)'}`);

  // Placeholder Beget («Новый сайт успешно создан…») удаляем, чтобы отдавался наш index.html.
  const ph = `${remoteRoot}/index.php`;
  const hasPh = await sftp.exists(ph);
  if (hasPh) {
    await sftp.delete(ph);
    console.log('[deploy] Удалён placeholder Beget: index.php');
  }

  await sftp.mkdir(remoteRoot, true);
  console.log(`[deploy] Подключено: ${creds.host} (${creds.login})`);

  if (cleanMode) {
    console.log('[deploy] Режим --clean: очищаю удалённую директорию…');
    await rmRemote(sftp, remoteRoot);
  }

  const files = await localFiles(dist);
  console.log(`[deploy] Файлов к загрузке: ${files.length}`);

  let uploaded = 0;
  for (const f of files) {
    const remotePath = `${remoteRoot}/${f.rel}`;
    const remoteDir = remotePath.slice(0, remotePath.lastIndexOf('/'));
    await sftp.mkdir(remoteDir, true);
    await sftp.put(f.abs, remotePath);
    uploaded++;
    if (uploaded % 25 === 0 || uploaded === files.length) {
      console.log(`[deploy] Загружено ${uploaded}/${files.length}`);
    }
  }

  const remoteList = await sftp.list(remoteRoot);
  console.log(`[deploy] Готово. Файлов в корне на сервере: ${remoteList.length}. URL: https://lab.altair-studio.ru/`);
  await sftp.end();
} catch (err) {
  console.error('[deploy] Ошибка:', err.message);
  process.exit(1);
}