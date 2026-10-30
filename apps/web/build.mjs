/* global process, console */
// A PWA építése esbuild-del.
//   node build.mjs              → dist/ (hosztoláshoz: index.html, app.js, app.css, sw.js, manifest, ikon)
//   node build.mjs --egyfajlos <kimenet.html>  → egyetlen HTML (előnézet, pl. Artifact; szolgáltatás-munkás nélkül)
//   node build.mjs --serve      → fejlesztői kiszolgáló a dist/ fölött
import { build, context } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ide = dirname(fileURLToPath(import.meta.url));
const dist = join(ide, 'dist');
const opciok = {
  entryPoints: [join(ide, 'src', 'main.tsx')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  charset: 'utf8',
  jsx: 'automatic',
  jsxImportSource: 'preact',
  legalComments: 'none',
};
const verzio = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

if (process.argv.includes('--egyfajlos')) {
  const ki = process.argv[process.argv.indexOf('--egyfajlos') + 1];
  const r = await build({ ...opciok, write: false });
  const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const css = readFileSync(join(ide, 'src', 'app.css'), 'utf8');
  const ikon = `data:image/svg+xml;base64,${readFileSync(join(ide, 'public', 'ikon.svg')).toString('base64')}`;
  const html = `<title>BIMLine energetika</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="icon" href="${ikon}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<style>${css}</style>
<div id="app"></div>
<script>document.documentElement.dataset.egyfajlos = '1';${js}</script>
`;
  mkdirSync(dirname(ki), { recursive: true });
  writeFileSync(ki, html);
  console.log(ki, Math.round(html.length / 1024), 'kB');
} else {
  mkdirSync(dist, { recursive: true });
  cpSync(join(ide, 'public'), dist, { recursive: true });
  cpSync(join(ide, 'src', 'app.css'), join(dist, 'app.css'));
  cpSync(join(ide, 'src', 'index.html'), join(dist, 'index.html'));
  writeFileSync(join(dist, 'sw.js'), readFileSync(join(ide, 'public', 'sw.js'), 'utf8').replace('__VERZIO__', verzio));
  if (process.argv.includes('--serve')) {
    const ctx = await context({ ...opciok, minify: false, outfile: join(dist, 'app.js') });
    await ctx.watch();
    const { host, port } = await ctx.serve({ servedir: dist, port: 5173 });
    console.log(`http://${host}:${port}`);
  } else {
    await build({ ...opciok, outfile: join(dist, 'app.js') });
    console.log(dist);
  }
}
