# Eltérések a WinWatt és a jogszabály / számítási módszer között

**Állapot:** 0. fázis, előzetes lista (2026-10-29). Az alap a `docs/winwatt/SKILL_winwatt.md` (WinWatt 9.58, 2026.06.08, GUI-feltérképezés és export/import körök) és a hatályos forrás (`FORRASOK.md`). Valós projektek összevetése (golden tesztek) még nem volt, ezért a tételek egy része **„ellenőrizendő”**: a WinWatt-exportból látszik a beállítás, de hogy a WinWatt a számításban valóban így használja-e, azt a golden teszt dönti el.

Szabály: ahol a WinWatt (vagy a WinWatt-ban kialakult munkamód) és a jogszabály / módszer ütközik, **a program a jogszabályt követi**. A WinWatt-kompatibilis importnál a program jelzi az eltérést, és a felhasználói felületen is jelöli.

Jelölés: **E** = eltérés (a forrás egyértelmű), **E?** = ellenőrizendő eltérés, **=** = egyezés (a forrás és a WinWatt azonos; a félreértések elkerülése végett rögzítve).

## 1. Bemenet és munkamód

### E-01 – Fűtési belső hőmérséklet: 22 °C helyett kötelezően 20 °C (lakóépület) — **E?**
- **WinWatt-gyakorlat:** minden helyiség `Heating/Temp` = 22 °C, a lépcsőházat és a közös tárolót is beleértve (SKILL 1. fejezet, „Péter egységesen 22-re állította”).
- **Forrás:** a 2. Függelék 2.1. táblázata szerint lakóépületre (lakóépület egésze) θ_i,F = 20 °C, θ_i,H = 26 °C, n_szüks = 0,5 1/h, q_b = 5 W/m², és **lakó- és szállásjellegű épületre ezek használata kötelező** (2. függ. 2. pont, 20. o.). A referenciaépület fogyasztói profilja is a tárgyi épületével azonos (9/2023 ÉKM 5. melléklet 1.7.6.).
- **Helyes értelmezés:** a nettó energiaigény-számításban lakóépületre 20 °C. A 22 °C legfeljebb a méretezési hőszükséglet-számításhoz (MSZ EN 12831-1) használható, ha a tervező úgy dönt; ez nem része az energetikai igazolásnak.
- **Hatás:** ha a WinWatt a helyiség-hőmérsékletet az energiamérlegben használja, a 22 °C a transzmissziós és a szellőzési veszteséget a (θ_i − θ_e) különbséggel arányosan növeli. A fűtési idény átlagos 3,6 °C-os külső hőmérsékletével (2. függ. 1.2. táblázat) a különbség 16,4 K helyett 18,4 K, azaz kb. +12% veszteség. Az eredmény rosszabb (konzervatív) besorolás.
- **Program:** lakó funkciónál a 2.1. táblázat értékei rögzítettek, nem szerkeszthetők. A helyiség-hőmérséklet külön mező, és csak a hőszükséglet-számításba megy. Golden teszt: dönteni kell, hogy a WinWatt melyiket használja.

### E-02 – Talajon fekvő padló: helyiségenkénti kerület helyett a padló egészére számított B — **E**
- **WinWatt-gyakorlat:** a `FloorISO` határoló `x` mezője helyiségenként a helyiség külső falainak hosszösszege („födémek létrehozása” logika); belső helyiségnél 0. A WinWatt helyiségenként számol ISO 13370 szerint (SKILL 1. fejezet).
- **Forrás:** a karakterisztikus méret `B = A / (0,5·P)`, ahol A a kondicionált tér padlójának területe, P a kitett kerület, beleértve a szomszédos fűtetlen tér felé eső csatlakozást is (1. függ. 4.4.2, (4.20), 32. o.). Erre jön az U_T,p a (4.22) vagy a (4.23) szerint, és a transzmisszió `H_tr,T,tp = A·U_T,p + P·Ψ_p,f` (1. függ. 6.1.4.1, (6.5), 41. o.).
- **Helyes értelmezés:** a B a teljes, összefüggő talajon fekvő padlóra (zónánként) számítandó, egy U_T,p értékkel. A helyiségenkénti B/U nem a módszer szerinti, és mivel az U_T,p B-ben nemlineáris, a helyiségenkénti A·U összege eltér a teljes padlóra számítottól. A belső helyiségek (P = 0) a helyiségenkénti logikában irreálisan kis U-t kapnak.
- **Hatás:** a padló hővesztesége eltér. Az előjel a geometriától függ, ezért golden teszttel számszerűsítendő.
- **Program:** a padló A és P értéke a kontúrból, a teljes padlóra (zónánként) számolódik; a helyiségekhez csak a terület kerül.

