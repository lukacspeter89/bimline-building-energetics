import { ErvenytelenBemenet } from '../hibak.js';
import { sorKeres, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';

const T = (id: string): TablaHivatkozas => `modszer/szellozes#${id}`;

/** Ventilátor összhatásfoka a 10.8. táblázatból, pontosabb adat hiányában (LT-051). */
export function ventilatorOsszhatasfok(VLT: number): number {
  if (!(VLT > 0)) throw new ErvenytelenBemenet('Érvénytelen térfogatáram.', 'LT-051');
  const sor = tabla(T('tabla_10_8')).sorok.find((s) => {
    const min = s['V_min'] as number | null;
    const max = s['V_max_kizart'] as number | null;
    return (min === null || VLT >= min) && (max === null || VLT < max);
  });
  return szamMezo(sor!, 'eta_vent', T('tabla_10_8'));
}

/**
 * A ventilátor villamos energiafelhasználása egy üzemállapotban, (10.20) (LT-041):
 * W_vent,n = (V̇_friss + V̇_recirk)·Δp_LT / (3600·η_vent)·t_LT,a / 1000 [kWh/év].
 * @param VLT térfogatáram [m³/h]; @param dpLT a rendszer áramlási ellenállása [Pa]; @param tLTa éves üzemidő [h]
 * @param etaVent ventilátor-összhatásfok; ha nincs megadva, a 10.8. táblázat alapértéke
 */
export function ventilatorEnergia(b: { VLT: number; VrecirkLT?: number; dpLT: number; tLTa: number; etaVent?: number }): number {
  const V = b.VLT + (b.VrecirkLT ?? 0);
  if (!(b.VLT > 0) || !((b.VrecirkLT ?? 0) >= 0) || !(b.dpLT > 0) || !(b.tLTa >= 0 && b.tLTa <= 8760)) {
    throw new ErvenytelenBemenet('Érvénytelen szellőzési adat.', 'LT-041');
  }
  const eta = b.etaVent ?? ventilatorOsszhatasfok(V);
  if (!(eta > 0 && eta <= 1)) throw new ErvenytelenBemenet('Érvénytelen ventilátor-összhatásfok.', 'LT-041');
  return ((V * b.dpLT) / (3600 * eta)) * (b.tLTa / 1000);
}

export type LegcsatornaKialakitas = 'Légcsatornával ellátott berendezés' | 'Légcsatorna nélküli berendezés';
export type VentilatorVezerles = 'Kézi vezérlés' | 'Időzítős (óra)vezérlés' | 'Központi igényvezérlés' | 'Helyi igényvezérlés';
export type MotorVezerles = 'on/off és egyfokozatú' | '2 fokozatú' | '3 fokozatú' | 'fokozatmentes';

/**
 * ErP minősített (lakás)szellőző ventilátorának villamos energiafelhasználása, (10.17) (LT-033 … LT-037):
 * W_vent,n = V̇_LT,n·MISC·SPI·t_LT,a,n / CTRL^x [kWh/év]. A módszer nem kötelező, recirkulációnál nem alkalmazható (LT-026).
 * @param SPI fajlagos felvett teljesítmény a gyártói adatlapról [kW/(m³/h)]
 */
export function ventilatorEnergiaErP(b: {
  VLT: number;
  SPI: number;
  tLTa: number;
  legcsatorna: LegcsatornaKialakitas;
  vezerles: VentilatorVezerles;
  motor: MotorVezerles;
}): number {
  if (!(b.VLT > 0) || !(b.SPI > 0) || !(b.tLTa >= 0 && b.tLTa <= 8760)) throw new ErvenytelenBemenet('Érvénytelen szellőzési adat.', 'LT-033');
  const MISC = szamMezo(sorKeres(T('tabla_10_2'), (s) => s['tipus'] === b.legcsatorna), 'MISC', T('tabla_10_2'));
  const CTRL = szamMezo(sorKeres(T('tabla_10_3'), (s) => s['tipus'] === b.vezerles), 'CTRL', T('tabla_10_3'));
  const x = szamMezo(sorKeres(T('tabla_10_4'), (s) => s['tipus'] === b.motor), 'x', T('tabla_10_4'));
  return (b.VLT * MISC * b.SPI * b.tLTa) / CTRL ** x;
}

/**
 * A teljesítmény és az igény illesztésének pontatlansága miatti veszteség f_LT [-] a 10.5. táblázatból (LT-044).
 * 20 °C alatti befúvásnál 0 (pl. hővisszanyerős rendszer utófűtő nélkül); pontosan 20 °C-ot a táblázat nem sorol be.
 */
export function illesztesiVeszteseg(
  thetaBef: number,
  szabalyozas?: 'Helyiségenkénti szabályozás' | 'Központi előszabályozással, helyiségenkénti szabályozás nélkül' | 'Központi és helyiségenkénti szabályozás nélkül',
): number {
  if (thetaBef === 20) throw new ErvenytelenBemenet('Pontosan 20 °C befúvási hőmérsékletet a 10.5. táblázat nem sorol be.', 'LT-044');
  const hiv = T('tabla_10_5');
  const sor =
    thetaBef < 20
      ? sorKeres(hiv, (s) => s['theta_bef_max_kizart'] === 20)
      : sorKeres(hiv, (s) => s['theta_bef_min_kizart'] === 20 && s['szabalyozas'] === szabalyozas);
  return szamMezo(sor, 'f_LT_szazalek', hiv) / 100;
}

/**
 * A légtechnikai rendszer végső energiája (LT-039 … LT-043, 10.1.5): utófűtés
 * Q_F,UF = [(Q_UF,friss + Q_recirk)·(1 + f_LT) + Q_lcs]·ε_LT,UF, (10.18); előfűtés Q_EF·ε_LT,EF, (10.19);
 * villamos energia a ventilátorok és a W_LT,s segédenergia összege, (10.20), (10.23).
 */
export function legtechnikaiRendszer(b: {
  QUFfriss?: number;
  Qrecirk?: number;
  fLT?: number;
  Qlcs?: number;
  epsUF?: number;
  QEF?: number;
  epsEF?: number;
  Wvent: readonly number[];
  WLTs?: number;
}): { QUF: number; QEF: number; WLT: number } {
  const ne = (x: number | undefined): number => {
    if (x !== undefined && !(x >= 0)) throw new ErvenytelenBemenet('Érvénytelen légtechnikai adat.', 'LT-039');
    return x ?? 0;
  };
  const QUF = ((ne(b.QUFfriss) + ne(b.Qrecirk)) * (1 + ne(b.fLT)) + ne(b.Qlcs)) * (b.epsUF ?? 1);
  return { QUF, QEF: ne(b.QEF) * (b.epsEF ?? 1), WLT: b.Wvent.reduce((s, w) => s + ne(w), 0) + ne(b.WLTs) };
}
