// PC-s gyors bevitel táblázatban: helyiségek, határolók, nyílások. Billentyűk: Tab a következő mező, Enter a következő
// sor ugyanazon oszlopa, Ctrl+Enter a sor másolása alá, Ctrl+Delete a sor törlése.
import { type Hatarolo, type Projekt, type Tuloldal } from '@bimline/model';
import type { JSX } from 'preact';
import type { Valtoztat } from '../App.js';
import { CellaSzam, Kartya, szam } from '../ui.js';
import { FUTETLEN } from './Helyisegek.js';
import { SZERKEZET_NEV } from './Szerkezetek.js';

const tuloldalKod = (t: Tuloldal): string => (t.fajta === 'fűtetlen' ? `fűtetlen:${t.ter}` : t.fajta);
const tuloldalbol = (k: string): Tuloldal => (k.startsWith('fűtetlen:') ? ({ fajta: 'fűtetlen', ter: k.slice(9) } as Tuloldal) : ({ fajta: k } as Tuloldal));
const TULOLDALAK = [
  { ertek: 'külső', nev: 'külső' },
  { ertek: 'talaj', nev: 'talaj' },
  ...FUTETLEN.map((f) => ({ ertek: `fűtetlen:${f}`, nev: `fűtetlen: ${f.replace(' határos födém vagy fal', '').replace(' határos fal', '').replace('Zárt, fűtetlen ', '')}` })),
  { ertek: 'fűtött szomszéd', nev: 'fűtött szomszéd' },
];

/** Billentyűkezelés egy táblázatra: a cellák `data-s` (sor) és `data-o` (oszlop) attribútummal. */
function billentyu(tabla: string, ujSor: ((s: number) => void) | null, torol: (s: number) => void) {
  return (e: JSX.TargetedKeyboardEvent<HTMLTableElement>): void => {
    const td = (e.target as HTMLElement).closest('td');
    if (!td?.dataset['s']) return;
    const s = Number(td.dataset['s']);
    const o = td.dataset['o'];
    const cel = (sor: number): HTMLElement | null => document.querySelector(`[data-tabla="${tabla}"] td[data-s="${sor}"][data-o="${o}"] :is(input,select)`);
    // Meglévő sorra azonnal (a gyors gépelés ne az előző mezőbe menjen), új sorra a kirajzolás után.
    const fokusz = (sor: number): void => {
      const m = cel(sor);
      if (m) m.focus();
      else requestAnimationFrame(() => cel(sor)?.focus());
    };
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!ujSor) return;
      ujSor(s);
      requestAnimationFrame(() => cel(s + 1)?.focus());
    } else if (e.key === 'Enter') {
      e.preventDefault();
      fokusz(e.shiftKey ? s - 1 : s + 1);
    } else if (e.key === 'Delete' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      torol(s);
      fokusz(Math.max(0, s - 1));
    }
  };
}

function Valaszt<T extends string>(p: { ertek: T; opciok: readonly { ertek: T; nev: string }[]; cimke: string; onValtozas: (x: T) => void }) {
  return (
    <select class="cella" aria-label={p.cimke} value={p.ertek} onChange={(e) => p.onValtozas((e.target as HTMLSelectElement).value as T)}>
      {p.opciok.map((o) => (
        <option key={o.ertek} value={o.ertek}>
          {o.nev}
        </option>
      ))}
    </select>
  );
}