### E-03 – Talajon fekvő padló: egyenértékű U és Ψ_p,f — **E** (G1 golden teszt, 2026-10-29)
- **WinWatt (G1):** U = 0,151 W/m²K „egyenértékű” érték + P·Ψ, ahol Ψ = 0,10 W/mK alapértelmezés: H_tr,T = 96·0,151 + 40·0,10 = 18,5 W/K. Az „átlagos rétegtervi” 0,168 W/m²K-t kiírja, de a mérlegben nem ezt használja.
- **Forrás:** H_tr,T = A·U_T,p + P·Ψ_p,f, (6.5); U_T,p a (4.23) szerint (B = 4,8 m, d_t = 9,70 m) = 0,168 W/m²K; Ψ_p,f a 6.4. táblázatból (0,15–0,45 W/mK falazat, megszakítatlan külső hőszigetelés, a terepszint alatt 0,5 m-ig szigetelt lábazat, szigetelt padló: 0,10).
- **Program:** a forrás szerint 96·0,168 + 40·0,10 = 20,15 W/K (+9 %). A 0,151-hez vezető WinWatt-lépés a módszerben nem található. A korábbi „FPszi = 0” feltevés tévesnek bizonyult: a WinWatt a Ψ-t figyelembe veszi.

### E-04 – Fűtetlen tér felé néző határolók importkor kiesnek az energetikai burokból — **E** (WinWatt-hiba, a felhasználó javítja)
- **WinWatt-viselkedés:** XML-importkor minden határoló `OverSideTemp`-je `Flags=2 / 20 °C / Bu 1`-re áll; `Flags=2` mellett a szerkezet kimarad a „fűtött teret határoló szerkezetek” közül (A/V, fajlagos hőveszteség-tényező, OÉNY-szerkezetlista). A javítást szerkezetenként kézzel kell elvégezni (SKILL 6.2).
- **Forrás:** a nem kondicionált terek felé a hőátvitel `H = Σ b·U·A` (1. függ. 6.1.3, b-tényezők: 6.3. táblázat), a felület része a lehűlő felületnek (9/2023 ÉKM 2. § 16.; 176/2008 2. melléklet 1.5., 1.6.5.).
- **Program:** minden határolónál kötelező a túloldal típusa (külső levegő / talaj / fűtetlen tér típussal / fűtött tér). A b-tényező a 6.3. táblázatból jön, a burokba tartozás egyértelmű, és az élő ellenőrzés jelzi a burokba nem kerülő fűtetlen határolót.

### E-05 – Szerkezetminősítés „jó / kiváló” határai a felújítási javaslatban — **E**
- **WinWatt-érték (`PanelRenovationItem`, kmax / kmin):** fal 0,24 / 0,16; tető és padlásfödém 0,17 / 0,12; pincefödém **0,26 / 0,18**; ablak 1,1 / 0,8; tetősík ablak **1,0**; ajtó **1,4 / 1,0**; kapu **1,3** (SKILL 1. és 6.4).
- **Forrás:** a „jó” szint a 176/2008 4. melléklet D oszlopa, a „kiváló” az E oszlop (7. § (1)): pincefödém jó ≤ 0,26, kiváló **≤ 0,2**; tetősík ablak jó **≤ 1,3**, kiváló **≤ 1,1**. Ajtóra és kapura a 4. melléklet **nem ad** osztályhatárt (`rendelet/176_2008_Korm_besorolas.json#szerkezet_ertekelesi_osztalyok`).
- **Eltérés:** a pincefödém kiváló szintje (0,18 ↔ 0,2) és a tetősík ablak (1,0 ↔ 1,3 / 1,1) nem a rendeleti érték. Az ajtó 1,0-s és a kapu 1,3-as értéke nem rendeleti; a kapu 1,3 a WinWatt `kmin` mezőjében szerepel.
- **Program:** a 4. melléklet értékei. Ajtóra és kapura nincs rendeleti osztály – lásd NYITOTT_KERDESEK.md K-012.

