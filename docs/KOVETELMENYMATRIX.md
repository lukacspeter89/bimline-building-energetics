# Követelménymátrix

**Állapot:** 0. fázis, tervezet – **Péter jóváhagyására vár.** A jóváhagyásig kód nem készül.
**Lekérés / összeállítás dátuma:** 2026-10-29.

Ez a dokumentum a számítási mag és a tesztek gerince. Minden sor egy számítási lépés, választási szabály, alapérték
vagy ellenőrzés, a pontos jogszabályhellyel vagy a számítási módszer fejezetével, egyenlet- vagy táblázatszámával és
oldalszámával. A forrásokat a `FORRASOK.md` sorolja fel. A módszer saját hibái, kétértelműségei és hiányai a
`NYITOTT_KERDESEK.md`-ben vannak, és ott sorszámot kaptak. A WinWatt eltéréseit az `ELTERESEK_WINWATT.md` írja le.

## Normatív alap és hierarchia

1. **9/2023. (V. 25.) ÉKM rendelet** (hatályos: 2023.11.02.) – a követelmények, a referenciaépület és a súlyozó
   tényezők forrása (R. fejezet).
2. **A 9/2023. ÉKM 7. § (1) a) szerinti számítási módszer** (1. és 2. Függelék, kormany.hu) – a számítás menete
   (M1–M6. fejezet). A 7. § (1) b) szerint ezzel egyenértékű, a 6. melléklet szerinti módszer is alkalmazható; a
   program a közzétett módszert valósítja meg, és ahol a módszer szabványra utal, azt külön jelöli.
3. **176/2008. (VI. 30.) Korm. rendelet** (hatályos: 2026.01.06.) – a tanúsítás, a besorolás, valamint a szerkezet-
   és a rendszerminősítés (R.6).
4. A rendelet vagy a módszer által hivatkozott **szabványok** – csak ott, ahol a módszer kifejezetten oda utal
   (a „Forrás” oszlopban jelölve). Fizetős szöveg, fejből nem rekonstruáljuk.

## Az oszlopok jelentése

| Oszlop | Tartalom |
|--------|----------|
| ID | Egyedi azonosító. A unit tesztek erre hivatkoznak: minden sorhoz legalább egy teszt tartozik, a teszt neve tartalmazza az ID-t és a forrást. |
| Számítási lépés / ellenőrzés | Mit kell kiszámolni vagy eldönteni. |
| Bemenetek | Jelölés és mértékegység, a módszer jelölésrendszerében (lásd `modszer/jelolesek.json`). |
| Képlet vagy konstans | Lineáris alakban, a módszer jelöléseivel. A törteket, indexeket és szummákat a PDF-oldal képén ellenőriztük. |
| Forrás | `9/2023 ÉKM <hely>`, `176/2008 <hely>`, `1. függ. <fejezet>, (<egyenlet>), <oldal>`, `2. függ. <táblázat>, <oldal>`. |
| Normatív adat | `data/normativ/<mappa>/<fájl>.json#<táblázat-id>`. A `*` végződés táblázatcsaládot jelöl (pl. `#arnyek_*`). A számítási kód normatív számot csak innen olvashat. |
| Teszt-ötlet | Kézi kontrolleset; ahol a forrás mintapéldát ad, azt nevezi meg. |

## ID-előtagok

| Előtag | Terület | Fejezet |
|--------|---------|---------|
| KOV | Alkalmazási kör, követelményszint, elemi és összesített követelmények | R.1–R.4 |
| REF | Referenciaépület | R.5 |
| TAN | Tanúsítás, besorolás, minősítés, javaslatok | R.6 |
| JEL, MOD | Jelölések; módszertani áttekintés, egyszerűsített és részletes módszer választása | M1 |
| HT | Hőátbocsátási tényező, nyílászárók, talajjal érintkező szerkezetek | M1 |
| ZON | Termikus zónázás | M1 |
| TR, SZ, NY, NET, QM, HSZ | Transzmisszió, szellőzés, nyereségek, nettó igény, fajlagos hőveszteség-tényező, hőszükséglet-becslés | M2 |
| RA, FUT | Rendszer-alapelvek, fűtés | M3 |
| HMV, LT | Használati melegvíz, légtechnika | M4 |
| HUT, VIL, MEG, IND | Hűtés, világítás, megújulók és nyereségáramok, komplex indikátorok | M5 |
| KLI, PRF, ENH, NYZ | Éghajlati adatok, profilok, energiahordozók, nyílászárók és árnyékolók | M6 |

## Adatállomány

- `data/normativ/rendelet/` – a 9/2023. ÉKM és a 176/2008. Korm. rendelet táblázatai (kézi átvitel, a rendelet szövegéből).
- `data/normativ/modszer/` – az 1. és 2. Függelék összes táblázata és a szövegben megadott konstansok (`alapertekek_*`).
  Minden táblázatot cellánként, a PDF-oldal képén ellenőriztünk. A duplikált táblázatokat (panelos falak U-értékei, súlyozó tényezők)
  két független átvitelből összevetettük, és értékre egyeztek.
- Minden táblázat tartalmazza: `forras` (dokumentum, hely, oldal, URL, lekérés), `hatalyos_tol`, `megjegyzes` (lábjegyzetek szó szerint, anomáliák).

## Terjedelem és számok

A mátrix **808 sort** tartalmaz (R: 88, M1: 192, M2: 129, M3: 99, M4: 111, M5: 75, M6: 114 sor – néhány sor szabályt vagy anomália-jelzést rögzít).
A sorok egy része az egyszerűsített és a részletes módszer közötti választást írja le. A program első változata az
egyszerűsített módszert valósítja meg; a részletes módszert (szabvány szerinti számítás, órai szimuláció) csak ott, ahol
a módszer kötelezővé teszi, vagy Péter kéri (`NYITOTT_KERDESEK.md`).

---

## R. Rendeleti szint – alkalmazási kör, követelmények, referenciaépület, tanúsítás

### R.1 Alkalmazási kör és követelményszint kiválasztása (KOV)

| ID | Számítási lépés / ellenőrzés | Bemenetek | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|----|------------------------------|-----------|----------------------|--------|---------------|-------------|
| KOV-001 | Hatály: műemlék / helyi védett épület kizárása, ha a követelmények betartása a védett értéket megváltoztatná | védettség, felhasználói nyilatkozat | szabály – a program kérdez és naplóz | 9/2023 ÉKM 1. § (2), 3. § (7) | – | Műemlék + „értéket sért” → követelmények nem kötelezők, figyelmeztetés |
| KOV-002 | Tanúsítás hatálya alóli kivételek (< 50 m² önálló épület, < 4 hó/év használat, ≤ 2 év felvonulási épület, hitéleti, alacsony energiaigényű mezőgazdasági/ipari, technológiai hőterhelés > 20 W/m² vagy > 20-szoros légcsere) | A_N, használat, rendeltetés | szabály | 176/2008 Korm. 1. § (2) | `rendelet/176_2008_Korm_besorolas.json#tanusitas_altalanos` | 45 m² önálló hétvégi ház → „tanúsítás nem kötelező” jelzés |
| KOV-003 | Az alkalmazandó rendelet kiválasztása a bejelentés / kérelem dátuma alapján | dátum | > 2023-10-31 → 9/2023 ÉKM; ≤ 2023-10-31 → 7/2006 TNM 2023-10-31-i állapota (a program ezt nem számolja, csak figyelmeztet) | 9/2023 ÉKM 9. §, 10. § (1)–(2) | – | 2023-09-15-i engedély → „TNM szerinti projekt” figyelmeztetés |
| KOV-004 | TNM-támogatási átmeneti eset (10. § (3)): a tanúsítást a 9/2023 szerint mindig el kell végezni | támogatási jogviszony | szabály | 9/2023 ÉKM 10. § (3) | – | – |
| KOV-005 | Követelményszint: új épület → 1. és 2. melléklet (U, nyári hővédelem, rendszer-előírások, KNZ qm, Enren, ECO2) | eset = új | szabály | 9/2023 ÉKM 3. § (2) | `rendelet/9_2023_EKM_1_melleklet.json`, `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_*` | – |
| KOV-006 | Követelményszint: bővítés / energiamegtakarítási célú felújítás → az érintett szerkezetekre az 1. melléklet 1–2. pontja, az érintett rendszerekre a 3. pontja | eset, érintett elemek | szabály | 9/2023 ÉKM 3. § (3)–(4) | `rendelet/9_2023_EKM_1_melleklet.json` | – |
| KOV-007 | Jelentős felújítás (≥ 25% határolófelület) vagy 100%-nál nagyobb bővítés → 3. melléklet is | A_felújított / A_határoló, A_N,bővítmény / A_N,meglévő | `A_felúj/A_hat ≥ 0,25` vagy `A_N,bőv/A_N > 1,0` | 9/2023 ÉKM 2. § 26., 3. § (5); 176/2008 2. § j) | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#jelentos_felujitas_*` | 24% → nem jelentős; 25% → jelentős |
| KOV-008 | Nem jelentős felújítás: földszintes épület pince- vagy padlásfödémének utólagos hőszigetelése, ha más korszerűsítés nincs | szintszám, érintett elemek | szabály | 9/2023 ÉKM 3. § (6) | – | – |
| KOV-009 | Fűtés nélküli vagy kizárólag geotermikus / kapcsolt hőellátású mezőgazdasági, logisztikai, ipari, műhely épületre U- és qm-követelmény nem kell; huzamos tartózkodás nélkülire nyári hővédelem nem kell | rendeltetés, fűtés | szabály | 9/2023 ÉKM 3. § (8) | – | – |
| KOV-010 | Vegyes rendeltetés: qm és szerkezeti követelmény az épület egészére; Enren és ECO2 követelmény funkciónként, A_N-nel súlyozva | A_N,funkció | `E_max = Σ(E_max,k · A_N,k) / Σ A_N,k` | 9/2023 ÉKM 6. § (2) | – | 80% lakó + 20% iroda → súlyozott követelmény |
| KOV-011 | Domináns funkció: ha egy funkció A_N-je > 90%, az egész épületre azt kell figyelembe venni | A_N,funkció / A_N | `> 0,9` | 9/2023 ÉKM 6. § (3) | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#vegyes_rendeltetes` | 91% lakó → teljes épület lakó |
| KOV-012 | A számítás az épület egészére; zónák / helyiségek eredményeinek összegzésével is igazolható | zónák | szabály | 9/2023 ÉKM 7. § (2) | – | – |
| KOV-013 | Számítási módszer: a minisztériumi honlapon közzétett módszer (a program ezt követi) vagy a 6. melléklet szerinti egyenértékű módszer; részletes vagy egyszerűsített | – | szabály | 9/2023 ÉKM 7. § (1), 6. melléklet | – | – |
| KOV-014 | Új módszerváltozat: a Hivatalos Értesítőben közölt közleménytől számított 90 nap után kell alkalmazni; a program a módszer verzióját projektenként rögzíti | közlés dátuma | `alkalmazás ≥ közlés + 90 nap` | 9/2023 ÉKM 7. § (4)–(5) | – | – |
| KOV-015 | Súlyozó tényezők a fűtőértéken számított végsőenergiára | energiahordozó | 7. melléklet táblázata | 9/2023 ÉKM 7. § (3), 7. melléklet 2. pont | `rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok` | villamos: fnren 2,3; földgáz 1,1 |
| KOV-016 | Szilárd bio tüzelőanyag kedvezményes tényezője (fnren 0,2) csak a 3.1–3.5. pont szerinti, igazolt esetekben, egyébként 0,6 | hőtermelő típusa, teljesítmény, megfelelőség, beépítés dátuma | szabály | 9/2023 ÉKM 7. melléklet 3. pont | `rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#szilard_bio_kedvezmenyes_feltetelek` | igazolás nélküli pelletkazán → 0,6 |
| KOV-017 | Távhő/távhűtés súlyozó tényezője: a szolgáltató által közölt, a Lechner által közzétett érték; ha nincs, 1,38 / 0 / 1,38 / 374 g/kWh | szolgáltató | szabály | 9/2023 ÉKM 8. § (1), 7. melléklet (***) | `rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok` 10–11. sor | ismeretlen szolgáltató → 1,38 |
| KOV-018 | Atomerőművi önfogyasztás villamos energiájára minden tényező 0 | – | szabály | 9/2023 ÉKM 7. melléklet (**) | – | – |

### R.2 Elemi követelmények (KOV)

| ID | Számítási lépés / ellenőrzés | Bemenetek | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|----|------------------------------|-----------|----------------------|--------|---------------|-------------|
| KOV-020 | Szerkezetenkénti U-követelmény: az átlagos (épületelemen belüli hőhidakkal korrigált) U ≤ U_max | U_átl, szerkezettípus | `U ≤ U_max(típus)` | 9/2023 ÉKM 1. melléklet 1.1., (*) | `rendelet/9_2023_EKM_1_melleklet.json#u_kovetelmeny` | homlokzati fal 0,25 → nem felel meg (0,24) |
| KOV-021 | Nyílászáró U-ja tartalmazza a keret, az üvegezés és a távtartó hatását; a társított árnyékoló többlet-ellenállása az elemi követelmény ellenőrzésekor nem vehető figyelembe | Uw (árnyékoló nélkül) | szabály | 9/2023 ÉKM 1. melléklet 1.1. (**) | – | redőnnyel számolt U nem fogadható el követelményigazolásra |
| KOV-022 | Az ablak-sorok (10–11., 14–15.) csak > 0,5 m² felületre vonatkoznak | A_nyílászáró | `A > 0,5 m²` | 9/2023 ÉKM 1. melléklet 1.1. 10., 11., 14., 15. sor | `rendelet/9_2023_EKM_1_melleklet.json#u_kovetelmeny` (`min_felulet_m2`) | 0,4 m²-es ablak → nincs elemi követelmény |
| KOV-023 | Talajjal érintkező fal és talajon fekvő padló: követelmény csak új épületnél; a talaj hatását is tartalmazó egyenértékű U | eset, U_egyenértékű | szabály | 9/2023 ÉKM 1. melléklet 1.1. 22–23. sor, (***) | `rendelet/9_2023_EKM_1_melleklet.json#u_kovetelmeny` | – |
| KOV-024 | Perem hőszigetelés minimális kiterjedése és ellenállása terepszint közeli / feletti padlónál | perem: vízszintes / függőleges méret, R | vízsz. ≥ 2,5 m vagy függ. ≥ 1,5 m, R ≥ 2,5; ha a padló R ≥ 2,5: függ. ≥ 0,5 m, R ≥ 2,5 | 9/2023 ÉKM 1. melléklet 1.1. (***) | `rendelet/9_2023_EKM_1_melleklet.json#perem_hoszigeteles` | 1,0 m függőleges perem, padló R=3 → megfelel |
| KOV-025 | Energiagyűjtő fal követelménye elhagyható, ha a fűtési szezonra vetített mérlege jobb a követelménynek megfelelő homlokzati falénál | mérleg | szabály | 9/2023 ÉKM 1. melléklet 1.1. (****) | – | – |
| KOV-026 | Ajtó / kapu alapértéke, ha a terv nem ad U-t: a rendeleti követelményérték (1,4 / 1,8 / 2,0), „rendeleti követelményérték” forrásjelöléssel (Péter szabálya, nem rendeleti előírás – a program jelöli) | ajtó típusa | `U = U_max(17./18./16. sor)` | FELADAT.md „Péter szakmai szabályai”; értékek: 9/2023 ÉKM 1. melléklet 1.1. 16–18. sor | `rendelet/9_2023_EKM_1_melleklet.json#u_kovetelmeny` | garázskapu U nélkül → 1,8, forrás: „rendeleti követelményérték” |
| KOV-027 | Állagvédelmi ellenőrzés új épületnél és felújításnál (páradiffúzió) | rétegrend | szabály – módszer: 1. függ. 4. fejezet hivatkozásai | 9/2023 ÉKM 1. melléklet 1.1. (*) | – | – |
| KOV-030 | Nyári hővédelem – alkalmazási feltétel: az északtól ≥ 45°-kal eltérő tájolású vagy < 45° hajlásszögű transzparens szerkezetek összfelülete > 0,08 · A_N | A_ü,i, tájolás, hajlásszög, A_N | `Σ A_ü,i > 0,08 · A_N` | 9/2023 ÉKM 1. melléklet 2. pont | `rendelet/9_2023_EKM_1_melleklet.json#nyari_hovedelem` | A_N=150, déli ablak 13 m² → vizsgálandó |
| KOV-031 | Nyári hővédelem – követelmény | A_ü,i, g_H,i, g_árny,H,i, F_árny,i | `Σ(A_ü,i · g_H,i · g_árny,H,i · F_árny,i) / Σ A_ü ≤ 0,3` | 9/2023 ÉKM 1. melléklet 2. pont (képlet: PNG) | `rendelet/9_2023_EKM_1_melleklet.json#nyari_hovedelem` | g=0,5, redőny g_árny=0,1, F=1 → 0,05 ≤ 0,3 |
| KOV-032 | Nyári hővédelem nem kell huzamos tartózkodás nélküli mezőgazdasági/ipari/műhely épületre | rendeltetés | szabály | 9/2023 ÉKM 3. § (8) | – | – |

### R.3 Épülettechnikai rendszer-előírások (KOV, figyelmeztetésként)

| ID | Számítási lépés / ellenőrzés | Bemenetek | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|----|------------------------------|-----------|----------------------|--------|---------------|-------------|
| KOV-040 | Légcsere biztosítása: ha nem nyílászáróval, szabályozott szellőzőrendszer; elszívásos rendszernél légbevezető elemek | szellőzés módja | szabály | 9/2023 ÉKM 1. melléklet 3.1.2. | – | – |
| KOV-041 | Központi időjárásfüggő szabályozás kötelező új épületben, ha egy rendszerről ellátott terület > 100 m² | A_rendszer | `> 100 m²` | 1. melléklet 3.2.1. | `rendelet/9_2023_EKM_1_melleklet.json#rendszer_kuszobok` | 120 m², nincs időjárásfüggő → figyelmeztetés |
| KOV-042 | Helyiségenkénti szabályozás minden > 12 m² helyiségben (új rendszer) | A_helyiség | `> 12 m²` | 1. melléklet 3.2.2. | `rendelet/9_2023_EKM_1_melleklet.json#rendszer_kuszobok` | – |
| KOV-043 | Beszabályozás kötelező > 300 m² rendszer-alapterület felett | A_rszr | `> 300 m²` | 1. melléklet 3.2.5.–3.2.7. | `rendelet/9_2023_EKM_1_melleklet.json#rendszer_kuszobok` | – |
| KOV-044 | Elosztóvezetékek minimális hőszigetelése (λ = 0,036 W/mK-ra), kivételekkel; > 50 °C közepes hőmérsékletnél egy átmérő-kategóriával nagyobb | d_belső, λ, θ_közép | táblázat | 1. melléklet 3.3.1.–3.3.6. | `rendelet/9_2023_EKM_1_melleklet.json#csoszigeteles` | DN20 (d=20 mm), λ=0,040 → egyenértékű vastagság számítással |
| KOV-045 | HMV: cirkulációs szivattyú időprogram ajánlott < 300 m²; > 300 m² termosztatikus beszabályozó szelep felszállónként | A_rszr | `300 m²` | 1. melléklet 3.4.1.–3.4.2. | `rendelet/9_2023_EKM_1_melleklet.json#rendszer_kuszobok` | – |
| KOV-046 | Légtechnikai elemek megengedett nyomásvesztesége (vagy MSZ EN 16798-3 „normál”) | elemek, Δp | táblázat | 1. melléklet 3.5.1. | `rendelet/9_2023_EKM_1_melleklet.json#legtechnika_nyomasveszteseg` | – |
| KOV-047 | Felújításnál a megváltoztatott részrendszer legalább „normál”, világításnál „jó” kategória (176/2008 5. melléklet szerinti értékelés) | rendszerosztály | szabály | 1. melléklet 3.6.2. | `rendelet/176_2008_Korm_besorolas.json#rendszer_ertekelesi_osztalyok` | – |
| KOV-048 | Épületautomatizálás: egyéb rendeltetésnél > 290 kW | P_eff | `> 290 kW` | 1. melléklet 3.7.1. | `rendelet/9_2023_EKM_1_melleklet.json#rendszer_kuszobok` | – |
| KOV-049 | Elektromos töltőpont / kábelvezető szerkezet: > 10 parkolóhely új vagy jelentősen felújított épületnél; meglévő nem lakó > 20 parkolóhely 2025.01.01-től | parkolók száma, rendeltetés | szabály | 9/2023 ÉKM 4. §, 10. § (4) | – | – |
| KOV-050 | Alternatív rendszerek vizsgálata új épületnél és jelentős felújításnál (4. melléklet) – a dokumentációban kötelező fejezet | – | szabály | 9/2023 ÉKM 5. §, 4. melléklet | – | – |

### R.4 Összesített követelmények (KOV)

| ID | Számítási lépés / ellenőrzés | Bemenetek | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|----|------------------------------|-----------|----------------------|--------|---------------|-------------|
| KOV-060 | Fajlagos hőveszteség-tényező követelmény, közel nulla (új épület) | A/V | `A/V ≤ 0,3: 0,14`; `0,3…1,3: 0,071 + 0,23·A/V`; `≥ 1,3: 0,37` W/m³K (a táblázat 2. sora „≤ 1,0”-t ír – K-010) | 9/2023 ÉKM 2. melléklet 1.2.–1.3. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_qm_max` | A/V=0,8 → 0,255; A/V=1,15 → 0,3355 (a grafikon szerint) |
| KOV-061 | Összesített energetikai jellemző követelmény, közel nulla, lakó/szállás (világítás nélkül) | – | `E_nren,max = 0,8 · 95 = 76 kWh/m²év` | 2. melléklet 2.1.; 5. melléklet 1.2. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_enren_co2_max`, `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referencia_lako_rogzitett` | – |
| KOV-062 | CO2 követelmény, közel nulla, lakó/szállás | – | `E_CO2,max = 0,8 · 25 = 20 kg/m²év` | 2. melléklet 3.1. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_enren_co2_max` | – |
| KOV-063 | Közel nulla, egyéb rendeltetés és dinamikus szimuláció: 0,8 · a tárgyi épület alapján számított referenciaérték (Enren és ECO2) | E_REF | `0,8 · E_REF` | 2. melléklet 2.2., 2.3., 3.2., 3.3. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_enren_co2_max` | – |
| KOV-064 | Fajlagos hőveszteség-tényező követelmény, jelentős felújítás | A/V | `≤ 0,3: 0,18`; `0,3…1,3: 0,078 + 0,34·A/V`; `≥ 1,3: 0,52` | 3. melléklet 1.2. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#jelentos_felujitas_qm_max` | A/V=0,8 → 0,35 |
| KOV-065 | Összesített energetikai jellemző követelmény, jelentős felújítás, lakó/szállás | A/V | `≤ 0,3: 110`; `0,3…1,3: 40·A/V + 98`; `≥ 1,3: 150` kWh/m²év | 3. melléklet 2.2. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#jelentos_felujitas_enren_max` | A/V=0,8 → 130 |
| KOV-066 | Jelentős felújítás, egyéb rendeltetés: E_nren,max = E_nren,REF | E_REF | `1,0 · E_REF` | 3. melléklet 2.4. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#jelentos_felujitas_enren_max` | – |
| KOV-067 | Költségoptimalizált szint = a 3. melléklet követelményei | – | szabály | 3. melléklet 3. pont | – | – |
| KOV-068 | Lakó/szállás épület Enren- és CO2-követelményében a világítás nem szerepel; egyéb rendeltetésnél igen | rendeltetés | szabály | 2. melléklet 2.1., 3.1.; 3. melléklet 2.2.; 5. melléklet 2.8.1. | – | – |

### R.5 Referenciaépület (REF)

| ID | Számítási lépés / ellenőrzés | Bemenetek | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|----|------------------------------|-----------|----------------------|--------|---------------|-------------|
| REF-001 | Lakó/szállás, nem dinamikus: rögzített referencia-indikátorok | – | `E_nren,REF = 95 kWh/m²év`, `E_CO2,REF = 25 kg/m²év` | 9/2023 ÉKM 5. melléklet 1.2. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referencia_lako_rogzitett` | – |
| REF-002 | Egyéb rendeltetés (és lakó dinamikus szimulációnál): a tárgyi épületen alapuló fiktív referenciaépület számítása; tanúsításnál ez a besorolás alapja | tárgyi modell | teljes számítás a REF-003…REF-030 szabályokkal | 5. melléklet 1.3. | – | – |
| REF-003 | Felhasználási célonként meghatározandó a referencia nem megújuló primerenergia-igénye és CO2-kibocsátása (a rendszerminősítéshez lakónál is) | – | szabály | 5. melléklet 1.4.; 176/2008 2. melléklet 1.13., 1.15. | – | – |
| REF-004 | Azonos módszer a tárgyi és a referenciaépületen (részletes lépésnél részletes) | – | szabály | 5. melléklet 1.6. | – | – |
| REF-005 | Geometria, tájolás, hőtároló képesség, árnyékoló környezet, zónahatárok, kondicionálási igények, fogyasztói profil, meteorológia: azonos a tárgyi épülettel; fel nem sorolt részlet: azonos | tárgyi modell | másolás | 5. melléklet 1.7.1.–1.7.3., 1.7.5.–1.7.7. | – | – |
| REF-006 | Üvegezési arány tájolásonként azonos, de legfeljebb 50% (60°-nál kisebb hajlásszögű felületen 30%) | üvegezési arány | `min(arány, 0,5)` ill. `min(arány, 0,3)` | 5. melléklet 1.7.4. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referenciaepulet_parameterek` | 70%-os déli homlokzat → 50% |
| REF-007 | Határoló szerkezetek U-ja = az elemi követelmények (épületelemen belüli hőhidakkal) | szerkezettípus | `U = U_max` | 5. melléklet 1.8.1. | `rendelet/9_2023_EKM_1_melleklet.json#u_kovetelmeny` | – |
| REF-008 | Csatlakozási hőhidak egyszerűsített módszerrel; külső falon külső oldali, pincefödémen alsó oldali hőszigetelést feltételezve | geometria | 1. függ. 6.1.2 egyszerűsített | 5. melléklet 1.8.2. | `modszer/netto_energiaigeny.json#tabla_6_1`, `modszer/netto_energiaigeny.json#tabla_6_2` | – |
| REF-009 | Talajon fekvő padló egyenértékű U = 0,3 W/m²K | – | `0,3` | 5. melléklet 1.8.3. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referenciaepulet_parameterek` | – |
| REF-010 | Tömítetlenségi többletlégcsere jó légzárású nyílászárókkal; nyári természetes szellőzés azonos | – | szabály | 5. melléklet 1.8.4. | `modszer/profilok.json` (2.4. táblázat) | – |
| REF-011 | g = 0,55 merőleges beesésnél (fűtés); hűtésnél a nyári hővédelmi követelmény betartandó | – | `g⊥ = 0,55` | 5. melléklet 1.8.5. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referenciaepulet_parameterek` | – |
| REF-012 | Transzparens szerkezetek benapozottak (a környezet árnyékolása kivételével); nincs passzív hűtés | – | szabály | 5. melléklet 1.8.6.–1.8.7. | – | – |
| REF-013 | Szakaszos üzem fűtésnél: programozható fűtés feltételezése; hűtésnél azonos | – | szabály | 5. melléklet 1.8.8. | `modszer/profilok.json` (2.5. táblázat) | – |
| REF-014 | Fűtés: földgáz, központi kondenzációs kazán, a hőtermelő helye azonos, tároló nincs; vezetéknyomvonal azonos (vagy fűtött térben), 55/45 °C; központi előremenő- és helyiségenkénti szabályozás, külsőfali radiátor, termosztatikus szelep, kétcsöves statikus + csoportos dinamikus beszabályozás; szivattyú EEI 0,23 | – | szabály | 5. melléklet 2.1. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referenciaepulet_parameterek` | – |
| REF-015 | HMV: földgáz, központi kondenzációs kazán, fűtött térben indirekt tároló, nyomvonal azonos (vagy fűtött térben), cirkulációs szivattyú EEI 0,23 | – | szabály | 5. melléklet 2.2. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referenciaepulet_parameterek` | – |
| REF-016 | Szellőzés: lakó/szállás természetes; egyéb rendeltetésnél rövid üzemű helyi elszívók helyiségeiben természetes | – | szabály | 5. melléklet 2.3.–2.4. | – | – |
| REF-017 | Ha van szellőzőrendszer: nincs léghevítő / előfűtés / talajkollektor; térfogatáram, ellenállás, üzemidő és segédenergia azonos; 50%-os hővisszanyerő csak fűtési idényben; légcsatorna-szigetelés 20 mm, nyomvonal azonos | – | szabály | 5. melléklet 2.5. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referenciaepulet_parameterek` | – |
| REF-018 | Gépi hűtés: lakó/szállás nincs; egyéb rendeltetésnél a tárgyi épület hűtött zónáiban, 6/12 °C fan coil, SEER a 2.7.3. táblázat szerint, szabályozási veszteség „hűtött víz 6/12 °C”, segédenergia azonos | P_hűtőgép | táblázat | 5. melléklet 2.6.–2.7. | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#referencia_hutogep_seer` | levegő–víz 120 kW → SEER 3,8 |
| REF-019 | Világítás: lakó/szállás nem számítandó; egyéb: üvegburás, parabolatükrös, nem dimmelhető LED, kézi kapcsolás | – | szabály | 5. melléklet 2.8. | `modszer/vilagitas.json` | – |

### R.6 Tanúsítás (TAN)

| ID | Számítási lépés / ellenőrzés | Bemenetek | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|----|------------------------------|-----------|----------------------|--------|---------------|-------------|
| TAN-001 | Tanúsítási kötelezettség esetei: új épület, ellenérték fejében történő átruházás, bérbeadás, > 500 m² hatósági rendeltetésű állami közhasználatú épület | ok | szabály (OÉNY `CertIssueReason`) | 176/2008 1. § (3) | – | – |
| TAN-002 | A tanúsítványt az épület egészére kell kiállítani; önálló rendeltetési egység átruházásakor/bérbeadásakor az egységre | tanúsítási egység | szabály | 176/2008 4. § (1)–(2) | – | – |
| TAN-003 | Energetikai minőség aránya: E_nren,fajl / az új épületre megengedett követelményérték (önálló rendeltetési egységnél, egyéb rendeltetésnél: az egységre meghatározott új épületi követelmény) | E_nren, E_nren,max(új) | `% = 100 · E_nren / E_nren,max,új` | 176/2008 3. melléklet 1.1. | – | 58,68 / 76 → 77,2% |
| TAN-004 | CO2 aránya ugyanígy | E_CO2, E_CO2,max(új) | `% = 100 · E_CO2 / E_CO2,max,új` | 176/2008 3. melléklet 1.2. | – | 12,96 / 20 → 64,8% |
| TAN-005 | Besorolás A+++2023 … I2023 a két skálán | % | sávhatárok | 176/2008 3. melléklet 2. pont | `rendelet/176_2008_Korm_besorolas.json#energetikai_besorolas` | 77,2% → A+2023; 100,0% → A2023; 100,1% → B2023; 0% → A+++2023 |
| TAN-006 | Rendeltetésszerű használatra műszakilag alkalmatlan épület: mindkét besorolás „I”, számszerű eredmények kitöltetlenek | állapot | szabály | 176/2008 3. melléklet 3. pont | – | – |
| TAN-007 | Mértékadó határoló szerkezetek kiválasztása (felsorolt típusok legnagyobb összfelületű elemei + a lehűlő felület 10%-át meghaladók) | szerkezetek, A | `A_szerk / A_lehűlő > 0,1` | 176/2008 4. § (4) | `rendelet/176_2008_Korm_besorolas.json#tanusitas_altalanos` | – |
| TAN-008 | Szerkezetminősítés (rossz … kiváló) az átlagos U alapján | U, típus | sávhatárok | 176/2008 4. melléklet | `rendelet/176_2008_Korm_besorolas.json#szerkezet_ertekelesi_osztalyok` | homlokzati fal 0,20 → jó; 0,16 → kiváló |
| TAN-009 | Rendszerminősítés felhasználási célonként (fűtés, fűtés+szellőzés, HMV, hűtés, világítás – lakónál világítás nélkül) a referenciaépülethez viszonyítva | E_x,nren, Q_net, REF-értékek | lásd mutatók | 176/2008 5. melléklet | `rendelet/176_2008_Korm_besorolas.json#rendszer_ertekelesi_osztalyok` | fűtés: (E/Q)/(E_REF/Q_REF) = 0,65 → kiváló |
| TAN-010 | Korszerűsítési javaslat: a jelentős felújítási szintre és a közel nulla szintre; ha a jelentős felújítási szint teljesül, csak a KNZ-re; ha az is, elhagyható | teljesülések | szabály | 176/2008 6. § (4) | – | – |
| TAN-011 | Javaslat bontása: „jó” szint (4. és 5. melléklet D oszlop) és „kiváló” szint (E oszlop); elérhető besorolás is | – | szabály | 176/2008 7. § (1), (1a) | `rendelet/176_2008_Korm_besorolas.json#szerkezet_ertekelesi_osztalyok`, `rendelet/176_2008_Korm_besorolas.json#rendszer_ertekelesi_osztalyok` | – |
| TAN-012 | Kötelező figyelmeztető szövegek a javaslatban (előzetes ajánlás, védettség, MMK tanácsadás, e-epites.hu) | – | szabály | 176/2008 7. § (1b), (5), (6) | – | – |
| TAN-013 | Fotódokumentáció: homlokzatok (egy az összefoglaló lapra), jellemző hőleadó és szabályozása, jellemző ablak, hőtermelő/tároló (távfűtés kivételével, egész épületnél), megújuló rendszer | fotók kategóriával | szabály (OÉNY `Photos/Category`) | 176/2008 6. § (2a) | – | hiányzó hőleadó-fotó → „Hiányzik még” |
| TAN-014 | Összefoglaló lap kötelező tartalma (adatok, fotó, kategóriák, követelmények, tanúsító, dátum, azonosító, QR) | – | szabály | 176/2008 3. § (1b)–(1c), 1. melléklet | `docs/forrasok/jogszabaly/176_2008_Korm_1_melleklet_*.pdf` | – |
| TAN-015 | Alátámasztó munkarész tartalma (1.1–1.16. pont: AN, V, A, szerkezetek, rétegrendek, transzparens adatok, zónaadatok, rendszerparaméterek, referenciaépület, fogyasztások) | teljes modell | szabály | 176/2008 2. melléklet | – | – |
| TAN-016 | Helyszíni szemle időpontja a tanúsítványon, ha volt | dátum | szabály | 176/2008 5. § (4) | – | – |
| TAN-017 | Új épület tanúsítása: tervek + FMV nyilatkozat alapján | – | szabály | 176/2008 5. § (2) | – | – |
| TAN-018 | Tanúsítvány hatálya 5 év; követelmény- vagy módszertanváltozás után 60 napig használható | – | `5 év`, `60 nap` | 176/2008 8. § | `rendelet/176_2008_Korm_besorolas.json#tanusitas_altalanos` | – |
| TAN-019 | Ha nem a minisztériumi módszert használják: az alkalmazott szabványok listája kötelező | módszer | szabály | 176/2008 3. § (1b) f) | – | – |
| TAN-020 | OÉNY e-tanúsítás feltöltés: azonosító kód, a validációs szabályok szerinti XML | – | OÉNY dokumentáció | 176/2008 9/A. § (1); `docs/forrasok/entan/` | – | – |


## M1. Jelölések, módszertani áttekintés, határoló szerkezetek, zónázás (1. Függelék 2–5. fejezet)

