// Gépészet: a választólisták a számítási módszer táblázataiból (data/normativ) töltődnek, így a felület és a mag nem
// térhet el egymástól.
import { tabla, type Energiahordozo, type TablaHivatkozas, type FutesiHotermelo, type HmvHotermelo, type VizesSzabalyozas } from '@bimline/calc-core';
import { ujAzon, type FutesiRendszer, type HmvRendszer, type Projekt } from '@bimline/model';
import type { Valtoztat } from '../App.js';
import { Kapcsolo, Kartya, SzamMezo, TorlesGomb, Valaszto } from '../ui.js';

const sorok = (hiv: string, f: (s: Record<string, unknown>) => boolean = () => true) =>
  tabla(hiv as TablaHivatkozas).sorok.filter(f) as Record<string, unknown>[];
const egyedi = <T,>(x: T[]): T[] => [...new Set(x)];

type HoTipus = FutesiHotermelo['tipus'];
const HO_TIPUSOK: { ertek: HoTipus; nev: string }[] = [
  { ertek: 'kazan', nev: 'Kazán (nem ErP, 8.1–8.2. tábla)' },
  { ertek: 'erp_kazan', nev: 'ErP kazán (η_s az energiacímkéről)' },
  { ertek: 'hoszivattyu', nev: 'Hőszivattyú (nem ErP, 8.5. tábla)' },
  { ertek: 'hoszivattyu_scop', nev: 'Hőszivattyú ismert SCOP-pal' },
  { ertek: 'erp_hoszivattyu', nev: 'ErP hőszivattyú (η_s)' },
  { ertek: 'tavho', nev: 'Távhő' },
  { ertek: 'egyedi', nev: 'Egyedi fűtés (8.7. tábla)' },
  { ertek: 'szilard', nev: 'Szilárd / biomassza kazán (8.3. tábla)' },
];

function alapHotermelo(t: HoTipus): FutesiHotermelo {
  switch (t) {
    case 'kazan':
      return { tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: 'futott_terben' };
    case 'erp_kazan':
      return { tipus: 'erp_kazan', etaS: 0.93 };
    case 'hoszivattyu':
      return { tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: { elore: 35, vissza: 28 } };
    case 'hoszivattyu_scop':
      return { tipus: 'hoszivattyu_scop', scop: 4 };
    case 'erp_hoszivattyu':
      return { tipus: 'erp_hoszivattyu', etaS: 1.5 };
    case 'tavho':
      return { tipus: 'tavho', hokozpontokSzama: 1 };
    case 'egyedi':
      return { tipus: 'egyedi', berendezes: String(sorok('modszer/futes#tabla_8_7')[0]!['hoforras_futokozeg']) };
    case 'szilard':
      return { tipus: 'szilard', kazan: 'Pellettüzelésű kazán' };
    default:
      return { tipus: 'alulmeretezett' };
  }
}
const hordozoHoz = (h: FutesiHotermelo): Energiahordozo =>
  h.tipus.includes('hoszivattyu') ? 'villamos' : h.tipus === 'tavho' ? 'tavho_alapertelmezett' : h.tipus === 'szilard' ? 'bio_szilard' : 'fosszilis_gaz';

function szabalyozasAlap(hoelado: 'szabad' | 'beagyazott'): VizesSzabalyozas {
  const hiv = hoelado === 'szabad' ? 'modszer/futes#tabla_8_10' : 'modszer/futes#tabla_8_11';
  const elso = (t: string) => sorok(hiv, (s) => s['tenyezo'] === t)[0]!;
  const k1 = elso('eps_F_szab_1');
  return {
    hoelado,
    alap: String(elso('eps_F_szab_o')['leiras']),
    korrekcio1: { ...(k1['alcsoport'] ? { alcsoport: String(k1['alcsoport']) } : {}), leiras: String(k1['leiras']) },
    korrekcio2: String(elso('eps_F_szab_2')['leiras']),
    korrekcio3: String(elso('eps_F_szab_3')['leiras']),
    beszabalyozas: { rendszer: 'Kétcsöves rendszer', kialakitas: String(sorok('modszer/futes#tabla_8_12', (s) => s['rendszer'] === 'Kétcsöves rendszer')[0]!['kialakitas']), hoeladokSzama: 10 },
  };
}

