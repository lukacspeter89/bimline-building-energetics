# Kézi kontrollpéldák

A számítási mag (`packages/calc-core`) ellenőrzése független referencia-számításokkal. A referenciák a képleteket a
számítási módszer szövegéből írják le (egyenletszámokkal), nem a TypeScript kódból; csak a táblázati adatokat olvassák
a `data/normativ` mappából. A `calc-core` tesztjei ezekhez az eredményekhez mérik magukat.

| Példa | Referencia | Eredmény | Teszt |
|-------|------------|----------|-------|
| Egyzónás doboz lakóépület (100 m², 300 m³, nehéz szerkezet, természetes szellőzés, éjszakai nyári szellőztetés): teljes havi nettó fűtési és hűtési mérleg, q_m, Q_F,o | `doboz_epulet.py` | `doboz_epulet_eredmeny.txt` | `packages/calc-core/test/netto.test.ts` („Kézi kontrollpélda”) |

Futtatás: `python3 -I docs/kontrollpeldak/doboz_epulet.py`

A hőtechnikai unit tesztek (`hotechnika.test.ts`) várt értékei szintén kézzel, a forrás képleteiből számolva szerepelnek a teszt nevében.