### 1. Jelölések és mértékegységek (2. fejezet, 5–19. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| JEL-001 | A teljes jelölésjegyzék (318 sor: jelölés, megnevezés, mértékegység) gépi átvétele szótárként; a program minden bemeneti/kimeneti mezőjének jelölése és mértékegysége ebből származzon | – | – | 1. függ. 2. fejezet, 5–19. o. | `modszer/jelolesek.json#jelolesek` | Sorszám = 318; minden jelölés nem üres; R_si/R_se egysége m2K/W |
| JEL-002 | Mértékegység-konvenció: hőátbocsátási tényezők W/m2K, ellenállások m2K/W, vonalmenti ψ W/mK, pontszerű χ W/K, λ W/mK | U, R, ψ, χ, λ | – | 1. függ. 2. fejezet, 10–11., 18. o. | `modszer/jelolesek.json#jelolesek` | Egységvalidátor: U mező nem fogad m2K/W egységet |
| JEL-003 | Kettős jelentésű jelölések kezelése (azonos szimbólum, eltérő mennyiség): A_k (szellőzési móddal ellátott alapterület / keret felülete), U_p (átlátszatlan panel / padlószerkezet U-ja), U_T,pf (két megfogalmazás) – a programban egyedi belső azonosítót kell adni | A_k, U_p, U_T,pf | – | 1. függ. 5., 11–12. o. | `modszer/jelolesek.json#jelolesek` | Belső kulcsok ütközésmentessége |
| JEL-004 | Az épületfelület A és a térfogat V belméretek alapján számolandó (a jelölésjegyzék definíciója) | A [m2], V [m3] | – | 1. függ. 5., 12. o. | `modszer/jelolesek.json#jelolesek` | – |
| JEL-005 | Az üvegezés felülete A_ü az üvegezés mérete alapján számolandó | A_ü [m2] | – | 1. függ. 5. o. | `modszer/jelolesek.json#jelolesek` | – |
| JEL-006 | Súlyozott energetikai teljesítmény kettős egysége (kWh/év és CO2/év) – a forrás nem rögzíti, melyik mikor érvényes (lásd 14. fejezet, más feladat) | E_súlyozott, E_exp,súlyozott | – | 1. függ. 5–6. o. | `modszer/jelolesek.json#jelolesek` | – |

### 2. Módszertani áttekintés (3. fejezet, 20–22. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| MOD-001 | Követelményellenőrzés 1. lépés: az épület rendeltetésének, alapadatainak meghatározása | rendeltetés | – | 1. függ. 3.1, 1. pont, 20. o. | – | Kötelező mező hiányában a számítás nem indul |
| MOD-002 | 2. lépés: geometriai adatok, beleértve a csatlakozási élhosszakat | felületek, l [m] | – | 1. függ. 3.1, 2. pont, 20. o. | – | – |
| MOD-003 | 3. lépés: elemi követelményekhez kapcsolódó értékek (átlagos és egyenértékű hőátbocsátási tényezők) meghatározása | U, U_T,… | lásd HT-sorok | 1. függ. 3.1, 3. pont, 20. o. | – | – |
| MOD-004 | 4. lépés: elemi követelmények ellenőrzése (épületszerkezetek, nyári túlmelegedés, épülettechnikai rendszerelemek) | – | követelményértékek a rendeletben | 1. függ. 3.1, 4. pont, 20. o. | – | – |
| MOD-005 | 5. lépés: felület/térfogat arány (A/V) számítása | A [m2], V [m3] | A/V | 1. függ. 3.1, 5. pont, 20. o. | – | A=500, V=1000 → 0,5 m-1 |
| MOD-006 | A-ba beszámítandó: a kondicionált tereket határoló összes szerkezet felülete, a teljes talajjal, szomszédos épülettel, energetikailag nem védett nem kondicionált helyiségekkel érintkező felületekkel együtt, belméretek alapján | A [m2] | – | 1. függ. 3.1, 5. pont, 20. o. | – | Szomszéd épülettel közös fal beszámít A-ba |
| MOD-007 | A-ba NEM számítható: azonos épületen belüli külön fűtött rendeltetési egységek közötti szerkezetek, önálló rendeltetési egységen belüli felületek | A [m2] | – | 1. függ. 3.1, 5. pont, 20. o. | – | Lakások közötti födém kizárva A-ból |
| MOD-008 | V = fűtött épülettérfogat légtömör szerkezetekkel határolt hányada, belméretek szerint, az 1,9 m belmagasság alatti térrészekkel együtt | V [m3] | – | 1. függ. 3.1, 5. pont, 20. o. | – | Tetőtéri 1,5 m-es térrész beszámít |
| MOD-009 | V-be nem számolandó: tartózkodástól légtömör szerkezettel elzárt búvóterek (pl. légtömör álpadló alatti, álmennyezet feletti tér) | V [m3] | – | 1. függ. 3.1, 5. pont, 20. o. | – | – |
| MOD-010 | 6. lépés: nettó fűtési és hűtési hőenergia-igény | – | 6. fejezet (más feladat) | 1. függ. 3.1, 6. pont, 20. o. | – | – |
| MOD-011 | 7. lépés: fűtési rendszer energiafelhasználása (7.1 nettó igény energiahordozónként, 7.2 veszteségek, 7.3 hőenergia-felhasználás energiahordozónként, 7.4 villamos segédenergia) | – | 8. fejezet | 1. függ. 3.1, 7. pont, 20. o. | – | – |
| MOD-012 | 8. lépés: HMV rendszer (8.1–8.4; hőenergia égéshő alapon) | – | 9. fejezet | 1. függ. 3.1, 8. pont, 20. o. | – | – |
| MOD-013 | 9. lépés: szellőző rendszer (9.1 léghevítéssel fedezett nettó igény: előfűtés, utófűtés, látens hő külön-külön; 9.2–9.4) | – | 10. fejezet | 1. függ. 3.1, 9. pont, 20. o. | – | – |
| MOD-014 | 10. lépés: hűtési rendszer (10.1–10.3) | – | 11. fejezet | 1. függ. 3.1, 10. pont, 20. o. | – | – |
| MOD-015 | 11. lépés: világítás villamosenergia-felhasználása; lakó és szállás jellegű épületeknél (lakóépületek) elhagyandó | rendeltetés | ha lakóépület → kihagy | 1. függ. 3.1, 11. pont, 20. o. | – | Lakóépületnél E_vil = 0 és a lépés nem fut |
| MOD-016 | 12. lépés: az épület saját rendszereiből származó nyereségáramok | – | 13. fejezet | 1. függ. 3.1, 12. pont, 20. o. | – | – |
| MOD-017 | 13. lépés: komplex indikátorok a nettó kondicionált alapterületre fajlagosítva | – | 14. fejezet | 1. függ. 3.1, 13. pont, 20. o. | – | – |
| MOD-018 | 14. lépés: referenciaépület számítása, követelményérték meghatározása; lakóépületnél a referenciaérték adott, meghatározása csak szimuláció esetén lehetséges és szükséges | rendeltetés, módszer | ha lakóépület és nem szimuláció → adott referenciaérték | 1. függ. 3.1, 14. pont, 21. o. | – | Lakóépület, egyszerűsített → nincs referenciaépület-számítás |
| MOD-019 | 15. lépés: megfelelés ellenőrzése; nem megfelelés esetén áttervezés | – | – | 1. függ. 3.1, 15. pont, 21. o. | – | – |
| MOD-020 | Energiatanúsítás: a 3.1 lépései, eltérés: önálló rendeltetési egység tanúsításakor a fajlagos hőveszteség-tényező (q) számítása elhagyható | q [W/m3K] | választható kihagyás | 1. függ. 3.2, 21. o. | – | Lakás-tanúsításnál q opcionális |
| MOD-021 | Energiatanúsítás: nem lakó/szállás jellegű önálló rendeltetési egység egyszerűsített esetben → a referenciaszámítás az önálló rendeltetési egységre | rendeltetés, egység | – | 1. függ. 3.2, 21. o. | – | – |
| MOD-022 | Energiatanúsítás: utolsó lépés a kategóriába sorolás és a tanúsítvány kiállítása | – | – | 1. függ. 3.2, 21. o. | – | – |
| MOD-023 | Alkalmazási kör: követelményellenőrzés és energetikai tanúsítás; szabványos feltételek, fogyasztótól független eredmény | – | – | 1. függ. 3.3, 21. o. | – | – |
| MOD-024 | Hatályon kívül helyezett hivatkozott rendelet/szabvány helyett a helyettesítő dokumentumot kell alkalmazni (szabványverzió-kezelés) | – | – | 1. függ. 3.3, 21. o. | – | – |
| MOD-025 | Egyszerűsített vs. részletes módszer: számítási lépésenként szabadon választható, kivéve ahol a szöveg másképp rendelkezik; a programnak lépésenkénti módszerválasztót kell tartalmaznia | módszer[lépés] | – | 1. függ. 3.4, 21. o. | – | Vegyes választás (pl. U részletes, talaj egyszerűsített) elfogadott |
| MOD-026 | Részletes módszerek: az MSZT (https://prod.mszt.hu/hu-hu/) szabványai | – | – | 1. függ. 3.4, 21. o. | – | – |
| MOD-027 | Részletes módszerként elfogadható validált dinamikus szimulációs szoftver – feltétel: referenciaépület-módszer a követelményhez lakóépületnél is | – | – | 1. függ. 3.4, 21. o. | – | – |
| MOD-028 | Szimuláció: meteorológiai adatsor a 2. függ. 1.1 pont szerint | – | – | 1. függ. 3.4, 21. o. | 2. függ. 1.1 (más feladat) | – |
| MOD-029 | Szimuláció: súlyozó tényezők a 14.2 pont szerint | – | – | 1. függ. 3.4, 21. o. | 14.2 (más feladat) | – |
| MOD-030 | Szimuláció: a 176/2008. Korm. r. 1. mell. szerinti összefoglaló lap és korszerűsítési lap értékei e függelék mértékegységeiben; vonatkoztatási értékek (hasznos alapterület, fűtött térfogat belméretekkel) a 176/2008. Korm. r. szerint | A_N, V | – | 1. függ. 3.4, 21. o. | – | – |
| MOD-031 | Szimuláció: bemenő adatok legalább az egyszerűsített módszer részletességével | – | – | 1. függ. 3.4, 22. o. | – | – |
| MOD-032 | Szimuláció: U a 4.1 szerint (légrétegek, inhomogén rétegek, légüreg-, rögzítőelem-, fordított tető-korrekciók); felületi hőátadási ellenállás dinamikusan is számítható | U | 4.1 | 1. függ. 3.4, 22. o. | – | – |
| MOD-033 | Szimuláció: üvegfal/függönyfal U a 4.2, nyílászáró U a 4.3 szerint | U_FF, U_ny | 4.2, 4.3 | 1. függ. 3.4, 22. o. | – | – |
| MOD-034 | Szimuláció, társított árnyékoló fűtési idényben: kézi szabályozásnál a használati időszakban napkeltétől vagy 6 órától (amelyik a későbbi) napnyugtáig nyitva, egyébként csukva; automatikus szabályozásnál „napkeltéig napnyugtától nyitva van, egyébként csukva” (szó szerint, lásd anomália) | szabályozás típusa, idő | – | 1. függ. 3.4, 22. o. | – | Kézi, napkelte 7:10 → nyitás 7:10 |
| MOD-035 | Szimuláció: talajjal érintkező szerkezetek a 4.4, az MSZ EN ISO 13370 dinamikus programokra vonatkozó előírásai, vagy egyenértékű módszer szerint | – | – | 1. függ. 3.4, 22. o. | – | – |
| MOD-036 | Szimuláció: termikus zónák az 5. fejezet szerint; belső válaszfalak modellezése nem szükséges, de hőtároló tömegük figyelembe veendő | – | – | 1. függ. 3.4, 22. o. | – | – |
| MOD-037 | Szimuláció: csatlakozási hőhidak a 6.1.2 szerint; nem kondicionált terek nem kondicionált zónaként | – | – | 1. függ. 3.4, 22. o. | – | – |
| MOD-038 | Szimuláció: hűtési idényben az árnyékoló csukva, ha a sugárzási intenzitás > 300 W/m2 | I [W/m2] | ha I > 300 W/m2 → csukva | 1. függ. 3.4, 22. o. | – | I=301 → csukva; I=300 → nyitva |
| MOD-039 | Szimuláció: sugárzási nyereséget jelentősen befolyásoló külső akadályokat (domborzat, környező épületek) modellezni kell; növényzet figyelembe vehető | – | – | 1. függ. 3.4, 22. o. | – | – |
| MOD-040 | Szimuláció: vízszintes és függőleges árnyékvetőket modellezni kell, ha árnyékvető szögük > 30°, egyébként szabadon választható | árnyékvető szög [°] | ha szög > 30° → kötelező | 1. függ. 3.4, 22. o. | – | 31° → kötelező; 30° → opcionális |
| MOD-041 | Szimuláció: fogyasztói profil zónánként a használati mód alapján; lakóépületnél MSZ EN ISO 16798-1 (vagy egyenértékű) szerint, HMV hőigény a 2. függ. 2.2. táblázata szerint; egyéb épületnél a szabvány ajánlott | rendeltetés | – | 1. függ. 3.4, 22. o. | 2. függ. 2.2. táblázat (más feladat) | – |
| MOD-042 | Szimuláció, lakóépület: programozható automatikánál éjszakai (22–06) leszabályozás figyelembe vehető | szabályozás | 22:00–06:00 | 1. függ. 3.4, 22. o. | – | – |
| MOD-043 | Szimuláció: filtrációs légcsereszám a 2. függ. 2.4. táblázata szerint, vagy a tömítetlenség alapján modellezve | n_filt [1/h] | – | 1. függ. 3.4, 22. o. | 2. függ. 2.4. táblázat (más feladat) | – |
| MOD-044 | Szimuláció: épülettechnika egyszerűsített modellezésekor teljesítménytényező, segédenergia, elosztási/tárolási/szabályozási veszteség a 8–12. fejezet szerint, vagy részletes rendszermodell | – | – | 1. függ. 3.4, 22. o. | – | – |

### 3. Az egyes határoló szerkezetekre vonatkozó számítások (4. fejezet, 23–34. o.)

### 3.1 Hőátbocsátási tényező (4.1)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-001 | Választás: átlagos U részletes módszerrel (az egész szerkezet vagy egy jellemző része numerikus modellezéssel, MSZ EN ISO 10211 modellezési szabályai – alternatív) vagy egyszerűsítve a (4.1)–(4.13) szerint | módszer | – | 1. függ. 4.1 a)–b), 23. o. | – | – |
| HT-002 | Hőátbocsátási tényező | R_tot [m2K/W] | `U = 1 / R_tot` [W/m2K] | 1. függ. 4.1, (4.1) egy., 23. o. | – | R_tot = 4,0 → U = 0,25 |
| HT-003 | Eredő hővezetési ellenállás n homogén rétegre | R_si, R_i, R_se [m2K/W] | `R_tot = R_si + Σ_{i=1..n} R_i + R_se` | 1. függ. 4.1, (4.2) egy., 23. o. | `modszer/hotechnika.json#tabla_4_1` | 0,13 + 3,0 + 0,04 = 3,17 |
| HT-004 | Belső szerkezet (pl. válaszfal), ill. fűtött–fűtetlen teret elválasztó szerkezet: mindkét oldalon R_si | szerkezet típusa | `R_se := R_si` | 1. függ. 4.1, 23. o. | `modszer/hotechnika.json#tabla_4_1` | Vízszintes hőáram: 0,13+0,13 |
| HT-005 | Réteg hővezetési ellenállása | d [m], λ [W/mK] (tervezési érték) | `R = d / λ` | 1. függ. 4.1, (4.3) egy., 23. o. | – | d=0,15, λ=0,04 → 3,75 |
| HT-006 | Állagvédelmi ellenőrzés (nem része az energiaszámításnak): MSZ 24140, vagy MSZ EN ISO 13788, vagy egyenértékű módszer – alternatív | – | – | 1. függ. 4.1, 23. o. | – | – |
| HT-007 | Hővezetési tényező tervezési értéke: termék minősítő irata + MSZ EN ISO 10456 szerint (kötelező) | λ [W/mK] | – | 1. függ. 4.1.1, 24. o. | – | – |
| HT-008 | Meglévő szerkezet, megbízható adat hiányában: MSZ 24140 mellékleteinek anyagjellemzői használhatók | λ | – | 1. függ. 4.1.1, 24. o. | (MSZ 24140 mellékletei – nincs a módszerben) | – |
| HT-009 | Ha csak a deklarált λ ismert és a mérés feltételei eltérnek a beépítéstől: a tervezési λ-t az MSZ EN ISO 10456 korrekciós tényezőivel kell meghatározni (a módszer nem adja meg a tényezőket) | λ_D | – | 1. függ. 4.1.1, 24. o. | – | – |

### 3.2 Felületi hőátadási ellenállás (4.1.2)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-010 | Alapérték R_si hőáram felfelé | hőáram iránya | `R_si = 0,10` m2K/W | 1. függ. 4.1.2, 4.1. tábl., 24. o. | `modszer/hotechnika.json#tabla_4_1` | – |
| HT-011 | Alapérték R_si vízszintes | – | `R_si = 0,13` m2K/W | 1. függ. 4.1.2, 4.1. tábl., 24. o. | `modszer/hotechnika.json#tabla_4_1` | – |
| HT-012 | Alapérték R_si lefelé | – | `R_si = 0,17` m2K/W | 1. függ. 4.1.2, 4.1. tábl., 24. o. | `modszer/hotechnika.json#tabla_4_1` | – |
| HT-013 | Alapérték R_se (minden irány) | – | `R_se = 0,04` m2K/W | 1. függ. 4.1.2, 4.1. tábl., 24. o. | `modszer/hotechnika.json#tabla_4_1` | – |
| HT-014 | Irány-választási szabály: a vízszintes értékek a vízszintes síktól ±30°-ig alkalmazhatók | hőáram dőlésszöge [°] | `|szög| ≤ 30° → vízszintes` | 1. függ. 4.1.2, 24. o. | `modszer/hotechnika.json#alapertekek_4` (legreteg_szog_tures) | 30° → vízszintes; 31° → felfelé/lefelé |
| HT-015 | Kötelező részletes eset: nem sík felület, alacsony emissziós tényezőjű felület, speciális peremfeltétel → MSZ EN ISO 6946 (vagy egyenértékű) szerinti hőátadási ellenállás | felület jellege | – | 1. függ. 4.1.2, 24. o. | – | Low-e felületnél a táblázati érték letiltva |

### 3.3 Légrétegek hővezetési ellenállása (4.1.3)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-016 | Részletes módszer: MSZ EN ISO 6946 D melléklet | – | – | 1. függ. 4.1.3 a), 24. o. | – | – |
| HT-017 | Kötelező részletes módszer, ha a b) feltételek bármelyike nem teljesül | ε, d, kiterjedés, belső kapcsolat | – | 1. függ. 4.1.3 a), 24. o. | – | ε=0,5 → egyszerűsített tiltva |
| HT-018 | Vastag légréteg: d > 0,3 m a U-ban nem vehető figyelembe; hőáramok hőegyensúlyból | d [m] | `d > 0,3 m → kizárva U-ból` | 1. függ. 4.1.3 a), 24. o. | `modszer/hotechnika.json#alapertekek_4` | d=0,35 → hiba/átirányítás |
| HT-019 | Egyszerűsített alkalmazhatóság: határoló felületek emissziós tényezője ≥ 0,8, párhuzamosak és a hőáramra merőlegesek | ε [-] | `ε ≥ 0,8` | 1. függ. 4.1.3 b), 24. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-020 | Egyszerűsített alkalmazhatóság: vastagság ≤ a másik két irányú méret bármelyikének 0,1-szerese, és d ≤ 0,3 m | d, a másik két méret [m] | `d ≤ 0,1·min(b, h)` és `d ≤ 0,3` | 1. függ. 4.1.3 b), 24. o. | `modszer/hotechnika.json#alapertekek_4` | d=0,05, h=0,4 → nem teljesül |
| HT-021 | Egyszerűsített alkalmazhatóság: a légréteg a belső környezettel nincs kapcsolatban | – | – | 1. függ. 4.1.3 b), 24. o. | – | – |
| HT-022 | Légréteg-osztályozás: zárt / kismértékben kiszellőztetett / intenzíven kiszellőztetett | A_szell [mm2/fm vagy mm2/m2] | lásd HT-024, HT-027, HT-029 | 1. függ. 4.1.3, 24. o. | – | – |
| HT-023 | Zárt légréteg ellenállása táblázatból, közbenső vastagságnál lineáris interpolációval; hőáram-irány szerint (vízszintes ±30°-ig) | d [mm], irány | interpoláció a 4.2. tábl.-ból | 1. függ. 4.1.3, 4.2. tábl., 25. o. | `modszer/hotechnika.json#tabla_4_2` | 20 mm vízszintes → 0,175; 300 mm lefelé → 0,23 |
| HT-024 | Zártnak tekintendő: függőleges légréteg nyílásai ≤ 500 mm2 / fm alapél (vízszintesen mérve); vízszintes légréteg ≤ 500 mm2 / m2; idetartozik a hőszigeteléssel nem elválasztott, kisméretű nyílásokkal a külsővel összekötött réteg, ha nem alakul ki rá merőleges légáramlás | A_szell [mm2] | `A_szell ≤ 500` | 1. függ. 4.1.3, 24. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-025 | Kismértékben kiszellőztetett légréteg feltétele | A_szell [mm2/fm ill. mm2/m2] | `500 < A_szell < 1500` | 1. függ. 4.1.3, 25. o. | – | A=1000 → kismértékű |
| HT-026 | Kismértékben kiszellőztetett légréteg eredő ellenállása | A_szell [mm2], R_tot,zárt, R_tot,szell [m2K/W] | `R_tot = (1500 − A_szell)/1000 · R_tot,zárt + (A_szell − 500)/1000 · R_tot,szell` | 1. függ. 4.1.3, (4.4) egy., 25. o. | – | A=1000, R_zárt=3,4, R_szell=2,9 → 3,15 |
| HT-027 | Intenzíven kiszellőztetett légréteg feltétele | A_szell | `A_szell ≥ 1500` mm2 / 1 m alapél (függőleges), ill. / 1 m2 (vízszintes) | 1. függ. 4.1.3, 25. o. | `modszer/hotechnika.json#alapertekek_4` | A=1500 → intenzív |
| HT-028 | Intenzív kiszellőztetésnél a légréteg és a külső oldali rétegek ellenállása elhanyagolandó (R_tot,szell számítása) | rétegek | külső rétegek R = 0 | 1. függ. 4.1.3, 25. o. | – | – |
| HT-029 | Intenzív kiszellőztetésnél a külső felületi ellenállás nulla szélsebességgel, vagy az R_si megfelelő értéke használható | irány | `R_se := R_si(irány)` (megengedett) | 1. függ. 4.1.3, 25. o. | `modszer/hotechnika.json#tabla_4_1` | Fal: R_se = 0,13 |
| HT-030 | Kéthéjú (átszellőztetett, kismértékben átszellőztetett, zárt) homlokzatburkolatok U-ja a 4.1.3 légréteg-ellenállásaival | – | HT-023…HT-029 | 1. függ. 4.2, 29. o. | `modszer/hotechnika.json#tabla_4_2` | – |

### 3.4 Inhomogén rétegek (4.1.4)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-031 | Választás: részletes (numerikus, MSZ EN ISO 10211) vagy egyszerűsített (MSZ EN ISO 6946 szerinti felső/alsó határérték) | módszer | – | 1. függ. 4.1.4 a)–b), 25. o. | – | – |
| HT-032 | Megengedett közelítés: csak az alsó határérték figyelembevétele | R_tot,alsó | `R_tot := R_tot,alsó` (opcionális) | 1. függ. 4.1.4 b), 25. o. | – | – |
| HT-033 | Egyszerűsített módszer tiltása: ha R_tot,felső / R_tot,alsó > 1,5 | R_tot,felső, R_tot,alsó | `R_tot,felső/R_tot,alsó > 1,5 → részletes kötelező` | 1. függ. 4.1.4 b), 25. o. | `modszer/hotechnika.json#alapertekek_4` | 3,3/2,0 = 1,65 → tiltva |
| HT-034 | Egyszerűsített módszer tiltása: a hőszigetelést átszúró fém kötőelemek → (4.13) korrekció | – | – | 1. függ. 4.1.4 b), 25. o. | – | – |
| HT-035 | Eredő ellenállás a két határérték számtani közepe | R_tot,felső, R_tot,alsó [m2K/W] | `R_tot = (R_tot,felső + R_tot,alsó) / 2` | 1. függ. 4.1.4, (4.5) egy., 26. o. | – | (3,0+2,6)/2 = 2,8 |
| HT-036 | Felosztás rétegekre és szeletekre úgy, hogy hőtechnikailag homogén elemek keletkezzenek | geometria | – | 1. függ. 4.1.4, 26. o. | – | – |
| HT-037 | Felső határérték (egydimenziós, a felületre merőleges hőáram) | f_a…f_q [-], R_tot,a…R_tot,q [m2K/W] | `1/R_tot,felső = f_a/R_tot,a + f_b/R_tot,b + … + f_q/R_tot,q` | 1. függ. 4.1.4, (4.6) egy., 26. o. | – | Σf = 1 ellenőrzése |
| HT-038 | Inhomogén réteg egyenértékű ellenállása | d_j [m], λ_eq,j [W/mK] | `R_j = d_j / λ_eq,j` | 1. függ. 4.1.4, (4.7) egy., 26. o. | – | – |
| HT-039 | Egyenértékű hővezetési tényező | λ_aj…λ_qj [W/mK], f_a…f_q | `λ_eq,j = λ_aj·f_a + λ_bj·f_b + … + λ_qj·f_q` | 1. függ. 4.1.4, (4.8) egy., 26. o. | – | 0,9·0,04 + 0,1·0,13 = 0,049 |
| HT-040 | Alsó határérték (minden, a felülettel párhuzamos sík izoterm) | R_j | `R_tot,alsó = Σ R_j` (a felületi ellenállásokkal együtt – lásd anomália) | 1. függ. 4.1.4, (4.9) egy., 26. o. | – | – |

### 3.5 Változó vastagságú réteg (4.1.5)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-041 | Részletes: MSZ EN ISO 6946 E melléklet, ha a lejtés ≤ 5% | lejtés [%] | `lejtés ≤ 5%` | 1. függ. 4.1.5 a), 26. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-042 | Részletes, lejtés > 5%: numerikus modellezés „ad megfelelő eredményt” | lejtés | – | 1. függ. 4.1.5 a), 26. o. | – | – |
| HT-043 | Egyszerűsített: a változó vastagságú réteg átlagos vastagsága vehető figyelembe | d_átl [m] | `R = d_átl / λ` | 1. függ. 4.1.5 b), 26. o. | – | lejtésképző 5–25 cm → 15 cm |

### 3.6 U-korrekciók (4.1.6)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-044 | Korrigált hőátbocsátási tényező | U_0, ΔU [W/m2K] | `U = U_0 + ΔU` | 1. függ. 4.1.6, (4.10) egy., 26. o. | – | 0,20 + 0,01 = 0,21 |
| HT-045 | Összes korrekció | ΔU_légüreg, ΔU_rögz, ΔU_ford | `ΔU = ΔU_légüreg + ΔU_rögz + ΔU_ford` | 1. függ. 4.1.6, (4.11) egy., 26. o. | – | – |
| HT-046 | Elhanyagolási szabály: ha ΔU < 0,03·U (a számított U 3%-a), a korrekció elhanyagolható | ΔU, U_0 | `ΔU < 0,03·U_0 → ΔU := 0` (megengedett) | 1. függ. 4.1.6, 27. o. | `modszer/hotechnika.json#alapertekek_4` | U_0=0,25, ΔU=0,007 → elhanyagolható |
| HT-047 | Légüreg-korrekció | ΔU'' [W/m2K], R_1, R_tot [m2K/W] | `ΔU_légüreg = ΔU'' · (R_1 / R_tot)^2` | 1. függ. 4.1.6, (4.12) egy., 27. o. | – | ΔU''=0,01, R_1=3, R_tot=3,5 → 0,0073 |
| HT-048 | ΔU'' = 0,04 (2. szint): szabad légáramlás alakulhat ki a hőszigetelés hideg és meleg oldala között | légüreg szint | `ΔU'' = 0,04` | 1. függ. 4.1.6, 27. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-049 | ΔU'' = 0,01 (1. szint): van átmenő hézag, de légáramlás nem jön létre; általános esetben az 1. szintet kell alkalmazni (alapértelmezés) | légüreg szint | `ΔU'' = 0,01` (alapért.) | 1. függ. 4.1.6, 27. o. | `modszer/hotechnika.json#alapertekek_4` | Alapértelmezett szint = 1 |
| HT-050 | Nincs légüreg-korrekció lépcsőzetesen eltolt, egynél több rétegben beépített hőszigetelésnél | rétegszám, eltolás | `ΔU_légüreg = 0` | 1. függ. 4.1.6, 27. o. | – | 2 réteg eltolva → 0 |
| HT-051 | Rögzítőelem: részletes módszer – pontszerű hőátbocsátási tényező (χ) MSZ EN ISO 10211 szerinti numerikus modellezéssel | χ [W/K] | – | 1. függ. 4.1.6 a), 27. o. | – | – |
| HT-052 | Rögzítőelem-korrekció (egyszerűsített) | α, λ_rögz [W/mK], A_rögz [m2], n_rögz [db/m2], d_1 [m], R_1, R_tot [m2K/W] | `ΔU_rögz = α · λ_rögz · A_rögz · n_rögz / d_1 · (R_1 / R_tot)^2` | 1. függ. 4.1.6, (4.13) egy., 27. o. | – | α=0,8, λ=50, A=1,96e-5, n=6, d_1=0,15, R_1/R_tot=0,95 → ≈0,0283 |
| HT-053 | α teljesen áthatoló rögzítőelemnél | – | `α = 0,8` | 1. függ. 4.1.6, 27. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-054 | α süllyesztett rögzítőelemnél | d_0, d_1 [m] | `α = 0,8 · d_1 / d_0` | 1. függ. 4.1.6, 27. o. | `modszer/hotechnika.json#alapertekek_4` | d_1=0,12, d_0=0,15 → 0,64 |
| HT-055 | Ferde behatolás: d_1 nagyobb lehet a hőszigetelés vastagságánál | d_1 | – | 1. függ. 4.1.6, 27. o. | – | – |
| HT-056 | Süllyesztett elemnél R_1 = d_1 / λ_hőszigetelés | d_1, λ | `R_1 = d_1 / λ_szig` | 1. függ. 4.1.6, 27–28. o. | – | – |
| HT-057 | Nincs rögzítőelem-korrekció, ha a rögzítőelem légréteget szúr át, vagy λ_rögz < 1 W/mK | λ_rögz | `λ_rögz < 1 → ΔU_rögz = 0` | 1. függ. 4.1.6, 28. o. | `modszer/hotechnika.json#alapertekek_4` | Műanyag dübel λ=0,3 → 0 |
| HT-058 | A_rögz meghatározásakor csak az 1 W/mK-nél nagyobb λ-jú rész számít | A_rögz | – | 1. függ. 4.1.6, 28. o. | – | – |
| HT-059 | Kötelező részletes eset: két fémlemezt összekötő fém rögzítőelem (pl. fémfegyverzetű szendvicspanel) | szerkezet típusa | – | 1. függ. 4.1.6, 28. o. | – | Szendvicspanelnél (4.13) letiltva |
| HT-060 | Fordított tető: általános esetben a csapadékhatás elhanyagolható (ΔU_ford = 0) | – | `ΔU_ford = 0` (alapért.) | 1. függ. 4.1.6, 28. o. | – | – |
| HT-061 | Fordított tető: kötelező figyelembe venni, ha a vízszigetelés fölötti hőszigetelés egyrétegű ÉS tompa illesztésű ÉS a fölötte lévő réteg jó vízáteresztő (pl. kavics); ekkor ΔU_ford az MSZ EN ISO 6946 F melléklete szerint, p = 1,3 mm/nap mellett (a képletet a módszer nem adja meg) | rétegszám, illesztés, fedőréteg; p [mm/nap] | `p = 1,3` | 1. függ. 4.1.6, 28. o. | `modszer/hotechnika.json#alapertekek_4` | Három feltétel teljesül → számítás kötelező |

### 3.7 Panelos falak (4.1.7)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-062 | 1992 előtt épült házgyári panelos homlokzati falak átlagos U-ja kötelezően a 2. függ. 4.3 szerint, az utólagos hőszigetelés függvényében (táblázati keresés: házgyár, gyártási idő, kiegészítő hőszigetelés) | házgyár, gyártási idő, kieg. hőszig. vastagság | táblázati érték | 1. függ. 4.1.7, 28. o.; 2. függ. 4.3, 4.6 tábl., 28–30. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | Pécs 1971-1983, 8 → 0,419 W/m2K |
| HT-063 | A panel-U értékek tartalmazzák az elemen belüli hőhidakat, de nem a csatlakozási hőhidakat (ezek külön, egyszerűsített módszerrel) | – | – | 1. függ. 4.1.7, 28. o.; 2. függ. 4.3, 28. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | – |

### 3.8 Üvegfalak, függönyfalak (4.2)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-064 | Részletes: MSZ EN ISO 12631 „átfogó értékelő módszer”, numerikus modellezés | – | – | 1. függ. 4.2 a), 28. o. | – | – |
| HT-065 | Egyszerűsített: MSZ EN ISO 12631 „komponens értékelő módszer” | – | (4.14)–(4.15) | 1. függ. 4.2 b), 28. o. | – | – |
| HT-066 | Kötelező részletes eset: strukturális üvegezés (SG), strukturális szilikon üvegezés (SSG) és átszellőztetett kialakítás esetén az egyszerűsített nem alkalmazható | kialakítás | – | 1. függ. 4.2 b), 28. o. | – | SSG → egyszerűsített letiltva |
| HT-067 | Függönyfal U: elemek felületarányos átlaga | U_FF,elem [W/m2K], A_FF,elem [m2] | `U_FF = Σ(U_FF,elem · A_FF,elem) / Σ A_FF,elem` | 1. függ. 4.2, (4.14) egy., 28. o. | – | 2 elem: (1,0·10 + 1,4·5)/15 = 1,133 |
| HT-068 | Függönyfal elem U (szó szerint, lásd anomália: g-indexek) | U_ü, U_p, U_k, U_l, U_b [W/m2K]; A_ü, A_p, A_k, A_l, A_b, A_g [m2]; ψ_k,ü, ψ_b,ü, ψ_g,ü, ψ_b,p, ψ_b,k, ψ_g,k [W/mK]; l_… [m] | `U_FF,elem = (ΣA_ü·U_ü + ΣA_p·U_p + ΣA_k·U_k + ΣA_l·U_l + ΣA_b·U_b) / (ΣA_ü + ΣA_p + ΣA_k + ΣA_l + ΣA_b) + (Σl_k,ü·ψ_k,ü + Σl_b,ü·ψ_b,ü + Σl_g,ü·ψ_g,ü + Σl_b,p·ψ_b,p + Σl_b,k·ψ_b,k + Σl_g,k·ψ_g,k) / (ΣA_ü + ΣA_p + ΣA_k + ΣA_b + ΣA_g)` | 1. függ. 4.2, (4.15) egy., 28. o. | – | ψ=0 esetén a felületarányos átlag adódik |

