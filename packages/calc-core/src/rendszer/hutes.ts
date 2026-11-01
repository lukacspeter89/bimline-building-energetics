import { ErvenytelenBemenet } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';

const T = (id: string): TablaHivatkozas => `modszer/hutes#${id}`;

/** Hűtőgép teljesítménytényezője: ismert SEER-ből ε_H = 1/SEER, (11.3), különben a 11.2. táblázat (HUT-011 … HUT-013). */
export function hutesiTeljesitmenyTenyezo(h: { SEER: number } | { hutogep: string }): number {
  if ('SEER' in h) {
    if (!(h.SEER > 0)) throw new ErvenytelenBemenet('Érvénytelen SEER.', 'HUT-011');
    return 1 / h.SEER;
  }
  return szamMezo(sorKeres(T('tabla_11_2'), (s) => s['hutogep_tipus'] === h.hutogep), 'eps_H', T('tabla_11_2'));
}

/** A teljes és az érezhető hűtőteljesítmény aránya c_H a 11.1. táblázatból (HUT-009). */
export function latensTenyezo(hutokozeg: string): number {
  return szamMezo(sorKeres(T('tabla_11_1'), (s) => s['hutokozeg'] === hutokozeg), 'c_H', T('tabla_11_1'));
}

/** Szabályozási veszteségtényező ε_H,szab a 11.3. táblázatból (HUT-017). */
export function hutesSzabalyozasiTenyezo(rendszer: string): number {
  return szamMezo(sorKeres(T('tabla_11_3'), (s) => s['rendszer'] === rendszer), 'eps_H_szab', T('tabla_11_3'));
}

/**
 * Gépi hűtés végső energiája, (11.1)–(11.2), egyszerűsített módszer (1. függ. 11.1, 82–83. o.):
 * Q_H,vég = Q_H,net·c_H·ε_H,szab·ε_H,száll·ε_H, ahol ε_H,száll = 1 és W_H,vég = 0 az egyszerűsített esetben (HUT-001, HUT-005, HUT-008, HUT-015).
 */
export function hutesiRendszer(b: { QHnet: number; cH: number; epsSzab: number; epsH: number; epsSzall?: number; Wseg?: number }): {
  QHveg: number;
  WHveg: number;
} {
  for (const [k, v] of Object.entries(b)) {
    if (v !== undefined && (!Number.isFinite(v) || v < 0)) throw new ErvenytelenBemenet(`Érvénytelen ${k}: ${v}`, 'HUT-001');
  }
  const szall = b.epsSzall ?? alapertek(T('alapertekek_11'), 'eps_H_szall');
  return { QHveg: b.QHnet * b.cH * b.epsSzab * szall * b.epsH, WHveg: b.Wseg ?? alapertek(T('alapertekek_11'), 'W_H_veg') };
}
