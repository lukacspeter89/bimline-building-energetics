// A data/normativ mappa összes fájlja. Új fájl felvételekor ezt a listát is bővíteni kell
// (a test/normativ.test.ts ellenőrzi, hogy minden fájl szerepel-e).
import type { NormativFajlTartalom } from './tipusok.js';
import d_modszer_eghajlat from '../../../../data/normativ/modszer/eghajlat.json';
import d_modszer_energiahordozok from '../../../../data/normativ/modszer/energiahordozok.json';
import d_modszer_futes from '../../../../data/normativ/modszer/futes.json';
import d_modszer_hmv from '../../../../data/normativ/modszer/hmv.json';
import d_modszer_hotechnika from '../../../../data/normativ/modszer/hotechnika.json';
import d_modszer_hutes from '../../../../data/normativ/modszer/hutes.json';
import d_modszer_indikatorok from '../../../../data/normativ/modszer/indikatorok.json';
import d_modszer_jelolesek from '../../../../data/normativ/modszer/jelolesek.json';
import d_modszer_megujulok from '../../../../data/normativ/modszer/megujulok.json';
import d_modszer_netto_energiaigeny from '../../../../data/normativ/modszer/netto_energiaigeny.json';
import d_modszer_nyilaszarok from '../../../../data/normativ/modszer/nyilaszarok.json';
import d_modszer_profilok from '../../../../data/normativ/modszer/profilok.json';
import d_modszer_szellozes from '../../../../data/normativ/modszer/szellozes.json';
import d_modszer_vilagitas from '../../../../data/normativ/modszer/vilagitas.json';
import d_modszer_zonazas from '../../../../data/normativ/modszer/zonazas.json';
import d_szabvany_msz_en_12831_1 from '../../../../data/normativ/szabvany/msz_en_12831_1.json';
import d_rendelet_176_2008_Korm_besorolas from '../../../../data/normativ/rendelet/176_2008_Korm_besorolas.json';
import d_rendelet_9_2023_EKM_1_melleklet from '../../../../data/normativ/rendelet/9_2023_EKM_1_melleklet.json';
import d_rendelet_9_2023_EKM_2_3_5_melleklet_kovetelmenyek from '../../../../data/normativ/rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json';
import d_rendelet_9_2023_EKM_7_melleklet_sulyozo_tenyezok from '../../../../data/normativ/rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json';

export const NORMATIV_FAJLOK = {
  'modszer/eghajlat': d_modszer_eghajlat as unknown as NormativFajlTartalom,
  'modszer/energiahordozok': d_modszer_energiahordozok as unknown as NormativFajlTartalom,
  'modszer/futes': d_modszer_futes as unknown as NormativFajlTartalom,
  'modszer/hmv': d_modszer_hmv as unknown as NormativFajlTartalom,
  'modszer/hotechnika': d_modszer_hotechnika as unknown as NormativFajlTartalom,
  'modszer/hutes': d_modszer_hutes as unknown as NormativFajlTartalom,
  'modszer/indikatorok': d_modszer_indikatorok as unknown as NormativFajlTartalom,
  'modszer/jelolesek': d_modszer_jelolesek as unknown as NormativFajlTartalom,
  'modszer/megujulok': d_modszer_megujulok as unknown as NormativFajlTartalom,
  'modszer/netto_energiaigeny': d_modszer_netto_energiaigeny as unknown as NormativFajlTartalom,
  'modszer/nyilaszarok': d_modszer_nyilaszarok as unknown as NormativFajlTartalom,
  'modszer/profilok': d_modszer_profilok as unknown as NormativFajlTartalom,
  'modszer/szellozes': d_modszer_szellozes as unknown as NormativFajlTartalom,
  'modszer/vilagitas': d_modszer_vilagitas as unknown as NormativFajlTartalom,
  'modszer/zonazas': d_modszer_zonazas as unknown as NormativFajlTartalom,
  'szabvany/msz_en_12831_1': d_szabvany_msz_en_12831_1 as unknown as NormativFajlTartalom,
  'rendelet/176_2008_Korm_besorolas': d_rendelet_176_2008_Korm_besorolas as unknown as NormativFajlTartalom,
  'rendelet/9_2023_EKM_1_melleklet': d_rendelet_9_2023_EKM_1_melleklet as unknown as NormativFajlTartalom,
  'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek': d_rendelet_9_2023_EKM_2_3_5_melleklet_kovetelmenyek as unknown as NormativFajlTartalom,
  'rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok': d_rendelet_9_2023_EKM_7_melleklet_sulyozo_tenyezok as unknown as NormativFajlTartalom,
} as const satisfies Record<string, NormativFajlTartalom>;

export type NormativFajl = keyof typeof NORMATIV_FAJLOK;