### 3.9 Nyílászárók (4.3)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-069 | Részletes: MSZ EN ISO 10077-1 szerint, vagy numerikus modellezés MSZ EN ISO 10077-2 szerint | – | – | 1. függ. 4.3 a), 29. o. | – | – |
| HT-070 | Egyszerűsített: MSZ EN ISO 10077-1 alapján, egyszerűsítésekkel, (4.16)–(4.19) | – | – | 1. függ. 4.3 b), 29. o. | – | – |
| HT-071 | Adatforrás-sorrend: a nyílászáró/komponensek hőtechnikai adatai a teljesítménynyilatkozatból; ennek hiányában a 2. függ. 4.1 pont tájékoztató adatai | U_ü, U_k, ψ | – | 1. függ. 4.3 b), 29. o. | 2. függ. 4.1 (más feladat) | Nyilatkozat hiányában alapértelmezett táblázat |
| HT-072 | Egyhéjú nyílászáró (ablak, ajtó) átlagos U | U_ü, U_p, U_k [W/m2K]; A_ü, A_p, A_k [m2] (A_k a belső oldalról nézve, tok+szárny); ψ_k,ü, ψ_k,p, ψ_m,ü [W/mK]; l_k,ü, l_k,p, l_m,ü [m] | `U_ny,e = (ΣA_ü·U_ü + ΣA_p·U_p + ΣA_k·U_k + Σl_k,ü·ψ_k,ü + Σl_k,p·ψ_k,p + Σl_m,ü·ψ_m,ü) / (ΣA_ü + ΣA_p + ΣA_k)` | 1. függ. 4.3.1, (4.16) egy., 29. o. | – | A_ü=1,2, U_ü=1,1, A_k=0,5, U_k=1,3, l=4,6, ψ=0,06 → 1,321 |
| HT-073 | Kéthéjú (kapcsolt, átszellőztetés nélküli) nyílászáró U | U_ny,1, U_ny,2 [W/m2K]; R_si, R_l, R_se [m2K/W] | `U_ny,k = 1 / (1/U_ny,1 − R_si + R_l − R_se + 1/U_ny,2)` | 1. függ. 4.3.2, (4.17) egy., 30. o. | `modszer/hotechnika.json#tabla_4_1`, `modszer/hotechnika.json#tabla_4_2` (R_l forrása nincs kimondva) | U1=U2=2,8, R_l=0,18 → 1,381 (R_si=0,13, R_se=0,04) |
| HT-074 | Elemi követelmény ellenőrzésekor a társított árnyékoló többlet hőszigetelő hatása NEM vehető figyelembe | ellenőrzés típusa | `U := U_ny` | 1. függ. 4.3.3, 30. o. | – | Elemi ellenőrzés U_ny,t-t nem használ |
| HT-075 | Fűtési energiaigény számításakor a társított árnyékoló hatása figyelembe vehető (MSZ EN ISO 10077-1 alapján) | U_Ny [W/m2K], ΔR [m2K/W] | `U_Ny,t = 0,7·U_Ny + 0,3 · 1/(1/U_Ny + ΔR)` | 1. függ. 4.3.3, (4.18) egy., 30. o. | `modszer/hotechnika.json#alapertekek_4` | U=1,0, ΔR=0,15 → 0,9609 |
| HT-076 | ΔR tartalmazza az árnyékoló R_árny és az árnyékoló–nyílászáró közötti légréteg R_l ellenállását | R_árny, R_l | (táblázatból) | 1. függ. 4.3.3, 30. o. | `modszer/hotechnika.json#tabla_4_4`, `modszer/hotechnika.json#tabla_4_5` | – |
| HT-077 | Effektív teljes hézagosság | b_ha, b_hf, b_ho [mm] | `b_eth = b_ha + b_hf + b_ho` | 1. függ. 4.3.3, (4.19) egy., 30. o. | – | 2+3+4 = 9 mm |
| HT-078 | Légáteresztési osztály b_eth alapján (1: ≥35; 2: 15≤b<35; 3: 8≤b<15; 4: „≥8” [szó szerint]; 5: ≤3 és b_ha+b_ho=0 vagy b_hf+b_ho=0) | b_eth [mm] | táblázati besorolás | 1. függ. 4.3.3, 4.3. tábl., 30. o. | `modszer/hotechnika.json#tabla_4_3` | b=9 → 3. osztály; b=5 → nincs egyértelmű osztály (anomália) |
| HT-079 | Ha R_árny ismert: ΔR osztályonként (1: 0,08; 2: 0,25·R_árny+0,09; 3: 0,55·R_árny+0,11; 4: 0,80·R_árny+0,14; 5: 0,95·R_árny+0,17) | osztály, R_árny [m2K/W] | `ΔR = a·R_árny + b` | 1. függ. 4.3.3, 4.4. tábl., 31. o. | `modszer/hotechnika.json#tabla_4_4` | 3. oszt., R=0,10 → 0,165 |
| HT-080 | Ha R_árny nem ismert: közelítő ΔR árnyékolótípus és osztálycsoport (1-2 / 3 / 4-5) szerint | típus, osztály | táblázati érték | 1. függ. 4.3.3, 4.5. tábl., 31. o. | `modszer/hotechnika.json#tabla_4_5` | Al redőny, 3. oszt. → 0,12 |

### 3.10 Talajjal érintkező szerkezetek (4.4)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-081 | Részletes: MSZ EN ISO 13370 szerinti számítás, vagy numerikus modellezés MSZ EN ISO 10211 szerinti geometriával, −20 m mélységben +10 °C talajhőmérséklettel; nagy pontosságnál periodikus hőáram és áramló talajvíz figyelembe vehető | – | `θ(−20 m) = +10 °C` | 1. függ. 4.4 a), 31. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-082 | Egyszerűsített: MSZ EN ISO 13370 alapján, egyszerűsítésekkel, (4.20)–(4.33) | – | – | 1. függ. 4.4 b), 31. o. | – | – |
| HT-083 | Talaj hőtechnikai jellemzői típus szerint (1: agyag, iszap λ=1,5; 2: homok, kavics λ=2,0; 3: homogén kő λ=3,5 W/mK; ρc) | talajtípus | táblázati érték | 1. függ. 4.4.1, 4.6. tábl., 32. o. | `modszer/hotechnika.json#tabla_4_6` | – |
| HT-084 | Alapértelmezés: ismeretlen talajtípus → 2. típus | talajtípus = null | `λ_talaj = 2,0` | 1. függ. 4.4.1, 31. o. | `modszer/hotechnika.json#tabla_4_6` | Üres mező → 2,0 W/mK |
| HT-085 | Terepszint alatti építőanyagok jellemzőinél a beépítési hely nedvesség- és hőmérsékletviszonyait figyelembe kell venni (szám nincs megadva) | λ | – | 1. függ. 4.4.1, 32. o. | – | – |
| HT-086 | Eltérő belső hőmérsékletű, padlóval érintkező terek: helyiséghőmérsékletek területarányos átlaga használható | θ_i [°C], A [m2] | `θ_i = Σ(θ_i,k·A_k)/ΣA_k` | 1. függ. 4.4.1, 32. o. | – | – |
| HT-087 | Ismeretlen ágyazat (zúzottkő, kavics): a 4.6. táblázat 2. típusa, vagy ellenállása elhanyagolandó | – | – | 1. függ. 4.4.1, 32. o. | `modszer/hotechnika.json#tabla_4_6` | – |
| HT-088 | Talajon fekvő padló karakterisztikus mérete | A [m2] (kondicionált tér padlója), P [m] (kitett kerület, beleértve a szomszédos fűtetlen tértől elválasztó csatlakozásokat) | `B = A / (0,5·P)` | 1. függ. 4.4.2, (4.20) egy., 32. o. | – | 10×10 m: A=100, P=40 → B=5 |
| HT-089 | Padló egyenértékű vastagsága | d_f [m], λ_talaj [W/mK], R_si, R_p, R_se [m2K/W] | `d_p = d_f + λ_talaj · (R_si + R_p + R_se)` | 1. függ. 4.4.2, (4.21) egy., 32. o. | `modszer/hotechnika.json#tabla_4_1`, `modszer/hotechnika.json#tabla_4_6` | d_f=0,4, λ=2, R_p=2,5, R_si=0,17, R_se=0,04 → 5,82 |
| HT-090 | R_p számításakor a szemcsés ágyazat ellenállása nem vehető figyelembe; nagy testsűrűségű betonlemezek és vékony burkolatok elhanyagolhatók | rétegek | – | 1. függ. 4.4.2, 32. o. | – | Kavicságy R kizárva |
| HT-091 | Választás: ha (d_p + 0,5·z) < B → (4.22) (nem/mérsékelten hőszigetelt) | d_p, z, B [m] | feltétel | 1. függ. 4.4.2, 32. o. | – | d_p=0,7, z=0, B=5 → (4.22) |
| HT-092 | Talajon fekvő padló U, nem/mérsékelten szigetelt | λ_talaj, B, d_p, z | `U_T,p = 2·λ_talaj / (π·B + d_p + 0,5·z) · ln(π·B/(d_p + 0,5·z) + 1)` | 1. függ. 4.4.2, (4.22) egy., 33. o. | – | λ=2, B=5, d_p=0,7, z=0 → 0,7690 |
| HT-093 | Választás: ha (d_p + 0,5·z) ≥ B → (4.23) (jól hőszigetelt) | d_p, z, B | feltétel | 1. függ. 4.4.2, 33. o. | – | d_p=5,82, B=5 → (4.23) |
| HT-094 | Talajon fekvő padló U, jól szigetelt | λ_talaj, B, d_p, z | `U_T,p = λ_talaj / (0,457·B + d_p + 0,5·z)` | 1. függ. 4.4.2, (4.23) egy., 33. o. | `modszer/hotechnika.json#alapertekek_4` | λ=2, B=5, d_p=5,82, z=0 → 0,2468 |
| HT-095 | Változó padlómélység: z átlagértéke | z [m] | `z = z_átl` | 1. függ. 4.4.2, 33. o. | – | – |
| HT-096 | Terepszint közeli padló: ±0,5 m szintkülönbségen belül → z = 0 | szintkülönbség [m] | `|Δh| ≤ 0,5 → z = 0` | 1. függ. 4.4.2, 33. o. | `modszer/hotechnika.json#alapertekek_4` | −0,4 m → z=0 |
| HT-097 | Kötelező szabvány szerinti eset: talajtól elemelt (búvóteres) padló → MSZ EN ISO 13370 (képlet a módszerben nincs) | – | – | 1. függ. 4.4.2, 33. o. | – | – |
| HT-098 | Terepszint feletti padló (4.24) alkalmazhatósága: padlóterület ≤ 250 m2 és m > 0,5 m | A [m2], m [m] | `A ≤ 250` és `m > 0,5` | 1. függ. 4.4.3, 33. o. | `modszer/hotechnika.json#alapertekek_4` | A=300 → nem alkalmazható |
| HT-099 | Terepszint feletti padló egyenértékű U | U_p, U_talaj, U_T,lf [W/m2K] | `U_T,p = 1 / (1/U_p + 1/(U_talaj + U_T,lf))` | 1. függ. 4.4.3, (4.24) egy., 33. o. | – | – |
| HT-100 | Padló alatti talaj egyenértékű U (lábazati szigetelés terepszint alatti része figyelembe vehető) | λ_talaj, B, d_lf, m [m] | `U_talaj = 2·λ_talaj / (π·B + d_lf + m) · ln(π·B/(d_lf + m) + 1)` | 1. függ. 4.4.3, (4.25) egy., 33. o. | – | – |
| HT-101 | Lábazati fal egyenértékű U (terepszint feletti lábazati szigetelés és talaj hatása) | m [m], U_lf [W/m2K], B [m] | `U_T,lf = 2·m·U_lf / B` | 1. függ. 4.4.3, (4.26) egy., 33. o. | – | m=0,6, U_lf=0,5, B=5 → 0,12 |
| HT-102 | Fűtött pince padlója: a 4.4.2 szerint (HT-088…HT-096) | – | – | 1. függ. 4.4.4, 33. o. | – | – |
| HT-103 | Fűtött pincefal egyenértékű vastagsága | λ_talaj, R_si, R_pf, R_se | `d_pf = λ_talaj · (R_si + R_pf + R_se)` | 1. függ. 4.4.4, (4.27) egy., 33. o. | `modszer/hotechnika.json#tabla_4_1` | – |
| HT-104 | Talajjal érintkező pincefal egyenértékű U | λ_talaj, z, d_p, d_pf [m] | `U_T,pf = 2·λ_talaj/(π·z) · (1 + 0,5·d_p/(d_p + z)) · ln(z/d_pf + 1)` | 1. függ. 4.4.4, (4.28) egy., 33. o. | – | – |
| HT-105 | Ha d_pf < d_p (ritka): a (4.28)-ban d_p helyett d_pf | d_pf, d_p | `d_p := min(d_p, d_pf)` | 1. függ. 4.4.4, 34. o. | – | – |
| HT-106 | Részlegesen alápincézett épület: megengedett közelítés teljes alápincézéssel, a mélység = tényleges mélység fele | z [m] | `z := 0,5·z_tényl` | 1. függ. 4.4.4, 34. o. | `modszer/hotechnika.json#alapertekek_4` | – |
| HT-107 | Részlegesen fűtött pince: számítás teljesen fűtött és fűtetlen pincére (utóbbi MSZ EN ISO 13370 szerint – a módszer nem adja meg), majd súlyozás a fűtött/fűtetlen alapterületek arányában | A_fűtött, A_fűtetlen | `H = (A_f·H_f + A_ff·H_ff)/(A_f + A_ff)` (értelmezés) | 1. függ. 4.4.4, 34. o. | – | – |

### 3.11 Perem hőszigetelés (4.4.5)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HT-108 | Csak terepszint közelében fekvő padlóra; hatás negatív előjelű vonalmenti hőátbocsátási tényezővel | – | `ψ_psz < 0` | 1. függ. 4.4.5, 34. o. | – | Eredmény mindig ≤ 0 |
| HT-109 | Többféle perem hőszigetelés (vízszintes és függőleges): mindegyikre külön számítás, a legnagyobb csökkenést adó vehető figyelembe | ψ_psz,v, ψ_psz,f | `ψ_psz = min(ψ_psz,v, ψ_psz,f)` | 1. függ. 4.4.5, 34. o. | – | – |
| HT-110 | Többlet egyenértékű vastagság | R' [m2K/W], λ_talaj | `d' = R' · λ_talaj` | 1. függ. 4.4.5, (4.29) egy., 34. o. | – | – |
| HT-111 | Többlet hővezetési ellenállás | R_psz [m2K/W], d_psz [m] | `R' = R_psz − d_psz/λ_talaj` | 1. függ. 4.4.5, (4.30) egy., 34. o. | – | R_psz=2,5, d=0,1, λ=2 → 2,45; d'=4,9 |
| HT-112 | Vízszintes perem hőszigetelés ψ (D: szélesség a csatlakozó fal szélétől) | λ_talaj, D, d_p, d' [m] | `ψ_psz,v = −λ_talaj/π · [ln(D/d_p + 1) − ln(D/(d_p + d') + 1)]` | 1. függ. 4.4.5, (4.31) egy., 34. o. | – | λ=2, D=1, d_p=0,7, d'=4,9 → −0,4603 |
| HT-113 | Függőleges perem hőszigetelés ψ (D: mélység a terepszint alatt) | λ_talaj, D, d_p, d' | `ψ_psz,f = −λ_talaj/π · [ln(2D/d_p + 1) − ln(2D/(d_p + d') + 1)]` | 1. függ. 4.4.5, (4.32) egy., 34. o. | – | – |
| HT-114 | Perem hőszigetelés hatása a padló U-jában (alternatívaként a vonalmenti tag helyett) | U_T,p,0 [W/m2K], P_psz [m], ψ_psz [W/mK], A [m2] | `U_T,p = U_T,p,0 + P_psz·ψ_psz / A` | 1. függ. 4.4.5, (4.33) egy., 34. o. | – | 0,7690 + 40·(−0,4603)/100 = 0,5849 |

### 4. A termikus zónázás szabályai (5. fejezet, 35–37. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| ZON-001 | Alapszabály: az épület/épületrész lehetőség szerint egy termikus zóna | – | – | 1. függ. 5., 35. o. | – | – |
| ZON-002 | Többzónás felosztás indokai: eltérő funkció (használati feltételek), jelentős hőmérleg-különbség (hőnyereség, hőtárolás, tájolás, árnyékolás), épülettechnikai összetettség | – | – | 1. függ. 5., 35. o. | – | – |
| ZON-003 | Többzónás számítás: zónánként számítani, majd összesíteni | zónaeredmények | `X_épület = Σ X_zóna` | 1. függ. 5., 35. o. | – | – |
| ZON-004 | 1. lépés: minden helyiség kategóriába sorolása fő funkció és használati feltételek szerint | helyiség | – | 1. függ. 5., 1. lépés, 35. o. | `modszer/zonazas.json#tabla_5_1` | Kategória nélküli helyiség → validációs hiba |
| ZON-005 | Szomszédos (≥1 közös határoló felület), azonos kategóriájú terek egy zónába sorolhatók | szomszédság, kategória | – | 1. függ. 5., 1. lépés, 35. o. | – | – |
| ZON-006 | Zónatípus: kondicionált (legalább egy szezonra – fűtés vagy hűtés – van előírt hőmérséklet) vagy nem kondicionált | θ_i,F, θ_i,H | `kondicionált ⇔ θ_i,F ≠ null ∨ θ_i,H ≠ null` | 1. függ. 5., 35. o. | – | Csak hűtött tér → kondicionált |
| ZON-007 | Nem kondicionált zónák kategóriái: erősen kapcsolt; gyengén kapcsolt; gyengén kapcsolt jelentős szoláris és/vagy belső hőnyereséggel | – | enum | 1. függ. 5., 35. o. | `modszer/zonazas.json#tabla_5_1` | – |
| ZON-008 | Erősen kapcsolt: a zóna hőmérséklete megközelíti a szomszédos kondicionált zóna előírt hőmérsékletét; összevonható a szomszédos kondicionált terekkel; beszámít a nettó hasznos alapterületbe és az energiamérlegbe | – | – | 1. függ. 5., 35. o. | `modszer/zonazas.json#tabla_5_1` | – |
| ZON-009 | Erősen kapcsolt példák: minden oldalon kondicionált térrel határos; jelentős légcsere a kondicionált térrel; nagyon kisméretű tér („lsd. 6. pont”) | – | – | 1. függ. 5., 35. o. | – | Belső WC → erősen kapcsolt |
| ZON-010 | Gyengén kapcsolt zóna hőmérséklete a nem kondicionált–külső és a nem kondicionált–kondicionált hőátviteli tényezők arányából; egyszerűsítve a 6.1.3 korrekciós tényezőivel, részletesen a hőátviteli tényezők arányával | H_tr,ix, H_ue | 6.1.3 (más feladat) | 1. függ. 5., 35. o. | – | – |
| ZON-011 | Gyengén kapcsolt, ha a külsőtől gyenge légzárású nyílászárók választják el: nyílások összmérete > 0,003 m2/m2 alapterület | ΣA_nyílás [m2], A [m2] | `ΣA_nyílás / A > 0,003` | 1. függ. 5., 35. o. | `modszer/zonazas.json#alapertekek_5` | 0,5 m2 / 100 m2 = 0,005 → gyengén |
| ZON-012 | Gyengén kapcsolt, ha intenzíven szellőztetett: > 3 dm3/s/m2 alapterület (kb. n = 3 1/h), pl. garázs | q_V [dm3/s/m2] | `q_V > 3` | 1. függ. 5., 35. o. | `modszer/zonazas.json#alapertekek_5` | Garázs 4 dm3/s/m2 → gyengén |
| ZON-013 | Gyengén kapcsolt + jelentős nyereség (naptér, fűtés/hűtés nélküli átrium): egyszerűsített módszernél a többi nem kondicionált térrel azonosan, a nyereségek elhanyagolásával | módszer | `Q_s := 0` | 1. függ. 5., 36. o. | `modszer/zonazas.json#tabla_5_1` | – |
| ZON-014 | Ugyanez részletes számításnál: a sugárzási nyereségeket MSZ EN ISO 52016-1 szerint figyelembe kell venni (kötelező) | – | – | 1. függ. 5., 36. o. | – | – |
| ZON-015 | Szomszédos nem kondicionált terek összevonhatók, ha kapcsolaterősségük nagyjából egyforma | – | – | 1. függ. 5., 36. o. | – | – |
| ZON-016 | Lakóépület, kondicionált vagy erősen kapcsolt helyiségek (nappali, háló, WC, kamra, közlekedő stb.): A_N-be beszámít; energiamérlegben kondicionált térként | – | – | 1. függ. 5., 5.1. tábl., 36. o. | `modszer/zonazas.json#tabla_5_1` | – |
| ZON-017 | Lakóépület, közös fűtött lépcsőház/garázs: lakás tanúsításakor A_N-be nem számít és adiabatikus felület (hőáram elhanyagolva); egész épület tanúsításakor beszámít | tanúsítás tárgya | `ha lakás → adiabatikus` | 1. függ. 5., 5.1. tábl., 36. o. | `modszer/zonazas.json#tabla_5_1` | Lakás: lépcsőházi fal H = 0 |
| ZON-018 | Lakóépület, gyengén kapcsolt fűtetlen terek (padlás, pince, mélygarázs, közös lépcsőház, saját garázs): A_N-be nem; egyszerűsítve korrekciós tényezővel, részletesen szabvány szerint (6.1.3); a terek egyéb energiafogyasztása nem számít | – | – | 1. függ. 5., 5.1. tábl., 36. o. | `modszer/zonazas.json#tabla_5_1` | Garázsvilágítás kizárva |
| ZON-019 | Lakóépület, naptér/átrium: A_N-be nem; egyszerűsítve nyereség elhanyagolható, részletesen szabvány szerint; egyéb energiafogyasztás nem számít | – | – | 1. függ. 5., 5.1. tábl., 36–37. o. | `modszer/zonazas.json#tabla_5_1` | – |
| ZON-020 | 2. lépés: egy zónán belül a jellemző épülettechnikai rendszerek (fűtés, hűtés, párátlanítás) azonosak legyenek; markáns különbségnél (eltérő energiaforrású hőtermelő, eltérő hőleadó/elosztóhálózat, gépi hűtéssel/szellőzéssel ellátott vs. nem ellátott) zónahatár kötelező | rendszer-hozzárendelés | – | 1. függ. 5., 2. lépés, 37. o. | – | Egy zónában 2 eltérő hőtermelő → hiba |
| ZON-021 | 3. lépés: szomszédos zónák összevonhatók azonos/hasonló használati feltételeknél (min./max. parancsolt hőmérséklet, páratartalom, napi/heti használati idő) | – | – | 1. függ. 5., 3. lépés, 37. o. | – | – |
| ZON-022 | Hasonlóság feltétele 1: a fűtési és hűtési parancsolt hőmérsékletek közötti különbség < 4 K | Δθ [K] | `Δθ < 4 K` | 1. függ. 5., 3. lépés, 37. o. | `modszer/zonazas.json#alapertekek_5` | 20/22 °C → 2 K → hasonló; 4 K → nem |
| ZON-023 | Hasonlóság feltétele 2: a napi menetrendek legfeljebb 3 órával térnek el; nem vonható össze pl. hétvégén használt és nem használt zóna | menetrend [h] | `Δt ≤ 3 h` | 1. függ. 5., 3. lépés, 37. o. | `modszer/zonazas.json#alapertekek_5` | 3 h → összevonható; 4 h → nem |
| ZON-024 | Összevonáskor a használati feltételek alapterülettel súlyozott átlaga használható | X_k, A_k | `X = Σ(X_k·A_k)/ΣA_k` | 1. függ. 5., 3. lépés, 37. o. | – | – |
| ZON-025 | 4. lépés: hőegyensúly szerinti homogenitás; azonos zóna, ha a benapozás között nincs jelentős különbség és a hőtároló képességben két osztálynál kisebb a különbség; különben felosztás | benapozás, hőtároló osztály | `|Δosztály| < 2` | 1. függ. 5., 4. lépés, 37. o. | `modszer/zonazas.json#alapertekek_5` | – |
| ZON-026 | Felosztás nem kötelező, ha a második zóna alapterülete < az eredeti zóna 25%-a | A_2, A_eredeti | `A_2 < 0,25·A_eredeti` | 1. függ. 5., 4. lépés, 37. o. | `modszer/zonazas.json#alapertekek_5` | 20/100 → nem kötelező |
| ZON-027 | 5. lépés: kisméretű zóna (< 5% az épület összes hasznos alapterületéből) összevonható szomszédos zónával, ha az épülettechnika azonos (használat/hőegyensúly eltérhet) | A_zóna, A_N | `A_zóna < 0,05·A_N` | 1. függ. 5., 5. lépés, 37. o. | `modszer/zonazas.json#alapertekek_5` | 4/100 → összevonható |
| ZON-028 | 6. lépés: nagyon kisméretű zóna (< 1%) eltérő épülettechnika esetén is összevonható | A_zóna, A_N | `A_zóna < 0,01·A_N` | 1. függ. 5., 6. lépés, 37. o. | `modszer/zonazas.json#alapertekek_5` | 0,8/100 → összevonható |


## M2. Nettó fűtési és hűtési energiaigény (1. Függelék 6. fejezet)

### 6.0 Általános szabályok

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| NET-001 | Módszerválasztás: részletes = órai alapon MSZ EN ISO 52016-1 szerinti órai módszer vagy dinamikus szimuláció (alternatív, részletes) | módszer kapcsoló | – | 9/2023 ÉKM 1. függ. 6., 38. o. | – | részletes módban a havi motor ne fusson |
| NET-002 | Egyszerűsített számítás: havi számítási időszak, a 6. fejezet összefüggéseivel | módszer = egyszerűsített | havi lépés, m = 1..12 | 1. függ. 6., 38. o. | – | 12 havi eredménysor keletkezik |
| NET-003 | Tiltás: egyszerűsített eljárás nem alkalmas kéthéjú üveghomlokzatú épületre; elfogadható közelítés a szintenként tagolt kéthéjú homlokzat fűtetlen naptérként való figyelembevétele | homlokzat típusa | validációs szabály | 1. függ. 6., 38. o. | – | kéthéjú homlokzat + egyszerűsített → hiba/figyelmeztetés, kivéve „szintenként tagolt → naptér” |
| NET-004 | Zónánkénti számítás, épületszintű eredmény = zónák összege (zónázás: 5. pont) | zónák | Q_épület = Σ_zóna Q_zóna | 1. függ. 6., 38. o. | – | 2 zóna összege = épület |
| NET-005 | Kondicionált zónák közötti hőátvitel elhanyagolható; ha figyelembe vesszük, kötelezően az MSZ EN ISO 52016-1 termikusan összekapcsolt zónák módszere | zóna-szomszédság | – | 1. függ. 6., 38. o. | – | zónák közti H = 0 alapértelmezés |
| NET-006 | Két külön havi számítás: fűtés-feltételezéssel és hűtés-feltételezéssel, üzemmódra jellemző feltételekkel (légcsere, árnyékolás eltérhet), majd éves összegzés | üzemmód-specifikus bemenetek | 2 × 12 havi számítás | 1. függ. 6., 38. o. | – | ugyanazon hónapban Q_F,net > 0 és Q_H,net > 0 is lehet |

### 6.1 Hőátvitel transzmisszióval (TR)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| TR-001 | Direkt transzmissziós hőátviteli tényező külső térrel határos szerkezetekre (részletes hőhíd-kezeléssel) | A_i m², U_i W/m²K, l_k m, Ψ_k W/mK, χ_j W/K | `H_tr,D = Σ_i A_i·U_i + Σ_k l_k·Ψ_k + Σ_j χ_j` | 1. függ. 6.1.1, (6.1) egy., 38. o. | – | 10 m²·0,2 + 5 m·0,1 + 0,05 = 2,55 W/K |
| TR-002 | Opak U a 4.1. szerint (korrekciókkal); nyílászáró és függönyfal U a 4.2. és 4.3. szerint | U | hivatkozás 4.1–4.3 | 1. függ. 6.1.1, 38. o. | (más ágens) | – |
| TR-003 | Kettős számbavétel tilalma: az elem átlagos U-jában már figyelembe vett vonal- és pontszerű hőhidak itt nem vehetők figyelembe | elem-hőhíd jelző | validációs szabály | 1. függ. 6.1.1, 38. o. | – | U_átlag-ot használó elemhez Ψ megadása → figyelmeztetés |
| TR-004 | Fűtési és hűtési módra számított U eltérhet (pl. nyílászáró társított szerkezete) | U_F, U_H | külön U_F, U_H tárolás | 1. függ. 6.1.1, 38. o. | – | H_tr,D,F ≠ H_tr,D,H lehetséges |
| TR-005 | Csatlakozási hőhidak részletes módszerrel: hőhídkatalógus, belső méretek, vagy numerikus modellezés MSZ EN ISO 10211 szerinti modellezési szabályokkal, a (6.1) képlettel (alternatív részletes) | l_k, Ψ_k, χ_j | (6.1) | 1. függ. 6.1.2 a), 39. o. | – | – |
| TR-006 | Csatlakozási hőhidak egyszerűsített módszerrel | A_i m², U_R,i W/m²K | `H_tr = Σ_i A_i·U_R,i` | 1. függ. 6.1.2 b), (6.2) egy., 39. o. | – | – |
| TR-007 | Hőhíddal korrigált hőátbocsátási tényező | U W/m²K, ζ – | `U_R = U·(1 + ζ)` | 1. függ. 6.1.2, (6.3) egy., 39. o. | `modszer/netto_energiaigeny.json#tabla_6_1` | U = 0,24, ζ = 0,15 → U_R = 0,276 |
| TR-008 | ζ kiválasztása szerkezettípus és hőhidasság szerint (6.1. táblázat) | szerkezet, alcsoport, besorolás | táblázat-lookup | 1. függ. 6.1.2, 6.1. táblázat, 39–40. o. | `modszer/netto_energiaigeny.json#tabla_6_1` | külső fal, külső szigetelés, közepesen hőhidas → 0,20; egyéb külső fal erősen → 0,40 |
| TR-009 | Hőhidasság besorolása a hőhidak hosszának fajlagos mennyisége (fm/m²) alapján (tájékoztató) | l/A fm/m² | külső fal: <0,8 gyenge; 0,8–1,0 közepes; >1,0 erős; lapostető: <0,2 / 0,2–0,3 / >0,3; beép. tetőtér: <0,4 / 0,4–0,5 / >0,5 | 1. függ. 6.1.2, 6.2. táblázat, 40. o. | `modszer/netto_energiaigeny.json#tabla_6_2` | külső fal 0,9 fm/m² → közepes; 1,0 → közepes (határ, lásd anomáliák) |
| TR-010 | A fajlagos hossz vonatkoztatási alapjai a 6.1. táblázat 1)–4) lábjegyzete szerint (pl. külső fal: nyílászárókkal együtt vett felület; födém kerülete a külső falaknál belső méretekkel) | hőhíd-hosszak | lábjegyzet-szabályok | 1. függ. 6.1. táblázat lábj., 40. o. | `modszer/netto_energiaigeny.json#tabla_6_1` (megjegyzes) | – |
| TR-011 | Tiltás: ζ nem használható belső oldali hőszigetelés esetén; ilyenkor részletes hőhídmodell vagy szakirodalmi adat javasolt | szigetelés helye | validáció: belső szigetelés + egyszerűsített ζ → hiba | 1. függ. 6.1.2, 39. o. | – | belső szigetelésű fal + ζ → elutasítás |
| TR-012 | Hőhíd-korrekció hatóköre: a külső környezet és a nem kondicionált terek felé irányuló transzmisszióra vonatkozik | határolás típusa | – | 1. függ. 6.1.2, 38. o. | – | – |
| TR-013 | Nem kondicionált térrel határos szerkezetek: b tényezővel módosított transzmisszió | b –, H_tr,ix W/K | `H_tr,x = b·H_tr,ix` | 1. függ. 6.1.3, (6.4) egy., 40. o. | `modszer/netto_energiaigeny.json#tabla_6_3` | b = 0,5, H_tr,ix = 20 → 10 W/K |
| TR-014 | b részletes módszerrel: MSZ EN ISO 13789 szerint (alternatív részletes); fűtetlen naptérnél a b és az indirekt sugárzási nyereség azonos módszerrel | – | – | 1. függ. 6.1.3 a), 40. o. | – | – |
| TR-015 | b egyszerűsített: 6.3. táblázat; októbertől áprilisig b_tél, májustól szeptemberig b_nyár, fűtés és hűtés esetén is | hónap, szerkezet típusa | lookup; m ∈ {10..12,1..4} → b_tél, m ∈ {5..9} → b_nyár | 1. függ. 6.1.3 b), 6.3. táblázat, 40–41. o. | `modszer/netto_energiaigeny.json#tabla_6_3`; `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (b_tel_honapok, b_nyar_honapok) | padlásfödém: jan → 0,9, júl → 0,0; pince júl → 1,5 |
| TR-016 | Az egyszerűsített b alkalmazhatósági feltétele: θ_i,F 18–22 °C, θ_i,H 24–28 °C | θ_i,F, θ_i,H °C | validáció | 1. függ. 6.1.3 b), 40. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (b_egyszerusitett_theta_*) | θ_i,F = 16 °C + táblázati b → hiba |
| TR-017 | Naptér esetén, ha b egyszerűsített módszerrel készül, indirekt sugárzási nyereség nem vehető figyelembe | naptér, b-módszer | validáció: Q_sid = 0 | 1. függ. 6.3. táblázat 1. lábj., 41. o. | `modszer/netto_energiaigeny.json#tabla_6_3` | naptér + táblázati b + Q_sid > 0 → hiba |
| TR-018 | „Hőszigetelő üvegezés” definíció a naptér-sorhoz: legalább kétrétegű, legalább egy low-e bevonat, argon töltés | üvegezés adatai | besorolási szabály | 1. függ. 6.3. táblázat 2. lábj., 41. o. | `modszer/netto_energiaigeny.json#tabla_6_3` | kétrétegű low-e argon nélkül → „kétrétegű” (0,7) |
| TR-019 | Terepszint közelében vagy felett fekvő padló hőátviteli tényezője (állandósult) | A m², U_T,p W/m²K, P m, Ψ_p,f W/mK | `H_tr,T,tp = A·U_T,p + P·Ψ_p,f` | 1. függ. 6.1.4.1, (6.5) egy., 41. o. | `modszer/netto_energiaigeny.json#tabla_6_4` | A = 100, U = 0,3, P = 40, Ψ = 0,15 → 36 W/K |
| TR-020 | U_T,p (talajon fekvő padló egyenértékű U) a 4.4. szerint | – | hivatkozás 4.4 | 1. függ. 6.1.4.1, 41. o. | (más ágens) | – |
| TR-021 | Fűtött pince: pincepadló + pincefal | A m², U_T,p, z m (nincs definiálva, lásd anomáliák), P m, U_T,pf W/m²K, Ψ_p,f | `H_tr,T,p = A·U_T,p + z·P·U_T,pf + P·Ψ_p,f` | 1. függ. 6.1.4.2, (6.6) egy., 41. o. | `modszer/netto_energiaigeny.json#tabla_6_4` | – |
| TR-022 | Pincepadló és pincefal egyenértékű U a 4.4. szerint; a pincefal külső levegővel határos része külső szerkezetként (6.1.1) számítandó | – | szabály | 1. függ. 6.1.4.2, 41. o. | – | félig kiálló pincefal két részre bontva |
| TR-023 | Ψ_p,f részletes: MSZ EN ISO 10211 szerinti numerikus modellezés vagy hőhídkatalógus (alternatív) | – | – | 1. függ. 6.1.4.3 a), 42. o. | – | – |
| TR-024 | Ψ_p,f egyszerűsített: 6.4. táblázat a falazat λ-ja, külső fal kialakítása, lábazati fal és padló szigetelése szerint | λ_falazat W/mK, kialakítás, lábazat, padló | lookup | 1. függ. 6.1.4.3 b), 6.4. táblázat, 42. o. | `modszer/netto_energiaigeny.json#tabla_6_4` | λ > 0,45, külső szig., lábazat szigeteletlen, padló szigetelt → 0,45 |
| TR-025 | „Hőszigetelt” (lábazat/padló) a 6.4. táblázatban: legalább egy R = 1,25 m²K/W ellenállású réteg | R m²K/W | R ≥ 1,25 → „hőszigetelt” | 1. függ. 6.4. táblázat 1. lábj., 42. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (psi_pf_hoszigetelt_R_min) | R = 1,0 → szigeteletlen oszlop |
| TR-026 | Havi transzmissziós hőátvitel zónánként és hónaponként, F/H | H_tr,D,F/H, H_tr,x,F/H, H_tr,T W/K; θ_i,F/H, θ_e,átlag (havi), θ_e,év (éves) °C; Δt h | `Q_tr,F/H = ((ΣH_tr,D,F/H + ΣH_tr,x,F/H)·(θ_i,F/H − θ_e,átlag) + H_tr,T·(θ_i,F/H − θ_e,év))·Δt/1000` [kWh] | 1. függ. 6.1.5, (6.7) egy., 42. o. | θ_e: F2 1.2 éghajlati adatok (a 6. fejezet nem nevezi meg); θ_i: lásd anomáliák | H_D = 100, H_T = 20, θ_i = 20, θ_e = 0, θ_e,év = 10, 744 h → (2000+200)·0,744 = 1636,8 kWh |
| TR-027 | Talaj-tag az éves átlaghőmérséklettel (θ_e,év), nem a havival | θ_e,év | a (6.7) része | 1. függ. 6.1.5, 42. o. | – | θ_e,átlag változtatása H_T-tag eredményét nem módosítja |

