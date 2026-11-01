import { ErvenytelenBemenet, SzamitasiHiba } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';
import { alapteruletTablaErtek, hofoklepcsoInterpolacio, type Hofoklepcso, type Jelolt } from './kozos.js';

const T = (id: string): TablaHivatkozas => `modszer/futes#${id}`;
const ALAP_7_8 = T('alapertekek_7_8');

// ---------------------------------------------------------------------------------------------
// Hőtermelők (8.3) – teljesítménytényező ε_F és segédenergia W_F,term
// ---------------------------------------------------------------------------------------------

export type KazanTipus = 'allando' | 'alacsony' | 'kondenzacios';
export type Elhelyezes = 'futott_terben' | 'futott_teren_kivul';

/** A 8.3. táblázat kazántípusai. */
export type SzilardKazan = 'Vegyes tüzelésű kazán' | 'Tűzifa (hasábfa) tüzelésű kazán' | 'Pellettüzelésű kazán' | 'Faelgázosító kazán';

/** Hőszivattyú hőforrás/fűtőközeg a 8.5. táblázat szerint. */
export type HoszivattyuHoforras = 'Víz/Víz' | 'Talajhő/Víz' | 'Levegő/Víz' | 'Távozó levegő/Víz (hővisszanyerő nélkül)' | 'Levegő/levegő';

export type FutesiHotermelo =
  /** ErP (811/2013/EU) kazán, nem elektromos: ε_F = 1/η_s, (8.4); segédenergia nélkül (FUT-010 … FUT-013). */
  | { tipus: 'erp_kazan'; etaS: number }
  /** Nem ErP folyékony/gáz tüzelésű kazán, 8.1. / 8.2. táblázat (FUT-014 … FUT-018). */
  | { tipus: 'kazan'; kazan: KazanTipus; elhelyezes: Elhelyezes }
  /** Szilárd- és biomassza tüzelés, 8.3. / 8.4. táblázat (FUT-019, FUT-020). Faelgázosítónál a segédenergiát meg kell adni. */
  | { tipus: 'szilard'; kazan: SzilardKazan; WtermFajlagos?: number }
  /** ErP hőszivattyú: ε_F = 1/(2,5·η_s), (8.6); segédenergia nem vehető figyelembe (FUT-025 … FUT-028). */
  | { tipus: 'erp_hoszivattyu'; etaS: number }
  /** Nem ErP elektromos hőszivattyú ismert SCOP-pal: ε_F = 1/SCOP (FUT-029). */
  | { tipus: 'hoszivattyu_scop'; scop: number }
  /** Nem ErP elektromos hőszivattyú a 8.5. táblázat alapértékével (FUT-030, FUT-031). */
  | { tipus: 'hoszivattyu'; hoforras: HoszivattyuHoforras; futoviz?: Hofoklepcso }
  /** Nem ErP földgáz üzemű hőszivattyú, 8.6. táblázat (FUT-032). Energiahordozó: földgáz. */
  | { tipus: 'gaz_hoszivattyu' }
  /** Távhő: ε_F = 1,01, segédenergia 215 kWh/év hőközpontonként (FUT-036, FUT-037). */
  | { tipus: 'tavho'; hokozpontokSzama: number }
  /** ErP egyedi fűtés: nem elektromos ε_F = 1/η_s, (8.8); elektromos 1/(2,5·η_s), (8.9) (FUT-038 … FUT-040). */
  | { tipus: 'erp_egyedi'; etaS: number; elektromos: boolean }
  /** Nem ErP egyedi és direkt elektromos fűtés, 8.7. táblázat (FUT-041, FUT-042) – a táblázat szövege szerint. */
  | { tipus: 'egyedi'; berendezes: string }
  /** Alulméretezett rendszer nem fedezett hányada: direkt hálózati elektromos, ε_F = 1 (RA-009). */
  | { tipus: 'alulmeretezett' };

export interface HotermeloEredmeny {
  epsF: number;
  /** A hőtermelés villamos segédenergiája [kWh/év], a fedezett hányaddal arányosítva. */
  Wterm: number;
  jelzesek: string[];
}

/**
 * Hőtermelő teljesítménytényezője és segédenergiája (1. függ. 8.3, 56–61. o.). A teljesítménytényezők égéshőre
 * vonatkoznak (RA-025).
 * @param aRszr a hőtermelő által fűtött rendszer-alapterület [m²] (FUT-014)
 * @param arany a fedezett nettó igény hányada (bivalens/részrendszer), a táblázati segédenergia szorzója (RA-023)
 */
