// Méretezési hőterhelés (MSZ EN 12831-1:2017) helyiségenként: feltételek és eredménytáblázat.
import { tabla, type BelsoTipus12831, type FutetlenF1, type FutetlenTerTipus, type HohidKategoria, type HotaroloKat12831, type LegtomorsegiOsztaly, type NMinTipus, type TablaHivatkozas } from '@bimline/calc-core';
import { alapHoterhelesBeallitas, hoterhelesProjekt, javasoltNMin, javasoltTipus, type HoterhelesBeallitas, type Projekt } from '@bimline/model';
import { useMemo } from 'preact/hooks';
import type { Valtoztat } from '../App.js';
import { Gombsor, Kapcsolo, Kartya, SzamMezo, SzovegMezo, Valaszto, szam } from '../ui.js';

const T = (id: string): TablaHivatkozas => `szabvany/msz_en_12831_1#${id}`;
const opciok = <K extends string>(id: string, kulcs: string, nev: (s: Record<string, unknown>) => string) =>
  (tabla(T(id)).sorok as Record<string, unknown>[]).map((s) => ({ ertek: String(s[kulcs]) as K, nev: nev(s) }));

/** A B.2. táblázat sorai közül a fűtetlen tér típusához illők (padlás → tetőtér, pince → pince, egyéb → helyiség/közlekedő). */
function illik(t: FutetlenTerTipus, k: FutetlenF1): boolean {
  if (t.startsWith('Padlás')) return k.startsWith('padlas');
  if (t.includes('pincével')) return k.startsWith('pince');
  if (t.includes('lépcsőház')) return k.startsWith('helyiseg') || k.startsWith('kozlekedo');
  return k.startsWith('helyiseg') || k.startsWith('kozlekedo') || k === 'padlo_maszoter';
}