### 6.2 Hőátvitel szellőzéssel (SZ)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| SZ-001 | Általános szellőzési hőátviteli tényező zónánként, szellőzési módok (infiltráció, természetes, gépi, éjszakai többlet stb.) szerint összegezve | b_szell,k –, n_k 1/h (havi átlag), V_k m³, Δt_k h, Δt h | `H_szell,F/H = 0,35·Σ_k (b_szell,k·n_k·V_k·Δt_k/Δt)` [W/K] | 1. függ. 6.2.1, (6.8) egy., 42–43. o. | – | n = 0,5, V = 300, Δt_k = Δt, b = 1 → 52,5 W/K |
| SZ-002 | Konstans: levegő térfogati hőkapacitása 0,35 Wh/m³K | – | 0,35 | 1. függ. 6.2.1, 43. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (levego_terfogati_hokapacitas) | – |
| SZ-003 | b_szell,k = 1, ha a szellőző levegő hőmérséklete = külső hőmérséklet | – | b_szell = 1 | 1. függ. 6.2.1, 43. o. | – | – |
| SZ-004 | Minimálisan szükséges légcsereszám a funkciótól függő V̇_LT-ből | V̇_LT m³/h, V m³ | `n_szüks = V̇_LT / V` | 1. függ. 6.2.1, 43. o. | F2 2. pont / 2.1. táblázat (V̇_LT) | V̇_LT = 150, V = 300 → 0,5 1/h |
| SZ-005 | b_szell számítása, ha a befújt levegő hőmérséklete eltér a külsőtől (előfűtés, előhűtés, hővisszanyerés), havi átlagokkal, F/H | θ_i,F/H, θ_bef,F/H, θ_e,átlag °C | `b_szell = (θ_i,F/H − θ_bef,F/H) / (θ_i,F/H − θ_e,átlag)` | 1. függ. 6.2.1, (6.9) egy., 43. o. | – | θ_i = 20, θ_bef = 10, θ_e = 0 → 0,5 |
| SZ-006 | Szomszédos nem kondicionált térből érkező levegő: b_szell = b (6.1.3 szerint) | b | b_szell = b | 1. függ. 6.2.1, 43. o. | `modszer/netto_energiaigeny.json#tabla_6_3` | – |
| SZ-007 | Tiltás: b_szell korrekció (6.9) nem alkalmazható légfűtés vagy léghűtés esetén | rendszertípus | validáció | 1. függ. 6.2.1, 43. o. | – | légfűtés + (6.9) → hiba |
| SZ-008 | Részletes módszerben b_szell,k napszakonként havi bontásban meghatározható; egyszerűsített módszerben általában b = 1 átlagérték (a képletekből elhagyva) | – | b = 1 | 1. függ. 6.2.1, 43. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (b_szell_alapertek_egyszerusitett) | – |
| SZ-009 | Tisztán természetes szellőzésű épület, F/H | n_szüks 1/h, Δt_term h, Δt h, n_filt 1/h, V m³ | `H_szell,F/H = 0,35·(n_szüks·Δt_term/Δt + n_filt)·V` | 1. függ. 6.2.2, (6.10) egy., 43. o. | F2 2.1 (n_szüks), F2 2.4 (n_filt) | n_szüks = 0,5, Δt_term/Δt = 1, n_filt = 0,2, V = 300 → 73,5 W/K |
| SZ-010 | n_filt a 2. Függelék 2.4. táblázata szerint | – | lookup | 1. függ. 6.2.2, 43. o. | F2 2.4. táblázat | – |
| SZ-011 | Ha éjszakai szellőztetés lehetséges, a (6.11) additív tagként hozzáadandó a (6.10)-hez | jelző | H = (6.10) + (6.11) | 1. függ. 6.2.2, 43. o. | – | – |
| SZ-012 | Éjszakai többletszellőztetés csak hűtési módban, májustól szeptemberig, 23–06 óra | hónap, üzemmód | feltétel | 1. függ. 6.2.3, 44. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (ejszakai_*) | fűtési módban / októberben a tag = 0 |
| SZ-013 | Intenzív éjszakai természetes szellőztetés előfeltételei: tűréshatárt meg nem haladó zaj- és porterhelés; nincs vagyonvédelmi kockázat; egyéb rendeltetésnél automatikus ablak/nyílás nyitás-zárás | 3 logikai bemenet | mind igaz → engedélyezett | 1. függ. 6.2.3, 44. o. | – | nem lakó, automatika nélkül → tiltott |
| SZ-014 | Éjszakai szellőzési hőátviteli tényező-növekmény | b_éjjel –, n_éjjel 1/h, V m³ | `H_szell,H,nyár,éjjel = 0,35·(b_éjjel·(7/24)·n_éjjel)·V` [W/K] | 1. függ. 6.2.3, (6.11) egy., 44. o. | F2 2.3. táblázat (n_éjjel) | b = 1,5, n = 2, V = 300 → 91,875 W/K |
| SZ-015 | b_éjjel: (6.9) szerint, vagy egyszerűsítve 1,5 | – | b_éjjel = 1,5 | 1. függ. 6.2.3, 44. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (b_ejjel_egyszerusitett) | – |
| SZ-016 | n_éjjel ablaknyitásos szellőztetésnél a 2. Függelék 2.3. táblázat szerint | – | lookup | 1. függ. 6.2.3, 44. o. | F2 2.3. táblázat | – |
| SZ-017 | Tiltás: ha az éjszakai szellőztetést szellőző rendszer biztosítja, a (6.11) egyszerűsített módszer nem alkalmazható | rendszer | validáció | 1. függ. 6.2.3, 44. o. | – | gépi éjszakai szellőzés + (6.11) → hiba |
| SZ-018 | Gépi szellőzés: általános szabályként a 6.2.1 (6.8) az irányadó; a 6.2.4 képletei egyszerűsített esetek | – | – | 1. függ. 6.2.4, 44. o. | – | – |
| SZ-019 | Lakóépület hővisszanyerős szellőzés vagy központi folyamatos elszívás nélkül: a természetes szellőzés módszere (6.10) alkalmazható | rendeltetés, rendszer | választási szabály | 1. függ. 6.2.4, 44. o. | – | lakás, helyi elszívó → (6.10) |
| SZ-020 | Folyamatos, hővisszanyerős, állandó térfogatáramú, előfűtés/talajhőcserélő nélküli gépi szellőzés, külső beszívás (fűtés) | V̇_LT,friss m³/h, η_r –, n_filt 1/h, V m³ | `H_szell,F = 0,35·(V̇_LT,friss·(1 − η_r) + n_filt·V)` [W/K] | 1. függ. 6.2.4, (6.12) egy., 44. o. | F2 2.1 (V̇_LT), F2 2.4 (n_filt) | V̇ = 150, η = 0,8, n_filt = 0,2, V = 300 → 31,5 W/K |
| SZ-021 | Szakaszos gépi szellőzés, külső beszívás, F/H: természetes + gépi fokozatok + infiltráció | H_term, H_LT,n, H_filt W/K | `H_szell,F/H = Σ (H_term,F/H + Σ_n H_LT,n,F/H + H_filt,F/H)` [W/K] | 1. függ. 6.2.4, (6.13) egy., 44. o. | – | – |
| SZ-022 | Használati időben kikapcsolt gépi szellőzés időszaka: természetes szellőzés tag | n_szüks 1/h, Δt_term h, Δt h, V m³ | `H_term,F/H = 0,35·n_szüks·(Δt_term/Δt)·V` [W/K] | 1. függ. 6.2.4, (6.14) egy., 44. o. | F2 2.1 (n_szüks) | – |
| SZ-023 | Gépi fokozat, alapeset (fűtés vagy hűtés, nincs hővisszanyerő) | V̇_LT,n,friss m³/h, Δt_LT,n h, Δt h | `H_LT,n,F/H = 0,35·V̇_LT,n,friss·Δt_LT,n/Δt` | 1. függ. 6.2.4 A), (6.15) egy., 45. o. | – | 1000 m³/h, 1/3 üzemidő → 116,7 W/K |
| SZ-024 | Egyszerűsített módszernél a hűtési üzemmódot mindig (6.15) szerint kell számolni (hővisszanyerés nélkül) | üzemmód = H | választási szabály | 1. függ. 6.2.4, 45. o. | – | hűtés + η_r = 0,8 → η_r figyelmen kívül |
| SZ-025 | Gépi fokozat hővisszanyerővel (csak fűtés) | + η_r | `H_LT,n,F = 0,35·V̇_LT,n,friss·(Δt_LT,n/Δt)·(1 − η_r)` | 1. függ. 6.2.4 B), (6.16) egy., 45. o. | – | – |
| SZ-026 | Gépi fokozat fagyvédelmi előfűtéssel és hővisszanyerővel (csak fűtés) | V̇_LT,n,friss, Δt, Δt_LT,n, Δt_EF,n,e<−4C h, θ_i,F, θ_e,átlag, θ_e<−4C °C, η_r | `H_LT,n,F = 0,35·(V̇_LT,n,friss/Δt)·( ((Δt_LT,n − Δt_EF,n,e<−4C) + Δt_EF,n,e<−4C·(θ_i,F − (−4))/(θ_i,F − θ_e,átlag))·(1 − η_r) + Δt_EF,n,e<−4C·(−4 − θ_e<−4C)/(θ_i,F − θ_e,átlag) )` | 1. függ. 6.2.4 C), (6.17) egy., 45. o. | F2 1.2.2. pont (θ_e<−4C, Δt_EF) | Δt_EF = 0 → visszaadja a (6.16)-ot |
| SZ-027 | Gépi fokozat talajkollektoros előmelegítéssel és hővisszanyerővel (csak fűtés) | + θ_thcs;F °C (10.1.3) | `H_LT,n,F = 0,35·V̇_LT,n,friss·(Δt_LT,n/Δt)·((θ_i,F − θ_thcs;F)/(θ_i,F − θ_e,átlag))·(1 − η_r)` | 1. függ. 6.2.4 D), (6.18) egy., 45. o. | θ_thcs;F: 1. függ. 10.1.3 | θ_thcs = θ_e,átlag → (6.16) |
| SZ-028 | (6.18) nyári időszakban nem alkalmazható: részletes módszer (hibás kereszthivatkozás „0. pont”), vagy a talajhőcserélő hatása elhanyagolható | hónap/üzemmód | választási szabály | 1. függ. 6.2.4, 45. o. | – | hűtési mód + talajkollektor → θ_thcs hatás nélkül |
| SZ-029 | Infiltrációs (tömítetlenségi) tag | n_filt 1/h, V m³ | `H_filt,F/H = 0,35·n_filt·V` | 1. függ. 6.2.4, (6.19) egy., 45. o. | F2 2.4. táblázat | n = 0,2, V = 300 → 21 W/K |
| SZ-030 | Ha éjszaka a gépi rendszer nem működik, de természetes éjszakai szellőztetés lehetséges, a (6.11) többlet figyelembe vehető | jelzők | H += (6.11) | 1. függ. 6.2.4, 45. o. | – | – |
| SZ-031 | Havi szellőzési hőátvitel (érezhető hányad), zónánként és hónaponként, F/H | H_szell,F/H W/K, θ_i,F/H, θ_e,átlag °C, Δt h | `Q_szell,F/H = Σ H_szell,F/H·(θ_i,F/H − θ_e,átlag)·Δt/1000` [kWh] | 1. függ. 6.2.5, (6.20) egy., 46. o. | – | H = 52,5, ΔT = 20, 744 h → 781,2 kWh |

### 6.3–6.4 Szoláris és belső nyereségek (NY)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| NY-001 | Szoláris nyereség zónánként, hónaponként, F/H | Q_sd, Q_sid kWh | `Q_s,F/H = Q_sd,F/H + Q_sid,F/H` | 1. függ. 6.3, (6.21) egy., 46. o. | – | – |
| NY-002 | Direkt szoláris nyereség transzparens szerkezetekre | A_ü,i m², g_F/H,i –, g_árny,H,i –, F_árny,i –, G_s,i kWh/m² | `Q_sd,F/H = Σ_i A_ü,i·g_F/H,i·g_árny,H,i·F_árny,i·G_s,i` [kWh] | 1. függ. 6.3.1, (6.22) egy., 46. o. | G_s: F2 1.2.4. pont | 2 m²·0,5·1·1·50 = 50 kWh |
| NY-003 | Üvegezett terület keretarányból (vagy geometriából) | A_nyz m², F_keret – | `A_ü = A_nyz·(1 − F_keret)` | 1. függ. 6.3.1, (6.23) egy., 46. o. | `modszer/netto_energiaigeny.json#keretarany_alapertekek` | A_nyz = 2, F = 0,3 → 1,4 m² |
| NY-004 | Keretarány alapértékek pontosabb adat hiányában: általában 30%; régi (1990 előtti) 25%; felülvilágító, vékony télikert 10%; kisméretű (< 0,5 m²) 50% | nyílászáró jellemzők | lookup | 1. függ. 6.3.1, 46. o. | `modszer/netto_energiaigeny.json#keretarany_alapertekek` | 0,4 m² ablak → 0,5 |
| NY-005 | Összesített sugárzásátbocsátás (beesési szöggel) | F_ü –, g_n – | `g_F/H = F_ü·g_n` | 1. függ. 6.3.1, (6.24) egy., 46. o. | F2 4.1. táblázat (g_n, tájékoztató) | g_n = 0,6 → 0,54 |
| NY-006 | F_ü alapértéke 0,9 | – | F_ü = 0,9 | 1. függ. 6.3.1, 46. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (F_u_…) | – |
| NY-007 | Társított (napvédő) szerkezet: hűtési módban g_árny,H figyelembe vehető (F2 4.5. táblázat, tájékoztató); fűtés esetén g_árny,F = 1 | g_árny,H | F: 1; H: lookup | 1. függ. 6.3.1, 47. o. | F2 4.5. táblázat; `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (g_arny_F) | fűtési módban redőny megadása nem változtat |
| NY-008 | Külső akadályok miatti árnyékoltság részletes: MSZ EN (ISO) 52016-1 szerinti módszer vagy egyenértékű többdimenziós benapozásvizsgálat (alternatív) | – | – | 1. függ. 6.3.1 a), 47. o. | – | – |
| NY-009 | Árnyékoltság egyszerűsített: horizont × vízszintes × függőleges árnyékvető tényezők | F_h, F_v, F_f – | `F_árny = F_h·F_v·F_f` | 1. függ. 6.3.1 b), (6.25) egy., 47. o. | F2 1.3. pont (F_h, F_v, F_f tájolás és hajlásszög szerint) | 0,9·0,8·1 = 0,72 |
| NY-010 | F_h geometriája: árnyékvető magassága az üvegezés alsó síkjától, távolság az üvegezés síkjától | geometria | lookup bemenet | 1. függ. 6.3.1, 47. o. | F2 1.3 | – |
| NY-011 | F_v geometriája: távolság az üvegezés felső síkjától és az üvegezés síkjától | geometria | lookup bemenet | 1. függ. 6.3.1, 47. o. | F2 1.3 | – |
| NY-012 | F_f geometriája: távolság az üvegezés oldalsó síkjától és az üvegezés síkjától | geometria | lookup bemenet | 1. függ. 6.3.1, 47. o. | F2 1.3 | – |
| NY-013 | Hűtés: biztonság javára közelítés az árnyékoltsági korrekciós tényezők elhagyása (F_árny = 1) | üzemmód = H | F_árny = 1 megengedett | 1. függ. 6.3.1, 47. o. | – | – |
| NY-014 | Hűtés: dőlt síkú nyílászárónál csak F_h; egyéb esetben F_h, F_v, F_f közül csak „a legnagyobb” vehető figyelembe (ha van ilyen árnyékvető) | F_h, F_v, F_f, dőlés | dőlt: F_árny,H = F_h; egyéb: F_árny,H = egyetlen tényező (lásd anomáliák) | 1. függ. 6.3.1, 47. o. | – | – |
| NY-015 | Árnyékoltsági vizsgálat elhagyható, ha fűtésnél az északi tájolású, hűtésnél zavartalan benapozással az adott tájolású sugárzási energiahozammal számolunk | G_s (É) | F: G_s,i := G_s,É, F_árny = 1; H: F_árny = 1 | 1. függ. 6.3.1, 47. o. | F2 1.2.4 | déli ablak fűtésben árnyékolás nélkül → G_s,É |
| NY-016 | Opak szerkezetek szoláris nyeresége és az égbolt felé hosszúhullámú lesugárzás elhanyagolható; nagy pontosság esetén MSZ EN ISO 52016-1 (alternatív) | – | 0 | 1. függ. 6.3.1, 47. o. | – | – |
| NY-017 | Indirekt sugárzási nyereség (csatlakozó üvegház, energiagyűjtő fal) részletes: MSZ EN ISO 52016-1 vagy egyenértékű (alternatív) | – | – | 1. függ. 6.3.2 a), 47. o. | – | – |
| NY-018 | Indirekt nyereség egyszerűsített: a számítás elhagyható (Q_sid = 0) | – | Q_sid = 0 | 1. függ. 6.3.2 b), 47. o. | – | – |
| NY-019 | Belső hőnyereség zónánként, hónaponként, F/H | A_N m², q_b W/m², Δt h | `Q_b,F/H = A_N·q_b·Δt/1000` [kWh] | 1. függ. 6.4, (6.26) egy., 48. o. | F2 2.1. táblázat (q_b) | 100 m², 5 W/m², 744 h → 372 kWh |
| NY-020 | q_b lakóépületnél kötelezően a 2. Függelék 2.1. táblázat szerint | rendeltetés = lakó | lookup | 1. függ. 6.4, 48. o. | F2 2.1. táblázat | – |
| NY-021 | Más funkcióknál (referenciaépület módszer) q_b a tényállapot szerint (nettó alapterületre vetített időátlag) vagy a F2 2.1. táblázat ajánlott értéke | rendeltetés ≠ lakó | választás | 1. függ. 6.4, 48. o. | F2 2.1. táblázat | – |
| NY-022 | Belső hőnyelők negatív előjellel (pl. gépek, áruk által elvont hő) | q_b,nyelő | q_b lehet negatív összetevőjű | 1. függ. 6.4, 48. o. | – | negatív q_b-hez a γ ≤ 0 ágak tesztje |

### 6.5–6.10 Hőmérleg, időállandó, hasznosítás, nettó igény (NET)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| NET-007 | Teljes hőveszteség fűtésnél (szakaszos üzem nélkül) | Q_tr,F, Q_szell,F kWh | `Q_veszt = ΣQ_tr,F + ΣQ_szell,F` | 1. függ. 6.5, (6.27) egy., 48. o. | – | – |
| NET-008 | Teljes hőleadás hűtésnél | Q_tr,H, Q_szell,H kWh | `Q_lead = ΣQ_tr,H + ΣQ_szell,H` | 1. függ. 6.5, (6.28) egy., 48. o. | – | – |
| NET-009 | Teljes hőnyereség fűtésnél | Q_s,F, Q_b,F kWh | `Q_nyer = ΣQ_s,F + ΣQ_b,F` | 1. függ. 6.5, (6.29) egy., 48. o. | – | – |
| NET-010 | Teljes hőterhelés hűtésnél | Q_s,H, Q_b,H kWh | `Q_terh = ΣQ_s,H + ΣQ_b,H` | 1. függ. 6.5, (6.30) egy., 48. o. | – | – |
| NET-011 | Hőmérleg-arány fűtés | Q_nyer, Q_veszt | `γ_F = Q_nyer / Q_veszt` | 1. függ. 6.5, (6.31) egy., 48. o. | – | 500/1000 → 0,5 |
| NET-012 | Hőmérleg-arány hűtés | Q_terh, Q_lead | `γ_H = Q_terh / Q_lead` | 1. függ. 6.5, (6.32) egy., 48. o. | – | – |
| NET-013 | Szakaszos fűtési üzem (éjszakai, hétvégi leszabályozás) a hőveszteségben | σ_F –, Q_tr,F, Q_szell,F | `Q_veszt = σ_F·(Q_tr,F + Q_szell,F)` | 1. függ. 6.5.1, (6.33) egy., 48. o. | F2 2.5. táblázat (σ_F) | σ_F = 0,9 → Q_veszt 10%-kal kisebb; γ_F is ebből számol |
| NET-014 | σ_F részletes: MSZ EN ISO 52016-1 (alternatív); egyszerűsített: F2 2.5. táblázat, rendeltetés szerint | rendeltetés | lookup | 1. függ. 6.5.1, 49. o. | F2 2.5. táblázat | – |
| NET-015 | C_m,eff részletes: MSZ EN ISO 52016-1 és MSZ EN ISO 13786 (alternatív) | – | – | 1. függ. 6.6 a), 49. o. | – | – |
| NET-016 | C_m,eff egyszerűsített: 6.5. táblázat kategóriája × hasznos alapterület | kategória 1–4, A_N m² | `C_m,eff = (C_m,eff/A_N)_tábla · A_N` [kJ/K]; 95 / 190 / 280 / 560 kJ/m²K | 1. függ. 6.6 b), 6.5. táblázat, 49. o. | `modszer/netto_energiaigeny.json#tabla_6_5` | nehéz épület, 100 m² → 28 000 kJ/K |
| NET-017 | Kategória-besorolás feltételei (testsűrűség ≥ 600 / ≥ 1600 kg/m³, álmennyezet/álpadló, belső szigetelés, belmagasság < 4,5 m; nagy belmagasság → 2. kategória) | szerkezeti jellemzők | szabályalapú besorolás | 1. függ. 6.5. táblázat, 49. o. | `modszer/netto_energiaigeny.json#tabla_6_5` | tornacsarnok → 190 |
| NET-018 | Időállandó F/H | C_m,eff kJ/K; H_tr,F/H (talaj nélkül), H_tr,T, H_szell,F/H W/K | `τ_F/H = (C_m,eff/3,6) / (ΣH_tr,F/H + H_tr,T + ΣH_szell,F/H)` [h] | 1. függ. 6.6, (6.34) egy., 49. o. | – | 28 000 kJ/K, ΣH = 200 W/K → 38,9 h |
| NET-019 | Fűtési numerikus tényező | τ_F h, a_F,0 = 1,0, τ_F,0 = 15 h | `a_F = a_F,0 + τ_F/τ_F,0` | 1. függ. 6.7.1, (6.39) egy., 50. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (a_F0, tau_F0) | τ = 30 h → a_F = 3 |
| NET-020 | Fűtési hasznosítási tényező, γ_F > 0 és γ_F ≠ 1 | γ_F, a_F | `η_F = (1 − γ_F^a_F) / (1 − γ_F^(a_F+1))` | 1. függ. 6.7.1, (6.35) egy., 50. o. | – | γ = 0,5, a = 3 → 0,875/0,9375 = 0,9333 |
| NET-021 | Fűtési hasznosítási tényező, γ_F = 1 | a_F | `η_F = a_F / (a_F + 1)` | 1. függ. 6.7.1, (6.36) egy., 50. o. | – | a = 3 → 0,75; folytonosság γ→1 |
| NET-022 | γ_F ≤ 0 és Q_nyer,F > 0 | γ_F | `η_F = 1/γ_F` | 1. függ. 6.7.1, (6.37) egy., 50. o. | – | γ = 0 eset kezelése (osztás nullával) – lásd anomáliák |
| NET-023 | γ_F ≤ 0 és Q_nyer,F ≤ 0 | – | `η_F = 1` | 1. függ. 6.7.1, (6.38) egy., 50. o. | – | Q_nyer = 0 → η = 1 |
| NET-024 | Havi nettó fűtési hőenergia-igény zónánként | Q_veszt, η_F, Q_nyer kWh | `Q_F,net = Q_veszt − η_F·Q_nyer` | 1. függ. 6.7.2, (6.40) egy., 50. o. | – | 1000 − 0,9333·500 = 533,3 kWh |
| NET-025 | Q_F,net = 0, ha a) γ_F ≤ 0 és Q_nyer > 0; b) γ_F > 2,0; c) Q_F,net < 0 | γ_F, Q_nyer, Q_F,net | nullázó szabály | 1. függ. 6.7.2, 50. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (gamma_F_max_futesi_igenyhez) | γ = 2,1 → 0 (a (6.40) pozitív eredménye ellenére is) |
| NET-026 | Éves nettó fűtési igény | Q_F,net,m | `Q_F,net,év = Σ_{m=1..12} Q_F,net,m`; épület = Σ zónák | 1. függ. 6.7.2, (6.41) egy., 50. o. | – | – |
| NET-027 | Fajlagos nettó fűtési igény | Q_F,net kWh/a, A_N m² | `q_F,net = Q_F,net / A_N` [kWh/m²a] | 1. függ. 6.7.3, (6.42) egy., 50. o. | – | 5000/100 → 50 |
| NET-028 | Hűtési numerikus tényező | τ_H h, a_H,0 = 1,0, τ_H,0 = 15 h | `a_H = a_H,0 + τ_H/τ_H,0` | 1. függ. 6.8.1, (6.46) egy., 51. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (a_H0, tau_H0) | – |
| NET-029 | Hűtési hasznosítási tényező, γ_H > 0 és γ_H ≠ 1 | γ_H, a_H | `η_H = (1 − γ_H^(−a_H)) / (1 − γ_H^(−(a_H+1)))` | 1. függ. 6.8.1, (6.43) egy., 50. o. | – | γ = 2, a = 3 → 0,875/0,9375 = 0,9333 |
| NET-030 | γ_H = 1 | a_H | `η_H = a_H / (a_H + 1)` | 1. függ. 6.8.1, (6.44) egy., 50. o. | – | – |
| NET-031 | γ_H ≤ 0 | – | `η_H = 1` | 1. függ. 6.8.1, (6.45) egy., 51. o. | – | – |
| NET-032 | Havi nettó hűtési hőenergia-igény (folyamatos üzem) | Q_terh, η_H, Q_lead kWh | `Q_H,net = Q_terh − η_H·Q_lead` | 1. függ. 6.8.2, (6.47) egy., 51. o. | – | Q_terh = 1000, Q_lead = 500, γ = 2, a = 3 → 1000 − 0,9333·500 = 533,3 |
| NET-033 | Q_H,net = 0, ha a) 1/γ_H > 2,0; b) Q_H,net < 0 | γ_H | nullázó szabály | 1. függ. 6.8.2, 51. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (inv_gamma_H_max_hutesi_igenyhez) | γ_H = 0,4 → 0 |
| NET-034 | Szakaszos hűtési üzem: korrekció a nettó igényen | σ_H –, Q_H,net,folyt kWh | `Q_H,net,szakaszos = σ_H·Q_H,net,folyt` | 1. függ. 6.8.3, (6.49) egy., 51. o. | F2 2.5. táblázat (σ_H) | – |
| NET-035 | σ_H részletes: MSZ EN ISO 52016-1 (alternatív); egyszerűsített: F2 2.5. táblázat | – | lookup | 1. függ. 6.8.3, 51. o. | F2 2.5. táblázat | – |
| NET-036 | Éves nettó hűtési igény (zónák és hónapok összege) | Q_H,net,m | `Q_H,net,év = Σ_{m=1..12} Q_H,net,m` | 1. függ. 6.8.2–6.8.3, (6.48) = (6.50) egy., 51. o. | – | – |
| NET-037 | Fajlagos nettó hűtési igény | Q_H,net, A_N | `q_H,net = Q_H,net / A_N` | 1. függ. 6.8.4, (6.51) egy., 51. o. | – | – |
| NET-038 | Látens igény (gépi szárítás/nedvesítés): külön számítandó, MSZ EN ISO 52016-1 vagy egyenértékű módszerrel; külső páratartalom: F2 1.2.3; nem része a nettó fűtési igénynek, de a vég- és primerenergiában szerepel | Q_szárítás,nedvesítés | külön tétel | 1. függ. 6.9, 51–52. o. | F2 1.2.3. pont | Q_F,net nem tartalmazza |
| NET-039 | Gépi hűtés látens igénye egyszerűsített módszerben nem számolandó külön → végsőenergia-korrekció (11.1.1) | – | – | 1. függ. 6.9, 52. o. | (11.1.1, más ágens) | – |
| NET-040 | Ha a hűtés látens igénye MSZ EN ISO 52016-1 szerint számított, a 11.1.1 látens korrekciós tényezőt nem szabad alkalmazni (kettős számbavétel tilalma) | jelző | validáció | 1. függ. 6.9, 52. o. | – | mindkettő bekapcsolva → hiba |
| NET-041 | Számítási időszak havi módszerben = az adott hónap hossza; fűtésnél a Q_F,net > 0, hűtésnél a Q_H,net > 0 hónapok számítanak | hónap napjai | Δt = napok·24 h | 1. függ. 6.10.1, 52. o. | – | jan → 744 h, febr → 672 h |
| NET-042 | Fűtési (hűtési) idény hossza: a pozitív igényű hónapok napjainak összege, az első és utolsó hónap csak 15 nappal | havi Q_net | `idény = 15 + Σ(közbenső hónapok napjai) + 15` | 1. függ. 6.10.1, 52. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (idenyhossz_szelso_honap_napok) | okt–ápr → 15+30+31+31+28+31+15 = 181 nap |
| NET-043 | Hosszú szünet (min. egy hét): ha a hőtermelők üzemelnek, két számítás (normál és szüneti mód, pl. csökkentett θ_i, kisebb q_b); ha nem üzemelnek, Q_net,szün = 0 | Δt_szün, Δt, Q_net,norm, Q_net,szün | `Q_net,F/H = (1 − Δt_szün/Δt)·Q_net,norm,F/H + (Δt_szün/Δt)·Q_net,szün,F/H` | 1. függ. 6.10.2, (6.52) egy., 52. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (hosszu_szunet_min_hossz) | júl, 2 hét szünet, rendszer ki → Q·(1 − 336/744) |

### 6.11 Fajlagos hőveszteség-tényező (QM)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| QM-001 | Fajlagos hőveszteség-tényező: transzmisszió és a hasznosított (passzív) sugárzási nyereség algebrai összege egységnyi hőmérsékletkülönbségre és fűtött térfogatra | V m³, Δt h, Q_tr,F, Q_sd,F, Q_sid,F kWh, η_F, θ_i,F, θ_e,átlag °C | `q = (1000/(V·Δt))·Σ_{m=nov..márc} (Q_tr,F − η_F·(Q_sd,F + Q_sid,F)) / (θ_i,F − θ_e,átlag)` [W/m³K] | 1. függ. 6.11, (6.53) egy., 52. o. | – | – |
| QM-002 | Összegzés november–március; Δt = 3624 h (konstans, nem a hónapok tényleges óraszáma szökőévben sem) | – | Δt = 3624 h (= 151 nap·24) | 1. függ. 6.11, 52. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (qm_delta_t, qm_osszegzes_honapok) | – |
| QM-003 | A q-ban csak a szoláris nyereség szerepel (belső nyereség nem), a havi η_F-fel súlyozva | η_F (havi, NET-020..023) | – | 1. függ. 6.11, 52. o. | – | q_b változtatása q-t csak η_F-en keresztül módosítja |

### 6.12 Fűtési hőszükséglet becslése a lefedési arányokhoz (HSZ)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HSZ-001 | Becsült fűtési hőszükséglet (lefedési arányokhoz) | H_tr,F, H_szell,F W/K, ϑ_i,F °C | `Q_F,o = (H_tr,F + H_szell,F)·(ϑ_i,F − ϑ_e,o)` [W] | 1. függ. 6.12, (6.54) egy., 53. o. | – | H = 200 W/K, ϑ_i = 20 → 6600 W |
| HSZ-002 | Méretezési külső hőmérséklet | – | `ϑ_e,o = −13 °C` | 1. függ. 6.12, (6.55) egy., 53. o. | `modszer/netto_energiaigeny.json#alapertekek_6_fejezet` (theta_e_o) | – |
| HSZ-003 | Tiltás: a képlet nem használható rendszerméretezésre | – | UI-figyelmeztetés / felhasználás korlátozása | 1. függ. 6.12, 53. o. | – | – |


## M3. Épülettechnikai rendszerek alapelvei és a fűtési rendszer (1. Függelék 7–8. fejezet)

