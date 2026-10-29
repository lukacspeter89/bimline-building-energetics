// Fűtési rendszer – 9/2023 ÉKM számítási módszer, 1. Függelék 7–8. fejezet. Az elvárt értékek kézzel, a táblázatokból számolva.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  SzamitasiHiba,
  alapteruletTablaErtek,
  fancoilSegedenergia,
  futesiAlrendszer,
  futesiHotermelo,
  hoelosztasVesztesege,
  hofoklepcsoInterpolacio,
  hotarolas,
  kozepHomerseklet,
  levegofutesSzabalyozasiTenyezo,
  szivattyuSegedenergia,
  villamosSzabalyozasiTenyezo,
  vizesSzabalyozasiTenyezo,
} from '../src/index.js';

describe('Közös táblázatkezelés (7. fejezet)', () => {
  it('RA-021 RA-022 köztes alapterületen lineáris interpoláció', () => {
    // 8.1. táblázat, állandó hőmérsékletű kazán: 100 m² → 1,38; 150 m² → 1,33
    expect(alapteruletTablaErtek('modszer/futes#tabla_8_1', 'eps_F_allando', 125).ertek).toBeCloseTo(1.355, 10);
  });

  it('RA-022 a tartományon kívül a szélső érték (D-021)', () => {
    expect(alapteruletTablaErtek('modszer/futes#tabla_8_1', 'eps_F_allando', 50).ertek).toBe(1.38);
    expect(alapteruletTablaErtek('modszer/futes#tabla_8_1', 'eps_F_allando', 20000).ertek).toBe(1.13);
  });

  it('RA-021 a „> 500” sor 500 m² felett állandó (D-118)', () => {
    expect(alapteruletTablaErtek('modszer/futes#tabla_8_8', 'dt_70_55', 500).ertek).toBe(3.9);
    expect(alapteruletTablaErtek('modszer/futes#tabla_8_8', 'dt_70_55', 600).ertek).toBe(3.4);
  });

  it('RA-021 üres cellánál jelölt helyettesítő érték (D-020)', () => {
    // 8.2. táblázat: a kondenzációs oszlop csak 100 m²-nél kitöltött
    const v = alapteruletTablaErtek('modszer/futes#tabla_8_2', 'eps_F_kondenzacios', 150);
    expect(v.ertek).toBe(1.01);
    expect(v.jelzesek[0]).toMatch(/D-020/);
  });

  it('RA-024 hőfoklépcső-interpoláció a közepes hőmérsékletre (D-119)', () => {
    expect(kozepHomerseklet({ elore: 70, vissza: 55 })).toBe(62.5);
    expect(() => kozepHomerseklet({ elore: 40, vissza: 50 })).toThrow(ErvenytelenBemenet);
    const pontok = [
      { h: { elore: 55, vissza: 45 }, ertek: 10 },
      { h: { elore: 35, vissza: 28 }, ertek: 6 },
    ];
    // 31,5 °C → 6; 50 °C → 10; 40 °C → 6 + 4·8,5/18,5
    expect(hofoklepcsoInterpolacio(pontok, { elore: 45, vissza: 35 })).toBeCloseTo(6 + (4 * 8.5) / 18.5, 10);
  });
});

