// A tests/golden/inputs/Gx.json (WinWatt-független bemenet) átírása a projekt-adatmodellbe.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Tajolas } from '@bimline/calc-core';
import { MODELL_VERZIO, type Hatarolo, type Projekt, type Retegrend, type SzerkezetTipus } from '../src/index.js';

const GYOKER = fileURLToPath(new URL('../../../tests/golden/', import.meta.url));

interface G {
  id: string;
  title: string;
  rooms: {
    name: string;
    area: number;
    height: number;
    walls: { side: 'N' | 'E' | 'S' | 'W'; A: number }[];
    windows: Partial<Record<'N' | 'E' | 'S' | 'W', [number, number, number][]>>;
    door: ['N' | 'E' | 'S' | 'W', number, number] | null;
    roof?: { panel: string; A: number };
    floor?: { panel: string; A: number; P: number };
    attic?: { panel: string; A: number };
    basement?: { panel: string; A: number };
    garage_wall?: { panel: string; A: number };
  }[];
  heated_area: number;
  systems: { heating: { gen: { CkType: number }[] }; dhw: { gen: { CkType: number }[] }; pv?: { kWp: number; compass: number; gradient: number }; airing?: { n: number; eta: number; dp: number; fan_eff: number }; cooling?: unknown };
  materials_used: Record<string, { lambda: number; rho: number; c_kJkgK: number }>;
  panels: Record<string, { code: number; layers: { name: string; d_cm: number }[] }>;
  window: { Ug: number; g: number; Uf: number; frame_mm: number };
  door: { U: number };
}

const OLDAL: Record<'N' | 'E' | 'S' | 'W', Tajolas> = { N: 'É', E: 'K', S: 'D', W: 'Ny' };
const KOD: Record<number, SzerkezetTipus> = { 0: 'homlokzati_fal', 3: 'lapos_teto', 4: 'padlasfodem', 5: 'also_zarofodem_futetlen_felett', 18: 'futott_futetlen_kozotti_fal', 26: 'talajon_fekvo_padlo' };
const tesztForras = { tipus: 'feltevés' as const, indoklas: 'golden tesztbemenet (Péter, 2026-10-29), nem termékadat' };