### 7. Az épülettechnikai rendszerek számításának alapelvei (RA)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| RA-001 | Alrendszerekre bontás: az épülettechnikai rendszert alrendszerenként külön kell számolni | zónák/helyiségek bemenő adatai | Külön alrendszer, ha jelentős eltérés van (pl. eltérő nettó igény, energiahordozó, hőtermelő vagy hőleadó típus) | 1. függ. 7. fej., 54. o. | – | Két lakás eltérő hőtermelővel → 2 alrendszer jön létre |
| RA-002 | Bivalens/multivalens rendszer elemei külön alrendszerként | hőtermelők listája | Minden bivalens/multivalens elem = külön alrendszer | 1. függ. 7. fej., 54. o. | – | Hőszivattyú + gázkazán → 2 alrendszer |
| RA-003 | Több hőtermelős rendszer: bevitt energiák arányának meghatározása a legkedvezőbb, ténylegesen megvalósítható üzemvitel szerint (akkor is, ha a fogyasztók nem úgy használják) | energiaigény, részrendszerek max. teljesítménye, terhelésfüggő hatásfokok | Választási szabály: a lehetséges üzemmódok (alternatív/párhuzamos) közül a legjobb eredményt adót kell választani; szükség esetén terhelési periódusokra bontva | 1. függ. 7. fej., 54. o. | – | Alternatív vs. párhuzamos üzem: a kisebb végenergiát adó változat kerül eredménybe |
| RA-004 | Bivalens/multivalens lefedési arányok: külső hőmérséklet (hőfokgyakorisági diagram) adatai | θe hőfokgyakoriság | Adatok: 2. Függelék 1.2.1. pont | 1. függ. 7. fej., 54. o. | (2. Függelék 1.2.1 – más feladat JSON-ja) | Hőfokgyakorisági adatsor betöltése a 2. függ.-ből |
| RA-005 | Tisztán fűtési bivalens hőtermelés: a hőtermelők névleges teljesítménye és a becsült fűtési hőszükséglet alapján meghatározandó, milyen külső hőmérsékletig fedezi az egyes hőtermelő az igényt | Φ_n,i [kW], becsült fűtési hőszükséglet, θe | Bivalencia-pont meghatározás; alatta mérlegelendő: alternatív (másik hőtermelő veszi át) vagy párhuzamos (belép a csúcshőtermelő) üzem | 1. függ. 7. fej., 54. o. | – | Hőszivattyú bivalencia-pontja −5 °C → az alatti órák a csúcskazánra/párhuzamosra |
| RA-006 | Lefedési arányok hőmérsékletenként külön meghatározva, hőfokgyakorisággal súlyozva | arány(θe), gyakoriság(θe) | arány_i = Σ_θ (arány_i(θ) · gyakoriság(θ)) / Σ_θ gyakoriság(θ) (a módszer csak szövegesen írja le: „hőfokgyakorisággal súlyozni kell”) | 1. függ. 7. fej., 54. o. | – | Két hőmérsékleti osztály, kézi súlyozott átlag egyezik |
| RA-007 | Ha a fűtési rendszer HMV-t is ellát, a HMV energiaigényét is figyelembe kell venni a lefedési arányokhoz | Q_HMV | Szabály | 1. függ. 7. fej., 54. o. | – | Kombi rendszernél az arány változik a HMV-vel |
| RA-008 | Túlméretezés hatásfokra gyakorolt hatása: csak részletes módszerrel vehető figyelembe (részterhelési hatásfokok és üzemidők alapján) | η(részterhelés), üzemidők | Opcionális részletes módszer | 1. függ. 7. fej., 54. o. | – | Egyszerűsített módszerben nincs túlméretezési korrekció |
| RA-009 | Alulméretezett fűtési rendszer: a nettó fűtési igény nem fedezhető hányadát direkt hálózati elektromos hőtermelés fedezi | Q_F,net nem fedezett része [kWh] | εF = 1 (villamos energia) | 1. függ. 7. fej., 54. o. | modszer/futes.json#alapertekek_7_8 (eps_F_alulmeretezett_direkt_elektromos) | Alulméretezett kazán: a hiányzó 10% villamos εF=1-gyel jelenik meg |
| RA-010 | Alulméretezett HMV-rendszer: ugyanez az eljárás | Q_HMV nem fedezett része | εF = 1, villamos | 1. függ. 7. fej., 54. o. | modszer/futes.json#alapertekek_7_8 | – |
| RA-011 | Alulméretezett gépi hűtés: a nem fedezett hűtési igényt nem kell figyelembe venni | Q_H nem fedezett része | 0 | 1. függ. 7. fej., 54. o. | – | – |
| RA-012 | Alulméretezett gépi szellőzés: a nem fedezett frisslevegő-igényt természetes szellőzéssel kell számolni | frisslevegő-igény | természetes szellőzés feltételezése | 1. függ. 7. fej., 54. o. | – | – |
| RA-013 | Elégtelen beépített világítás: a meglévővel azonos típusú világítással kell számolni az igény fedezésére | világítási igény | azonos típus feltételezése | 1. függ. 7. fej., 54. o. | – | – |
| RA-014 | Erősen kapcsolt kondicionálatlan tér: a kondicionált tér épülettechnikai rendszere kiterjed rá | tér besorolása | Szabály | 1. függ. 7. fej., 54. o. | – | – |
| RA-015 | Energiafelhasználás és veszteségek energiahordozónként, végenergiában; összegzés energiahordozónként (primerenergia és CO2 alapja) | végenergia energiahordozónként | Szabály | 1. függ. 7. fej., 54. o. | – | Gáz és villany külön összeg |
| RA-016 | Megújuló energiát használó rendszerelemek: energiahordozónként és komponensenként külön számolandók: (1) épületben hasznosított passzív megújuló (külön: nettó igénynél már figyelembe vett / csak gépészetnél számított); (2) helyben termelt és felhasznált aktív; (3) helyben termelt és hálózatba táplált / átadott aktív; (4) közelben termelt és felhasznált (14.3); (5) távolban termelt és felhasznált (14.3) | megújuló komponensek | Felbontási szabály (5 komponens) | 1. függ. 7. fej., 55. o. | – | Napkollektor hozam a (2) komponensben jelenik meg |
| RA-017 | Egyszerűsített és részletes módszer választható; a részletes módszerek egy része EPB szabványokon alapul | – | Választási szabály | 1. függ. 7. fej., 55. o. | – | – |
| RA-018 | EPB részletes módszernél a visszanyert/visszanyerhető veszteségek a nettó igényből levonandók, de ekkor a belső hőterhelést is az EPB szabványrendszer ajánlásai szerint kell felvenni | Q_visszanyerhető, q_b | Feltételes szabály (konzisztencia-ellenőrzés) | 1. függ. 7. fej., 55. o. | – | Részletes módszer + egyszerűsített q_b kombináció → validációs hiba |
| RA-019 | Egyszerűsített számítás szezonális: a havi nettó fűtési/hűtési igényeket éves szintre kell összegezni | Q_F,net,hó [kWh] | Q_F,net = Σ_hó Q_F,net,hó | 1. függ. 7. fej., 55. o. | – | 12 havi érték összege |
| RA-020 | Részletes módszer/dinamikus szimuláció: bármilyen számítási időegység alkalmazható | – | Szabály | 1. függ. 7. fej., 55. o. | – | – |
| RA-021 | Egyszerűsített táblázatok fajlagos értékei rendszeralapterületre vetítettek; szorozni kell a rendszer alapterületével | érték/A_rszr, A_rszr [m2] | X = (X/A_rszr)_tábla · A_rszr | 1. függ. 7. fej., 55. o. | modszer/futes.json (8.1, 8.2, 8.4, 8.8, 8.9, 8.15, 8.16, 8.17) | 8.8 tábla 200 m2, 90/70: 8,5·200 = 1700 kWh/év |
| RA-022 | Köztes alapterület: lineáris interpoláció | A_rszr, táblázati pontok | y = y1 + (y2 − y1)·(A − A1)/(A2 − A1) | 1. függ. 7. fej., 55. o. | modszer/futes.json (alapterületes táblák) | 8.1 tábla, 125 m2, kondenz.: (1,05+1,05)/2 = 1,05; állandó: (1,38+1,33)/2 = 1,355 |
| RA-023 | Bivalens/multivalens zóna: az alrendszer fajlagos értékeit a fedezett nettó igény hányadával csökkenteni kell | arány_i [-] | X_i = X_tábla · A_rszr · arány_i | 1. függ. 7. fej., 55. o. | – | 60/40% megosztásnál az elosztási veszteség 60%-a az 1. alrendszeré |
| RA-024 | Eltérő méretezési hőfoklépcső: a közepes hőmérsékletkülönbségre viszonyított lineáris interpoláció | t_e/t_v [°C], belső hőm. | Interpolációs változó: közepes hőmérsékletkülönbség; pontos definíció (számtani/logaritmikus, viszonyítási belső hőmérséklet) a módszerben NINCS megadva → nyitott kérdés | 1. függ. 7. fej., 55. o. | modszer/futes.json#tabla_8_8, 8_9, 8_15, 8_16, 8_5 | 80/60 °C a 90/70 és 70/55 között |
| RA-025 | A hőtermelők teljesítménytényezői égéshőre vonatkoztatottak | – | Konvenció | 1. függ. 7. fej., 55. o. | modszer/futes.json#alapertekek_7_8 (megjegyzés) | Fűtőértékes katalógusadat átszámítása szükséges |

### 8.1–8.2 Fedezett nettó igény, végső fogyasztás (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-001 | Alrendszerek energiafelhasználása külön-külön, a végén energiahordozónként összegezve; lefedési arányok a 7. pont szerint | alrendszerek | Szabály | 1. függ. 8.1, 56. o. | – | – |
| FUT-002 | Légfűtés ismert befúvási hőmérséklettel: a légfűtés által fedezett energiaigény a 10.1.2. pont szerint | θ_befúvás | Hivatkozás 10.1.2-re | 1. függ. 8.1, 56. o. | – | – |
| FUT-003 | Fűtési alrendszer nettó igénye léghevítő esetén | Q_F,net [kWh/év vagy kWh/időszak], Q_F,LT [kWh] | (8.1) Q_F,net,FR = Q_F,net − Q_F,LT | 1. függ. 8.1, (8.1) egy., 56. o. | – | 10000 − 3000 = 7000 kWh/év |
| FUT-004 | Ha az alapfűtést nem légfűtés biztosítja: először az alapfűtés (pl. padlófűtés) által fedezett hányadot kell meghatározni; a szabályozási beállítások közül a legjobb eredményt adót kell megtalálni | – | Választási szabály | 1. függ. 8.1, 56. o. | – | – |
| FUT-005 | Negatív Q_F,net,FR: a befúvási hőmérsékletet csökkenteni kell, amíg az érték legalább zérus; ha komfort miatt nem csökkenthető, akkor is Q_F,net,FR = 0 | Q_F,net,FR | Q_F,net,FR = max(0, Q_F,net − Q_F,LT) (a befúvási hőmérséklet-korrekció mellett) | 1. függ. 8.1, 56. o. | – | Q_F,LT > Q_F,net → 0 és figyelmeztetés |
| FUT-006 | Fűtés végső hőenergia-igénye energiahordozónként (j) | Q_F,net,FR, ε_F,szab [-], Q_F,száll, Q_F,tár [kWh], ε_F [-] | (8.2) Q_F,vég,j = Σ( (Q_F,net,FR · ε_F,szab + Q_F,száll + Q_F,tár) · ε_F ) | 1. függ. 8.2, (8.2) egy., 56. o. (PDF-képen ellenőrizve: az ε_F a zárójelen kívül, a szumma tagjain belül) | – | 7000·1,083 + 800 + 50 = 8431; ·1,05 = 8852,6 kWh/év |
| FUT-007 | A (8.2) szumma: különböző, azonos energiahordozójú zónák és egy zónán belüli több, azonos energiahordozójú rendszer energiamennyiségeit összegezni kell | zónák, rendszerek | Összegzési szabály | 1. függ. 8.2, 56. o. | – | 2 zóna gázkazánnal → 1 gáz-összeg |
| FUT-008 | Fűtés villamos segédenergia-igénye | W_F,sziv, W_F,tár, W_F,term [kWh/év vagy kWh/időszak] | (8.3) W_F,vég = Σ(W_F,sziv + W_F,tár + W_F,term) | 1. függ. 8.2, (8.3) egy., 56. o. | – | 300 + 20 + 100 = 420 kWh/év |
| FUT-009 | (8.3) szumma: zónák és egy zónán belüli több rendszer segédenergiái összegzendők | – | Összegzési szabály | 1. függ. 8.2, 56. o. | – | – |

### 8.3.1 Kazánok (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-010 | Módszerválasztás kazánra: ha ErP (2010/30/EU) és 811/2013/EU rendelet hatálya alá tartozik és nem elektromos üzemű → 8.3.1.1 kötelező (pl. ≤400 kW helyiségfűtő és kombinált fűtőberendezés, ≤70 kW helyiségfűtő, 2015.09.26. után forgalomba hozva; a felsorolás nem teljes körű) | ErP-besorolás, P_n [kW], forgalomba hozatal dátuma | Választási szabály | 1. függ. 8.3.1.1, 57. o. | modszer/futes.json#alapertekek_7_8 (ErP_kazan_hatar_kW_1/2) | 24 kW, 2018-as kondenzációs kazán → ErP ág |
| FUT-011 | ErP kazán teljesítménytényezője | η_s [-] (energiacímke, égéshővel) | (8.4) ε_F = 1/η_s | 1. függ. 8.3.1.1, (8.4) egy., 57. o. | – | η_s = 0,93 → ε_F = 1,0753 |
| FUT-012 | ErP kazán: helyette részletes módszer alkalmazható, a 8.3.1.2 szerinti egyszerűsített nem | – | Tiltó szabály | 1. függ. 8.3.1.1, 57. o. | – | ErP kazánnál a 8.1 tábla választása → validációs hiba |
| FUT-013 | ErP kazán: villamos segédenergiát nem kell figyelembe venni | – | W_F,term = 0 | 1. függ. 8.3.1.1, 57. o. | – | – |
| FUT-014 | Nem-ErP kazán: a teljesítménytényezőhöz azt az alapterületet kell figyelembe venni, amelynek fűtésére a berendezés szolgál (társasháznál lakásonkénti/helyiségenkénti hőtermelők!) | A_rszr [m2] | A_rszr = a hőtermelő által fűtött alapterület | 1. függ. 8.3.1.2, 57. o. | – | 10 lakásos ház 60 m2-es lakásonkénti kazánnal → A_rszr = 60 (nem 600) |
| FUT-015 | Nem-ErP folyékony/gáznemű tüzelésű kazán fűtött téren KÍVÜL: ε_F kazántípus (állandó / alacsony hőmérsékletű / kondenzációs) és A_rszr szerint | A_rszr [m2], típus | ε_F = tábla(A_rszr, típus), lineáris interpoláció | 1. függ. 8.3.1.2, 8.1. táblázat, 57. o. | modszer/futes.json#tabla_8_1 | 300 m2 alacsony hőm. → 1,12 |
| FUT-016 | Nem-ErP kazán fűtött téren KÍVÜL: segédenergia | A_rszr [m2] | W_F,term = (W_F,term/A_rszr)_tábla · A_rszr | 1. függ. 8.3.1.2, 8.1. táblázat, 57. o. | modszer/futes.json#tabla_8_1 (W_F_term_per_A) | 500 m2 → 0,38·500 = 190 kWh/év |
| FUT-017 | Nem-ErP folyékony/gáznemű tüzelésű kazán fűtött téren BELÜL: ε_F | A_rszr [m2], típus | ε_F = tábla(A_rszr, típus); a táblázat hiányos (lásd nyitott kérdések) | 1. függ. 8.3.1.2, 8.2. táblázat, 58. o. | modszer/futes.json#tabla_8_2 | 150 m2 állandó hőm. → 1,24 |
| FUT-018 | Nem-ErP kazán fűtött téren BELÜL: segédenergia | A_rszr [m2] | W_F,term = (W_F,term/A_rszr)_tábla · A_rszr | 1. függ. 8.3.1.2, 8.2. táblázat, 58. o. | modszer/futes.json#tabla_8_2 (W_F_term_per_A) | 1000 m2 → 270 kWh/év |
| FUT-019 | Szilárd- és biomassza tüzelés teljesítménytényezője (alapterülettől független) | kazántípus | ε_F: vegyes 1,85; tűzifa 1,75; pellet 1,1; faelgázosító 1,2 | 1. függ. 8.3.1.2, 8.3. táblázat, 58. o. | modszer/futes.json#tabla_8_3 | pellet → 1,1 |
| FUT-020 | Szilárd- és biomassza tüzelés segédenergiája | A_rszr [m2] (Alapterületig, 100–500), típus | W_F,term = tábla · A_rszr | 1. függ. 8.3.1.2, 8.4. táblázat, 58. o. | modszer/futes.json#tabla_8_4 | pellet 200 m2 → 1,78·200 = 356 kWh/év; vegyes szabályozó nélkül → 0 |
| FUT-021 | Kazán részletes módszer: MSZ EN 15316-4-1 (alternatív, opcionális) – szabványos tervezési értékek (default values), ha nincs minősített/mért szezonális hatásfok | E_gen,in, Q_gen,out (szabvány jelölései) | (8.5) ε_F = ε_gen = E_gen,in / Q_gen,out | 1. függ. 8.3.1.3.1, (8.5) egy., 58–59. o. | – | E_in 11000, Q_out 10000 → 1,10 |
| FUT-022 | Kazán részletes módszer: segédenergia | W_HW;gen,aux | W_F,term = W_HW;gen,aux | 1. függ. 8.3.1.3.1, 59. o. | – | – |
| FUT-023 | Kazán részletes: gyártói adat (product values), ha szabványos eljárással határozták meg; a szabvány hivatkozását a dokumentációban fel kell tüntetni | gyártói η_s / ε_F, szabványhivatkozás | Kötelező dokumentációs mező | 1. függ. 8.3.1.3.2, 59. o. | – | Gyártói érték szabványhivatkozás nélkül → hiba |
| FUT-024 | Kazán részletes: mérésen alapuló szezonális hatásfok (measured values) az MSZ EN 15316-4-1 szerint | mért η | Opció | 1. függ. 8.3.1.3.3, 59. o. | – | – |

### 8.3.2 Hőszivattyúk (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-025 | Módszerválasztás: ErP / 811/2013/EU hatálya alá tartozó hőszivattyú → 8.3.2.1 kötelező | ErP-besorolás | Választási szabály | 1. függ. 8.3.2.1, 59. o. | – | – |
| FUT-026 | ErP hőszivattyú teljesítménytényezője (általános/mérsékelt klímára vonatkozó η_s) | η_s [-] | (8.6) ε_F = 1/(2,5·η_s) | 1. függ. 8.3.2.1, (8.6) egy., 59. o. | modszer/futes.json#alapertekek_7_8 (hoszivattyu_ErP_szorzo) | η_s = 1,50 → ε_F = 0,2667 |
| FUT-027 | ErP hőszivattyú: részletes módszer alkalmazható, a 8.3.2.2 egyszerűsített nem | – | Tiltó szabály | 1. függ. 8.3.2.1, 59. o. | – | – |
| FUT-028 | ErP hőszivattyú: a villamos segédenergiát NEM SZABAD figyelembe venni | – | W_F,term = 0 (kötelező) | 1. függ. 8.3.2.1, 59. o. | – | Felhasználói W_F,term bevitel → figyelmen kívül / hiba |
| FUT-029 | Nem-ErP elektromos hőszivattyú: ε_F = 1/SCOP (SCOP, SPF) | SCOP [-] | ε_F = 1/SCOP | 1. függ. 8.3.2.2, 59. o. | – | SCOP 4 → 0,25 |
| FUT-030 | Nem-ErP elektromos hőszivattyú alapértéke hőforrás/fűtőközeg és fűtővíz-hőmérséklet szerint | hőforrás, t_e/t_v | ε_F = tábla (pl. Levegő/Víz 55/45: 0,37; Levegő/levegő: 0,40) | 1. függ. 8.3.2.2, 8.5. táblázat, 59–60. o. | modszer/futes.json#tabla_8_5 | Talajhő/Víz 35/28 → 0,23 |
| FUT-031 | Eltérő fűtővíz-hőmérséklet hőszivattyúnál: lineáris interpoláció a közepes hőmérsékletkülönbségre (7. fej. általános szabálya) | t_e/t_v | Interpoláció a 35/28 és 55/45 pont között | 1. függ. 7. fej., 55. o.; 8.5. táblázat | modszer/futes.json#tabla_8_5 | 45/35 Levegő/Víz → 0,30 és 0,37 közötti érték |
| FUT-032 | Nem-ErP földgáz üzemű hőszivattyú | hőforrás, t_e/t_v | Levegő/Víz 45/40: ε_F = 0,58 (energiahordozó földgáz) | 1. függ. 8.3.2.2, 8.6. táblázat, 60. o. | modszer/futes.json#tabla_8_6 | → 0,58 |
| FUT-033 | Hőszivattyú részletes módszer: MSZ EN 15316-4-2:2017 (alternatív, opcionális) | E_HW;gen,in, Q_HW;gen,out | (8.7) ε_F = E_HW;gen,in / Q_HW;gen,out; teljes fűtési szezonra, rövidebb intervallumokra bontva, csak fűtési üzemhez köthető mennyiségekkel | 1. függ. 8.3.2.3, (8.7) egy., 60. o. | – | – |
| FUT-034 | Hőszivattyú részletes: segédenergia | W_HW;gen,aux | W_F,term = W_HW;gen,aux | 1. függ. 8.3.2.3, 60. o. | – | – |
| FUT-035 | Hőszivattyú részletes: gyártói paraméterek mérési szabványai (példák): fűtés – MSZ EN 14825, MSZ EN 14511-3, MSZ EN 12309-4; HMV – MSZ EN 16147, MSZ EN 12309-6; szabványhivatkozás a dokumentációban kötelező | gyártói adatok, szabványhivatkozás | Dokumentációs követelmény | 1. függ. 8.3.2.3, 60. o. | – | – |

### 8.3.3 Távhő, 8.3.4 Egyedi és direkt elektromos fűtések, 8.4 Napkollektor (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-036 | Távhő teljesítménytényezője | – | ε_F = 1,01 | 1. függ. 8.3.3, 60. o. | modszer/futes.json#alapertekek_7_8 (tavho_eps_F) | – |
| FUT-037 | Távhő: hőtermelés villamos segédenergiája hőközpontonként | hőközpontok száma n | W_F,term = 215 kWh/év · n | 1. függ. 8.3.3, 60. o. | modszer/futes.json#alapertekek_7_8 (tavho_W_F_term_hokozpont) | 2 hőközpont → 430 kWh/év |
| FUT-038 | ErP egyedi fűtés, nem elektromos | η_s | (8.8) ε_F = 1/η_s | 1. függ. 8.3.4.1, (8.8) egy., 60. o. | – | η_s 0,80 → 1,25 |
| FUT-039 | ErP egyedi fűtés, elektromos | η_s | (8.9) ε_F = 1/(2,5·η_s) | 1. függ. 8.3.4.1, (8.9) egy., 61. o. | modszer/futes.json#alapertekek_7_8 (elektromos_futes_ErP_szorzo) | η_s 0,38 → 1,0526 |
| FUT-040 | ErP egyedi fűtés: részletes módszer alkalmazható, a 8.3.4.2 nem; segédenergiát nem kell figyelembe venni | – | Tiltó szabály; W_F,term = 0 | 1. függ. 8.3.4.1, 61. o. | – | – |
| FUT-041 | Nem-ErP egyéb berendezések teljesítménytényezője (elektromos hősugárzó 1,00 … nyitott kandalló 4,00; gázkonvektorok 1,40/1,32/1,12/1,07) | berendezéstípus | ε_F = tábla | 1. függ. 8.3.4.2, 8.7. táblázat, 61. o. | modszer/futes.json#tabla_8_7 | Fatüzelésű cserépkályha → 1,60 |
| FUT-042 | Elektromos hőtárolós kályha: a ventilátor energiafelhasználását ε_F már tartalmazza (1. lábjegyzet) | – | W_F,term (ventilátor) = 0 | 1. függ. 8.7. táblázat 1) lábj., 61. o. | modszer/futes.json#tabla_8_7 | – |
| FUT-043 | Nem víz hőhordozójú egyedi fűtés részletes módszere: MSZ EN 15316-4-8:2017 (alternatív) | E_H;gen,in, Q_H;gen,out | (8.10) ε_F = E_H;gen,in / Q_H;gen,out | 1. függ. 8.3.4.3, (8.10) egy., 61. o. | – | – |
| FUT-044 | Egyedi fűtés részletes: segédenergia | W_H;gen,aux | W_F,term = W_H;gen,aux | 1. függ. 8.3.4.3, 61. o. | – | – |
| FUT-045 | Fűtési célú napkollektoros hőhasznosítás: MSZ EN 15316-4-3 szerint („történhet”); meteorológiai adatok: 2. Függelék 1.2.4. pont | szabvány szerinti bemenetek | Egyszerűsített módszert a 8. fejezet nem ad | 1. függ. 8.4, 61. o. | – | – |

### 8.5 Hőelosztás veszteségei (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-046 | Hőelosztási veszteség, vízszintes elosztóvezetékek fűtött téren KÍVÜL | A_rszr [m2] (Alapterületig; >500), t_e/t_v (90/70, 70/55, 55/45, 35/28) | Q_F,száll = (Q_F,száll/A_rszr)_tábla · A_rszr | 1. függ. 8.5.1, 8.8. táblázat, 62. o. | modszer/futes.json#tabla_8_8 | 150 m2, 70/55 → 7,7·150 = 1155 kWh/év |
| FUT-047 | Hőelosztási veszteség, vízszintes elosztóvezetékek fűtött téren BELÜL | ua. | Q_F,száll = tábla · A_rszr | 1. függ. 8.5.1, 8.9. táblázat, 62. o. | modszer/futes.json#tabla_8_9 | >500 m2, 35/28 → 0,5 kWh/m2év |
| FUT-048 | Eltérő hőfoklépcső: lineáris interpoláció a közepes hőmérsékletkülönbségre | t_e/t_v | Interpoláció | 1. függ. 8.5.1, 62. o. | modszer/futes.json#tabla_8_8, tabla_8_9 | 80/60 → 90/70 és 70/55 között |
| FUT-049 | Fan coilos rendszer ajánlott hőfoklépcsője elosztási veszteséghez: 70/55 °C vagy 55/45 °C | – | Alapérték-javaslat | 1. függ. 8.5.1, 62. o. | modszer/futes.json#alapertekek_7_8 (fancoil_ajanlott_hofoklepcso) | – |
| FUT-050 | Részrendszer: a táblaértéket a részrendszer nettó hőigénye / épület teljes nettó fűtési igénye hányadossal szorozni kell | Q_net,rész, Q_F,net,épület [kWh] | Q_F,száll,rész = tábla · A_rszr · (Q_net,rész / Q_F,net,épület) | 1. függ. 8.5.1, 62. o. | – | 40%-os részrendszer → érték · 0,4 |
| FUT-051 | Hőelosztás részletes módszer: MSZ EN 15316-3:2017 (alternatív) | Q_H,dis,ls | (8.11) Q_F,száll = Q_H,dis,ls | 1. függ. 8.5.2, (8.11) egy., 62. o. | – | – |

### 8.6 Teljesítmény-illesztés pontatlansága (szabályozási veszteség) (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-052 | Elosztóhálózattal rendelkező rendszer szabályozási veszteségtényezője | ε_F,szab,o, ε_F,szab,1…4 [-] | (8.12) ε_F,szab = ε_F,szab,o + ε_F,szab,1 + ε_F,szab,2 + ε_F,szab,3 + ε_F,szab,4 | 1. függ. 8.6.1.1, (8.12) egy., 63. o. | modszer/futes.json#tabla_8_10, tabla_8_11, tabla_8_12 | Radiátor, ref. helyiség P (1,083) + 70/55 kétcsöves (0,021) + külsőfali (0,009) + termosztatikus szelep (−0,060) + kétcsöves ≤10 hőleadó statikus beállítás (0,018) = 1,071 |
| FUT-053 | Szabad fűtőfelületek: alapérték ε_F,szab,o a hőtermelő szabályozása szerint (1,149 / 1,083 / 1,042 / 1,030) | szabályozás típusa | tábla | 1. függ. 8.6.1.1, 8.10. táblázat, 63. o. | modszer/futes.json#tabla_8_10 (tenyezo=eps_F_szab_o) | PI ref. helyiség → 1,042 |
| FUT-054 | Szabad fűtőfelületek: Korrekció 1 – közepes méretezési hőmérsékletkülönbség (kétcsöves/modernizált egycsöves; nem felújított egycsöves; ventilátoros radiátor) | rendszer, t_e/t_v | tábla (+0,000 … +0,048) | 1. függ. 8.10. táblázat, 63. o. | modszer/futes.json#tabla_8_10 (eps_F_szab_1) | egycsöves nem felújított 90/70 → +0,048 |
| FUT-055 | Szabad fűtőfelületek: Korrekció 2 – külső határolószerkezetek (radiátor elhelyezése) | elhelyezés | tábla (+0,009 … +0,051) | 1. függ. 8.10. táblázat, 63. o. | modszer/futes.json#tabla_8_10 (eps_F_szab_2) | üvegfelület előtt hőtükör nélkül → +0,051 |
| FUT-056 | Szabad fűtőfelületek: Korrekció 3 – helyiségenkénti szabályozás | szabályozás | tábla (0 / −0,030 / −0,060 / −0,072) | 1. függ. 8.10. táblázat, 63. o. | modszer/futes.json#tabla_8_10 (eps_F_szab_3) | épületfelügyeletbe kötött → −0,072 |
| FUT-057 | Beágyazott fűtőfelületek: alapérték ε_F,szab,o | szabályozás típusa | tábla (1,149 / 1,083 / 1,042 / 1,030) | 1. függ. 8.6.1.1, 8.11. táblázat, 63. o. | modszer/futes.json#tabla_8_11 (eps_F_szab_o) | kétpontos szabályozó → 1,042 |
| FUT-058 | Beágyazott fűtőfelületek: Korrekció 1 – rendszer (padlófűtés nedves/száraz/vékony rétegű, falfűtés, mennyezetfűtés) | rendszer | tábla (+0,006 … +0,063) | 1. függ. 8.11. táblázat, 64. o. | modszer/futes.json#tabla_8_11 (eps_F_szab_1) | mennyezetfűtés → +0,063 |
| FUT-059 | Beágyazott fűtőfelületek: Korrekció 2 – határolószerkezet hőszigetelése az MSZ EN 1264-2 minimumához képest | hőszigetelés szintje | tábla (+0,042 / +0,015 / +0,003) | 1. függ. 8.11. táblázat, 64. o. (MSZ EN 1264-2 mint besorolási feltétel) | modszer/futes.json#tabla_8_11 (eps_F_szab_2) | 100%-kal jobb szigetelés → +0,003 |
| FUT-060 | Beágyazott fűtőfelületek: Korrekció 3 – helyiségenkénti szabályozás | szabályozás | tábla (0 / −0,030 / −0,060 / −0,072) | 1. függ. 8.11. táblázat, 64. o. | modszer/futes.json#tabla_8_11 (eps_F_szab_3) | termosztatikus zónaszelep → −0,060 |
| FUT-061 | Korrekció 4 – beszabályozás: egycsöves rendszer | beszabályozás típusa | tábla (+0,042 … +0,006) | 1. függ. 8.6.1.1, 8.12. táblázat, 64. o. | modszer/futes.json#tabla_8_12 (eps_F_szab_4) | körönkénti statikus → +0,024 |
| FUT-062 | Korrekció 4 – beszabályozás: kétcsöves rendszer, hőleadók száma szerint (max. 10 / 10 felett) | beszabályozás típusa, hőleadók száma N | tábla; N ≤ 10 → „max. 10” oszlop, N > 10 → „10 felett” oszlop | 1. függ. 8.12. táblázat, 64. o. | modszer/futes.json#tabla_8_12 (eps_F_szab_4_max10 / _10felett) | 12 radiátor, strangszabályozó → +0,018 |
| FUT-063 | Egyéb fűtési rendszerek: ε_F,szab közvetlenül táblázatból a szabályozás típusa szerint (nem (8.12)) | rendszer, szabályozás | Választási szabály | 1. függ. 8.6.1.2, 65. o. | – | – |
| FUT-064 | Villamos fűtés szabályozási veszteségtényezője (külső/belső fal mellett; közvetlen / hőtárolós; szabályozó típusa) | elhelyezés, szabályozás | ε_F,szab = tábla (1,042 … 1,185) | 1. függ. 8.6.1.2, 8.13. táblázat, 65. o. | modszer/futes.json#tabla_8_13 | belső fal, hőtárolós szabályozás nélkül → 1,185 |
| FUT-065 | Közvetlen helyiséglevegő-fűtés (gázkonvektor, egyedi kályha/kandalló, levegőfűtés indukciós berendezéssel/fan coillal) szabályozási veszteségtényezője | rendszerkialakítás, szabályozás | ε_F,szab = tábla (1,042 … 1,24) | 1. függ. 8.6.1.2, 8.14. táblázat, 65. o. | modszer/futes.json#tabla_8_14 | kandalló → 1,20 |

### 8.7 Hőtárolás (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-066 | Hőtárolás fajlagos energiaigénye (veszteség) elhelyezés (fűtött térben / kívül) és hőfoklépcső (55/45, 35/28) szerint | A_rszr [m2] (Alapterületig), elhelyezés, t_e/t_v | Q_F,tár = (Q_F,tár/A_rszr)_tábla · A_rszr | 1. függ. 8.7, 8.15. táblázat, 65–66. o. | modszer/futes.json#tabla_8_15 | téren kívül 55/45, 200 m2 → 1,5·200 = 300 kWh/év |
| FUT-067 | Hőtárolás segédenergiája | A_rszr [m2] | W_F,tár = (W_F,tár/A_rszr)_tábla · A_rszr | 1. függ. 8.7, 8.15. táblázat, 66. o. | modszer/futes.json#tabla_8_15 (W_tar) | 1000 m2 → 0,10·1000 = 100 kWh/év |
| FUT-068 | Szilárd/biomassza tüzelésű rendszer tárolója: a fajlagos energiaigény ×2,6; a segédenergia változatlan | rendszer energiahordozója | Q_F,tár = 2,6 · tábla · A_rszr | 1. függ. 8.7, 66. o. | modszer/futes.json#alapertekek_7_8 (tarolo_szilard_biomassza_szorzo) | 200 m2 kívül 55/45, pellet → 2,6·300 = 780 kWh/év |
| FUT-069 | Részrendszer: tárolási táblaértékek szorzása a részrendszer nettó hőigény / épület teljes nettó fűtési igény hányadossal | Q_net,rész, Q_F,net,épület | érték · (Q_net,rész / Q_F,net,épület) | 1. függ. 8.7, 66. o. | – | – |
| FUT-070 | Hőtárolás részletes módszer: MSZ EN 15316-5:2017 (alternatív), fűtési puffertárolóra | Q_H;sto;ls;nrbl, Q_H;sto;ls;rbl | (8.13) Q_F,tár = Q_H;sto;ls;nrbl + Q_H;sto;ls;rbl; az első tag vissza nem nyerhető, a második visszanyerhető (a nettó fűtési igényből levonandó, de itt figyelembe kell venni) | 1. függ. 8.7.1, (8.13) egy., 66. o. | – | – |

### 8.8 Hőelosztás segédenergiája (FUT)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| FUT-071 | Szivattyú villamos segédenergiája szivattyútípus (fordulatszám-szabályozott / állandó fordulatú / EC EEI=0,23 / EEI=0,17), fűtőfelület (szabad/beágyazott) és hőfoklépcső (20 K 90/70, 15 K 70/55, 10 K 55/45, 7 K) szerint; vezetékrendszer = elosztó, strang, bekötő | A_rszr [m2], szivattyútípus, fűtőfelület, Δt | W_F,sziv = (W_F,sziv/A_rszr)_tábla · A_rszr | 1. függ. 8.8.1, 8.16. táblázat, 66–67. o. | modszer/futes.json#tabla_8_16 | fordulatszám-szab., szabad, 15 K, 300 m2 → 0,68·300 = 204 kWh/év |
| FUT-072 | Keringetőszivattyú EEI: 641/2009/EK szerint 2015.08.01-től legfeljebb 0,23 (validáció/alapérték) | EEI, beépítés dátuma | EEI ≤ 0,23 | 1. függ. 8.8.1, 66. o. | modszer/futes.json#alapertekek_7_8 (EEI_max_2015_08_01) | 2016-os szivattyú EEI=0,27 → figyelmeztetés |
| FUT-073 | Fan coil ventilátor fajlagos segédenergiája, egész éves üzem (fűtés + hűtés összesen) | kialakítás, A_rszr | W_FC = (W_FC/A_rszr)_tábla · A_rszr (2 / 2,4 / 2,8 / 4,4 kWh/m2év) | 1. függ. 8.8.1, 8.17. táblázat, 67. o. | modszer/futes.json#tabla_8_17 | négy irányban fúvó, 100 m2 → 440 kWh/év |
| FUT-074 | Hőelosztás segédenergia részletes módszer: MSZ EN 15316-3 (alternatív) | W_H,dis | (8.14) W_F,sziv = W_H,dis | 1. függ. 8.8.2, (8.14) egy., 67. o. | – | – |

### Hivatkozott szabványok (részletes módszerek – mind alternatív, nem kötelező)

| Szabvány | Alkalmazás | Hely |
|---|---|---|
| MSZ EN 15316-4-1 | kazánok (default / product / measured values) | 8.3.1.3, 58–59. o. |
| MSZ-EN-15316-4-2:2017 | hőszivattyúk | 8.3.2.3, 60. o. |
| MSZ EN 14825, MSZ EN 14511-3, MSZ EN 12309-4 | hőszivattyú gyártói adatok, fűtési üzem (példák) | 8.3.2.3, 60. o. |
| MSZ EN 16147, MSZ EN 12309-6 | hőszivattyú gyártói adatok, HMV üzem (példák) | 8.3.2.3, 60. o. |
| MSZ-EN-15316-4-8:2017 | nem víz hőhordozójú egyedi fűtések | 8.3.4.3, 61. o. |
| MSZ EN 15316-4-3 | fűtési célú napkollektor („történhet” – egyszerűsített módszer nincs megadva) | 8.4, 61. o. |
| MSZ-EN-15316-3:2017 / MSZ EN 15316-3 | hőelosztás veszteség és segédenergia | 8.5.2, 62. o.; 8.8.2, 67. o. |
| MSZ-EN-15316-5:2017 | hőtárolás (puffertároló) | 8.7.1, 66. o. |
| MSZ EN 1264-2 | beágyazott fűtőfelület minimális hőszigetelése (korrekció besorolási feltétele) | 8.11. táblázat, 64. o. |
| 2010/30/EU irányelv, 811/2013/EU rendelet, 641/2009/EK rendelet | ErP-besorolás, η_s, EEI | 8.3.1.1, 57. o.; 8.8.1, 66. o. |


## M4. Használati melegvíz és szellőzés (1. Függelék 9–10. fejezet)

### 9. fejezet – A használati melegvíz ellátó rendszer energiafelhasználása

### 9.1 Nettó hőenergia-igény

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-001 | Nettó HMV hőenergia-igény felvétele | rendeltetés; A_N [m²] | q_HMV a 2. Függelék 2.2. táblázatából | 1F 9.1, 68. o. | 2F 2.2. táblázat (más feladat) | Lakóépület: a 2F 2.2 érték kerül be, felülírás tiltott |
| HMV-002 | Választási szabály: lakóépületnél a 2F 2.2 érték kötelező | rendeltetés | ha lakó → kötelező; egyéb → ajánlott (felülírható) | 1F 9.1, 68. o. | – | Nem-lakó épületnél eltérő q_HMV elfogadása, lakóépületnél elutasítás |
| HMV-003 | Fajlagosítás hasznos alapterületre | Q_HMV,net [kWh/év]; A_N [m²] | q_HMV = Q_HMV,net / A_N (a teljes nettó hőigény meghatározása után) | 1F 9.1, 68. o. | – | 3000 kWh/év, 100 m² → 30 kWh/m²év |

