// Használati melegvíz – 9/2023 ÉKM számítási módszer, 1. Függelék 9. fejezet. Az elvárt értékek kézzel, a táblázatokból számolva.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  ReszletesModszerSzukseges,
  SzamitasiHiba,
  cirkulaciosSegedenergia,
  hmvElosztasiVesztesege,
  hmvHotermelo,
  hmvRendszer,
  hmvTarolasiVesztesege,
  kollektorMaxTermeles,
  kollektorTeljesitmenyTenyezo,
  lakoHmvNettoIgeny,
  napkollektorosHmv,
  szolarSzivattyuSegedenergia,
} from '../src/index.js';

describe('Nettó HMV igény (9.1)', () => {
  it('HMV-001 HMV-002 HMV-003 lakóépület kötelező fajlagos értéke', () => {
    expect(lakoHmvNettoIgeny('Családi ház*', 100)).toBe(2500);
    expect(lakoHmvNettoIgeny('Egyéb lakóépület*', 100)).toBe(3000);
    expect(() => lakoHmvNettoIgeny('Családi ház*', 0)).toThrow(ErvenytelenBemenet);
  });
});

describe('HMV hőtermelők (9.3)', () => {
  it('HMV-026 HMV-027 ErP nem elektromos: ε = 1/ηs, segédenergia nélkül', () => {
    const e = hmvHotermelo({ tipus: 'erp', etaS: 0.8 }, 100);
    expect(e.epsHMV).toBeCloseTo(1.25, 12);
    expect(e.Wterm).toBe(0);
  });

  it('HMV-035 HMV-036 ErP elektromos: ε = 1/(2,5·ηs) (D-123)', () => {
    expect(hmvHotermelo({ tipus: 'erp_elektromos', etaS: 1.2 }, 100).epsHMV).toBeCloseTo(1 / 3, 12);
  });

  it('HMV-028 HMV-030 kondenzációs kazán 180 m²: lineáris interpoláció (D-122)', () => {
    const e = hmvHotermelo({ tipus: 'kazan', kazan: 'kondenzacios' }, 180);
    // 150 m² → 1,15; 200 m² → 1,14
    expect(e.epsHMV).toBeCloseTo(1.144, 10);
    // „más kazánok” segédenergia: 0,24 → 0,21
    expect(e.Wterm).toBeCloseTo(0.222 * 180, 9);
  });

  it('HMV-029 kombikazán ÁF/KT besorolás a térfogat szerint', () => {
    expect(hmvHotermelo({ tipus: 'kazan', kazan: 'kombi', terfogatL: 1 }, 100).epsHMV).toBe(1.27);
    const kt = hmvHotermelo({ tipus: 'kazan', kazan: 'kombi', terfogatL: 5 }, 100);
    expect(kt.epsHMV).toBe(1.41);
    expect(kt.Wterm).toBeCloseTo(20, 10);
    expect(hmvHotermelo({ tipus: 'kazan', kazan: 'kondenzacios_kombi', terfogatL: 5 }, 100).epsHMV).toBe(1.36);
    expect(() => hmvHotermelo({ tipus: 'kazan', kazan: 'kombi', terfogatL: 2 }, 100)).toThrow(SzamitasiHiba);
    expect(() => hmvHotermelo({ tipus: 'kazan', kazan: 'kombi', terfogatL: 12 }, 100)).toThrow(SzamitasiHiba);
    expect(() => hmvHotermelo({ tipus: 'kazan', kazan: 'kombi' }, 100)).toThrow(ErvenytelenBemenet);
  });

  it('HMV-031 kombikazán 500 m² felett: jelölt helyettesítő érték (D-020)', () => {
    const e = hmvHotermelo({ tipus: 'kazan', kazan: 'kombi', terfogatL: 1 }, 750);
    expect(e.jelzesek.some((j) => j.startsWith('D-020'))).toBe(true);
  });

  it('HMV-032 HMV-033 pellet kazán 150 m²', () => {
    const e = hmvHotermelo({ tipus: 'szilard', kazan: 'Pellettüzelésű kazán' }, 150);
    expect(e.epsHMV).toBe(1.2);
    expect(e.Wterm).toBeCloseTo(276, 9);
    expect(hmvHotermelo({ tipus: 'szilard', kazan: 'Faelgázosító kazán' }, 100).Wterm).toBeCloseTo(19, 9);
  });

  it('HMV-037 nem ErP elektromos készülék', () => {
    expect(hmvHotermelo({ tipus: 'elektromos', csoport: 'Hőszivattyú HMV készítésre', rendszer: 'Levegő' }, 100).epsHMV).toBe(0.45);
    expect(hmvHotermelo({ tipus: 'elektromos', csoport: 'Elektromos fűtőpatron' }, 100).epsHMV).toBe(1);
  });

  it('HMV-040 egyéb készülék', () => {
    const e = hmvHotermelo({ tipus: 'egyeb', rendszer: 'Átfolyós gáz-vízmelegítő' }, 100);
    expect(e.epsHMV).toBe(1.3);
    expect(e.Wterm).toBe(0);
  });

  it('HMV-041 HMV-042 távhő', () => {
    const e = hmvHotermelo({ tipus: 'tavho', hokozpontokSzama: 1 }, 400);
    expect(e.epsHMV).toBe(1.01);
    expect(e.Wterm).toBe(265);
  });
});

