import { MODELL_VERZIO, ujAzon, type Projekt } from '@bimline/model';
import { useState } from 'preact/hooks';
import { MINTAK, mintabol, ujProjekt } from '../App.js';
import { Kartya, TorlesGomb } from '../ui.js';

export function ProjektLista(p: { lista: Projekt[]; tartos: boolean; onMegnyit: (p: Projekt) => void; onUj: (p: Projekt) => void; onTorol: (azon: string) => void }) {
  const [importSzoveg, setImportSzoveg] = useState('');
  const [importHiba, setImportHiba] = useState('');
  const [exportAzon, setExportAzon] = useState<string | null>(null);

  const importal = (szoveg: string): void => {
    try {
      const x = JSON.parse(szoveg) as Projekt;
      if (x.verzio !== MODELL_VERZIO || !Array.isArray(x.helyisegek)) throw new Error('Nem BIMLine projektfájl (1. verzió).');
      p.onUj({ ...x, azon: ujAzon('p'), modositva: new Date().toISOString() });
      setImportSzoveg('');
      setImportHiba('');
    } catch (e) {
      setImportHiba((e as Error).message);
    }
  };

  return (
    <div class="lista-oldal">
      <header class="fej">
        <h1>BIMLine energetika</h1>
        <p class="halk">Épületenergetikai számítás a 9/2023. (V. 25.) ÉKM rendelet szerint. A projektek ezen a készüléken tárolódnak, internet nélkül is.</p>
        {!p.tartos && <p class="figyelem">A böngésző itt nem enged tartós tárolást: a projektek az oldal bezárásáig maradnak meg. Mentsd ki őket JSON-ként.</p>}
      </header>
      <Kartya cim="Projektek">
        <ul class="projektek">
          {p.lista.map((x) => (
            <li key={x.azon}>
              <button class="projekt-gomb" onClick={() => p.onMegnyit(x)}>
                <b>{x.nev}</b>
                <span class="halk">
                  {x.helyisegek.length} helyiség · {new Date(x.modositva).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </button>
              <div class="projekt-muveletek">
                <button class="masodlagos" onClick={() => p.onUj({ ...structuredClone(x), azon: ujAzon('p'), nev: `${x.nev} (másolat)`, modositva: new Date().toISOString() })}>
                  Másolat
                </button>
                <button class="masodlagos" onClick={() => setExportAzon(exportAzon === x.azon ? null : x.azon)}>
                  JSON
                </button>
                <TorlesGomb cimke="Törlés" onTorol={() => p.onTorol(x.azon)} />
              </div>
              {exportAzon === x.azon && <ExportDoboz p={x} />}
            </li>
          ))}
        </ul>
        <div class="gombok">
          <button class="elsodleges" onClick={() => p.onUj(ujProjekt())}>
            + Új üres projekt
          </button>
          {MINTAK.map((m) => (
            <button key={m.azon} class="masodlagos" onClick={() => p.onUj(mintabol(m.projekt))}>
              + {m.cim}
            </button>
          ))}
        </div>
      </Kartya>
      <Kartya cim="Projekt betöltése JSON-ból">
        <textarea id="import" rows={4} placeholder="Illeszd be a kimentett projekt JSON-ját…" value={importSzoveg} onInput={(e) => setImportSzoveg((e.target as HTMLTextAreaElement).value)} />
        <div class="gombok">
          <button class="masodlagos" disabled={!importSzoveg} onClick={() => importal(importSzoveg)}>
            Betöltés
          </button>
          <label class="fajl-gomb masodlagos">
            Fájl választása…
            <input
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) importal(await f.text());
              }}
            />
          </label>
        </div>
        {importHiba && <p class="hiba">{importHiba}</p>}
      </Kartya>
      <p class="lab">Fejlesztői változat, tanúsításra még nem használható.</p>
    </div>
  );
}

function ExportDoboz(p: { p: Projekt }) {
  const json = JSON.stringify(p.p, null, 1);
  const [allapot, setAllapot] = useState('');
  return (
    <div class="export">
      <textarea readOnly rows={5} value={json} onFocus={(e) => (e.target as HTMLTextAreaElement).select()} />
      <div class="gombok">
        <button
          class="masodlagos"
          onClick={() =>
            navigator.clipboard.writeText(json).then(
              () => setAllapot('Vágólapra másolva.'),
              () => setAllapot('A másolás nem engedélyezett: jelöld ki a szöveget.'),
            )
          }
        >
          Másolás
        </button>
        <a class="gomb masodlagos" download={`${p.p.nev.replace(/[^\p{L}\p{N}]+/gu, '_')}.bimline.json`} href={URL.createObjectURL(new Blob([json], { type: 'application/json' }))}>
          Letöltés
        </a>
      </div>
      {allapot && <p class="halk">{allapot}</p>}
    </div>
  );
}
