// Nettó fűtési és hűtési energiaigény – 9/2023 ÉKM számítási módszer, 1. Függelék 6. fejezet; 2. Függelék.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  HONAPOK,
  ReszletesModszerSzukseges,
  alapertek,
  altalanosSzellozes,
  bSzellKorrekcio,
  bTenyezo,
  belsoHonyereseg,
  direktSzolarisNyereseg,
  direktTranszmisszio,
  ejszakaiTobbletSzellozes,
  evesKulsoHomerseklet,
  folyamatosHovisszanyerosSzellozesF,
  futetlenTerHatarolo,
  gepiFokozat,
  hasznositasiTenyezoF,
  hasznositasiTenyezoH,
  hohiddalKorrigaltU,
  hohidassagBesorolas,
  honapOrak,
  hotaroloKepesseg,
  infiltracio,
  keretaranyAlapertek,
  kulsoHomerseklet,
  nettoEnergiaigeny,
  osszesitettG,
  psiPf,
  sugarzas,
  szakaszosGepiSzellozes,
  szakaszosTermeszetesTag,
  szuksegesLegcsere,
  talajHoatvitel,
  talajonFekvoPadlo,
  termeszetesSzellozes,
  uvegezettTerulet,
  zeta,
  type NettoZonaBemenet,
} from '../src/index.js';

describe('2. függ. 1. éghajlati adatok', () => {
  it('KLI-003, KLI-004 havi és éves külső hőmérséklet (1.1. táblázat)', () => {
    expect(HONAPOK.map(kulsoHomerseklet)).toEqual([2.1, -0.1, 3.5, 10.9, 16.8, 20.8, 21.9, 21.0, 17.8, 8.3, 7.6, -0.1]);
    expect(evesKulsoHomerseklet()).toBe(10.9);
  });

  it('QM-002 a november–március órák összege egyezik a (6.53) Δt = 3624 h értékével', () => {
    const osszeg = [11, 12, 1, 2, 3].reduce((s, m) => s + honapOrak(m as 1), 0);
    expect(osszeg).toBe(alapertek('modszer/netto_energiaigeny#alapertekek_6_fejezet', 'qm_delta_t'));
    expect(HONAPOK.reduce((s, m) => s + honapOrak(m), 0)).toBe(8760);
  });

  it('KLI-023, KLI-024 sugárzás (1.6. táblázat): táblázati értékek; 0° hajlásszögnél a vízszintes sor, tájolástól függetlenül', () => {
    expect(sugarzas('D', 0, 1)).toBe(33.0);
    expect(sugarzas('É', 0, 6)).toBe(183.0);
    expect(sugarzas('É', 30, 1)).toBe(16.9);
  });

  it('KLI-025, D-109 köztes hajlásszög: lineáris interpoláció (É, 15°, január: (33,0 + 16,9)/2)', () => {
    expect(sugarzas('É', 15, 1)).toBeCloseTo((33.0 + 16.9) / 2, 12);
    expect(() => sugarzas('D', 95, 1)).toThrow(ErvenytelenBemenet);
  });
});

