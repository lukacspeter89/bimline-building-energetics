// Terepi bevitel: helyiségenként a határolók tájolással és a nyílászárók méretekkel. Telefonon ez a fő nézet.
import type { Tajolas } from '@bimline/calc-core';
import { ujAzon, type Hatarolo, type Helyiseg, type Projekt, type Tuloldal } from '@bimline/model';
import { useState } from 'preact/hooks';
import type { Valtoztat } from '../App.js';
import { Gombsor, Kartya, Leptetos, SzamMezo, SzovegMezo, TorlesGomb, Valaszto, szam } from '../ui.js';
import { SZERKEZET_NEV } from './Szerkezetek.js';

const TAJOLASOK: readonly Tajolas[] = ['É', 'ÉK', 'K', 'DK', 'D', 'DNy', 'Ny', 'ÉNy'];
const FUTETLEN: readonly string[] = [
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
  const uj = (): void => {
    const azon = ujAzon('hs');
    valtoztat((x) => void x.helyisegek.push({ azon, nev: `Helyiség ${x.helyisegek.length + 1}`, szint: x.helyisegek.at(-1)?.szint ?? 'fsz', alapterulet: 0, belmagassag: x.helyisegek.at(-1)?.belmagassag ?? 2.7, hatarolok: [] }));
    setNyitott(azon);
  };
  return (
    <>
      <Kartya cim={`Helyiségek (${p.helyisegek.length})`} jobb={<span class="halk">ΣA<sub>N</sub> = {szam(osszA, 1)} m²</span>}>
        {p.retegrendek.length === 0 && <p class="figyelem">Előbb vegyél fel legalább egy rétegrendet a Szerkezetek fülön.</p>}
        <div class="helyisegek">
          {p.helyisegek.map((h, i) => (
            <HelyisegKartya key={h.azon} p={p} h={h} i={i} nyitott={nyitott === h.azon} onNyit={() => setNyitott(nyitott === h.azon ? null : h.azon)} valtoztat={valtoztat} onMasol={(az) => setNyitott(az)} />
          ))}
        </div>
        <button class="elsodleges" onClick={uj}>
          + Helyiség
        </button>
      </Kartya>
    </>
  );
}

function HelyisegKartya(props: { p: Projekt; h: Helyiseg; i: number; nyitott: boolean; onNyit: () => void; valtoztat: Valtoztat; onMasol: (azon: string) => void }) {
  const { p, h, i, valtoztat } = props;
  const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
  const vh = (f: (h: Helyiseg) => void): void => valtoztat((x) => f(x.helyisegek[i]!));
  const ujHatarolo = (szerkezetek: string[], tuloldal: Tuloldal, tajolas?: Tajolas, hajlasszog = 90): void => {
    const r = p.retegrendek.find((x) => szerkezetek.includes(x.szerkezet)) ?? p.retegrendek[0];
    if (!r) return;
    vh((x) =>
      void x.hatarolok.push({
        azon: ujAzon('h'),
        retegrendAzon: r.azon,
        tuloldal,
        ...(tajolas ? { tajolas } : {}),
        hajlasszog,
        felulet: hajlasszog === 90 ? 0 : x.alapterulet,
        nyilasok: [],
        ...(r.szerkezet === 'talajon_fekvo_padlo' ? { kitettKerulet: 0 } : {}),
      }),
    );
  };
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
            <SzamMezo id={`hs-${h.azon}-a`} cimke="Nettó alapterület" egyseg="m²" ertek={h.alapterulet} onValtozas={(v) => vh((x) => void (x.alapterulet = v))} />
            <SzamMezo id={`hs-${h.azon}-m`} cimke="Belmagasság" egyseg="m" ertek={h.belmagassag} onValtozas={(v) => vh((x) => void (x.belmagassag = v))} />
          </div>
          {h.hatarolok.map((b, j) => (
            <HataroloSor key={b.azon} p={p} h={h} b={b} rrNev={rr.get(b.retegrendAzon)?.nev} valtoztat={(f) => vh((x) => f(x.hatarolok[j]!))} onTorol={() => vh((x) => void x.hatarolok.splice(j, 1))} />
          ))}
          <div class="gombok">
            <button class="masodlagos" onClick={() => ujHatarolo(['homlokzati_fal'], { fajta: 'külső' }, 'D')}>
              + Külső fal
            </button>
            <button class="masodlagos" onClick={() => ujHatarolo(['lapos_teto', 'padlasfodem', 'futott_tetoter_hatarolo'], { fajta: 'külső' }, undefined, 0)}>
              + Tető / födém
            </button>
            <button class="masodlagos" onClick={() => ujHatarolo(['talajon_fekvo_padlo', 'also_zarofodem_futetlen_felett'], { fajta: 'talaj' }, undefined, 0)}>
              + Padló
            </button>
            <button class="masodlagos" onClick={() => ujHatarolo(['futott_futetlen_kozotti_fal'], { fajta: 'fűtetlen', ter: 'Fűtetlen/ hűtés nélküli helyiséggel határos födém vagy fal' })}>
              + Fűtetlen tér felé
            </button>
          </div>
          <div class="gombok">
            <button
              class="masodlagos"
              onClick={() => {
                const azon = ujAzon('hs');
                valtoztat((x) => void x.helyisegek.splice(i + 1, 0, { ...structuredClone(h), azon, nev: `${h.nev} (másolat)`, hatarolok: h.hatarolok.map((b) => ({ ...structuredClone(b), azon: ujAzon('h') })) }));
                props.onMasol(azon);
              }}
            >
              Helyiség másolása
            </button>
            <TorlesGomb cimke="Helyiség törlése" onTorol={() => valtoztat((x) => void x.helyisegek.splice(i, 1))} />
          </div>
        </div>
      )}
    </div>
  );
}