### E-06 – Primerenergia-szorzók a WinWatt rendszer-blokkjaiban — **E?**
- **WinWatt-érték:** `EnergySourceType` mellett `PrimerEnergyMultiplier`: elektromos áram 2,5 (sus 0,1), földgáz 1 (0), „H hőszivattyús elektromos áram” 1,8 (0,1) (SKILL 6.4, 6.8).
- **Forrás:** 9/2023 ÉKM 7. melléklet: villamos energia f_nren 2,3 / f_ren 0,3; fosszilis gáz 1,1; **külön hőszivattyús áram nincs** (`rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok.json`). A 2,5 / 1,8 / 1 értékek a hatályon kívüli 7/2006 TNM rendelet tényezőinek felelnek meg.
- **Ellenőrizendő:** a WinWatt a 2023-as számításban ezeket a mezőket használja-e, vagy csak örökölt adatként őrzi. A `ConsumptionTableItem`-ek (energiahordozó-index, `CalorificBurningFactor`) arra utalnak, hogy az indikátorok a 2023-as táblával készülnek. Golden teszt: az OÉNY-be exportált `NonRenewablePrimaryEnergy` újraszámolása a 7. melléklettel.
- **Program:** kizárólag a 7. melléklet. Ha WinWatt-importban 7/2006 TNM-tényezők szerepelnek, a program jelzi.

### E-07 – Szellőzés ventilátor-energiája: Δp/η képlet ErP-készüléknél is; η = 50% alapérték — **E?**
- **WinWatt-gyakorlat:** ventilátor-teljesítmény = dpVent · légmennyiség / VentEfficiency (pl. 150 Pa, 50%) (SKILL 6.4, Péter sablonja: dpVent 150, VentEfficiency 50).
- **Forrás:** az ErP (1253/2014/EU) hatálya alá eső szellőzőkészüléknél a (10.17) képlet: `W_vent = V̇ · MISC · SPI · Δt / CTRL^x`, az SPI a gyártói adatlapról, és 2018.01.01. után forgalomba hozott készüléknél kötelező (1. függ. 10.1.4.1, 78. o.). A Δp/η képlet (10.20) az egyszerűsített módszeré; ott a ventilátor-összhatásfok alapértéke pontosabb adat hiányában V̇ < 1000 m³/h esetén **0,40** (1. függ. 10.8. táblázat, 81. o.).
- **Eltérés:** a 2018 utáni lakossági hővisszanyerős szellőzőknél az SPI-alapú számítás az előírt. A 0,50-es hatásfok sem a táblázati alapérték, és termékadat nélkül nem vehető fel (Péter szabálya is).
- **Program:** az ErP-készüléknél SPI kötelező (adatlap forrással). Termékadat nélkül a 10.8. táblázat értéke alkalmazandó, „alapérték” jelöléssel.

### E-08 – Fűtött téren belüli kondenzációs kazán 100 m² felett — **E?** (forráshiány)
- **WinWatt-érték:** kondenzációs kazán fűtött térben Ck 1,01, qkv 0,79 (21,87 m²-es tesztprojekt, SKILL 6.4).
- **Forrás:** az 1. függ. 8.2. táblázata (58. o.) fűtött téren belüli kazánra csak 100 m²-nél ad kondenzációs (1,01) és alacsony hőmérsékletű (1,08) értéket, állandó hőmérsékletűre 500 m²-ig; a segédenergia-oszlop teljes. A 100 m²-es sor a WinWatt-értékkel egyezik.
- **Ellenőrizendő:** 100 m² feletti rendszer-alapterületnél mit ad a WinWatt (a 8.1. táblázat fűtött téren kívüli értékét, az utolsó ismert értéket vagy mást). Lásd K-020.