export function TablazatNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  // Lapos sorlisták: a sor indexe a táblázatban, a hivatkozás az eredeti helyre.
  const hatSorok = p.helyisegek.flatMap((h, i) => h.hatarolok.map((b, j) => ({ h, i, b, j })));
  const nySorok = hatSorok.flatMap((x) => x.b.nyilasok.map((n, k) => ({ ...x, n, k })));
  const rrOpciok = p.retegrendek.filter((r) => r.szerkezet !== 'talajjal_erintkezo_fal').map((r) => ({ ertek: r.azon, nev: `${r.nev} (${SZERKEZET_NEV[r.szerkezet]})` }));
  const vb = (i: number, j: number, f: (b: Hatarolo) => void): void => valtoztat((x) => f(x.helyisegek[i]!.hatarolok[j]!));

  return (
    <>
      <p class="halk">
        Tab: következő mező · Enter: következő sor · Ctrl+Enter: nyílás másolása alá · Ctrl+Delete: sor törlése. Helyiséget és határolót csak az Alaprajz fülön lehet felvenni; a méretek, felületek és tájolások kizárólag a rajzból jönnek (szürke, D-152).
      </p>
      <Kartya cim={`Helyiségek (${p.helyisegek.length})`}>
        <div class="tablazat">
          <table
            class="beviteli"
            data-tabla="hs"
            onKeyDown={billentyu(
              'hs',
              null,
              (s) => valtoztat((x) => void x.helyisegek.splice(s, 1)),
            )}
          >
            <thead>
              <tr>
                <th>Név</th>
                <th>Szint</th>
                <th>
                  A<sub>N</sub> [m²]
                </th>
                <th>Belmagasság [m]</th>
                <th>Határolók</th>
              </tr>
            </thead>
            <tbody>
              {p.helyisegek.map((h, s) => (
                <tr key={h.azon}>
                  <td data-s={s} data-o="nev">
                    <input class="cella" aria-label="Név" value={h.nev} onFocus={(e) => (e.target as HTMLInputElement).select()} onInput={(e) => valtoztat((x) => void (x.helyisegek[s]!.nev = (e.target as HTMLInputElement).value))} />
                  </td>
                  <td data-s={s} data-o="szint">
                    <input class="cella rovid" aria-label="Szint" value={h.szint} onFocus={(e) => (e.target as HTMLInputElement).select()} onInput={(e) => valtoztat((x) => void (x.helyisegek[s]!.szint = (e.target as HTMLInputElement).value))} />
                  </td>
                  <td data-s={s} data-o="a">
                    <CellaSzam cimke="Alapterület" ertek={h.alapterulet} tiltott tized={2} onValtozas={(v) => valtoztat((x) => void (x.helyisegek[s]!.alapterulet = v))} />
                  </td>
                  <td data-s={s} data-o="m">
                    <CellaSzam cimke="Belmagasság" ertek={h.belmagassag} onValtozas={(v) => valtoztat((x) => void (x.helyisegek[s]!.belmagassag = v))} />
                  </td>
                  <td class="halk">{h.hatarolok.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartya>

      <Kartya
        cim={`Határolók (${hatSorok.length})`}
      >
        <div class="tablazat">
          <table
            class="beviteli"
            data-tabla="hat"
            onKeyDown={billentyu(
              'hat',
              null,
              (s) => {
                const r = hatSorok[s];
                if (r) valtoztat((x) => void x.helyisegek[r.i]!.hatarolok.splice(r.j, 1));
              },
            )}
          >
            <thead>
              <tr>
                <th>Helyiség</th>
                <th>Szerkezet</th>
                <th>Túloldal</th>
                <th>Tájolás</th>
                <th>Felület [m²]</th>
                <th>Hajlás [°]</th>
                <th>Kitett ker. [m]</th>
                <th>Nyílás [m²]</th>
              </tr>
            </thead>
            <tbody>
              {hatSorok.map(({ h, i, b, j }, s) => {
                const rajz = b.rajzEl !== undefined || b.rajzAlap !== undefined;
                const padlo = p.retegrendek.find((r) => r.azon === b.retegrendAzon)?.szerkezet === 'talajon_fekvo_padlo';
                const nyA = b.nyilasok.reduce((t, n) => t + n.szelesseg * n.magassag * n.db, 0);
                return (
                  <tr key={b.azon}>
                    <td data-s={s} data-o="hs">
                      <span class="cella-ro">{h.nev}</span>
                    </td>
                    <td data-s={s} data-o="r">
                      <Valaszt cimke="Szerkezet" ertek={b.retegrendAzon} opciok={rrOpciok} onValtozas={(v) => vb(i, j, (x) => void (x.retegrendAzon = v))} />
                    </td>
                    <td data-s={s} data-o="t">
                      <Valaszt cimke="Túloldal" ertek={tuloldalKod(b.tuloldal)} opciok={TULOLDALAK} onValtozas={(v) => vb(i, j, (x) => void (x.tuloldal = tuloldalbol(v)))} />
                    </td>
                    <td data-s={s} data-o="taj">
                      <span class="cella-ro">{b.tajolas ?? '–'}</span>
                    </td>
                    <td data-s={s} data-o="a">
                      <CellaSzam cimke="Felület" ertek={b.felulet} tiltott onValtozas={(v) => vb(i, j, (x) => void (x.felulet = v))} />
                    </td>
                    <td data-s={s} data-o="hs2">
                      <CellaSzam cimke="Hajlásszög" ertek={b.hajlasszog ?? 90} tiltott={rajz} tized={0} onValtozas={(v) => vb(i, j, (x) => void (x.hajlasszog = v))} />
                    </td>
                    <td data-s={s} data-o="p">
                      {padlo ? <CellaSzam cimke="Kitett kerület" ertek={b.kitettKerulet} tiltott={b.rajzAlap === undefined || h.hatarolok.filter((x) => x.rajzAlap === 'alatta').length === 1} onValtozas={(v) => vb(i, j, (x) => void (x.kitettKerulet = v))} /> : <span class="cella-ro">–</span>}
                    </td>
                    <td class="halk">{nyA > 0 ? szam(nyA, 2) : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Kartya>

      <Kartya
        cim={`Nyílások (${nySorok.length})`}
        jobb={
          <button
            class="masodlagos"
            disabled={!hatSorok.length || !p.nyilaszarok.length}
            onClick={() => {
              const cel = [...hatSorok].reverse().find((x) => (x.b.hajlasszog ?? 90) >= 60) ?? hatSorok.at(-1)!;
              valtoztat((x) => void x.helyisegek[cel.i]!.hatarolok[cel.j]!.nyilasok.push({ nyilaszaroAzon: (x.nyilaszarok.find((t) => t.fajta === 'ablak') ?? x.nyilaszarok[0]!).azon, szelesseg: 1.2, magassag: 1.5, db: 1 }));
            }}
          >
            + Sor
          </button>
        }
      >
        <div class="tablazat">
          <table
            class="beviteli"
            data-tabla="ny"
            onKeyDown={billentyu(
              'ny',
              (s) => {
                const r = nySorok[s];
                if (r) valtoztat((x) => void x.helyisegek[r.i]!.hatarolok[r.j]!.nyilasok.splice(r.k + 1, 0, { ...r.n }));
              },
              (s) => {
                const r = nySorok[s];
                if (r) valtoztat((x) => void x.helyisegek[r.i]!.hatarolok[r.j]!.nyilasok.splice(r.k, 1));
              },
            )}
          >
            <thead>
              <tr>
                <th>Határoló</th>
                <th>Nyílászáró</th>
                <th>Szélesség [m]</th>
                <th>Magasság [m]</th>
                <th>db</th>
              </tr>
            </thead>
            <tbody>
              {nySorok.map(({ i, b, j, n, k }, s) => {
                const vn = (f: (x: typeof n) => void): void => valtoztat((x) => f(x.helyisegek[i]!.hatarolok[j]!.nyilasok[k]!));
                return (
                  <tr key={`${b.azon}-${k}`}>
                    <td data-s={s} data-o="hat">
                      <Valaszt
                        cimke="Határoló"
                        ertek={b.azon}
                        opciok={hatSorok.filter((x) => (x.b.hajlasszog ?? 90) >= 60 || x.b.azon === b.azon).map((x) => ({ ertek: x.b.azon, nev: `${x.h.nev} · ${p.retegrendek.find((r) => r.azon === x.b.retegrendAzon)?.nev ?? '?'} ${x.b.tajolas ?? ''}` }))}
                        onValtozas={(az) =>
                          valtoztat((x) => {
                            const [m] = x.helyisegek[i]!.hatarolok[j]!.nyilasok.splice(k, 1);
                            x.helyisegek.flatMap((y) => y.hatarolok).find((y) => y.azon === az)!.nyilasok.push(m!);
                          })
                        }
                      />
                    </td>
                    <td data-s={s} data-o="t">
                      <Valaszt cimke="Nyílászáró" ertek={n.nyilaszaroAzon} opciok={p.nyilaszarok.map((t) => ({ ertek: t.azon, nev: t.nev }))} onValtozas={(v) => vn((x) => void (x.nyilaszaroAzon = v))} />
                    </td>
                    <td data-s={s} data-o="x">
                      <CellaSzam cimke="Szélesség" ertek={n.szelesseg} onValtozas={(v) => vn((x) => void (x.szelesseg = v))} />
                    </td>
                    <td data-s={s} data-o="y">
                      <CellaSzam cimke="Magasság" ertek={n.magassag} onValtozas={(v) => vn((x) => void (x.magassag = v))} />
                    </td>
                    <td data-s={s} data-o="db">
                      <CellaSzam cimke="Darab" ertek={n.db} tized={0} onValtozas={(v) => vn((x) => void (x.db = Math.max(1, Math.round(v))))} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p class="halk">{h0(p)}</p>
      </Kartya>
    </>
  );
}

const h0 = (p: Projekt): string => {
  const A = p.helyisegek.flatMap((h) => h.hatarolok).flatMap((b) => b.nyilasok).reduce((s, n) => s + n.szelesseg * n.magassag * n.db, 0);
  return `Nyílások összesen ${szam(A, 2)} m².`;
};