export function goldenProjekt(eset: 'G1' | 'G2' | 'G3'): Projekt {
  const g = JSON.parse(readFileSync(`${GYOKER}inputs/${eset}.json`, 'utf8')) as G;
  const anyagAzon = (nev: string): string => `a-${nev}`;
  const retegrendek: Retegrend[] = Object.entries(g.panels)
    .filter(([, p]) => KOD[p.code])
    .map(([nev, p]) => ({ azon: `r-${nev}`, nev, szerkezet: KOD[p.code]!, retegek: p.layers.map((l) => ({ anyagAzon: anyagAzon(l.name), d: l.d_cm / 100 })) }));
  const hp = g.systems.heating.gen[0]!.CkType === 12;
  const hmvHp = g.systems.dhw.gen[0]!.CkType === 23;
  return {
    verzio: MODELL_VERZIO,
    azon: `golden-${eset}`,
    nev: g.title,
    modositva: '2026-10-29T00:00:00.000Z',
    adatok: { cim: '8060 Mór, Teszt utca 1.', helyrajziSzam: '0000/1', megrendelo: 'Golden teszt', megjegyzes: 'WinWatt fecske 9.58 golden eset (tests/golden).' },
    epulet: {
      rendeltetes: 'Családi ház*',
      ujEpulet: true,
      cmKategoria: 3,
      nFilt: 0.06,
      szakaszosFutes: false,
      labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt',
      kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel',
      hohidassag: 'erősen hőhidas',
      hohidKorrekcio: false,
    },
    anyagok: Object.entries(g.materials_used).map(([nev, a]) => ({ azon: anyagAzon(nev), nev, lambda: a.lambda, rho: a.rho, c: a.c_kJkgK * 1000, forras: tesztForras })),
    retegrendek,
    nyilaszarok: [
      { azon: 'ny-ablak', nev: 'Ablak', fajta: 'ablak', osszetevok: { Ug: g.window.Ug, g: g.window.g, Uf: g.window.Uf, keretSzelesseg: g.window.frame_mm / 1000, psiG: 0 }, forras: tesztForras },
      { azon: 'ny-ajto', nev: 'Bejárati ajtó', fajta: 'ajto', U: g.door.U, forras: { tipus: 'jogszabaly', hivatkozas: '9/2023 ÉKM 1. melléklet 1.1. 16. sor (terv nélkül)' } },
    ],
    helyisegek: g.rooms.map((r, i) => {
      const hatarolok: Hatarolo[] = r.walls.map((w) => ({
        azon: `h-${i}-${w.side}`,
        retegrendAzon: 'r-R1./ Külső fal',
        tuloldal: { fajta: 'külső' },
        tajolas: OLDAL[w.side],
        hajlasszog: 90,
        felulet: w.A,
        nyilasok: [
          ...(r.windows[w.side] ?? []).map(([x, y, db]) => ({ nyilaszaroAzon: 'ny-ablak', szelesseg: x, magassag: y, db })),
          ...(r.door && r.door[0] === w.side ? [{ nyilaszaroAzon: 'ny-ajto', szelesseg: r.door[1], magassag: r.door[2], db: 1 }] : []),
        ],
      }));
      if (r.roof) hatarolok.push({ azon: `h-${i}-teto`, retegrendAzon: `r-${r.roof.panel}`, tuloldal: { fajta: 'külső' }, hajlasszog: 0, felulet: r.roof.A, nyilasok: [] });
      if (r.attic) hatarolok.push({ azon: `h-${i}-padlas`, retegrendAzon: `r-${r.attic.panel}`, tuloldal: { fajta: 'fűtetlen', ter: 'Padlástérrel határos födém vagy fal' }, hajlasszog: 0, felulet: r.attic.A, nyilasok: [] });
      if (r.basement) hatarolok.push({ azon: `h-${i}-pince`, retegrendAzon: `r-${r.basement.panel}`, tuloldal: { fajta: 'fűtetlen', ter: 'Zárt, fűtetlen pincével határos födém vagy fal' }, hajlasszog: 0, felulet: r.basement.A, nyilasok: [] });
      if (r.garage_wall) hatarolok.push({ azon: `h-${i}-garazs`, retegrendAzon: `r-${r.garage_wall.panel}`, tuloldal: { fajta: 'fűtetlen', ter: 'Zárt, fűtetlen garázzsal határos födém vagy fal' }, hajlasszog: 90, felulet: r.garage_wall.A, nyilasok: [] });
      if (r.floor) hatarolok.push({ azon: `h-${i}-padlo`, retegrendAzon: `r-${r.floor.panel}`, tuloldal: { fajta: 'talaj' }, hajlasszog: 0, felulet: r.floor.A, nyilasok: [], kitettKerulet: r.floor.P });
      return { azon: `hs-${i}`, nev: r.name, szint: String(i), alapterulet: r.area, belmagassag: r.height, hatarolok };
    }),
    rendszerek: {
      futes: {
        hotermelo: hp ? { tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: { elore: 35, vissza: 28 } } : { tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: 'futott_terben' },
        hordozo: hp ? 'villamos' : 'fosszilis_gaz',
        hoelado: hp ? 'beagyazott' : 'szabad',
        hofoklepcso: hp ? { elore: 35, vissza: 28 } : { elore: 55, vissza: 45 },
        szabalyozas: hp
          ? {
              hoelado: 'beagyazott',
              alap: 'Szabályozás referencia helyiségre, kétpontos szabályozó (0,5 K hiszterézis alatt), P-, PI-, PID-szabályozó\nKözponti előremenő hőmérséklet szabályozás helyiségenkénti hőmérséklet szabályozással',
              korrekcio1: { alcsoport: 'Padlófűtés', leiras: '— nedves fektetésű' },
              korrekcio2: 'beágyazott fűtőfelület MSZ EN 1264-2 szerinti minimális hőszigeteléssel',
              korrekcio3: 'különálló, képes önálló be-kikapcsolásra (pl. termosztatikus zónaszelep)',
              beszabalyozas: {
                rendszer: 'Kétcsöves rendszer',
                kialakitas: 'fűtőtestenként/fűtőfelületenként dinamikus beszabályozás (pl. automatikus térfogatáram korlátozókkal/nyomáskülönbség-szabályozókkal)',
                hoeladokSzama: 10,
              },
            }
          : {
              hoelado: 'szabad',
              alap: 'Szabályozás referencia helyiségre, PI-szabályozó\nKözponti előremenő hőmérséklet szabályozás helyiségenkénti hőmérséklet szabályozással',
              korrekcio1: { alcsoport: 'kétcsöves fűtés és modernizált egycsöves fűtés', leiras: '55 °C/45 °C' },
              korrekcio2: 'külsőfali radiátor',
              korrekcio3: 'különálló, képes önálló be-kikapcsolásra (pl. termosztatikus szelep)',
              beszabalyozas: {
                rendszer: 'Kétcsöves rendszer',
                kialakitas: 'fűtőtestenként /fűtőfelületenként statikus-beállítás csoportos statikus beszabályozással (pl. strangszabályozó szelepekkel)',
                hoeladokSzama: 10,
              },
            },
        elosztasHelye: 'futott_terben',
        tarolo: eset === 'G2' ? { helye: 'futott_terben' } : null,
        szivattyu: 'ec_eei_023',
        hotermeloHelye: 'futott_terben',
      },
      hmv: {
        hotermelo: hmvHp ? { tipus: 'elektromos', csoport: 'Hőszivattyú HMV készítésre', rendszer: 'Levegő' } : { tipus: 'kazan', kazan: 'kondenzacios' },
        hordozo: hmvHp ? 'villamos' : 'fosszilis_gaz',
        tarolo: { fajta: 'indirekt', helye: 'futott_terben' },
        elosztasHelye: 'futott_terben',
        cirkulacio: false,
      },
      szellozes: g.systems.airing
        ? { fajta: 'hővisszanyerős', legcsere: g.systems.airing.n, etaR: g.systems.airing.eta / 100, dp: g.systems.airing.dp, etaVent: g.systems.airing.fan_eff / 100, uzemido: 5088 }
        : { fajta: 'természetes' },
      hutes: g.systems.cooling ? { hutogep: 'Kompresszoros léghűtés (split)', hutokozeg: 'Közvetlen elpárologtatós rendszer (5 oC)', szabalyozas: 'Direkt elpárologtatás' } : null,
      napelemek: g.systems.pv ? [{ azon: 'pv-1', kWp: g.systems.pv.kWp, tajolas: 'D', hajlasszog: g.systems.pv.gradient }] : [],
    },
  };
}