### 9.2 Végső hő- és villamos energia

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-004 | HMV végső energia energiahordozónként (j) | Q_HMV,net, Q_HMV,száll, Q_HMV,tár [kWh/év vagy kWh/időszak]; ε_HMV [-] | Q_HMV,vég,j = Σ (Q_HMV,net + Q_HMV,száll + Q_HMV,tár) · ε_HMV | 1F 9.2, (9.1), 68. o. | – | 3000+390+720 kWh, ε=1,17 → 4808,7 kWh |
| HMV-005 | Összegzési szabály (9.1): zónák és azonos energiahordozójú együttes rendszerek összegzése | zónák, rendszerek, energiahordozó | Σ csak azonos energiahordozóval ellátott rendszerekre/zónákra; különböző hordozó külön Q_HMV,vég,j | 1F 9.2, 68. o. | – | 2 zóna gáz + 1 zóna villany → két külön eredmény |
| HMV-006 | HMV villamos segédenergia összesen | W_HMV,sziv, W_HMV,term [kWh/év] | W_HMV,vég = Σ (W_HMV,sziv + W_HMV,term) | 1F 9.2, (9.2), 68. o. | – | Zónák és rendszerek összegzése |
| HMV-007 | Szivattyú-segédenergia összetevői | W_HMV,sziv_cirk, W_HMV,sziv_szol, W_HMV,sziv_talaj [kWh/év] | W_HMV,sziv = Σ (W_HMV,sziv_cirk + W_HMV,sziv_szol + W_HMV,sziv_talaj) | 1F 9.2, (9.3), 68. o. | – | Cirkuláció + szolár + talajszonda primer szivattyú összege |

### 9.2.1 Napkollektoros HMV

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-008 | Egyszerűsített napkollektoros módszer alkalmazhatósága – 1. feltétel | rendeltetés, kollektor felhasználása | csak ha a kollektor kizárólag lakóépület HMV-igényére segít rá | 1F 9.2.1.1, 68. o. | – | Fűtésrásegítős vagy nem-lakó rendszer → egyszerűsített tiltva, részletes kell |
| HMV-009 | Egyszerűsített napkollektoros módszer – 2. feltétel | V_tár [l]; A_koll [m²] | V_tár / A_koll ≥ 50 l/m² („eléri”) | 1F 9.2.1.1, 68. o. | modszer/hmv.json#alapertekek_9_2_1_2 | 4 m², 200 l → 50 → OK; 4 m², 190 l → nem |
| HMV-010 | Végső energia kollektor nélkül (másik hőtermelő a teljes igényt fedezi) | Q_HMV,net, Q_HMV,száll, Q_HMV,tár; ε_HMV,2 [-] | Q_HMV,vég,koll_nélkül = Σ (Q_HMV,net + Q_HMV,száll + Q_HMV,tár) · ε_HMV,2 | 1F 9.2.1.1, (9.4), 68. o. | – | (9.1)-gyel azonos eredmény kollektor nélkül |
| HMV-011 | Kollektoros energiatermelés | Q_koll,max [kWh/év]; k [-] | Q_HMV,vég,koll = Q_koll,max · k | 1F 9.2.1.1, (9.5), 68. o. | – | Q_koll,max=1999, k=1 → 1999 |
| HMV-012 | Q_koll,max síkkollektorra | A_koll,bruttó [m²]; A_rszr (rendszer alapterület) [m²] | 9.1. táblázat kiolvasása | 1F 9.2.1.1, 9.1. tábl., 69. o. | modszer/hmv.json#tabla_9_1 | 4 m², 120 m² → 1999 kWh/év |
| HMV-013 | Q_koll,max vákuumcsöves kollektorra | A_koll,bruttó [m²]; A_rszr [m²] | 9.2. táblázat kiolvasása | 1F 9.2.1.1, 9.2. tábl., 70. o. | modszer/hmv.json#tabla_9_2 | 4 m², 120 m² → 2515 kWh/év |
| HMV-014 | Táblázaton kívüli / köztes értékek kezelése | A_koll, A_rszr | NINCS a forrásban (interpoláció, extrapoláció nem szabályozott) – lásd nyitott kérdések | 1F 69–70. o. | – | 3,5 m² vagy 175 m² bemenet → szabály kell |
| HMV-015 | Teljesítménycsökkentő tényező k (leíró képlet) | α_m hajlásszög [°] 0…90; γ_m tájolás [°] −90 (K)…+90 (Ny) | k = (9,88·10⁻⁹·α_m² − 1,18·10⁻⁶·α_m)·γ_m² + (−4,99·10⁻⁸·α_m² + 9,25·10⁻⁶·α_m)·γ_m + (−1,17·10⁻⁴·α_m² + 9,11·10⁻³·α_m + 0,821) | 1F 9.2.1.1, (9.7), 69. o. | modszer/hmv.json#keplet_9_7_k_egyutthatok | α=45, γ=0 → k=0,821+0,40995−0,236925 ≈ 0,9940; α=90, γ=0 → ≈0,6932 (ábra: ~69%) |
| HMV-016 | k érvényességi tartomány ellenőrzése | α_m, γ_m | 0° ≤ α_m ≤ 90°, −90° ≤ γ_m ≤ +90°; azon kívül nem értelmezett | 1F 9.2.1.1, 69. o. | – | γ=120° → hiba/figyelmeztetés |
| HMV-017 | k grafikus meghatározása (alternatíva) | α_m ∈ {30,45,60,75,90}°, γ_m | 9.1. ábra görbéi | 1F 9.1. ábra, 69. o. | – | Ábra és (9.7) összevetése α=30,γ=0 (~99%) |
| HMV-018 | Másik hőtermelő végső energiája napkollektor mellett | Q_HMV,vég,koll_nélkül; Q_HMV,vég,koll; ε_HMV,2 | Q_HMV,vég,2 = Q_HMV,vég,koll_nélkül − Q_HMV,vég,koll · ε_HMV,2 | 1F 9.2.1.1, (9.6), 69. o. | – | 4808,7 − 1999·1,17 = 2469,9 kWh; negatív eredmény kezelése (nyitott) |
| HMV-019 | Részletes napkollektoros módszer | – | MSZ EN 15316-4-3 (alternatív; tervezői szoftver is elfogadható a feltételek betartásával) | 1F 9.2.1.2, 70. o. | – | Kötelező, ha HMV-008/009 feltétel nem teljesül |
| HMV-020 | Részletes módszer – éves nettó igény lakóépületnél | rendeltetés | Q_HMV,net a 2F 2.2. táblázat szerint | 1F 9.2.1.2, 70. o. | 2F 2.2 | – |
| HMV-021 | Részletes módszer – havi felosztás lakóépületnél | Q_HMV,net,év; hónap | Q_HMV,net,hó = Q_HMV,net,év · részarány_hó / 100 | 1F 9.2.1.2, 9.3. tábl., 70. o. | modszer/hmv.json#tabla_9_3 | január: 9,09%; részarányok összege 99,99% (anomália) |
| HMV-022 | Részletes módszer – havi felosztás egyéb rendeltetésnél | – | időarányosan vagy a rendeltetésből adódó igények szerint | 1F 9.2.1.2, 70. o. | – | Időarányos: jan = 31/365 |
| HMV-023 | Részletes módszer – hidegvíz hőmérséklet | – | θ_hidegvíz = 10,9 °C | 1F 9.2.1.2, 70. o. | modszer/hmv.json#alapertekek_9_2_1_2 | Konstans ellenőrzése |
| HMV-024 | Részletes módszer – klímaadatok | – | külső hőmérséklet és napsugárzás: 2F 1.2.1. és 1.2.4. pont | 1F 9.2.1.2, 70. o. | 2F 1.2.1, 1.2.4 | – |

### 9.3 Melegvíz-termelés teljesítménytényezői és segédenergiái

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-025 | Módszerválasztás kazánnál: ErP (811/2013/EU) hatálya alá eső, nem elektromos készülék → kötelező 9.3.1.1 | ErP-hatály, η_s | ha ErP-s → (9.8) kötelező; helyette csak részletes módszer, a 9.3.1.2 táblázat NEM | 1F 9.3.1.1, 70. o. | – | ErP-s kazánnál a 9.4. táblázat választása tiltott |
| HMV-026 | Teljesítménytényező ErP-s (nem elektromos) készüléknél | η_s [-] (energiacímke, HMV szezonális hatásfok) | ε_HMV = 1 / η_s | 1F 9.3.1.1, (9.8), 70. o. | – | η_s=0,85 → ε=1,176 |
| HMV-027 | Segédenergia ErP-s eljárásnál | – | W_HMV,term = 0 (nem kell figyelembe venni) | 1F 9.3.1.1, 70. o. | – | ErP-s kazán: W_term = 0 |
| HMV-028 | Kazánüzemű HMV ε_HMV (ErP hatályán kívül) | kazántípus; A_rszr [m²]; kombi esetén ÁF/KT | 9.4. táblázat, „Alapterületig” sor (A_rszr ≤ sorérték első sora) | 1F 9.3.1.2, 9.4. tábl., 71. o. | modszer/hmv.json#tabla_9_4 | Kondenzációs, 180 m² → 200-as sor → 1,14 |
| HMV-029 | Kombikazán ÁF/KT besorolás | V tároló/hőcserélő térfogat [l] | ÁF: V < 2 l (átfolyós); KT: 2 < V < 10 l (kis tároló) | 1F 9.3.1.2, 71. o. | modszer/hmv.json#tabla_9_4 | V=5 l → KT; V=2 l vagy ≥10 l → nem definiált (nyitott) |
| HMV-030 | Kazán segédenergia (ErP hatályán kívül) | kazántípus (kombi / más); A_rszr | W_HMV,term = (W_HMV,term/A_rszr)_tábla · A_rszr | 1F 9.3.1.2, 9.4. tábl., 71. o. | modszer/hmv.json#tabla_9_4 | Más kazán, 1500 m² → 0,084·1500 = 126 kWh/év |
| HMV-031 | Kombikazán 500 m² felett | A_rszr > 500 | táblázat üres – nincs adat (nyitott) | 1F 9.4. tábl., 71. o. | modszer/hmv.json#tabla_9_4 | 750 m² kombi → hiba/figyelmeztetés |
| HMV-032 | Szilárd- és biomassza kazán ε_HMV | kazántípus | 9.5. táblázat (vegyes 2,00; hasábfa 1,9; pellet 1,2; faelgázosító 1,3) | 1F 9.3.1.2, 9.5. tábl., 71. o. | modszer/hmv.json#tabla_9_5 | Pellet → 1,2 |
| HMV-033 | Szilárd- és biomassza kazán segédenergia | kazántípus; A_rszr ≤ 500 m² | W_term = (W_F,term/A_rszr)_tábla · A_rszr | 1F 9.3.1.2, 9.6. tábl., 71. o. | modszer/hmv.json#tabla_9_6 | Pellet, 150 m² → 1,84·150 = 276 kWh/év |
| HMV-034 | Elektromos HMV: ErP-s készülék → kötelező 9.3.2.1 | η_s | ha ErP-s → (9.9); helyette csak részletes, a 9.3.2.2 NEM | 1F 9.3.2.1, 72. o. | – | – |
| HMV-035 | Elektromos ErP-s készülék teljesítménytényezője | η_s [-] | ε_HMV = 1 / (2,5 · η_s) | 1F 9.3.2.1, (9.9), 72. o. | – | η_s=1,0 (HP címke 100%) → 0,4; η_s=0,36 → 1,111 |
| HMV-036 | Segédenergia elektromos ErP-s eljárásnál | – | W_HMV,term = 0 | 1F 9.3.2.1, 72. o. | – | – |
| HMV-037 | Elektromos HMV (ErP hatályán kívül) ε_HMV | készüléktípus; hőszivattyú hőforrása; η_r | 9.7. táblázat | 1F 9.3.2.2, 9.7. tábl., 72. o. | modszer/hmv.json#tabla_9_7 | Levegős HP → 0,45; fűtőpatron → 1,0 |
| HMV-038 | Egyéb hőtermelő: ErP-s, nem elektromos → kötelező 9.3.3.1 | η_s | ε_HMV = 1 / η_s; helyette csak részletes | 1F 9.3.3.1, (9.10), 72. o. | – | Gázbojler η_s=0,8 → 1,25 |
| HMV-039 | Segédenergia egyéb ErP-s eljárásnál | – | W_HMV,term = 0 | 1F 9.3.3.1, 72. o. | – | – |
| HMV-040 | Egyéb HMV készítő (ErP hatályán kívül) ε és segédenergia | rendszer | 9.8. táblázat (gázbojler 1,22/0; átfolyós gáz 1,30/0; szilárd fürdőhenger 2,00/0) | 1F 9.3.3.2, 9.8. tábl., 72–73. o. | modszer/hmv.json#tabla_9_8 | Átfolyós gáz-vízmelegítő → 1,30, W=0 |
| HMV-041 | Távhő teljesítménytényező | – | ε = 1,01 (a forrásban „εF”) | 1F 9.3.4, 73. o. | modszer/hmv.json#alapertek_9_3_4_tavho | Konstans |
| HMV-042 | Távhő villamos segédenergia | hőközpontok száma | W_HMV,term = 265 kWh/év · hőközpontok száma | 1F 9.3.4, 73. o. | modszer/hmv.json#alapertek_9_3_4_tavho | 2 hőközpont → 530 kWh/év |
| HMV-043 | Részletes módszer a hőtermelőre (9.3) | – | megengedett az egyszerűsített helyett; a forrás nem nevez meg szabványt a 9.3-ban | 1F 9.3.1.1/9.3.2.1/9.3.3.1, 70–72. o. | – | – |

### 9.4 Tárolási veszteség

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-044 | Tárolás helye szerinti táblaválasztás | tároló helye | fűtött légtéren belül → 9.9.; kívül → 9.10. | 1F 9.4.1, 73. o. | – | – |
| HMV-045 | Tárolási veszteség – tároló fűtött téren belül | tárolótípus; A_rszr | Q_HMV,tár = (%_tábla / 100) · Q_HMV,net | 1F 9.4.1, 9.9. tábl., 73. o. | modszer/hmv.json#tabla_9_9 | Indirekt, 150 m² → 17% → 3000 kWh-ból 510 kWh |
| HMV-046 | Tárolási veszteség – tároló fűtött téren kívül | tárolótípus; A_rszr | Q_HMV,tár = (%_tábla / 100) · Q_HMV,net | 1F 9.4.1, 9.10. tábl., 73–74. o. | modszer/hmv.json#tabla_9_10 | Gázbojler, 1000 m² → 46% |
| HMV-047 | Tárolótípus-kategóriák | – | indirekt fűtésű tároló / csúcson kívüli árammal működő el. bojler / nappali árammal működő el. bojler / gázüzemű bojler | 1F 9.9–9.10. tábl., 73. o. | modszer/hmv.json#tabla_9_9 | Tároló nélküli rendszer → Q_tár = 0 (forrás nem mondja ki, nyitott) |
| HMV-048 | Részletes tárolási veszteség | MSZ EN 15316-5 jelölések | Q_HMV,tár = Q_HW;sto;ls,nrbl + Q_HW;sto;ls,rbl (vissza nem nyerhető + visszanyerhető) | 1F 9.4.2, (9.11), 74. o. | – | Szabvány: „15316-5” (alternatív) |
| HMV-049 | Visszanyerhető tárolási veszteség kezelése | Q_HW;sto;ls,rbl | a nettó fűtési igényből levonandó, de a HMV-nél (9.11) figyelembe kell venni | 1F 9.4.2, 74. o. | – | Kapcsolat a fűtési fejezettel (nyitott: egyszerűsített esetben nincs levonás) |

### 9.5 Elosztási veszteség

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-050 | Elosztási veszteség cirkulációval | elosztás helye (fűtött téren kívül/belül); A_rszr | Q_HMV,száll = (%_tábla / 100) · Q_HMV,net | 1F 9.5.1, 9.11. tábl., 74. o. | modszer/hmv.json#tabla_9_11 | Cirk., belül, 300 m² → 15% |
| HMV-051 | Elosztási veszteség cirkuláció nélkül | elosztás helye; A_rszr | 100 m²-ig: kívül 13%, belül 10%; 100 m² felett a tábla üres (nyitott) | 1F 9.5.1, 9.11. tábl., 74. o. | modszer/hmv.json#tabla_9_11 | Cirk. nélkül, belül, 80 m² → 10% |
| HMV-052 | Részletes elosztási veszteség | MSZ EN 15316-3 jelölés | Q_HMV,száll = Q_HW,dis,ls | 1F 9.5.2, (9.12), 74. o. | – | Szabvány: MSZ EN 15316-3 (alternatív) |

### 9.6 Szivattyúk segédenergiája

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HMV-053 | Cirkulációs szivattyú segédenergia | EEI (nem ismert / 0,23 / 0,17); A_rszr | W_HMV,sziv_cirk = (W/A_rszr)_tábla · A_rszr | 1F 9.6.1, 9.12. tábl., 75. o. | modszer/hmv.json#tabla_9_12 | EEI=0,23, 200 m² → 0,55·200 = 110 kWh/év |
| HMV-054 | EEI-határérték (641/2009/EK) | szivattyú beépítési/forgalomba hozatali ideje | EEI ≤ 0,23 2015.08.01-től (tájékoztató; oszlopválasztás alapja) | 1F 9.6.1, 75. o. | modszer/hmv.json#tabla_9_12 | EEI=0,20 → melyik oszlop? (nyitott) |
| HMV-055 | Cirkuláció nélkül nincs cirkulációs segédenergia | cirkuláció van/nincs | W_HMV,sziv_cirk = 0, ha nincs cirkuláció (a táblázat neve alapján; forrás kifejezetten nem mondja) | 1F 9.6.1, 75. o. | – | – |
| HMV-056 | Szolárköri szivattyú segédenergia (9.2.1.1 feltételei esetén) | A_koll bruttó összes kollektorfelület [m²] | W_HMV,sziv_szol = 2 · (25 + 2 · A_koll) [kWh/év vagy kWh/időszak] | 1F 9.6.1, (9.13), 75. o. | modszer/hmv.json#keplet_9_13_szolar_szivattyu | A_koll=4 → 2·(25+8) = 66 kWh/év |
| HMV-057 | Egyéb felmerülő segédenergia | – | ha egyéb segédenergia-igény felmerül, azt is figyelembe kell venni (pl. W_HMV,sziv_talaj – értéket a forrás nem ad) | 1F 9.6.1, 75. o. | – | Talajszondás HP primerszivattyú: bemenet kell |
| HMV-058 | Részletes szivattyú-segédenergia | MSZ EN 15316-3 | W_HMV,sziv = W_HW,dis | 1F 9.6.2, (9.14), 75. o. | – | Szabvány: MSZ EN 15316-3 (alternatív) |

### 10. fejezet – A szellőző rendszer energiafelhasználása

### 10.1.1–10.1.2 Térfogatáram és léghevítés által fedezett hányad

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| LT-001 | Szállított (recirkuláció nélküli) térfogatáram felvétele | rendeltetés | 2F 2.1. táblázat (tájékoztató) | 1F 10.1.1, 76. o. | 2F 2.1 (más feladat) | – |
| LT-002 | Választási szabály: lakóépületnél a 2F 2.1 érték kötelező | rendeltetés | lakó → kötelező; egyéb → tájékoztató | 1F 10.1.1, 76. o. | – | Lakóépületnél eltérő érték elutasítása |
| LT-003 | Módszer alkalmazhatósága: ismert befúvási hőmérséklet | θ_bef;F | ha ismert → 10.1.2 módszer; ha nem, de a többi fűtési mód által fedezett igény ismert → átlagos befúvási hőmérséklet visszaszámolása (lásd 7. és 8.1. pont) | 1F 10.1.2, 76. o. | – | – |
| LT-004 | Időbontás | – | havi bontás vagy szezonális átlagértékek; térfogatáram-fokozatonként (n) | 1F 10.1.2, 76. o. | – | – |
| LT-005 | Léghevítő nélküli eset | – | Q_F,LT = 0 kWh (pl. csak hővisszanyerő) | 1F 10.1.2, 76. o. | modszer/szellozes.json#alapertekek_10_konstansok | HR utófűtő nélkül → 0 |
| LT-006 | Léghevítő által fedezett nettó fűtési igény | Q_F,LT,n,friss, Q_F,LT,n,recirk [kWh] | Q_F,LT = Σ_n (Q_F,LT,n,friss + Q_F,LT,n,recirk) | 1F 10.1.2, (10.1), 76. o. | – | 2 fokozat összegzése |
| LT-007 | Frisslevegő hőigénye elő- és utófűtésből | Q_F;EF,n,friss, Q_F;UF,n,friss | Q_F,LT,n,friss = Q_F;EF,n,friss + Q_F;UF,n,friss | 1F 10.1.2, (10.2), 76. o. | – | – |
| LT-008 | A) szakaszos légfűtés hővisszanyerő nélkül | V̇_LT,n,friss [m³/h]; Δt_LT,n [h]; θ_bef;F, θ_e;átlag [°C] | Q_F,LT,n,friss = Q_F;UF,n,friss = 0,35 · V̇_LT,n,friss · Δt_LT,n · (θ_bef;F − θ_e;átlag) / 1000 | 1F 10.1.2, (10.3), 76. o. | modszer/szellozes.json#alapertekek_10_konstansok | 150 m³/h, 1000 h, 20−4 K → 0,35·150·1000·16/1000 = 840 kWh |
| LT-009 | A) előfűtés | – | Q_F;EF,n = 0 kWh | 1F (10.4), 76. o. | – | – |
| LT-010 | B) szakaszos légfűtés hővisszanyerővel | + η_r [-] | Q_F,LT,n,friss = Q_F;UF,n,friss = 0,35 · V̇_LT,n,friss · (1 − η_r) · Δt_LT,n · (θ_bef;F − θ_e;átlag) / 1000 | 1F 10.1.2, (10.5), 76. o. | – | LT-008 adatai, η_r=0,8 → 168 kWh |
| LT-011 | B) előfűtés | – | Q_F;EF,n = 0 kWh | 1F (10.6), 76. o. | – | – |
| LT-012 | C) fagyvédelmi előfűtés energiaigénye | V̇_LT,n,friss; Δt_EF,n,e<−4C [h]; θ_e<−4C [°C] (2F 1.2.2) | Q_F;EF,n,friss = 0,35 · V̇_LT,n,friss · Δt_EF,n,e<−4C · (−4 − θ_e<−4C) / 1000 | 1F 10.1.2, (10.7), 76. o. | modszer/szellozes.json#alapertekek_10_konstansok | 150 m³/h, 200 h, θ=−7 °C → 0,35·150·200·3/1000 = 31,5 kWh |
| LT-013 | C) utófűtés fagyvédelmi előfűtéssel | V̇_LT,n,friss; Δt_LT,n; Δt_EF,n,e<−4C; θ_bef,F; θ_e;átlag; η_r | Q_F;UF,n,friss = 0,35 · V̇_LT,n,friss · ((Δt_LT,n − Δt_EF,n,e<−4C) · (θ_bef,F − θ_e;átlag) + Δt_EF,n,e<−4C · (θ_bef,F − (−4))) · (1 − η_r) / 1000 | 1F 10.1.2, (10.8), 76. o. | – | Δt_EF=0 → (10.5)-tel azonos |
| LT-014 | Δt_EF,n,e<−4C nulla, ha nincs fagyvédelmi előfűtés | – | Δt_EF,n,e<−4C = 0 | 1F 10.1.2, 77. o. | – | – |
| LT-015 | Elő- és utófűtés összegzése azonos energiahordozónál | energiahordozó EF, UF | ha azonos: Q_F,LT,n,friss = Q_F;EF,n + Q_F;UF,n,friss; ha eltérő: nem összegezhető (külön hordozónként) | 1F 10.1.2, (10.9), 76. o. | – | Villany EF + gáz UF → két külön tétel |
| LT-016 | D) talajhőcserélős előmelegítés + hővisszanyerő | Q_F;UF,n,friss | Q_F,LT,n,friss = Q_F;UF,n,friss | 1F 10.1.2, (10.10), 76. o. | – | – |
| LT-017 | D) talajhőcserélő által fedezett hányad (megújuló) | V̇_LT,n,friss; Δt_LT,n; θ_thcs,F; θ_e;átlag | Q_F,thcs,n = 0,35 · V̇_LT,n,friss · Δt_LT,n · (θ_thcs,F − θ_e;átlag) / 1000 → hasznosított megújuló energiába számítható | 1F 10.1.2, (10.11), 77. o. | – | 150 m³/h, 1000 h, 10,5−2 K → 446,25 kWh |
| LT-018 | D) utófűtés talajhőcserélő után | V̇_LT,n,friss; Δt_LT,n; θ_bef,F; θ_thcs,F; η_r | Q_F,UF,n,friss = 0,35 · V̇_LT,n,friss · Δt_LT,n · (θ_bef,F − θ_thcs,F) · (1 − η_r) / 1000 | 1F 10.1.2, (10.12), 77. o. | – | – |
| LT-019 | D) előfűtés | – | Q_F;EF,n = 0 kWh | 1F (10.13), 77. o. | – | – |
| LT-020 | Recirkuláció nettó hőigénye (n. fokozat) | V̇_F,LT,recirk,n [m³/h]; Δt_LT,n; θ_bef;F; θ_i;F [°C] | Q_F,LT,recirk,n = 0,35 · V̇_F,LT,recirk,n · Δt_LT,n · (θ_bef;F − θ_i;F) / 1000 | 1F 10.1.2.1, (10.14), 77. o. | – | θ_bef=θ_i → 0 |

### 10.1.3 Talajhőcserélő

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| LT-021 | Talajhőcserélő által fedezett igény egyszerűsítve | – | (10.11) képlet, θ_thcs,F a 10.1. táblázatból | 1F 10.1.3.1, 77. o. | modszer/szellozes.json#tabla_10_1 | – |
| LT-022 | 10.1. táblázat alkalmazhatósága | fektetési mélység; cső; by-pass | mélység 2 m; 200 mm-es PVC cső; április–október by-pass-szal kiiktatva | 1F 10.1.3.1, 77. o. | modszer/szellozes.json#tabla_10_1 | 1,5 m mélység → táblázat nem alkalmazható → részletes |
| LT-023 | Kilépő levegő hőmérséklet kiolvasása | L ∈ {30,40,50,60} m; V̇ ∈ {120,150,180} m³/h; hónap (jan, feb, márc, nov, dec) vagy szezonális átlag | 10.1. táblázat | 1F 10.1.3.1, 10.1. tábl., 77–78. o. | modszer/szellozes.json#tabla_10_1 | L=40 m, 150 m³/h, szezonális → 11,1 °C |
| LT-024 | Táblán kívüli L, V̇ kezelése | – | NINCS szabály (nyitott) | 1F 77–78. o. | – | L=45 m → szabály kell |
| LT-025 | Részletes talajhőcserélő-számítás | – | MSZ EN 16798-5-1 (alternatív; fűtési és hűtési számításokhoz) | 1F 10.1.3.2, 78. o. | – | – |

### 10.1.4 Szellőzés energiafelhasználása ErP minősített rendszernél

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| LT-026 | Alkalmazhatóság | ErP minősítés; recirkuláció | jellemzően lakásszellőzőkre; nem kötelező; recirkuláció esetén NEM alkalmazható | 1F 10.1.4.1, 78. o. | – | Recirkulációs rendszer → 10.1.5 kell |
| LT-027 | Zónánkénti számítás, összegzés, fajlagosítás | zónák; energiahordozó; A_N | zónánként számol → energiahordozónként összegez → teljes hasznos alapterületre fajlagosít | 1F 10.1.4.1, 78. o. | – | – |
| LT-028 | Zónák összevonhatósága | fajlagos energiaigény, menetrend, légcsereszám, légkezelő, befúvási hőm. | azonos zónába sorolható, ha a bemenő adatok közel azonosak | 1F 10.1.4.1, 78. o. | – | – |
| LT-029 | Utófűtő végső energia (ErP) | Q_F,UF,1/2n,friss [kWh]; MISC; ε_LT,UF; CTRL | Q_F,UF,n = Q_F,UF,1/2n,friss · MISC · ε_LT,UF / CTRL [kWh/év] (a forrásban „CRTL” és „1/2n” index – lásd anomáliák) | 1F 10.1.4.1, (10.15), 78. o. | modszer/szellozes.json#tabla_10_2, modszer/szellozes.json#tabla_10_3 | 1000 kWh, MISC 1,1, ε 1,1, CTRL 1,2 → 1008,3 kWh |
| LT-030 | ε_LT,UF azonos energiaforrásnál | ε_F | ha az utófűtés energiaforrása = egyéb (nem lég-) fűtési rendszeré → ε_LT,UF = ε_F | 1F 10.1.4.1, 78. o.; 10.1.5.1, 79. o. | – | – |
| LT-031 | Előfűtő végső energia (ErP) | Q_F;EF,n; ε_LT,EF | Q_F,EF,n = Q_F;EF,n · ε_LT,EF | 1F 10.1.4.1, (10.16), 78. o. | – | – |
| LT-032 | Villamos előfűtés teljesítménytényezője | – | ε_LT,EF = 1 | 1F 10.1.4.1, 78. o.; 10.1.5.1, 79. o. | modszer/szellozes.json#alapertekek_10_konstansok | – |
| LT-033 | Ventilátor villamos energia (ErP) | V̇_LT,n [m³/h]; MISC; SPI [kW/(m³/h)]; Δt_LT,a,n [h]; CTRL; x | W_vent,n = V̇_LT,n · MISC · SPI · Δt_LT,a,n / CTRL^x [kWh/év] | 1F 10.1.4.1, (10.17), 78. o. | modszer/szellozes.json#tabla_10_2, modszer/szellozes.json#tabla_10_3, modszer/szellozes.json#tabla_10_4 | 150 m³/h, MISC 1,1, SPI 0,0003, 8760 h, CTRL 1,2, x 1,2 → 433,62 / 1,2^1,2 ≈ 348,4 kWh |
| LT-034 | MISC felvétele | légcsatornázott-e | légcsatornával 1,1; légcsatorna nélkül 1,21 | 1F 10.2. tábl., 79. o. | modszer/szellozes.json#tabla_10_2 | – |
| LT-035 | CTRL felvétele | vezérlés típusa | kézi 1,0; időzítős 1,2; központi igényvezérlés 1,5; helyi igényvezérlés 2,0 | 1F 10.3. tábl., 79. o. | modszer/szellozes.json#tabla_10_3 | – |
| LT-036 | x kitevő felvétele | motor és vezérlés | on/off, egyfokozatú 1,0; 2 fok. 1,2; 3 fok. 1,5; fokozatmentes 2,0 | 1F 10.4. tábl., 79. o. | modszer/szellozes.json#tabla_10_4 | – |
| LT-037 | SPI adatforrás | gyártói adatlap; forgalomba hozatal dátuma | SPI a gyártói információs adatlapról; 2018.01.01. után forgalomba hozott készüléknél kötelező megadni | 1F 10.1.4.1, 78. o. | modszer/szellozes.json#alapertekek_10_konstansok | 2018 előtti készülék SPI nélkül → (nyitott: mi az alapérték) |
| LT-038 | 2. üzemállapot | – | a számítás az 1. üzemállapottal azonos módon végezhető | 1F 10.1.4.1, 78. o. | – | – |

### 10.1.5 Végső energiaigény egyszerűsített módszerrel

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| LT-039 | Utófűtő végső energia | Q_F,UF,n,friss; Q_F,LT,recirk,n; f_LT [-]; Q_F,LT,lcs [kWh]; ε_LT,UF | Q_F,UF,n = [(Q_F,UF,n,friss + Q_F,LT,recirk,n) · (1 + f_LT) + Q_F,LT,lcs] · ε_LT,UF | 1F 10.1.5, (10.18), 79. o. | modszer/szellozes.json#tabla_10_5 | 840 kWh, f=0,10, lcs=0, ε=1,1 → 1016,4 kWh |
| LT-040 | Előfűtő végső energia | Q_F;EF,n; ε_LT,EF | Q_F,EF,n = Q_F;EF,n · ε_LT,EF | 1F 10.1.5, (10.19), 79. o. | – | – |
| LT-041 | Ventilátor villamos energia | V̇_LT,n,friss, V̇_LT,n,recirk [m³/h]; Δp_LT [Pa]; η_vent,n [-]; Δt_LT,a,n [h] | W_vent,n = (V̇_LT,n,friss + V̇_LT,n,recirk) · Δp_LT / (3600 · η_vent,n) · Δt_LT,a,n / 1000 | 1F 10.1.5, (10.20), 79. o. | modszer/szellozes.json#tabla_10_8 | 3600 m³/h, 500 Pa, η 0,55, 2000 h → 1818,2 kWh |
| LT-042 | Üzemállapotok összegzése | n üzemállapot eredményei | teljes energiaigény = Σ_n (üzemállapotonkénti energiaigények) | 1F 10.1.5, 79. o. | – | – |
| LT-043 | Léghevítés teljesítménytényezője | hőtermelő | a léghevítéshez hőt biztosító hőtermelőé; azonos forrásnál ε_LT,UF = ε_F; villamos előfűtésnél ε_LT,EF = 1 | 1F 10.1.5.1, 79. o. | – | – |
| LT-044 | Illesztési pontatlanság f_LT | befúvási hőmérséklet (> vagy < 20 °C); szabályozás módja | 20 °C felett: helyiségenkénti 5%; központi előszab. helyiségenkénti nélkül 10%; sem központi sem helyiségenkénti 30%; 20 °C alatt 0% | 1F 10.1.5.2, 10.5. tábl., 79–80. o. | modszer/szellozes.json#tabla_10_5 | θ_bef=18 °C → f=0; pontosan 20 °C → nem definiált |
| LT-045 | Légelosztás hővesztesége – alkalmazási feltétel | θ_bef, θ_környezet | csak ha θ_bef − θ_környezet > 15 K; egyébként Q_F,LT,lcs = 0 (következtetés) | 1F 10.1.5.3, 80. o. | modszer/szellozes.json#alapertekek_10_konstansok | Δθ=15 K → nincs veszteség; 16 K → számolni kell |
| LT-046 | Kör keresztmetszetű légcsatorna hővesztesége | U_kör [W/mK]; l_v [m]; θ_bef, θ_i;F [°C]; f_v; Δt_LT,n [h] | Q_F,LT,lcs,n = U_kör · l_v · (θ_bef − θ_i;F) · f_v · Δt_LT,n / 1000 (a forrásban „lcs,nn” és „Δt_LT,” index) | 1F 10.1.5.3, (10.21), 80. o. | modszer/szellozes.json#tabla_10_6 | d=200, 20 mm, 4 m/s → 1,03; 20 m, 15 K, fv=1, 2000 h → 618 kWh |
| LT-047 | Négyszög keresztmetszetű légcsatorna hővesztesége | U_nsz [W/m²K]; a, b [m]; l_v; θ_bef; θ_i;F; f_v; Δt_LT,n | Q_F,LT,lcs,n = U_nsz · 2 · (a + b) · l_v · (θ_bef − θ_i;F) · f_v · Δt_LT,n / 1000 | 1F 10.1.5.3, (10.22), 80. o. | modszer/szellozes.json#tabla_10_7 | – |
| LT-048 | U_kör kiolvasása | d [mm] 100…1600; szigetelés 0/20/50 mm; w_lev 2/4/6 m/s | 10.6. táblázat | 1F 10.6. tábl., 80. o. | modszer/szellozes.json#tabla_10_6 | d=500, szig. nélkül, 6 m/s → 8,30 |
| LT-049 | U_nsz kiolvasása | w_lev 1…6 m/s; szigetelés 0…100 mm | 10.7. táblázat | 1F 10.7. tábl., 80–81. o. | modszer/szellozes.json#tabla_10_7 | 3 m/s, 50 mm → 0,70; 2 m/s, 60 mm → 0,69 (anomália) |
| LT-050 | Légcsatorna veszteségtényező f_v | légcsatorna helye | fűtött téren kívül f_v = 1; fűtött térben f_v = 0,15 | 1F 10.1.5.3, 81. o. | modszer/szellozes.json#alapertek_10_1_5_3_fv | – |
| LT-051 | Ventilátor összhatásfok alapértéke | V̇_LT [m³/h] | V̇ ≥ 10000: 0,70; 1000 ≤ V̇ < 10000: 0,55; V̇ < 1000: 0,40 (pontosabb adat hiányában; „2010 előtt”) | 1F 10.1.5.4, 10.8. tábl., 81. o. | modszer/szellozes.json#tabla_10_8 | V̇=1000 → 0,55; V̇=999 → 0,40 |
| LT-052 | Szellőző rendszer villamos segédenergiája | W_LT,s,j [kWh/év] berendezésenként | W_LT,s = Σ_j W_LT,s,j (a rendszer ismeretében meghatározva; több rendszer összegezve) | 1F 10.1.5.5, (10.23), 81. o. | – | Hővisszanyerő + helyi szabályozás összege |
| LT-053 | Részletes szellőzési módszer | – | MSZ EN 16798-3, MSZ EN 16798-5-2 (és a szövegben ismét „MSZ EN 16798-5-2”) – alternatív | 1F 10.2, 81. o. | – | – |


