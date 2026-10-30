// Rajzolt alaprajz: helyiségek belméretű kontúrja ujjal vagy egérrel (téglalap, sokszög), rácsra és csúcsokra igazítva.
// A rajzból számít az alapterület, a falak felülete és tájolása, a közös falak és a padló kitett kerülete (model/alaprajz.ts).
import type { Tajolas } from '@bimline/calc-core';
import { alapOldal, alapReszek, elojelesTerulet, helyisegElek, ujAzon, type Helyiseg, type Pont, type Projekt, type SzerkezetTipus, type Tuloldal } from '@bimline/model';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Valtoztat } from '../App.js';
import { Gombsor, Kartya, SzamMezo, SzovegMezo, TorlesGomb, Valaszto, szam } from '../ui.js';
import { FUTETLEN, HataroloSor } from './Helyisegek.js';
import { SZERKEZET_NEV } from './Szerkezetek.js';

type Eszkoz = 'kijelöl' | 'téglalap' | 'sokszög';
const ESZKOZOK: readonly Eszkoz[] = ['kijelöl', 'téglalap', 'sokszög'];
interface Nezet {
  /** px / m */
  k: number;
  /** a bal felső sarok világkoordinátája [m] */
  vx: number;
  vy: number;
}
interface Kijeloles {
  hs: string;
  el?: number;
}

const FAL_TIPUSOK: readonly SzerkezetTipus[] = ['homlokzati_fal', 'futott_futetlen_kozotti_fal', 'szomszed_futott_epulet_fal'];
const vanRajz = (h: Helyiseg): boolean => !!h.alaprajz && h.alaprajz.pontok.length >= 3;
const kozeppont = (p: readonly Pont[]): Pont => {
  const A = elojelesTerulet(p);
  if (Math.abs(A) < 1e-9) return p[0]!;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    const f = a.x * b.y - b.x * a.y;
    cx += (a.x + b.x) * f;
    cy += (a.y + b.y) * f;
  }
  return { x: cx / (6 * A), y: cy / (6 * A) };
};
const szakaszTav = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};
const benne = (q: Pont, p: readonly Pont[]): boolean => {
  let b = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const a = p[i]!;
    const c = p[j]!;
    if (a.y > q.y !== c.y > q.y && q.x < ((c.x - a.x) * (q.y - a.y)) / (c.y - a.y) + a.x) b = !b;
  }
  return b;
};
const kerek = (x: number): number => Math.round(x * 1000) / 1000;

