// Bemutató felület: mobilra tervezett bevitel és eredmény a számítási mag kipróbálására.
import { MINTAK, OLDALAK, mintaMasolat, type Minta, type Projekt, type Reteg } from './modell.js';
import { minositesSzoveg, szamol, type Eredmeny } from './szamitas.js';

const TAROLO_KULCS = 'bimline-demo-projekt-v1';
const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

let minta: Minta | null = MINTAK[0]!;
let projekt: Projekt = mintaMasolat(MINTAK[0]!);
let modositva = false;

try {
  const mentett = localStorage.getItem(TAROLO_KULCS);
  if (mentett) {
    const m = JSON.parse(mentett) as { projekt: Projekt; minta: string | null; modositva: boolean };
    projekt = m.projekt;
    minta = MINTAK.find((x) => x.azon === m.minta) ?? null;
    modositva = m.modositva;
  }
} catch {
  /* a tárolás nem elérhető – a minta marad */
}

const ment = (): void => {
  try {
    localStorage.setItem(TAROLO_KULCS, JSON.stringify({ projekt, minta: minta?.azon ?? null, modositva }));
  } catch {
    /* nem kötelező */
  }
};

// ---------------------------------------------------------------------------------------------
// Számformázás (magyar tizedesvessző)
// ---------------------------------------------------------------------------------------------

const szam = (x: number, tized = 1): string =>
  x.toLocaleString('hu-HU', { minimumFractionDigits: tized, maximumFractionDigits: tized }).replace(/\u00a0/g, '\u202f');
const beolvas = (s: string): number => Number(s.replace(/\s/g, '').replace(',', '.'));
const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// ---------------------------------------------------------------------------------------------
// Állapot-elérés útvonallal: "futes.hoelado", "falRetegek.1.d"
// ---------------------------------------------------------------------------------------------

function olvas(ut: string): unknown {
  return ut.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], projekt);
}
function ir(ut: string, ertek: unknown): void {
  const r = ut.split('.');
  const utolso = r.pop()!;
  const szulo = r.reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], projekt) as Record<string, unknown>;
  szulo[utolso] = ertek;
}

const szamMezo = (ut: string, cimke: string, egyseg = '', lepes = 'any'): string => {
  const v = olvas(ut) as number;
  return `<label class="mezo"><span class="cimke">${cimke}</span><span class="bevitel"><input id="m-${ut}" data-ut="${ut}" data-tipus="szam" inputmode="decimal" step="${lepes}" value="${String(v).replace('.', ',')}">${egyseg ? `<em>${egyseg}</em>` : ''}</span></label>`;
};
const valasztoMezo = (ut: string, cimke: string, opciok: readonly (string | number)[]): string => {
  const v = olvas(ut);
  return `<label class="mezo"><span class="cimke">${cimke}</span><select id="m-${ut}" data-ut="${ut}" data-tipus="${typeof v === 'number' ? 'szam' : 'szoveg'}">${opciok
    .map((o) => `<option value="${o}"${o === v ? ' selected' : ''}>${o}</option>`)
    .join('')}</select></label>`;
};
const kapcsolo = (ut: string, cimke: string): string =>
  `<label class="kapcsolo"><input type="checkbox" id="m-${ut}" data-ut="${ut}" data-tipus="logikai"${olvas(ut) ? ' checked' : ''}><span>${cimke}</span></label>`;

function retegSzerkeszto(kulcs: 'falRetegek' | 'tetoRetegek' | 'padloRetegek' | 'garazsfalRetegek', cim: string, megjegyzes: string): string {
  const retegek = projekt[kulcs];
  return `<div class="retegrend">
    <div class="retegrend-fej"><h3>${cim}</h3><span class="halk">${megjegyzes}</span></div>
    <div class="retegek">${retegek
      .map(
        (r: Reteg, i) => `<div class="reteg">
        <input class="reteg-nev" id="m-${kulcs}.${i}.nev" data-ut="${kulcs}.${i}.nev" data-tipus="szoveg" value="${esc(r.nev)}" aria-label="Réteg neve">
        <span class="bevitel kicsi"><input id="m-${kulcs}.${i}.d" data-ut="${kulcs}.${i}.d" data-tipus="szam" inputmode="decimal" value="${String(r.d).replace('.', ',')}" aria-label="Vastagság"><em>cm</em></span>
        <span class="bevitel kicsi"><input id="m-${kulcs}.${i}.lambda" data-ut="${kulcs}.${i}.lambda" data-tipus="szam" inputmode="decimal" value="${String(r.lambda).replace('.', ',')}" aria-label="Hővezetési tényező"><em>W/mK</em></span>
        <button class="ikon" data-torol="${kulcs}.${i}" aria-label="Réteg törlése">×</button>
      </div>`,
      )
      .join('')}</div>
    <button class="masodlagos" data-uj-reteg="${kulcs}">+ Réteg</button>
  </div>`;
}

