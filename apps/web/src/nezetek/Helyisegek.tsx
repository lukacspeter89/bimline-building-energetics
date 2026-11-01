// Terepi bevitel: helyiségenként a határolók tájolással és a nyílászárók méretekkel. Telefonon ez a fő nézet.
import { type Hatarolo, type Helyiseg, type Projekt, type Tuloldal } from '@bimline/model';
import { useState } from 'preact/hooks';
import type { Valtoztat } from '../App.js';
import { Gombsor, Kartya, Leptetos, SzamMezo, SzovegMezo, TorlesGomb, Valaszto, szam } from '../ui.js';
import { SZERKEZET_NEV } from './Szerkezetek.js';

export const FUTETLEN: readonly string[] = [
  'Padlástérrel határos födém vagy fal',
  'Zárt, fűtetlen pincével határos födém vagy fal',
  'Zárt, fűtetlen mélygarázzsal határos födém vagy fal',
  'Zárt, fűtetlen garázzsal határos födém vagy fal',
  'Fűtetlen/ hűtés nélküli helyiséggel határos födém vagy fal',
  'Fűtetlen, külső homlokzattal rendelkező lépcsőházzal határos fal',
];
const tuloldalKod = (t: Tuloldal): string => (t.fajta === 'fűtetlen' ? `fűtetlen:${t.ter}` : t.fajta);
const tuloldalbol = (k: string): Tuloldal =>
  k.startsWith('fűtetlen:') ? ({ fajta: 'fűtetlen', ter: k.slice(9) } as Tuloldal) : ({ fajta: k } as Tuloldal);

export function HelyisegekNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const [nyitott, setNyitott] = useState<string | null>(p.helyisegek[0]?.azon ?? null);
  const osszA = p.helyisegek.reduce((s, h) => s + h.alapterulet, 0);
  return (
    <>
      <Kartya cim={`Helyiségek (${p.helyisegek.length})`} jobb={<span class="halk">ΣA<sub>N</sub> = {szam(osszA, 1)} m²</span>}>
        {p.retegrendek.length === 0 && <p class="figyelem">Előbb vegyél fel legalább egy rétegrendet a Szerkezetek fülön.</p>}
        <div class="helyisegek">
          {p.helyisegek.map((h, i) => (
            <HelyisegKartya key={h.azon} p={p} h={h} i={i} nyitott={nyitott === h.azon} onNyit={() => setNyitott(nyitott === h.azon ? null : h.azon)} valtoztat={valtoztat} onMasol={(az) => setNyitott(az)} />
          ))}
        </div>
        <p class="halk">Új helyiséget, falat, padlót és födémet csak az Alaprajz fülön lehet rajzolni; a méretek kizárólag a rajzból jönnek (D-152).</p>
      </Kartya>
    </>
  );
}

function HelyisegKartya(props: { p: Projekt; h: Helyiseg; i: number; nyitott: boolean; onNyit: () => void; valtoztat: Valtoztat; onMasol: (azon: string) => void }) {
  const { p, h, i, valtoztat } = props;
  const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
  const vh = (f: (h: Helyiseg) => void): void => valtoztat((x) => f(x.helyisegek[i]!));
  return (
    <div class={`helyiseg${props.nyitott ? ' nyitott' : ''}`}>
      <button class="helyiseg-fej" onClick={props.onNyit} aria-expanded={props.nyitott}>
        <b>{h.nev}</b>
        <span class="halk">
          {h.szint} · {szam(h.alapterulet, 1)} m² · {h.hatarolok.length} határoló
        </span>
      </button>
      {props.nyitott && (
        <div class="helyiseg-test">
          <div class="racs">
            <SzovegMezo id={`hs-${h.azon}-nev`} cimke="Név" ertek={h.nev} onValtozas={(s) => vh((x) => void (x.nev = s))} />
            <SzovegMezo id={`hs-${h.azon}-szint`} cimke="Szint" ertek={h.szint} onValtozas={(s) => vh((x) => void (x.szint = s))} />
            <div class="mezo">
              <span class="cimke">Nettó alapterület {h.alaprajz ? '(rajzból)' : ''}</span>
              <b>{szam(h.alapterulet, 2)} m²</b>
              {!h.alaprajz && <span class="figyelem">Nincs megrajzolva – rajzold meg az Alaprajz fülön.</span>}
            </div>
            <SzamMezo id={`hs-${h.azon}-m`} cimke="Belmagasság" egyseg="m" ertek={h.belmagassag} onValtozas={(v) => vh((x) => void (x.belmagassag = v))} />
          </div>
          {h.hatarolok.map((b, j) => (
            <HataroloSor key={b.azon} p={p} h={h} b={b} rrNev={rr.get(b.retegrendAzon)?.nev} valtoztat={(f) => vh((x) => f(x.hatarolok[j]!))} onTorol={() => vh((x) => void x.hatarolok.splice(j, 1))} />
          ))}
          <div class="gombok">
            <TorlesGomb cimke="Helyiség törlése" onTorol={() => valtoztat((x) => void x.helyisegek.splice(i, 1))} />
          </div>
        </div>
      )}
    </div>
  );
}