export function AlaprajzNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const szintek = [...new Set(p.helyisegek.map((h) => h.szint))];
  const [szint, setSzint] = useState<string>(szintek[0] ?? 'fsz');
  const [eszkoz, setEszkoz] = useState<Eszkoz>(p.helyisegek.some(vanRajz) ? 'kijelöl' : 'téglalap');
  const [kij, setKij] = useState<Kijeloles | null>(null);
  const [nezet, setNezet] = useState<Nezet>({ k: 40, vx: -1, vy: 12 });
  const [vazlat, setVazlat] = useState<Pont[]>([]);
  const [kurzor, setKurzor] = useState<Pont | null>(null);
  const [meret, setMeret] = useState({ w: 360, h: 300 });
  const svgRef = useRef<SVGSVGElement>(null);
  const muvelet = useRef<
    | { tipus: 'pan'; sx: number; sy: number; nezet: Nezet; mozgott: boolean }
    | { tipus: 'teglalap'; kezd: Pont }
    | { tipus: 'csucs'; hs: string; i: number }
    | { tipus: 'koppint'; sx: number; sy: number; nezet: Nezet; mozgott: boolean }
    | null
  >(null);
  const ujjak = useRef(new Map<number, { x: number; y: number }>());
  const csipes = useRef<{ tav: number; kozep: { x: number; y: number }; nezet: Nezet } | null>(null);

  const szintHs = p.helyisegek.filter((h) => h.szint === szint);
  const alattiSzint = szintek[szintek.indexOf(szint) - 1];
  const alattiHs = alattiSzint === undefined ? [] : p.helyisegek.filter((h) => h.szint === alattiSzint && vanRajz(h));
  const kivalasztott = kij ? p.helyisegek.find((h) => h.azon === kij.hs) : undefined;

  // Méret: a doboz szélessége, telefonon 4:3, széles képernyőn magasabb.
  useEffect(() => {
    // A doboz teljes szélességét kitölti (CSS 100%), így a mérete nem hat vissza az elrendezésre.
    const el = svgRef.current;
    if (!el) return;
    const fr = (): void => {
      const w = el.clientWidth;
      const h = Math.round(Math.min(Math.max(w * 0.78, 280), window.innerHeight * 0.62));
      setMeret((m) => (m.w === w && m.h === h ? m : { w, h }));
    };
    fr();
    const ro = new ResizeObserver(fr);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const illeszt = (): void => {
    const pp = szintHs.filter(vanRajz).flatMap((h) => h.alaprajz!.pontok);
    if (pp.length === 0) return setNezet({ k: Math.min(meret.w, meret.h) / 12, vx: -1, vy: meret.h / (Math.min(meret.w, meret.h) / 12) - 1 });
    const minx = Math.min(...pp.map((q) => q.x));
    const maxx = Math.max(...pp.map((q) => q.x));
    const miny = Math.min(...pp.map((q) => q.y));
    const maxy = Math.max(...pp.map((q) => q.y));
    const k = Math.min(meret.w / (maxx - minx + 3), meret.h / (maxy - miny + 3));
    setNezet({ k, vx: (minx + maxx) / 2 - meret.w / 2 / k, vy: (miny + maxy) / 2 + meret.h / 2 / k });
  };
  useEffect(illeszt, [szint, meret.w, meret.h]);

  const kepre = (q: Pont): { x: number; y: number } => ({ x: (q.x - nezet.vx) * nezet.k, y: (nezet.vy - q.y) * nezet.k });
  const vilagba = (x: number, y: number, n = nezet): Pont => ({ x: n.vx + x / n.k, y: n.vy - y / n.k });
  const racs = nezet.k > 90 ? 0.1 : nezet.k > 35 ? 0.25 : 0.5;
  const igazit = (q: Pont, kiveve?: { hs: string; i: number }): Pont => {
    let leg: Pont | null = null;
    let legTav = 14 / nezet.k;
    for (const h of [...szintHs, ...alattiHs])
      for (const [i, c] of (h.alaprajz?.pontok ?? []).entries()) {
        if (kiveve && h.azon === kiveve.hs && i === kiveve.i) continue;
        const t = Math.hypot(c.x - q.x, c.y - q.y);
        if (t < legTav) [leg, legTav] = [c, t];
      }
    for (const c of vazlat) {
      const t = Math.hypot(c.x - q.x, c.y - q.y);
      if (t < legTav) [leg, legTav] = [c, t];
    }
    return leg ? { ...leg } : { x: kerek(Math.round(q.x / racs) * racs), y: kerek(Math.round(q.y / racs) * racs) };
  };
  const helyi = (e: PointerEvent): { x: number; y: number } => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const ujHelyiseg = (pontok: Pont[]): void => {
    if (pontok.length < 3 || Math.abs(elojelesTerulet(pontok)) < 0.25) return;
    const azon = ujAzon('hs');
    valtoztat((x) => {
      const elozo = x.helyisegek.filter((h) => h.szint === szint).at(-1) ?? x.helyisegek.at(-1);
      const h: Helyiseg = { azon, nev: `Helyiség ${x.helyisegek.length + 1}`, szint, alapterulet: 0, belmagassag: elozo?.belmagassag ?? 2.7, hatarolok: [], alaprajz: { pontok } };
      x.helyisegek.push(h);
      const fal = x.retegrendek.find((r) => r.szerkezet === 'homlokzati_fal');
      if (fal)
        for (const e of helyisegElek(x, h))
          if (e.szabad > 0.01) h.hatarolok.push({ azon: ujAzon('h'), retegrendAzon: fal.azon, tuloldal: { fajta: 'külső' }, felulet: 0, nyilasok: [], rajzEl: e.i });
      // A szint padló- és födémbeállítása az előző helyiségé.
      for (const b of elozo?.hatarolok ?? [])
        if (b.rajzAlap) {
          const masolat = { ...structuredClone(b), azon: ujAzon('h'), nyilasok: [] };
          delete masolat.alaprajziTerulet;
          h.hatarolok.push(masolat);
        }
    });
    setKij({ hs: azon });
    setEszkoz('kijelöl');
  };

  const talalat = (sp: { x: number; y: number }): Kijeloles | null => {
    let leg: Kijeloles | null = null;
    let legTav = 16;
    for (const h of szintHs.filter(vanRajz)) {
      const pp = h.alaprajz!.pontok;
      pp.forEach((a, i) => {
        const t = szakaszTav(sp, kepre(a), kepre(pp[(i + 1) % pp.length]!));
        if (t < legTav) [leg, legTav] = [{ hs: h.azon, el: i }, t];
      });
    }
    if (leg) return leg;
    const w = vilagba(sp.x, sp.y);
    const h = szintHs.filter(vanRajz).find((x) => benne(w, x.alaprajz!.pontok));
    return h ? { hs: h.azon } : null;
  };

  const le = (e: PointerEvent): void => {
    const svg = svgRef.current!;
    svg.setPointerCapture(e.pointerId);
    const sp = helyi(e);
    ujjak.current.set(e.pointerId, sp);
    if (ujjak.current.size === 2) {
      const [a, b] = [...ujjak.current.values()];
      csipes.current = { tav: Math.hypot(a!.x - b!.x, a!.y - b!.y), kozep: { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 }, nezet };
      muvelet.current = null;
      return;
    }
    if (eszkoz === 'téglalap') {
      muvelet.current = { tipus: 'teglalap', kezd: igazit(vilagba(sp.x, sp.y)) };
      setKurzor(muvelet.current.kezd);
      return;
    }
    if (eszkoz === 'kijelöl' && kivalasztott && vanRajz(kivalasztott)) {
      const i = kivalasztott.alaprajz!.pontok.findIndex((c) => Math.hypot(kepre(c).x - sp.x, kepre(c).y - sp.y) < 18);
      if (i >= 0) {
        muvelet.current = { tipus: 'csucs', hs: kivalasztott.azon, i };
        return;
      }
    }
    muvelet.current = { tipus: 'koppint', sx: sp.x, sy: sp.y, nezet, mozgott: false };
  };

  const mozog = (e: PointerEvent): void => {
    const sp = helyi(e);
    if (ujjak.current.has(e.pointerId)) ujjak.current.set(e.pointerId, sp);
    if (csipes.current && ujjak.current.size === 2) {
      const [a, b] = [...ujjak.current.values()];
      const c = csipes.current;
      const k = Math.min(400, Math.max(8, (c.nezet.k * Math.hypot(a!.x - b!.x, a!.y - b!.y)) / c.tav));
      const kozep = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 };
      const w = vilagba(c.kozep.x, c.kozep.y, c.nezet);
      setNezet({ k, vx: w.x - kozep.x / k, vy: w.y + kozep.y / k });
      return;
    }
    const m = muvelet.current;
    if (eszkoz === 'sokszög' || eszkoz === 'téglalap') setKurzor(igazit(vilagba(sp.x, sp.y)));
    if (!m) return;
    if (m.tipus === 'koppint') {
      if (Math.hypot(sp.x - m.sx, sp.y - m.sy) > 6) m.mozgott = true;
      if (m.mozgott) setNezet({ ...m.nezet, vx: m.nezet.vx - (sp.x - m.sx) / m.nezet.k, vy: m.nezet.vy + (sp.y - m.sy) / m.nezet.k });
    } else if (m.tipus === 'csucs') {
      const q = igazit(vilagba(sp.x, sp.y), { hs: m.hs, i: m.i });
      valtoztat((x) => {
        const h = x.helyisegek.find((y) => y.azon === m.hs);
        if (h?.alaprajz) h.alaprajz.pontok[m.i] = q;
      });
    }
  };

  const fel = (e: PointerEvent): void => {
    ujjak.current.delete(e.pointerId);
    if (ujjak.current.size < 2) csipes.current = null;
    const m = muvelet.current;
    muvelet.current = null;
    if (!m) return;
    const sp = helyi(e);
    if (m.tipus === 'teglalap') {
      const v = igazit(vilagba(sp.x, sp.y));
      const a = m.kezd;
      if (Math.abs(v.x - a.x) >= 0.5 && Math.abs(v.y - a.y) >= 0.5) {
        const [x0, x1] = [Math.min(a.x, v.x), Math.max(a.x, v.x)];
        const [y0, y1] = [Math.min(a.y, v.y), Math.max(a.y, v.y)];
        ujHelyiseg([
          { x: x0, y: y0 },
          { x: x1, y: y0 },
          { x: x1, y: y1 },
          { x: x0, y: y1 },
        ]);
      }
      setKurzor(null);
    } else if (m.tipus === 'koppint' && !m.mozgott) {
      if (eszkoz === 'sokszög') {
        const q = igazit(vilagba(sp.x, sp.y));
        const elso = vazlat[0];
        if (elso && vazlat.length >= 3 && Math.hypot(kepre(elso).x - sp.x, kepre(elso).y - sp.y) < 18) {
          ujHelyiseg(vazlat);
          setVazlat([]);
        } else if (!vazlat.some((c) => c.x === q.x && c.y === q.y)) setVazlat([...vazlat, q]);
      } else setKij(talalat(sp));
    }
  };

  const gorget = (e: WheelEvent): void => {
    e.preventDefault();
    const sp = { x: e.offsetX, y: e.offsetY };
    const w = vilagba(sp.x, sp.y);
    const k = Math.min(400, Math.max(8, nezet.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
    setNezet({ k, vx: w.x - sp.x / k, vy: w.y + sp.y / k });
  };
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', gorget, { passive: false });
    return () => svg.removeEventListener('wheel', gorget);
  });
  const nagyit = (f: number): void => {
    const c = vilagba(meret.w / 2, meret.h / 2);
    const k = Math.min(400, Math.max(8, nezet.k * f));
    setNezet({ k, vx: c.x - meret.w / 2 / k, vy: c.y + meret.h / 2 / k });
  };

  // Rács: a látható tartományban, a kiválasztott lépésköz többszörösein.
  const racsVonalak: preact.JSX.Element[] = [];
  const fo = racs * (racs === 0.1 ? 10 : racs === 0.25 ? 4 : 2);
  const vegx = nezet.vx + meret.w / nezet.k;
  const vegy = nezet.vy - meret.h / nezet.k;
  for (let x = Math.ceil(nezet.vx / racs) * racs; x <= vegx; x += racs) {
    const s = (x - nezet.vx) * nezet.k;
    racsVonalak.push(<line key={`x${x.toFixed(2)}`} x1={s} x2={s} y1={0} y2={meret.h} class={Math.abs(x / fo - Math.round(x / fo)) < 1e-6 ? 'racs-fo' : 'racs-al'} />);
  }
  for (let y = Math.ceil(vegy / racs) * racs; y <= nezet.vy; y += racs) {
    const s = (nezet.vy - y) * nezet.k;
    racsVonalak.push(<line key={`y${y.toFixed(2)}`} y1={s} y2={s} x1={0} x2={meret.w} class={Math.abs(y / fo - Math.round(y / fo)) < 1e-6 ? 'racs-fo' : 'racs-al'} />);
  }

  const eszak = p.epulet.eszakSzog ?? 0;
  const ut = (pp: readonly Pont[]): string => pp.map((c, i) => `${i ? 'L' : 'M'}${kepre(c).x.toFixed(1)},${kepre(c).y.toFixed(1)}`).join('') + 'Z';

  return (
    <div class="alaprajz-oldal">
      <Kartya
        cim="Alaprajz"
        jobb={
          <div class="gombok kicsi">
            {szintek.length > 0 && <Gombsor ertek={szint} opciok={szintek.includes(szint) ? szintek : [...szintek, szint]} onValtozas={(s) => (setSzint(s), setKij(null))} />}
            <button
              class="masodlagos"
              onClick={() => {
                const nev = szintek.length === 0 ? 'fsz' : `${szintek.length}. emelet`;
                setSzint(nev);
                setKij(null);
              }}
            >
              + Szint
            </button>
          </div>
        }
      >
        <div class="rajz-eszkozok">
          <Gombsor ertek={eszkoz} opciok={ESZKOZOK} onValtozas={(t) => (setEszkoz(t), setVazlat([]))} />
          <div class="gombok kicsi">
            <button type="button" onClick={() => nagyit(1.25)} aria-label="Nagyítás">
              +
            </button>
            <button type="button" onClick={() => nagyit(0.8)} aria-label="Kicsinyítés">
              −
            </button>
            <button type="button" onClick={illeszt}>
              Mind
            </button>
          </div>
        </div>
        <p class="halk rajz-sugo">
          {eszkoz === 'téglalap' && 'Húzd az ujjad sarokból sarokba: a helyiség belméretű kontúrja. Rácsra és a meglévő sarkokra igazít.'}
          {eszkoz === 'sokszög' && (vazlat.length === 0 ? 'Koppints a sarkokra sorban; az elsőre koppintva zárul.' : `${vazlat.length} pont – az elsőre koppintva vagy a Kész gombbal zárul.`)}
          {eszkoz === 'kijelöl' && 'Koppints egy falra vagy helyiségre. A kijelölt helyiség sarkai húzhatók. Két ujjal nagyítás.'}
        </p>
        <div class="rajz-doboz">
          <svg
            ref={svgRef}
            style={{ height: `${meret.h}px` }}
            class={`rajz eszkoz-${eszkoz}`}
            onPointerDown={le}
            onPointerMove={mozog}
            onPointerUp={fel}
            onPointerCancel={() => ((muvelet.current = null), ujjak.current.clear(), (csipes.current = null))}
            onPointerLeave={() => eszkoz !== 'kijelöl' && setKurzor(null)}
            role="img"
            aria-label={`Alaprajz, ${szint}: ${szintHs.length} helyiség`}
          >
            {racsVonalak}
            {alattiHs.map((h) => (
              <path key={`a${h.azon}`} d={ut(h.alaprajz!.pontok)} class="rajz-alatti" />
            ))}
            {szintHs.filter(vanRajz).map((h) => {
              const pp = h.alaprajz!.pontok;
              const el = helyisegElek(p, h);
              const c = kepre(kozeppont(pp));
              const sel = kij?.hs === h.azon;
              return (
                <g key={h.azon} class={sel ? 'kij' : ''}>
                  <path d={ut(pp)} class="rajz-helyiseg" />
                  {el.map((e) => {
                    const b = h.hatarolok.find((x) => x.rajzEl === e.i);
                    const a = kepre(e.a);
                    const v = kepre(e.b);
                    const tipus = e.szabad < 0.01 ? 'kozos' : !b ? (e.kozos > 0.01 ? 'kozos' : 'nincs') : b.tuloldal.fajta === 'külső' ? 'kulso' : b.tuloldal.fajta === 'fűtetlen' ? 'futetlen' : 'kozos';
                    const ny = b ? b.nyilasok.reduce((s, n) => s + n.szelesseg * n.db, 0) : 0;
                    const nyl = Math.min(ny, e.hossz * 0.9) / e.hossz;
                    const elSel = sel && kij?.el === e.i;
                    return (
                      <g key={e.i}>
                        <line x1={a.x} y1={a.y} x2={v.x} y2={v.y} class={`rajz-el el-${tipus}${elSel ? ' el-kij' : ''}`} />
                        {nyl > 0 && (
                          <line
                            x1={a.x + (v.x - a.x) * (0.5 - nyl / 2)}
                            y1={a.y + (v.y - a.y) * (0.5 - nyl / 2)}
                            x2={a.x + (v.x - a.x) * (0.5 + nyl / 2)}
                            y2={a.y + (v.y - a.y) * (0.5 + nyl / 2)}
                            class="rajz-ablak"
                          />
                        )}
                        {sel && e.hossz * nezet.k > 44 && (
                          <text x={(a.x + v.x) / 2} y={(a.y + v.y) / 2} class="rajz-meret" text-anchor="middle" dominant-baseline="middle">
                            {szam(e.hossz, 2)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <text x={c.x} y={c.y - 7} class="rajz-nev" text-anchor="middle">
                    {h.nev}
                  </text>
                  <text x={c.x} y={c.y + 10} class="rajz-ter" text-anchor="middle">
                    {szam(h.alapterulet, 1)} m²
                  </text>
                  {sel && pp.map((q, i) => <circle key={i} cx={kepre(q).x} cy={kepre(q).y} r={7} class="rajz-csucs" />)}
                </g>
              );
            })}
            {vazlat.length > 0 && (
              <polyline points={[...vazlat, ...(kurzor ? [kurzor] : [])].map((q) => `${kepre(q).x},${kepre(q).y}`).join(' ')} class="rajz-vazlat" />
            )}
            {vazlat.map((q, i) => (
              <circle key={i} cx={kepre(q).x} cy={kepre(q).y} r={i === 0 ? 9 : 5} class={i === 0 ? 'rajz-csucs elso' : 'rajz-csucs'} />
            ))}
            {muvelet.current?.tipus === 'teglalap' && kurzor && (
              <TeglalapElonezet a={muvelet.current.kezd} b={kurzor} kepre={kepre} />
            )}
            {kurzor && eszkoz !== 'kijelöl' && <circle cx={kepre(kurzor).x} cy={kepre(kurzor).y} r={4} class="rajz-kurzor" />}
            <g transform={`translate(${meret.w - 30},30) rotate(${-eszak})`} class="rajz-eszak">
              <circle r={18} />
              <path d="M0,-14 L6,6 L0,2 L-6,6Z" />
              <text y={-20} text-anchor="middle">
                É
              </text>
            </g>
          </svg>
        </div>
        {eszkoz === 'sokszög' && vazlat.length > 0 && (
          <div class="gombok kicsi">
            <button class="elsodleges" disabled={vazlat.length < 3} onClick={() => (ujHelyiseg(vazlat), setVazlat([]))}>
              Kész
            </button>
            <button class="masodlagos" onClick={() => setVazlat(vazlat.slice(0, -1))}>
              Vissza
            </button>
            <button class="masodlagos" onClick={() => setVazlat([])}>
              Elvet
            </button>
          </div>
        )}
        <div class="jelmagyarazat">
          <span>
            <i class="j-kulso" />
            külső fal
          </span>
          <span>
            <i class="j-futetlen" />
            fűtetlen felé
          </span>
          <span>
            <i class="j-kozos" />
            közös / belső
          </span>
          <span>
            <i class="j-ablak" />
            nyílás
          </span>
        </div>
        <SzamMezo id="eszak" cimke="Északi irány (a rajz tetejétől, óramutató szerint)" egyseg="°" ertek={eszak} onValtozas={(v) => valtoztat((x) => void (x.epulet.eszakSzog = v))} />
      </Kartya>
      <div class="alaprajz-panel">
        {kivalasztott && kij?.el !== undefined && vanRajz(kivalasztott) ? (
          <ElPanel p={p} h={kivalasztott} el={kij.el} valtoztat={valtoztat} onHelyiseg={() => setKij({ hs: kivalasztott.azon })} />
        ) : kivalasztott ? (
          <HelyisegPanel p={p} h={kivalasztott} valtoztat={valtoztat} onTorolve={() => setKij(null)} />
        ) : (
          <Kartya cim="Kijelölés">
            <p class="halk">
              {szintHs.length === 0
                ? 'Ezen a szinten még nincs helyiség. Rajzolj egy téglalapot.'
                : 'Koppints egy helyiségre (név, belmagasság, padló és födém) vagy egy falára (szerkezet, túloldal, nyílások, pontos hossz).'}
            </p>
          </Kartya>
        )}
      </div>
    </div>
  );
}

function TeglalapElonezet({ a, b, kepre }: { a: Pont; b: Pont; kepre: (q: Pont) => { x: number; y: number } }) {
  const p = kepre(a);
  const q = kepre(b);
  return (
    <g>
      <rect x={Math.min(p.x, q.x)} y={Math.min(p.y, q.y)} width={Math.abs(q.x - p.x)} height={Math.abs(q.y - p.y)} class="rajz-vazlat" />
      <text x={(p.x + q.x) / 2} y={Math.min(p.y, q.y) - 6} class="rajz-meret" text-anchor="middle">
        {szam(Math.abs(b.x - a.x), 2)} × {szam(Math.abs(b.y - a.y), 2)} m
      </text>
    </g>
  );
}

interface ReszDef {
  cimke: string;
  sz: SzerkezetTipus;
  t: Tuloldal;
  hajlasszog?: number;
}
const ALATTA: readonly ReszDef[] = [
  { cimke: 'talajon', sz: 'talajon_fekvo_padlo', t: { fajta: 'talaj' } },
  { cimke: 'fűtetlen pince felett', sz: 'also_zarofodem_futetlen_felett', t: { fajta: 'fűtetlen', ter: 'Zárt, fűtetlen pincével határos födém vagy fal' } },
  { cimke: 'kültér (árkád)', sz: 'arkad_athajto_feletti_fodem', t: { fajta: 'külső' } },
];
const FELETTE: readonly ReszDef[] = [
  { cimke: 'lapostető', sz: 'lapos_teto', t: { fajta: 'külső' }, hajlasszog: 0 },
  { cimke: 'padlásfödém', sz: 'padlasfodem', t: { fajta: 'fűtetlen', ter: 'Padlástérrel határos födém vagy fal' }, hajlasszog: 0 },
  { cimke: 'ferde tető', sz: 'futott_tetoter_hatarolo', t: { fajta: 'külső' } },
];

function HelyisegPanel({ p, h, valtoztat, onTorolve }: { p: Projekt; h: Helyiseg; valtoztat: Valtoztat; onTorolve: () => void }) {
  const vh = (f: (x: Helyiseg) => void): void => valtoztat((x) => f(x.helyisegek.find((y) => y.azon === h.azon)!));
  const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
  const [uzenet, setUzenet] = useState('');
  const hozzaad = (oldal: 'alatta' | 'felette', d: ReszDef): void => {
    setUzenet('');
    const r = p.retegrendek.find((x) => x.szerkezet === d.sz);
    if (!r) return setUzenet(`Ehhez előbb vegyél fel egy „${SZERKEZET_NEV[d.sz]}” típusú rétegrendet a Szerkezetek fülön.`);
    vh((x) => {
      // Az új rész a maradékot kapja; a korábbi „maradék” rész a mostani területét megtartja.
      for (const b of x.hatarolok) if (b.rajzAlap === oldal && b.alaprajziTerulet === undefined) b.alaprajziTerulet = b.felulet;
      x.hatarolok.push({
        azon: ujAzon('h'),
        retegrendAzon: r.azon,
        tuloldal: structuredClone(d.t),
        ...(d.hajlasszog !== undefined ? { hajlasszog: d.hajlasszog } : {}),
        felulet: 0,
        nyilasok: [],
        rajzAlap: oldal,
        ...(d.sz === 'talajon_fekvo_padlo' ? { kitettKerulet: 0 } : {}),
      });
    });
  };
  const oldalak = (['alatta', 'felette'] as const).map((o) => {
    const reszek = h.hatarolok.filter((b) => alapOldal(b, rr.get(b.retegrendAzon)) === o);
    return { o, reszek, m: alapReszek(h, reszek) };
  });
  return (
    <Kartya cim={h.nev} jobb={<span class="halk">{szam(h.alapterulet, 2)} m²</span>}>
      <div class="racs">
        <SzovegMezo id={`ap-${h.azon}-nev`} cimke="Név" ertek={h.nev} onValtozas={(s) => vh((x) => void (x.nev = s))} />
        <SzamMezo id={`ap-${h.azon}-m`} cimke="Belmagasság" egyseg="m" ertek={h.belmagassag} onValtozas={(v) => vh((x) => void (x.belmagassag = v))} />
      </div>
      {oldalak.map(({ o, reszek, m }) => (
        <section key={o} class="alap-oldal">
          <div class="kartya-fej">
            <h3>{o === 'alatta' ? 'Alatta (padló)' : 'Felette (födém, tető)'}</h3>
            <span class={`halk${m.tobblet > 0.01 ? ' hiba' : ''}`}>
              {reszek.length === 0 ? 'fűtött tér' : `lefedve ${szam(reszek.reduce((t, b) => t + (b.alaprajziTerulet ?? m.maradekResz), 0), 2)} / ${szam(h.alapterulet, 2)} m²`}
            </span>
          </div>
          {reszek.map((b) => (
            <div key={b.azon} class="alap-resz">
              <HataroloSor
                p={p}
                h={h}
                b={b}
                rrNev={rr.get(b.retegrendAzon)?.nev}
                valtoztat={(f) => vh((x) => f(x.hatarolok.find((y) => y.azon === b.azon)!))}
                onTorol={() => vh((x) => void (x.hatarolok = x.hatarolok.filter((y) => y.azon !== b.azon)))}
              />
            </div>
          ))}
          <div class="gombok kicsi">
            {(o === 'alatta' ? ALATTA : FELETTE).map((d) => (
              <button key={d.cimke} class="masodlagos" onClick={() => hozzaad(o, d)}>
                + {d.cimke}
              </button>
            ))}
          </div>
        </section>
      ))}
      {uzenet && <p class="figyelem">{uzenet}</p>}
      <TorlesGomb cimke="Helyiség törlése" onTorol={() => (valtoztat((x) => void (x.helyisegek = x.helyisegek.filter((y) => y.azon !== h.azon))), onTorolve())} />
    </Kartya>
  );
}

function ElPanel({ p, h, el, valtoztat, onHelyiseg }: { p: Projekt; h: Helyiseg; el: number; valtoztat: Valtoztat; onHelyiseg: () => void }) {
  const vh = (f: (x: Helyiseg) => void): void => valtoztat((x) => f(x.helyisegek.find((y) => y.azon === h.azon)!));
  const e = helyisegElek(p, h)[el];
  const b = h.hatarolok.find((x) => x.rajzEl === el);
  if (!e) return null;
  const falak = p.retegrendek.filter((r) => FAL_TIPUSOK.includes(r.szerkezet));
  const rr = (azon: string): SzerkezetTipus | undefined => p.retegrendek.find((y) => y.azon === azon)?.szerkezet;
  const tipus = !b ? 'belső' : b.tuloldal.fajta === 'fűtetlen' ? `fűtetlen:${b.tuloldal.ter}` : b.tuloldal.fajta;
  const beallit = (t: string): void =>
    vh((x) => {
      const regi = x.hatarolok.find((y) => y.rajzEl === el);
      if (t === 'belső') return void (x.hatarolok = x.hatarolok.filter((y) => y !== regi));
      const tul: Tuloldal = t.startsWith('fűtetlen:') ? { fajta: 'fűtetlen', ter: t.slice(9) as never } : (({ fajta: t }) as Tuloldal);
      const kivant: SzerkezetTipus = tul.fajta === 'fűtetlen' ? 'futott_futetlen_kozotti_fal' : tul.fajta === 'fűtött szomszéd' ? 'szomszed_futott_epulet_fal' : 'homlokzati_fal';
      const r = p.retegrendek.find((y) => y.szerkezet === kivant) ?? falak[0];
      if (regi) {
        regi.tuloldal = tul;
        if (r && rr(regi.retegrendAzon) !== kivant) regi.retegrendAzon = r.azon;
      } else if (r) x.hatarolok.push({ azon: ujAzon('h'), retegrendAzon: r.azon, tuloldal: tul, felulet: 0, nyilasok: [], rajzEl: el });
    });
  // Pontos hossz: a b végpont és a következő csúcs az él irányában tolódik (téglalapnál téglalap marad).
  const hossz = (uj: number): void =>
    vh((x) => {
      const pp = x.alaprajz!.pontok;
      const ux = (e.b.x - e.a.x) / e.hossz;
      const uy = (e.b.y - e.a.y) / e.hossz;
      const d = uj - e.hossz;
      const i1 = (el + 1) % pp.length;
      const i2 = (el + 2) % pp.length;
      for (const i of pp.length > 3 ? [i1, i2] : [i1]) pp[i] = { x: kerek(pp[i]!.x + ux * d), y: kerek(pp[i]!.y + uy * d) };
    });
  const tajolas: Tajolas | undefined = b?.tajolas;
  return (
    <Kartya
      cim={`${h.nev} – ${el + 1}. fal`}
      jobb={
        <button class="link" onClick={onHelyiseg}>
          a helyiség ›
        </button>
      }
    >
      <div class="racs">
        <SzamMezo id={`el-${h.azon}-${el}`} cimke="Hossz (belméret)" egyseg="m" ertek={kerek(e.hossz)} onValtozas={(v) => v > 0.05 && hossz(v)} />
        <div class="mezo">
          <span class="cimke">Rajzból</span>
          <span class="halk">
            {e.kozos > 0.01 ? `közös ${szam(e.kozos, 2)} m · ` : ''}szabad {szam(e.szabad, 2)} m · {tajolas ?? '–'}
          </span>
        </div>
      </div>
      <Valaszto
        id={`el-${h.azon}-${el}-t`}
        cimke="Túloldal"
        ertek={tipus}
        opciok={[
          { ertek: 'külső', nev: 'Külső levegő (külső fal)' },
          ...FUTETLEN.map((f) => ({ ertek: `fűtetlen:${f}`, nev: `Fűtetlen: ${f.replace(' határos födém vagy fal', '').replace(' határos fal', '')}` })),
          { ertek: 'fűtött szomszéd', nev: 'Fűtött szomszéd épület' },
          { ertek: 'belső', nev: 'Belső fal (nincs hőveszteség)' },
        ]}
        onValtozas={beallit}
      />
      {b && (
        <HataroloSor
          p={p}
          h={h}
          b={b}
          rrNev={p.retegrendek.find((r) => r.azon === b.retegrendAzon)?.nev}
          valtoztat={(f) => vh((x) => f(x.hatarolok.find((y) => y.azon === b.azon)!))}
          onTorol={() => beallit('belső')}
        />
      )}
      {!b && e.szabad > 0.01 && <p class="halk">Belső falként nem számít a hőveszteségbe.</p>}
      {falak.length === 0 && <p class="figyelem">Fal rétegrend még nincs: vegyél fel egyet a Szerkezetek fülön.</p>}
    </Kartya>
  );
}
