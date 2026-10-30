// Projekt-adatmodell (1. változat). A tárolt formátum JSON; minden mennyiség SI-ben (m, m², W/mK), a rétegvastagság
// méterben. A gépészeti hőtermelők a számítási mag bemeneti típusait használják, hogy a modell és a mag ne térjen el.
import type {
  Arnyekoltsag,
  BelsoTipus12831,
  FutetlenF1,
  HoleadoMagas,
  HohidKategoria,
  HotaroloKat12831,
  LegtomorsegiOsztaly,
  NMinTipus,
  Elhelyezes,
  Energiahordozo,
  FutesiHotermelo,
  FutetlenTerTipus,
  HmvHotermelo,
  HmvNapkollektor,
  HmvTarolo,
  Hohidassag,
  HotaroloKategoria,
  Sulyok,
  SzivattyuTipus,
  Tajolas,
  VizesSzabalyozas,
} from '@bimline/calc-core';

export const MODELL_VERZIO = 1 as const;

/** Forrásjelölés: termékadatlap (hivatkozással), jogszabályi alapérték, vagy feltevés (Péter szabálya). */
export type Forras = { tipus: 'termekadatlap'; hivatkozas: string } | { tipus: 'jogszabaly'; hivatkozas: string } | { tipus: 'feltevés'; indoklas: string };

export interface Anyag {
  azon: string;
  nev: string;
  /** Tervezési hővezetési tényező [W/mK]. */
  lambda: number;
  /** Testsűrűség [kg/m³] és fajhő [J/kgK] – a hőtároló tömeghez (később). */
  rho?: number;
  c?: number;
  forras: Forras;
}

/**
 * Szerkezettípus az elemi követelmény (9/2023 ÉKM 1. melléklet 1.1.) kódjával. Ebből adódik a hőáram iránya, a
 * felületi hőátadási ellenállások és a referencia csatlakozási hőhídja.
 */
export type SzerkezetTipus =
  | 'homlokzati_fal'
  | 'lapos_teto'
  | 'futott_tetoter_hatarolo'
  | 'padlasfodem'
  | 'arkad_athajto_feletti_fodem'
  | 'also_zarofodem_futetlen_felett'
  | 'futott_futetlen_kozotti_fal'
  | 'szomszed_futott_epulet_fal'
  | 'talajon_fekvo_padlo'
  /** Fűtött pince talajjal érintkező fala: nem önálló határoló, a pincepadlónál hivatkozott rétegrend (6.6). */
  | 'talajjal_erintkezo_fal';

export interface Retegrend {
  azon: string;
  /** A tervben szereplő név (pl. „R1./ Külső fal”). */
  nev: string;
  szerkezet: SzerkezetTipus;
  /** Kívülről befelé. */
  retegek: { anyagAzon: string; d: number }[];
}

export interface NyilaszaroTipus {
  azon: string;
  nev: string;
  fajta: 'ablak' | 'ajto';
  /** Ablaknál összetevőkből (4.16): üvegezés U_g, g, keret U_f és szélesség [m], Ψ_g. */
  osszetevok?: { Ug: number; g: number; Uf: number; keretSzelesseg: number; psiG: number };
  /** Közvetlen U [W/m²K] (ajtó; terv nélkül 1,4 / kapu 1,8 / ipari kapu 2,0 – Péter szabálya). */
  U?: number;
  forras: Forras;
}

export interface Nyilas {
  nyilaszaroAzon: string;
  szelesseg: number;
  magassag: number;
  db: number;
}

/** A határoló túloldala. */
export type Tuloldal = { fajta: 'külső' } | { fajta: 'talaj' } | { fajta: 'fűtetlen'; ter: FutetlenTerTipus } | { fajta: 'fűtött szomszéd' };