export function futesiHotermelo(h: FutesiHotermelo, aRszr: number, arany = 1): HotermeloEredmeny {
  if (!(arany >= 0 && arany <= 1)) throw new ErvenytelenBemenet('A fedezett hányad 0 és 1 között adható meg.', 'RA-023');
  const pozitiv = (x: number, id: string): number => {
    if (!(x > 0)) throw new ErvenytelenBemenet('Érvénytelen hatásfok vagy szám.', id);
    return x;
  };
  switch (h.tipus) {
    case 'erp_kazan':
      return { epsF: 1 / pozitiv(h.etaS, 'FUT-011'), Wterm: 0, jelzesek: [] };
    case 'kazan': {
      const hiv = T(h.elhelyezes === 'futott_teren_kivul' ? 'tabla_8_1' : 'tabla_8_2');
      const oszlop =
        h.elhelyezes === 'futott_teren_kivul'
          ? { allando: 'eps_F_allando', alacsony: 'eps_F_alacsony', kondenzacios: 'eps_F_kondenzacios' }[h.kazan]
          : { allando: 'eps_F_allando', alacsony: 'eps_F_masodik_oszlop', kondenzacios: 'eps_F_kondenzacios' }[h.kazan];
      const eps = alapteruletTablaErtek(hiv, oszlop, aRszr);
      const w = alapteruletTablaErtek(hiv, 'W_F_term_per_A', aRszr);
      return { epsF: eps.ertek, Wterm: w.ertek * aRszr * arany, jelzesek: [...eps.jelzesek, ...w.jelzesek] };
    }
    case 'szilard': {
      const epsF = szamMezo(sorKeres(T('tabla_8_3'), (s) => s['kazan_tipus'] === h.kazan), 'eps_F', T('tabla_8_3'));
      const oszlop = {
        'Vegyes tüzelésű kazán': 'vegyes_szabalyozo_nelkul',
        'Tűzifa (hasábfa) tüzelésű kazán': 'tuzifa_szabalyozoval',
        'Pellettüzelésű kazán': 'pellet_ventilator_elektromos_gyujtas',
        'Faelgázosító kazán': null,
      }[h.kazan];
      if (oszlop === null) {
        if (h.WtermFajlagos === undefined) {
          throw new SzamitasiHiba('A faelgázosító kazánhoz a 8.4. táblázat nem ad segédenergiát; add meg forrással.', 'FUT-020');
        }
        return { epsF, Wterm: h.WtermFajlagos * aRszr * arany, jelzesek: ['FUT-020: faelgázosító kazán segédenergiája felhasználói adat.'] };
      }
      const w = alapteruletTablaErtek(T('tabla_8_4'), oszlop, aRszr);
      return { epsF, Wterm: w.ertek * aRszr * arany, jelzesek: w.jelzesek };
    }
    case 'erp_hoszivattyu':
      return { epsF: 1 / (alapertek(ALAP_7_8, 'hoszivattyu_ErP_szorzo') * pozitiv(h.etaS, 'FUT-026')), Wterm: 0, jelzesek: [] };
    case 'hoszivattyu_scop':
      return { epsF: 1 / pozitiv(h.scop, 'FUT-029'), Wterm: 0, jelzesek: [] };
    case 'hoszivattyu': {
      const sorok = tabla(T('tabla_8_5')).sorok.filter((s) => s['hoforras_futokozeg'] === h.hoforras);
      if (sorok.length === 0) throw new ErvenytelenBemenet(`Ismeretlen hőforrás: ${h.hoforras}`, 'FUT-030');
      if (sorok.length === 1) return { epsF: szamMezo(sorok[0]!, 'eps_F', T('tabla_8_5')), Wterm: 0, jelzesek: [] };
      if (!h.futoviz) throw new ErvenytelenBemenet('A fűtővíz hőfoklépcsője szükséges.', 'FUT-030');
      const pontok = sorok.map((s) => ({
        h: { elore: szamMezo(s, 't_elore', T('tabla_8_5')), vissza: szamMezo(s, 't_vissza', T('tabla_8_5')) },
        ertek: szamMezo(s, 'eps_F', T('tabla_8_5')),
      }));
      return { epsF: hofoklepcsoInterpolacio(pontok, h.futoviz), Wterm: 0, jelzesek: [] };
    }
    case 'gaz_hoszivattyu':
      return { epsF: szamMezo(tabla(T('tabla_8_6')).sorok[0]!, 'eps_F', T('tabla_8_6')), Wterm: 0, jelzesek: [] };
    case 'tavho': {
      if (!(Number.isInteger(h.hokozpontokSzama) && h.hokozpontokSzama >= 1)) {
        throw new ErvenytelenBemenet('A hőközpontok száma pozitív egész.', 'FUT-037');
      }
      return {
        epsF: alapertek(ALAP_7_8, 'tavho_eps_F'),
        Wterm: alapertek(ALAP_7_8, 'tavho_W_F_term_hokozpont') * h.hokozpontokSzama * arany,
        jelzesek: [],
      };
    }
    case 'erp_egyedi':
      return {
        epsF: h.elektromos
          ? 1 / (alapertek(ALAP_7_8, 'elektromos_futes_ErP_szorzo') * pozitiv(h.etaS, 'FUT-039'))
          : 1 / pozitiv(h.etaS, 'FUT-038'),
        Wterm: 0,
        jelzesek: [],
      };
    case 'egyedi':
      return {
        epsF: szamMezo(sorKeres(T('tabla_8_7'), (s) => s['hoforras_futokozeg'] === h.berendezes), 'eps_F', T('tabla_8_7')),
        Wterm: 0,
        jelzesek: [],
      };
    case 'alulmeretezett':
      return { epsF: alapertek(ALAP_7_8, 'eps_F_alulmeretezett_direkt_elektromos'), Wterm: 0, jelzesek: [] };
  }
}

