# A WinWatt nem rendelet szerinti számításai

**Péter döntése (2026-10-29):** a program mindenben a rendelet szerint számol (9/2023. (VIII. 25.) ÉKM rendelet, a 7. § szerinti számítási módszer, 176/2008. (VI. 30.) Korm. rendelet). Ez a lista azokat a pontokat gyűjti, ahol a WinWatt (fecske 9.58) ettől eltér. A program ezekben **nem** követi a WinWattot.

- **Alap:** a golden tesztek (`tests/golden`, G1–G3) és a WinWatt-feltérképezés (`docs/winwatt/SKILL_winwatt.md`).
- **Részletes indoklás:** `docs/ELTERESEK_WINWATT.md` (E-xx hivatkozás).
- **Döntések:** `docs/DONTESEK.md`.

Jelölés:
- **igazolt** – a golden teszt számszerűen kimutatta;
- **beállítás** – a WinWatt-exportból látszik, a számításra gyakorolt hatása golden teszttel még nem mért.

## 1. Igazolt eltérések

| # | Tétel | WinWatt | Rendelet / módszer | A program | Hatás |
|---|-------|---------|--------------------|-----------|-------|
| W-01 | Csatlakozási hőhidak | A golden esetekben hőhíd-növekmény nélkül számol (dU_tb = 0). Az ellenőrző listája maga is jelzi, hogy „vélhetőleg kellene” alkalmazni. | U_R = U·(1 + ζ), ζ a 6.1. táblázatból a 6.2. szerinti hőhidassággal; vagy részletes hőhídszámítás (1. függ. 6.1.2, (6.3); TR-007, TR-008) | Mindig ζ-val számol; kikapcsolni nem lehet | G1 („erősen hőhidas”): program H_tr,D 48,9 W/K (WinWatt 40,9 W/K); ζ nélkül → ζ-val Q_F,net +13,9 %, E_nren 89,63 → 95,58 kWh/m²év |
| W-02 | Talajon fekvő padló egyenértékű U-ja (E-03) | 0,151 W/m²K „egyenértékű” érték; a módszerben nem található lépéssel | (4.20)–(4.23): B = 4,8 m, d_t = 9,70 m → U_T,p = 0,168 W/m²K | 0,168 W/m²K | G1: H_tr,T 18,5 → 20,15 W/K (+9 %) |
| W-03 | b-tényező évszakos váltása (E-15) | Fűtésnél minden hónapban b_tél, hűtésnél minden hónapban b_nyár | „Októbertől áprilisig b_tél, májustól szeptemberig b_nyár” fűtésre és hűtésre (1. függ. 6.1.3 b), 41. o.) | Havonta váltó b (D-111) | G3: a hűtési igény a fő eltérés |
| W-04 | Éjszakai többletszellőzés (E-16) | Egész évben, havonta változó b_éjjel-lel | Csak májustól szeptemberig, egyszerűsített számításnál b_éjjel = 1,5 ((6.11), 45. o.) | Május–szeptember, b_éjjel = 1,5 | G3: Q_H,net +19 % (W-03-mal együtt) |
| W-05 | Referencia épülettechnikai rendszer (E-18) | Hőtermelő és elosztóvezetékek „a fűtött téren kívül” a tárgyi épülettől függetlenül; a tárgyi épület nettó igényével számol | A hőtermelő helye és a vezetékek nyomvonala a tárgyi épületé (5. melléklet 2.1.1., 2.1.5., 2.2.4.); a mutató nevezője a referenciaépület nettó igényével (176/2008 5. melléklet) | A rendelet szerint (D-137) | G1 fűtés minősítése: WinWatt 86,8 % „jó”; program 103,9 % „közepes” (ζ-val) |
| W-06 | Szerkezetminősítés határai a felújítási javaslatban (E-05) | Pincefödém kiváló ≤ 0,18; tetősík ablak 1,0; ajtó 1,4 / 1,0; kapu 1,3 | 176/2008 4. melléklet: pincefödém kiváló ≤ 0,2; tetősík ablak jó ≤ 1,3, kiváló ≤ 1,1; ajtóra és kapura nincs osztály | A 4. melléklet értékei; ajtó és kapu osztály nélkül | A felújítási javaslat és a szerkezetminősítés szövege |
| W-07 | Ventilátor-összhatásfok termékadat nélkül (E-07) | A sablon 50 %-a (VentEfficiency 50) | Pontosabb adat hiányában a 10.8. táblázat: V̇ < 1000 m³/h → 0,40 (LT-051) | Adatlapról, ennek hiányában 0,40 (figyelmeztetéssel) | G3: a ventilátor-energia 1,25-szöröse |