export interface Hatarolo {
  azon: string;
  retegrendAzon: string;
  tuloldal: Tuloldal;
  /** Homlokzati tájolás (függőleges és ferde szerkezetnél); a nyílászárók nyereségéhez. */
  tajolas?: Tajolas;
  /** Hajlásszög a vízszinteshez [°] (fal 90, lapostető 0). */
  hajlasszog?: number;
  /** Bruttó felület [m²] (a nyílások nélkül nem kell levonni, a program vonja le). */
  felulet: number;
  nyilasok: Nyilas[];
  /** Talajon fekvő padlónál: kitett kerület [m]. */
  kitettKerulet?: number;
  /** Talajon fekvő padlónál: a padló terepszint alatti mélysége z [m]; ±0,5 m-en belül 0 (4.4.2). */
  melyseg?: number;
  /** Fűtött pincénél (z > 0,5 m): a talajjal érintkező pincefal rétegrendje; felülete z·P (4.4.4, 6.6). */
  pinceFalRetegrendAzon?: string;
  /** Terepszint feletti padlónál (negatív mélység, a padló felső síkja 0,5 m-nél magasabban): a lábazati fal rétegrendje (4.4.3). */
  labazatiFalRetegrendAzon?: string;
  /** Rajzból: a helyiség alaprajzának ezen éle (0-tól); a felület és a tájolás az élből számít (alaprajz.ts). */
  rajzEl?: number;
  /**
   * Rajzból: a helyiség alatti vagy feletti szerkezet része. Felülete az alaprajzi területrész, ferde tetőnél
   * ennek a hajlásszög koszinuszával osztott értéke (alaprajz.ts). `true`: régi mentés, a szerkezettípusból dől el.
   */
  rajzAlap?: 'alatta' | 'felette' | true;
  /** A rész alaprajzi (vízszintes vetületi) területe [m²]; ha nincs megadva, a helyiség maradék területe. */
  alaprajziTerulet?: number;
}

/** Alaprajzi pont [m]; x kelet felé (ha az északi irány 0°), y észak felé. */
export interface Pont {
  x: number;
  y: number;
}

export interface Helyiseg {
  azon: string;
  nev: string;
  szint: string;
  /** Nettó alapterület [m²] és belmagasság [m]. */
  alapterulet: number;
  belmagassag: number;
  hatarolok: Hatarolo[];
  /** Rajzolt alaprajz: a nettó (belméretű) kontúr pontjai, zárt sokszög (JEL-004, MOD-006). */
  alaprajz?: { pontok: Pont[] };
  /** Méretezési hőterhelés (MSZ EN 12831-1) helyiségadatai; hiányzó mezőnél a nevből / nyílásokból adódó javaslat. */
  hoterheles?: HelyisegHoterheles;
}

export interface HelyisegHoterheles {
  /** B.14. táblázat sora a θ_int,i-hez. */
  tipus?: BelsoTipus12831;
  /** Közvetlenül megadott belső méretezési hőmérséklet [°C] (terv). */
  thetaInt?: number;
  /** B.7. táblázat sora az n_min-hez. */
  nMinTipus?: NMinTipus;
  /** Épületrész (pl. lakás) azonosítója: egy épületrész egy szellőzési zóna. */
  egyseg?: string;
  /** Gépi elszívás és befúvás [m³/h] (terv). */
  qExh?: number;
  qSup?: number;
  /** Hőleadó rendszer (csak ≥ 4 m belmagasságnál, B.3. táblázat). */
  holeado?: HoleadoMagas;
}

/** A méretezési hőterhelés (MSZ EN 12831-1) épületszintű bemenetei. */
export interface HoterhelesBeallitas {
  /** Külső méretezési hőmérséklet θ_e,Ref [°C] forrással (nemzeti melléklet; a B melléklet nem ad értéket). */
  thetaERef?: { ertek: number; forras: string };
  /** Éves átlagos külső hőmérséklet θ_e,m [°C] forrással. */
  thetaEm?: { ertek: number; forras: string };
  /** Magassági korrekció (46): G_θ,Ref [K/m], h_build és h_Ref [m], forrással. */
  magassag?: { G: number; hBuild: number; hRef: number; forras: string };
  hohid: HohidKategoria;
  legtomorseg: { osztaly: LegtomorsegiOsztaly } | { n50: number; forras: string };
  tobbHomlokzat: boolean;
  arnyekoltsag: Arnyekoltsag;
  /** A zóna magassága a terep felett 50 m felett van (B.8). */
  magasEpulet: boolean;
  /** A zóna függőleges kiterjedése Δh_z [m] (B.8). */
  dhz: number;
  /** A talajvíz 1 m-en belül van a padlólemez alatt (B.2.3). */
  talajvizKozel: boolean;
  hotarolo: HotaroloKat12831;
  /** Külső (bruttó) épülettérfogat V_e [m³] az időállandóhoz (41); nélküle nincs időállandó-korrekció. */
  Ve?: number;
  /** Fűtetlen tértípusonként a B.2. táblázat sora (f_1). */
  futetlenF1: Partial<Record<FutetlenTerTipus, FutetlenF1>>;
  /** Belső fal rétegrendje a különböző hőmérsékletű szomszédos helyiségek közti H_T,ia-hoz (rajzolt közös falak). */
  belsoFalRetegrendAzon?: string;
}