describe('Tárolás, elosztás, szivattyúk (9.4–9.6)', () => {
  it('HMV-044 HMV-045 HMV-046 tárolási veszteség a nettó igény százalékában', () => {
    expect(hmvTarolasiVesztesege('indirekt', 'futott_terben', 100, 2500).ertek).toBeCloseTo(600, 9);
    expect(hmvTarolasiVesztesege('indirekt', 'futott_terben', 600, 2500).ertek).toBeCloseTo(125, 9);
    expect(hmvTarolasiVesztesege('gaz_bojler', 'futott_teren_kivul', 100, 1000).ertek).toBeCloseTo(970, 9);
  });

  it('HMV-047 tároló nélkül nincs tárolási veszteség (D-125)', () => {
    expect(hmvTarolasiVesztesege(null, 'futott_terben', 100, 2500).ertek).toBe(0);
  });

  it('HMV-050 HMV-051 elosztási veszteség', () => {
    expect(hmvElosztasiVesztesege(true, 'futott_terben', 100, 2500).ertek).toBeCloseTo(600, 9);
    expect(hmvElosztasiVesztesege(false, 'futott_terben', 80, 2000).ertek).toBeCloseTo(200, 9);
    const v = hmvElosztasiVesztesege(false, 'futott_teren_kivul', 150, 1000);
    expect(v.ertek).toBeCloseTo(130, 9);
    expect(v.jelzesek[0]).toMatch(/D-020/);
  });

  it('HMV-053 HMV-055 cirkulációs szivattyú (D-126)', () => {
    expect(cirkulaciosSegedenergia(0.2, 100).ertek).toBeCloseTo(106, 9);
    expect(cirkulaciosSegedenergia(0.15, 100).ertek).toBeCloseTo(98, 9);
    expect(cirkulaciosSegedenergia(null, 100).ertek).toBeCloseTo(114, 9);
    expect(cirkulaciosSegedenergia(false, 100).ertek).toBe(0);
  });

  it('HMV-056 szolárköri szivattyú (9.13)', () => {
    expect(szolarSzivattyuSegedenergia(4)).toBe(66);
  });
});

describe('Napkollektor, egyszerűsített módszer (9.2.1.1)', () => {
  it('HMV-015 HMV-016 teljesítménycsökkentő tényező (9.7)', () => {
    expect(kollektorTeljesitmenyTenyezo(0, 0)).toBeCloseTo(0.821, 12);
    expect(kollektorTeljesitmenyTenyezo(45, 0)).toBeCloseTo(-1.17e-4 * 2025 + 9.11e-3 * 45 + 0.821, 12);
    // kelet felé fordítva csökken
    expect(kollektorTeljesitmenyTenyezo(45, -90)).toBeLessThan(kollektorTeljesitmenyTenyezo(45, 0));
    expect(() => kollektorTeljesitmenyTenyezo(45, 120)).toThrow(ErvenytelenBemenet);
  });

  it('HMV-012 HMV-013 HMV-014 Q_koll,max kétirányú interpolációval, tartományon kívül részletes módszer (D-127)', () => {
    expect(kollektorMaxTermeles('sik', 1.5, 40)).toBe(725);
    // 1,5 m²: 725 → 779 (40 → 50 m²); 2 m²: 844 → 944
    expect(kollektorMaxTermeles('sik', 1.75, 45)).toBeCloseTo((752 + 894) / 2, 9);
    expect(kollektorMaxTermeles('vakuumcsoves', 2, 100)).toBe(1426);
    expect(() => kollektorMaxTermeles('sik', 12, 100)).toThrow(ReszletesModszerSzukseges);
    expect(() => kollektorMaxTermeles('sik', 2, 350)).toThrow(ReszletesModszerSzukseges);
  });

  it('HMV-008 HMV-009 HMV-010 HMV-011 HMV-018 napkollektoros HMV végső energia', () => {
    const k = { kollektor: 'sik' as const, AkollBrutto: 2, alfaM: 45, gammaM: 0, VtarL: 200, lakoepulet: true };
    const b = { QHMVnet: 2500, Qszall: 600, Qtar: 600, eps2: 1.144, aRszr: 100 };
    const e = napkollektorosHmv(b, k);
    const kt = -1.17e-4 * 2025 + 9.11e-3 * 45 + 0.821;
    expect(e.Qkoll).toBeCloseTo(1142 * kt, 9);
    expect(e.QHMVveg2).toBeCloseTo(3700 * 1.144 - 1142 * kt * 1.144, 9);
    expect(() => napkollektorosHmv(b, { ...k, VtarL: 90 })).toThrow(ReszletesModszerSzukseges);
    expect(() => napkollektorosHmv(b, { ...k, lakoepulet: false })).toThrow(ReszletesModszerSzukseges);
  });

  it('HMV-018 a másik hőtermelő végső energiája nem negatív (D-128)', () => {
    const e = napkollektorosHmv(
      { QHMVnet: 500, Qszall: 0, Qtar: 0, eps2: 1, aRszr: 300 },
      { kollektor: 'vakuumcsoves', AkollBrutto: 10, alfaM: 45, gammaM: 0, VtarL: 1000, lakoepulet: true },
    );
    expect(e.QHMVveg2).toBe(0);
    expect(e.jelzesek[0]).toMatch(/D-128/);
  });
});

describe('HMV végső energia (9.1–9.3)', () => {
  it('HMV-004 HMV-006 HMV-007 rendszer végső és segédenergiája', () => {
    const e = hmvRendszer({ QHMVnet: 2500, Qszall: 600, Qtar: 600, epsHMV: 1.144, Wcirk: 106, Wszol: 66, Wterm: 39.96 });
    expect(e.QHMVveg).toBeCloseTo(3700 * 1.144, 9);
    expect(e.WHMVveg).toBeCloseTo(211.96, 9);
    expect(() => hmvRendszer({ QHMVnet: -1, Qszall: 0, Qtar: 0, epsHMV: 1, Wcirk: 0, Wterm: 0 })).toThrow(ErvenytelenBemenet);
  });
});