### E-09 – HMV elosztás cirkuláció nélkül 100 m² felett — **E?** (forráshiány)
- **Forrás:** az 1. függ. 9.11. táblázat (74. o.) „cirkuláció nélkül” oszlopa csak 100 m²-nél ad értéket (13% kívül, 10% belül). Péter gyakorlata gyakran „belül, cirkuláció nélkül” (qfvType 3).
- **Ellenőrizendő:** a WinWatt értéke 100 m² felett. Lásd K-020.

### E-10 – Nyílászáró U és árnyékoló: az éjszakai többlet-hőellenállás és az elemi követelmény — **E?**
- **WinWatt-gyakorlat:** külső redőnnyel `ShadowFactor` 0,1, `NightPlusR`/`FNightPlusR` 0,19 (SKILL 1. fejezet).
- **Forrás:** a redőny árnyékolási tényezője kívül 0,1 (2. függ. 4.5. táblázat) – **egyezik**. A társított árnyékoló többlet-hőellenállása viszont az elemi U-követelmény ellenőrzésekor nem vehető figyelembe (9/2023 ÉKM 1. melléklet 1.1. (**)). Az energiamérlegben a társított árnyékolós nyílászáró U-ját az 1. függ. 4.3.3 szerint kell számítani.
- **Ellenőrizendő:** a WinWatt a követelmény-ellenőrzésnél (és az OÉNY-szerkezetlistában) az árnyékoló nélküli U-t használja-e.
- **Program:** két érték: U_w (követelményhez, OÉNY) és U_w,árny (mérleghez, 4.3.3).

### E-11 – U-érték kerekítése — **E** (kis hatás)
- **WinWatt-viselkedés:** a panel `k` = round(kFromLayers · (1 + kModifier/100), 3); az ablak U_w-t 2 tizedesre kerekíti (SKILL 1. fejezet).
- **Forrás:** a módszer köztes kerekítést nem ír elő; a %-os korrekció a 4.1.6 szerinti U-korrekció.
- **Program:** köztes kerekítés nincs, csak a megjelenítés kerekít. A golden teszteknél ±0,001 W/m²K tűrés.

### E-12 – Ablakok U* a direkt transzmisszióban — **E?** (G1 golden teszt)
- **WinWatt (G1):** a „Határoló szerkezetek” táblában az ablak U = 0,75 / 0,73 / 0,71 mellett U* = 0,705 / 0,687 / 0,670 (≈ 6 %-kal kisebb), és a H_tr,D (40,9 W/K) az U*-gal számol. Redőny, árnyékoló nincs.
- **Forrás:** a (6.2) a nyílászáró hőátbocsátási tényezőjével számol; a 4.3 fejezet szerinti U-t csökkentő tényezőt (árnyékoló nélkül) a módszer nem ad.
- **Program:** U-val számol; H_tr,D = 41,45 W/K (+1,4 %). Ellenőrizendő: a WinWatt U*-jának eredete (Péter / Bausoft).

### E-13 – Effektív hőtároló képesség — **E?** (G1 golden teszt)
- **WinWatt (G1):** C_m,eff/A_N = 301,41 kJ/m²K, a rétegrendekből számolva (MSZ EN ISO 13786 jellegű).
- **Forrás:** egyszerűsített módszernél a 6.5. táblázat kategóriái (nehéz épület: 280 kJ/m²K); részletes számítás az MSZ EN ISO 52016-1 / 13786 szerint megengedett.
- **Program:** jelenleg a 6.5. táblázat (felhasználói kategóriaválasztással). A rétegrend szerinti számítás később választható lesz. Hatás G1-ben: kb. +0,3 % Q_F,net.

