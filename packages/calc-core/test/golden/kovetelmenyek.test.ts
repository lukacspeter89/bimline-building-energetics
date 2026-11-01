// Golden G1–G3: követelményértékek és besorolás a WinWatt OÉNY-kivonatával összevetve.
import { describe, expect, it } from 'vitest';
import { arany, besorolas, co2MaxLako, enrenMaxLako, qmMax } from '../../src/index.js';
import { betolt } from './epito.js';

describe.each(['G1', 'G2', 'G3'])('Golden %s – követelmények és besorolás', (eset) => {
  const { vart } = betolt(eset);
  const o = vart.oeny_etanusitas as unknown as Record<string, number | string>;
  const av = o['AV_arany'] as number;

  it('KOV-060 … KOV-066 követelményértékek (közel nulla és jelentős felújítás)', () => {
    expect(qmMax(av, 'kozel_nulla')).toBeCloseTo(o['kovetelmeny_kozel_nulla_q'] as number, 2);
    expect(qmMax(av, 'jelentos_felujitas')).toBeCloseTo(o['kovetelmeny_felujitas_q'] as number, 2);
    expect(enrenMaxLako(av, 'kozel_nulla')).toBeCloseTo(o['kovetelmeny_kozel_nulla_Ep'] as number, 1);
    expect(enrenMaxLako(av, 'jelentos_felujitas')).toBeCloseTo(o['kovetelmeny_felujitas_Ep'] as number, 0);
    expect(co2MaxLako('kozel_nulla')).toBeCloseTo(o['kovetelmeny_kozel_nulla_CO2'] as number, 1);
  });

  // Az OÉNY-kivonat a „2023” utótag nélküli kódot tartalmazza (B), a 176/2008 3. melléklete „B2023” jelölést használ.
  it('TAN-005 besorolás az E_nren és az E_CO2 arányából', () => {
    expect(besorolas(arany(o['Ep_kWh_m2a'] as number, enrenMaxLako(av, 'kozel_nulla')))).toBe(`${o['besorolas_Ep'] as string}2023`);
    expect(besorolas(arany(o['CO2_kg_m2a'] as number, co2MaxLako('kozel_nulla')!))).toBe(`${o['besorolas_CO2'] as string}2023`);
  });
});