function SzabalyozasSzerkeszto({ sz, onValtozas }: { sz: VizesSzabalyozas; onValtozas: (s: VizesSzabalyozas) => void }) {
  const hiv = sz.hoelado === 'szabad' ? 'modszer/futes#tabla_8_10' : 'modszer/futes#tabla_8_11';
  const opc = (t: string) => sorok(hiv, (s) => s['tenyezo'] === t);
  const nev = (s: Record<string, unknown>) => `${s['alcsoport'] ? `${String(s['alcsoport'])}: ` : ''}${String(s['leiras']).replace(/\n/g, ' / ')} (${String(s['ertek'])})`;
  const k1kulcs = (s: Record<string, unknown>) => `${String(s['alcsoport'] ?? '')}|${String(s['leiras'])}`;
  return (
    <div class="racs szeles">
      <Valaszto id="sz-o" cimke="Hőtermelő szabályozása (ε_o)" ertek={sz.alap} opciok={opc('eps_F_szab_o').map((s) => ({ ertek: String(s['leiras']), nev: nev(s) }))} onValtozas={(v) => onValtozas({ ...sz, alap: v })} />
      <Valaszto
        id="sz-1"
        cimke={sz.hoelado === 'szabad' ? 'Közepes hőmérsékletkülönbség (ε_1)' : 'Rendszer (ε_1)'}
        ertek={`${sz.korrekcio1.alcsoport ?? ''}|${sz.korrekcio1.leiras}`}
        opciok={opc('eps_F_szab_1').map((s) => ({ ertek: k1kulcs(s), nev: nev(s) }))}
        onValtozas={(v) => {
          const [a, l] = v.split('|');
          onValtozas({ ...sz, korrekcio1: { ...(a ? { alcsoport: a } : {}), leiras: l! } });
        }}
      />
      <Valaszto id="sz-2" cimke="Határolószerkezet hatása (ε_2)" ertek={sz.korrekcio2} opciok={opc('eps_F_szab_2').map((s) => ({ ertek: String(s['leiras']), nev: nev(s) }))} onValtozas={(v) => onValtozas({ ...sz, korrekcio2: v })} />
      <Valaszto id="sz-3" cimke="Helyiségenkénti szabályozás (ε_3)" ertek={sz.korrekcio3} opciok={opc('eps_F_szab_3').map((s) => ({ ertek: String(s['leiras']), nev: nev(s) }))} onValtozas={(v) => onValtozas({ ...sz, korrekcio3: v })} />
      <Valaszto
        id="sz-4r"
        cimke="Rendszer (ε_4)"
        ertek={sz.beszabalyozas.rendszer}
        opciok={['Kétcsöves rendszer', 'Egycsöves rendszer'] as const}
        onValtozas={(v) =>
          onValtozas({ ...sz, beszabalyozas: { rendszer: v, kialakitas: String(sorok('modszer/futes#tabla_8_12', (s) => s['rendszer'] === v)[0]!['kialakitas']), hoeladokSzama: sz.beszabalyozas.hoeladokSzama ?? 10 } })
        }
      />
      <Valaszto
        id="sz-4k"
        cimke="Hidraulikai beszabályozás (ε_4)"
        ertek={sz.beszabalyozas.kialakitas}
        opciok={sorok('modszer/futes#tabla_8_12', (s) => s['rendszer'] === sz.beszabalyozas.rendszer).map((s) => ({ ertek: String(s['kialakitas']), nev: String(s['kialakitas']) }))}
        onValtozas={(v) => onValtozas({ ...sz, beszabalyozas: { ...sz.beszabalyozas, kialakitas: v } })}
      />
      {sz.beszabalyozas.rendszer === 'Kétcsöves rendszer' && (
        <SzamMezo id="sz-4n" cimke="Hőleadók száma" egesz ertek={sz.beszabalyozas.hoeladokSzama} onValtozas={(v) => onValtozas({ ...sz, beszabalyozas: { ...sz.beszabalyozas, hoeladokSzama: v } })} />
      )}
    </div>
  );
}