## M5. Hűtés, világítás, nyereségáramok, komplex indikátorok (1. Függelék 11–14. fejezet)

### 11. Hűtési rendszer energiafelhasználása (82–83. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| HUT-001 | Gépi hűtés végső energiaigénye energiahordozónként (egyszerűsített) | Q_H,net [kWh/év v. kWh/időszak], c_H [-], ε_H,szab [-], ε_H,száll [-], ε_H [-] | `Q_H,vég,j = Σ Q_H,net · c_H · ε_H,szab · ε_H,száll · ε_H` | 1. függ. 11.1, (11.1) egy., 82. o. | modszer/hutes.json#tabla_11_1, modszer/hutes.json#tabla_11_2, modszer/hutes.json#tabla_11_3 | Q_H,net=10 000 kWh, fan-coil 6/12 (c_H=1,25; ε_H,szab=1,130), split (ε_H=0,40), ε_H,száll=1 → 5650 kWh/év |
| HUT-002 | Összegzési szabály (11.1): különböző, de azonos energiahordozójú zónák igényét összegezni; egy zónában több azonos energiahordozójú rendszer energiamennyiségeit is összegezni | zónák, rendszerek, energiahordozó | Σ energiahordozónként (j index = energiahordozó) | 1. függ. 11.1, 82. o. | – | 2 zóna, villamos + gáz hűtőgép → 2 külön Q_H,vég,j |
| HUT-003 | A hő- és villamos energiát külön kell meghatározni (energiahordozónként) | energiahordozó | Q_H,vég (hő, pl. gázmotoros HP) és W_H,vég (villamos) elkülönítve | 1. függ. 11.1, 82. o. | – | Gázüzemű HP → Q_H,vég földgáz energiahordozóra |
| HUT-004 | Q_H,net forrása: a 6.8. pont szerinti nettó hűtési energiaigény (egyszerűsített esetben) | Q_H,net [kWh] | hivatkozás 6.8. pontra | 1. függ. 11.1, 82. o. | – | Bemenet a nettó-igény modulból |
| HUT-005 | Hűtés villamos segédenergiája | W_H,seg [kWh/év v. kWh/időszak] | `W_H,vég = Σ W_H,seg` | 1. függ. 11.1, (11.2) egy., 82. o. | – | 2 zóna 100 + 50 kWh → 150 kWh |
| HUT-006 | Segédenergiába csak a SEER által nem tartalmazott tételek számíthatók be | W_H,seg tételek | ellenőrzés: SEER-ben foglalt tétel kizárva | 1. függ. 11.1, 82. o. | – | Kompresszor-ventilátor (SEER része) nem adható hozzá |
| HUT-007 | Összegzési szabály (11.2): zónák és egy zónán belül több rendszer segédenergiája összegzendő | zónák, rendszerek | Σ | 1. függ. 11.1, 82. o. | – | – |
| HUT-008 | Alapérték: egyszerűsített esetben W_H,vég = 0 | – | `W_H,vég = 0 kWh/év` | 1. függ. 11.1, 82. o. | modszer/hutes.json#alapertekek_11 | Egyszerűsített módszer → W_H,vég = 0 |
| HUT-009 | Látens hőigény korrekció: c_H a hűtőközeg-hőmérséklet / rendszer szerint | rendszertípus | 11.1. táblázat: 16/18 °C → 1,00; 6/12 °C → 1,25; közvetlen elpárologtatás (5 °C) → 1,45 | 1. függ. 11.1.1, 11.1. tábl., 82. o. | modszer/hutes.json#tabla_11_1 | Klímagerenda → c_H=1,00 |
| HUT-010 | Választási szabály: ha a gépi hűtés látens hőigényét MSZ EN ISO 52016-1 szerint külön számítják, c_H nem alkalmazható (c_H := 1) | számítási mód | `ha latens_52016 → c_H = 1` | 1. függ. 6.9, 51. o. (hivatkozás a 11.1.1-re) | – | Látens külön számolva + fan-coil → c_H=1 |
| HUT-011 | Hűtési teljesítménytényező elektromos hőszivattyúnál | SEER [-] | `ε_H = 1 / SEER` | 1. függ. 11.1.2, (11.3) egy., 82. o. | – | SEER=5,0 → ε_H=0,20 |
| HUT-012 | SEER / ε_H alapérték hűtőgép-típus szerint (gyártói adat hiányában) | hűtőgép típusa | 11.2. táblázat (8 sor) | 1. függ. 11.1.2, 11.2. tábl., 82–83. o. | modszer/hutes.json#tabla_11_2 | Turbó vízhűtéses folyadékhűtő → SEER 7,0, ε_H 0,14 |
| HUT-013 | Földgáz üzemű hőszivattyú ε_H értéke a táblázatból (hőenergia, földgáz energiahordozó) | hulladékhő hasznosítva igen/nem | 0,58 / 0,71 | 1. függ. 11.2. tábl., 83. o. | modszer/hutes.json#tabla_11_2 | Hulladékhő hasznosítva → ε_H=0,58 (lásd anomália A-HUT-1) |
| HUT-014 | Passzív (hőszivattyú nélküli) talajhőcserélős hűtés, ismeretlen hidraulika esetén: 1 kWh segédenergia (W_H,s) → 10 kWh nettó hűtési hőigény-csökkenés | W_H,s [kWh], fedezett hűtési igény [kWh] | `W_H,s = Q_H,passzív / 10` (értelmezés) | 1. függ. 11.1.2, 83. o. | modszer/hutes.json#alapertekek_11 | 5000 kWh passzívan fedezett igény → 500 kWh W_H,s |
| HUT-015 | Elosztási veszteség egyszerűsített módszernél elhanyagolható | – | `ε_H,száll = 1` | 1. függ. 11.1.3, 83. o. | modszer/hutes.json#alapertekek_11 | – |
| HUT-016 | Elosztási veszteség részletes módszere (alternatív): MSZ EN 15316-3 (a szövegben „MSZ-EN-15316-3”) | – | szabvány | 1. függ. 11.1.3, 83. o. | – | – |
| HUT-017 | Szabályozási veszteségtényező hőhordozó / rendszer szerint | rendszer | 11.3. táblázat: víz 6/12 → 1,130; 8/14 → 1,100; 14/18 → 1,000; 16/18 → 1,000; 18/20 → 1,100; levegő passzív → 1,000; levegő aktív → 1,100; direkt elpárologtatás → 1,130 | 1. függ. 11.1.4, 11.3. tábl., 83. o. | modszer/hutes.json#tabla_11_3 | Padlóhűtés 18/20 → 1,100 |
| HUT-018 | Részletes módszer (alternatív): MSZ EN 16798-13, MSZ EN 16798-15, MSZ EN 16798-9 | – | szabványok | 1. függ. 11.2, 83. o. | – | – |

### 12. A beépített világítás energiafelhasználása (84–86. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| VIL-001 | Kizárás: lakóépületnél a beépített világítás nem számítható be | rendeltetés | `ha lakóépület → W_V,vég = 0 (nem része a mérlegnek)` | 1. függ. 12, 84. o. | – | Lakóépület → világítás tag üres |
| VIL-002 | Kizárás: udvari, utcai, közterületi világítás nem vehető figyelembe | világítás helye | kizárás | 1. függ. 12, 84. o. | – | – |
| VIL-003 | Beépített világítás éves végső villamosenergia-igénye (egyszerűsített) | F_fe [-], P_j [W/m²], F_szab [-], t_nappal [h/év], F_nappal [-], t_éjjel [h/év], w_vész, w_standby [kWh/(m² év)], A_j [m²] | `W_V,vég = Σ_j ( F_fe · P_j · F_szab · (t_nappal · F_nappal + t_éjjel) / 1000 + w_vész + w_standby ) · A_j` [kWh/év] | 1. függ. 12.1, (12.1) egy., 84. o. | modszer/vilagitas.json#tabla_12_3, modszer/vilagitas.json#tabla_12_5, modszer/vilagitas.json#tabla_12_6, modszer/vilagitas.json#tabla_12_7, modszer/vilagitas.json#alapertekek_12 | Iroda, P=10 W/m², Ffe=1, Fszab=0,975 (aut. be/dimm., Fk=0,2), Fnappal=0,45, 2250/250 h, w_vész=1, w_standby=1,5, A=100 m² → (9,75·(1012,5+250)/1000+2,5)·100 = 1480,9 kWh/év |
| VIL-004 | Fajlagos névleges villamos teljesítmény zónánként | MV [lx], FH [lm/W], η_vil [-] | `P_j = MV / (FH · η_vil)` [W/m²] | 1. függ. 12.1, (12.2) egy., 84. o. | modszer/vilagitas.json#tabla_12_1, modszer/vilagitas.json#tabla_12_2 | MV=500 lx, LED (FH=120, η=0,5) → 8,33 W/m² |
| VIL-005 | MV előírt megvilágítás a 2. Függelék 2.1. táblázatából (zóna/helyiség funkció szerint) | funkció | táblázati érték | 1. függ. 12.1, 84. o.; 2. függ. 2.1. tábl. | (2. Függelék feladat) | – |
| VIL-006 | Fényforrás fényhasznosítása FH | fényforrás | 12.1. táblázat: izzó 15; halogén 20; fénycső 75; kompakt 70; higany 50; fémhalogén 87; LED 120 lm/W | 1. függ. 12.1. tábl., 85. o. | modszer/vilagitas.json#tabla_12_1 | Fémhalogén → 87 |
| VIL-007 | Fényforrás (lámpatest) hatásfoka η_vil | búra típusa | 12.2. táblázat: üvegburás/parabolatükrös 0,5; opál burás 0,3; LED minden változatban 0,5 | 1. függ. 12.2. tábl., 85. o. | modszer/vilagitas.json#tabla_12_2 | LED → 0,5 búrától függetlenül |
| VIL-008 | Fényerő-szabályozhatósági tényező F_fe | világítási rendszer | 12.3. táblázat: nem dimmelhető 1; dimm. halogén 0,9; dimm. fénycső 0,8; dimm. LED 0,7 | 1. függ. 12.3. tábl., 85. o. | modszer/vilagitas.json#tabla_12_3 | – |
| VIL-009 | Kihasználtsági mutató F_kihaszn épületfunkció szerint | épület funkciója | 12.4. táblázat (0 … 0,5) | 1. függ. 12.4. tábl., 85. o. | modszer/vilagitas.json#tabla_12_4 | Sportcsarnok → 0,3 |
| VIL-010 | Szabályozási tényező F_szab = f(szabályozás típusa, F_kihaszn) | szabályozás típusa, F_kihaszn | 12.5. táblázat (5 sor × 11 oszlop) | 1. függ. 12.5. tábl., 85. o. | modszer/vilagitas.json#tabla_12_5 | Kézi be/ki, Fk=0,3 → 0,90 |
| VIL-011 | Ellenőrzés: F_kihaszn = 0 esetén F_szab = 1 minden szabályozástípusra | – | 12.5. táblázat 0,0 oszlop | 1. függ. 12.5. tábl., 85. o. | modszer/vilagitas.json#tabla_12_5 | Múzeum → F_szab=1 |
| VIL-012 | Éves üzemórák (nappali / éjszakai) épülettípus szerint | épülettípus | 12.6. táblázat; t_össz = t_nappal + t_éjjel | 1. függ. 12.6. tábl., 86. o. | modszer/vilagitas.json#tabla_12_6 | Kórház → 3000/2000/5000 |
| VIL-013 | Természetes megvilágítás tényező F_nappal homlokzati üvegezési arány szerint | üvegezési arány [%] (teljes homlokzatra) | 12.7. táblázat: >80% → 0,35; 40–80% → 0,45; <40% → 0,55; nincs természetes világítás → 1,00 | 1. függ. 12.7. tábl., 86. o. | modszer/vilagitas.json#tabla_12_7 | 50% → 0,45; határérték 40%/80%: lásd A-VIL-3 |
| VIL-014 | Vészvilágítás fajlagos energiaigénye | van/nincs vészvilágítás | `w_vész = 0` ha nincs; `w_vész = 1 kWh/(m² év)` ha van | 1. függ. 12.1, 84. o. | modszer/vilagitas.json#alapertekek_12 | – |
| VIL-015 | Vezérlés készenléti energiaigénye | van/nincs stand-by | `w_standby = 0` ha nincs; `w_standby = 1,5 kWh/(m² év)` ha van | 1. függ. 12.1, 84. o. | modszer/vilagitas.json#alapertekek_12 | – |
| VIL-016 | A_j: a zóna nettó alapterülete | A_j [m²] | bemenet | 1. függ. 12.1, 84. o. | – | – |
| VIL-017 | Részletes módszer (alternatív): MSZ EN 15193-1 | – | szabvány | 1. függ. 12.2, 86. o. | – | – |

### 13. Az épület energetikai rendszereiből származó nyereségáramok (87–88. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| MEG-001 | Helyben termelt, nem szabályozott fogyasztóknak vagy hálózatba exportált villamos energia külön számítandó (PV, szél, gázmotor) | termelők | külön mérlegtétel (W_exp) | 1. függ. 13.1, 87. o. | – | – |
| MEG-002 | Egyszerűsített módszer: a helyben termelt villamos energia teljes mennyisége exportáltként számolható el; ekkor az épületben használt villamos energia teljes egészében hálózatról vételezett | W_termelt [kWh/év] | `W_exp = W_termelt`; `W_vég` változatlan (hálózati) | 1. függ. 13.1, 87. o. | – | PV 5000 kWh → W_exp=5000, W_vég nem csökken |
| MEG-003 | Kettős elszámolás tilalma: ugyanaz az energia nem számolható el kétszer | – | ellenőrzés | 1. függ. 13.1, 87. o. | – | Ugyanaz a PV-termelés nem csökkentheti W_vég-et és nem lehet W_exp is |
| MEG-004 | Napelemek éves termelése (egyszerűsített) | w_PV [kWh/év/kWp], P_PV,össz [kWp] | `W_PV = w_PV · P_PV,össz` [kWh/év] | 1. függ. 13.2.1, (13.1) egy., 87. o. | modszer/megujulok.json#tabla_13_1 | 5 kWp, D, 30° → 5400 kWh/év |
| MEG-005 | Alkalmazhatósági feltétel: P_PV,össz ≤ 20 kWp és mono- vagy polikristályos napelem; egyébként részletes módszer / szoftver | P_PV,össz, cellatípus | `ha P_PV,össz > 20 kWp vagy nem mono/poli → (13.1) nem alkalmazható` | 1. függ. 13.2.1, 87. o. | modszer/megujulok.json#alapertekek_13 | 25 kWp → hiba/részletes módszer |
| MEG-006 | Fajlagos termelés w_PV tájolás (K/Ny, DK/DNy, D) és hajlásszög (0–90°, 10°-os lépés) szerint | tájolás, hajlásszög [°] | 13.1. táblázat | 1. függ. 13.1. tábl., 87. o. | modszer/megujulok.json#tabla_13_1 | K, 90° → 527 |
| MEG-007 | Ellenőrzés: 0° hajlásszögnél w_PV tájolásfüggetlen (942) | – | 13.1. táblázat 0° sor | 1. függ. 13.1. tábl., 87. o. | modszer/megujulok.json#tabla_13_1 | – |
| MEG-008 | Napelem részletes módszere (alternatív): MSZ EN 15316-4-3, vagy a tervezői gyakorlatban elfogadott szoftverek | – | szabvány / szoftver | 1. függ. 13.2.2, 87. o. | – | – |
| MEG-009 | Szélenergia (helyben vagy közelben termelt, épületben felhasznált): MSZ EN 15316-4-10 szerint (egyetlen megadott módszer, egyszerűsített nincs) | meteorológiai adatok | szabvány; meteo: 2. Függelék 1.1. pont | 1. függ. 13.3, 87. o. | (2. Függelék feladat) | – |
| MEG-010 | Kapcsolt energiatermelés (gázmotor hő- és villamos energia): MSZ EN 15316-4-4 szerint (egyetlen megadott módszer) | – | szabvány | 1. függ. 13.4, 88. o. | – | – |

### 14. Az épület komplex indikátorai (89–91. o.)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| IND-001 | Összesített súlyozott energetikai teljesítmény | E_F,E_HMV,E_LT,E_H,E_vil,E_exp (súlyozott) [kWh/év v. kg CO2/év] | `E_súlyozott = E_F,súlyozott + E_HMV,súlyozott + E_LT,súlyozott + E_H,súlyozott + E_vil,súlyozott − E_exp,súlyozott` | 1. függ. 14, (14.1) egy., 89. o. | – | Összeg-ellenőrzés |
| IND-002 | Fűtés súlyozott energiaigénye | Q_F,vég,i, W_F,vég,i [kWh/év], F_fé/éh [-], f_súly,i | `E_F,súlyozott = Σ_i Q_F,vég,i · F_fé/éh · f_súly,i + Σ_i W_F,vég,i · f_súly,i` | 1. függ. 14, (14.2) egy., 89. o. | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok; F_fé/éh: 2. függ. 3.1. tábl. | Gáz Q=10 000 kWh, F_fé/éh=0,90, f_nren=1,1 → 9900 kWh |
| IND-003 | HMV súlyozott energiaigénye | Q_HMV,vég,i, W_HMV,vég,i, F_fé/éh, f_súly,i | `E_HMV,súlyozott = Σ_i Q_HMV,vég,i · F_fé/éh · f_súly,i + Σ_i W_HMV,vég,i · f_súly,i` | 1. függ. 14, (14.3) egy., 89. o. | u.a. | – |
| IND-004 | Légtechnika súlyozott energiaigénye | Q_LT,vég,i, W_LT,vég,i, F_fé/éh, f_súly,i | `E_LT,súlyozott = Σ_i Q_LT,vég,i · F_fé/éh · f_súly,i + Σ_i W_LT,vég,i · f_súly,i` | 1. függ. 14, (14.4) egy., 89. o. | u.a. | – |
| IND-005 | Hűtés súlyozott energiaigénye | Q_H,vég,i, W_H,vég,i, F_fé/éh, f_súly,i | `E_H,súlyozott = Σ_i Q_H,vég,i · F_fé/éh · f_súly,i + Σ_i W_H,vég,i · f_súly,i` | 1. függ. 14, (14.5) egy., 89. o. | u.a. | Split, Q_H,vég=5650 kWh villamos, f_nren=2,3 → 12 995 kWh |
| IND-006 | Világítás súlyozott energiaigénye | W_vil,vég,i [kWh/év], f_súly,i | `E_V,súlyozott = Σ_i W_vil,vég,i · f_súly,i` | 1. függ. 14, (14.6) egy., 89. o. | u.a. | 1480,9 kWh × 2,3 = 3406 kWh |
| IND-007 | F_fé/éh: az energiahordozó fűtőérték/égéshő hányadosa – csak a Q (hő-/tüzelőanyag) tagokra | energiahordozó | 2. Függelék 3. pont (3.1. táblázat: földgáz 0,90; fa, biomassza 0,93; szén 0,96; olaj 0,94; nem éghető 1,0) | 1. függ. 14, 89. o.; 2. függ. 3.1. tábl. | (2. Függelék feladat) | Villamos / távhő → 1,0 |
| IND-008 | Választási szabály: f_súly típusa – f_nren, f_ren, f_tot vagy f_CO2; mind a négy indikátort ugyanazzal a képletlánccal kell számítani | indikátor | E_nren, E_ren, E_tot, E_CO2 | 1. függ. 14, 89–90. o.; 14.2, 90. o. | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok | Ugyanarra a bemenetre 4 eredmény |
| IND-009 | Súlyozó tényezők energiahordozónként (fűtőértéken számított végsőenergiára) | energiahordozó | ÉKM 7. mell. 2. pont táblázat (17 sor; pl. gáz 1,1/0/1,1/297; villamos 2,3/0,3/2,6/455; PV 0/1/1/74) | 1. függ. 14.2, 90. o. → ÉKM 7. mell. 2. pont | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok | Villamos f_CO2eq=455 g/kWh |
| IND-010 | f_CO2eq mértékegység-átváltás: a 7. mell. g/kWh, a (14.1)–(14.14) kg CO2 egységben → ÷1000 | f_CO2eq [g/kWh] | `f_CO2 [kg/kWh] = f_CO2eq / 1000` | ÉKM 7. mell. 2. pont; 1. függ. (14.1) | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok | 1000 kWh villamos → 455 kg CO2 |
| IND-011 | Szilárd biomassza: a 6. sor („Szilárd(*)”: 0,2/1,0/1,2/40) csak a 7. mell. 3.1–3.5 pont szerinti hőtermelőkre; egyébként 5. sor (0,6/0,6/1,2/40) | hőtermelő típusa, teljesítmény, beépítés dátuma, megfelelőség | választás | ÉKM 7. mell. 2. pont (*) lábj., 3. pont | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#szilard_bio_kedvezmenyes_feltetelek | 30 kW pellet kályha, 2015/1185 megfelel → 0,2 |
| IND-012 | Atomerőművek önfogyasztása: f_nren = f_ren = f_tot = f_CO2eq = 0 | – | lábjegyzet (**) | ÉKM 7. mell. 2. pont (**) lábj. | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok | – |
| IND-013 | Távhő / távhűtés tényezői főszabályként a 8. melléklet szerint; a táblázati 1,38/0/1,38/374 csak a 8. § (1) szerinti kötelezettség elmulasztásakor | szolgáltatói adat | választás | ÉKM 7. mell. 2. pont (***) lábj. | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok | Szolgáltatói adat hiányában → 1,38 |
| IND-014 | Exportált súlyozott energia | W_exp,i, Q_exp,i [kWh/év], f_súly,exp,i, f_súly,term,i | `E_exp,súlyozott = Σ_i W_exp,i · (f_súly,exp,i − f_súly,term,i) + Σ_i Q_exp,i · (f_súly,exp,i − f_súly,term,i)` | 1. függ. 14, (14.7) egy., 89. o. | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok (17–18. sor exp., 13. sor PV) | PV 5400 kWh exportált, nren: 5400·(2,3−0) = 12 420 kWh; CO2: 5400·(455−74)/1000 = 2057 kg |
| IND-015 | f_súly,exp: exportált (kiváltott) villamos energia – hálózatba / nem szabályozott fogyasztóknak: 2,3/0,3/2,6/455 | export típusa | 7. mell. 17–18. sor | ÉKM 7. mell. 2. pont | rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json#sulyozo_tenyezok | – |
| IND-016 | Szabály: PV által termelt, az épületben használt, de a függelék szerint figyelmen kívül hagyandó (háztartási, irodagép, technológia) villamos energia exportáltnak tekintendő | W_PV, nem szabályozott fogyasztás | `W_exp += W_PV,nem_szabályozott` | 1. függ. 14, 89. o. | – | Irodagépek által felhasznált PV-áram → W_exp |
| IND-017 | Szabály: a végenergiába nem számíthatók be a nettó igényt csökkentő tételek | – | ellenőrzés | 1. függ. 14, 89. o. | – | – |
| IND-018 | Fajlagos súlyozott energetikai teljesítmény | E_súlyozott, A_N [m²] | `E_súlyozott,fajl = E_súlyozott / A_N` [kWh/(m² év) v. kg CO2/(m² év)] | 1. függ. 14.1, (14.8) egy., 90. o. | – | – |
| IND-019 | Fajlagos súlyozott igények felhasználási célonként | E_X,súlyozott, A_N | `E_X,súlyozott,fajl = E_X,súlyozott / A_N`, X ∈ {F (14.9), HMV (14.10), LT (14.11), H (14.12), V (14.13), exp (14.14)} | 1. függ. 14.1, (14.9)–(14.14) egy., 90. o. | – | Σ célonkénti fajlagos − exp = (14.8) |
| IND-020 | Összesített energetikai jellemző = E_nren,fajl (fajlagos nem megújuló primerenergia-igény A_N-re és évre) | E_nren, A_N | `E_nren,fajl = E_nren / A_N` | ÉKM 2. § 37. pont (fogalom); 1. függ. 14.1 | – | – |
| IND-021 | Fajlagos CO2-kibocsátás = E_CO2,fajl | E_CO2, A_N | `E_CO2,fajl = E_CO2 / A_N` | 1. függ. 14.1, (14.8); ÉKM 6. § (1) | – | – |
| IND-022 | Életciklus-szakaszok a tényezőkben (tájékoztató; a végsőenergia fűtőérték alapján) | – | 14.1. táblázat | 1. függ. 14.2, 14.1. tábl., 90. o. | modszer/indikatorok.json#tabla_14_1 | – |
| IND-023 | Megújuló energia kategóriák külön összegzése: E_passzív, E_ren,helyben, E_ren,exp, E_ren,közel, E_ren,távol | kategóriánkénti energia [kWh/év] | 5 külön tétel | 1. függ. 14.3, 91. o. | – | – |
| IND-024 | Összes hasznosított megújuló primerenergia | E_passzív, E_ren,helyben, E_ren,exp, E_ren,közel, E_ren,távol | `E_ren,tot = E_passzív + E_ren,helyben + E_ren,exp + E_ren,közel + E_ren,távol` | 1. függ. 14.3, 91. o. | – | – |
| IND-025 | „Közelben előállított” minősítés: a létesítményt az épület ellátására, azzal együtt hozták létre, engedélyezték, és a használatbavételhez üzembe helyezték; termelt energia hasznos alapterület szerint szétosztva | feltételek, A_N | választás + arányos szétosztás | 1. függ. 14.3, 91. o. | – | 2 épület 1000/3000 m² → 25%/75% |
| IND-026 | Távfűtés / távhűtés által szolgáltatott megújuló energia mindig „közelben előállított” | – | `→ E_ren,közel` | 1. függ. 14.3, 91. o. | – | – |
| IND-027 | Hőszivattyú megújuló primerenergia: a Q_F/HMV/LT,vég,i tag helyett Q·(1/ε − 1) | Q_F/HMV/LT,vég,i, ε_F/HMV/LT | `Q_ren,HP = Q_vég,i · (1/ε_F/HMV/LT − 1)` | 1. függ. 14.3, 91. o. | – | ε=0,25, Q_vég=2000 → 6000 kWh |
| IND-028 | Feltétel: hőszivattyús megújuló csak ha ε_F/HMV/LT ≤ 0,37, felhasználási célonként külön | ε | `ha ε > 0,37 → megújuló = 0` | 1. függ. 14.3, 91. o. | modszer/indikatorok.json#alapertekek_14 | ε_F=0,30 ok; ε_HMV=0,40 → HMV-re nem |
| IND-029 | Hűtési üzemű hőszivattyú: a helyiségből elvont, környezetbe leadott hő nem megújuló | – | kizárás | 1. függ. 14.3, 91. o. | – | – |
| IND-030 | Megújuló energia részarány (RER, %) – a jelöléslista tartalmazza, de a 14. fejezet nem ad képletet | – | NINCS MEGADVA (lásd A-IND-1) | 1. függ. jelöléslista, 10. o. | – | – |


## M6. Referenciaértékek: éghajlat, profilok, energiahordozók, nyílászárók (2. Függelék)

