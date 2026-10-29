import type { HaviEredmeny, Minosites } from '@bimline/calc-core';
import type { Projekt, ProjektEredmeny, SzamitasKimenet } from '@bimline/model';
import type { Ful } from '../App.js';
import { Kartya, szam } from '../ui.js';

const OSZTALYOK = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const osztalySzin = (b: string): string => `hsl(${Math.round(140 - (Math.max(0, OSZTALYOK.indexOf(b.replace('2023', ''))) * 140) / 11)} 62% 36%)`;
const MIN: Record<Minosites, string> = { rossz: 'rossz', gyenge: 'gyenge', kozepes: 'közepes', jo: 'jó', kivalo: 'kiváló' };

/** WinWatt fecske 9.58 eredmények a beépített mintákhoz (tests/golden/expected). */
const WINWATT: Record<string, { Ep: number; CO2: number; besorolas: string; QFnet: number }> = {
  G1: { Ep: 88.2, CO2: 23.39, besorolas: 'B', QFnet: 3912 },
  G2: { Ep: -5.79, CO2: 1.42, besorolas: 'A+++', QFnet: 4608 },
  G3: { Ep: 52.19, CO2: 10.55, besorolas: 'A+', QFnet: 1068 },
};

/** A hiány helyéből a javításhoz tartozó fül. */
const hianyFul = (hely: string): Ful =>
  /^(Anyag|Rétegrend|Nyílászáró)/.test(hely) ? 'szerkezetek' : /^(Szellőzés|Fűtés|HMV|Hűtés|Napelem)/.test(hely) ? 'gepeszet' : hely === 'Épület' ? 'epulet' : 'helyisegek';

