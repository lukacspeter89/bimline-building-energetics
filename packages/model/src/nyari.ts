// Projekt → nyári hőterhelés helyiségenként és egyidejűen az épületre (D-150, egyszerűsített óránkénti mérleg,
// nem VDI 2078). Csak a külső levegővel határos szerkezetek; a szellőzés a helyiség minimális légárama (B.7).
import { minimalisLegcsere, sorKeres, szamMezo, nyariHoterheles, type NyhElem, type NyhOra, type TablaHivatkozas } from '@bimline/calc-core';
import { alapHoterhelesBeallitas, javasoltNMin } from './hoterheles.js';
import { hataroloU, nyilaszaroU } from './szamitas.js';
import type { Projekt } from './projekt.js';

/** A nyári méretezési állapot alapértéke: 38 °C, 45 % (Péter, D-149); belül 26 °C (2. függ. 2.1. táblázat θ_i,H). */
export function alapNyari(): { thetaEcsucs: number; rhE: number; thetaI: number; rhI?: number } {
  const lako = sorKeres(PROFIL, (s) => s['funkcio'] === 'Lakóépület egésze*');
  return { thetaEcsucs: 38, rhE: 45, thetaI: szamMezo(lako, 'theta_i_H', PROFIL) };
}
const PROFIL: TablaHivatkozas = 'modszer/profilok#tabla_f2_2_1';

export interface NyariHelyisegEredmeny {
  azon: string;
  nev: string;
  szint: string;
  A: number;
  csucs: NyhOra;
  latens: number;
  fajlagos: number;
  orai: NyhOra[];
  belsoMegadva: boolean;
}

export interface NyariEredmeny {
  helyisegek: NyariHelyisegEredmeny[];
  /** Egyidejű épület-csúcs: az órai érzékelhető összegek maximuma. */
  epulet: { ora: number; ertek: number };
  jelzesek: string[];
}

export function nyariProjekt(p: Projekt): NyariEredmeny {
  const be = p.hoterheles ?? alapHoterhelesBeallitas();
  const ny = be.nyari ?? alapNyari();
  const tipus = new Map(p.nyilaszarok.map((t) => [t.azon, t]));
  const jelzesek: string[] = [];
  const helyisegek: NyariHelyisegEredmeny[] = p.helyisegek.map((h) => {
    const elemek: NyhElem[] = [];
    for (const b of h.hatarolok) {
      if (b.tuloldal.fajta !== 'külső') continue;
      const hajl = b.hajlasszog ?? 90;
      const nyA = b.nyilasok.reduce((s, n) => s + n.szelesseg * n.magassag * n.db, 0);
      const opak = b.felulet - nyA;
      if (opak > 0) elemek.push({ A: opak, U: hataroloU(p, b), hajlasszog: hajl, ...(b.tajolas ? { tajolas: b.tajolas } : {}) });
      for (const n of b.nyilasok) {
        const t = tipus.get(n.nyilaszaroAzon)!;
        const { U, Au } = nyilaszaroU(t, n.szelesseg, n.magassag);
        const A = n.szelesseg * n.magassag * n.db;
        elemek.push({
          A,
          U,
          hajlasszog: hajl,
          ...(b.tajolas ? { tajolas: b.tajolas } : {}),
          ...(t.fajta === 'ablak' && t.osszetevok ? { atlatszo: { Au: Au * n.db, gN: t.osszetevok.g, fArny: h.hoterheles?.nyariArnyek ?? 1 } } : {}),
        });
      }
    }
    const V = h.alapterulet * h.belmagassag;
    const qV = minimalisLegcsere(h.hoterheles?.nMinTipus ?? javasoltNMin(p, h)) * V;
    const belsoMegadva = h.hoterheles?.nyariBelso !== undefined;
    const r = nyariHoterheles({
      elemek,
      thetaI: ny.thetaI,
      qV,
      belso: (h.hoterheles?.nyariBelso ?? 0) * h.alapterulet,
      belsoLatens: h.hoterheles?.nyariLatens ?? 0,
      thetaEcsucs: ny.thetaEcsucs,
      rhE: ny.rhE,
      ...(ny.rhI !== undefined ? { rhI: ny.rhI } : {}),
    });
    return { azon: h.azon, nev: h.nev, szint: h.szint, A: h.alapterulet, csucs: r.csucs, latens: r.csucsLatens, fajlagos: h.alapterulet > 0 ? r.csucs.erzekelheto / h.alapterulet : 0, orai: r.orai, belsoMegadva };
  });
  if (helyisegek.some((x) => !x.belsoMegadva)) jelzesek.push('Néhány helyiségnél nincs megadva belső hőterhelés (személyek, világítás, gépek): ott 0-val számol.');
  if (ny.rhI === undefined) jelzesek.push('Belső páratartalom nélkül a szellőzés látens terhelése nem számít.');
  let epulet = { ora: 0, ertek: -Infinity };
  for (let o = 0; o < 24; o++) {
    const ossz = helyisegek.reduce((s, x) => s + x.orai[o]!.erzekelheto, 0);
    if (ossz > epulet.ertek) epulet = { ora: o, ertek: ossz };
  }
  return { helyisegek, epulet, jelzesek };
}
