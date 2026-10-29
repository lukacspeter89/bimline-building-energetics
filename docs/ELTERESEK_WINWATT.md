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

### E-03 – Padló–fal csatlakozás Ψ_p,f elhagyása (FPszi = 0) — **E?**
- **WinWatt-gyakorlat:** a padlóhatárolón `FPszi` = 0 (SKILL 1. fejezet).
- **Forrás:** a (6.5) képlet a P·Ψ_p,f tagot tartalmazza, a Ψ_p,f értéke a 6.4. táblázatból (1. függ. 6.1.4.3, 42. o.; `modszer/netto_energiaigeny.json#tabla_6_4`).
- **Ellenőrizendő:** hogy a WinWatt a padló-fal hőhidat máshol (pl. az egyszerűsített hőhíd-korrekcióban, ζ) számolja-e. Ha nem, a Ψ_p,f elhagyása alábecsüli a veszteséget.

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
| =10 | Napelem, egyszerűsített | 5 kWp, vízszintes → 4710 kWh (942 kWh/kWp) | azonos | 1. függ. 13.1. táblázat, 87. o. |
| =11 | Fűtőérték / égéshő, földgáz | 0,9 | azonos | 2. függ. 3.1. táblázat, 25. o. |
| =12 | Redőny árnyékolási tényezője, kívül | 0,1 | azonos | 2. függ. 4.5. táblázat, 28. o. |
| =13 | Világítás lakóépületnél | a WinWatt hibának jelzi | lakónál nem számítandó | 9/2023 ÉKM 5. melléklet 2.8.1.; 176/2008 5. melléklet |
| =14 | Ajtó / kapu U, ha a terv nem adja | 1,4 / 1,8 / 2,0 | a rendeleti követelményérték | 9/2023 ÉKM 1. melléklet 1.1. 16–18. sor; Péter szabálya |
| =15 | Felületi hőátadási ellenállás fűtetlen tér felé (mindkét oldalon R_si) | pincefödém 0,17 / 0,17; padlásfödém 0,10 / 0,10 | lefelé 0,17, felfelé 0,10; fűtött–fűtetlen között mindkét oldalon R_si | 1. függ. 4.1. táblázat, 24. o. |

## 3. Teendő a golden tesztekhez

A K-007 szerinti WinWatt-exportok és OÉNY XML-ek beérkezése után minden E? tételhez egy-egy dedikált teszt készül; az eredmény alapján a tétel „E” (indokolt eltérés) vagy „=” lesz. Ami nem indokolható a mátrixszal, az hiba a programban.
