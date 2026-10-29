# Golden tesztesetek – WinWatt-referencia (G1–G3)

Készült: 2026-10-29, WinWatt fecske 9.58 (2026.06.08), Péter gépén, a `winwatt-teszt\golden` mappában.
Cél: regressziós/összevető tesztek a webes energetikai számítóhoz. **A WinWatt-eredmény referencia, nem igazság**: ahol a jogszabály/szabvány (9/2023. ÉKM rendelet, MSZ EN ISO 52016/13370/6946, MSZ EN 12831) mást ad, az nyer, és az eltérést dokumentálni kell (lásd „Tűrések”).

## Esetek

| Eset | Épület | Fűtés / HMV | Egyéb | WinWatt-besorolás | Ep [kWh/m²a] | CO₂ [kg/m²a] | q [W/m³K] | A/V | Fűtési hőszükséglet [W] |
|---|---|---|---|---|---|---|---|---|---|
| G1 | 12×8×2,7 m, földszintes, lapostető, talajon fekvő padló (ISO 13370), 96 m² | kondenzációs gázkazán fűtött térben, radiátor 55/45, termosztatikus szelep / indirekt tároló kazánról, cirkuláció nélkül | – | B (116 %) | 88,20 | 23,39 | 0,13 (PDF: 0,126) | 1,157 | 3640 |
| G2 | 10×8 m, földszint + emelet, közbenső födém, padlásfödém fűtetlen padlás felé, 160 m² | levegő-víz hőszivattyú, padlófűtés / HMV hőszivattyúval | 4 kWp napelem, D, 30° | A+++ (−15 %) | −11,40 | 0,49 | 0,07 | 0,82 | 5174 |
| G3 | 12×8 m, fűtetlen pince felett, Ny-i fal fűtetlen garázs felé, lapostető, 96 m² | hőszivattyú, padlófűtés, puffer nélkül / HMV hőszivattyúval | hővisszanyerős szellőzés (n 0,5, η 85 %), split hűtés | A+ (68,7 %) | 52,19 | 10,55 | 0,12 | 1,157 | 3238 |

## Fájlok (eseteként)

- `inputs/Gx.json` – **alkalmazásfüggetlen bemenet**: geometria (helyiség, falak tájolással, nyílászárók), anyagok (ρ, λ, c, μ), rétegrendek, rendszerparaméterek a WinWatt-kódokkal, kézi U-értékek (MSZ EN ISO 6946, ellenőrzéshez). Ebből építsd fel a tesztet a webes appban.
- `Gx_import.xml` – a generált WinWatt NativeExport (ezt importáltam).
- `golden_Gx.wwp` – a WinWatt-projekt a GUI-lépések után (újranyitható).
- `Gx_winwatt_export.xml` – a WinWatt saját exportja a számítás után (minden számított mezővel).
- `Gx_etan.xml` – OÉNY e-tanúsítás feltöltő XML (`UploadRequest`), benne a teljes számítási PDF base64-ben.
- `Gx_tanusitvany.pdf` – a WinWatt tanúsítvány-dokumentációja (rétegrendek, hőszükséglet, zónák, energiamérleg) – a részeredmények ebből olvashatók ki.
- `expected/Gx_expected.json` – kivonat: OÉNY-értékek (besorolás, Ep, CO₂, q, A/V, megújuló arány, követelményszintek, szerkezetlista U+felület, energiahordozók, felhasználás célonként) és WinWatt-részeredmények (panel U-k, helyiségenkénti transzmissziós/filtrációs teljesítmény, határolók, EPBD: nettó fűtési energia, Qb, QHMV, ISRG, hűtési nettó energia, rendszerenkénti WFinal).
- `golden_admin_adatok.xml` – az e-tanúsítás adminisztrációs adatai (újrabetölthető).
- `gen_golden.py`, `extract_expected.py` – a generátor és a kivonatoló (újrafuttatható).

