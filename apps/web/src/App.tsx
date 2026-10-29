import { MODELL_VERZIO, szamolProjekt, ujAzon, type Projekt, type SzamitasKimenet } from '@bimline/model';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import G1 from '../../../packages/model/mintak/G1.json';
import G2 from '../../../packages/model/mintak/G2.json';
import G3 from '../../../packages/model/mintak/G3.json';
import { EpuletNezet } from './nezetek/Epulet.js';
import { EredmenyNezet, OsszegzoSav } from './nezetek/Eredmeny.js';
import { GepeszetNezet } from './nezetek/Gepeszet.js';
import { HelyisegekNezet } from './nezetek/Helyisegek.js';
import { ProjektLista } from './nezetek/ProjektLista.js';
import { SzerkezetekNezet } from './nezetek/Szerkezetek.js';
import * as tarolo from './tarolo.js';

export const MINTAK: readonly { azon: string; cim: string; projekt: Projekt }[] = [
  { azon: 'G1', cim: 'G1 · földszintes lapostetős ház, gázkazán', projekt: G1 as unknown as Projekt },
  { azon: 'G2', cim: 'G2 · kétszintes ház, hőszivattyú, napelem', projekt: G2 as unknown as Projekt },
  { azon: 'G3', cim: 'G3 · pince és garázs mellett, hővisszanyerő, split', projekt: G3 as unknown as Projekt },
];

export function ujProjekt(): Projekt {
  const g = MINTAK[0]!.projekt;
  return {
    ...structuredClone(g),
    verzio: MODELL_VERZIO,
    azon: ujAzon('p'),
    nev: 'Új projekt',
    modositva: new Date().toISOString(),
    adatok: { cim: '', helyrajziSzam: '', megrendelo: '', megjegyzes: '' },
    anyagok: [],
    retegrendek: [],
    nyilaszarok: [{ azon: 'ny-ajto', nev: 'Bejárati ajtó', fajta: 'ajto', U: 1.4, forras: { tipus: 'jogszabaly', hivatkozas: '9/2023 ÉKM 1. melléklet 1.1. 16. sor (terv nélkül)' } }],
    helyisegek: [],
    epulet: { ...g.epulet, hohidKorrekcio: true },
    rendszerek: { ...structuredClone(g.rendszerek), napelemek: [] },
  };
}

export const mintabol = (m: Projekt): Projekt => ({ ...structuredClone(m), azon: ujAzon('p'), modositva: new Date().toISOString() });

export type Ful = 'epulet' | 'szerkezetek' | 'helyisegek' | 'gepeszet' | 'eredmeny';
const FULEK: { azon: Ful; nev: string }[] = [
  { azon: 'helyisegek', nev: 'Helyiségek' },
  { azon: 'szerkezetek', nev: 'Szerkezetek' },
  { azon: 'gepeszet', nev: 'Gépészet' },
  { azon: 'epulet', nev: 'Épület' },
  { azon: 'eredmeny', nev: 'Eredmény' },
];

export type Valtoztat = (f: (p: Projekt) => void) => void;

export function App() {
  const [lista, setLista] = useState<Projekt[] | null>(null);
  const [aktiv, setAktiv] = useState<Projekt | null>(null);
  const [ful, setFul] = useState<Ful>('eredmeny');
  const [tartos, setTartos] = useState(true);
  const mentesIdozito = useRef(0);

  useEffect(() => {
    void (async () => {
      setTartos(await tarolo.tarolasElerheto());
      const l = await tarolo.projektek();
      if (l.length === 0) {
        const kezdo = mintabol(MINTAK[0]!.projekt);
        await tarolo.ment(kezdo);
        l.push(kezdo);
      }
      setLista(l.sort((a, b) => b.modositva.localeCompare(a.modositva)));
    })();
  }, []);

  const valtoztat: Valtoztat = (f) => {
    setAktiv((elozo) => {
      if (!elozo) return elozo;
      const uj = structuredClone(elozo);
      f(uj);
      uj.modositva = new Date().toISOString();
      window.clearTimeout(mentesIdozito.current);
      mentesIdozito.current = window.setTimeout(() => {
        void tarolo.ment(uj);
        setLista((l) => (l ? [uj, ...l.filter((x) => x.azon !== uj.azon)] : l));
      }, 300);
      return uj;
    });
  };

  const kimenet: SzamitasKimenet | null = useMemo(() => (aktiv ? szamolProjekt(aktiv) : null), [aktiv]);
  // A WinWatt-összevetés csak a módosítatlan mintánál látszik.
  const minta = useMemo(() => {
    if (!aktiv) return null;
    const kulcs = (x: Projekt): string => JSON.stringify({ ...x, azon: '', modositva: '' });
    const k = kulcs(aktiv);
    return MINTAK.find((m) => kulcs(m.projekt) === k)?.azon ?? null;
  }, [aktiv]);

  if (!lista) return <p class="halk kozep">Betöltés…</p>;

  if (!aktiv)
    return (
      <ProjektLista
        lista={lista}
        tartos={tartos}
        onMegnyit={(p) => {
          setAktiv(p);
          setFul('eredmeny');
        }}
        onUj={async (p) => {
          await tarolo.ment(p);
          setLista([p, ...lista]);
          setAktiv(p);
          setFul(p.helyisegek.length ? 'eredmeny' : 'szerkezetek');
        }}
        onTorol={async (azon) => {
          await tarolo.torol(azon);
          setLista(lista.filter((p) => p.azon !== azon));
        }}
      />
    );

  return (
    <div class="projekt">
      <header class="projekt-fej">
        <button class="vissza" onClick={() => setAktiv(null)} aria-label="Vissza a projektekhez">
          ‹ Projektek
        </button>
        <h1>{aktiv.nev}</h1>
      </header>
      <div class="tapado">
        <OsszegzoSav kimenet={kimenet} onHianyok={() => setFul('eredmeny')} />
        <nav class="fulek" role="tablist">
          {FULEK.map((f) => (
            <button key={f.azon} role="tab" aria-selected={ful === f.azon} onClick={() => setFul(f.azon)}>
              {f.nev}
            </button>
          ))}
        </nav>
      </div>
      <main class="tartalom">
        {ful === 'epulet' && <EpuletNezet p={aktiv} valtoztat={valtoztat} />}
        {ful === 'szerkezetek' && <SzerkezetekNezet p={aktiv} valtoztat={valtoztat} />}
        {ful === 'helyisegek' && <HelyisegekNezet p={aktiv} valtoztat={valtoztat} />}
        {ful === 'gepeszet' && <GepeszetNezet p={aktiv} valtoztat={valtoztat} />}
        {ful === 'eredmeny' && kimenet && <EredmenyNezet p={aktiv} kimenet={kimenet} minta={minta} onUgras={setFul} />}
      </main>
    </div>
  );
}
