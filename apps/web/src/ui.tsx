// Közös beviteli elemek: magyar tizedesvessző, mobil billentyűzet, mértékegység a mezőben.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export const szam = (x: number, tized = 1): string =>
  Number.isFinite(x) ? x.toLocaleString('hu-HU', { minimumFractionDigits: tized, maximumFractionDigits: tized }).replace(/\u00a0/g, '\u202f') : '–';

const szovegbe = (x: number | undefined): string => (x === undefined || !Number.isFinite(x) ? '' : String(x).replace('.', ','));

export function SzamMezo(p: {
  id: string;
  cimke: string;
  ertek: number | undefined;
  egyseg?: string;
  /** A tárolt érték és a megjelenített érték aránya (pl. m-ben tárolt, cm-ben mutatott vastagság: 100). */
  szorzo?: number;
  egesz?: boolean;
  onValtozas: (x: number) => void;
}) {
  const sz = p.szorzo ?? 1;
  const kulso = p.ertek === undefined ? undefined : Math.round(p.ertek * sz * 1e9) / 1e9;
  const [szoveg, setSzoveg] = useState(szovegbe(kulso));
  useEffect(() => {
    const most = Number(szoveg.replace(/\s/g, '').replace(',', '.'));
    if (most !== kulso) setSzoveg(szovegbe(kulso));
    // csak külső változásra frissül, gépelés közben nem írja felül a félkész szöveget
  }, [kulso]);
  const hibas = szoveg !== '' && !Number.isFinite(Number(szoveg.replace(/\s/g, '').replace(',', '.')));
  return (
    <label class="mezo">
      <span class="cimke">{p.cimke}</span>
      <span class={`bevitel${hibas ? ' hibas' : ''}`}>
        <input
          id={p.id}
          inputMode={p.egesz ? 'numeric' : 'decimal'}
          value={szoveg}
          onInput={(e) => {
            const s = (e.target as HTMLInputElement).value;
            setSzoveg(s);
            const v = Number(s.replace(/\s/g, '').replace(',', '.'));
            if (s !== '' && Number.isFinite(v)) p.onValtozas(v / sz);
          }}
          onFocus={(e) => (e.target as HTMLInputElement).select()}
        />
        {p.egyseg && <em>{p.egyseg}</em>}
      </span>
    </label>
  );
}

export function SzovegMezo(p: { id: string; cimke: string; ertek: string; onValtozas: (s: string) => void; hely?: string }) {
  return (
    <label class="mezo">
      <span class="cimke">{p.cimke}</span>
      <input id={p.id} class="szoveg" value={p.ertek} placeholder={p.hely} onInput={(e) => p.onValtozas((e.target as HTMLInputElement).value)} />
    </label>
  );
}

export function Valaszto<T extends string | number>(p: { id: string; cimke: string; ertek: T; opciok: readonly (T | { ertek: T; nev: string })[]; onValtozas: (x: T) => void }) {
  const lista = p.opciok.map((o) => (typeof o === 'object' ? o : { ertek: o, nev: String(o) }));
  return (
    <label class="mezo">
      <span class="cimke">{p.cimke}</span>
      <select
        id={p.id}
        value={String(p.ertek)}
        onChange={(e) => {
          const v = (e.target as HTMLSelectElement).value;
          const talalt = lista.find((o) => String(o.ertek) === v);
          if (talalt) p.onValtozas(talalt.ertek);
        }}
      >
        {lista.map((o) => (
          <option key={String(o.ertek)} value={String(o.ertek)}>
            {o.nev}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Gombsor<T extends string>(p: { cimke?: string; ertek: T | undefined; opciok: readonly T[]; onValtozas: (x: T) => void }) {
  return (
    <div class="gombsor-kulso">
      {p.cimke && <span class="cimke">{p.cimke}</span>}
      <div class="gombsor" role="radiogroup" aria-label={p.cimke}>
        {p.opciok.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={p.ertek === o} class={p.ertek === o ? 'aktiv' : ''} onClick={() => p.onValtozas(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Kapcsolo(p: { id: string; cimke: string; ertek: boolean; onValtozas: (x: boolean) => void }) {
  return (
    <label class="kapcsolo">
      <input id={p.id} type="checkbox" checked={p.ertek} onChange={(e) => p.onValtozas((e.target as HTMLInputElement).checked)} />
      <span>{p.cimke}</span>
    </label>
  );
}

export function Leptetos(p: { ertek: number; min?: number; onValtozas: (x: number) => void; cimke: string }) {
  return (
    <span class="leptetos" aria-label={p.cimke}>
      <button type="button" onClick={() => p.onValtozas(Math.max(p.min ?? 1, p.ertek - 1))} aria-label={`${p.cimke} csökkentése`}>
        −
      </button>
      <b>{p.ertek}</b>
      <button type="button" onClick={() => p.onValtozas(p.ertek + 1)} aria-label={`${p.cimke} növelése`}>
        +
      </button>
    </span>
  );
}

export function Kartya(p: { cim?: ComponentChildren; children: ComponentChildren; jobb?: ComponentChildren }) {
  return (
    <section class="kartya">
      {(p.cim || p.jobb) && (
        <div class="kartya-fej">
          {p.cim && <h2>{p.cim}</h2>}
          {p.jobb}
        </div>
      )}
      {p.children}
    </section>
  );
}

/** Kétlépéses törlés a felületen belül (a böngésző confirm() párbeszéde nem mindenhol érhető el). */
export function TorlesGomb(p: { cimke: string; onTorol: () => void; kicsi?: boolean }) {
  const [biztos, setBiztos] = useState(false);
  useEffect(() => {
    if (!biztos) return;
    const t = window.setTimeout(() => setBiztos(false), 3000);
    return () => window.clearTimeout(t);
  }, [biztos]);
  return (
    <button type="button" class={`torles${biztos ? ' biztos' : ''}${p.kicsi ? ' ikon' : ''}`} aria-label={p.cimke} onClick={() => (biztos ? p.onTorol() : setBiztos(true))}>
      {biztos ? 'Biztosan?' : p.kicsi ? '×' : p.cimke}
    </button>
  );
}