// ---------------------------------------------------------------------------------------------
// Hőelosztás (8.5), szabályozás (8.6), tárolás (8.7), segédenergia (8.8)
// ---------------------------------------------------------------------------------------------

const ELOSZTAS_HOFOKLEPCSOK: readonly { oszlop: string; h: Hofoklepcso }[] = [
  { oszlop: 'dt_90_70', h: { elore: 90, vissza: 70 } },
  { oszlop: 'dt_70_55', h: { elore: 70, vissza: 55 } },
  { oszlop: 'dt_55_45', h: { elore: 55, vissza: 45 } },
  { oszlop: 'dt_35_28', h: { elore: 35, vissza: 28 } },
];

/**
 * A hőelosztás vesztesége [kWh/év] a vízszintes elosztóvezetékek helye és a méretezési hőfoklépcső szerint
 * (FUT-046 … FUT-050; 1. függ. 8.5.1, 8.8–8.9. táblázat, 62. o.). Részrendszernél és bivalens alrendszernél az
 * értéket a nettó igény hányadával kell csökkenteni (`arany`).
 */
export function hoelosztasVesztesege(elhelyezes: Elhelyezes, h: Hofoklepcso, aRszr: number, arany = 1): Jelolt<number> {
  const hiv = T(elhelyezes === 'futott_teren_kivul' ? 'tabla_8_8' : 'tabla_8_9');
  const jelzesek: string[] = [];
  const pontok = ELOSZTAS_HOFOKLEPCSOK.map((p) => {
    const v = alapteruletTablaErtek(hiv, p.oszlop, aRszr);
    jelzesek.push(...v.jelzesek);
    return { h: p.h, ertek: v.ertek };
  });
  return { ertek: hofoklepcsoInterpolacio(pontok, h) * aRszr * arany, jelzesek };
}

/** Szabályozási veszteségtényező elosztóhálózatos (vizes) rendszernél, (8.12): a táblázati sorok `leiras` cellái. */
export interface VizesSzabalyozas {
  hoelado: 'szabad' | 'beagyazott';
  /** ε_F,szab,o – a hőtermelő szabályozása (8.10. / 8.11. táblázat). */
  alap: string;
  /** ε_F,szab,1 – szabad fűtőfelületnél a közepes méretezési hőmérsékletkülönbség (alcsoport + leírás), beágyazottnál a rendszer. */
  korrekcio1: { alcsoport?: string; leiras: string };
  /** ε_F,szab,2 – külső határolószerkezetek hatása / határolószerkezet hőszigetelése. */
  korrekcio2: string;
  /** ε_F,szab,3 – helyiségenkénti szabályozás. */
  korrekcio3: string;
  /** ε_F,szab,4 – beszabályozás (8.12. táblázat). */
  beszabalyozas: { rendszer: 'Egycsöves rendszer' | 'Kétcsöves rendszer'; kialakitas: string; hoeladokSzama?: number };
}

function tenyezoKeres(hiv: TablaHivatkozas, tenyezo: string, leiras: string, alcsoport?: string): number {
  const sor = sorKeres(
    hiv,
    (s) => s['tenyezo'] === tenyezo && s['leiras'] === leiras && (alcsoport === undefined || s['alcsoport'] === alcsoport),
  );
  return szamMezo(sor, 'ertek', hiv);
}