const HELY = [
  { ertek: 'futott_terben' as const, nev: 'fűtött térben' },
  { ertek: 'futott_teren_kivul' as const, nev: 'fűtött téren kívül' },
];

export function GepeszetNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const f = p.rendszerek.futes;
  const vf = (g: (f: FutesiRendszer) => void): void => valtoztat((x) => g(x.rendszerek.futes));
  const h = f.hotermelo;
  return (
    <>
      <Kartya cim="Fűtés">
        <div class="racs szeles">
          <Valaszto
            id="f-tipus"
            cimke="Hőtermelő"
            ertek={h.tipus}
            opciok={HO_TIPUSOK}
            onValtozas={(t) =>
              vf((x) => {
                x.hotermelo = alapHotermelo(t);
                x.hordozo = hordozoHoz(x.hotermelo);
              })
            }
          />
          {h.tipus === 'kazan' && (
            <>
              <Valaszto id="f-kazan" cimke="Kazán" ertek={h.kazan} opciok={[{ ertek: 'kondenzacios', nev: 'kondenzációs' }, { ertek: 'alacsony', nev: 'alacsony hőmérsékletű' }, { ertek: 'allando', nev: 'állandó hőmérsékletű' }]} onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).kazan = v))} />
              <Valaszto id="f-kazanhely" cimke="Kazán helye" ertek={h.elhelyezes} opciok={HELY} onValtozas={(v) => vf((x) => { (x.hotermelo as typeof h).elhelyezes = v; x.hotermeloHelye = v; })} />
              <Valaszto id="f-hordozo" cimke="Tüzelőanyag" ertek={f.hordozo} opciok={[{ ertek: 'fosszilis_gaz', nev: 'földgáz' }, { ertek: 'fosszilis_folyekony', nev: 'olaj' }]} onValtozas={(v) => vf((x) => void (x.hordozo = v))} />
            </>
          )}
          {(h.tipus === 'erp_kazan' || h.tipus === 'erp_hoszivattyu') && (
            <SzamMezo id="f-etas" cimke="Szezonális hatásfok η_s (energiacímke)" ertek={h.etaS} onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).etaS = v))} />
          )}
          {h.tipus === 'hoszivattyu_scop' && <SzamMezo id="f-scop" cimke="SCOP" ertek={h.scop} onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).scop = v))} />}
          {h.tipus === 'hoszivattyu' && (
            <Valaszto
              id="f-hoforras"
              cimke="Hőforrás / fűtőközeg"
              ertek={h.hoforras}
              opciok={egyedi(sorok('modszer/futes#tabla_8_5').map((s) => String(s['hoforras_futokozeg']))) as (typeof h.hoforras)[]}
              onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).hoforras = v))}
            />
          )}
          {h.tipus === 'tavho' && <SzamMezo id="f-hk" cimke="Hőközpontok száma" egesz ertek={h.hokozpontokSzama} onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).hokozpontokSzama = v))} />}
          {h.tipus === 'egyedi' && (
            <Valaszto id="f-egyedi" cimke="Berendezés" ertek={h.berendezes} opciok={sorok('modszer/futes#tabla_8_7').map((s) => String(s['hoforras_futokozeg']))} onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).berendezes = v))} />
          )}
          {h.tipus === 'szilard' && (
            <Valaszto id="f-szilard" cimke="Kazán" ertek={h.kazan} opciok={sorok('modszer/futes#tabla_8_3').map((s) => String(s['kazan_tipus'])) as (typeof h.kazan)[]} onValtozas={(v) => vf((x) => void ((x.hotermelo as typeof h).kazan = v))} />
          )}
          <Valaszto
            id="f-hoelado"
            cimke="Hőleadó"
            ertek={f.hoelado}
            opciok={[{ ertek: 'szabad', nev: 'szabad fűtőfelület (radiátor, konvektor)' }, { ertek: 'beagyazott', nev: 'beágyazott (padló-, fal-, mennyezetfűtés)' }]}
            onValtozas={(v) =>
              vf((x) => {
                x.hoelado = v;
                x.szabalyozas = szabalyozasAlap(v);
                x.hofoklepcso = v === 'szabad' ? { elore: 55, vissza: 45 } : { elore: 35, vissza: 28 };
              })
            }
          />
          <SzamMezo id="f-elore" cimke="Előremenő" egyseg="°C" ertek={f.hofoklepcso.elore} onValtozas={(v) => vf((x) => { x.hofoklepcso.elore = v; if (x.hotermelo.tipus === 'hoszivattyu') x.hotermelo.futoviz = { ...x.hofoklepcso }; })} />
          <SzamMezo id="f-vissza" cimke="Visszatérő" egyseg="°C" ertek={f.hofoklepcso.vissza} onValtozas={(v) => vf((x) => { x.hofoklepcso.vissza = v; if (x.hotermelo.tipus === 'hoszivattyu') x.hotermelo.futoviz = { ...x.hofoklepcso }; })} />
          <Valaszto id="f-eloszt" cimke="Vízszintes elosztóvezetékek" ertek={f.elosztasHelye} opciok={HELY} onValtozas={(v) => vf((x) => void (x.elosztasHelye = v))} />
          {h.tipus !== 'kazan' && <Valaszto id="f-hthely" cimke="Hőtermelő helye (referenciához)" ertek={f.hotermeloHelye} opciok={HELY} onValtozas={(v) => vf((x) => void (x.hotermeloHelye = v))} />}
          <Valaszto
            id="f-sziv"
            cimke="Keringtető szivattyú (8.16. tábla)"
            ertek={f.szivattyu}
            opciok={[
              { ertek: 'ec_eei_023', nev: 'EC, EEI ≤ 0,23' },
              { ertek: 'ec_eei_017', nev: 'EC, EEI ≤ 0,17' },
              { ertek: 'fordulatszam_szabalyozott', nev: 'fordulatszám-szabályozott' },
              { ertek: 'allando_fordulatu', nev: 'állandó fordulatú' },
            ]}
            onValtozas={(v) => vf((x) => void (x.szivattyu = v))}
          />
        </div>
        <Kapcsolo id="f-puffer" cimke="Puffertároló" ertek={f.tarolo !== null} onValtozas={(v) => vf((x) => void (x.tarolo = v ? { helye: 'futott_terben' } : null))} />
        {f.tarolo && <Valaszto id="f-puffhely" cimke="Puffer helye" ertek={f.tarolo.helye} opciok={HELY} onValtozas={(v) => vf((x) => void (x.tarolo = { helye: v }))} />}
        <h3>Szabályozás (8.10–8.12. tábla)</h3>
        <SzabalyozasSzerkeszto sz={f.szabalyozas} onValtozas={(s) => vf((x) => void (x.szabalyozas = s))} />
      </Kartya>
      <HmvKartya p={p} valtoztat={valtoztat} />
      <EgyebKartya p={p} valtoztat={valtoztat} />
    </>
  );
}

