// Napelem – 9/2023 ÉKM számítási módszer, 1. Függelék 13.2.1, 13.1. táblázat.
import { describe, expect, it } from 'vitest';
import { ErvenytelenBemenet, ReszletesModszerSzukseges, napelemTermeles } from '../src/index.js';

describe('Napelem (13.1)', () => {
  it('MEG-004 MEG-006 4 kWp, déli, 30° → 1080·4 = 4320 kWh/év', () => {
    expect(napelemTermeles(4, 'D', 30)).toBe(4320);
  });

  it('MEG-007 vízszintes napelem tájolásfüggetlen: 942 kWh/kWp', () => {
    expect(napelemTermeles(5, 'K', 0)).toBe(4710);
    expect(napelemTermeles(5, 'D', 0)).toBe(4710);
  });

  it('MEG-006 köztes hajlásszögnél lineáris interpoláció (D-133): DK 35° → (1030 + 1020)/2', () => {
    expect(napelemTermeles(1, 'DK', 35)).toBeCloseTo(1025, 9);
  });

  it('MEG-005 MEG-006 20 kWp felett és északi tájolásnál részletes módszer kell', () => {
    expect(() => napelemTermeles(25, 'D', 30)).toThrow(ReszletesModszerSzukseges);
    expect(() => napelemTermeles(4, 'É', 30)).toThrow(ReszletesModszerSzukseges);
    expect(() => napelemTermeles(0, 'D', 30)).toThrow(ErvenytelenBemenet);
  });
});
