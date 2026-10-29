import { useState } from 'preact/hooks';
import { ujAzon, type Anyag, type Forras, type NyilaszaroTipus, type Projekt, type SzerkezetTipus } from '@bimline/model';
import type { Valtoztat } from '../App.js';
import { Kartya, SzamMezo, SzovegMezo, TorlesGomb, Valaszto, szam } from '../ui.js';

export const SZERKEZET_NEV: Record<SzerkezetTipus, string> = {
  homlokzati_fal: 'Homlokzati fal',
  lapos_teto: 'Lapostető',
  futott_tetoter_hatarolo: 'Fűtött tetőteret határoló',
  padlasfodem: 'Padlásfödém',
  arkad_athajto_feletti_fodem: 'Árkád / áthajtó feletti födém',
  also_zarofodem_futetlen_felett: 'Alsó zárófödém fűtetlen tér felett',
  futott_futetlen_kozotti_fal: 'Fal fűtetlen tér felé',
  szomszed_futott_epulet_fal: 'Fal fűtött szomszéd felé',
  talajon_fekvo_padlo: 'Talajon fekvő padló',
  talajjal_erintkezo_fal: 'Pincefal talaj felé (a pincepadlónál)',
};

function ForrasMezo({ forras, onValtozas, id }: { forras: Forras; onValtozas: (f: Forras) => void; id: string }) {
  return (
    <div class="racs">
      <Valaszto
        id={`${id}-tipus`}
        cimke="Forrás"
        ertek={forras.tipus}
        opciok={[
          { ertek: 'termekadatlap', nev: 'Termékadatlap' },
          { ertek: 'jogszabaly', nev: 'Jogszabályi alapérték' },
          { ertek: 'feltevés', nev: 'Feltevés' },
        ]}
        onValtozas={(t) => onValtozas(t === 'feltevés' ? { tipus: t, indoklas: '' } : { tipus: t, hivatkozas: '' })}
      />
      <SzovegMezo
        id={`${id}-szoveg`}
        cimke={forras.tipus === 'feltevés' ? 'Indoklás' : 'Hivatkozás (gyártó, adatlap, dátum)'}
        ertek={forras.tipus === 'feltevés' ? forras.indoklas : forras.hivatkozas}
        onValtozas={(s) => onValtozas(forras.tipus === 'feltevés' ? { tipus: 'feltevés', indoklas: s } : { tipus: forras.tipus, hivatkozas: s })}
      />
    </div>
  );
}