### E-14 – Hővisszanyerős szellőzés üzemideje — **E?** (G3 golden teszt)
- **WinWatt (G3):** a ventilátor-energiánál Δt_LT,a = 5088 h, vagyis a fűtési idény (október–április, 212 nap · 24 h): W = 129,6·150/3600/0,5·5088/1000 = 54,95 kWh/év.
- **Forrás:** t_LT,a „a szellőzés éves üzemideje” (10.20). Lakóépületnél a 2. függ. 2.1. táblázat 24 h · 365 nap használati időt ad. Hogy a gépi szellőzés nyáron áll-e, a terv adata.
- **Program:** az üzemidő kötelező bemenet. Ha a rendszer egész évben üzemel, 8760 h (94,6 kWh/év). A G3 összevetése 5088 h-val készült.

### E-15 – b-tényező évszakos alkalmazása — **E** (G3 golden teszt)
- **WinWatt (G3):** a fűtési zónában minden hónapban b_tél (H_tr,x 16,1 W/K), a hűtési zónában minden hónapban b_nyár (38,6 W/K).
- **Forrás:** „Októbertől áprilisig b_tél, májustól szeptemberig b_nyár értékeit kell alkalmazni fűtés és hűtés esetén” (1. függ. 6.1.3 b), 41. o.).
- **Program:** a forrás szerint havonta váltó b (D-111).

### E-16 – Nyári szellőzési tényező hűtésre — **E** (G3 és G1 golden teszt)
- **WinWatt:** H_szell,H minden hónapban 216–337 W/K (G1, G3: januárban 218,2, júliusban 337,3). Az éjszakai többletszellőzést egész évben, havonta változó b_éjjel-lel (6.9) veszi figyelembe.
- **Forrás:** az éjszakai többletszellőzés „májustól szeptemberig” vehető figyelembe (6.11), 45. o.; egyszerűsített számításnál b_éjjel = 1,5.
- **Program:** május–szeptember, b_éjjel = 1,5. Hatás G3-ban: Q_H,net 346,9 kWh/év a 292,5 helyett (+19 %). A WinWatt H_szell,H és egész éves b_nyár bemenetével a mérleg ±2 %-on belül egyezik.

### E-17 – Napelem termelése a mérlegben — **E** (G2 golden teszt; WinWatt-bemeneti vagy -számítási hiba)
- **WinWatt (G2):** a napelem lapja 4 kWp, 30°, déli tájolás mellett „éves energiahozam 4320 kWh/a”-t ír (= 1080·4, helyes), a mérlegben viszont 4710 kWh/év exportált energiával számol (= 942·5, vagyis 5 kWp vízszintes; feltehetően a sablonból maradt érték). Ebből jön a −11,40 kWh/m²év.
- **Forrás:** W_PV = w_PV·P_PV,össz (13.1), 13.1. táblázat: D, 30° → 1080 kWh/kWp.
- **Program:** 4320 kWh/év → E_nren = −5,79 kWh/m²év. A besorolás (A+++) nem változik.
- **Teendő (Péter):** a WinWatt G2 projektben a napelem-tétel ellenőrzése.

## 2. Egyezések (rögzítve, hogy ne kerüljenek vissza „eltérésként”)