type HmvTipus = 'kazan' | 'erp' | 'erp_elektromos' | 'elektromos' | 'egyeb' | 'tavho';
function alapHmv(t: HmvTipus): HmvHotermelo {
  switch (t) {
    case 'kazan':
      return { tipus: 'kazan', kazan: 'kondenzacios' };
    case 'erp':
      return { tipus: 'erp', etaS: 0.85 };
    case 'erp_elektromos':
      return { tipus: 'erp_elektromos', etaS: 1.2 };
    case 'elektromos':
      return { tipus: 'elektromos', csoport: 'Hőszivattyú HMV készítésre', rendszer: 'Levegő' };
    case 'egyeb':
      return { tipus: 'egyeb', rendszer: 'Gázüzemű bojler' };
    default:
      return { tipus: 'tavho', hokozpontokSzama: 1 };
  }
}

function HmvKartya({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const m = p.rendszerek.hmv;
  const vm = (g: (m: HmvRendszer) => void): void => valtoztat((x) => g(x.rendszerek.hmv));
  const h = m.hotermelo;
  const elektr = sorok('modszer/hmv#tabla_9_7').map((s) => `${String(s['csoport'])}${s['rendszer'] ? `|${String(s['rendszer'])}` : ''}`);
  return (
    <Kartya cim="Használati melegvíz">
      <div class="racs szeles">
        <Valaszto
          id="h-tipus"
          cimke="Hőtermelő"
          ertek={h.tipus as HmvTipus}
          opciok={[
            { ertek: 'kazan', nev: 'Kazán (nem ErP, 9.4. tábla)' },
            { ertek: 'erp', nev: 'ErP készülék, nem elektromos (η_s)' },
            { ertek: 'erp_elektromos', nev: 'ErP elektromos készülék (η_s)' },
            { ertek: 'elektromos', nev: 'Elektromos / HMV-hőszivattyú (9.7. tábla)' },
            { ertek: 'egyeb', nev: 'Gázbojler, átfolyós (9.8. tábla)' },
            { ertek: 'tavho', nev: 'Távhő' },
          ]}
          onValtozas={(t) =>
            vm((x) => {
              x.hotermelo = alapHmv(t);
              x.hordozo = t === 'elektromos' || t === 'erp_elektromos' ? 'villamos' : t === 'tavho' ? 'tavho_alapertelmezett' : 'fosszilis_gaz';
            })
          }
        />
        {h.tipus === 'kazan' && (
          <Valaszto
            id="h-kazan"
            cimke="Kazán"
            ertek={h.kazan}
            opciok={[
              { ertek: 'kondenzacios', nev: 'kondenzációs' },
              { ertek: 'alacsony', nev: 'alacsony hőmérsékletű' },
              { ertek: 'allando', nev: 'állandó hőmérsékletű' },
              { ertek: 'kombi', nev: 'kombi' },
              { ertek: 'kondenzacios_kombi', nev: 'kondenzációs kombi' },
            ]}
            onValtozas={(v) => vm((x) => void ((x.hotermelo as typeof h).kazan = v))}
          />
        )}
        {h.tipus === 'kazan' && (h.kazan === 'kombi' || h.kazan === 'kondenzacios_kombi') && (
          <SzamMezo id="h-v" cimke="Hőcserélő / kis tároló térfogata" egyseg="l" ertek={h.terfogatL} onValtozas={(v) => vm((x) => void ((x.hotermelo as typeof h).terfogatL = v))} />
        )}
        {(h.tipus === 'erp' || h.tipus === 'erp_elektromos') && <SzamMezo id="h-etas" cimke="η_s (energiacímke)" ertek={h.etaS} onValtozas={(v) => vm((x) => void ((x.hotermelo as typeof h).etaS = v))} />}
        {h.tipus === 'elektromos' && (
          <Valaszto
            id="h-el"
            cimke="Készülék"
            ertek={`${h.csoport}${h.rendszer ? `|${h.rendszer}` : ''}`}
            opciok={elektr.map((e) => ({ ertek: e, nev: e.replace('|', ': ') }))}
            onValtozas={(v) => {
              const [c, r] = v.split('|');
              vm((x) => void (x.hotermelo = r ? { tipus: 'elektromos', csoport: c!, rendszer: r } : { tipus: 'elektromos', csoport: c! }));
            }}
          />
        )}
        {h.tipus === 'egyeb' && (
          <Valaszto id="h-egyeb" cimke="Készülék" ertek={h.rendszer} opciok={['Gázüzemű bojler', 'Átfolyós gáz-vízmelegítő', 'Szilárdtüzelésű fürdőhenger'] as const} onValtozas={(v) => vm((x) => void ((x.hotermelo as typeof h).rendszer = v))} />
        )}
        <Valaszto
          id="h-tarolo"
          cimke="Tároló (9.9–9.10. tábla)"
          ertek={m.tarolo?.fajta ?? 'nincs'}
          opciok={[
            { ertek: 'nincs', nev: 'nincs tároló' },
            { ertek: 'indirekt', nev: 'indirekt fűtésű' },
            { ertek: 'el_csucson_kivuli', nev: 'villanybojler, csúcson kívüli' },
            { ertek: 'el_nappali', nev: 'villanybojler, nappali áram' },
            { ertek: 'gaz_bojler', nev: 'gázbojler' },
          ]}
          onValtozas={(v) => vm((x) => void (x.tarolo = v === 'nincs' ? null : { fajta: v, helye: x.tarolo?.helye ?? 'futott_terben' }))}
        />
        {m.tarolo && <Valaszto id="h-tarhely" cimke="Tároló helye" ertek={m.tarolo.helye} opciok={HELY} onValtozas={(v) => vm((x) => void (x.tarolo = { ...x.tarolo!, helye: v }))} />}
        <Valaszto id="h-eloszt" cimke="Elosztóvezetékek" ertek={m.elosztasHelye} opciok={HELY} onValtozas={(v) => vm((x) => void (x.elosztasHelye = v))} />
        <Valaszto
          id="h-cirk"
          cimke="Cirkuláció (9.12. tábla)"
          ertek={m.cirkulacio === false ? 'nincs' : m.cirkulacio === null ? 'ismeretlen' : String(m.cirkulacio)}
          opciok={[
            { ertek: 'nincs', nev: 'nincs cirkuláció' },
            { ertek: '0.23', nev: 'van, EEI ≤ 0,23' },
            { ertek: '0.17', nev: 'van, EEI ≤ 0,17' },
            { ertek: 'ismeretlen', nev: 'van, EEI nem ismert' },
          ]}
          onValtozas={(v) => vm((x) => void (x.cirkulacio = v === 'nincs' ? false : v === 'ismeretlen' ? null : Number(v)))}
        />
      </div>
    </Kartya>
  );
}

function EgyebKartya({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const sz = p.rendszerek.szellozes;
  const hu = p.rendszerek.hutes;
  return (
    <>
      <Kartya cim="Szellőzés">
        <Kapcsolo
          id="lt"
          cimke="Hővisszanyerős gépi szellőzés"
          ertek={sz.fajta === 'hővisszanyerős'}
          onValtozas={(v) => valtoztat((x) => void (x.rendszerek.szellozes = v ? { fajta: 'hővisszanyerős', legcsere: 0.5, etaR: 0, dp: 0, uzemido: 8760 } : { fajta: 'természetes' }))}
        />
        {sz.fajta === 'hővisszanyerős' && (
          <div class="racs">
            <SzamMezo id="lt-n" cimke="Légcsere (lakó: 0,5)" egyseg="1/h" ertek={sz.legcsere} onValtozas={(v) => valtoztat((x) => void ((x.rendszerek.szellozes as typeof sz).legcsere = v))} />
            <SzamMezo id="lt-eta" cimke="Hővisszanyerés η_r (adatlap)" ertek={sz.etaR} onValtozas={(v) => valtoztat((x) => void ((x.rendszerek.szellozes as typeof sz).etaR = v))} />
            <SzamMezo id="lt-dp" cimke="Nyomásesés Δp (terv)" egyseg="Pa" ertek={sz.dp} onValtozas={(v) => valtoztat((x) => void ((x.rendszerek.szellozes as typeof sz).dp = v))} />
            <SzamMezo id="lt-ev" cimke="Ventilátor összhatásfok (adatlap; üresen 10.8. tábla)" ertek={sz.etaVent} onValtozas={(v) => valtoztat((x) => void ((x.rendszerek.szellozes as typeof sz).etaVent = v))} />
            <SzamMezo id="lt-t" cimke="Éves üzemidő (terv; egész évben 8760)" egyseg="h" ertek={sz.uzemido} onValtozas={(v) => valtoztat((x) => void ((x.rendszerek.szellozes as typeof sz).uzemido = v))} />
          </div>
        )}
      </Kartya>
      <Kartya cim="Hűtés">
        <Kapcsolo
          id="hu"
          cimke="Gépi hűtés"
          ertek={hu !== null}
          onValtozas={(v) => valtoztat((x) => void (x.rendszerek.hutes = v ? { hutogep: 'Kompresszoros léghűtés (split)', hutokozeg: 'Közvetlen elpárologtatós rendszer (5 oC)', szabalyozas: 'Direkt elpárologtatás' } : null))}
        />
        {hu && (
          <div class="racs szeles">
            <Valaszto id="hu-gep" cimke="Hűtőgép (11.2. tábla)" ertek={hu.hutogep} opciok={sorok('modszer/hutes#tabla_11_2').map((s) => String(s['hutogep_tipus']))} onValtozas={(v) => valtoztat((x) => void (x.rendszerek.hutes!.hutogep = v))} />
            <Valaszto id="hu-kozeg" cimke="Hűtőközeg (11.1. tábla)" ertek={hu.hutokozeg} opciok={sorok('modszer/hutes#tabla_11_1').map((s) => String(s['hutokozeg']))} onValtozas={(v) => valtoztat((x) => void (x.rendszerek.hutes!.hutokozeg = v))} />
            <Valaszto id="hu-szab" cimke="Szabályozás (11.3. tábla)" ertek={hu.szabalyozas} opciok={sorok('modszer/hutes#tabla_11_3').map((s) => String(s['rendszer']))} onValtozas={(v) => valtoztat((x) => void (x.rendszerek.hutes!.szabalyozas = v))} />
          </div>
        )}
      </Kartya>
      <Kartya
        cim="Napelem"
        jobb={
          <button class="masodlagos" onClick={() => valtoztat((x) => void x.rendszerek.napelemek.push({ azon: ujAzon('pv'), kWp: 4, tajolas: 'D', hajlasszog: 30 }))}>
            + Napelem
          </button>
        }
      >
        {p.rendszerek.napelemek.length === 0 && <p class="halk">Nincs napelem.</p>}
        {p.rendszerek.napelemek.map((n, i) => (
          <div class="racs" key={n.azon}>
            <SzamMezo id={`pv-${n.azon}-p`} cimke="Beépített teljesítmény" egyseg="kWp" ertek={n.kWp} onValtozas={(v) => valtoztat((x) => void (x.rendszerek.napelemek[i]!.kWp = v))} />
            <Valaszto id={`pv-${n.azon}-t`} cimke="Tájolás" ertek={n.tajolas} opciok={['D', 'DK', 'DNy', 'K', 'Ny'] as const} onValtozas={(v) => valtoztat((x) => void (x.rendszerek.napelemek[i]!.tajolas = v))} />
            <SzamMezo id={`pv-${n.azon}-h`} cimke="Dőlésszög" egyseg="°" ertek={n.hajlasszog} onValtozas={(v) => valtoztat((x) => void (x.rendszerek.napelemek[i]!.hajlasszog = v))} />
            <TorlesGomb cimke="Napelem törlése" onTorol={() => valtoztat((x) => void x.rendszerek.napelemek.splice(i, 1))} />
          </div>
        ))}
      </Kartya>
    </>
  );
}