/**
 * Szabályozási veszteségtényező vizes rendszernél: ε_F,szab = ε_o + ε_1 + ε_2 + ε_3 + ε_4, (8.12)
 * (FUT-052 … FUT-062; 1. függ. 8.6.1.1, 8.10–8.12. táblázat, 63–64. o.).
 */
export function vizesSzabalyozasiTenyezo(sz: VizesSzabalyozas): number {
  const hiv = T(sz.hoelado === 'szabad' ? 'tabla_8_10' : 'tabla_8_11');
  const o = tenyezoKeres(hiv, 'eps_F_szab_o', sz.alap);
  const k1 = tenyezoKeres(hiv, 'eps_F_szab_1', sz.korrekcio1.leiras, sz.korrekcio1.alcsoport);
  const k2 = tenyezoKeres(hiv, 'eps_F_szab_2', sz.korrekcio2);
  const k3 = tenyezoKeres(hiv, 'eps_F_szab_3', sz.korrekcio3);
  const b = sorKeres(T('tabla_8_12'), (s) => s['rendszer'] === sz.beszabalyozas.rendszer && s['kialakitas'] === sz.beszabalyozas.kialakitas);
  let k4: number;
  if (sz.beszabalyozas.rendszer === 'Egycsöves rendszer') {
    k4 = szamMezo(b, 'eps_F_szab_4', T('tabla_8_12'));
  } else {
    const n = sz.beszabalyozas.hoeladokSzama;
    if (n === undefined || !(n >= 1)) throw new ErvenytelenBemenet('Kétcsöves rendszernél a hőleadók száma szükséges.', 'FUT-062');
    k4 = szamMezo(b, n <= 10 ? 'eps_F_szab_4_max10' : 'eps_F_szab_4_10felett', T('tabla_8_12'));
  }
  return o + k1 + k2 + k3 + k4;
}

/** Villamos fűtés szabályozási veszteségtényezője a 8.13. táblázatból (FUT-063, FUT-064). */
export function villamosSzabalyozasiTenyezo(elhelyezes: 'Külső fal mellett' | 'Belső fal mellett', szabalyozas: string): number {
  return szamMezo(sorKeres(T('tabla_8_13'), (s) => s['elhelyezes'] === elhelyezes && s['szabalyozas'] === szabalyozas), 'eps_F_szab', T('tabla_8_13'));
}

/** Közvetlen helyiséglevegő-fűtés szabályozási veszteségtényezője a 8.14. táblázatból (FUT-065). */
export function levegofutesSzabalyozasiTenyezo(rendszerkialakitas: string, szabalyozas: string): number {
  return szamMezo(
    sorKeres(T('tabla_8_14'), (s) => s['rendszerkialakitas'] === rendszerkialakitas && s['szabalyozas'] === szabalyozas),
    'eps_F_szab',
    T('tabla_8_14'),
  );
}

export interface HotarolasEredmeny {
  Qtar: number;
  Wtar: number;
  jelzesek: string[];
}

/**
 * Hőtárolás vesztesége és segédenergiája [kWh/év] (FUT-066 … FUT-069; 1. függ. 8.7, 8.15. táblázat, 65–66. o.).
 * Szilárd/biomassza tüzelésű rendszer tárolójánál a veszteség ×2,6, a segédenergia változatlan.
 */
export function hotarolas(elhelyezes: Elhelyezes, h: Hofoklepcso, aRszr: number, szilardVagyBiomassza: boolean, arany = 1): HotarolasEredmeny {
  const hiv = T('tabla_8_15');
  const hely = elhelyezes === 'futott_terben' ? 'futott_ter' : 'futott_teren_kivul';
  const jelzesek: string[] = [];
  const pontok = [
    { h: { elore: 55, vissza: 45 }, oszlop: `Q_tar_${hely}_55_45` },
    { h: { elore: 35, vissza: 28 }, oszlop: `Q_tar_${hely}_35_28` },
  ].map((p) => {
    const v = alapteruletTablaErtek(hiv, p.oszlop, aRszr);
    jelzesek.push(...v.jelzesek);
    return { h: p.h, ertek: v.ertek };
  });
  const szorzo = szilardVagyBiomassza ? alapertek(ALAP_7_8, 'tarolo_szilard_biomassza_szorzo') : 1;
  const w = alapteruletTablaErtek(hiv, 'W_tar', aRszr);
  return {
    Qtar: hofoklepcsoInterpolacio(pontok, h) * szorzo * aRszr * arany,
    Wtar: w.ertek * aRszr * arany,
    jelzesek: [...jelzesek, ...w.jelzesek],
  };
}