describe('6.1 Transzmisszió', () => {
  it('TR-001 [(6.1)] 10 m²·0,2 + 5 m·0,1 + 0,05 = 2,55 W/K', () => {
    expect(direktTranszmisszio({ elemek: [{ A: 10, U: 0.2 }], vonalak: [{ l: 5, psi: 0.1 }], pontok: [{ chi: 0.05 }] })).toBeCloseTo(2.55, 12);
  });

  it('TR-007, TR-008 [(6.3), 6.1. táblázat] külső fal, külső szigetelés, közepesen hőhidas: ζ 0,20; U 0,24 → 0,288', () => {
    const z = zeta({ szerkezet: 'Külső falak', alcsoport: 'külső oldali, vagy szerkezeten belüli megszakítatlan hőszigeteléssel', hohidassag: 'közepesen hőhidas' });
    expect(z).toBe(0.2);
    expect(hohiddalKorrigaltU(0.24, z)).toBeCloseTo(0.288, 12);
    expect(zeta({ szerkezet: 'Külső falak', alcsoport: 'egyéb külső falak', hohidassag: 'erősen hőhidas' })).toBe(0.4);
    expect(zeta({ szerkezet: 'Pincefödémek', alcsoport: 'alsó oldali hőszigeteléssel' })).toBe(0.1);
    expect(zeta({ szerkezet: 'Padlásfödémek' })).toBe(0.1);
  });

  it('TR-011 belső oldali hőszigetelésnél a ζ nem használható', () => {
    expect(() => zeta({ szerkezet: 'Padlásfödémek', belsoOldaliHoszigeteles: true })).toThrow(ReszletesModszerSzukseges);
  });

  it('TR-009 [6.2. táblázat] külső fal: 0,79 gyenge, 0,8 és 1,0 közepes, 1,01 erős', () => {
    expect(hohidassagBesorolas('Külső falak', 0.79)).toBe('gyengén hőhidas');
    expect(hohidassagBesorolas('Külső falak', 0.8)).toBe('közepesen hőhidas');
    expect(hohidassagBesorolas('Külső falak', 1.0)).toBe('közepesen hőhidas');
    expect(hohidassagBesorolas('Külső falak', 1.01)).toBe('erősen hőhidas');
  });

  it('TR-013, TR-015 [(6.4), 6.3. táblázat] padlás: január 0,9, július 0,0; pince július 1,5', () => {
    expect(bTenyezo('Padlástérrel határos födém vagy fal', 1, 20, 26)).toBe(0.9);
    expect(bTenyezo('Padlástérrel határos födém vagy fal', 7, 20, 26)).toBe(0);
    expect(bTenyezo('Zárt, fűtetlen pincével határos födém vagy fal', 7, 20, 26)).toBe(1.5);
    expect(bTenyezo('Naptérrel vagy fűtetlen átriummal határos fal, ha az üvegezett szerkezet', 4, 20, 26, 'kétrétegű')).toBe(0.7);
    expect(futetlenTerHatarolo(0.5, 20)).toBe(10);
  });

  it('TR-016 a táblázati b csak 18–22 / 24–28 °C között alkalmazható', () => {
    expect(() => bTenyezo('Padlástérrel határos födém vagy fal', 1, 16, 26)).toThrow(ReszletesModszerSzukseges);
  });

  it('TR-019, TR-024, TR-025 [(6.5), 6.4. táblázat] Ψ_p,f és a padló hőátvitele', () => {
    const p = psiPf({ lambdaFalazat: 0.5, kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel', labazatiFal: 'Lábazati fal hőszigeteletlen', padloHoszigetelesR: 2.0 });
    expect(p).toBe(0.45);
    // R = 1,0 < 1,25 → „hőszigeteletlen” padló oszlop
    expect(psiPf({ lambdaFalazat: 0.5, kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel', labazatiFal: 'Lábazati fal hőszigeteletlen', padloHoszigetelesR: 1.0 })).toBe(0.25);
    expect(talajHoatvitel(100, 0.3, 40, 0.15)).toBeCloseTo(36, 12);
  });
});

describe('6.2 Szellőzés', () => {
  it('SZ-001, SZ-002 [(6.8)] n 0,5, V 300, teljes idő → 52,5 W/K', () => {
    expect(altalanosSzellozes([{ bSzell: 1, n: 0.5, V: 300, dtK: 744 }], 744)).toBeCloseTo(52.5, 12);
  });
  it('SZ-004 n_szüks = 150/300 = 0,5', () => {
    expect(szuksegesLegcsere(150, 300)).toBe(0.5);
  });
  it('SZ-005, SZ-007 [(6.9)] (20 − 10)/(20 − 0) = 0,5; légfűtésnél tiltott', () => {
    expect(bSzellKorrekcio(20, 10, 0)).toBe(0.5);
    expect(() => bSzellKorrekcio(20, 10, 0, true)).toThrow(ReszletesModszerSzukseges);
  });
  it('SZ-009 [(6.10)] 0,35·(0,5·1 + 0,2)·300 = 73,5 W/K', () => {
    expect(termeszetesSzellozes(0.5, 1, 0.2, 300)).toBeCloseTo(73.5, 12);
  });
  it('SZ-012 … SZ-017 [(6.11)] éjszakai többlet: július 91,875 W/K; október 0; gépi → részletes', () => {
    const f = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
    expect(ejszakaiTobbletSzellozes(7, 2, 300, f)).toBeCloseTo(91.875, 12);
    expect(ejszakaiTobbletSzellozes(10, 2, 300, f)).toBe(0);
    expect(ejszakaiTobbletSzellozes(7, 2, 300, { ...f, automatikusNyitasVagyLako: false })).toBe(0);
    expect(() => ejszakaiTobbletSzellozes(7, 2, 300, { ...f, gepiEjszakaiSzellozes: true })).toThrow(ReszletesModszerSzukseges);
  });
  it('SZ-020 [(6.12)] 0,35·(150·0,2 + 0,2·300) = 31,5 W/K', () => {
    expect(folyamatosHovisszanyerosSzellozesF(150, 0.8, 0.2, 300)).toBeCloseTo(31.5, 12);
  });
  it('SZ-023 … SZ-025 [(6.15), (6.16)] 1000 m³/h, ⅓ üzemidő: 116,67 W/K; η_r 0,8 fűtésnél 23,33; hűtésnél mindig (6.15)', () => {
    expect(gepiFokozat({ vFriss: 1000, dtLT: 240 }, 'F', 720, 20, 0)).toBeCloseTo(116.6666666667, 9);
    expect(gepiFokozat({ vFriss: 1000, dtLT: 240, etaR: 0.8 }, 'F', 720, 20, 0)).toBeCloseTo(23.3333333333, 9);
    expect(gepiFokozat({ vFriss: 1000, dtLT: 240, etaR: 0.8 }, 'H', 720, 20, 0)).toBeCloseTo(116.6666666667, 9);
  });
  it('SZ-026 [(6.17)] Δt_EF = 0 → visszaadja a (6.16)-ot; fagyvédelemmel kézzel számolt érték', () => {
    const alap = gepiFokozat({ vFriss: 1000, dtLT: 240, etaR: 0.8 }, 'F', 720, 20, 0);
    expect(gepiFokozat({ vFriss: 1000, dtLT: 240, etaR: 0.8, fagyvedelem: { dtEF: 0, thetaE4: -6 } }, 'F', 720, 20, 0)).toBeCloseTo(alap, 12);
    // 0,35·1000/720·[((240−72) + 72·24/20)·0,2 + 72·(−4+6)/20] = 0,4861…·[(168+86,4)·0,2 + 7,2] = 0,48611·58,08 = 28,233…
    expect(gepiFokozat({ vFriss: 1000, dtLT: 240, etaR: 0.8, fagyvedelem: { dtEF: 72, thetaE4: -6 } }, 'F', 720, 20, 0)).toBeCloseTo((0.35 * 1000 / 720) * 58.08, 9);
  });
  it('SZ-027 [(6.18)] θ_thcs = θ_e,átlag → (6.16)', () => {
    const alap = gepiFokozat({ vFriss: 500, dtLT: 720, etaR: 0.7 }, 'F', 720, 20, 2);
    expect(gepiFokozat({ vFriss: 500, dtLT: 720, etaR: 0.7, talajkollektorTheta: 2 }, 'F', 720, 20, 2)).toBeCloseTo(alap, 12);
  });
  it('SZ-021, SZ-022, SZ-029 [(6.13), (6.14), (6.19)] szakaszos gépi szellőzés összege', () => {
    const term = szakaszosTermeszetesTag(0.5, 360, 720, 300);
    const filt = infiltracio(0.2, 300);
    expect(term).toBeCloseTo(26.25, 12);
    expect(filt).toBeCloseTo(21, 12);
    expect(szakaszosGepiSzellozes(term, [10, 5], filt)).toBeCloseTo(62.25, 12);
  });
});

describe('6.3–6.6 Nyereségek, hőtároló képesség', () => {
  it('NY-003, NY-004 [(6.23)] keretarány: általában 0,3 → 2 m² ablak 1,4 m² üvegezés', () => {
    expect(keretaranyAlapertek('általában')).toBe(0.3);
    expect(keretaranyAlapertek('kisméretű (< 0,5 m2) nyílászárók')).toBe(0.5);
    expect(uvegezettTerulet(2, 0.3)).toBeCloseTo(1.4, 12);
  });
  it('NY-005, NY-006 [(6.24)] g = 0,9 · 0,6 = 0,54', () => {
    expect(osszesitettG(0.6)).toBeCloseTo(0.54, 12);
  });
  it('NY-002, NY-007, NY-015 [(6.22)] árnyékolásvizsgálat nélkül fűtésnél északi sugárzás, hűtésnél saját tájolás', () => {
    const ablak = [{ Au: 7, gN: 0.5, tajolas: 'D' as const, hajlasszog: 90, gArnyH: 0.1 }];
    expect(direktSzolarisNyereseg(ablak, 1, 'F')).toBeCloseTo(7 * 0.45 * sugarzas('É', 90, 1), 12);
    expect(direktSzolarisNyereseg(ablak, 7, 'H')).toBeCloseTo(7 * 0.45 * 0.1 * sugarzas('D', 90, 7), 12);
    // Megadott árnyékoltsági tényezővel a saját tájolás számít fűtésnél is (6.25)
    expect(direktSzolarisNyereseg([{ ...ablak[0]!, fArny: { F: 0.8, H: 0.8 } }], 1, 'F')).toBeCloseTo(7 * 0.45 * 0.8 * sugarzas('D', 90, 1), 12);
  });
  it('NY-019, NY-022 [(6.26)] 100 m², 5 W/m², 744 h → 372 kWh; negatív q_b megengedett', () => {
    expect(belsoHonyereseg(100, 5, 744)).toBeCloseTo(372, 12);
    expect(belsoHonyereseg(100, -2, 744)).toBeCloseTo(-148.8, 12);
  });
  it('NET-016 [6.5. táblázat] nehéz épület 280 kJ/m²K · 100 m² = 28 000 kJ/K', () => {
    expect(hotaroloKepesseg(3, 100)).toBe(28000);
  });
});

describe('6.7–6.8 Hasznosítási tényezők', () => {
  // a = 1 + τ/15; τ = 30 h → a = 3
  it('NET-019, NET-020 [(6.35), (6.39)] γ 0,5, a 3 → 0,9333', () => {
    expect(hasznositasiTenyezoF(0.5, 1, 30)).toBeCloseTo(0.875 / 0.9375, 12);
  });
  it('NET-021 [(6.36)] γ = 1 → a/(a+1) = 0,75, és folytonos', () => {
    expect(hasznositasiTenyezoF(1, 1, 30)).toBeCloseTo(0.75, 12);
    expect(hasznositasiTenyezoF(1 + 1e-7, 1, 30)).toBeCloseTo(0.75, 6);
  });
  it('NET-022, NET-023 [(6.37), (6.38)] γ ≤ 0', () => {
    expect(hasznositasiTenyezoF(-0.5, 1, 30)).toBe(-2);
    expect(hasznositasiTenyezoF(0, 0, 30)).toBe(1);
  });
  it('NET-028 … NET-031 [(6.43)–(6.46)] hűtés: γ 2, a 3 → 0,9333; γ 1 → 0,75; γ ≤ 0 → 1', () => {
    expect(hasznositasiTenyezoH(2, 30)).toBeCloseTo(0.875 / 0.9375, 12);
    expect(hasznositasiTenyezoH(1, 30)).toBeCloseTo(0.75, 12);
    expect(hasznositasiTenyezoH(-1, 30)).toBe(1);
  });
});

describe('Kézi kontrollpélda: doboz lakóépület (docs/kontrollpeldak/doboz_epulet.py)', () => {
  // A bemenet és a várt értékek a független Python-referenciából (docs/kontrollpeldak/doboz_epulet_eredmeny.txt).
  const fal = hohiddalKorrigaltU(0.24, zeta({ szerkezet: 'Külső falak', alcsoport: 'külső oldali, vagy szerkezeten belüli megszakítatlan hőszigeteléssel', hohidassag: 'gyengén hőhidas' }));
  const teto = hohiddalKorrigaltU(0.17, zeta({ szerkezet: 'Lapostetők', hohidassag: 'gyengén hőhidas' }));
  const hTrD = direktTranszmisszio({ elemek: [{ A: 100, U: fal }, { A: 100, U: teto }, { A: 20, U: 1.1 }] });
  const padlo = talajonFekvoPadlo({ A: 100, P: 40, df: 0.4, rP: 3.0, melyseg: 0 });
  const psi = psiPf({ lambdaFalazat: 0.2, kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel', labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt', padloHoszigetelesR: 3.0 });
  const hTrT = talajHoatvitel(100, padlo.U, 40, psi);
  const hSzF = termeszetesSzellozes(0.5, 1, 0.06, 300);
  const ej = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
  const hSzH = HONAPOK.map((m) => hSzF + ejszakaiTobbletSzellozes(m, 6, 300, ej));
  const ablak = (tajolas: 'D' | 'K' | 'Ny' | 'É', A: number) => ({ Au: uvegezettTerulet(A, 0.3), gN: 0.5, tajolas, hajlasszog: 90 });
  const zona: NettoZonaBemenet = {
    aN: 100, V: 300, thetaIF: 20, thetaIH: 26, cmEff: hotaroloKepesseg(3, 100),
    hTrD: { F: hTrD, H: hTrD }, futetlen: [], hTrT,
    hSzell: { F: hSzF, H: hSzH },
    transzparens: [ablak('D', 10), ablak('K', 4), ablak('Ny', 4), ablak('É', 2)],
    qb: 5, sigmaF: 1, sigmaH: 1,
  };
  const e = nettoEnergiaigeny(zona);

  it('TR-026, SZ-031 bemeneti tényezők: H_trD 68,3; U_T,p 0,219660; H_trT 25,965953; H_szell,F 58,8 W/K', () => {
    expect(hTrD).toBeCloseTo(68.3, 10);
    expect(padlo.U).toBeCloseTo(0.21966, 6);
    expect(hTrT).toBeCloseTo(25.965953, 6);
    expect(hSzF).toBeCloseTo(58.8, 10);
  });

  it('NET-024 … NET-027 havi és éves nettó fűtési igény: 7790,486466 kWh/év, 77,904865 kWh/m²év', () => {
    const varhato = [1417.759, 1426.174, 1218.49, 414.755, 28.867, 0, 0, 0, 23.066, 768.073, 852.064, 1641.238];
    e.havi.forEach((h, i) => expect(h.QFnet).toBeCloseTo(varhato[i]!, 3));
    expect(e.QFnetEv).toBeCloseTo(7790.486466, 5);
    expect(e.qFnet).toBeCloseTo(77.904865, 5);
  });

  it('NET-032 … NET-037 havi és éves nettó hűtési igény: 458,453694 kWh/év', () => {
    const varhato = [0, 0, 0, 30.764, 0, 124.648, 155.806, 147.235, 0, 0, 0, 0];
    e.havi.forEach((h, i) => expect(h.QHnet).toBeCloseTo(varhato[i]!, 3));
    expect(e.QHnetEv).toBeCloseTo(458.453694, 5);
    expect(e.qHnet).toBeCloseTo(4.584537, 6);
  });

  it('NET-025 nullázó szabályok: június–augusztus γ_F > 2 vagy γ_F ≤ 0 → Q_F,net = 0', () => {
    expect(e.havi[5]!.gammaF).toBeGreaterThan(2);
    expect(e.havi[6]!.gammaF).toBeLessThan(0);
    expect(e.havi.slice(5, 8).every((h) => h.QFnet === 0)).toBe(true);
  });

  it('QM-001 … QM-003 [(6.53)] fajlagos hőveszteség-tényező 0,24699178 W/m³K', () => {
    expect(e.qm).toBeCloseTo(0.24699178, 8);
  });

  it('HSZ-001, HSZ-002 [(6.54)–(6.55)] becsült hőszükséglet 5051,176442 W', () => {
    expect(e.QFo).toBeCloseTo(5051.176442, 5);
  });

  it('NET-013, NET-034 szakaszos üzem: σ_F a veszteséget, σ_H a hűtési igényt szorozza', () => {
    const sz = nettoEnergiaigeny({ ...zona, sigmaF: 0.95, sigmaH: 0.8 });
    expect(sz.havi[0]!.Qveszt).toBeCloseTo(0.95 * (e.havi[0]!.QtrF + e.havi[0]!.QszellF), 9);
    expect(sz.havi[6]!.QHnet).toBeCloseTo(0.8 * e.havi[6]!.QHnetFolyt, 9);
  });

  it('TR-015 fűtetlen térrel határos szerkezet havonta váltó b-vel kerül a transzmisszióba', () => {
    const z2 = nettoEnergiaigeny({ ...zona, futetlen: [{ hTrIx: 20, b: { tipus: 'Padlástérrel határos födém vagy fal' } }] });
    expect(z2.havi[0]!.hTrX).toBeCloseTo(18, 12);
    expect(z2.havi[6]!.hTrX).toBe(0);
    expect(z2.QFnetEv).toBeGreaterThan(e.QFnetEv);
  });
});