export function OsszegzoSav({ kimenet, onHianyok }: { kimenet: SzamitasKimenet | null; onHianyok: () => void }) {
  if (!kimenet) return null;
  if (!kimenet.rendben)
    return (
      <button class="osszegzes hianyos" onClick={onHianyok}>
        <span class="jelveny ures">?</span>
        <span>
          <b>{kimenet.hianyok.length} hiányzó vagy hibás adat</b>
          <span class="halk"> – érintsd meg a listához</span>
        </span>
      </button>
    );
  const e = kimenet.eredmeny;
  return (
    <div class="osszegzes" aria-live="polite">
      <span class="jelveny" style={{ '--osztaly': osztalySzin(e.besorolasEp) }}>
        <span>{e.besorolasEp.replace('2023', '')}</span>
        <small>2023</small>
      </span>
      <dl class="fo">
        <div>
          <dt>
            E<sub>nren</sub>
          </dt>
          <dd>
            {szam(e.Ep, 2)}
            <em>kWh/m²a</em>
          </dd>
        </div>
        <div>
          <dt>CO₂</dt>
          <dd>
            {szam(e.CO2, 2)}
            <em>kg/m²a</em>
          </dd>
        </div>
        <div>
          <dt>arány</dt>
          <dd>
            {szam(e.EpArany, 1)}
            <em>%</em>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function HaviDiagram({ havi }: { havi: HaviEredmeny[] }) {
  const max = Math.max(1, ...havi.map((h) => Math.max(h.QFnet, h.QHnet)));
  const lepes = max > 1500 ? 500 : max > 600 ? 200 : max > 250 ? 100 : 50;
  const felso = Math.ceil(max / lepes) * lepes;
  const W = 340;
  const H = 170;
  const bal = 40;
  const lent = 22;
  const szel = (W - bal - 6) / 12;
  const y = (v: number): number => H - lent - (v / felso) * (H - lent - 10);
  const racs: number[] = [];
  for (let v = 0; v <= felso; v += lepes) racs.push(v);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Havi nettó fűtési és hűtési igény">
        {racs.map((v) => (
          <g key={v}>
            <line x1={bal} x2={W - 4} y1={y(v)} y2={y(v)} class="racsvonal" />
            <text x={bal - 6} y={y(v) + 4} class="tengely" text-anchor="end">
              {v}
            </text>
          </g>
        ))}
        {havi.map((h, i) => {
          const x = bal + i * szel + 3;
          const w = (szel - 6) / 2;
          return (
            <g key={i}>
              <rect x={x} y={y(h.QFnet)} width={w} height={Math.max(0, H - lent - y(h.QFnet))} class="oszlop-f">
                <title>{`${h.honap}. hó fűtés: ${szam(h.QFnet, 0)} kWh`}</title>
              </rect>
              <rect x={x + w} y={y(h.QHnet)} width={w} height={Math.max(0, H - lent - y(h.QHnet))} class="oszlop-h">
                <title>{`${h.honap}. hó hűtés: ${szam(h.QHnet, 0)} kWh`}</title>
              </rect>
              <text x={x + w} y={H - 6} class="tengely" text-anchor="middle">
                {'JFMAMJJASOND'[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <div class="jelmagyarazat">
        <span>
          <i class="j-f" />Q<sub>F,net</sub>
        </span>
        <span>
          <i class="j-h" />Q<sub>H,net</sub>
        </span>
        <span class="halk">kWh/hó</span>
      </div>
    </>
  );
}

export function EredmenyNezet({ kimenet, minta, onUgras }: { p: Projekt; kimenet: SzamitasKimenet; minta: string | null; onUgras: (f: Ful) => void }) {
  if (!kimenet.rendben)
    return (
      <Kartya cim="Hiányzó vagy hibás adatok">
        <p class="halk">A számítás ezek javítása után fut le.</p>
        <ul class="hianyok">
          {kimenet.hianyok.map((h, i) => (
            <li key={i}>
              <b>{h.hely}</b>: {h.uzenet}
              <button class="link" onClick={() => onUgras(hianyFul(h.hely))}>
                Javítás ›
              </button>
            </li>
          ))}
        </ul>
      </Kartya>
    );
  const e: ProjektEredmeny = kimenet.eredmeny;
  const ww = minta ? WINWATT[minta] : undefined;
  const sor = (cimke: preact.ComponentChildren, ertek: string, w?: string) => (
    <tr>
      <th scope="row">{cimke}</th>
      <td>{ertek}</td>
      {ww && <td class="ww">{w ?? '–'}</td>}
    </tr>
  );
  const celNev: Record<string, string> = { F: 'Fűtés', HMV: 'Melegvíz', LT: 'Szellőzés', H: 'Hűtés', PV: 'Napelem (export)' };
  const celMax = Math.max(1, ...Object.values(e.celonkent).map((v) => Math.abs(v!.nren)));
  return (
    <>
      {ww && <p class="figyelem">A(z) {minta} minta: a jobb oszlop a WinWatt fecske 9.58 eredménye. A program mindenben a rendelet szerint számol; a WinWatt rendelettől eltérő pontjai: docs/WINWATT_NEM_RENDELETI.md.</p>}
      <Kartya cim="Összesítő">
        <div class="tablazat">
          <table>
            <thead>
              <tr>
                <th />
                <th>Program</th>
                {ww && <th class="ww">WinWatt</th>}
              </tr>
            </thead>
            <tbody>
              {sor(<>Besorolás (E<sub>nren</sub>)</>, e.besorolasEp, ww && `${ww.besorolas}2023`)}
              {sor('Besorolás (CO₂)', e.besorolasCO2)}
              {sor(<>E<sub>nren</sub> [kWh/m²a]</>, szam(e.Ep, 2), ww && szam(ww.Ep, 2))}
              {sor(<>E<sub>CO2</sub> [kg/m²a]</>, szam(e.CO2, 2), ww && szam(ww.CO2, 2))}
              {sor('Követelmény (közel nulla)', `${szam(e.EpMax, 1)} / ${szam(e.CO2Max, 1)}`)}
              {sor(<>Q<sub>F,net</sub> [kWh/a]</>, szam(e.QFnet, 0), ww && szam(ww.QFnet, 0))}
              {sor(<>Q<sub>H,net</sub> [kWh/a]</>, szam(e.QHnet, 0))}
              {sor('q [W/m³K]', `${szam(e.qm, 3)} ${e.qm <= e.qmMax ? '≤' : '>'} ${szam(e.qmMax, 3)}`)}
              {sor(
                'Nyári hővédelem (Σ g_H·A_ü / ΣA_ü)',
                e.nyariHovedelem.alkalmazando ? `${szam(e.nyariHovedelem.arany!, 3)} ${e.nyariHovedelem.megfelel ? '≤' : '>'} ${szam(e.nyariHovedelem.hatar, 2)}` : 'nem alkalmazandó',
                minta === 'G1' ? '0,450 > 0,3' : undefined,
              )}
              {sor('A/V [m²/m³]', szam(e.av, 3))}
              {sor(<>A<sub>N</sub> / V</>, `${szam(e.AN, 1)} m² / ${szam(e.V, 1)} m³`)}
              {sor('Fűtési rendszer', `${MIN[e.futesMinosites.minosites]} (${szam(e.futesMinosites.arany, 1)} %)`)}
              {sor('HMV-rendszer', `${MIN[e.hmvMinosites.minosites]} (${szam(e.hmvMinosites.arany, 1)} %)`)}
            </tbody>
          </table>
        </div>
      </Kartya>
      <Kartya cim="Havi nettó igény">
        <HaviDiagram havi={e.havi} />
      </Kartya>
      <Kartya cim="Felhasználási célonként">
        <div class="savok">
          {Object.entries(e.celonkent).map(([k, v]) => (
            <div class="sav" key={k}>
              <span>{celNev[k] ?? k}</span>
              <span class="sav-sin">
                <i class={v!.nren < 0 ? 'neg' : ''} style={{ width: `${(Math.abs(v!.nren) / celMax) * 100}%` }} />
              </span>
              <b>{szam(v!.nren, 2)}</b>
            </div>
          ))}
        </div>
        <p class="halk">Nem megújuló primerenergia, kWh/m²a.</p>
        <div class="tablazat">
          <table>
            <thead>
              <tr>
                <th>Cél</th>
                <th>Végső energia</th>
                <th>Segédenergia</th>
              </tr>
            </thead>
            <tbody>
              {e.vegso.map((v) => (
                <tr key={v.cel}>
                  <th scope="row">{v.nev}</th>
                  <td>
                    {szam(v.Q, 0)} kWh/a <small>{v.hordozo}</small>
                  </td>
                  <td>{szam(v.W, 1)} kWh/a</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartya>
      <Kartya cim="Szerkezetek és elemi követelmény">
        <div class="tablazat">
          <table>
            <thead>
              <tr>
                <th>Szerkezet</th>
                <th>A [m²]</th>
                <th>U</th>
                <th>
                  U<sub>max</sub>
                </th>
              </tr>
            </thead>
            <tbody>
              {e.szerkezetek.map((s, i) => (
                <tr key={i}>
                  <th scope="row">
                    {s.nev}
                    {s.megjegyzes && <small>{s.megjegyzes}</small>}
                  </th>
                  <td>{szam(s.A, 1)}</td>
                  <td>{szam(s.U, 3)}</td>
                  <td class={s.megfelel === null ? '' : s.megfelel ? 'jo' : 'rossz'}>{s.Umax === null ? '–' : szam(s.Umax, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p class="halk">
          H<sub>tr,D</sub> {szam(e.hTrD, 1)} W/K · H<sub>tr,T</sub> {szam(e.hTrT, 1)} W/K · H<sub>szell,F</sub> {szam(e.hSzellF, 1)} W/K
        </p>
      </Kartya>
      {(kimenet.figyelmeztetesek.length > 0 || e.jelzesek.length > 0) && (
        <Kartya cim="Figyelmeztetések">
          <ul class="hianyok">
            {kimenet.figyelmeztetesek.map((h, i) => (
              <li key={`f${i}`}>
                <b>{h.hely}</b>: {h.uzenet}
              </li>
            ))}
            {e.jelzesek.map((j, i) => (
              <li key={`j${i}`}>{j}</li>
            ))}
          </ul>
        </Kartya>
      )}
    </>
  );
}