## GUI-lépések az import után (a WinWatt az importnál visszaállítja ezeket, ezért kézzel kellett)

1. Épület megnyitása → a WinWatt ekkor számolja újra a helyiségeket (az import után a lista még régi értékeket mutat!).
2. Eszközök → Szerkezetek cseréje, a fűtetlen tér felé néző határolókon (Télre és Nyárra bekapcsolva):
   - G2 `R5./ Padlásfödém` (padlásfödém): t_túl,tél −2 °C, Bu tél 0,9 / nyár 0.
   - G3 `R6./ Pincefödém` (pincefödém): t_túl,tél 8 °C, Bu tél 0,5 / nyár 1,5.
   - G3 `R7./ Fal fűtetlen garázs felé` (belső fal, fűtetlen tér felé): t_túl,tél 5 °C, Bu tél 0,9 / nyár 0,9.
   (Bu az ÉKM-tábla szerint; a garázsra a tábla egy értéket ad, ezt nyárra is beírtam.)
3. Zónák → „Mindet újraszámol”.
4. Tanúsítvány → csak a fűtött teret határolók → Ellenőrzések → e-tanúsítás XML (cél: új épület építése, lakóépület, nem védett, építés éve 2025; alternatív energia: G2 napelem + hőszivattyú, G3 hőszivattyú).

## Fontos tudnivalók az összevetéshez

- A rétegadatok (λ, ρ, c, μ) **tesztbemenetek**, nem termékadatok – csak a számítás ellenőrzésére valók.
- Talajon fekvő padló (G1, G2): a WinWatt MSZ EN ISO 13370 szerint számol (talaj λ 2,0, alapszélesség 0,47 m, fal-padló hőhíd **0,10 W/mK alapértelmezés**), a rétegrendi „átlagos” U 0,168, az egyenértékű U 0,151 / 0,152. A `panel_U_hand` a padlóra csak a rétegek U-ját adja (talaj nélkül) – ezt ne vesd össze közvetlenül a 0,151-gyel.
- Ablakok: a WinWatt méretenként számol U-t az Ug/Uf/keretszélesség alapján (0,9×1,2: 0,75; 1,2×1,2: 0,73; 1,5×1,5: 0,71; 2,4×2,2: 0,67), Ψg = 0.
- Az ellenőrző lista minden esetben jelezte: „a szerkezetre vélhetőleg kellene az egyszerűsített számítás szerinti hőhíd-növekményt alkalmazni” → **a golden esetekben nincs hőhíd-korrekció** (dUtb = 0). Az appnak is így kell futnia az összevetéshez, vagy külön esetként kezeld.
- A WinWatt helyiségenkénti fűtési teljesítménye (`TransPower`, `FiltPower`, −15 °C, n = 0,5) a WinWatt saját hőszükséglet-modellje; **nem feltétlenül MSZ EN 12831-1** szerinti. Csak tájékoztató összevetésre.
- G3-ban a filtrációs hőszükséglet n = 0,5 1/h-val számolt (a gépi szellőzés a hőszükségletben nem jelenik meg), az energetikában viszont a légtechnikai rendszer igen.
- G2 közbenső födém (Roof5) belső szerkezet, nincs az energetikai burokban.
- A lakóépületek hűtésének nettó energiája kiszámolódik, de a WFinal 0 (a WinWatt lakóépületnél így kezeli) – G3-ban ezt figyeld.

## Tűrések (javaslat)

- Geometria (A, V, A/V): ±0,5 %.
- U-értékek: ±0,002 W/m²K (3 tizedes kerekítés); talajon fekvő padló ±3 % (ISO 13370 közelítések).
- q, nettó fűtési energia, Ep, CO₂: ±3 %; ennél nagyobb eltérésnél a szabványos levezetés dönt – dokumentáld, melyik oldal tér el és miért.
- Besorolás: egyezzen, kivéve ha a ±3 %-os sávban kategóriahatárra esik.