describe('Hőtermelők (8.3)', () => {
  it('FUT-011 FUT-013 ErP kazán: ε = 1/ηs, segédenergia nélkül', () => {
    const e = futesiHotermelo({ tipus: 'erp_kazan', etaS: 0.93 }, 120);
    expect(e.epsF).toBeCloseTo(1 / 0.93, 12);
    expect(e.Wterm).toBe(0);
  });

  it('FUT-014 FUT-015 FUT-016 nem ErP kazán fűtött téren kívül, 125 m²', () => {
    const e = futesiHotermelo({ tipus: 'kazan', kazan: 'allando', elhelyezes: 'futott_teren_kivul' }, 125);
    expect(e.epsF).toBeCloseTo(1.355, 10);
    // W: 0,79 → 0,66 között 0,725 kWh/m²év · 125 m²
    expect(e.Wterm).toBeCloseTo(0.725 * 125, 10);
  });

  it('FUT-017 FUT-018 nem ErP kazán fűtött téren belül, 100 m²', () => {
    const e = futesiHotermelo({ tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: 'futott_terben' }, 100);
    expect(e.epsF).toBe(1.01);
    expect(e.Wterm).toBeCloseTo(79, 10);
    expect(e.jelzesek).toEqual([]);
  });

  it('RA-023 a táblázati segédenergia a fedezett hányaddal csökken', () => {
    const e = futesiHotermelo({ tipus: 'kazan', kazan: 'allando', elhelyezes: 'futott_teren_kivul' }, 100, 0.4);
    expect(e.Wterm).toBeCloseTo(0.79 * 100 * 0.4, 10);
    expect(() => futesiHotermelo({ tipus: 'kazan', kazan: 'allando', elhelyezes: 'futott_terben' }, 100, 1.2)).toThrow(ErvenytelenBemenet);
  });

  it('FUT-019 FUT-020 szilárd tüzelés: pellet 1,10 és 8.4. táblázati segédenergia; faelgázosítónál adat kell', () => {
    const p = futesiHotermelo({ tipus: 'szilard', kazan: 'Pellettüzelésű kazán' }, 100);
    expect(p.epsF).toBe(1.1);
    expect(p.Wterm).toBeGreaterThan(0);
    expect(() => futesiHotermelo({ tipus: 'szilard', kazan: 'Faelgázosító kazán' }, 100)).toThrow(SzamitasiHiba);
    const f = futesiHotermelo({ tipus: 'szilard', kazan: 'Faelgázosító kazán', WtermFajlagos: 0.5 }, 100);
    expect(f.epsF).toBe(1.2);
    expect(f.Wterm).toBe(50);
  });

  it('FUT-026 FUT-028 ErP hőszivattyú: ε = 1/(2,5·ηs), segédenergia nélkül', () => {
    const e = futesiHotermelo({ tipus: 'erp_hoszivattyu', etaS: 1.5 }, 150);
    expect(e.epsF).toBeCloseTo(1 / 3.75, 12);
    expect(e.Wterm).toBe(0);
  });

  it('FUT-029 nem ErP hőszivattyú SCOP-pal', () => {
    expect(futesiHotermelo({ tipus: 'hoszivattyu_scop', scop: 4 }, 150).epsF).toBe(0.25);
  });

  it('FUT-030 FUT-031 nem ErP hőszivattyú 8.5. táblázatból, köztes hőfoklépcsővel', () => {
    expect(futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: { elore: 35, vissza: 28 } }, 150).epsF).toBe(0.3);
    // 45/35 → 40 °C a 31,5 °C (0,30) és 50 °C (0,37) között
    const e = futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: { elore: 45, vissza: 35 } }, 150);
    expect(e.epsF).toBeCloseTo(0.3 + (0.07 * 8.5) / 18.5, 10);
    expect(futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Levegő/levegő' }, 150).epsF).toBe(0.4);
    expect(() => futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Víz/Víz' }, 150)).toThrow(ErvenytelenBemenet);
  });

  it('FUT-032 nem ErP gáz hőszivattyú', () => {
    expect(futesiHotermelo({ tipus: 'gaz_hoszivattyu' }, 150).epsF).toBe(0.58);
  });

  it('FUT-036 FUT-037 távhő: 1,01 és 215 kWh/év hőközpontonként', () => {
    const e = futesiHotermelo({ tipus: 'tavho', hokozpontokSzama: 2 }, 1000, 0.5);
    expect(e.epsF).toBe(1.01);
    expect(e.Wterm).toBe(215);
  });

  it('FUT-038 FUT-039 ErP egyedi fűtés', () => {
    expect(futesiHotermelo({ tipus: 'erp_egyedi', etaS: 0.8, elektromos: false }, 50).epsF).toBeCloseTo(1.25, 12);
    expect(futesiHotermelo({ tipus: 'erp_egyedi', etaS: 0.4, elektromos: true }, 50).epsF).toBeCloseTo(1, 12);
  });

  it('FUT-041 FUT-042 nem ErP egyedi berendezés a 8.7. táblázatból', () => {
    expect(futesiHotermelo({ tipus: 'egyedi', berendezes: 'Kandalló (nyitott, hagyományos)' }, 50).epsF).toBe(4);
    expect(futesiHotermelo({ tipus: 'egyedi', berendezes: 'Elektromos hőtárolós kályha1)' }, 50).Wterm).toBe(0);
  });

  it('RA-009 alulméretezett rendszer nem fedezett hányada: ε = 1', () => {
    expect(futesiHotermelo({ tipus: 'alulmeretezett' }, 50).epsF).toBe(1);
  });
});

