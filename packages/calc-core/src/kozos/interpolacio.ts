import { ErvenytelenBemenet } from '../hibak.js';

/**
 * Lineáris interpoláció egy növekvő x-sorozatú táblázatban. A táblázat tartományán
 * kívül a szélső értéket adja (extrapoláció nincs) – DONTESEK.md D-021.
 */
export function linearisInterpolacio(pontok: readonly (readonly [number, number])[], x: number): number {
  if (pontok.length === 0) throw new ErvenytelenBemenet('Üres interpolációs táblázat.', 'D-021');
  if (!Number.isFinite(x)) throw new ErvenytelenBemenet(`Érvénytelen interpolációs érték: ${x}`, 'D-021');
  for (let i = 1; i < pontok.length; i++) {
    if (pontok[i]![0] <= pontok[i - 1]![0]) {
      throw new ErvenytelenBemenet('Az interpolációs táblázat x-értékei nem szigorúan növekvők.', 'D-021');
    }
  }
  const elso = pontok[0]!;
  const utolso = pontok[pontok.length - 1]!;
  if (x <= elso[0]) return elso[1];
  if (x >= utolso[0]) return utolso[1];
  for (let i = 1; i < pontok.length; i++) {
    const [x1, y1] = pontok[i]!;
    if (x <= x1) {
      const [x0, y0] = pontok[i - 1]!;
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return utolso[1];
}