## 2. Beállítások, amelyek nem rendeletiek (hatásuk a golden tesztekben nem mért)

| # | Tétel | WinWatt | Rendelet / módszer | A program |
|---|-------|---------|--------------------|-----------|
| W-08 | Hővisszanyerős szellőzés üzemideje (E-14) | A golden G3-ban 5088 h (október–április) | t_LT,a a szellőzés tényleges éves üzemideje (10.20); lakóépületnél a használati idő 24 h · 365 nap (2. függ. 2.1. táblázat) | A terv szerinti üzemidő, kötelező bemenet; egész éves üzemnél 8760 h. G3: 54,95 → 118,26 kWh/év (W-07-tel együtt) |
| W-09 | Talajon fekvő padló B-je (E-02) | Helyiségenként, a helyiség külső falainak hosszával; belső helyiségnél P = 0 | B = A/(0,5·P) a teljes, összefüggő padlóra (4.20) | A teljes padlóra (D-140) |
| W-10 | Fűtetlen tér felé néző határolók XML-importkor (E-04) | `Flags=2 / 20 °C`-ra állnak, és kiesnek a lehűlő felületből (A/V, q, OÉNY-szerkezetlista) | A fűtetlen tér felé H = b·U·A, a felület a lehűlő felület része (6.1.3; 9/2023 ÉKM 2. § 16.) | Minden határolónál kötelező a túloldal típusa; a b a 6.3. táblázatból |
| W-11 | U-érték köztes kerekítése (E-11) | Szerkezet U 3, ablak U_w 2 tizedesre a számítás közben | Köztes kerekítést a módszer nem ír elő | Kerekítés csak megjelenítéskor |
| W-12 | Fűtési belső hőmérséklet (E-01) | A munkamódban helyiségenként 22 °C | Lakóépületre θ_i,F = 20 °C kötelező (2. függ. 2.1. táblázat, 2. pont) | 20 °C, nem szerkeszthető |

## 3. Még ellenőrizendő (nincs golden adat)

| # | Tétel | Kérdés |
|---|-------|--------|
| E-08 | Fűtött téren belüli kondenzációs kazán 100 m² felett | A 8.2. táblázat itt üres; mit ad a WinWatt (K-020)? |
| E-09 | HMV-elosztás cirkuláció nélkül 100 m² felett | A 9.11. táblázat itt üres; mit ad a WinWatt (K-020)? |
| E-10 | Társított árnyékoló többlet-hőellenállása az elemi követelménynél | Az elemi követelménynél nem vehető figyelembe (1. melléklet 1.1. (**)); a WinWatt az OÉNY-szerkezetlistában melyik U-t adja? |

## 4. Nem a WinWatt hibája (rögzítve, hogy ne kerüljön a fenti listákba)

- **E-06, primerenergia-szorzók:** a WinWatt rendszer-blokkjaiban 7/2006 TNM-es szorzók (2,5 / 1,8 / 1) maradtak. Az indikátorok viszont a G1–G3-ban a 7. melléklet szerinti értékekkel jönnek ki (E_nren, E_CO2 egyezik), így a számítás ezeket nem használja.
- **E-12, ablak U\* és ΔR = 0,33 m²K/W**, valamint **E-17, napelem 4710 kWh/év:** a golden sablonból maradt bemeneti értékek, nem a WinWatt módszere. A (4.18) képlet azonos a módszerével.
- **E-13, effektív hőtároló képesség:** a WinWatt a rétegrendből számol (301,41 kJ/m²K). A módszer ezt megengedi, a program jelenleg a 6.5. táblázat kategóriáit használja.
