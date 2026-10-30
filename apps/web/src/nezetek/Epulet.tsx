import type { Projekt } from '@bimline/model';
import type { Valtoztat } from '../App.js';
import { Kapcsolo, Kartya, SzamMezo, SzovegMezo, Valaszto } from '../ui.js';

export function EpuletNezet({ p, valtoztat }: { p: Projekt; valtoztat: Valtoztat }) {
  const e = p.epulet;
  return (
    <>
      <Kartya cim="Projekt">
        <div class="racs">
          <SzovegMezo id="nev" cimke="Projekt neve" ertek={p.nev} onValtozas={(s) => valtoztat((x) => void (x.nev = s))} />
          <SzovegMezo id="cim" cimke="Cím" ertek={p.adatok.cim} onValtozas={(s) => valtoztat((x) => void (x.adatok.cim = s))} />
          <SzovegMezo id="hrsz" cimke="Helyrajzi szám" ertek={p.adatok.helyrajziSzam} onValtozas={(s) => valtoztat((x) => void (x.adatok.helyrajziSzam = s))} />
          <SzovegMezo id="megrendelo" cimke="Megrendelő" ertek={p.adatok.megrendelo} onValtozas={(s) => valtoztat((x) => void (x.adatok.megrendelo = s))} />
        </div>
      </Kartya>
      <Kartya cim="Épület">
        <div class="racs">
          <Valaszto id="rendeltetes" cimke="Rendeltetés (2. függ. 2.2.)" ertek={e.rendeltetes} opciok={['Családi ház*', 'Egyéb lakóépület*'] as const} onValtozas={(v) => valtoztat((x) => void (x.epulet.rendeltetes = v))} />
          <Valaszto
            id="cm"
            cimke="Hőtároló tömeg (6.5. táblázat)"
            ertek={e.cmKategoria}
            opciok={[
              { ertek: 1, nev: '1 – könnyű (95 kJ/m²K)' },
              { ertek: 2, nev: '2 – közepesen nehéz (190)' },
              { ertek: 3, nev: '3 – nehéz (280)' },
              { ertek: 4, nev: '4 – nagyon nehéz (560)' },
            ]}
            onValtozas={(v) => valtoztat((x) => void (x.epulet.cmKategoria = v as 1 | 2 | 3 | 4))}
          />
          <SzamMezo id="nfilt" cimke="Tömítetlenségi légcsere (2.4. tábla)" egyseg="1/h" ertek={e.nFilt} onValtozas={(v) => valtoztat((x) => void (x.epulet.nFilt = v))} />
          <Valaszto
            id="hohidassag"
            cimke="Csatlakozási hőhidak (6.2. tábla)"
            ertek={e.hohidassag}
            opciok={['gyengén hőhidas', 'közepesen hőhidas', 'erősen hőhidas'] as const}
            onValtozas={(v) => valtoztat((x) => void (x.epulet.hohidassag = v))}
          />
          <Valaszto
            id="kulsofal"
            cimke="Külső fal hőszigetelése"
            ertek={e.kulsoFalKialakitasa}
            opciok={['külső oldali, megszakítatlan hőszigeteléssel', 'hőszigetelés nélkül'] as const}
            onValtozas={(v) => valtoztat((x) => void (x.epulet.kulsoFalKialakitasa = v))}
          />
          <Valaszto
            id="labazat"
            cimke="Lábazati fal (6.4. tábla)"
            ertek={e.labazatiFal}
            opciok={['Lábazati fal hőszigeteletlen', 'Lábazati fal csak a terepszintig hőszigetelt', 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt'] as const}
            onValtozas={(v) => valtoztat((x) => void (x.epulet.labazatiFal = v))}
          />
        </div>
        <Kapcsolo id="uj" cimke="Új épület (a talajjal érintkező szerkezetek követelménye)" ertek={e.ujEpulet} onValtozas={(v) => valtoztat((x) => void (x.epulet.ujEpulet = v))} />
        <p class="halk">A csatlakozási hőhidakat a program mindig a módszer szerinti ζ-val veszi figyelembe (6.1–6.2. táblázat).</p>
      </Kartya>
    </>
  );
}