export interface FutesiRendszer {
  hotermelo: FutesiHotermelo;
  hordozo: Energiahordozo;
  egyediSulyok?: Sulyok;
  hoelado: 'szabad' | 'beagyazott';
  hofoklepcso: { elore: number; vissza: number };
  szabalyozas: VizesSzabalyozas;
  elosztasHelye: Elhelyezes;
  tarolo: { helye: Elhelyezes } | null;
  szivattyu: SzivattyuTipus;
  /** A hőtermelő helye a referencia-rendszerhez (5. melléklet 2.1.1.). */
  hotermeloHelye: Elhelyezes;
}

export interface HmvRendszer {
  hotermelo: HmvHotermelo;
  hordozo: Energiahordozo;
  tarolo: { fajta: HmvTarolo; helye: Elhelyezes } | null;
  elosztasHelye: Elhelyezes;
  /** Cirkulációs szivattyú EEI-je; `null`: ismeretlen; `false`: nincs cirkuláció. */
  cirkulacio: number | null | false;
  napkollektor?: HmvNapkollektor;
}

export type Szellozes =
  | { fajta: 'természetes' }
  | {
      fajta: 'hővisszanyerős';
      /** Légcsere [1/h] (terv; lakóépületnél a 2. függ. 2.1. táblázat n_szüks = 0,5). */
      legcsere: number;
      /** Hővisszanyerési hatásfok [-] – termékadatlapról. */
      etaR: number;
      /** A rendszer áramlási ellenállása Δp_LT [Pa] – tervből. */
      dp: number;
      /** Ventilátor-összhatásfok [-] termékadatlapról; ha nincs, a 10.8. táblázat alapértéke (LT-051). */
      etaVent?: number;
      /** Éves üzemidő [h] a terv szerint; egész éves üzemnél 8760 (2. függ. 2.1. táblázat). */
      uzemido: number;
    };

export type Hutes = null | { hutogep: string; hutokozeg: string; szabalyozas: string };

export interface Napelem {
  azon: string;
  kWp: number;
  tajolas: 'D' | 'DK' | 'DNy' | 'K' | 'Ny';
  hajlasszog: number;
}

export interface Projekt {
  verzio: typeof MODELL_VERZIO;
  azon: string;
  nev: string;
  modositva: string;
  adatok: { cim: string; helyrajziSzam: string; megrendelo: string; megjegyzes: string };
  epulet: {
    rendeltetes: 'Családi ház*' | 'Egyéb lakóépület*';
    ujEpulet: boolean;
    cmKategoria: HotaroloKategoria;
    /** 2. függ. 2.4. táblázat [1/h]. */
    nFilt: number;
    szakaszosFutes: boolean;
    /** Talajon fekvő padló Ψ_p,f-jéhez (6.4. táblázat). */
    labazatiFal: 'Lábazati fal hőszigeteletlen' | 'Lábazati fal csak a terepszintig hőszigetelt' | 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt';
    kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel' | 'hőszigetelés nélkül';
    /** A csatlakozási hőhidak hőhidassága (6.2. táblázat; a referenciaépülethez is). */
    hohidassag: Hohidassag;
    /** A rajz „fel” irányától az északig mért szög az óramutató járásával [°]; 0: a rajz teteje észak. */
    eszakSzog?: number;
  };
  anyagok: Anyag[];
  retegrendek: Retegrend[];
  nyilaszarok: NyilaszaroTipus[];
  helyisegek: Helyiseg[];
  rendszerek: { futes: FutesiRendszer; hmv: HmvRendszer; szellozes: Szellozes; hutes: Hutes; napelemek: Napelem[] };
  /** Méretezési hőterhelés (MSZ EN 12831-1) beállításai; hiányában az alapbeállítás. */
  hoterheles?: HoterhelesBeallitas;
}

export const ujAzon = (elotag: string): string => `${elotag}-${Math.random().toString(36).slice(2, 9)}`;