type PadloHelyzet = 'terepszinten' | 'pince' | 'terepszint felett';
const PADLO_HELYZETEK: readonly PadloHelyzet[] = ['terepszinten', 'pince', 'terepszint felett'];

export function HataroloSor(props: { p: Projekt; h: Helyiseg; b: Hatarolo; rrNev: string | undefined; valtoztat: (f: (b: Hatarolo) => void) => void; onTorol: () => void }) {
  const { p, h, b, valtoztat } = props;
  const r = p.retegrendek.find((x) => x.azon === b.retegrendAzon);
  const fuggoleges = (b.hajlasszog ?? (b.rajzAlap ? 0 : 90)) >= 60;
  const padlo = r?.szerkezet === 'talajon_fekvo_padlo';
  // Rajzolt élhez vagy alaprajzhoz kötött határolónál a felület, a tájolás és a kerület a rajzból jön.
  const rajz = b.rajzEl !== undefined || b.rajzAlap !== undefined;
  // Vegyes (több részből álló) padlónál a kitett kerület kézzel adandó.
  const kezikerulet = !!b.rajzAlap && h.hatarolok.filter((x) => x.rajzAlap === 'alatta').length > 1;
  const [helyzet, setHelyzet] = useState<PadloHelyzet>((b.melyseg ?? 0) > 0 ? 'pince' : (b.melyseg ?? 0) < 0 ? 'terepszint felett' : 'terepszinten');
  const nyA = b.nyilasok.reduce((s, n) => s + n.szelesseg * n.magassag * n.db, 0);
  // Gyakori ablakméretek a projektből – egy érintéssel újra felvehetők.
  const meretek = [...new Set(p.helyisegek.flatMap((x) => x.hatarolok.flatMap((y) => y.nyilasok.map((n) => `${n.nyilaszaroAzon}|${n.szelesseg}|${n.magassag}`))))].slice(0, 6);
  return (
    <div class="hatarolo">
      <div class="hatarolo-fej">
        <b>{props.rrNev ?? 'Válassz szerkezetet'}</b>
        <span class="halk">
          {b.tajolas ?? ''} {szam(b.felulet, 2)} m²{nyA > 0 ? ` (nyílások ${szam(nyA, 2)} m²)` : ''}
        </span>
        <TorlesGomb kicsi cimke="Határoló törlése" onTorol={props.onTorol} />
      </div>
      <div class="racs">
        <Valaszto
          id={`b-${b.azon}-r`}
          cimke="Szerkezet"
          ertek={b.retegrendAzon}
          opciok={p.retegrendek.filter((x) => x.szerkezet !== 'talajjal_erintkezo_fal').map((x) => ({ ertek: x.azon, nev: `${x.nev} – ${SZERKEZET_NEV[x.szerkezet]}` }))}
          onValtozas={(v) =>
            valtoztat((x) => {
              x.retegrendAzon = v;
              const uj = p.retegrendek.find((y) => y.azon === v);
              if (uj?.szerkezet === 'talajon_fekvo_padlo') {
                x.tuloldal = { fajta: 'talaj' };
                x.kitettKerulet ??= 0;
              }
            })
          }
        />
        <Valaszto
          id={`b-${b.azon}-t`}
          cimke="Túloldal"
          ertek={tuloldalKod(b.tuloldal)}
          opciok={[
            { ertek: 'külső', nev: 'Külső levegő' },
            { ertek: 'talaj', nev: 'Talaj' },
            ...FUTETLEN.map((f) => ({ ertek: `fűtetlen:${f}`, nev: `Fűtetlen: ${f.replace(' határos födém vagy fal', '').replace(' határos fal', '')}` })),
            { ertek: 'fűtött szomszéd', nev: 'Fűtött szomszéd (adiabatikus)' },
          ]}
          onValtozas={(v) => valtoztat((x) => void (x.tuloldal = tuloldalbol(v)))}
        />
      </div>
      {padlo && (
        <Gombsor
          cimke="Padló helyzete (±0,5 m-en belül terepszinten)"
          ertek={helyzet}
          opciok={PADLO_HELYZETEK}
          onValtozas={(h) => {
            setHelyzet(h);
            valtoztat((x) => {
              const z = Math.abs(x.melyseg ?? 0);
              if (h === 'terepszinten') delete x.melyseg;
              else x.melyseg = h === 'pince' ? z : -z;
            });
          }}
        />
      )}
      <div class="racs">
        <div class="mezo">
          <span class="cimke">Felület {rajz ? '(rajzból)' : ''}</span>
          <b>
            {szam(b.felulet, 2)} m²{b.tajolas ? ` · ${b.tajolas}` : ''}
            {padlo && !kezikerulet ? ` · kitett kerület ${szam(b.kitettKerulet ?? 0, 2)} m` : ''}
          </b>
          {!rajz && <span class="figyelem">Nem rajzból származik – rajzold meg az Alaprajz fülön.</span>}
        </div>
        {padlo && kezikerulet && (
          <SzamMezo id={`b-${b.azon}-p`} cimke="Kitett kerület (4.20)" egyseg="m" ertek={b.kitettKerulet} onValtozas={(v) => valtoztat((x) => void (x.kitettKerulet = v))} />
        )}
        {padlo && helyzet !== 'terepszinten' && (
          <SzamMezo
            id={`b-${b.azon}-z`}
            cimke={helyzet === 'pince' ? 'Pincepadló mélysége terepszint alatt' : 'Padló magassága terepszint felett'}
            egyseg="m"
            ertek={Math.abs(b.melyseg ?? 0)}
            onValtozas={(v) => valtoztat((x) => void (x.melyseg = helyzet === 'pince' ? Math.abs(v) : -Math.abs(v)))}
          />
        )}
        {padlo && helyzet === 'pince' && (
          <Valaszto
            id={`b-${b.azon}-pf`}
            cimke="Pincefal rétegrendje (z·P felület)"
            ertek={b.pinceFalRetegrendAzon ?? ''}
            opciok={[
              ...(b.pinceFalRetegrendAzon ? [] : [{ ertek: '', nev: '— válassz pincefalat —' }]),
              ...p.retegrendek.filter((x) => x.szerkezet === 'talajjal_erintkezo_fal').map((x) => ({ ertek: x.azon, nev: x.nev })),
            ]}
            onValtozas={(v) => valtoztat((x) => void (v ? (x.pinceFalRetegrendAzon = v) : delete x.pinceFalRetegrendAzon))}
          />
        )}
        {padlo && helyzet === 'terepszint felett' && (
          <Valaszto
            id={`b-${b.azon}-lf`}
            cimke="Lábazati fal rétegrendje (4.4.3)"
            ertek={b.labazatiFalRetegrendAzon ?? ''}
            opciok={[
              ...(b.labazatiFalRetegrendAzon ? [] : [{ ertek: '', nev: '— válassz lábazati falat —' }]),
              ...p.retegrendek.filter((x) => x.szerkezet === 'homlokzati_fal' || x.szerkezet === 'talajjal_erintkezo_fal').map((x) => ({ ertek: x.azon, nev: x.nev })),
            ]}
            onValtozas={(v) => valtoztat((x) => void (v ? (x.labazatiFalRetegrendAzon = v) : delete x.labazatiFalRetegrendAzon))}
          />
        )}
        {b.rajzAlap === 'alatta' && (
          <AlaprajziResz b={b} valtoztat={valtoztat} />
        )}
        {b.rajzAlap === 'felette' && <AlaprajziResz b={b} valtoztat={valtoztat} />}
        {!fuggoleges && !padlo && b.rajzAlap !== 'alatta' && <SzamMezo id={`b-${b.azon}-hs`} cimke="Hajlásszög" egyseg="°" ertek={b.hajlasszog} onValtozas={(v) => valtoztat((x) => void (x.hajlasszog = v))} />}
      </div>
      {b.nyilasok.map((n, k) => (
        <div class="nyilas" key={k}>
          <Valaszto
            id={`b-${b.azon}-n${k}`}
            cimke="Nyílászáró"
            ertek={n.nyilaszaroAzon}
            opciok={p.nyilaszarok.map((t) => ({ ertek: t.azon, nev: t.nev }))}
            onValtozas={(v) => valtoztat((x) => void (x.nyilasok[k]!.nyilaszaroAzon = v))}
          />
          <SzamMezo id={`b-${b.azon}-n${k}-x`} cimke="Szélesség" egyseg="m" ertek={n.szelesseg} onValtozas={(v) => valtoztat((x) => void (x.nyilasok[k]!.szelesseg = v))} />
          <SzamMezo id={`b-${b.azon}-n${k}-y`} cimke="Magasság" egyseg="m" ertek={n.magassag} onValtozas={(v) => valtoztat((x) => void (x.nyilasok[k]!.magassag = v))} />
          <Leptetos cimke="Darab" ertek={n.db} onValtozas={(v) => valtoztat((x) => void (x.nyilasok[k]!.db = v))} />
          <TorlesGomb kicsi cimke="Nyílás törlése" onTorol={() => valtoztat((x) => void x.nyilasok.splice(k, 1))} />
        </div>
      ))}
      {p.nyilaszarok.length > 0 && !padlo && (
        <div class="gombok kicsi">
          <button class="masodlagos" onClick={() => valtoztat((x) => void x.nyilasok.push({ nyilaszaroAzon: p.nyilaszarok[0]!.azon, szelesseg: 1.2, magassag: 1.5, db: 1 }))}>
            + Nyílás
          </button>
          {meretek.map((m) => {
            const [az, sx, sy] = m.split('|');
            const t = p.nyilaszarok.find((x) => x.azon === az);
            return (
              t && (
                <button key={m} class="meret" onClick={() => valtoztat((x) => void x.nyilasok.push({ nyilaszaroAzon: az!, szelesseg: Number(sx), magassag: Number(sy), db: 1 }))}>
                  {t.nev} {szam(Number(sx), 2)}×{szam(Number(sy), 2)}
                </button>
              )
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Alaprajzi szerkezetrész vetületi területe; üresen a helyiség maradék területe. */
function AlaprajziResz({ b, valtoztat }: { b: Hatarolo; valtoztat: (f: (b: Hatarolo) => void) => void }) {
  return (
    <div class="mezo">
      <SzamMezo id={`b-${b.azon}-ar`} cimke="Alaprajzi terület" egyseg="m²" ertek={b.alaprajziTerulet} onValtozas={(v) => valtoztat((x) => void (x.alaprajziTerulet = v))} />
      {b.alaprajziTerulet === undefined ? (
        <span class="halk">a maradék terület</span>
      ) : (
        <button type="button" class="link" onClick={() => valtoztat((x) => void delete x.alaprajziTerulet)}>
          legyen a maradék
        </button>
      )}
    </div>
  );
}