### 1. Éghajlati adatok (KLI)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| KLI-001 | Részletes módszer / dinamikus szimuláció: órai bontású klíma-adatfile használata kötelező | – | adatfile paraméterei: külső léghőmérséklet; abszolút és relatív nedvességtartalom, parciális vízgőznyomás, légnyomás; szélsebesség és irány; sugárzás vízszintes felületre (globál, direkt, diffúz, infravörös) és 8 tájolásra | 9/2023 ÉKM 2. függ. 1.1, 1. o.; 1. függ. 3.4, 21. o. | `modszer/eghajlat.json#f2_1_1_reszletes_adatfajl_parameterek` | Szimulációs projektnél ellenőrizni, hogy a betöltött adatfile mind a 4 paramétercsoportot tartalmazza. NYITOTT: az adatfile és letöltési helye nincs megadva |
| KLI-002 | Szélenergia-számítás meteorológiai adatai | – | adatok a 2. függ. 1.1 pont szerint (MSZ EN 15316-4-10) | 1. függ. 13.3, 87. o. | `modszer/eghajlat.json#f2_1_1_reszletes_adatfajl_parameterek` | – |
| KLI-003 | Havi átlagos külső hőmérséklet kikeresése (egyszerűsített módszer) | m hónap (1–12) | θ_e,átlag,m = 1.1. tábl.[m] °C: 2,1; −0,1; 3,5; 10,9; 16,8; 20,8; 21,9; 21,0; 17,8; 8,3; 7,6; −0,1 | 2. függ. 1.2.1, 1.1. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_1` | θ_e(7) = 21,9 °C; θ_e(12) = −0,1 °C |
| KLI-004 | Éves átlagos külső hőmérséklet (konstans) | – | θ_e,év = 10,9 °C | 2. függ. 1.1. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_1` (eves) | Ellenőrzés: Σ12 havi / 12 = 10,875 → 10,9 ✓ |
| KLI-005 | Szabály: hőfokhíd és fűtési idény hossza az egyensúlyi hőmérsékletkülönbség függvényében „az alábbi értékekkel” | Δθ_egyensúlyi | a forrás csak havi átlaghőmérsékletet ad (1.1. tábl.), hőfokhíd-táblázatot nem | 2. függ. 1.2.1 szövege, 1. o. | `modszer/eghajlat.json#tabla_f2_1_1` | NYITOTT: a hőfokhíd származtatásának módja nincs a 2. függ.-ben (1. függ. havi módszere használja a havi átlagot) |
| KLI-006 | Anomália-jelzés: havi hőmérsékletsor szokatlan értékei | – | feb. −0,1 < jan. 2,1; dec. −0,1; okt. 8,3 ≈ nov. 7,6 – a PDF-en így szerepel, változatlanul átvéve | 2. függ. 1.1. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_1` (megjegyzes) | Regressziós teszt: a JSON-érték pontosan −0,1 (feb.), −0,1 (dec.), 8,3 (okt.), 7,6 (nov.) – NEM „javítva” |
| KLI-007 | Bivalens/multivalens hőtermelés: hőfokgyakorisági diagram külső hőmérséklet-adatai | θ_e,m | adatok a 2. függ. 1.2.1 pont szerint | 1. függ. 6.12, 54. o. | `modszer/eghajlat.json#tabla_f2_1_1` | – |
| KLI-008 | HMV részletes számítás külső hőmérséklet- és napsugárzás-adatai | θ_e,m, G_s,i | 2. függ. 1.2.1 és 1.2.4 pont | 1. függ. 9.2.1.2, 70. o. | `modszer/eghajlat.json#tabla_f2_1_1`, `modszer/eghajlat.json#tabla_f2_1_6` | Megjegyzés: az 1. függ. hidegvíz-hőmérséklete 10,9 °C = az éves átlagos külső hőmérséklet |
| KLI-009 | Fűtési szezon átlagos külső hőmérséklete | – | θ_e,F,szezon = 3,6 °C (okt. 15. – ápr. 15.) | 2. függ. 1.2.1, 1.2. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_2` | – |
| KLI-010 | Fűtési szezon hossza | – | t_F,szezon = 4392 h | 2. függ. 1.2. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_2` | 183 nap × 24 h = 4392 ✓ |
| KLI-011 | Hűtési szezon átlagos külső hőmérséklete | – | θ_e,H,szezon = 20,6 °C (máj. 15. – szept. 15.) | 2. függ. 1.2. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_2` | – |
| KLI-012 | Hűtési szezon hossza | – | t_H,szezon = 2976 h | 2. függ. 1.2. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_2` | 124 nap × 24 h = 2976 ✓ |
| KLI-013 | Fagyvédelmi előfűtés: −4 °C alatti időtartam havonta | m hónap | Δt_EF,n,e<−4C [h]: jan 72, feb 110, márc 24, nov 1, dec 82; év 289 | 2. függ. 1.2.2, 1.3. tábl., 1. o.; felhasználás: 1. függ. 6.2.4, 45. o. és 10.1.2, 77. o. | `modszer/eghajlat.json#tabla_f2_1_3` | Feb → 110 h. Csak akkor ≠ 0, ha van fagyvédelmi előfűtés (1. függ. 45. o.) |
| KLI-014 | Fagyvédelmi előfűtés: átlagos külső hőmérséklet a −4 °C alatti időszakban | m hónap | θ_e<−4C [°C]: jan −5,82, feb −5,75, márc −6,00, nov −4,08, dec −5,51; év −5,72 | 2. függ. 1.3. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_3` | Márc → −6,00 °C |
| KLI-015 | Szabály (értelmezés): a 1.3. táblázatban nem szereplő hónapok (ápr.–okt.) | m ∈ {4..10} | Δt_EF = 0 h (nincs kimondva) | 2. függ. 1.3. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_3` | NYITOTT – implementációban 0-val, jelölt feltételezésként |
| KLI-016 | Ellenőrzés: 1.3. tábl. éves összesítő | – | Σ t = 289 h ✓; Σ(t·θ)/Σt = −5,714 °C vs. táblázat −5,72 (0,01 °C kerekítési eltérés) | 2. függ. 1.3. tábl., 1. o. | `modszer/eghajlat.json#tabla_f2_1_3` | Anomália jelezve; a −5,72 marad |
| KLI-017 | Külső relatív páratartalom havonta | m | RH [%]: 84,4; 75,3; 77,8; 69,7; 61,0; 69,7; 62,1; 71,9; 66,8; 79,5; 86,1; 84,1; év 74,0 | 2. függ. 1.2.3, 1.4. tábl., 2. o.; felhasználás: 1. függ. 6.9 (látens hőigény), 51. o. | `modszer/eghajlat.json#tabla_f2_1_4` | RH(11) = 86,1 % |
| KLI-018 | Külső légnyomás havonta | m | p_lev [kPa]: 100,1 … 100,0; év 99,9 | 2. függ. 1.4. tábl., 2. o. | `modszer/eghajlat.json#tabla_f2_1_4` | – |
| KLI-019 | Vízgőznyomás pv,t havonta | m | pv,t [Pa]: 736; 629; 825; 1358; 2006; 2537; 2710; 2556; 2126; 1131; 1085; 622; év 1531 | 2. függ. 1.4. tábl., 2. o. | `modszer/eghajlat.json#tabla_f2_1_4` | NYITOTT: a jelölés nincs feloldva; az értékek a telítési gőznyomásnak felelnek meg (x-szel visszaszámolva), nem a parciálisnak |
| KLI-020 | Abszolút nedvességtartalom havonta | m | x [g/kg]: 3,91 … 3,31; év 6,63 | 2. függ. 1.4. tábl., 2. o. | `modszer/eghajlat.json#tabla_f2_1_4` | x(jan) ≈ 622·RH·pv,t/(p−RH·pv,t) = 3,88 ≈ 3,91 |
| KLI-021 | Ellenőrzés: 1.4. tábl. éves értékei | – | RH 74,03 ✓; p_lev 99,90 ✓; x órasúlyozott 6,63 ✓; pv,t számtani 1526,75 / órasúlyozott 1531,4 ✓ (az éves érték órasúlyozott) | 2. függ. 1.4. tábl., 2. o. | `modszer/eghajlat.json#tabla_f2_1_4` | – |
| KLI-022 | Havi átlagos sugárzásintenzitás tájolás × hajlásszög szerint | tájolás ∈ {É, ÉK, K, DK, D, DNy, Ny, ÉNy}, hajlásszög ∈ {30, 45, 60, 90}°, ill. 0° (vízszintes), m | G_s,i [W/m2] = 1.5. tábl. | 2. függ. 1.2.4, 1.5. tábl., 3. o. | `modszer/eghajlat.json#tabla_f2_1_5` | D 90°, jan → 81,5 W/m2; 0°, jún → 254,2 W/m2 |
| KLI-023 | Havi sugárzási energiahozam tájolás × hajlásszög szerint (a direkt szoláris nyereség bemenete) | mint fent | G_s,i [kWh/m2] = 1.6. tábl.; felhasználás: Q_sd,F/H = Σ_i A_ü,i · g_F/H,i · g_árny,H,i · F_árny,i · G_s,i (1. függ. (6.22)) | 2. függ. 1.2.4, 1.6. tábl., 4. o.; 1. függ. 6.3.1, (6.22), 46–47. o. | `modszer/eghajlat.json#tabla_f2_1_6` | D 90°, jan → 60,6 kWh/m2; É 90° éves → 393,0 |
| KLI-024 | Szabály: a 0° hajlásszög a vízszintes felület, tájolás nélkül | hajlásszög = 0 | G_s(0°) független a tájolástól | 2. függ. 1.5–1.6. tábl., 3–4. o. | `modszer/eghajlat.json#tabla_f2_1_5`, `modszer/eghajlat.json#tabla_f2_1_6` (tajolas = „vízszintes”) | 0° bármely tájolással → ugyanaz a sor |
| KLI-025 | Szabály-hiány: köztes hajlásszögek (pl. 15°, 75°) és tájolások (pl. ÉÉK) | – | a forrás csak 0/30/45/60/90° és 8 fő tájolás értékeit adja; interpolációs szabály nincs | 2. függ. 1.2.4, 3–4. o. | – | NYITOTT – implementációs döntés szükséges (pl. legközelebbi/lineáris interpoláció) |
| KLI-026 | Ellenőrzés: 1.5 éves = órasúlyozott havi átlag | G_s,m [W/m2], hónaphossz h_m (feb. 672 h) | G_év = Σ G_m·h_m / 8760 – mind a 33 sorban ±0,05-on belül ✓ | 2. függ. 1.5. tábl., 3. o. | `modszer/eghajlat.json#tabla_f2_1_5` (_ell_eves_orasulyozott_atlag) | – |
| KLI-027 | Ellenőrzés: 1.6 = 1.5 × óraszám | G_m [W/m2], h_m | G_m[kWh/m2] = G_m[W/m2]·h_m/1000 – mind a 396 havi cellában ±0,15-ön belül ✓ | 2. függ. 1.5–1.6. tábl., 3–4. o. | `modszer/eghajlat.json#tabla_f2_1_5`, `modszer/eghajlat.json#tabla_f2_1_6` | – |
| KLI-028 | Ellenőrzés: 1.6 éves = Σ havi | G_m [kWh/m2] | 31 sor ✓; eltérés: ÉK 45° Σ = 798,5 vs. 798,3; D 30° Σ = 1480,7 vs. 1480,9 | 2. függ. 1.6. tábl., 4. o. | `modszer/eghajlat.json#tabla_f2_1_6` (_ell_havi_osszeg) | Anomália jelezve (±0,2 kerekítés); forrásérték marad |
| KLI-029 | Anomália: az 1.5. tábl. címe „energiahozam”, de az egység W/m2 (átlagos intenzitás) | – | – | 2. függ. 1.5. tábl., 3. o. | `modszer/eghajlat.json#tabla_f2_1_5` | A programban a (6.22)-be az 1.6 (kWh/m2) kerüljön, ne az 1.5 |
| KLI-030 | Árnyékoltság elhagyásának feltétele fűtésnél / hűtésnél | – | elhagyható, ha Q_sd,F az északi tájolásra vonatkozó, Q_sd,H zavartalan benapozással az adott tájolásra vonatkozó G_s-sel számolt | 1. függ. 6.3.1, 47. o. | `modszer/eghajlat.json#tabla_f2_1_6` (É sorok) | Fűtési nyereség É-i G_s-sel ≤ árnyékolt számítás |
| KLI-031 | Napkollektor-számítás meteorológiai adatai | G_s,i | 2. függ. 1.2.4 (MSZ EN 15316-4-3) | 1. függ. 8.4, 61. o. | `modszer/eghajlat.json#tabla_f2_1_5`, `modszer/eghajlat.json#tabla_f2_1_6` | – |
| KLI-032 | Külső akadályok összesített árnyékoltsági tényezője (egyszerűsített módszer) | F_h, F_v, F_f [-] | F_árny = F_h · F_v · F_f (1. függ. (6.25)) | 1. függ. 6.3.1, (6.25), 47. o.; 2. függ. 1.3, 5–19. o. | `modszer/eghajlat.json#arnyek_*` | Fh(30°,90°,D,jan)=0,48; Fv=Ff=1 → F_árny = 0,48 |
| KLI-033 | Részletes módszer árnyékoltságra | – | MSZ EN 52016-1 szerinti vagy egyenértékű többdimenziós benapozásvizsgálat (kötelező részletes módszer esetén) | 1. függ. 6.3.1 a), 47. o. | – | – |
| KLI-034 | Horizont árnyékoltsági tényező kikeresése | árnyékvető szög ∈ {10,…,70}°, hajlásszög ∈ {90, 30}°, tájoláscsoport ∈ {É, ÉNy/ÉK, Ny/K, DNy/DK, D}, m | F_h = tábla[szög][hajlásszög][tájolás][m] | 2. függ. 1.3, 6–17. o. (14 tábla); szög-értelmezés: 1.1. ábra, 5. o. | `modszer/eghajlat.json#arnyek_Fh_*` (`<szög>`, `<hajlásszög>` szerint)` | Fh 20°, 90°, Ny/K, jan → 0,84 |
| KLI-035 | Vízszintes árnyékvető tényező kikeresése | szög ∈ {30,…,90}°, csak 90° (függőleges) nyílászáró, tájoláscsoport, m | F_v = tábla[szög][tájolás][m] | 2. függ. 1.3, 9–19. o. (7 tábla); 1.2. ábra, 5. o. | `modszer/eghajlat.json#arnyek_Fv_*` (`<szög>`, `<hajlásszög>` szerint)` | Fv 50°, D, máj → 0,81 |
| KLI-036 | Függőleges árnyékvető tényező kikeresése | szög ∈ {30,…,90}°, csak 90° nyílászáró, tájoláscsoport, m | F_f = tábla[szög][tájolás][m] | 2. függ. 1.3, 9–19. o. (7 tábla); 1.3. ábra, 5. o. | `modszer/eghajlat.json#arnyek_Ff_*` (`<szög>`, `<hajlásszög>` szerint)` | Ff 90°, DNy/DK, nov → 0,63 |
| KLI-037 | Árnyékvető szögek definíciója (geometria) | magasság/távolság az üvegezés alsó (Fh), felső (Fv), oldalsó (Ff) síkjától | szög az 1.1–1.3. ábrák szerint (függőleges ill. vízszintes metszet) | 2. függ. 1.3, 1.1–1.3. ábra, 5. o.; 1. függ. 47. o. | – | Geometriai teszt: h/d = 1 → 45° |
| KLI-038 | Szabály hűtésre: árnyékoltsági tényezők elhagyása (biztonság javára) vagy korlátozott figyelembevétele | nyílászáró dőlése | dőlt síkú: csak F_h; egyéb: F_h, F_v, F_f közül „a legnagyobb” (ha van ilyen árnyékvető) | 1. függ. 6.3.1, 47. o. | `#arnyek_*` | NYITOTT: „a legnagyobb” a legnagyobb hatású (=legkisebb tényező) vagy a legnagyobb számérték? kétértelmű |
| KLI-039 | Szabály-hiány az árnyékoló-táblákban | – | nincs interpoláció a 10°-os lépések között; F_h < 10° és > 70°, F_v/F_f < 30° hiányzik; F_h csak 90° és 30° hajlásra, 45°/60°/0° hajlásra nincs; F_v/F_f csak függőlegesre | 2. függ. 1.3, 6–19. o. | `#arnyek_*` | NYITOTT – implementációs döntés (pl. szög < táblaminimum → 1,0?) |
| KLI-040 | Anomália: két árnyékoló-tábla cellánként azonos | – | „Fv – 90 fok” (19. o.) ≡ „Fh – 70 fok – 90° hajlás” (16. o.) | 2. függ. 16. és 19. o. | `#arnyek_Fv_90_hajl90`, `#arnyek_Fh_70_hajl90` | Teszt: két tábla 60 cellája azonos (forrás szerint) |
| KLI-041 | Ellenőrzés: árnyékoló-táblák monotonitása | – | minden táblacsaládban a tényező a szög növelésével nem nő ✓ | 2. függ. 6–19. o. | `#arnyek_*` | – |
| KLI-042 | Megjegyzés: árnyékoló segédtáblák számozatlanok; Ff 30° fejléce „Függőleges (90 fokos) pozíció” | – | – | 2. függ. 9. o. | `#arnyek_Ff_30_hajl90` | – |

### 2. Épületekre vonatkozó számítási profiladatok (PRF)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| PRF-001 | Szabály: lakó- és szállásjellegű épületekre a 2.1. tábl. értékei kötelezők | rendeltetés | lakóépület → 2.1. tábl. „Lakóépület egésze*” sor kötelező | 2. függ. 2. fej. bevezető + * lábjegyzet, 20. és 22. o. | `modszer/profilok.json#tabla_f2_2_1` (kotelezo) | Lakóépületnél felhasználói felülírás tiltása |
| PRF-002 | Szabály: egyéb szállásjellegű épület (szanatórium, idősek otthona, diákszálló) a lakóépületi adatokkal számolható | rendeltetés | választható: „Lakóépület egésze” sor | 2. függ. 2. fej., 20. o. | `modszer/profilok.json#tabla_f2_2_1` | – |
| PRF-003 | Szabály: markáns havi eltérésnél havi használati időt kell meghatározni a napi használati időből | t_napi [h/nap], napok/hó | t_hó = t_napi · napok_hó (mint az oktatási soroknál) | 2. függ. 2. fej., 20. o. | `modszer/profilok.json#tabla_f2_2_1` (havi_profil) | Osztályterem: 10·22 = 220 h/hó (szept.–jún.), 0 (júl.–aug.) |
| PRF-004 | Napi használati idő funkciónként | funkció | t_napi [h/nap] = 2.1. tábl. | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (napi_h) | Főzőkonyha → 13 h/nap |
| PRF-005 | Éves használati napok | funkció | nap/év = 2.1. tábl. | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (eves_nap) | Kongresszusi központ → 150 |
| PRF-006 | Éves használati óraszám | funkció | h/év = 2.1. tábl.; ellenőrzés: napi_h × nap/év = h/év minden számszerű sorban ✓ | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (eves_h) | Hotelszoba 11 × 365 = 4015 ✓ |
| PRF-007 | Szabály: „fő funkció szerint” használati idő (WC és mosdó középületben, alárendelt helyiség, közlekedő) | fő funkció | t_napi, nap/év, h/év = a fő funkció értékei | 2. függ. 2.1. tábl., 20. o. | `modszer/profilok.json#tabla_f2_2_1` (eredeti_hasznalati_ido) | Irodaházi WC → 11 h/nap, 250 nap |
| PRF-008 | Oktatási funkciók havi profilja | m | Osztályterem/óvoda: szept.–jún. 22 nap/hó, 220 h/hó; Előadó: 22 nap/hó, 154 h/hó; júl.–aug. 0 | 2. függ. 2.1. tábl., 20. o. | `modszer/profilok.json#tabla_f2_2_1` (havi_profil) | Előadó júl. → 0 h |
| PRF-009 | Fűtési idény belső (parancsolt) hőmérséklete | funkció | θ_i,F [°C] = 2.1. tábl. (általában 20; bölcsőde 23; raktár 12; fitness 18) | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (theta_i_F) | Bölcsőde → 23 °C |
| PRF-010 | Hűtési idény belső hőmérséklete | funkció | θ_i,H [°C] = 2.1. tábl. (általában 26; raktár 28) | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (theta_i_H) | Raktár → 28 °C |
| PRF-011 | Szükséges szellőzési térfogatáram üzemidőben (fajlagos) | funkció, A [m2] | V̇_LT = (V̇_LT/A)_tábla · A [m3/h] | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (V_LT_per_A) | Tárgyaló 15 m3/(m2h) × 40 m2 = 600 m3/h |
| PRF-012 | Szükséges minimális légcsereszám | V̇_LT [m3/h], V [m3] | n_szüks = V̇_LT / V [1/h] (1. függ. 6.2.1) | 1. függ. 6.2.1, 43. o.; 2. függ. 2.1. tábl. | `modszer/profilok.json#tabla_f2_2_1` | – |
| PRF-013 | Lakóépület szükséges légcsereszáma (konstans) | – | n_szüks = 0,5 1/h (a cellában „nszüks=0,5 /h”) | 2. függ. 2.1. tábl., 20. o.; 1. függ. 45. o. | `modszer/profilok.json#tabla_f2_2_1` (n_szuks_1_per_h) | Lakóépület → 0,5 |
| PRF-014 | Anomália: a térfogatáram vonatkoztatási felülete | – | 20. o.: V̇_LT/A_k; 21–22. o.: V̇_LT/A_N | 2. függ. 2.1. tábl., 20–22. o. | `modszer/profilok.json#tabla_f2_2_1` (megjegyzes) | NYITOTT: A_k vagy A_N? (valószínűleg A_N, nettó alapterület) |
| PRF-015 | Gépi szellőzés szállított térfogatárama (egyszerűsített) | funkció | V̇_LT,friss értékére a 2.1. tábl. tájékoztató; lakóépületnél kötelező | 1. függ. 6.2.4, 44. o. és 10.1.1, 76. o. | `modszer/profilok.json#tabla_f2_2_1` | – |
| PRF-016 | Előírt megvilágítás (világítási energiaigényhez) | funkció | MV [lx] = 2.1. tábl.; lakóépület: „-” | 2. függ. 2.1. tábl., 20–22. o.; 1. függ. 12.1, 84. o. | `modszer/profilok.json#tabla_f2_2_1` (MV) | Színház színpad → 1000 lx |
| PRF-017 | Szabály: az MV értékek új épületekre és korszerűsített rendszerekre vonatkoznak | épület állapota | ** lábjegyzet | 2. függ. 2.1. tábl. ** lábjegyzet, 22. o. | `modszer/profilok.json#tabla_f2_2_1` | NYITOTT: meglévő, nem korszerűsített rendszer MV-értéke nincs megadva |
| PRF-018 | Belső hőnyereség zónánként, havonta | A_N [m2], q_b [W/m2], Δt [h] | Q_b,F/H = A_N · q_b · Δt / 1000 [kWh] (1. függ. (6.26)) | 1. függ. 6.4, (6.26), 48. o.; 2. függ. 2.1. tábl. | `modszer/profilok.json#tabla_f2_2_1` (q_b) | Lakás 100 m2, jan.: 100·5·744/1000 = 372 kWh |
| PRF-019 | Szabály: q_b lakóépületnél kötelező, egyéb funkciónál ajánlott (vagy tényállapot szerinti időátlag) | rendeltetés | lakó: q_b = 5 W/m2 | 1. függ. 6.4, 48. o. | `modszer/profilok.json#tabla_f2_2_1` | – |
| PRF-020 | Szabály: hőnyelők negatív előjellel | – | pl. „Kereskedelmi egység hűtőpultokkal” q_b = −2 W/m2 | 2. függ. 2.1. tábl., 21. o.; 1. függ. 48. o. | `modszer/profilok.json#tabla_f2_2_1` | Negatív q_b-t a program ne vágja 0-ra |
| PRF-021 | HMV nettó hőigény – családi ház (kötelező) | A_N [m2] | q_HMV = 25 kWh/(m2év) | 2. függ. 2.2. tábl., 23. o.; 1. függ. 9.1, 68. o. | `modszer/profilok.json#tabla_f2_2_2` | 120 m2 → 3000 kWh/év |
| PRF-022 | HMV nettó hőigény – egyéb lakóépület (kötelező) | A_N | q_HMV = 30 kWh/(m2év) | 2. függ. 2.2. tábl., 23. o. | `modszer/profilok.json#tabla_f2_2_2` | – |
| PRF-023 | HMV nettó hőigény – nem lakó funkciók (ajánlott) | fajlagos érték e [kWh/egység/nap], egységszám N, napok d | Q_HMV = e · N · d [kWh/év] (értelmezés) | 2. függ. 2.2. tábl., 23. o.; 1. függ. 9.1, 68. o. | `modszer/profilok.json#tabla_f2_2_2` | Iroda 50 fő × 0,4 × 250 nap = 5000 kWh/év. NYITOTT: d (éves nap) nincs megadva |
| PRF-024 | Szabály: teljes HMV hőigény fajlagosítása alapterületre | Q_HMV [kWh/év], A | q_HMV = Q_HMV / A [kWh/(m2év)] | 2. függ. 23. o. („nettó kondicionált alapterület”); 1. függ. 9.1, 68. o. („hasznos alapterület”) | `modszer/profilok.json#tabla_f2_2_2` | Anomália: eltérő területfogalom a két függelékben |
| PRF-025 | Menza HMV: adagonkénti érték | adagszám/év | Q_HMV = 0,4 kWh · adag | 2. függ. 2.2. tábl., 23. o. | `modszer/profilok.json#tabla_f2_2_2` | – |
| PRF-026 | Hotel HMV: egyszerű / luxus változat választása | kategória | 2 ill. 5 kWh ágyanként, naponta | 2. függ. 2.2. tábl., 23. o. | `modszer/profilok.json#tabla_f2_2_2` (valtozat) | NYITOTT: besorolási kritérium nincs |
| PRF-027 | Lakóépület HMV megosztása konyhai/fürdőszobai fogyasztásra | Q_HMV,nettó | konyha 20 %, fürdő 80 % („eltérő típusú rendszer esetén releváns”) | 2. függ. 2.2. tábl. * lábjegyzet, 23. o. | `modszer/profilok.json#f2_2_2_hmv_megosztas` | 3000 kWh → 600 / 2400 |
| PRF-028 | Lakóépület HMV havi felosztása | Q_HMV,év | 1. függ. 9.3. tábl. szerinti havi részarány | 1. függ. 9.2.1.2, 70. o. | (1. függ. feladat) | – |
| PRF-029 | Éjszakai természetes szellőztetés légcsereszám-növekménye (máj.–szept.) | nyitható nyílások: egy / több homlokzaton | n_éjjel = 3 / 6 (1/h – a táblázatban egység nincs) | 2. függ. 2.3. tábl., 23. o. | `modszer/profilok.json#tabla_f2_2_3` | Több homlokzat → 6 |
| PRF-030 | Éjszakai szellőzési hőátviteli tényező növekménye nyáron | b_éjjel [-], n_éjjel [1/h], V [m3] | H_szell,H,nyár,éjjel = 0,35 · (b_éjjel · 7/24 · n_éjjel) · V [W/K] (1. függ. (6.11)); egyszerűsítve b_éjjel = 1,5 | 1. függ. 6.2.3, (6.11), 44. o. (PDF-képen ellenőrizve) | `modszer/profilok.json#tabla_f2_2_3` | V=300, egy homlokzat: 0,35·1,5·7/24·3·300 = 137,8 W/K |
| PRF-031 | Szabály: gépi éjszakai szellőztetésnél az egyszerűsített 2.3-as módszer nem alkalmazható | szellőzés módja | – | 1. függ. 44. o. | `modszer/profilok.json#tabla_f2_2_3` | – |
| PRF-032 | Tömítetlenségből származó légcsere-növekmény kikeresése | légzárási kategória, nyílások elhelyezkedése, szintszám, szélhelyzet | n_filt [1/h] = 2.4. tábl. | 2. függ. 2.4. tábl., 24. o.; 1. függ. 22., 43., 44., 45. o. | `modszer/profilok.json#tabla_f2_2_4` | Gyenge, több homlokzat, 4 szint, szélnek kitett → 0,75 |
| PRF-033 | Szabály: szélvédett érték gyenge/közepes kategóriában a szintszámtól független | – | gyenge: 0,20 (egy hz.) / 0,40 (több); közepes: 0,05 / 0,10 | 2. függ. 2.4. tábl. (összevont cella), 24. o. | `modszer/profilok.json#tabla_f2_2_4` | Közepes, egy hz., 8 szint, szélvédett → 0,05 |
| PRF-034 | Szabály: „szélnek kitett” oszlop alkalmazási feltétele | épület helyzete | szabadon álló vagy az épített környezetből kiemelkedő magasabb épület | 2. függ. 2.4. tábl. 2) lábjegyzet, 24. o. | `modszer/profilok.json#tabla_f2_2_4` | – |
| PRF-035 | Szintszám-sávok | szintszám N | 1-2; 3-6; „7-” (= 7 vagy több, értelmezés) | 2. függ. 2.4. tábl., 24. o. | `modszer/profilok.json#tabla_f2_2_4` (szintek_szama min/max) | N = 7 → „7-” sáv |
| PRF-036 | Jó légzárású nyílászárók (pl. MSZ EN 12207 szerint 4-es osztály) | elhelyezkedés | n_filt = 0,03 (egy homlokzat) / 0,06 (több homlokzat vagy szellőzőkürtő), szintszámtól és szélhelyzettől függetlenül | 2. függ. 2.4. tábl., 24. o. | `modszer/profilok.json#tabla_f2_2_4` | – |
| PRF-037 | Kiváló légzárás: n_filt = 0,00 feltételei | V [m3], gépi szellőzés, n50 [h-1] vagy q50 | V ≤ 1500: n50 ≤ 2,0 (nincs gépi) / ≤ 1,0 (van gépi); V > 1500: q50 ≤ 3,0 / ≤ 2,0 | 2. függ. 2.4. tábl., 24. o. | `modszer/profilok.json#tabla_f2_2_4` | V = 1200, gépi, n50 = 0,8 → 0,00; n50 = 1,2 → nem kiváló |
| PRF-038 | Szabály: kiváló kategória csak MSZ EN ISO 9972 szerinti légtömörség-mérés esetén | mérési jegyzőkönyv | kötelező feltétel | 2. függ. 2.4. tábl. 3) lábjegyzet, 24. o. | `modszer/profilok.json#tabla_f2_2_4` | Mérés nélkül a kiváló sor nem választható |
| PRF-039 | Anomália: q50 mértékegysége a forrásban „h-1” | – | (szokásosan m3/(m2h)) | 2. függ. 2.4. tábl., 24. o. | `modszer/profilok.json#tabla_f2_2_4` | Változatlanul átvéve |
| PRF-040 | Vegyes nyílászáró-minőség: súlyozott átlag | A_br,j [m2], n_filt,j | n_filt = Σ(A_br,j · n_filt,j) / Σ A_br,j („alkalmazható”) | 2. függ. 2.4. tábl. 1) lábjegyzet, 24. o. | `modszer/profilok.json#tabla_f2_2_4` | 10 m2 gyenge (0,20) + 30 m2 közepes (0,05) → 0,0875 |
| PRF-041 | Részletes alternatíva a filtrációra | – | 2.4. tábl. szerint VAGY az épület tömítetlensége alapján modellezve | 1. függ. 3.4, 22. o. | – | – |
| PRF-042 | Szakaszos fűtési üzem korrekciója | rendeltetés (lakó / egyéb), programozható automatika, időállandó τ [h] | σ_F = 2.5. tábl.; Q_veszt = σ_F · (Q_tr,F + Q_szell,F) (1. függ. (6.33)) | 2. függ. 2.5. tábl., 25. o.; 1. függ. 6.5, (6.33), 49. o. | `modszer/profilok.json#tabla_f2_2_5` | Egyéb, automatika, τ = 30 h → 0,95; lakó, τ = 10 h → 0,95 |
| PRF-043 | Szabály: „Egyéb rendeltetés” oszlop feltétele | – | hétköznap éjjel és hétvégén csökkentett hőmérséklet | 2. függ. 2.5. tábl., 25. o. | `modszer/profilok.json#tabla_f2_2_5` | – |
| PRF-044 | Részletes módszer σ_F-re | – | MSZ EN ISO 52016-1 | 1. függ. 49. o. | – | – |
| PRF-045 | Szabály-hiány: τ = 24 h pontosan | τ | „nagyobb mint 24 óra” / „kisebb mint 24 óra” – egyenlőség nincs lefedve | 2. függ. 2.5. tábl., 25. o. | `modszer/profilok.json#tabla_f2_2_5` | NYITOTT |
| PRF-046 | Lakóépület: éjszakai leszabályozás (22–06) csak programozható automatika esetén | – | – | 1. függ. 3.4, 22. o. | `modszer/profilok.json#tabla_f2_2_5` | – |
| PRF-047 | Szakaszos hűtési üzem korrekciója | leszabályozás/kikapcsolás nap/hét | σ_H = 1,0 (< 2 nap/hét); 0,8 (min. 2 nap/hét); Q_H,net,szakaszos = σ_H · Q_H,net,folyt (1. függ. (6.49)) | 2. függ. 2.6. tábl., 25. o.; 1. függ. 6.8.3, (6.49), 51. o. (PDF-képen ellenőrizve) | `modszer/profilok.json#tabla_f2_2_6` | Hétvégén kikapcsolt → 0,8 |
| PRF-048 | Anomália: hibás kereszthivatkozás σ_H-ra | – | 1. függ. 6.8.3 „2. Függelék 2.5. táblázat”-ot ír, a σ_H a 2.6. táblázatban van | 1. függ. 51. o. | `modszer/profilok.json#tabla_f2_2_6` | – |

### 3. Energiahordozókra vonatkozó adatok (ENH)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| ENH-001 | Fűtőérték/égéshő hányados kikeresése | energiahordozó | F_fé/éh [-]: földgáz 0,90; fa, biomassza 0,93; szén 0,96; olaj 0,94; nem éghető (áram, távhő, egyéb megújulók) 1,0 | 2. függ. 3.1. tábl., 25. o. | `modszer/energiahordozok.json#tabla_f2_3_1` | Földgáz → 0,90 |
| ENH-002 | Súlyozott energiaigény (F_fé/éh csak a hőenergia-tagnál) | Q_x,vég,i [kWh/év], W_x,vég,i, f_súly,i | E_x,súlyozott = Σ_i Q_x,vég,i · F_fé/éh · f_súly,i + Σ_i W_x,vég,i · f_súly,i (x = F, HMV, LT, H) | 1. függ. 14., (14.2)–(14.5), 89. o. | `modszer/energiahordozok.json#tabla_f2_3_1` | Q_F,vég = 10000 kWh földgáz, f = 1,0 → 9000 |
| ENH-003 | Szabály: nem éghető energiahordozóra F_fé/éh = 1,0 | – | áram, távhő, egyéb megújulók | 2. függ. 3.1. tábl., 25. o. | `modszer/energiahordozok.json#tabla_f2_3_1` | Távhő → 1,0 |
| ENH-004 | Szabály-hiány: nem listázott tüzelőanyagok | – | PB-gáz/propán, pellet, brikett stb. besorolása nincs megadva | 2. függ. 3.1. tábl., 25. o. | `modszer/energiahordozok.json#tabla_f2_3_1` | NYITOTT |

### 4. Tájékoztató műszaki adatok – nyílászárók, árnyékolók, panelok (NYZ)

| ID | Számítási lépés / ellenőrzés | Bemenetek (jelölés, mértékegység) | Képlet vagy konstans | Forrás | Normatív adat | Teszt-ötlet |
|---|---|---|---|---|---|---|
| NYZ-001 | Szabály: a 4. fejezet tájékoztató adat; csak teljesítménynyilatkozat hiányában vehető fel | termékadat megléte | elsődlegesen a teljesítménynyilatkozat | 2. függ. 4. fej. címe, 26. o.; 1. függ. 4.3 b), 29. o. | `modszer/nyilaszarok.json#tabla_f2_4_1..4` | Ha van gyártói U_w, a táblázati érték ne írja felül |
| NYZ-002 | Üvegezés hőátbocsátási tényezője | üvegezés típusa | U_Ü [W/(m2K)]: 5,8; 2,9; 1,6; 1,2; 1,1; 0,8 | 2. függ. 4.1. tábl., 26. o. | `modszer/nyilaszarok.json#tabla_f2_4_1` (U_U) | Háromrétegű argon → 0,8 |
| NYZ-003 | Üvegezés sugárzásátbocsátási tényezője merőleges beesésre | üvegezés típusa | g_n [-]: 0,85; 0,75; 0,7; 0,59; 0,32; 0,55 | 2. függ. 4.1. tábl., 26. o. | `modszer/nyilaszarok.json#tabla_f2_4_1` (g_n) | – |
| NYZ-004 | Összesített sugárzásátbocsátás | F_ü [-], g_n | g_F/H = F_ü · g_n; F_ü alapértéke 0,9 (1. függ. (6.24)) | 1. függ. 6.3.1, (6.24), 46. o. | `modszer/nyilaszarok.json#tabla_f2_4_1` | 4-16-4 low-e argon: 0,9·0,59 = 0,531 |
| NYZ-005 | Keret hőátbocsátási tényezője | keret típusa | U_K [W/(m2K)] = 4.2. tábl. (14 sor) | 2. függ. 4.2. tábl., 26. o. | `modszer/nyilaszarok.json#tabla_f2_4_2` | Fa 80 mm → 1,8 |
| NYZ-006 | Keret–üvegezés csatlakozás vonalmenti hőátbocsátása | keretanyag, termikus elválasztás, üvegezés (low-e / bevonat nélküli), távtartó (fém / fejlett műanyag) | ψ_K,Ü [W/(mK)] = 4.3. tábl. (12 sor) | 2. függ. 4.3. tábl., 26–27. o. | `modszer/nyilaszarok.json#tabla_f2_4_3` | Fém, termikus elválasztással, low-e, fém távtartó → 0,11 |
| NYZ-007 | Merevítőprofil–üvegezés csatlakozás vonalmenti hőátbocsátása | üvegezés, merevítő anyaga, réteg(ek), távolság az üvegtől | ψ_M,Ü [W/(mK)] = 4.4. tábl. (15 sor) | 2. függ. 4.4. tábl., 27–28. o. | `modszer/nyilaszarok.json#tabla_f2_4_4` | Low-e kétrétegű, fém, > 2 mm → 0,07 |
| NYZ-008 | Egyhéjú nyílászáró átlagos hőátbocsátási tényezője (a 4.1–4.4 adatainak felhasználása) | A_ü, U_ü, A_p, U_p, A_k, U_k, l_k,ü, ψ_k,ü, l_k,p, ψ_k,p, l_m,ü, ψ_m,ü | U_ny,e = (Σ A_ü·U_ü + Σ A_p·U_p + Σ A_k·U_k + Σ l_k,ü·ψ_k,ü + Σ l_k,p·ψ_k,p + Σ l_m,ü·ψ_m,ü) / (Σ A_ü + Σ A_p + Σ A_k) (MSZ EN ISO 10077-1 alapján) | 1. függ. 4.3.1, (4.16), 29. o. | `modszer/nyilaszarok.json#tabla_f2_4_1..4` | A_ü=1,0, U_ü=1,2; A_k=0,4, U_k=1,3; l=4,4 m, ψ=0,06 → (1,2+0,52+0,264)/1,4 = 1,417 |
| NYZ-009 | Szabály-hiány: 4.4 sávhatárok és hiányzó kombináció | távolság d [mm] | „> 2 mm” és „> 4 mm” átfed; „bevonat nélküli kétrétegű, műanyag, > 4 mm” sor hiányzik | 2. függ. 4.4. tábl., 27–28. o. | `modszer/nyilaszarok.json#tabla_f2_4_4` | NYITOTT |
| NYZ-010 | Szabály-hiány: 4.2 kategóriahatárok | – | „gyenge/közepes/erős termikus elválasztás”, „többkamrás” nincs definiálva | 2. függ. 4.2. tábl., 26. o. | `modszer/nyilaszarok.json#tabla_f2_4_2` | NYITOTT |
| NYZ-011 | Mobil árnyékoló árnyékolási tényezője (hűtés) | árnyékoló típusa, elhelyezés (belül / kívül) | g_árny,H [-] = 4.5. tábl.; „-” = nem értelmezett | 2. függ. 4.5. tábl., 28. o.; 1. függ. 6.3.1, 47. o. | `modszer/nyilaszarok.json#tabla_f2_4_5` | Külső redőny → 0,1; belső sötét függöny → 0,95 |
| NYZ-012 | Szabály: fűtési módban a mobil árnyékoló nem számít | – | g_árny,F = 1 | 1. függ. 6.3.1, 47. o. | `modszer/nyilaszarok.json#tabla_f2_4_5` | Fűtési Q_sd független az árnyékolótól |
| NYZ-013 | Panelos homlokzati fal átlagos U-értéke utólagos hőszigeteléssel | házgyár, gyártási idő, (rétegrend), kiegészítő hőszigetelés vastagsága ∈ {0, 4, 8, 12, 16, 20} | U [W/m2K] = 4.6. tábl. | 2. függ. 4.3, 4.6 tábl., 28–30. o.; 1. függ. 4.1.7, 28. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | Győr 1984-1990, 12 → 0,292 |
| NYZ-014 | Szabály: a panel-U nem tartalmazza a csatlakozási hőhidakat; azokat egyszerűsített módszerrel külön kell számolni | – | U_panel + csatlakozási hőhidak (1. függ. hőhíd-módszer) | 2. függ. 4.3, 28. o.; 1. függ. 4.1.7, 28. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | – |
| NYZ-015 | Szabály: alkalmazási kör – 1992 előtt épült házgyári panelok | építési év | 1. függ. 4.1.7: „Az 1992 előtt épült házgyári panelos rendszerek” | 1. függ. 4.1.7, 28. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | Anomália: a táblázatban 1992 utáni gyártási idők is vannak (1984-1994, 1987-1994, „1982-”) |
| NYZ-016 | Szabály-hiány: köztes hőszigetelés-vastagság, vastagság mértékegysége | d_kieg | 0/4/8/12/16/20 – egység nincs megadva (valószínűleg cm); interpoláció nincs | 2. függ. 4.6 tábl., 28. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | NYITOTT |
| NYZ-017 | Ellenőrzés: rétegvastagságok összege | teljes, külső kéreg, hőszigetelés, belső szerk. [mm] | teljes = külső + hőszig. + belső – Szolnok 1989-1991: 260 ≠ 60+60+160 = 280 (zárójeles 220 ✓) | 2. függ. 4.6 tábl., 29. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | Anomália jelezve |
| NYZ-018 | Ellenőrzés: azonos rétegrendű sorok egyezése | – | Budapest III. 1984-1994: U_12 = 0,276 vs. Debrecen 1987-1994 és Szeged 1982-1987: 0,278 (többi oszlop azonos) | 2. függ. 4.6 tábl., 29–30. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | Anomália jelezve |
| NYZ-019 | Zárójeles rétegértékek értelmezése | – | pl. „265 (210)”, „100 (75)” – jelentés nincs megadva | 2. függ. 4.6 tábl., 29. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` (_zarojeles) | NYITOTT |
| NYZ-020 | Panel-U kiválasztása: házgyár + gyártási idő alapján, átfedő időszakoknál | házgyár, év | ugyanazon házgyárnál átfedő időszakok (pl. Budapest I. 1975-1983 / 1982-1990; Győr 1974-1985 / 1984-1990) – választási szabály nincs | 2. függ. 4.6 tábl., 29–30. o. | `modszer/nyilaszarok.json#tabla_f2_4_6` | NYITOTT: 1983-as Budapest I. panel → 1,612 vagy 1,041? |