| # | Tétel | WinWatt | Forrás | Hivatkozás |
|---|-------|---------|--------|------------|
| =01 | b-tényezők fűtetlen terek felé (tél/nyár) | padlás 0,9/0; pince 0,5/1,5; mélygarázs 0,8/0,8; garázs 0,9/0,9; fűtetlen helyiség 0,5/0,5; lépcsőház 0,7/0,7; naptér 0,8/0,7/0,5 | azonos | 1. függ. 6.3. táblázat, 41. o. |
| =02 | Elektromos hőszivattyú (fűtés), levegő–víz | 55/45: 0,37; 35/28: 0,30 | azonos | 1. függ. 8.5. táblázat, 59. o. |
| =03 | Kazán fűtött térben, kondenzációs, ≤ 100 m² | 1,01; segédenergia 0,79 kWh/m²év | azonos | 1. függ. 8.2. táblázat, 58. o. |
| =04 | HMV-hőszivattyú, levegő | 0,45 | azonos | 1. függ. 9.7. táblázat, 72. o. |
| =05 | Gázüzemű bojler | 1,22 | azonos | 1. függ. 9.8. táblázat, 72. o. |
| =06 | HMV elosztás belül, cirkulációval, 100 m² | 24% | azonos | 1. függ. 9.11. táblázat, 74. o. |
| =07 | HMV tárolás gázbojlerrel, fűtött térben, 100 m² | 78% | azonos | 1. függ. 9.9. táblázat, 73. o. |
| =08 | Hűtőgépek SEER / ε_H | split 2,5/0,4; léghűtéses folyadékhűtő 3,0/0,33 … | azonos | 1. függ. 11.2. táblázat, 82–83. o. |
| =09 | Hűtés szabályozási veszteség, látens tényező | 6/12 °C: 1,13; direkt elpárologtatás 1,13; c_H 1,25 / 1,45 | azonos | 1. függ. 11.1., 11.3. táblázat |
| =10 | Napelem, egyszerűsített | 5 kWp, vízszintes → 4710 kWh (942 kWh/kWp) | azonos (de lásd E-17: G2-ben a mérleg nem a napelem lapjának értékével számol) | 1. függ. 13.1. táblázat, 87. o. |
| =11 | Fűtőérték / égéshő, földgáz | 0,9 | azonos | 2. függ. 3.1. táblázat, 25. o. |
| =12 | Redőny árnyékolási tényezője, kívül | 0,1 | azonos | 2. függ. 4.5. táblázat, 28. o. |
| =13 | Világítás lakóépületnél | a WinWatt hibának jelzi | lakónál nem számítandó | 9/2023 ÉKM 5. melléklet 2.8.1.; 176/2008 5. melléklet |
| =14 | Ajtó / kapu U, ha a terv nem adja | 1,4 / 1,8 / 2,0 | a rendeleti követelményérték | 9/2023 ÉKM 1. melléklet 1.1. 16–18. sor; Péter szabálya |
| =15 | Felületi hőátadási ellenállás fűtetlen tér felé (mindkét oldalon R_si) | pincefödém 0,17 / 0,17; padlásfödém 0,10 / 0,10 | lefelé 0,17, felfelé 0,10; fűtött–fűtetlen között mindkét oldalon R_si | 1. függ. 4.1. táblázat, 24. o. |

## 3. Teendő a golden tesztekhez

A K-007 szerinti WinWatt-exportok és OÉNY XML-ek beérkezése után minden E? tételhez egy-egy dedikált teszt készül; az eredmény alapján a tétel „E” (indokolt eltérés) vagy „=” lesz. Ami nem indokolható a mátrixszal, az hiba a programban.

## 4. Golden tesztek eredménye (tests/golden, WinWatt fecske 9.58, 2026-10-29)

### G1 – földszintes lapostetős ház, kondenzációs gázkazán
- **Egyezik:**
  - rétegtervi U (fal 0,176; tető 0,134);
  - ablak U méretenként;
  - A/V 1,157;
  - H_szell,F 50,8 W/K;
  - Q_b havonta;
  - szoláris nyereség (árnyékolás nélkül, F_árny = 1).
- **A havi mérleg** a WinWatt H_tr,D, H_tr,T és C_m bemenetével havonta ±0,1–1 %-on belül egyezik (Q_F,net 3912 kWh/év). Ez a (6.27)–(6.42) algoritmust igazolja.
- **A módszer szerinti saját bemenettel** a Q_F,net 4046,5 kWh/év (+3,4 %). Okai: E-03 (talaj), E-12 (ablak U*), E-13 (C_m).
- **Gépészet** a WinWatt Q_F,net-jével, mind pontosan egyezik:
  - ε_F 1,01;
  - ε_F,szab 1,018;
  - q_F,száll 2,10 kWh/m²év;
  - w_F,sziv 1,44 kWh/m²év;
  - Q_F,vég 4226 kWh/év;
  - W_F,vég 214,08 kWh/év;
  - HMV: q 25 kWh/m²év, 24 % + 10 %, ε 1,17, Q_HMV,vég 3763 kWh/év, W 28,8 kWh/év.