describe('Elosztás, szabályozás, tárolás, segédenergia (8.5–8.8)', () => {
  it('FUT-046 FUT-047 hőelosztási veszteség 150 m², 70/55 °C', () => {
    expect(hoelosztasVesztesege('futott_teren_kivul', { elore: 70, vissza: 55 }, 150).ertek).toBeCloseTo(7.7 * 150, 9);
    expect(hoelosztasVesztesege('futott_terben', { elore: 70, vissza: 55 }, 150).ertek).toBeGreaterThan(0);
  });

  it('FUT-048 eltérő hőfoklépcső (80/60 °C) a közepes hőmérsékletre interpolálva', () => {
    // 70 °C a 62,5 °C (7,7) és 80 °C (10,3) között
    const v = hoelosztasVesztesege('futott_teren_kivul', { elore: 80, vissza: 60 }, 150).ertek;
    expect(v).toBeCloseTo((7.7 + (2.6 * 7.5) / 17.5) * 150, 9);
  });

  it('FUT-050 részrendszernél a nettó igény hányadával szorozva', () => {
    expect(hoelosztasVesztesege('futott_teren_kivul', { elore: 70, vissza: 55 }, 600, 0.5).ertek).toBeCloseTo(3.4 * 600 * 0.5, 9);
  });

  it('FUT-052 FUT-053 FUT-054 FUT-055 FUT-056 FUT-062 szabad fűtőfelület, kétcsöves, 12 radiátor', () => {
    const e = vizesSzabalyozasiTenyezo({
      hoelado: 'szabad',
      alap: 'Szabályozás referencia helyiségre (P-szabályozó vagy ismeretlen)',
      korrekcio1: { alcsoport: 'kétcsöves fűtés és modernizált egycsöves fűtés', leiras: '70 °C/55 °C' },
      korrekcio2: 'külsőfali radiátor',
      korrekcio3: 'különálló, képes önálló be-kikapcsolásra (pl. termosztatikus szelep)',
      beszabalyozas: {
        rendszer: 'Kétcsöves rendszer',
        kialakitas: 'fűtőtestenként/fűtőfelületenként statikus beállítás, csoportos beszabályozás nélkül (pl.: radiátor visszatérő szelep)',
        hoeladokSzama: 12,
      },
    });
    // 1,083 + 0,021 + 0,009 − 0,06 + 0,024
    expect(e).toBeCloseTo(1.077, 12);
  });

  it('FUT-061 egycsöves beszabályozás; FUT-062 kétcsövesnél a hőleadók száma kötelező', () => {
    const alap = {
      hoelado: 'szabad' as const,
      alap: 'Szabályozás nélkül vagy központi előremenő hőmérséklet szabályozással, de helyiséghőmérséklet szabályozás nélkül.',
      korrekcio1: { alcsoport: 'egycsöves fűtés (nem felújított)', leiras: '90 °C/70 °C' },
      korrekcio2: 'belsőfali radiátor',
      korrekcio3: 'nincs',
    };
    expect(
      vizesSzabalyozasiTenyezo({ ...alap, beszabalyozas: { rendszer: 'Egycsöves rendszer', kialakitas: 'nincs hidraulikai beszabályozás' } }),
    ).toBeCloseTo(1.149 + 0.048 + 0.039 + 0 + 0.042, 12);
    expect(() =>
      vizesSzabalyozasiTenyezo({ ...alap, beszabalyozas: { rendszer: 'Kétcsöves rendszer', kialakitas: 'nincs hidraulikai beszabályozás' } }),
    ).toThrow(ErvenytelenBemenet);
  });

  it('FUT-063 FUT-064 FUT-065 villamos és közvetlen levegőfűtés szabályozása táblázatból', () => {
    expect(villamosSzabalyozasiTenyezo('Külső fal mellett', 'Közvetlen elektromos fűtés PI-szabályozóval (optimalizációval)')).toBe(1.042);
    expect(() => levegofutesSzabalyozasiTenyezo('nincs ilyen', 'nincs ilyen')).toThrow();
  });

  it('FUT-066 FUT-067 FUT-068 hőtárolás szilárd tüzelésnél ×2,6, segédenergia változatlan', () => {
    const t = hotarolas('futott_terben', { elore: 55, vissza: 45 }, 100, true);
    expect(t.Qtar).toBeCloseTo(0.3 * 2.6 * 100, 10);
    expect(t.Wtar).toBeCloseTo(63, 10);
  });

  it('FUT-069 tárolás részrendszernél a hányaddal', () => {
    const t = hotarolas('futott_teren_kivul', { elore: 35, vissza: 28 }, 100, false, 0.5);
    expect(t.Qtar).toBeCloseTo(1.4 * 100 * 0.5, 10);
    expect(t.Wtar).toBeCloseTo(0.63 * 100 * 0.5, 10);
  });

  it('FUT-071 szivattyú segédenergia', () => {
    expect(szivattyuSegedenergia('fordulatszam_szabalyozott', 'szabad', 20, 100).ertek).toBeCloseTo(169, 10);
    expect(szivattyuSegedenergia('ec_eei_023', 'beagyazott', 7, 150).ertek).toBeCloseTo(135, 10);
    expect(() => szivattyuSegedenergia('allando_fordulatu', 'beagyazott', 20, 100)).toThrow(ErvenytelenBemenet);
  });

  it('FUT-073 fan coil ventilátor segédenergia (D-120)', () => {
    expect(fancoilSegedenergia('Légcsatornázható', 100)).toBeCloseTo(280, 10);
  });
});

describe('Végső energia (8.1–8.3)', () => {
  it('FUT-003 FUT-006 FUT-008 alrendszer végső energiája', () => {
    const e = futesiAlrendszer({ QFnet: 10000, epsSzab: 1.077, Qszall: 1155, Qtar: 0, epsF: 1.355, Wsziv: 169, Wtar: 0, Wterm: 90 });
    expect(e.QFveg).toBeCloseTo((10000 * 1.077 + 1155) * 1.355, 8);
    expect(e.WFveg).toBe(259);
  });

  it('FUT-003 FUT-005 a léghevítés által fedezett rész levonása, negatív érték nélkül', () => {
    const e = futesiAlrendszer({ QFnet: 1000, QFLT: 1500, epsSzab: 1.1, Qszall: 100, Qtar: 0, epsF: 1, Wsziv: 0, Wtar: 0, Wterm: 0 });
    expect(e.QFveg).toBe(100);
    expect(() => futesiAlrendszer({ QFnet: -1, epsSzab: 1, Qszall: 0, Qtar: 0, epsF: 1, Wsziv: 0, Wtar: 0, Wterm: 0 })).toThrow(ErvenytelenBemenet);
  });
});
