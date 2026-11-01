// A PWA beépített mintái (packages/model/mintak/*.json) a golden bemenetekből készülnek; a teszt őrzi az egyezést.
// Frissítés: MINTAK_IRAS=1 npx vitest run packages/model/test/mintak.test.ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { goldenProjekt } from './goldenAtalakito.js';

const MAPPA = fileURLToPath(new URL('../mintak/', import.meta.url));

describe('Beépített minták', () => {
  for (const eset of ['G1', 'G2', 'G3'] as const) {
    it(`${eset} minta egyezik a golden bemenetből képzett projekttel`, () => {
      const vart = JSON.stringify(goldenProjekt(eset), null, 1) + '\n';
      const ut = `${MAPPA}${eset}.json`;
      if (process.env['MINTAK_IRAS'] || !existsSync(ut)) writeFileSync(ut, vart);
      expect(readFileSync(ut, 'utf8')).toBe(vart);
    });
  }
});