function HataroloSor(props: { p: Projekt; h: Helyiseg; b: Hatarolo; rrNev: string | undefined; valtoztat: (f: (b: Hatarolo) => void) => void; onTorol: () => void }) {
  const { p, h, b, valtoztat } = props;
  const [hossz, setHossz] = useState<number | undefined>(undefined);
  const r = p.retegrendek.find((x) => x.azon === b.retegrendAzon);
  const fuggoleges = (b.hajlasszog ?? 90) >= 60;
  const nyA = b.nyilasok.reduce((s, n) => s + n.szelesseg * n.magassag * n.db, 0);
  // Javaslat a padló kitett kerületére: a helyiség külső levegővel határos falainak hossza (felület / belmagasság).
  const falHossz =
    h.belmagassag > 0
      ? Math.round((h.hatarolok.filter((x) => x.tuloldal.fajta === 'külső' && (x.hajlasszog ?? 90) >= 60).reduce((s, x) => s + x.felulet, 0) / h.belmagassag) * 100) / 100
      : 0;
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
      {fuggoleges && <Gombsor cimke="Tájolás" ertek={b.tajolas} opciok={TAJOLASOK} onValtozas={(t) => valtoztat((x) => void (x.tajolas = t))} />}
      <div class="racs">
        {fuggoleges && (
          <SzamMezo
            id={`b-${b.azon}-hossz`}
            cimke={`Hossz (× ${szam(h.belmagassag, 2)} m belmagasság)`}
            egyseg="m"
            ertek={hossz}
            onValtozas={(v) => {
              setHossz(v);
              valtoztat((x) => void (x.felulet = Math.round(v * h.belmagassag * 1e4) / 1e4));
            }}
          />
        )}
        <SzamMezo id={`b-${b.azon}-a`} cimke="Bruttó felület" egyseg="m²" ertek={b.felulet} onValtozas={(v) => valtoztat((x) => void (x.felulet = v))} />
        {r?.szerkezet === 'talajon_fekvo_padlo' && (
          <SzamMezo id={`b-${b.azon}-p`} cimke="Kitett kerület (4.20)" egyseg="m" ertek={b.kitettKerulet} onValtozas={(v) => valtoztat((x) => void (x.kitettKerulet = v))} />
        )}
        {r?.szerkezet === 'talajon_fekvo_padlo' && falHossz > 0 && Math.abs(falHossz - (b.kitettKerulet ?? 0)) > 0.005 && (
          <button type="button" class="meret" onClick={() => valtoztat((x) => void (x.kitettKerulet = falHossz))}>
            = a helyiség külső falainak hossza: {szam(falHossz, 2)} m
          </button>
        )}
        {r?.szerkezet === 'talajon_fekvo_padlo' && (
          <SzamMezo id={`b-${b.azon}-z`} cimke="Mélység terepszint alatt (pince)" egyseg="m" ertek={b.melyseg ?? 0} onValtozas={(v) => valtoztat((x) => void (x.melyseg = v))} />
        )}
        {r?.szerkezet === 'talajon_fekvo_padlo' && (b.melyseg ?? 0) > 0.5 && (
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
        {!fuggoleges && <SzamMezo id={`b-${b.azon}-hs`} cimke="Hajlásszög" egyseg="°" ertek={b.hajlasszog} onValtozas={(v) => valtoztat((x) => void (x.hajlasszog = v))} />}
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
      {p.nyilaszarok.length > 0 && (
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
