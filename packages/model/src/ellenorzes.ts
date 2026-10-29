// A projekt adatainak ellenőrzése a számítás előtt: hiányzó, ellentmondó vagy forrás nélküli adatok listája.
import { szamitasiMelyseg } from '@bimline/calc-core';
import type { Projekt } from './projekt.js';

export interface Hiany {
  sulyossag: 'hiba' | 'figyelmeztetés';
  /** Ember által olvasható hely (pl. „Nappali › Külső fal (D)”). */
  hely: string;
  uzenet: string;
  /** Az érintett elem azonosítója (a felület ide ugorhat). */
  azon?: string;
}

const pozitiv = (x: unknown): boolean => typeof x === 'number' && Number.isFinite(x) && x > 0;

export function ellenoriz(p: Projekt): Hiany[] {
  const h: Hiany[] = [];
  const hiba = (hely: string, uzenet: string, azon?: string): void => void h.push({ sulyossag: 'hiba', hely, uzenet, ...(azon ? { azon } : {}) });
  const figy = (hely: string, uzenet: string, azon?: string): void => void h.push({ sulyossag: 'figyelmeztetés', hely, uzenet, ...(azon ? { azon } : {}) });

  const anyagok = new Map(p.anyagok.map((a) => [a.azon, a]));
  const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
  const ny = new Map(p.nyilaszarok.map((n) => [n.azon, n]));

  for (const a of p.anyagok) {
    if (!pozitiv(a.lambda)) hiba(`Anyag: ${a.nev}`, 'A hővezetési tényező hiányzik vagy nem pozitív.', a.azon);
    if (a.forras.tipus === 'feltevés') figy(`Anyag: ${a.nev}`, `Feltételezett érték: ${a.forras.indoklas}`, a.azon);
  }
  for (const r of p.retegrendek) {
    if (r.retegek.length === 0) hiba(`Rétegrend: ${r.nev}`, 'Nincs rétege.', r.azon);
    for (const [i, x] of r.retegek.entries()) {
      if (!anyagok.has(x.anyagAzon)) hiba(`Rétegrend: ${r.nev}`, `A(z) ${i + 1}. réteg anyaga nincs meg.`, r.azon);
      if (!pozitiv(x.d)) hiba(`Rétegrend: ${r.nev}`, `A(z) ${i + 1}. réteg vastagsága nem pozitív.`, r.azon);
    }
  }
  for (const t of p.nyilaszarok) {
    if (t.fajta === 'ablak' && !t.osszetevok) hiba(`Nyílászáró: ${t.nev}`, 'Ablaknál az üvegezés és a keret adatai szükségesek.', t.azon);
    if (t.fajta === 'ajto' && !pozitiv(t.U)) hiba(`Nyílászáró: ${t.nev}`, 'Az ajtó U-értéke hiányzik (terv nélkül 1,4 W/m²K).', t.azon);
    if (t.forras.tipus === 'feltevés') figy(`Nyílászáró: ${t.nev}`, `Feltételezett érték: ${t.forras.indoklas}`, t.azon);
  }

  if (p.helyisegek.length === 0) hiba('Helyiségek', 'Legalább egy fűtött helyiség kell.');
  let falVan = false;
  for (const hs of p.helyisegek) {
    if (!pozitiv(hs.alapterulet)) hiba(hs.nev, 'Az alapterület hiányzik.', hs.azon);
    if (!pozitiv(hs.belmagassag)) hiba(hs.nev, 'A belmagasság hiányzik.', hs.azon);
    for (const b of hs.hatarolok) {
      const r = rr.get(b.retegrendAzon);
      const hely = `${hs.nev} › ${r?.nev ?? 'ismeretlen szerkezet'}${b.tajolas ? ` (${b.tajolas})` : ''}`;
      if (!r) {
        hiba(hely, 'A határoló rétegrendje nincs meg.', b.azon);
        continue;
      }
      if (r.szerkezet === 'homlokzati_fal') falVan = true;
      if (!pozitiv(b.felulet)) hiba(hely, 'A felület hiányzik.', b.azon);
      let nyA = 0;
      for (const n of b.nyilasok) {
        const t = ny.get(n.nyilaszaroAzon);
        if (!t) hiba(hely, 'Egy nyílás típusa nincs meg.', b.azon);
        if (!pozitiv(n.szelesseg) || !pozitiv(n.magassag) || !pozitiv(n.db)) hiba(hely, 'Egy nyílás mérete vagy darabszáma hiányzik.', b.azon);
        else nyA += n.szelesseg * n.magassag * n.db;
        if (t?.fajta === 'ablak' && b.tuloldal.fajta === 'külső' && !b.tajolas) hiba(hely, 'Ablakos külső határolónál a tájolás szükséges (szoláris nyereség).', b.azon);
      }
      if (nyA > b.felulet + 1e-9) hiba(hely, `A nyílások (${nyA.toFixed(2).replace('.', ',')} m²) nagyobbak a határolónál (${b.felulet.toFixed(2).replace('.', ',')} m²).`, b.azon);
      if (r.szerkezet === 'talajon_fekvo_padlo') {
        if (b.tuloldal.fajta !== 'talaj') hiba(hely, 'Talajon fekvő padló túloldala a talaj.', b.azon);
        if (!pozitiv(b.kitettKerulet)) hiba(hely, 'A talajon fekvő padló kitett kerülete szükséges (4.20).', b.azon);
        // ±0,5 m-en belül z = 0 (HT-096); negatív: terepszint feletti padló.
        const z = Number.isFinite(b.melyseg) ? szamitasiMelyseg(b.melyseg ?? 0) : 0;
        if (z < 0) {
          const lf = b.labazatiFalRetegrendAzon === undefined ? undefined : p.retegrendek.find((x) => x.azon === b.labazatiFalRetegrendAzon);
          if (!lf) hiba(hely, 'Terepszint feletti padlónál (4.4.3) a lábazati fal rétegrendje szükséges.', b.azon);
          if (b.felulet > 250) hiba(hely, 'Terepszint feletti padlóra a (4.24) csak 250 m²-ig alkalmazható; nagyobb padlónál MSZ EN ISO 13370 (HT-098).', b.azon);
        }
        if (z > 0) {
          const fal = b.pinceFalRetegrendAzon === undefined ? undefined : p.retegrendek.find((x) => x.azon === b.pinceFalRetegrendAzon);
          if (!fal) hiba(hely, 'Fűtött pincénél (z > 0,5 m) a talajjal érintkező pincefal rétegrendje szükséges (4.4.4).', b.azon);
          else if (fal.szerkezet !== 'talajjal_erintkezo_fal') hiba(hely, `A pincefal rétegrendje (${fal.nev}) nem „talajjal érintkező fal” típusú.`, b.azon);
        }
      }
      if (r.szerkezet === 'talajjal_erintkezo_fal') {
        hiba(hely, 'A talajjal érintkező pincefal nem önálló határoló: a pincepadlónál hivatkozz rá (felülete z·P, 6.6).', b.azon);
      } else if (b.tuloldal.fajta === 'talaj' && r.szerkezet !== 'talajon_fekvo_padlo') {
        hiba(hely, 'A talajjal érintkező pincefalat a pincepadlónál add meg (mélység és pincefal-rétegrend); felülete z·P (6.6).', b.azon);
      }
    }
  }
  if (!falVan) figy('Épület', 'Nincs homlokzati fal; a padló Ψ_p,f-je és a falvastagság nem határozható meg.');
  if (!p.epulet.hohidKorrekcio) figy('Épület', 'A csatlakozási hőhidak korrekciója ki van kapcsolva (csak összevetéshez).');
  return h;
}