- **Primerenergia (kézi ellenőrzés):** a gáz Q_vég·0,9 (F_fé/éh)·1,1 + W·2,3 = 48,71 kWh/m²év fűtésre, egyezik. Ez megerősíti, hogy a súlyozás fűtőérték alapon történik (D-129).

### G2 – kétszintes ház hideg padlással, levegő-víz hőszivattyú, HMV-hőszivattyú, napelem
- **Egyezik:**
  - padlásfödém U 0,141;
  - b = 0,9 (H_tr,x 10,2 W/K);
  - A/V 0,82;
  - H_szell 84,7 W/K;
  - szoláris nyereség.
- **A havi mérleg** a WinWatt H és C_m bemenetével: éves 4623 kWh/év a 4608 kWh/év helyett (+0,3 %).
- **Gépészet**, mind egyezik:
  - ε_F 0,30;
  - ε_F,szab 1,018;
  - q_F,száll 0,60 kWh/m²év;
  - q_F,tár 0,07 kWh/m²év;
  - W_F,vég 202,56 kWh/év;
  - Q_F,vég 1439 kWh/év;
  - HMV: tárolás 16,4 %, ε 0,45, Q_HMV,vég 2275 kWh/év.
- **A WinWatt a táblázatok sorai között lineárisan interpolál:** w_sziv 0,854, w_tár 0,412 kWh/m²év, HMV-tárolás 16,4 % 160 m²-nél. Ez a D-122 értelmezést igazolja.
- **Üres cellánál** a WinWatt a szomszédos kitöltött cellák között interpolál (8.15. táblázat: 0,07). A program ezt átvette (D-131).
- **Eltérés:** H_tr,D +2,3 % (E-12, ablak U*). Az ablakoknál U* ≈ 1/(1/U + 0,085), vagyis kb. 0,085 m²K/W állandó többlet-hőellenállásnak felel meg, árnyékoló nélkül is.
- **Napelem:** a WinWatt két különböző értéket ad. A PDF-ben 4320 kWh/év „éves energiahozam” szerepel, a mérlegben viszont 4710 kWh/év exportált energia. A napelem-modul elkészülte után kell összevetni.

### Indikátorok (14. fejezet) – G1 és G2
- **Az összesítő mutatók a WinWatt-tal azonos gépészeti végsőenergiákból ±0,05 kWh/m²év-en belül egyeznek:**
  - G1: E_nren 88,20 kWh/m²év, E_CO2 23,39 kg/m²év;
  - G2: E_nren −11,40 kWh/m²év, E_CO2 0,49 kg/m²év.
- **G2, hőszivattyú megújuló része:**
  - fűtés (ε 0,30 ≤ 0,37): a környezeti hő 3359 kWh/év megújulóként számít;
  - HMV (ε 0,45 > 0,37): nem számít megújulónak (IND-028).
- **G2, napelem:** a WinWatt a teljes termelést (4710 kWh/év) exportáltnak veszi. Az önfogyasztás kezelését a napelem-modulnál (13. fejezet) kell a módszerrel összevetni.

### G3 – fűtetlen pince és garázs, hővisszanyerős szellőzés, split hűtés
- **Egyezik:**
  - pincefödém U 0,234, garázsfal U 0,252;
  - H_tr,x 16,1 (tél) és 38,6 W/K (nyár);
  - H_szell,F 12,2 W/K (6.12, η 85 %).
- **Fűtés:** a WinWatt H_tr,D és C_m bemenetével Q_F,net ±2 %-on belül.
- **Hűtés:** az E-15 és E-16 eltérések miatt a saját bemenettel +19 %. A WinWatt bemeneteivel ±2 %-on belül egyezik.
- **Gépészet és indikátorok** (a WinWatt nettó igényeivel), mind egyezik:
  - E_F,vég 346 kWh/év, W 138,24 kWh/év;
  - E_HMV,vég 1447 kWh/év;
  - ventilátor 54,95 kWh/év (5088 h, E-14);
  - Q_H,vég 479 kWh/év (191,7 villamos);
  - E_nren 52,19 kWh/m²év, E_CO2 10,55 kg/m²év.