export type SzivattyuTipus = 'fordulatszam_szabalyozott' | 'allando_fordulatu' | 'ec_eei_023' | 'ec_eei_017';

/**
 * A hőelosztás szivattyúinak villamos segédenergiája [kWh/év] (FUT-071; 1. függ. 8.8.1, 8.16. táblázat, 66–67. o.).
 * Szabad fűtőfelületnél a hőfoklépcső 20 / 15 / 10 K, beágyazottnál 7 K; az EC-szivattyúk oszlopai hőfoklépcsőtől függetlenek.
 */
export function szivattyuSegedenergia(
  tipus: SzivattyuTipus,
  hoelado: 'szabad' | 'beagyazott',
  hofokkulonbsegK: 20 | 15 | 10 | 7,
  aRszr: number,
  arany = 1,
): Jelolt<number> {
  let oszlop: string;
  if (tipus === 'ec_eei_023') oszlop = 'ec_EEI_0_23';
  else if (tipus === 'ec_eei_017') oszlop = 'ec_EEI_0_17';
  else {
    const elotag = tipus === 'fordulatszam_szabalyozott' ? 'fsz' : 'all';
    if (hoelado === 'beagyazott' ? hofokkulonbsegK !== 7 : hofokkulonbsegK === 7) {
      throw new ErvenytelenBemenet('Szabad fűtőfelületnél 20, 15 vagy 10 K, beágyazottnál 7 K hőfoklépcső választható.', 'FUT-071');
    }
    oszlop = `${elotag}_${hoelado}_${hofokkulonbsegK}K`;
  }
  const v = alapteruletTablaErtek(T('tabla_8_16'), oszlop, aRszr);
  return { ertek: v.ertek * aRszr * arany, jelzesek: v.jelzesek };
}

/**
 * Fan coil ventilátorának segédenergiája egész éves üzemben [kWh/év] (FUT-073; 8.17. táblázat, 67. o.).
 * A fűtés és hűtés közötti megosztást a módszer nem adja meg; a program a fűtési segédenergiához számítja (D-120).
 */
export function fancoilSegedenergia(kialakitas: string, aRszr: number): number {
  if (!(aRszr > 0)) throw new ErvenytelenBemenet('Érvénytelen alapterület.', 'FUT-073');
  return szamMezo(sorKeres(T('tabla_8_17'), (s) => s['kialakitas'] === kialakitas), 'W_FC', T('tabla_8_17')) * aRszr;
}

// ---------------------------------------------------------------------------------------------
// Végső energia (8.1–8.2)
// ---------------------------------------------------------------------------------------------

export interface FutesiAlrendszerEredmeny {
  /** Fűtés végső hőenergia-igénye az alrendszer energiahordozójára [kWh/év], (8.2) – égéshő alapon. */
  QFveg: number;
  /** Villamos segédenergia [kWh/év], (8.3). */
  WFveg: number;
}

/**
 * Egy fűtési alrendszer végső energiaigénye (FUT-003, FUT-005, FUT-006, FUT-008; 1. függ. 8.1–8.2, 56. o.):
 * Q_F,net,FR = max(0, Q_F,net − Q_F,LT), (8.1);
 * Q_F,vég = (Q_F,net,FR · ε_F,szab + Q_F,száll + Q_F,tár) · ε_F, (8.2);
 * W_F,vég = W_F,sziv + W_F,tár + W_F,term, (8.3).
 * @param QFnet az alrendszer által fedezett nettó fűtési igény [kWh/év]
 * @param QFLT a léghevítés által fedezett hányad [kWh/év] (10.1.2)
 */
export function futesiAlrendszer(b: {
  QFnet: number;
  QFLT?: number;
  epsSzab: number;
  Qszall: number;
  Qtar: number;
  epsF: number;
  Wsziv: number;
  Wtar: number;
  Wterm: number;
}): FutesiAlrendszerEredmeny {
  for (const [k, v] of Object.entries(b)) {
    if (v !== undefined && (!Number.isFinite(v) || v < 0)) throw new ErvenytelenBemenet(`Érvénytelen ${k}: ${v}`, 'FUT-006');
  }
  const QFnetFR = Math.max(0, b.QFnet - (b.QFLT ?? 0));
  return {
    QFveg: (QFnetFR * b.epsSzab + b.Qszall + b.Qtar) * b.epsF,
    WFveg: b.Wsziv + b.Wtar + b.Wterm,
  };
}