export function SzerkezetekNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const anyagNev = new Map(p.anyagok.map((a) => [a.azon, a]));
  // Az épp felvett elem nyitva jelenik meg, a neve kijelölve – rögtön felülírható.
  const [friss, setFriss] = useState<string | null>(null);
  const uj = (elotag: string): string => {
    const azon = ujAzon(elotag);
    setFriss(azon);
    return azon;
  };
  return (
    <>
      <Kartya
        cim={`Anyagok (${p.anyagok.length})`}
        jobb={
          <button
            class="masodlagos"
            onClick={() => valtoztat((x) => void x.anyagok.push({ azon: uj('a'), nev: 'Új anyag', lambda: 1, forras: { tipus: 'termekadatlap', hivatkozas: '' } }))}
          >
            + Anyag
          </button>
        }
      >
        <p class="halk">A λ csak termékadatlapról vehető fel; ha nincs adatlap, „feltevés” jelöléssel (ezt az eredmény jelzi).</p>
        {p.anyagok.map((a: Anyag, i) => (
          <details key={a.azon} class="elem" open={a.azon === friss}>
            <summary>
              <b>{a.nev}</b> <span class="halk">λ = {szam(a.lambda, 3)} W/mK{a.forras.tipus === 'feltevés' ? ' · feltevés' : ''}</span>
            </summary>
            <div class="racs">
              <SzovegMezo fokusz={a.azon === friss} id={`a-${a.azon}-nev`} cimke="Név" ertek={a.nev} onValtozas={(s) => valtoztat((x) => void (x.anyagok[i]!.nev = s))} />
              <SzamMezo id={`a-${a.azon}-l`} cimke="Hővezetési tényező λ" egyseg="W/mK" ertek={a.lambda} onValtozas={(v) => valtoztat((x) => void (x.anyagok[i]!.lambda = v))} />
            </div>
            <ForrasMezo id={`a-${a.azon}`} forras={a.forras} onValtozas={(f) => valtoztat((x) => void (x.anyagok[i]!.forras = f))} />
            <TorlesGomb cimke="Anyag törlése" onTorol={() => valtoztat((x) => void x.anyagok.splice(i, 1))} />
          </details>
        ))}
      </Kartya>

      <Kartya
        cim={`Rétegrendek (${p.retegrendek.length})`}
        jobb={
          <button
            class="masodlagos"
            onClick={() => valtoztat((x) => void x.retegrendek.push({ azon: uj('r'), nev: `R${x.retegrendek.length + 1}./ Új szerkezet`, szerkezet: 'homlokzati_fal', retegek: [] }))}
          >
            + Rétegrend
          </button>
        }
      >
        <p class="halk">A név a tervben szereplő jelölés legyen. A rétegek kívülről befelé.</p>
        {p.retegrendek.map((r, i) => (
          <details key={r.azon} class="elem" open={r.azon === friss}>
            <summary>
              <b>{r.nev}</b> <span class="halk">{SZERKEZET_NEV[r.szerkezet]} · {r.retegek.length} réteg</span>
            </summary>
            <div class="racs">
              <SzovegMezo fokusz={r.azon === friss} id={`r-${r.azon}-nev`} cimke="Név (terv szerint)" ertek={r.nev} onValtozas={(s) => valtoztat((x) => void (x.retegrendek[i]!.nev = s))} />
              <Valaszto
                id={`r-${r.azon}-sz`}
                cimke="Szerkezettípus (elemi követelmény)"
                ertek={r.szerkezet}
                opciok={(Object.keys(SZERKEZET_NEV) as SzerkezetTipus[]).map((k) => ({ ertek: k, nev: SZERKEZET_NEV[k] }))}
                onValtozas={(v) => valtoztat((x) => void (x.retegrendek[i]!.szerkezet = v))}
              />
            </div>
            <div class="retegek">
              {r.retegek.map((l, j) => (
                <div class="reteg" key={j}>
                  <Valaszto
                    id={`r-${r.azon}-${j}-a`}
                    cimke={`${j + 1}. réteg`}
                    ertek={l.anyagAzon}
                    opciok={[...(anyagNev.has(l.anyagAzon) ? [] : [{ ertek: l.anyagAzon, nev: '— válassz anyagot —' }]), ...p.anyagok.map((a) => ({ ertek: a.azon, nev: a.nev }))]}
                    onValtozas={(v) => valtoztat((x) => void (x.retegrendek[i]!.retegek[j]!.anyagAzon = v))}
                  />
                  <SzamMezo id={`r-${r.azon}-${j}-d`} cimke="Vastagság" egyseg="cm" szorzo={100} ertek={l.d} onValtozas={(v) => valtoztat((x) => void (x.retegrendek[i]!.retegek[j]!.d = v))} />
                  <TorlesGomb kicsi cimke="Réteg törlése" onTorol={() => valtoztat((x) => void x.retegrendek[i]!.retegek.splice(j, 1))} />
                </div>
              ))}
            </div>
            <div class="gombok">
              <button
                class="masodlagos"
                disabled={p.anyagok.length === 0}
                onClick={() => valtoztat((x) => void x.retegrendek[i]!.retegek.push({ anyagAzon: x.anyagok[0]!.azon, d: 0.01 }))}
              >
                + Réteg
              </button>
              <button class="masodlagos" onClick={() => valtoztat((x) => void x.retegrendek.push({ ...structuredClone(r), azon: uj('r'), nev: `${r.nev} (másolat)` }))}>
                Másolat
              </button>
              <TorlesGomb cimke="Rétegrend törlése" onTorol={() => valtoztat((x) => void x.retegrendek.splice(i, 1))} />
            </div>
          </details>
        ))}
      </Kartya>

      <Kartya
        cim={`Nyílászárók (${p.nyilaszarok.length})`}
        jobb={
          <button
            class="masodlagos"
            onClick={() =>
              valtoztat((x) =>
                void x.nyilaszarok.push({
                  azon: uj('ny'),
                  nev: 'Új ablak',
                  fajta: 'ablak',
                  osszetevok: { Ug: 1.1, g: 0.6, Uf: 1.3, keretSzelesseg: 0.11, psiG: 0.06 },
                  forras: { tipus: 'termekadatlap', hivatkozas: '' },
                }),
              )
            }
          >
            + Nyílászáró
          </button>
        }
      >
        {p.nyilaszarok.map((t: NyilaszaroTipus, i) => (
          <details key={t.azon} class="elem" open={t.azon === friss}>
            <summary>
              <b>{t.nev}</b> <span class="halk">{t.fajta === 'ablak' ? `U_g ${szam(t.osszetevok?.Ug ?? NaN, 2)} · U_f ${szam(t.osszetevok?.Uf ?? NaN, 2)}` : `U ${szam(t.U ?? NaN, 2)} W/m²K`}</span>
            </summary>
            <div class="racs">
              <SzovegMezo fokusz={t.azon === friss} id={`ny-${t.azon}-nev`} cimke="Név" ertek={t.nev} onValtozas={(s) => valtoztat((x) => void (x.nyilaszarok[i]!.nev = s))} />
              <Valaszto
                id={`ny-${t.azon}-f`}
                cimke="Fajta"
                ertek={t.fajta}
                opciok={[
                  { ertek: 'ablak', nev: 'Ablak (összetevőkből)' },
                  { ertek: 'ajto', nev: 'Ajtó (U-érték)' },
                ]}
                onValtozas={(v) =>
                  valtoztat((x) => {
                    const n = x.nyilaszarok[i]!;
                    n.fajta = v;
                    if (v === 'ablak') n.osszetevok ??= { Ug: 1.1, g: 0.6, Uf: 1.3, keretSzelesseg: 0.11, psiG: 0.06 };
                    else n.U ??= 1.4;
                  })
                }
              />
              {t.fajta === 'ablak' && t.osszetevok ? (
                <>
                  <SzamMezo id={`ny-${t.azon}-ug`} cimke="Üvegezés U_g" egyseg="W/m²K" ertek={t.osszetevok.Ug} onValtozas={(v) => valtoztat((x) => void (x.nyilaszarok[i]!.osszetevok!.Ug = v))} />
                  <SzamMezo id={`ny-${t.azon}-g`} cimke="Üvegezés g⊥" ertek={t.osszetevok.g} onValtozas={(v) => valtoztat((x) => void (x.nyilaszarok[i]!.osszetevok!.g = v))} />
                  <SzamMezo id={`ny-${t.azon}-uf`} cimke="Keret U_f" egyseg="W/m²K" ertek={t.osszetevok.Uf} onValtozas={(v) => valtoztat((x) => void (x.nyilaszarok[i]!.osszetevok!.Uf = v))} />
                  <SzamMezo
                    id={`ny-${t.azon}-k`}
                    cimke="Keretszélesség"
                    egyseg="mm"
                    szorzo={1000}
                    ertek={t.osszetevok.keretSzelesseg}
                    onValtozas={(v) => valtoztat((x) => void (x.nyilaszarok[i]!.osszetevok!.keretSzelesseg = v))}
                  />
                  <SzamMezo id={`ny-${t.azon}-psi`} cimke="Távtartó Ψ_g" egyseg="W/mK" ertek={t.osszetevok.psiG} onValtozas={(v) => valtoztat((x) => void (x.nyilaszarok[i]!.osszetevok!.psiG = v))} />
                </>
              ) : (
                <SzamMezo id={`ny-${t.azon}-u`} cimke="U (terv nélkül 1,4 / kapu 1,8 / ipari 2,0)" egyseg="W/m²K" ertek={t.U} onValtozas={(v) => valtoztat((x) => void (x.nyilaszarok[i]!.U = v))} />
              )}
            </div>
            <ForrasMezo id={`ny-${t.azon}`} forras={t.forras} onValtozas={(f) => valtoztat((x) => void (x.nyilaszarok[i]!.forras = f))} />
            <TorlesGomb cimke="Nyílászáró törlése" onTorol={() => valtoztat((x) => void x.nyilaszarok.splice(i, 1))} />
          </details>
        ))}
      </Kartya>
    </>
  );
}