function bevitelRajzol(): void {
  const p = projekt;
  const hrv = p.szellozes.tipus === 'hővisszanyerős';
  $('#bevitel').innerHTML = `
  <section class="kartya"><h2>Épület</h2>
    <div class="racs">
      ${szamMezo('hossz', 'Hossz (É/D homlokzat)', 'm')}
      ${szamMezo('szelesseg', 'Szélesség (K/Ny homlokzat)', 'm')}
      ${szamMezo('szintek', 'Fűtött szintek', 'db')}
      ${szamMezo('belmagassag', 'Belmagasság', 'm')}
      ${valasztoMezo('funkcio', 'Rendeltetés', ['Családi ház*', 'Egyéb lakóépület*'])}
      ${valasztoMezo('teto', 'Felül', ['lapostető', 'padlásfödém'])}
      ${valasztoMezo('padlo', 'Alul', ['talajon fekvő', 'pince felett'])}
      ${valasztoMezo('garazsOldal', 'Fűtetlen garázs melletti fal', ['nincs', ...OLDALAK])}
      ${valasztoMezo('cmKategoria', 'Hőtároló tömeg (6.5. tábla)', [1, 2, 3, 4])}
      ${szamMezo('nFilt', 'Tömítetlenségi légcsere', '1/h')}
    </div>
  </section>
  <section class="kartya"><h2>Rétegrendek</h2>
    <p class="halk">Kívülről befelé. A λ tesztérték; valós projektnél termékadatlapról.</p>
    ${retegSzerkeszto('falRetegek', 'Külső fal', 'R_si 0,13 · R_se 0,04')}
    ${retegSzerkeszto('tetoRetegek', p.teto === 'lapostető' ? 'Lapostető' : 'Padlásfödém', p.teto === 'lapostető' ? 'R_si 0,10 · R_se 0,04' : 'R_si 0,10 mindkét oldalon, b = 0,9')}
    ${retegSzerkeszto('padloRetegek', p.padlo === 'talajon fekvő' ? 'Talajon fekvő padló' : 'Pincefödém', p.padlo === 'talajon fekvő' ? 'talaj λ = 2,0; a (4.20)–(4.23) szerint' : 'R_si 0,17 mindkét oldalon, b = 0,5 / 1,5')}
    ${p.garazsOldal !== 'nincs' ? retegSzerkeszto('garazsfalRetegek', 'Fal fűtetlen garázs felé', 'R_si 0,13 mindkét oldalon, b = 0,9') : ''}
  </section>
  <section class="kartya"><h2>Nyílászárók</h2>
    <div class="racs">
      ${szamMezo('ablak.Ug', 'Üvegezés U_g', 'W/m²K')}
      ${szamMezo('ablak.Uf', 'Keret U_f', 'W/m²K')}
      ${szamMezo('ablak.keretMm', 'Keretszélesség', 'mm')}
      ${szamMezo('ablak.g', 'Üvegezés g', '–')}
    </div>
    <div class="nyilasok">${p.nyilasok
      .map(
        (n, i) => `<div class="nyilas">
        <select id="m-nyilasok.${i}.oldal" data-ut="nyilasok.${i}.oldal" data-tipus="szoveg" aria-label="Homlokzat">${OLDALAK.map((o) => `<option${o === n.oldal ? ' selected' : ''}>${o}</option>`).join('')}</select>
        <span class="bevitel kicsi"><input id="m-nyilasok.${i}.x" data-ut="nyilasok.${i}.x" data-tipus="szam" inputmode="decimal" value="${String(n.x).replace('.', ',')}" aria-label="Szélesség"><em>m</em></span>
        <span class="szor">×</span>
        <span class="bevitel kicsi"><input id="m-nyilasok.${i}.y" data-ut="nyilasok.${i}.y" data-tipus="szam" inputmode="decimal" value="${String(n.y).replace('.', ',')}" aria-label="Magasság"><em>m</em></span>
        <span class="bevitel kicsi"><input id="m-nyilasok.${i}.db" data-ut="nyilasok.${i}.db" data-tipus="szam" inputmode="numeric" value="${n.db}" aria-label="Darab"><em>db</em></span>
        <button class="ikon" data-torol="nyilasok.${i}" aria-label="Ablak törlése">×</button>
      </div>`,
      )
      .join('')}</div>
    <button class="masodlagos" data-uj-nyilas>+ Ablak</button>
    <div class="racs">
      ${valasztoMezo('ajto.oldal', 'Bejárati ajtó homlokzata', OLDALAK)}
      ${szamMezo('ajto.x', 'Ajtó szélesség', 'm')}
      ${szamMezo('ajto.y', 'Ajtó magasság', 'm')}
      ${szamMezo('ajto.U', 'Ajtó U (terv nélkül 1,4)', 'W/m²K')}
    </div>
  </section>
  <section class="kartya"><h2>Gépészet</h2>
    <div class="racs">
      ${valasztoMezo('futes.hotermelo', 'Fűtés hőtermelője', ['kondenzációs gázkazán', 'levegő-víz hőszivattyú'])}
      ${p.futes.hotermelo === 'kondenzációs gázkazán' ? valasztoMezo('futes.hotermeloHelye', 'Kazán helye', ['fűtött térben', 'fűtött téren kívül']) : ''}
      ${valasztoMezo('futes.hoelado', 'Hőleadó', ['radiátor 55/45', 'padlófűtés 35/28'])}
      ${valasztoMezo('futes.elosztasHelye', 'Elosztóvezetékek', ['fűtött térben', 'fűtött téren kívül'])}
    </div>
    ${kapcsolo('futes.puffer', 'Puffertároló a fűtött térben')}
    <div class="racs">
      ${valasztoMezo('hmv.hotermelo', 'Melegvíz', ['a fűtési gázkazán', 'levegős HMV-hőszivattyú'])}
      ${valasztoMezo('hutes', 'Hűtés', ['nincs', 'split klíma'])}
    </div>
    ${kapcsolo('hmv.cirkulacio', 'HMV-cirkuláció (EEI 0,23)')}
    <label class="kapcsolo"><input type="checkbox" id="m-hrv" data-hrv${hrv ? ' checked' : ''}><span>Hővisszanyerős gépi szellőzés</span></label>
    ${
      hrv
        ? `<div class="racs">${szamMezo('szellozes.n', 'Légcsere', '1/h')}${szamMezo('szellozes.eta', 'Hővisszanyerés η', '–')}${szamMezo('szellozes.dp', 'Nyomásesés Δp', 'Pa')}${szamMezo('szellozes.etaVent', 'Ventilátor η', '–')}${szamMezo('szellozes.uzemido', 'Üzemidő', 'h/év')}</div>`
        : ''
    }
    <div class="racs">
      ${szamMezo('napelem.kWp', 'Napelem', 'kWp')}
      ${valasztoMezo('napelem.tajolas', 'Napelem tájolás', ['D', 'DK', 'DNy', 'K', 'Ny'])}
      ${szamMezo('napelem.dolesszog', 'Napelem dőlésszög', '°')}
      ${valasztoMezo('refHohidassag', 'Referencia hőhidassága', ['gyengén hőhidas', 'közepesen hőhidas', 'erősen hőhidas'])}
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------------------------
// Eredmény
// ---------------------------------------------------------------------------------------------

const OSZTALYOK = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const osztalySzin = (b: string): string => {
  const i = Math.max(0, OSZTALYOK.indexOf(b.replace('2023', '')));
  return `hsl(${Math.round(140 - (i * 140) / 11)} 62% 36%)`;
};

function haviDiagram(e: Eredmeny): string {
  const max = Math.max(1, ...e.havi.map((h) => Math.max(h.QFnet, h.QHnet)));
  const lepes = max > 1500 ? 500 : max > 600 ? 200 : max > 250 ? 100 : 50;
  const felso = Math.ceil(max / lepes) * lepes;
  const W = 340;
  const H = 170;
  const bal = 40;
  const lent = 22;
  const szel = (W - bal - 6) / 12;
  const y = (v: number): number => H - lent - (v / felso) * (H - lent - 10);
  const racs: string[] = [];
  for (let v = 0; v <= felso; v += lepes) {
    racs.push(`<line x1="${bal}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" class="racsvonal"/><text x="${bal - 6}" y="${y(v) + 4}" class="tengely" text-anchor="end">${v}</text>`);
  }
  const oszlopok = e.havi
    .map((h, i) => {
      const x = bal + i * szel + 3;
      const w = (szel - 6) / 2;
      return `<rect x="${x}" y="${y(h.QFnet)}" width="${w}" height="${Math.max(0, H - lent - y(h.QFnet))}" class="oszlop-f"><title>${h.honap}. hó fűtés: ${szam(h.QFnet, 0)} kWh</title></rect>
      <rect x="${x + w}" y="${y(h.QHnet)}" width="${w}" height="${Math.max(0, H - lent - y(h.QHnet))}" class="oszlop-h"><title>${h.honap}. hó hűtés: ${szam(h.QHnet, 0)} kWh</title></rect>
      <text x="${x + w}" y="${H - 6}" class="tengely" text-anchor="middle">${'JFMAMJJASOND'[i]}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Havi nettó fűtési és hűtési igény">${racs.join('')}${oszlopok}</svg>
  <div class="jelmagyarazat"><span><i class="j-f"></i>Q<sub>F,net</sub></span><span><i class="j-h"></i>Q<sub>H,net</sub></span><span class="halk">kWh/hó</span></div>`;
}

function eredmenyRajzol(): void {
  let e: Eredmeny;
  try {
    e = szamol(projekt);
  } catch (hiba) {
    $('#osszegzes').innerHTML = `<div class="hiba"><strong>A számítás megállt.</strong> ${esc((hiba as Error).message)}</div>`;
    $('#reszletek').innerHTML = '';
    return;
  }
  const ww = minta && !modositva ? minta.winwatt : null;
  $('#osszegzes').innerHTML = `
    <div class="jelveny" style="--osztaly:${osztalySzin(e.besorolasEp)}"><span>${e.besorolasEp.replace('2023', '')}</span><small>2023</small></div>
    <dl class="fo">
      <div><dt>E<sub>nren</sub></dt><dd>${szam(e.Ep, 2)}<em>kWh/m²a</em></dd></div>
      <div><dt>CO₂</dt><dd>${szam(e.CO2, 2)}<em>kg/m²a</em></dd></div>
      <div><dt>arány</dt><dd>${szam(e.EpArany, 1)}<em>%</em></dd></div>
    </dl>`;
  const sor = (cimke: string, ertek: string, wwErtek?: string): string =>
    `<tr><th scope="row">${cimke}</th><td>${ertek}</td>${ww ? `<td class="ww">${wwErtek ?? '–'}</td>` : ''}</tr>`;
  $('#reszletek').innerHTML = `
  ${
    ww
      ? `<p class="figyelem">A(z) ${minta!.azon} minta változatlan: a jobb oszlop a WinWatt fecske 9.58 eredménye. Az eltérések okai a docs/ELTERESEK_WINWATT.md-ben (talaj E-03, hőtároló tömeg E-13, nyári szellőzés E-15/E-16, referencia E-18).</p>`
      : `<p class="halk">${minta ? `A(z) ${minta.azon} mintát módosítottad, ezért a WinWatt-összevetés nem látszik.` : 'Saját adatok.'}</p>`
  }
  <section class="kartya"><h2>Összesítő</h2>
    <div class="tablazat"><table>
      <thead><tr><th></th><th>Program</th>${ww ? '<th class="ww">WinWatt</th>' : ''}</tr></thead>
      <tbody>
      ${sor('Besorolás (E<sub>nren</sub>)', e.besorolasEp, ww ? `${ww.besorolasEp}2023` : undefined)}
      ${sor('Besorolás (CO₂)', e.besorolasCO2)}
      ${sor('E<sub>nren</sub> [kWh/m²a]', szam(e.Ep, 2), ww ? szam(ww.Ep, 2) : undefined)}
      ${sor('E<sub>CO2</sub> [kg/m²a]', szam(e.CO2, 2), ww ? szam(ww.CO2, 2) : undefined)}
      ${sor('Követelmény E<sub>nren</sub> / CO₂', `${szam(e.EpMax, 1)} / ${szam(e.CO2Max, 1)}`)}
      ${sor('Q<sub>F,net</sub> [kWh/a]', szam(e.QFnet, 0), ww ? szam(ww.QFnet, 0) : undefined)}
      ${sor('Q<sub>H,net</sub> [kWh/a]', szam(e.QHnet, 0))}
      ${sor('q fajl. hőveszteség [W/m³K]', `${szam(e.qm, 3)} <span class="${e.qm <= e.qmMax ? 'jo' : 'rossz'}">≤ ${szam(e.qmMax, 3)}</span>`)}
      ${sor('A / V [m²/m³]', szam(e.av, 3))}
      ${sor('A<sub>N</sub> / V', `${szam(e.AN, 1)} m² / ${szam(e.V, 1)} m³`)}
      ${sor('Fűtési rendszer minősítése', `${minositesSzoveg(e.futesMinosites.minosites)} (${szam(e.futesMinosites.arany, 1)} %)`, ww ? (ww.futesMinosites ?? 'nincs adat') : undefined)}
      ${sor('HMV-rendszer minősítése', `${minositesSzoveg(e.hmvMinosites.minosites)} (${szam(e.hmvMinosites.arany, 1)} %)`, ww ? (ww.hmvMinosites ?? '–') : undefined)}
      </tbody></table></div>
  </section>
  <section class="kartya"><h2>Havi nettó igény</h2>${haviDiagram(e)}</section>
  <section class="kartya"><h2>Felhasználási célonként</h2>
    <div class="savok">${Object.entries(e.celonkent)
      .map(([k, v]) => {
        const nev = ({ F: 'Fűtés', HMV: 'Melegvíz', LT: 'Szellőzés', H: 'Hűtés', PV: 'Napelem (export)' } as Record<string, string>)[k] ?? k;
        const max = Math.max(...Object.values(e.celonkent).map(Math.abs), 1);
        return `<div class="sav"><span>${nev}</span><span class="sav-sin"><i class="${v < 0 ? 'neg' : ''}" style="width:${(Math.abs(v) / max) * 100}%"></i></span><b>${szam(v, 2)}</b></div>`;
      })
      .join('')}</div>
    <p class="halk">Nem megújuló primerenergia, kWh/m²a. Napelemnél a teljes termelés exportált (13.1): ${szam(e.pv, 0)} kWh/a.</p>
    <div class="tablazat"><table><tbody>
      <tr><th scope="row">Fűtés végső energia</th><td>${szam(e.futesVeg.Q, 0)} kWh/a ${e.futesVeg.hordozo} + ${szam(e.futesVeg.W, 1)} kWh/a segédenergia</td></tr>
      <tr><th scope="row">HMV végső energia</th><td>${szam(e.hmvVeg.Q, 0)} kWh/a ${e.hmvVeg.hordozo} + ${szam(e.hmvVeg.W, 1)} kWh/a segédenergia</td></tr>
      ${e.ltW > 0 ? `<tr><th scope="row">Ventilátor</th><td>${szam(e.ltW, 1)} kWh/a</td></tr>` : ''}
      ${e.hutesVeg > 0 ? `<tr><th scope="row">Hűtés</th><td>${szam(e.hutesVeg, 0)} kWh/a villamos</td></tr>` : ''}
    </tbody></table></div>
  </section>
  <section class="kartya"><h2>Szerkezetek</h2>
    <div class="tablazat"><table>
      <thead><tr><th>Szerkezet</th><th>A [m²]</th><th>U</th><th>U<sub>max</sub></th></tr></thead>
      <tbody>${e.szerkezetek
        .map(
          (s) => `<tr><th scope="row">${s.nev}${s.megjegyzes ? `<small>${s.megjegyzes}</small>` : ''}</th><td>${szam(s.A, 1)}</td><td>${szam(s.U, 3)}</td><td><span class="${s.megfelel === null ? '' : s.megfelel ? 'jo' : 'rossz'}">${s.Umax === null ? '–' : szam(s.Umax, 2)}</span></td></tr>`,
        )
        .join('')}</tbody></table></div>
    <p class="halk">H<sub>tr,D</sub> ${szam(e.hTrD, 1)} W/K · H<sub>tr,T</sub> ${szam(e.hTrT, 1)} W/K · H<sub>szell,F</sub> ${szam(e.hSzellF, 1)} W/K. Hőhíd-korrekció nincs (a golden esetekkel azonosan).</p>
  </section>
  ${e.jelzesek.length ? `<section class="kartya"><h2>Jelzések</h2><ul class="jelzesek">${e.jelzesek.map((j) => `<li>${esc(j)}</li>`).join('')}</ul></section>` : ''}`;
}

// ---------------------------------------------------------------------------------------------
// Események
// ---------------------------------------------------------------------------------------------

function mintakRajzol(): void {
  $('#mintak').innerHTML =
    MINTAK.map((m) => `<button class="minta${minta?.azon === m.azon && !modositva ? ' aktiv' : ''}" data-minta="${m.azon}">${m.cim}</button>`).join('') +
    `<button class="minta masodlagos" data-alaphelyzet>Minta visszaállítása</button>`;
  $('#projekt-nev').textContent = projekt.nev + (modositva ? ' (módosítva)' : '');
}

let idozito = 0;
function frissit(bevitelIs = false): void {
  if (bevitelIs) bevitelRajzol();
  mintakRajzol();
  window.clearTimeout(idozito);
  idozito = window.setTimeout(() => {
    eredmenyRajzol();
    ment();
  }, 120);
}

document.addEventListener('input', (ev) => {
  const el = ev.target as HTMLInputElement | HTMLSelectElement;
  const ut = el.dataset['ut'];
  if (!ut) return;
  const tipus = el.dataset['tipus'];
  if (tipus === 'szam') {
    const v = beolvas(el.value);
    if (!Number.isFinite(v)) return;
    ir(ut, v);
  } else if (tipus === 'logikai') ir(ut, (el as HTMLInputElement).checked);
  else ir(ut, el.value);
  modositva = true;
  const szerkezeti = el.tagName === 'SELECT' && /^(teto|padlo|garazsOldal|futes\.hotermelo)$/.test(ut);
  if (szerkezeti) {
    if (ut === 'teto') projekt.tetoRetegek = mintaMasolat(MINTAK[ut === 'teto' && projekt.teto === 'padlásfödém' ? 1 : 0]!).tetoRetegek;
    if (ut === 'padlo') projekt.padloRetegek = mintaMasolat(MINTAK[projekt.padlo === 'pince felett' ? 2 : 0]!).padloRetegek;
  }
  frissit(szerkezeti);
});

document.addEventListener('change', (ev) => {
  const el = ev.target as HTMLInputElement;
  if (el.dataset['hrv'] === undefined) return;
  projekt.szellozes = el.checked ? { tipus: 'hővisszanyerős', n: 0.5, eta: 0.85, dp: 150, etaVent: 0.5, uzemido: 5088 } : { tipus: 'természetes' };
  modositva = true;
  frissit(true);
});

document.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest('button');
  if (!el) return;
  if (el.dataset['minta']) {
    minta = MINTAK.find((m) => m.azon === el.dataset['minta'])!;
    projekt = mintaMasolat(minta);
    modositva = false;
    frissit(true);
  } else if (el.dataset['alaphelyzet'] !== undefined) {
    if (minta) {
      projekt = mintaMasolat(minta);
      modositva = false;
      frissit(true);
    }
  } else if (el.dataset['torol']) {
    const r = el.dataset['torol'].split('.');
    const lista = projekt[r[0] as 'nyilasok'] as unknown[];
    lista.splice(Number(r[1]), 1);
    modositva = true;
    frissit(true);
  } else if (el.dataset['ujReteg']) {
    (projekt[el.dataset['ujReteg'] as 'falRetegek'] as Reteg[]).push({ nev: 'Új réteg', d: 1, lambda: 1 });
    modositva = true;
    frissit(true);
  } else if (el.dataset['ujNyilas'] !== undefined) {
    projekt.nyilasok.push({ oldal: 'D', x: 1.2, y: 1.5, db: 1 });
    modositva = true;
    frissit(true);
  } else if (el.dataset['ful']) {
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-ful]')) b.setAttribute('aria-selected', String(b === el));
    $('#bevitel').hidden = el.dataset['ful'] !== 'bevitel';
    $('#reszletek').hidden = el.dataset['ful'] !== 'eredmeny';
    window.scrollTo({ top: 0 });
  }
});

frissit(true);