export function HoigenyNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const be = p.hoterheles ?? alapHoterhelesBeallitas();
  const vb = (f: (b: HoterhelesBeallitas) => void): void => valtoztat((x) => f((x.hoterheles ??= alapHoterhelesBeallitas())));
  const kimenet = useMemo(() => hoterhelesProjekt(p), [p]);
  const futetlenTipusok = [...new Set(p.helyisegek.flatMap((h) => h.hatarolok.flatMap((b) => (b.tuloldal.fajta === 'fűtetlen' ? [b.tuloldal.ter] : []))))] as FutetlenTerTipus[];
  const szintek = [...new Set(p.helyisegek.map((h) => h.szint))];
  const tipusOpciok = opciok<BelsoTipus12831>('tabla_B14', 'kulcs', (s) => `${String(s['tipus'])} (${String(s['theta_int'])} °C)`);
  const nminOpciok = opciok<NMinTipus>('tabla_B7', 'kulcs', (s) => `${String(s['tipus'])} (${String(s['n_min']).replace('.', ',')})`);
  return (
    <>
      <Kartya cim="Méretezési feltételek (MSZ EN 12831-1:2017)">
        <p class="halk">
          A klímaadatot a nemzeti melléklet adja; a szabvány B melléklete erre nem ad értéket, ezért forrással kell megadni. A többi tétel a B melléklet tájékoztató
          alapértéke, amíg a nemzeti melléklet nincs meg (D-146).
        </p>
        <div class="racs">
          <SzamMezo id="hl-te" cimke="Külső méretezési hőmérséklet θ_e,Ref" egyseg="°C" ertek={be.thetaERef?.ertek} onValtozas={(v) => vb((b) => void (b.thetaERef = { ertek: v, forras: b.thetaERef?.forras ?? '' }))} />
          <SzovegMezo id="hl-te-f" cimke="Forrása" ertek={be.thetaERef?.forras ?? ''} hely="pl. nemzeti melléklet, tervezési alapadat" onValtozas={(s) => vb((b) => void (b.thetaERef = { ertek: b.thetaERef?.ertek ?? NaN, forras: s }))} />
          <SzamMezo id="hl-tm" cimke="Éves átlagos külső hőmérséklet θ_e,m" egyseg="°C" ertek={be.thetaEm?.ertek} onValtozas={(v) => vb((b) => void (b.thetaEm = { ertek: v, forras: b.thetaEm?.forras ?? '' }))} />
          <SzovegMezo id="hl-tm-f" cimke="Forrása" ertek={be.thetaEm?.forras ?? ''} onValtozas={(s) => vb((b) => void (b.thetaEm = { ertek: b.thetaEm?.ertek ?? NaN, forras: s }))} />
        </div>
        <div class="racs szeles">
          <Valaszto id="hl-hh" cimke="Hőhíd-pótlék ΔU_TB (B.1)" ertek={be.hohid} opciok={opciok<HohidKategoria>('tabla_B1', 'kulcs', (s) => `${String(s['dU_TB']).replace('.', ',')} – ${String(s['kriterium'])}`)} onValtozas={(v) => vb((b) => void (b.hohid = v))} />
          <Valaszto
            id="hl-lt"
            cimke="Légtömörség (B.6)"
            ertek={'osztaly' in be.legtomorseg ? be.legtomorseg.osztaly : 'I'}
            opciok={opciok<LegtomorsegiOsztaly>('tabla_B6', 'osztaly', (s) => `${String(s['osztaly'])}: ${String(s['q_env50'])} m³/(m²h) – ${String(s['meres'])}, ${String(s['kovetelmeny'])}`)}
            onValtozas={(v) => vb((b) => void (b.legtomorseg = { osztaly: v }))}
          />
          <Valaszto id="hl-ce" cimke="Hőtároló képesség (B.4)" ertek={be.hotarolo} opciok={opciok<HotaroloKat12831>('tabla_B4', 'kulcs', (s) => `${String(s['c_eff'])} Wh/(m³K) – ${String(s['jellemzes'])}`)} onValtozas={(v) => vb((b) => void (b.hotarolo = v))} />
        </div>
        <Gombsor cimke="Árnyékoltság (B.8)" ertek={be.arnyekoltsag} opciok={['intenziv', 'normal', 'nincs'] as const} onValtozas={(v) => vb((b) => void (b.arnyekoltsag = v))} />
        <div class="racs">
          <SzamMezo id="hl-dh" cimke="Zóna függőleges kiterjedése Δh_z" egyseg="m" ertek={be.dhz} onValtozas={(v) => vb((b) => void (b.dhz = v))} />
          <SzamMezo id="hl-ve" cimke="Külső bruttó térfogat V_e (időállandóhoz)" egyseg="m³" ertek={be.Ve} onValtozas={(v) => vb((b) => void (b.Ve = v))} />
        </div>
        <Kapcsolo id="hl-th" cimke="Több kitett homlokzat (B.8, B.9)" ertek={be.tobbHomlokzat} onValtozas={(v) => vb((b) => void (b.tobbHomlokzat = v))} />
        <Kapcsolo id="hl-gw" cimke="Talajvíz a padlólemez alatt 1 m-en belül (f_GW = 1,15)" ertek={be.talajvizKozel} onValtozas={(v) => vb((b) => void (b.talajvizKozel = v))} />
        <Kapcsolo id="hl-me" cimke="A zóna 50 m-nél magasabban van a terep felett" ertek={be.magasEpulet} onValtozas={(v) => vb((b) => void (b.magasEpulet = v))} />
        {futetlenTipusok.map((t) => (
          <Valaszto
            key={t}
            id={`hl-f1-${t}`}
            cimke={`f_1: ${t} (B.2)`}
            ertek={(be.futetlenF1[t] ?? '') as FutetlenF1 | ''}
            opciok={[
              ...(be.futetlenF1[t] ? [] : [{ ertek: '' as const, nev: '— válaszd ki a jellegét —' }]),
              ...opciok<FutetlenF1>('tabla_B2', 'kulcs', (s) => `${String(s['f1']).replace('.', ',')} – ${String(s['ter'])}: ${String(s['reszletezes'])}`).filter((o) => illik(t, o.ertek)),
            ]}
            onValtozas={(v) => vb((b) => void (b.futetlenF1 = Object.fromEntries(Object.entries({ ...b.futetlenF1, [t]: v }).filter(([, x]) => x))))}
          />
        ))}
        <Valaszto
          id="hl-bf"
          cimke="Belső fal rétegrendje (eltérő hőmérsékletű helyiségek között)"
          ertek={be.belsoFalRetegrendAzon ?? ''}
          opciok={[{ ertek: '', nev: '— nincs megadva —' }, ...p.retegrendek.map((r) => ({ ertek: r.azon, nev: r.nev }))]}
          onValtozas={(v) => vb((b) => void (v ? (b.belsoFalRetegrendAzon = v) : delete b.belsoFalRetegrendAzon))}
        />
      </Kartya>

      {!kimenet.rendben ? (
        <Kartya cim="Hiányzó adatok">
          <ul class="hianyok">
            {kimenet.hianyok.map((h, i) => (
              <li key={i}>
                <b>{h.hely}</b>: {h.uzenet}
              </li>
            ))}
          </ul>
        </Kartya>
      ) : (
        <>
          <Kartya cim="Épület" jobb={<b class="nagy-szam">{szam(kimenet.eredmeny.epulet / 1000, 2)} kW</b>}>
            <p class="halk">
              θ_e = {szam(kimenet.eredmeny.thetaE, 1)} °C
              {kimenet.eredmeny.tau !== null ? ` (τ = ${szam(kimenet.eredmeny.tau, 0)} h, Δθ_e,τ = ${szam(kimenet.eredmeny.dTau, 2)} K)` : ''} · transzmisszió {szam(kimenet.eredmeny.epuletT / 1000, 2)} kW ·
              szellőzés {szam(kimenet.eredmeny.epuletV / 1000, 2)} kW. Az épület értéke nem a helyiségek összege: a helyiségek közti tagok kimaradnak, a szellőzés zónánként számít (1).
            </p>
          </Kartya>
          {szintek.map((sz) => {
            const sorok = kimenet.eredmeny.helyisegek.filter((h) => h.szint === sz);
            return (
              <Kartya key={sz} cim={`Szint: ${sz}`} jobb={<span class="halk">Σ {szam(sorok.reduce((s, h) => s + h.PhiHL, 0), 0)} W</span>}>
                <div class="tablazat">
                  <table class="beviteli">
                    <thead>
                      <tr>
                        <th>Helyiség</th>
                        <th>Típus (θ_int)</th>
                        <th>n_min</th>
                        <th>A [m²]</th>
                        <th>Φ_T [W]</th>
                        <th>Φ_V [W]</th>
                        <th>Φ_HL [W]</th>
                        <th>[W/m²]</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorok.map((e) => {
                        const i = p.helyisegek.findIndex((x) => x.azon === e.azon);
                        const h = p.helyisegek[i]!;
                        return (
                          <tr key={e.azon}>
                            <th scope="row">{e.nev}</th>
                            <td>
                              <select class="cella" aria-label="Típus" value={h.hoterheles?.tipus ?? javasoltTipus(h)} onChange={(ev) => valtoztat((x) => void ((x.helyisegek[i]!.hoterheles ??= {}).tipus = (ev.target as HTMLSelectElement).value as BelsoTipus12831))}>
                                {tipusOpciok.map((o) => (
                                  <option key={o.ertek} value={o.ertek}>
                                    {o.nev}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select class="cella" aria-label="n_min" value={h.hoterheles?.nMinTipus ?? javasoltNMin(p, h)} onChange={(ev) => valtoztat((x) => void ((x.helyisegek[i]!.hoterheles ??= {}).nMinTipus = (ev.target as HTMLSelectElement).value as NMinTipus))}>
                                {nminOpciok.map((o) => (
                                  <option key={o.ertek} value={o.ertek}>
                                    {o.nev}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{szam(e.A, 2)}</td>
                            <td>{szam(e.transzmisszio.Phi, 0)}</td>
                            <td>{szam(e.PhiV, 0)}</td>
                            <td>
                              <b>{szam(e.PhiHL, 0)}</b>
                            </td>
                            <td>{szam(e.fajlagos, 1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Kartya>
            );
          })}
          {kimenet.eredmeny.jelzesek.length > 0 && (
            <Kartya cim="Megjegyzések">
              <ul class="hianyok">
                {kimenet.eredmeny.jelzesek.map((j, i) => (
                  <li key={i}>{j}</li>
                ))}
                <li>A felületek a rajz belméretei; a szabvány a külső méretet tekinti biztonságosnak (D-147).</li>
              </ul>
            </Kartya>
          )}
        </>
      )}
    </>
  );
}
