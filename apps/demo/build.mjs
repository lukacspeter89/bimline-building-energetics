/* global process, console */
// A bemutató egyetlen HTML-fájlba csomagolása (a számítási mag és a normatív adatok beágyazva).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ide = dirname(fileURLToPath(import.meta.url));
const ki = process.argv[2] ?? join(ide, 'dist', 'bimline-demo.html');
const r = await build({ entryPoints: [join(ide, 'src', 'app.ts')], bundle: true, format: 'iife', minify: true, write: false, target: 'es2020', charset: 'utf8' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
mkdirSync(dirname(ki), { recursive: true });
writeFileSync(ki, readFileSync(join(ide, 'sablon.html'), 'utf8').replace('/*BUNDLE*/', () => js));
console.log(ki, Math.round(js.length / 1024), 'kB');
