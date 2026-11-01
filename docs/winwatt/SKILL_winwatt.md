---
name: "winwatt-tanusitas-xml"
description: "Energetikai tanúsítás WinWatt-tal: projekt-XML (NativeExport) előállítása/javítása WinWattba betölthetően – beépített referencia-vázzal (nem kell minta fájl), a WinWatt ellenőrző-lista tételes lezárása, majd az OÉNY e-tanúsítás feltöltő XML (UploadRequest) szerkezete, ellenőrzése és keresztellenőrzése. Teljes WinWatt kódtábla (szerkezettípusok, hőtermelők, elosztás, tárolás, szabályozás, légtechnika, hűtés, világítás, napelem) és a GUI-lépések (Szerkezetek cseréje, fotók, e-tanúsítás export) a 6. fejezetben. Use when: tanúsítás, WinWatt XML, GEN, entan.xml, OÉNY feltöltés, e-tanúsítás, UploadRequest, WinWatt gépészeti rendszer, pincefödém, fűtetlen tér."
---

# WinWatt → OÉNY tanúsítás XML lánc

Két fájlformátum, két szerep:
1. **WinWatt projekt-XML** (`<WinWatt32Project Type="NativeExport">`) – ezt írjuk/javítjuk, a WinWatt importálja, számol.
2. **OÉNY e-tanúsítás feltöltő XML** (`<UploadRequest>`) – ezt a WinWatt exportálja (Tanúsítvány → e-tanúsítás XML), az entan.e-epites.hu-ra kerül. Mi csak ELLENŐRIZZÜK és keresztellenőrizzük; kézzel csak akkor állítjuk elő, ha a számítás nem WinWattban készült (winwatt-hibrid motor) – akkor is pontosan ezt a szerkezetet kell adni.

Munkarend: adatgyűjtés (tulajdoni lap, tervek, kivitelezői levél, fotók, DWG) → projekt-XML írás/javítás Python-szkripttel (reprodukálható, `python javit_xxx.py` vagy `python gen_xxx.py`) → Péter betölti WinWattba → **betöltés utáni kötelező GUI-lépések** (6.2: fűtetlen tér felé néző határolók `Eszközök → Szerkezetek cseréje` – túloldali hőm. + Bu + „gyengén kapcsolt” be; 6.5: fotók, adminisztrációs adatok, építés éve) → a WinWatt ellenőrző-listáját (ETZone → Ellenőrzések fül) tételesen lezárjuk → WinWatt számol, exportálja az UploadRequest XML-t → keresztellenőrzés → feltöltés. Mindig **egy változatot** adj (Péter kérése, 2026-09-28 – NEM A/B fájlokat): ahol egy szerkezet vagy feltevés bizonytalan (pl. tetőtéri alapterület, pince feletti födém vs. talajon fekvő padló, lejtésképző vastagság), kérdezd meg Pétert, majd azzal az egy döntéssel generálj; a feltevést a naplóban rögzítsd. Új projekt-XML-hez NEM kell minta fájlt bekérni – az 5. fejezet referencia-váza tartalmazza a teljes szerkezetet.

## 1. WinWatt projekt-XML – betölthetőségi szabályok (tanulságok)

Szerkezet (gyökér alatt sorrendben): `ProjektData`, `WinWatt32Panel`×n, `WinWatt32Room`×n, `WinWatt32Building` (benne `EPBD`, `ETZone`), `WinWatt32ProjektOptions`. Minden elemnek egyedi `ItemHeader/ID`. Nem ismert elemet ne találj ki. Minden szerkezettípus-kód és mind a hat gépészeti rendszer (fűtés, HMV, légtechnika, hűtés, világítás, napelem/nyereségáram) XML-sémája és kódtáblája a 6. fejezetben van (GUI-ból exportálva ellenőrizve, 2026-10-29); a szellőzés/hűtés sablonja Péter BL26-0044-es mentéséből is megvan („Péter WinWatt-véglegesítése”).

**Projektfejléc**: a WinWatt a neveket a `<Line Index="0">` elemekből ÉS a `Consumer`/`Construction`/`Planer` elemek SZÖVEGES TÖRZSÉBŐL olvassa (sorok `\r\n` literállal), nem csak az attribútumokból – mindkettőt töltsd ki. Minta: Line-ok: „Családi ház”, „2360 Gyál”, „Táncsics Mihály utca 19. Hrsz: 2776”, megrendelő neve, címe, tanúsító neve, címe, „regisztrációs szám: TÉ 07-52263”, e-mail. `Planer`/`EQAdmin/Auditor`/`ETZoneDoc/Auditor`: Lukács Péter, 8060 Mór, Pince utca 19. (StreetType 12 = utca), TÉ 07-52263, info@bimline.hu, +36209966462. `Construction LotNr` = hrsz. `EQAdmin/NumOfHeatedFloors` ÉS `ETZoneDoc NumOfHeatedFloors` egyaránt (a WinWatt az utóbbit felülírhatja – betöltés után ellenőrizni).

**Panelek (rétegrendek)**: a WinWatt betöltéskor a rétegekből újraszámolja az U-t; a `%`-os `kModifier`-t a **kerekítetlen** rétegi U-ra teszi, és az eredményt kerekíti 3 tizedesre (0,13964×1,2 = 0,168; 0,14773×1,2 = 0,177 – NEM 0,148×1,2 = 0,178). `kFromLayersOriginal`, `kFromLayers`, `k` legyen ezzel konzisztens. Ha a WinWatt a rétegekből a 3. tizedesben mást kap (pl. Balatonalmádi, 2026-09-28: „Külső fal új” WinWatt 0,189 ↔ XML 0,188), a WinWatt értékét írd a panel `k`-ba ÉS minden hozzá tartozó határoló `U`-ba (generátorban `k_override`). A rétegek utáni `<ThermalBridgeModifier>` (Type 2, „Szarufa_arány”, Size, Value, dU) = „eltérő U értékű felület” – a WinWatt ezt is újraszámolja és figyelmeztet; ha %-ba olvasztod, töröld (`LayeredkModifier`-t is). Fiktív rétegeket (pl. 1 cm zárt légréteg ragasztott EPS alatt) törölj. Légréteget (pl. álmennyezet) ne `DataMode="Air"` réteggel adj meg (sémája nem ellenőrzött), hanem `Normal` réteggel, egyenértékű λ-val (λ = d/R, pl. R=0,16). Ablak panel árnyékolása: a WinWatt a panel `ShadowMode`/`ShadowFactor`/`NightPlusR` értékét minden ablak-határolóra (`ShadowMode`, `ShadowFactor`, `FNightPlusR`) átviszi. Külső redőnnyel (Péter, BL26-0044, 2026-10-26): 1 / 0,1 / 0,19; redőny nélkül (Esztergom A1, 2026-09-15): 2 / 0,8 / 0,12. Ablak/ajtó panel: `WindowCalc` (Ug, Uf, keretszélesség) adja az U-t.

**Helyiségek**: fűtési `Heating/Temp` = **22 °C** minden helyiségre (lépcsőházra, közös tárolóra is – Péter egységesen 22-re állította), `Filtration/Mode` = **0**, `AirChangeFact` = **0,5** (nem a Gyál-minta 2 / 0,8). `Boundary/U` MINDIG egyezzen a panel `k`-jával: a WinWatt a határoló U-ját helyiségenként statikusan tárolja (hogy egyedileg módosítható legyen – ezt Péter nem használja), ezért minden eltérésre „A szerkezet típusnál megadott U értéktől eltérő értékkel szerepel az épületnél” figyelmeztetést ad (Péter, 2026-09-28). Kivétel a `FloorISO` padló: a WinWatt helyiségenként ISO 13370 szerint számol – ott a figyelmeztetés normális, DE a panel `ISOFloor` (Area, Perimeter, AverageU), `FloorISOdt`, `FloorISOPszi`, `BaseWidth`, `EarthLambda` és a peremszigetelés-mezők (`FloorIsolationThickness/Resist/Width/Height`) MINDIG a projekt adataival íródjanak: a vázban a Gyál-ház adatai vannak (95,8 m² / 45,3 m / 15 cm, 0,6 m peremszigetelés), bent hagyva 0,11–0,15-ös hamis padló-U-t adnak (Balatonalmádi, 2026-09-28). Area = talajon fekvő padló külső mérettel, Perimeter = a szabadba/fűtetlen térbe néző kerület (fűtött tér felé eső fal nem), peremszigetelés csak ha tényleg van; a határoló `U` = ISO 13370 egyenértékű U, `Fdt` = dt, `FPszi` = 0. Ajtó határoló `Type` 12 (nem 10 – különben üvegarány/g figyelmeztetés). `MinA` (levonandó felület) az opak határolón = az azonos tájolású+dőlésű nyílászárók területösszege. 0 m²-es határoló → „nincs felület” hiba, töröld. **Padló határoló (FloorISO) `x` = az adott helyiség KÜLSŐ falainak hosszösszege** – ez a WinWatt „födémek létrehozása” parancsának logikája (Péter, 2026-09-16), és helyes, ha a helyiség alatt végig talaj van, nincs pince; belső helyiségnél (pl. WC) így 0 lesz – a WinWatt is így hozza létre, nem hiba. NEM területarányos kerület-szétosztás és NEM az épület teljes kerülete. (Ha pince van a helyiség egy része alatt, a padló-típus és a hossz külön mérlegelendő – naplóban jelezd.) Tetőtéri helyiség: `GivedVolume` = alapterület × átlagmagasság (keresztmetszetből), tető határoló mindkét oldalra (Compass 45/225, Gradient 45), oromfal trapéz/háromszög területtel. Tájolás: Compass fok (315 ÉNy, 45 ÉK, 135 DK, 225 DNy). Fűtött–fűtött szintközi födém: Type 7 (`Roof5`) határoló `OverSideTemp Flags="2" OverTempWinter="20" BuWinter="1"` – csak hőtároló tömeg, veszteség 0; az emeleti padlót a fűtött fsz. felett nem kell határolóként felvenni. **Fűtetlen tér felé néző határoló** (Type 18 fűtetlen felé néző fal, 21 ajtó, 4 padlásfödém, 5 pincefödém, 8 lefelé hűlő födém fűtetlen tér felett): `OverSideTemp Flags="14"` + Bu az ÉKM-táblából – `Flags="2"`-vel kimarad az energetikai burokból, és importkor a WinWatt amúgy is visszaállítja → betöltés után *Szerkezetek cseréje* (6.2). Ha a fsz. mennyezetének egy része lapostető/terasz (emelet visszahúzva), helyiségenként bontsd: tető-panel(ek) a szabad részre, Type 7 a fűtött emelet alatti részre (geometriai átfedésből, a listázott helyiségterületre skálázva).

**Egy „Ablak” szerkezet (Péter kérése, 2026-09-15)**: a szerkezetlistában EGYETLEN `OutsideWindow` panel legyen („Ablak”, referenciaméret 1,2×1,2, WindowCalc-kal) + egy „Bejárati ajtó”; minden üvegezett nyílászáró (ablak, teraszajtó, fix üvegfal) erre hivatkozik, a tényleges méret és tájolás a helyiség `Boundary`-jában (`x`, `y`, `Compass`, `NumOf`), az U-t a WinWatt a WindowCalc-ból méretenként számolja (a Boundary `U`-ba a méretfüggő értéket írd: (Ag·Ug+Af·Uf)/A, Ψ=0). Ne generálj méretenként külön ablak-panelt.

**U-értékek forrása, elnevezés (Péter, 2026-10-26)**: (1) Ajtót és kaput, ha a terv nem ad meg U-értéket, a 9/2023. (V. 25.) ÉKM rendelet 1. melléklet 1.1 pont követelményértékén vegyél fel, és a `PanelRenovationItem` `kmax`-a is ez legyen: homlokzati vagy fűtött–fűtetlen terek közötti ajtó (bejárati ajtó is) **1,4**; homlokzati vagy fűtött–fűtetlen terek közötti kapu (pl. garázskapu) **1,8** – a garázskapu külön „kapu” panel, ne ajtó; ipari és tűzgátló ajtó és kapu **2,0** W/m²K. (2) Minden más U-értéket, amelyet nem a terv ad meg, hanem mi veszünk fel (falazóblokk λ, ablak Ug/Uf/keretszélesség, hőszigetelés λ stb.), **csak valós, beszerezhető termék gyártói adatlapja vagy teljesítménynyilatkozata alapján** lehet felvenni (pl. Porotherm 30 N+F neo λterv,fal 0,184 hagyományos habarccsal; Salamander bluEvolution 82 Uf 0,98, látszó keret 107 mm) – „tipikus”, becsült vagy kitalált érték nem használható. A termék nevét, a forrást (adatlap, dátum) és az értéket a naplóba és a panel/réteg nevébe írd; ha nincs megfelelő termékadat, kérdezd meg Pétert. (3) A paneleket (rétegrendeket) az építészeti terv jelölése szerint nevezd el, pontosan úgy, ahogy a terven áll (pl. „R7./ Teherhordó falazat”, „R2*./ Zárófödém álmennyezettel”); ha egy rétegrendből több panel kell (pl. eltérő ISO 13370 geometria miatt), a jelölés maradjon, toldással (pl. „R4./ Földszinti padlószerkezet - garázs”).

**Péter WinWatt-véglegesítése (Solymár BL26-0044 diff, 2026-10-26)** – a generátor ezeket alapból így írja:
- Péter beállítása mindig felülírja a generátort; a GML a GEN-ben ténylegesen szereplő értékeket és megnevezéseket kövesse (U-tábla, termékmondat). Solymárnál Péter a gyártói adatot általános, „– feltevés” jelölésű értékre cserélte (kerámia falazóblokk N+F 30 cm λ 0,23 ρ 750; üveg „4-14-4-14-4 argongázas 3 rétegű” Ug 0,6 g 0,50; keret „Műanyag 6-7 kamrás 82 mm” Uf 1,0 / 110 mm), a bejárati ajtót „Hőszigetelt bejárati ajtó” U 1,0-ra → a GML-ben „feltételezett jellemzők … ettől eltérő csak legalább ilyen hőtechnikai jellemzőkkel építhető be”.
- Ablak (panel és minden ablak-boundary): `ShadowMode` 1 (külső), `ShadowFactor` 0,1 (külső redőny), `NightPlusR`/`FNightPlusR` 0,19.
- Kapu: panel `Type="OutsideGate"`, `<Type>kapu (külső, üvegezetlen)</Type>`; boundary `Type` 23; PRI `Type` 23, kmin 1,3 kmax 1,8, `Symbol` 14. (Ajtó: 12 / Symbol 13.)
- HMV hőtermelő, ha a levegő-víz hőszivattyú indirekt tárolóval adja: `CkType` 23, `Ck` 0,45, „Elektromos üzemű hőszivattyú, levegő hőforrással” (nem a fűtési 12/0,30); tároló `qft` 8,6 (fűtött térben); cirkuláció nélkül `qfvType` 3 → a GML-ben is cirkuláció nélkül (cirkulációs szivattyú a villamos táblából is ki).
- Hővisszanyerős szellőzés és gépi hűtés esetén az EPBD-be kell `WinWatt32AiringSystemItem` (Mode 1, Volume, AirChangeFactLT 0,5, AirChangeFactInf 0,5, AirVolumeLTBase = 0,5·V, RecuperationFlags 1, RecuperEfficiency 85, HeatedAirTemp 20, CooledAirTemp 26, fszType 3 „20 °C alatti befúvási hőmérséklet esetén”, dpVent 150, VentEfficiency 50, WorkingSeasons 1) és `WinWatt32CoolingSystemItem` (StokerItem Type 5 elektromos, CkType 1 „Léghűtéses kompakt és osztott kivitelű (távkondenzátoros) folyadékhűtő SEER=3,0” Ck 0,33; eszab 1,13 „Víz hőhordozó közeg;Hűtött víz 6 °C / 12 °C (pl. fan coil)”; cHType 1 cH 1,25; eszall 1) a `WaterHeatingSystemItem` után, `NumOfAiringSystems`/`NumOfCoolingSystems` = 1. Sablon: Péter egy mentett XML-jéből emeld ki (BL26-0044 `winwatt/tpl_systems.xml`), WFinal/VentEnergy nullázva.
- Kerekítés: panel `k` = round(kFromLayers **kerekítetlen** × (1 + kModifier/100), 3); ablak Uw 2 tizedesre kerekítve. Talajon fekvő padló ISO-paramétereit (A, P, W) Péter a fűtött tér tényleges kontúrjára állítja – a generátorba a nettó belső kontúrt add, ne a külső befoglaló méretet.
- A WinWatt-mentés a csak helyiségben használt, katalógusból törölt paneleket (pl. garázsfal, garázspadló) nem exportálja a panelek közé, de a határolás megmarad – a diffben ez nem hiba.
- Diffnél a paneleket és helyiségeket NÉV szerint párosítsd (a WinWatt átrendezi a sorrendet), ne index szerint (`xdiff2.py`).

**Mit ír át a WinWatt betöltéskor (Esztergom A1 diff, 2026-09-15; 2026-10-29-i teljes körű ellenőrzés: 6.3)** – ezeket ne tekintsd hibának, de ellenőrizd: ID-k újraszámozva (épület 1, helyiségek 2-től, panelek 70-től); `ETZone/ETZoneDoc` teljesen kiürül (Construction/Auditor/NumOfHeatedFloors/YearOfModernization) → WinWattban újra kitöltendő; `PanelRenovationItem`-eket a WinWatt maga generálja (a mieinket felülírja) – látott 2023-as követelmények: fal kmax 0,24 (kmin 0,16), tető 0,17 (0,12), ablak 1,1 (0,8), ajtó 1,4 (1,0), `Flags` 2/32/34, `Symbol` 0/1/21/13; `WaterHeatingSystemItem` `UseZones`=2 + helyiségenként `RoomAreaItem ID Area="0"`; `Cooling Calculated="yes"`; a fűtési rendszer `Description`-je kiürült (WinWattban újra beírandó vagy a gépészeti leírás a `Comment`-be); qfv/qft/Eft/Efsz értékek területre újraszámolva; Péter a HMV `qft`-t 5,5-re állította (tároló-veszteség) – a `qfvType` 3 (cirkuláció nélkül) maradt, a cirkulációt WinWattban kell felvenni.
**Pincefödém (MEGOLDVA, 2026-10-29)**: a helyes típus `Roof3` / Boundary Type **5** („pincefödém, alsó zárófödém”, Rse = Rsi = 0,17, követelmény 0,26), illetve fűtetlen tér feletti belső födémnél `Roof6` / Type 8. A régi `Roof5`/Type 7 áthidalás hibás, ne használd. Importkor MINDEN határoló `OverSideTemp`-je 20 °C / Bu 1 / Flags 2 lesz (nem csak a Roof5-é), ezért a túloldali hőmérsékletet és a Bu-t betöltés után az *Eszközök → Szerkezetek cseréje* paranccsal kell beállítani (6.2). A visszakapott XML-ben a határoló `OverSideTemp`-jét (`Flags="14"`) ellenőrizd.
**Diff-ellenőrzés**: Péter WinWattból mentett XML-jét lxml-lel, tag-sorrend szerint diffeld; SKIP-lista (számított): Mass/HeatMass/HeatCapacity/DampFactor/Delay, HeatingPower, CoolingPower, Value, Calculated*/Total*, FISRG*, EnergeticValue, TransPower/SunShinePower/Power/FiltPower/FiltBasePower, OutsideSurface, CalculatedVolume, EPBD-eredmények (ISRG, Qb, QHMV, HeatingEnergy, EnergyConsumptions, CO2Emission, WFinal, QFinal). Ami marad, az Péter szándékos beállítása → vezesd vissza a generátorba és ide.

**EPBD**: `WinWatt32HeatingSystemItem`/`WaterHeatingSystemItem` `SystemArea`,`Area` = fűtött helyiségek területösszege; `Description`-be a tényleges gépészet (típus, teljesítmény, puffer, hőfoklépcső). Hőszivattyú: StokerItem CkType 12 (levegő, 35/28), HMV HP-bojler CkType 13 (beltéri levegő). Ha a HMV-t ugyanaz a levegő-víz hőszivattyú adja (indirekt tároló): HMV-hőtermelő CkType 23, Ck 0,45 (Péter, BL26-0044).

Kimenet: `<?xml version="1.0" encoding="utf-8"?>` dupla idézőjellel, UTF-8. Napló (NAPLO.md) minden feltevéssel „ELLENŐRIZENDŐ” jelöléssel; az eredeti XML-t soha ne írd felül, `_javitott` névvel ments (új generálásnál `GEN - <projekt>.xml`, egy változat).

Betöltés után Péter elküldi a WinWatt üzeneteit → mindegyiket tételesen zárd le, és az általa kézzel átírt XML-t diffeld a szkript kimenetével (a WinWatt által újraszámolt mezőket – tömegek, HeatingPower, EPBD-eredmények – szűrve), a tanulságokat vezesd vissza a szkriptbe és ebbe a skillbe.

## 2. OÉNY feltöltő XML (`UploadRequest`) – szerkezet

Gyökér `UploadRequest` (xmlns:xsi), elemsorrend:
- `Header`: `EnergyClassification`, `Co2Emission` – betű (A+++ … I, 2023-as skála).
- `BuildingData`: `ClientName`, `BuildingAddress{ZipCode,SettlementName,StreetName,StreetType(pl. utca),HouseNumber}`, `TopographicalNumber` (hrsz), `CertIssueReason` (pl. Other), `BuildingPurpose` (ResidentialBuilding), `YearOfConstruct`, `MajorRenovationYear/Year`, `HeritageOrLocalProtection` (NotProtected), `UsefulFloorArea`, `ConditionedVolume`, `NumberOfFloors`, `BuildingAreaToVolumeRatio`, `HasPublicTraffic`, `IsPublicProperty`, `IsFunctionalUnit` (true/false).
- `EfficiencyCategories`: `BuildingCategory` (SingleFamilyDetachedHome), `IsMajorRenovationFulfilled`, `IsZeroEmissionFulfilled`, `IsSummerHeatProtectionFulfilled`, `RenewableEnergyUsage` (%), `CurrentValues{SummariesEnergyRating{Value,Percentage}, Co2{Value,Percentage}, HeatLossFactor{Value}}`, `MajorRenovationRequirementLevel{SummariesEnergyRating,HeatLossFactor}`, `NearZeroEnergyBuildingRequirementLevel{SummariesEnergyRating,Co2,HeatLossFactor}`.
- `CertifierDetails`: `Name`, `Address{...}`, `PhoneNumber`, `Email`, `EligibilityNumber` (TÉ 07-52263), `SoftwareAndVersion`.
- `Validity/SiteInspectionDate` (ÉÉÉÉ-HH-NN).
- `BoundaryAndOpeningStructures/BoundaryAndOpeningStructure{TypeOfStructure, EnergeticQualities/EnergeticQuality{Quality,U,Dimension}×n}` – TypeOfStructure látott értékei: FacadeWall, StructuresEnclosingHeatedAtticSpace, FacadeOpeningsWithWoodenOrPvcFrames, DoorBetweenFacadeOrHeatedAndUnheatedSpaces, GroundLevelFloorInNewBuildings; Quality: Excellent / Good (…); Dimension m².
- `BuildingServicesSystemEnergeticQuality{HeatingSystem, HotWaterSupplySystem}` (Good…).
- `EnergyConsumptionByUse/CalculatedEnergyUse/EnergySources/*/CurrentEnergyConsumption` – kWh/m²a: NetworkElectricity, EnvironmentalHeat, ActiveRenewablePrimaryEnergy, LocallyProduced, ProducedRemotely, PassiveRenewablePrimaryEnergy, NonRenewablePrimaryEnergy, CarbonDioxideEmissions (kg/m²a), AnnualHeatingEnergyNeeds.
- `EnergyConsumptionByUseWithExportEnergy/UsageTarget/ByEnergySources/*/{Heating,HotWater,…}` – ugyanazok az energiahordozók felhasználás szerint bontva.
- `Photos/Photo{Category,Content}` – base64 JPEG; kategóriák: CoverPhoto, Facade, CharacteristicHeatExchanger, CharacteristicOpeningStructure, HeatGeneratorAndHeatStorageSituation (többször is).
- `CalculationsPdfFileContent` – base64 PDF (a teljes tanúsítvány-számítás).

Hivatalos dokumentáció/minták: e-epites.hu „Elérhető az új e-tanúsítás” (general_cert.xml / .json minta), git.lechnerkozpont.hu/entan/dokumentacio (README, séma – böngészőből), entanhelpdesk@e-epites.hu.

## 3. Keresztellenőrzés feltöltés előtt (szkripttel)

- Well-formed, minden kötelező elem jelen, base64 tartalmak dekódolhatók (PDF `%PDF`, JPEG `FFD8`).
- `UsefulFloorArea` = WinWatt `EPBD/HeatedArea`; `ConditionedVolume` = `TotalVolume`; `BuildingAreaToVolumeRatio` = `TotalOutsideSurface/TotalVolume` (2 tizedes); `NumberOfFloors` = fűtött szintek.
- `NonRenewablePrimaryEnergy` = Σ (Heating + HotWater + …) a ByEnergySources bontásból (±0,02 kerekítés); `RenewableEnergyUsage` = ActiveRenewablePrimaryEnergy.
- `Percentage` = Value / NearZero követelmény ×100 (pl. 58,68/76,00 = 77 %; CO₂ 12,96/20 = 65 %); besorolás betűje a rendelet (9/2023 ÉKM) aktuális táblájából – ne fejből.
- Szerkezet-U-k és területek = WinWatt panel `k` és a `PanelRenovationItem`/helyiség-összegek; a tanúsító adatai = `ETZoneDoc/Auditor`.
- Hiányzó rendszer figyelmeztetés: ha az épületben van gépi szellőzés/hűtés, de a WinWatt-ban 0 szellőző/hűtő rendszer van, a feltöltés előtt pótolni kell.
- A dekódolt PDF 1. oldala (összesítő) egyezzen a Header/CurrentValues értékeivel.

## 4. Automatizálás – WinWatt-hoz nincs API

A WinWatt (Bausoft) zárt Windows-alkalmazás, dokumentált COM/DLL/parancssori felület nincs → MCP közvetlen integráció nem építhető. Marad: (A) XML export/import – robusztus, ezt használjuk; (B) GUI-automatizálás a linkelt gépen (computer_* eszközök) – 2026-10-29-én végigpróbálva működik: XML import → Szerkezetek cseréje → rendszerek felvétele/módosítása → ETZone „Számít” → Ellenőrzések → e-tanúsítás XML export. Fogások: 6.7. Csak Péter jóváhagyásával és a teszt- vagy projektmappán dolgozz; az eredményt mindig XML-exporttal és diffel ellenőrizd. A kódtáblák forrása a telepítési mappa `languages\Hungarian.xml` fájlja (`IDS_…+n`).

## 5. Projekt-XML referencia-váz (WinWatt NativeExport) – NEM kell minta fájlt bekérni

Forrás: WinWatt-export (Gyal Tancsics 19.xml, 2026-09) – az összes elem ebben a sorrendben, egy-egy példánnyal. Generáláskor a legbiztonságosabb módszer: a vázat (ebből a fejezetből fájlba írva) **Python/lxml-lel klónozni** (`copy.deepcopy`) és csak a szöveges értékeket írni át – az elemek sorrendjét, nevét, attribútumait NEM szabad megváltoztatni; a `<!-- ... -->` megjegyzéseket a klónozás előtt távolítsd el vagy a jelzett ismétlődéseket pótold (Hour 0..23, SumValues TypeIndex 0..7, DH2..DH14). Bevált generátor: `gen_winwatt.py` (BL26-0021 Esztergom, BL26-0025 Balatonalmádi – Engterv/winwatt mappa) – panel/helyiség/épület sablon-klónozás + `model.py` adatmodell (tájolás, szintmagasság, nyílászárók, helyiségek, rétegrendek λ-val, U-számítás).

### Kódok, tanulságok (ellenőrzött – a generált XML betöltődött)
- Bevált generátor-minta: Esztergom A1 (2026-09-14/15) `model.py` + `gen_winwatt.py A|B` – helyiségenkénti modell (68 helyiség), rétegrendek λ-val, egy „Ablak” panel, PanelRenovationItem, EPBD; a váz `skeleton_raw.xml`-ként ebből a fejezetből kinyerve, ismétlődések (Hour 1..23, SumValues 1..7, CoolingPower, DH2..14) lxml-lel pótolva, `<!-- -->` törölve. Kisebb minta: Budaörs Kismartoni 41 (2026-09-16, `skeleton.py` + `model.py` + `gen_winwatt.py`) – falanként (hossz, tájolás, nyílások) megadott helyiségek, fsz. mennyezet R3/R3'/Type 7 felosztással, padló `x` = helyiség külső falhosszainak összege. Legfrissebb: Balatonalmádi Batthyány 38/B (BL26-0025, 2026-09-28, `Engterv/winwatt`) – meglévő ház bővítés, egy változat, `k_override`, ISO 13370 padló (`iso_floor()`: ISOFloor Area/Perimeter/AverageU, dt) a projekt adataival.
- `WinWatt32Panel Type=` attribútum (kód) ↔ `<Type>` szöveg ↔ Boundary `<Type>` szám:
  `OutsideWall`=0 külső fal · `InsideWall`=1 belső fal (fűtött terek között) · `Roof1`=3 tető (Gradient 45 ferde, 0 = lapostető) · `Roof5`=7 belső födém (felfelé hűlő) · `OutsideWindow`=10 ablak (ferde tetőablak: Gradient 45) · `OutsideDoor`=12 ajtó (külső) · `InsideWall1`=18 belső fal fűtetlen tér felé · `OutsideGate`=23 kapu (külső, üvegezetlen) · `FloorISO`=26 talajon fekvő padló (ISO 13370).
  A teljes lista (Roof2 padlásfödém = 4, **Roof3 pincefödém = 5**, Roof4 árkád = 6, **Roof6 lefelé hűlő belső födém = 8**, InsideWall2 = 19, InsideDoor1 = 21, OutsideWindow2 tetősík ablak = 24, WallInEarthISO = 25, IndustrialGate = 31 stb.) a 6.1 pontban van. A fűtetlen pince feletti födém: `Roof3`/Type 5. A fűtetlen tér felé néző határolók `OverSideTemp`-jét betöltés után a GUI-ban kell beállítani (6.2).
- Minden `ItemHeader/ID` egyedi; a helyiség `BuildingRefID` = az épület ID-ja. Panelek a szövegük szerint (`Boundary/Name` = panel `ItemName`) kapcsolódnak, a U-t a Boundary-ban külön meg kell adni (= panel `k`).
- `ProjektData`: a `Consumer`/`Construction`/`Planer` elemek szöveges törzsében a sortörés **literális `\r\n` karakterlánc** (backslash-r-backslash-n), nem valódi sortörés; `Line Index=0/1/2` = objektum / megrendelő / tanúsító sorai.
- Panel: `k` = round(kFromLayers·(1+kModifier%), 3) (kerekítetlen kFromLayers-ből) ; `kFromLayers`=`kFromLayersOriginal`; `PanelLayer DataMode="Normal"` mezők: LayerName, Thickness (cm), Density, ThermalCond, ThermalRes, HeatCapacity (kJ/kgK), SteamDiffCond, SteamDiffRes, SteamDiffResNum (μ), SteamSDValue, InitialHumidity, PermitHumidity, ThermalCondFactor, InitialHumidity2 (+ opcionális SorptionIsotermaPoint-ok). `DataMode="Air"` légréteg (ThermalRes), `"Thick"` vékony réteg. Rétegsorrend kívülről befelé (`LayeredPanel Ordering="Normal"`).
- Ablak panel: `WindowCalc` (GlassType Ug,g; FrameType Index 0..3 Uf,Width mm – a nem használt 1..3 üres, Uf=0 Width=0; DeviderType Pszi) – a WinWatt ebből számol U-t; a Boundary-ban a WindowCalc megismétlődik + `FNightPlusR`, `GlassgValue`, `FISRG*` (számított, 0-zható).
- Helyiség: `Area`, `Height`, `GivedVolume` (0 = Area×Height), `Heating/Temp` (22), `Filtration Mode=0, AirChangeFact 0.5` (Péter beállítása; a Gyál-minta 2/0,8 volt); Boundary: `x`,`y`,`A`,`MinA` (levonandó nyílászáró), `U`, `Compass` (fok), `Gradient`, `NumOf`; opak határolón Mass/HeatMass/HeatCapacity/DampFactor/Delay/Rsi a panelből; belső határolón `OverSideTemp`. `HeatingPower`, `CoolingPower Hour 0..23` számított (0-zható). FloorISO határolón `x` = a helyiség külső falainak hosszösszege (WinWatt „födémek létrehozása” logika; belső helyiségnél 0), `y`=1, plusz Fdt/FEarthLambda/FPszi/WallFloorPszi/Floorz/PlinthWallU.
- Helyiség `Function` látott értékei: Nappali, Hálószoba, Konyha, Fürdőszoba, WC, Kamra, Lépcsőház (szabad szöveg; összevont lakásnál „Nappali”, közlekedőnél „Közlekedő”). Fűtési rendszer `RegPart Index 0..4` (szabályozási részértékek), `Cooling/SumValues TypeIndex 0..7` × 24 óra – mind számított, a vázbeli értékek átvehetők.
- Épület: `EPBD/CalcArea`=`HeatedArea` = fűtött helyiségek területösszege; `EQAdmin` (Order, Auditor, Construction, Date, NumOfHeatedFloors, Technology, YearOfBuilding/Modernization, HeritageProtection) és `ETZone/ETZoneDoc` (NumOfHeatedFloors, Construction, Auditor, SiteInspectionDate, Date) attribútumosan – mindkettőt kitölteni. `WinWatt32HeatingSystemItem`/`WaterHeatingSystemItem`: Description, SystemArea, Area; `StokerItem CkType 12` = levegő-víz HP (fűtés, 35/28), `13` = beltéri levegős HMV-HP, `23` = levegő-víz HP a HMV-hez (Ck 0,45); `PanelRenovationItem` (Name, Type kód, k, kmin, kmax) az EPBD alatt, a `RefBuilding2023` után (NEM a Building alatt). `ZoneUsingType Type="Lakóépület egésze"`, `ThermicZone Type 0/1/2`.
- Ha mégis kell egy teljes, friss minta: a Drive-connector `search_files` (`fullText contains 'WinWatt32Project'`) megtalálja a korábbi WinWatt-exportokat (pl. Gyál Táncsics 19, Biatorbágy Forrás utca) mappa-engedély nélkül is.
- Kimenet: `<?xml version="1.0" encoding="utf-8"?>` + gyökér `<WinWatt32Project Type="NativeExport">`; a WinWatt a számított mezőket (tömegek, teljesítmények, EPBD-eredmények, Cooling SumValues) betöltés után újraszámolja.

### Váz (egy-egy példány minden elemből; a `<!-- ... -->` helyeken ismétlődés)
```xml
<WinWatt32Project Type="NativeExport">
 <ProjektData Flags="7" Monitoring="0">
  <Line Index="0">Családi ház</Line>
  <Line Index="0">2360 Gyál</Line>
  <Line Index="0">Táncsics Mihály utca 19. Hrsz: 2776</Line>
  <Line Index="1">Györgyi József</Line>
  <Line Index="1">2360 Gyál, Táncsics Mihály utca 19.</Line>
  <Line Index="2">Lukács Péter</Line>
  <Line Index="2">8060 Mór, Pince utca 19.</Line>
  <Line Index="2">regisztrációs szám: TÉ 07-52263</Line>
  <Line Index="2">info@bimline.hu</Line>
  <Date>2026. 09. 02.</Date>
  <Consumer Name="Györgyi József" ZipCode="2360" City="Gyál" Address="Táncsics Mihály utca 19." Email="">Györgyi József\r\n2360 Gyál, Táncsics Mihály utca 19.\r\n</Consumer>
  <Construction Name="Családi ház" ZipCode="2360" City="Gyál" CityPart="" Street="Táncsics Mihály" StreetType="utca" HousNr="19" Building="" StairCase="" Floor="" Door="" LotNr="2776" YearOfBuilding="" YearOfModernization="2025">Családi ház\r\n2360 Gyál\r\nTáncsics Mihály utca 19. Hrsz: 2776\r\n</Construction>
  <GPSPos>
   <Latitude Type="0" Degree="0" Minute="0" Second="0"/>
   <Longitude Type="0" Degree="0" Minute="0" Second="0"/>
  </GPSPos>
  <Planer Name="Lukács Péter" ZipCode="8060" City="Mór" Address="Pince utca 19." RegNr="TÉ 07-52263" Email="info@bimline.hu" Street="Pince" StreetType="12" HousNr="19" Building="" StairCase="" Floor="" Door="" Phone="+36209966462">Lukács Péter\r\n8060 Mór, Pince utca 19.\r\nregisztrációs szám: TÉ 07-52263\r\ninfo@bimline.hu\r\n</Planer>
  <Comment/>
 </ProjektData>
 <WinWatt32Panel Type="OutsideWindow" Layered="No">
  <ItemHeader>
   <ItemName>Ablak</ItemName>
   <ItemPath/>
   <ID>10</ID>
  </ItemHeader>
  <Type>ablak (külső, fa vagy PVC)</Type>
  <x>1.2</x>
  <y>1.2</y>
  <k>0.73</k>
  <GlassRatio>84</GlassRatio>
  <ExtendedWindow>1</ExtendedWindow>
  <NightPlusR>0</NightPlusR>
  <GlassMode>1</GlassMode>
  <GlassFactor>0.5977</GlassFactor>
  <GlassgValue>0.52</GlassgValue>
  <ShadowMode>1</ShadowMode>
  <ShadowFactor>0.1</ShadowFactor>
  <ShadowFactorWinter>1</ShadowFactorWinter>
  <WindowCalc DifferentFrames="0" CalculatedWindow="1">
   <GlassType Ug="0.6" g="0.52">4:-16-4-16-:4 argongázas</GlassType>
   <FrameType Index="0" Uf="1.4" Width="50">PVC 75 mm-es 4-5 kamrás</FrameType>
   <FrameType Index="1" Uf="0" Width="0"/>
   <FrameType Index="2" Uf="0" Width="0"/>
   <FrameType Index="3" Uf="0" Width="0"/>
   <DeviderType Pszi="0"/>
  </WindowCalc>
  <ExtendedGradient>1</ExtendedGradient>
  <Gradient>90</Gradient>
  <ExtendedOutside>0</ExtendedOutside>
  <Absorption>0,699999988079071</Absorption>
  <Emission>0.9</Emission>
  <SizesList>1,2 * 1,2</SizesList>
  <OptionsList/>
  <InfiltrationFactor>0</InfiltrationFactor>
  <InfiltrationLength>0</InfiltrationLength>
  <Description/>
 </WinWatt32Panel>
 <WinWatt32Panel Type="OutsideDoor" Layered="No">
  <ItemHeader>
   <ItemName>Ajtó</ItemName>
   <ItemPath/>
   <ID>9</ID>
  </ItemHeader>
  <Type>ajtó (külső)</Type>
  <x>1</x>
  <y>2</y>
  <k>1.3</k>
  <ExtendedGradient>0</ExtendedGradient>
  <Gradient>0</Gradient>
  <ExtendedOutside>0</ExtendedOutside>
  <Absorption>0,699999988079071</Absorption>
  <Emission>0.9</Emission>
  <SizesList>1,2 * 1,2</SizesList>
  <OptionsList/>
  <InfiltrationFactor>0</InfiltrationFactor>
  <InfiltrationLength>0</InfiltrationLength>
  <Description/>
 </WinWatt32Panel>
 <WinWatt32Panel Type="InsideWall1" Layered="Yes">
  <ItemHeader>
   <ItemName>Belső fal_futetlen</ItemName>
   <ItemPath/>
   <ID>15</ID>
  </ItemHeader>
  <Type>belső fal (fűtetlen tér felé)</Type>
  <x>0</x>
  <y>0</y>
  <k>1.935</k>
  <ExtendedInside>0</ExtendedInside>
  <OverSideTemp Flags="0" OverTempWinter="20" OverTempSummer="26" BuWinter="1" BuSummer="1"/>
  <OptionsList>DiagramCalc=Yes,CalcReport</OptionsList>
  <Mass>240</Mass>
  <DampFactor>6.62</DampFactor>
  <Delay>5.4</Delay>
  <HeatMass>120</HeatMass>
  <HeatMass2>120</HeatMass2>
  <HeatCapacity>106</HeatCapacity>
  <HeatCapacity2>106</HeatCapacity2>
  <Description/>
  <LayeredPanel Ordering="Normal"/>
  <OutSideTemp>15</OutSideTemp>
  <InSideTemp>22</InSideTemp>
  <Rse>0.13</Rse>
  <Rsi>0.13</Rsi>
  <OutSideRelHum>90</OutSideRelHum>
  <InSideRelHum>50</InSideRelHum>
  <DiffusionDays>180</DiffusionDays>
  <kFromLayersOriginal>1.9349</kFromLayersOriginal>
  <kFromLayers>1.9349</kFromLayers>
  <PanelLayer DataMode="Normal">
   <LayerName>Cementvakolat</LayerName>
   <Thickness>3</Thickness>
   <Density>1800</Density>
   <ThermalCond>0.93</ThermalCond>
   <ThermalRes>0</ThermalRes>
   <HeatCapacity>0.88</HeatCapacity>
   <SteamDiffCond>0.022</SteamDiffCond>
   <SteamDiffRes>0</SteamDiffRes>
   <SteamDiffResNum>0</SteamDiffResNum>
   <SteamSDValue>0</SteamSDValue>
   <InitialHumidity>0</InitialHumidity>
   <PermitHumidity>3</PermitHumidity>
   <ThermalCondFactor>0</ThermalCondFactor>
   <InitialHumidity2>0</InitialHumidity2>
  </PanelLayer>
 </WinWatt32Panel>
 <WinWatt32Panel Type="Roof5" Layered="Yes">
  <ItemHeader>
   <ItemName>Emelet födém</ItemName>
   <ItemPath/>
   <ID>5</ID>
  </ItemHeader>
  <Type>belső födém (felfelé hűlő)</Type>
  <x>0</x>
  <y>1</y>
  <k>2.526</k>
  <ExtendedInside>0</ExtendedInside>
  <OverSideTemp Flags="0" OverTempWinter="20" OverTempSummer="26" BuWinter="1" BuSummer="1"/>
  <OptionsList>DiagramCalc=Yes</OptionsList>
  <Mass>645</Mass>
  <DampFactor>13.12</DampFactor>
  <Delay>8</Delay>
  <HeatMass>332</HeatMass>
  <HeatMass2>320</HeatMass2>
  <HeatCapacity>278</HeatCapacity>
  <HeatCapacity2>271</HeatCapacity2>
  <FloorHeatAbsorb>1.23</FloorHeatAbsorb>
  <Description/>
  <LayeredPanel Ordering="Normal"/>
  <OutSideTemp>22</OutSideTemp>
  <InSideTemp>22</InSideTemp>
  <Rse>0.1</Rse>
  <Rsi>0.1</Rsi>
  <OutSideRelHum>50</OutSideRelHum>
  <InSideRelHum>50</InSideRelHum>
  <DiffusionDays>180</DiffusionDays>
  <kFromLayersOriginal>2.5255</kFromLayersOriginal>
  <kFromLayers>2.5255</kFromLayers>
  <PanelLayer DataMode="Normal">
   <LayerName>Cementvakolat</LayerName>
   <Thickness>2</Thickness>
   <Density>1800</Density>
   <ThermalCond>0.93</ThermalCond>
   <ThermalRes>0</ThermalRes>
   <HeatCapacity>0.88</HeatCapacity>
   <SteamDiffCond>0.022</SteamDiffCond>
   <SteamDiffRes>0</SteamDiffRes>
   <SteamDiffResNum>0</SteamDiffResNum>
   <SteamSDValue>0</SteamSDValue>
   <InitialHumidity>0</InitialHumidity>
   <PermitHumidity>3</PermitHumidity>
   <ThermalCondFactor>0</ThermalCondFactor>
   <InitialHumidity2>0</InitialHumidity2>
  </PanelLayer>
 </WinWatt32Panel>
 <WinWatt32Panel Type="OutsideWall" Layered="Yes">
  <ItemHeader>
   <ItemName>Külső fal</ItemName>
   <ItemPath/>
   <ID>4</ID>
  </ItemHeader>
  <Type>külső fal</Type>
  <x>0</x>
  <y>0</y>
  <k>0.168</k>
  <ExtendedGradient>1</ExtendedGradient>
  <Gradient>90</Gradient>
  <ExtendedOutside>0</ExtendedOutside>
  <Absorption>0,699999988079071</Absorption>
  <Emission>0.9</Emission>
  <OptionsList>DiagramCalc=Yes,CalcReport</OptionsList>
  <Mass>568</Mass>
  <DampFactor>1078.4</DampFactor>
  <Delay>14.9</Delay>
  <HeatMass>164</HeatMass>
  <HeatCapacity>144</HeatCapacity>
  <Description/>
  <LayeredPanel Ordering="Normal"/>
  <OutSideTemp>-2</OutSideTemp>
  <InSideTemp>2</InSideTemp>
  <Rse>0.04</Rse>
  <Rsi>0.13</Rsi>
  <OutSideRelHum>90</OutSideRelHum>
  <InSideRelHum>50</InSideRelHum>
  <DiffusionDays>180</DiffusionDays>
  <kFromLayersOriginal>0.13964</kFromLayersOriginal>
  <kFromLayers>0.13964</kFromLayers>
  <kModifier ModifierMode="Percent">20</kModifier>
  <PanelLayer DataMode="Normal">
   <LayerName>nemes vakolat</LayerName>
   <Thickness>1</Thickness>
   <Density>1850</Density>
   <ThermalCond>0.99</ThermalCond>
   <ThermalRes>0</ThermalRes>
   <HeatCapacity>0.88</HeatCapacity>
   <SteamDiffCond>0.02</SteamDiffCond>
   <SteamDiffRes>0</SteamDiffRes>
   <SteamDiffResNum>0</SteamDiffResNum>
   <SteamSDValue>0</SteamSDValue>
   <InitialHumidity>0</InitialHumidity>
   <PermitHumidity>0</PermitHumidity>
   <ThermalCondFactor>0.61</ThermalCondFactor>
   <InitialHumidity2>0</InitialHumidity2>
  </PanelLayer>
 </WinWatt32Panel>
 <WinWatt32Panel Type="FloorISO" Layered="Yes">
  <ItemHeader>
   <ItemName>Padló</ItemName>
   <ItemPath/>
   <ID>7</ID>
  </ItemHeader>
  <Type>padló (talajra fektetett ISO 13370)</Type>
  <x>0</x>
  <y>1</y>
  <k>0.22</k>
  <OptionsList>DiagramCalc=Yes,CalcReport</OptionsList>
  <Mass>182</Mass>
  <DampFactor>60.46</DampFactor>
  <Delay>5.4</Delay>
  <HeatMass>179</HeatMass>
  <HeatCapacity>151</HeatCapacity>
  <FloorHeatAbsorb>1.554</FloorHeatAbsorb>
  <EarthLambda>2</EarthLambda>
  <FloorISOdt>9.9932</FloorISOdt>
  <FloorISOPszi>-0.032022</FloorISOPszi>
  <ISOFloor Area="95.827" Perimeter="45.29" AverageU="0.15255" PlinthWallU="0" WallFloorPszi="0.1"/>
  <Description/>
  <LayeredPanel Ordering="Normal"/>
  <OutSideTemp>-2</OutSideTemp>
  <InSideTemp>22</InSideTemp>
  <Rse>0.04</Rse>
  <Rsi>0.17</Rsi>
  <OutSideRelHum>90</OutSideRelHum>
  <InSideRelHum>50</InSideRelHum>
  <DiffusionDays>180</DiffusionDays>
  <BaseWidth>0.9</BaseWidth>
  <FloorIsolationThickness>15</FloorIsolationThickness>
  <FloorIsolationResist>4.29</FloorIsolationResist>
  <FloorIsolationWidth>0</FloorIsolationWidth>
  <FloorIsolationHeight>0.6</FloorIsolationHeight>
  <ISOCorrectionMode>0</ISOCorrectionMode>
  <L2D>0</L2D>
  <WallHeight>0</WallHeight>
  <FloorWidth>0</FloorWidth>
  <WallU>0</WallU>
  <kFromLayersOriginal>0.21995</kFromLayersOriginal>
  <kFromLayers>0.21995</kFromLayers>
  <FloorLevel>0</FloorLevel>
  <PanelLayer DataMode="Thick">
   <LayerName>Terraplast PLUS S8 drainlemez</LayerName>
   <Thickness>0.1</Thickness>
   <Density>0</Density>
   <ThermalCond>0</ThermalCond>
   <ThermalRes>0</ThermalRes>
   <HeatCapacity>0</HeatCapacity>
   <SteamDiffCond>0</SteamDiffCond>
   <SteamDiffRes>0</SteamDiffRes>
   <SteamDiffResNum>95000</SteamDiffResNum>
   <SteamSDValue>0</SteamSDValue>
   <ThermalCondFactor>0</ThermalCondFactor>
  </PanelLayer>
 </WinWatt32Panel>
 <WinWatt32Panel Type="Roof1" Layered="Yes">
  <ItemHeader>
   <ItemName>Tető</ItemName>
   <ItemPath/>
   <ID>6</ID>
  </ItemHeader>
  <Type>tető</Type>
  <x>0</x>
  <y>1</y>
  <k>0.138</k>
  <ExtendedGradient>1</ExtendedGradient>
  <Gradient>45</Gradient>
  <ExtendedOutside>1</ExtendedOutside>
  <Absorption>0,699999988079071</Absorption>
  <Emission>0.9</Emission>
  <OptionsList>DiagramCalc=Yes,CalcReport</OptionsList>
  <Mass>25</Mass>
  <DampFactor>87.81</DampFactor>
  <Delay>3</Delay>
  <HeatMass>13</HeatMass>
  <HeatCapacity>11</HeatCapacity>
  <Description/>
  <LayeredPanel Ordering="Normal"/>
  <OutSideTemp>-2</OutSideTemp>
  <InSideTemp>22</InSideTemp>
  <Rse>0.04</Rse>
  <Rsi>0.1</Rsi>
  <OutSideRelHum>90</OutSideRelHum>
  <InSideRelHum>50</InSideRelHum>
  <DiffusionDays>180</DiffusionDays>
  <kFromLayersOriginal>0.12548</kFromLayersOriginal>
  <kFromLayers>0.12548</kFromLayers>
  <kModifier ModifierMode="Percent">10</kModifier>
  <PanelLayer DataMode="Thick">
   <LayerName>Cserepeslemez</LayerName>
   <Thickness>0.05</Thickness>
   <Density>7850</Density>
   <ThermalCond>58.1</ThermalCond>
   <ThermalRes>0</ThermalRes>
   <HeatCapacity>0.46</HeatCapacity>
   <SteamDiffCond>0</SteamDiffCond>
   <SteamDiffRes>30</SteamDiffRes>
   <SteamDiffResNum>0</SteamDiffResNum>
   <SteamSDValue>0</SteamSDValue>
   <ThermalCondFactor>0</ThermalCondFactor>
  </PanelLayer>
 </WinWatt32Panel>
 <WinWatt32Room>
  <ItemHeader>
   <ItemName>Első nappali FSZ</ItemName>
   <ItemPath/>
   <ID>12</ID>
  </ItemHeader>
  <Function>Nappali</Function>
  <Area>21.87</Area>
  <Height>2.85</Height>
  <CeilingHeight>0</CeilingHeight>
  <GivedVolume>0</GivedVolume>
  <CalculatedVolume>62.33</CalculatedVolume>
  <GivedCeilingVolume>0</GivedCeilingVolume>
  <CalculatedCeilingVolume>0</CalculatedCeilingVolume>
  <CalculatedMass>20394</CalculatedMass>
  <PlusMass>0</PlusMass>
  <TotalMass>20394</TotalMass>
  <CalculatedHeatMass>18511</CalculatedHeatMass>
  <PlusHeatMass>0</PlusHeatMass>
  <TotalHeatMass>18511</TotalHeatMass>
  <CalculatedHeatCapacity>15833</CalculatedHeatCapacity>
  <PlusHeatCapacity>0</PlusHeatCapacity>
  <TotalHeatCapacity>15833</TotalHeatCapacity>
  <OutsideSurface>60.345</OutsideSurface>
  <BuildingRefID>11</BuildingRefID>
  <Zone/>
  <Heating Calculated="yes">
   <Temp>22</Temp>
   <IsOutSideTempVariable>1</IsOutSideTempVariable>
   <OutSideTemp>-15</OutSideTemp>
   <TransFactor>1</TransFactor>
   <SunShineFlag>0</SunShineFlag>
   <InternalSource>0</InternalSource>
   <Filtration>
    <Mode>2</Mode>
    <NumOfMens>0</NumOfMens>
    <Portion>30</Portion>
    <AirChangeFact>0.8</AirChangeFact>
    <IsAirTempVariable>1</IsAirTempVariable>
    <AirTemp>-15</AirTemp>
    <AirVolume>0</AirVolume>
    <Power>0</Power>
    <SystemName/>
   </Filtration>
   <IsAirTempCorr>0</IsAirTempCorr>
   <AirTempCorr>1</AirTempCorr>
   <Isn50>0</Isn50>
   <n50>10</n50>
   <n50eFactor>0</n50eFactor>
   <n50Epsilon>1</n50Epsilon>
   <FiltBasePower>0</FiltBasePower>
   <n50Power>0</n50Power>
   <PlusInfiltration>0</PlusInfiltration>
   <PlusAirChangeFact>0.3</PlusAirChangeFact>
   <Earthfg1>1.45</Earthfg1>
   <Earthfg2>0.32432</Earthfg2>
   <EarthGw>1</EarthGw>
   <TransPower>728</TransPower>
   <SunShinePower>36</SunShinePower>
   <FiltPower>0</FiltPower>
   <Power>728</Power>
  </Heating>
  <Cooling Calculated="no">
   <Temp>26</Temp>
   <Pollution>0</Pollution>
   <WallMassMode>1</WallMassMode>
   <Compass>0</Compass>
   <SumValues TypeIndex="0">
    <Value Hour="0">0</Value><!-- ... Hour 1..23 -->
   </SumValues><!-- ... SumValues TypeIndex="1".."7" ugyanígy (24 Value/blokk) -->
  </Cooling>
  <Energetic>
   <EnergeticValue>14.941</EnergeticValue>
   <FISRG>1720.1</FISRG>
   <FISRGSum>2.9305E5</FISRGSum>
   <FISRGSummer>440.76</FISRGSummer>
   <FISRGMin>888.74</FISRGMin>
   <FISRGSumMin>1.3718E5</FISRGSumMin>
  </Energetic>
  <Infiltration>
   <InfiltrationFactor>0</InfiltrationFactor>
   <InfiltrationFactorPlus>0</InfiltrationFactorPlus>
   <InfiltrationMValue>0</InfiltrationMValue>
   <InnerDoors>0</InnerDoors>
  </Infiltration>
  <Boundary>
   <Name>Külső fal</Name>
   <Type>0</Type>
   <NumOf>1</NumOf>
   <x>5.4</x>
   <y>2.85</y>
   <A>15.39</A>
   <MinA>3.57</MinA>
   <U>0.168</U>
   <dUtb>0</dUtb>
   <Compass>315</Compass>
   <Gradient>90</Gradient>
   <Mass>568</Mass>
   <HeatMass>164</HeatMass>
   <HeatCapacity>144</HeatCapacity>
   <DampFactor>1142</DampFactor>
   <Delay>15</Delay>
   <Rsi>0.13</Rsi>
   <Absorption>0.7</Absorption>
   <Emission>0.9</Emission>
   <Options>0</Options>
   <HeatingPower>73</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Belső fal</Name>
   <Type>1</Type>
   <NumOf>1</NumOf>
   <x>5.4</x>
   <y>2.85</y>
   <A>15.39</A>
   <MinA>0</MinA>
   <U>1.935</U>
   <dUtb>0</dUtb>
   <Mass>240</Mass>
   <HeatMass>120</HeatMass>
   <HeatCapacity>106</HeatCapacity>
   <DampFactor>6.62</DampFactor>
   <Delay>5.4</Delay>
   <Rsi>0.13</Rsi>
   <OverSideTemp Flags="2" OverTempWinter="20" OverTempSummer="26" BuWinter="1" BuSummer="1"/>
   <Options>0</Options>
   <HeatingPower>60</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Tető</Name>
   <Type>3</Type>
   <NumOf>1</NumOf>
   <x>4.75</x>
   <y>4</y>
   <A>19</A>
   <MinA>0</MinA>
   <U>0.138</U>
   <dUtb>0</dUtb>
   <Compass>225</Compass>
   <Gradient>45</Gradient>
   <Mass>25</Mass>
   <HeatMass>13</HeatMass>
   <HeatCapacity>11</HeatCapacity>
   <DampFactor>87.81</DampFactor>
   <Delay>3</Delay>
   <Rsi>0.1</Rsi>
   <Absorption>0.6</Absorption>
   <Emission>0.9</Emission>
   <Options>0</Options>
   <HeatingPower>97</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Emelet födém</Name>
   <Type>7</Type>
   <NumOf>1</NumOf>
   <x>21.87</x>
   <y>1</y>
   <A>21.87</A>
   <MinA>0</MinA>
   <U>2.526</U>
   <dUtb>0</dUtb>
   <Mass>645</Mass>
   <HeatMass>332</HeatMass>
   <HeatCapacity>278</HeatCapacity>
   <DampFactor>13.12</DampFactor>
   <Delay>8</Delay>
   <Rsi>0.1</Rsi>
   <OverSideTemp Flags="2" OverTempWinter="20" OverTempSummer="26" BuWinter="1" BuSummer="1"/>
   <Options>0</Options>
   <HeatingPower>110</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Ablak</Name>
   <Type>10</Type>
   <NumOf>1</NumOf>
   <x>1.4</x>
   <y>1.2</y>
   <A>1.68</A>
   <MinA>0</MinA>
   <U>0.72</U>
   <dUtb>0</dUtb>
   <Compass>315</Compass>
   <Gradient>90</Gradient>
   <GlassRatio>85</GlassRatio>
   <SunFactor>0</SunFactor>
   <ShadowMode>1</ShadowMode>
   <GlassMode>1</GlassMode>
   <GlassFactor>1</GlassFactor>
   <GlassgValue>0.52</GlassgValue>
   <ShadowFactor>0.1</ShadowFactor>
   <FNightPlusR>0.33</FNightPlusR>
   <FShadowFactorWinter>1</FShadowFactorWinter>
   <IDiffFactor>1</IDiffFactor>
   <FISRG>557.59</FISRG>
   <FISRGSum>97537</FISRGSum>
   <FISRGSummer>208.62</FISRGSummer>
   <FISRGMin>481.17</FISRGMin>
   <FISRGSumMin>74269</FISRGSumMin>
   <FISRGSumNoCover>97537</FISRGSumNoCover>
   <WindowCalc DifferentFrames="0" CalculatedWindow="1">
    <GlassType Ug="0.6" g="0.52">4:-16-4-16-:4 argongázas</GlassType>
    <FrameType Index="0" Uf="1.4" Width="50">PVC 75 mm-es 4-5 kamrás</FrameType>
    <FrameType Index="1" Uf="0" Width="0"/>
    <FrameType Index="2" Uf="0" Width="0"/>
    <FrameType Index="3" Uf="0" Width="0"/>
    <DeviderType Pszi="0"/>
   </WindowCalc>
   <Options>0</Options>
   <HeatingPower>45</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Ajtó</Name>
   <Type>12</Type>
   <NumOf>1</NumOf>
   <x>0.9</x>
   <y>2.1</y>
   <A>1.89</A>
   <MinA>0</MinA>
   <U>1.3</U>
   <dUtb>0</dUtb>
   <Compass>315</Compass>
   <Gradient>90</Gradient>
   <Options>0</Options>
   <HeatingPower>91</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Belső fal_futetlen</Name>
   <Type>18</Type>
   <NumOf>1</NumOf>
   <x>1.85</x>
   <y>2.85</y>
   <A>5.2725</A>
   <MinA>0</MinA>
   <U>1.935</U>
   <dUtb>0</dUtb>
   <Mass>240</Mass>
   <HeatMass>120</HeatMass>
   <HeatCapacity>106</HeatCapacity>
   <DampFactor>6.62</DampFactor>
   <Delay>5.4</Delay>
   <Rsi>0.13</Rsi>
   <OverSideTemp Flags="2" OverTempWinter="20" OverTempSummer="26" BuWinter="1" BuSummer="1"/>
   <Options>0</Options>
   <HeatingPower>20</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
  <Boundary>
   <Name>Padló</Name>
   <Type>26</Type>
   <NumOf>1</NumOf>
   <x>13.5</x>
   <y>1</y>
   <A>21.87</A>
   <MinA>0</MinA>
   <U>0.1546</U>
   <dUtb>0</dUtb>
   <Mass>182</Mass>
   <HeatMass>179</HeatMass>
   <HeatCapacity>151</HeatCapacity>
   <DampFactor>60.46</DampFactor>
   <Delay>5.4</Delay>
   <Rsi>0.17</Rsi>
   <Fdt>9.99</Fdt>
   <FEarthLambda>2</FEarthLambda>
   <FPszi>-0.032</FPszi>
   <WallFloorPszi>0.1</WallFloorPszi>
   <Floorz>0</Floorz>
   <PlinthWallU>0</PlinthWallU>
   <Options>0</Options>
   <HeatingPower>175</HeatingPower>
   <CoolingPower Hour="0">0</CoolingPower><!-- ... Hour="1".."23" ugyanígy -->
  </Boundary>
 </WinWatt32Room>
 <WinWatt32Building>
  <ItemHeader>
   <ItemName>Ház</ItemName>
   <ItemPath/>
   <ID>11</ID>
  </ItemHeader>
  <ParentBuildingID>-1</ParentBuildingID>
  <WallMassMode>1</WallMassMode>
  <Pollution>0</Pollution>
  <UsingMode>0</UsingMode>
  <Compass>0</Compass>
  <InfiltrationFactor>0</InfiltrationFactor>
  <HeatingPower>4897</HeatingPower>
  <HeatingFiltrationPower>0</HeatingFiltrationPower>
  <SpecificMass>906</SpecificMass>
  <n50>10</n50>
  <Earthfg1>1.45</Earthfg1>
  <EarthGw>1</EarthGw>
  <Cooling>
   <SumValues TypeIndex="0">
    <Value Hour="0">0</Value><!-- ... Hour 1..23 -->
   </SumValues><!-- ... SumValues TypeIndex="1".."7" ugyanígy (24 Value/blokk) -->
  </Cooling>
  <CalculatedOutsideSurface>398.58</CalculatedOutsideSurface>
  <PlusOutsideSurface>0</PlusOutsideSurface>
  <TotalOutsideSurface>398.58</TotalOutsideSurface>
  <CalculatedVolume>422.91</CalculatedVolume>
  <PlusVolume>0</PlusVolume>
  <TotalVolume>422.91</TotalVolume>
  <EnergeticPower>81.118</EnergeticPower>
  <CalculatedSpecificLoss>0.169</CalculatedSpecificLoss>
  <SpecificLossLimit>0</SpecificLossLimit>
  <EPBD>
   <ISRG>247.26</ISRG>
   <ISRGSum>9.1597E5</ISRGSum>
   <ISRGSummer>139.25</ISRGSummer>
   <QSID>0</QSID>
   <QSIDSum>0</QSIDSum>
   <RadiationUtilizationFactor>0.75</RadiationUtilizationFactor>
   <BuildingType>0</BuildingType>
   <ETFlags>0</ETFlags>
   <HCalcMode>1</HCalcMode>
   <CalcMode>1</CalcMode>
   <BuildingSurface>0</BuildingSurface>
   <BuildingVolume>0</BuildingVolume>
   <BuildingAperV>0</BuildingAperV>
   <tAverage>21.952</tAverage>
   <dTWinter>6.8599</dTWinter>
   <dTSummer>1.7084</dTSummer>
   <dTSummerLimit>3</dTSummerLimit>
   <AirChangeFact>0.5</AirChangeFact>
   <AirChangeFactSummer>3</AirChangeFactSummer>
   <AirVolume>211.45</AirVolume>
   <AirVolumeInf>0</AirVolumeInf>
   <AirVolumeSummer>1268.7</AirVolumeSummer>
   <AirVolumeLT>0</AirVolumeLT>
   <CalcArea>151.59</CalcArea>
   <GivedArea>0</GivedArea>
   <HeatedArea>151.59</HeatedArea>
   <Qb>757.94</Qb>
   <QbEps>568.45</QbEps>
   <QHMV>4547.6</QHMV>
   <EVil>0</EVil>
   <ReduceFactor>0.9</ReduceFactor>
   <ReducedHMVArea>0</ReducedHMVArea>
   <MERMode>0</MERMode>
   <MER>0</MER>
   <Sus>0</Sus>
   <AAConditionsIsMet>0</AAConditionsIsMet>
   <AverageAirChangeFact>0.5</AverageAirChangeFact>
   <AverageAirChangeFactSummer>3</AverageAirChangeFactSummer>
   <AverageInsidePower>5</AverageInsidePower>
   <AverageWaterHeatingPower>30</AverageWaterHeatingPower>
   <AverageLightingPower>0</AverageLightingPower>
   <AverageReduceFactor>0.9</AverageReduceFactor>
   <FiltrationVolumeSum>211.45</FiltrationVolumeSum>
   <dtFiltrationVolumeSum>211.45</dtFiltrationVolumeSum>
   <AirHeatingEnergySum>0</AirHeatingEnergySum>
   <LTEnergySum>0</LTEnergySum>
   <CoolingNettoEnergy>149</CoolingNettoEnergy>
   <WaterHeatingPower>30</WaterHeatingPower>
   <LightingPower>0</LightingPower>
   <InsidePower>5</InsidePower>
   <TempGrad>84709</TempGrad>
   <HeatingHours>5073</HeatingHours>
   <HeatingEnergy>8207.4</HeatingEnergy>
   <AiringNettoEnergy>0</AiringNettoEnergy>
   <SpecificHeatingMass>864</SpecificHeatingMass>
   <SpecificHeatCapacity>738</SpecificHeatCapacity>
   <CalculatedPrimerEnergy>0</CalculatedPrimerEnergy>
   <PrimerEnergyLimit>187.1</PrimerEnergyLimit>
   <OptimalPrimerEnergyLimit>129.27</OptimalPrimerEnergyLimit>
   <NeerNullPrimerEnergyLimit>100</NeerNullPrimerEnergyLimit>
   <CategoryLetter>B</CategoryLetter>
   <Documentation>
    <Building/>
    <Flat/>
    <Customer/>
    <Planer/>
    <Date/>
    <DocID/>
    <dtSummerComment/>
    <Suggestions/>
    <OtherComment>Bemenő adatok: tulajdoni lap 2026.09.01, kivitelezői adatszolgáltatás (rétegrendek, gépészet), Antal Béla gépész tervei GF-01/02, GV-01 (2024.03.20), helyszíni fotók.</OtherComment>
    <ShortSuggestions/>
    <ShortComment/>
    <NewCategory/>
    <CalcModes>0</CalcModes>
   </Documentation>
   <EQAdmin>
    <Order>
     <Name>Györgyi József</Name>
     <CountryCode>HU</CountryCode>
     <ZipCode>2360</ZipCode>
     <City>Gyál</City>
     <Address>Táncsics Mihály utca 19.</Address>
     <Email/>
    </Order>
    <Auditor>
     <Name>Lukács Péter</Name>
     <ZipCode>8060</ZipCode>
     <City>Mór</City>
     <Address>Pince utca 19.</Address>
     <RegNr>TÉ 07-52263</RegNr>
    </Auditor>
    <Construction>
     <Name>Családi ház</Name>
     <ZipCode>2360</ZipCode>
     <City>Gyál</City>
     <CityPart/>
     <Street>Táncsics Mihály</Street>
     <StreetType>12</StreetType>
     <VATIStreetType>-1</VATIStreetType>
     <HousNr>19</HousNr>
     <Building/>
     <StairCase/>
     <Floor/>
     <Door/>
     <LotNr>2776</LotNr>
     <NettoArea>151.6</NettoArea>
    </Construction>
    <Date Year="2026" Month="9" Day="2"/>
    <Decree Authority="" RegNr="" Year="0" Month="0" Day="0"/>
    <Comment>Bemenő adatok: tulajdoni lap 2026.09.01, kivitelezői adatszolgáltatás (rétegrendek, gépészet), Antal Béla gépész tervei GF-01/02, GV-01 (2024.03.20), helyszíni fotók.</Comment>
    <SubjectOfCalculation/>
    <Technology>Hagyományos falazott (36 cm tégla + 20 cm grafitos EPS), fa fedélszék cserepeslemezzel, tetőtér-beépítés</Technology>
    <UsingMode/>
    <TypeOfRenewableEnergy>0</TypeOfRenewableEnergy>
    <OldHETNumber/>
    <ModifyOptions/>
    <ModifyComment/>
    <PurposeOfMaking/>
    <YearOfBuilding/>
    <YearOfModernization>2025</YearOfModernization>
    <NumberOfBuildingPermits/>
    <HeritageProtection>Nem védett</HeritageProtection>
    <ConnectedDocID/>
    <ConnectionType/>
    <NumOfHeatedFloors>2</NumOfHeatedFloors>
   </EQAdmin>
   <RefBuilding>
    <AirChangeFact>0</AirChangeFact>
    <WaterHeatingPower>30</WaterHeatingPower>
    <LightingPower>0</LightingPower>
    <LightingFactor>1</LightingFactor>
    <InsidePower>5</InsidePower>
    <ReduceFactor>0.9</ReduceFactor>
    <AirHeatingUsingRate>1</AirHeatingUsingRate>
    <HeatingArea>0</HeatingArea>
    <WaterHeatingArea>0</WaterHeatingArea>
    <HeatingEnergy>0</HeatingEnergy>
    <AiringNettoEnergy>0</AiringNettoEnergy>
    <HeatingPrimerEnergy>0</HeatingPrimerEnergy>
    <WaterHeatingPrimerEnergy>0</WaterHeatingPrimerEnergy>
    <AiringPrimerEnergy>0</AiringPrimerEnergy>
    <CoolingPrimerEnergy>0</CoolingPrimerEnergy>
    <LightingPrimerEnergy>0</LightingPrimerEnergy>
    <Flags>0</Flags>
   </RefBuilding>
   <NumOfHeatingSystems>1</NumOfHeatingSystems>
   <NumOfWaterHeatingSystems>1</NumOfWaterHeatingSystems>
   <NumOfAiringSystems>0</NumOfAiringSystems>
   <NumOfCoolingSystems>0</NumOfCoolingSystems>
   <NumOfLightingSystems>0</NumOfLightingSystems>
   <NumOfOtherSystems>0</NumOfOtherSystems>
   <WinWatt32HeatingSystemItem>
    <Name>Fűtési rendszer</Name>
    <Description>LG Therma V monoblokk levegő-víz hőszivattyú 9 kW, 300 l puffertároló a fűtött térben; földszint padlófűtés (15 cm osztás, fal mentén 10 cm) 35/28 °C, tetőtér lapradiátorok (33KV) + fürdő padlófűtés. Levegő-víz hőszivattyú ellátja a 480 m³/h légkezelő vizes fűtő-hűtő kaloriferét is.</Description>
    <SystemArea>151.59</SystemArea>
    <Area>151.59</Area>
    <TotalArea>0</TotalArea>
    <UsingFlag>1</UsingFlag>
    <SpecificPrimerEnergy>0</SpecificPrimerEnergy>
    <Sus>0</Sus>
    <WFinal>425.96</WFinal>
    <EnergyConsumptions Electric="425.96" GreenElectric="2874.5" AmbientHeat="6707.2">
     <SumValues E0="50.077" E1="50.778" E2="11.101"/>
     <ConsumptionTableItem ID="7" Consumption="425.96" CalorificBurningFactor="1" Flags="1"/>
     <ConsumptionTableItem ID="7" Consumption="2874.5" CalorificBurningFactor="1" Flags="0"/>
     <ConsumptionTableItem ID="14" Consumption="6707.2" CalorificBurningFactor="1" Flags="0"/>
    </EnergyConsumptions>
    <CO2Emission>1204.7</CO2Emission>
    <RefEnergyConsumptions Electric="234.96" Gas="6778.7">
     <SumValues E0="47.836" E1="0.465" E2="12.658"/>
     <ConsumptionTableItem ID="7" Consumption="234.96" CalorificBurningFactor="1" Flags="1"/>
     <ConsumptionTableItem ID="2" Consumption="6778.7" CalorificBurningFactor="0.9" Flags="0"/>
    </RefEnergyConsumptions>
    <BaseEnergyConsumptions Electric="234.96" Gas="6778.7">
     <SumValues E0="47.836" E1="0.465" E2="12.658"/>
     <ConsumptionTableItem ID="7" Consumption="234.96" CalorificBurningFactor="1" Flags="1"/>
     <ConsumptionTableItem ID="2" Consumption="6778.7" CalorificBurningFactor="0.9" Flags="0"/>
    </BaseEnergyConsumptions>
    <Mode>1</Mode>
    <UseZones>0</UseZones>
    <StokerItem>
     <Type>1</Type>
     <Share>1</Share>
     <EnergySourceType>9</EnergySourceType>
     <EnergySourceTypeDescription>H hőszivattyús elektromos áram</EnergySourceTypeDescription>
     <PrimerEnergyMultiplier>1.8</PrimerEnergyMultiplier>
     <SusFactor>0.1</SusFactor>
     <UserDefined>0</UserDefined>
     <CkType>12</CkType>
     <CkDescription>Elektromos üzemű hőszivattyú, levegő hőforrással, fűtővíz hőmérséklet 35/28</CkDescription>
     <Ck>0.3</Ck>
     <qkv>0</qkv>
     <QFinal>9581.7</QFinal>
     <Flags>0</Flags>
     <CogenerativEfficiency>0</CogenerativEfficiency>
    </StokerItem>
    <UserFlags>0</UserFlags>
    <SpecificHeatingEnergy>54.143</SpecificHeatingEnergy>
    <qfhType>-1</qfhType>
    <qfhDescription/>
    <qfh>0</qfh>
    <qfvType>7</qfvType>
    <qfvDescription>Elosztó vezetékek a fűtött téren belül;vízhőmérséklet 35/28</qfvDescription>
    <qfv>0.6</qfv>
    <qftType>1</qftType>
    <qftDescription>Elhelyezés a fűtött térben;vízhőmérséklet 35/28</qftDescription>
    <qft>0.074</qft>
    <Eft>0.427</Eft>
    <EfszType>3</EfszType>
    <EfszDescription>Fordulatszám szabályozású szivattyú;hőlépcső 7 K</EfszDescription>
    <Efsz>2.383</Efsz>
    <Efsz2Type>4</Efsz2Type>
    <Efsz2Description>Nincs</Efsz2Description>
    <Efsz2>0</Efsz2>
    <SystemType>1</SystemType>
    <RegPart Index="0" Type="0" Value="1.149"/>
    <RegPart Index="1" Type="0" Value="0.021"/>
    <RegPart Index="2" Type="2" Value="0.003"/>
    <RegPart Index="3" Type="1" Value="-0.03"/>
    <RegPart Index="4" Type="2" Value="0.012"/>
    <RegDescription/>
    <RegValue>1.155</RegValue>
   </WinWatt32HeatingSystemItem>
   <WinWatt32WaterHeatingSystemItem>
    <Name>Melegvíz-termelő rendszer</Name>
    <Description>Hőszivattyús HMV bojler 270 l a spájzban (beltéri levegő hőforrás), cirkuláció nélkül (GV-01 szerint cirkulációs vezeték tervezett volt – ELLENŐRIZENDŐ).</Description>
    <SystemArea>151.59</SystemArea>
    <Area>151.59</Area>
    <TotalArea>0</TotalArea>
    <UsingFlag>1</UsingFlag>
    <SpecificPrimerEnergy>0</SpecificPrimerEnergy>
    <Sus>0</Sus>
    <WFinal>0</WFinal>
    <EnergyConsumptions GreenElectric="1499.5" AmbientHeat="3044.4">
     <SumValues E0="22.751" E1="23.051" E2="5.043"/>
     <ConsumptionTableItem ID="7" Consumption="1499.5" CalorificBurningFactor="1" Flags="0"/>
     <ConsumptionTableItem ID="14" Consumption="3044.4" CalorificBurningFactor="1" Flags="0"/>
    </EnergyConsumptions>
    <CO2Emission>547.3</CO2Emission>
    <RefEnergyConsumptions Electric="145.98" Gas="6049.1">
     <SumValues E0="41.721" E1="0.2889" E2="11.105"/>
     <ConsumptionTableItem ID="7" Consumption="145.98" CalorificBurningFactor="1" Flags="1"/>
     <ConsumptionTableItem ID="2" Consumption="6049.1" CalorificBurningFactor="0.9" Flags="0"/>
    </RefEnergyConsumptions>
    <BaseEnergyConsumptions Electric="145.98" Gas="6049.1">
     <SumValues E0="41.721" E1="0.2889" E2="11.105"/>
     <ConsumptionTableItem ID="7" Consumption="145.98" CalorificBurningFactor="1" Flags="1"/>
     <ConsumptionTableItem ID="2" Consumption="6049.1" CalorificBurningFactor="0.9" Flags="0"/>
    </BaseEnergyConsumptions>
    <Mode>1</Mode>
    <UseZones>0</UseZones>
    <qHMV>25</qHMV>
    <StokerItem>
     <Type>2</Type>
     <Share>1</Share>
     <EnergySourceType>9</EnergySourceType>
     <EnergySourceTypeDescription>H hőszivattyús elektromos áram</EnergySourceTypeDescription>
     <PrimerEnergyMultiplier>1.8</PrimerEnergyMultiplier>
     <SusFactor>0.1</SusFactor>
     <UserDefined>0</UserDefined>
     <CkType>13</CkType>
     <CkDescription>Elektromos üzemű hőszivattyú, pince levegő hőforrással</CkDescription>
     <Ck>0.33</Ck>
     <qkv>0</qkv>
     <QFinal>4543.8</QFinal>
     <Flags>0</Flags>
     <CogenerativEfficiency>0</CogenerativEfficiency>
    </StokerItem>
    <UserFlags>0</UserFlags>
    <qfvType>3</qfvType>
    <qfvDescription>Elosztó vezetékek a fűtött téren belül;cirkuláció nélkül</qfvDescription>
    <qfv>10</qfv>
    <Ec>0</Ec>
    <qftType>2</qftType>
    <qftDescription>Elhelyezés a fűtött térben;nappali árammal működő elektromos boyler</qftDescription>
    <qft>9.9</qft>
    <EcType>3</EcType>
    <EcDescription>nincs segédenergia igény</EcDescription>
    <BuildingCategory>0</BuildingCategory>
   </WinWatt32WaterHeatingSystemItem>
   <HeatingPrimerEnergy>0</HeatingPrimerEnergy>
   <WaterHeatingPrimerEnergy>0</WaterHeatingPrimerEnergy>
   <AiringPrimerEnergy>0</AiringPrimerEnergy>
   <CoolingPrimerEnergy>0</CoolingPrimerEnergy>
   <LightingPrimerEnergy>0</LightingPrimerEnergy>
   <SolarPrimerEnergy>0</SolarPrimerEnergy>
   <EnergyConsumptions Electric="425.96" GreenElectric="4374" AmbientHeat="9751.5">
    <SumValues E0="0" E1="0" E2="0"/>
    <ConsumptionTableItem ID="7" Consumption="425.96" CalorificBurningFactor="1" Flags="1"/>
    <ConsumptionTableItem ID="7" Consumption="4374" CalorificBurningFactor="1" Flags="0"/>
    <ConsumptionTableItem ID="14" Consumption="9751.5" CalorificBurningFactor="1" Flags="0"/>
   </EnergyConsumptions>
   <CO2Emission>1752</CO2Emission>
   <RefBuilding2023 WallType="2" CeilType="2" CoolingSEERType="0" nFiltType="0"/>
   <PanelRenovationItem Name="Külső fal" Type="0" k="0.168" kmin="0" kmax="0.16" Flags="0" g1="0" ShadowFactor1="0" g2="0" ShadowFactor2="0" Symbol="0" Comment=""/>
   <RenoPassport SequenceOfModernisationMeasures="" OtherBenefitsOfModernisation="" AvoidingRisks=""/>
  </EPBD>
  <ZoneUsingType Type="Lakóépület egésze" Flags="5" DailyUseTime="24" IntervallBegin="7" DayInYear="365" HeatingTemp="20" CoolingTemp="26" AirChangeFactor="0.5" AirRequest="0" Illumination="0" InternalHeatGain="5" Options="0" UseZones="0"/>
  <ThermicZone Type="0" Name="" HeatMassType="0" Infiltration="0" InfiltrationReno1="0" InfiltrationReno2="0" SummerFiltration="0" Options="0" UseZones="0"/>
  <ThermicZone Type="1" Name="" HeatMassType="0" Infiltration="0" InfiltrationReno1="0" InfiltrationReno2="0" SummerFiltration="0" Options="0" UseZones="0"/>
  <ThermicZone Type="2" Name="csh" HeatMassType="0" Infiltration="0.06" InfiltrationReno1="0.06" InfiltrationReno2="0.06" SummerFiltration="6" Options="0" UseZones="0"/>
  <ETZone Name="csh" Flags="2" Symbol="0" UseZones="0">
   <ETZoneDoc NettoArea="0" Volume="0" AperV="0" NumOfHeatedFloors="1" PurposeOfMaking="-1" SubjectOfCalculation="0" UsingMode="-1" HeritageProtection="-1" Flags="0" OldHETNumber="0" ModifyOptions="" ModifyComment="" YearOfBuilding="" YearOfModernization="2025" TypeOfAlternativeEnergy="0" AlternativeEnergyComment="" Comment="">
    <Construction OrderName="Györgyi József" ZipCode="2360" City="Gyál" Street="Táncsics Mihály" StreetType="12" HousNr="19" Building="" StairCase="" Floor="" Door="" LotNr="2776"/>
    <Auditor Name="Lukács Péter" ZipCode="8060" City="Mór" Street="Pince" StreetType="12" HousNr="19" Building="" StairCase="" Floor="" Door="" Phone="+36209966462" Email="info@bimline.hu" RegNr="TÉ 07-52263"/>
    <SiteInspectionDate Year="0" Month="0" Day="0"/>
    <Date Year="2026" Month="9" Day="2"/>
   </ETZoneDoc>
   <AlterSystems Flags="0" Evaluations="" Title=""/>
   <RenoPassport SequenceOfModernisationMeasures="" OtherBenefitsOfModernisation="" AvoidingRisks=""/>
  </ETZone>
 </WinWatt32Building>
 <WinWatt32ProjektOptions UUIDString="d12d1611-7898-41b8-874c-28b2a8e503d0">
  <Panel OutSideTemp="-2" InSideTemp="20" OutSideRelHum="90" InSideRelHum="50" DiffusionDays="180" FloorLevel="0.3"/>
  <Building Compass="45" Pollution="0" WallMassMode="1" UsingMode="0" Height="2.85" CeilingHeight="0" EPBDCalculationNorm="8" EPBDCalculationLimit="2" EPBDCalculationLimit2023="1" IDiffFactor="1" SunInSus="0" CoolingInSus="0" EPBDSimpleCalcFlags="0"/>
  <Heating OutSideTemp="-15" InSideTemp="20" TransFactor="1" SunShineFlag="0" FiltMode="2" Portion="30" AirChangeFact="0.8" Calculate="1" ByEN12831="0" OutSideAverageTemp="10" Byn50="1" n50="10" n50eFactor="0" n50Epsilon="1" Earthfg1="1.45" EarthGw="1" PlusInfiltration="0" PlusAirChangeFact="0.3"/>
  <Cooling InSideTemp="26" Calculate="1"/>
  <Meteorology UserDefined="0" Name=""/>
  <EnergeticMet UserDefined="0" Name="" Latitude="0"/>
  <EnergySources>
   <EnergySourceItem Type="Electric" CO2Factor="365" esus="0.1" Price="0"/>
   <EnergySourceItem Type="ReducedElectric" CO2Factor="365" esus="0.1" Price="0"/>
   <EnergySourceItem Type="Gas" CO2Factor="202" esus="0" HeatingFactor="36000" Price="0"/>
   <EnergySourceItem Type="Oil" CO2Factor="279" esus="0" HeatingFactor="42700" Price="0"/>
   <EnergySourceItem Type="Coal" CO2Factor="377" esus="0" HeatingFactor="33200" Price="0"/>
   <EnergySourceItem Type="DistrictHeating" CO2Factor="273" esus="0" Price="0"/>
   <EnergySourceItem Type="ReducedDistrictHeating" CO2Factor="273" esus="0" Price="0"/>
   <EnergySourceItem Type="Firewood" CO2Factor="0" esus="1" HeatingFactor="13300" Price="0"/>
   <EnergySourceItem Type="Regenerative" CO2Factor="0" esus="1" Price="0"/>
   <EnergySourceItem Type="GreenElectric" CO2Factor="365" esus="0.1" Price="0"/>
   <EnergySourceItem Type="PBGas" CO2Factor="227" esus="0" HeatingFactor="96000" Price="0"/>
   <EnergySourceItem Type="Pellet" CO2Factor="0" esus="1" HeatingFactor="19000" Price="0"/>
   <EnergySourceItem Type="DH1" CO2Factor="273" esus="0" Price="0"/><!-- ... DH2..DH14 ugyanígy -->
   <EnergySourceItem Type="DHUserDefined" CO2Factor="273" esus="0" Price="0"/>
   <EnergySourceItem Type="DHKEGas" CO2Factor="273" esus="0" Price="0"/>
   <EnergySourceItem Type="DHKEBio" CO2Factor="273" esus="0" Price="0"/>
   <EnergySourceItem Type="DistrictCooling" CO2Factor="40" esus="0" Price="0"/>
   <EnergySourceItem Type="BioSolid" CO2Factor="40" esus="1" HeatingFactor="13300" Price="0"/>
   <EnergySourceItem Type="BioSolid2" CO2Factor="70" esus="1" HeatingFactor="24500" Price="0"/>
   <EnergySourceItem Type="BioLiquid" CO2Factor="83" esus="1" HeatingFactor="22000" Price="0"/>
   <EnergySourceItem Type="BioGas" CO2Factor="0" esus="1" HeatingFactor="1" Price="0"/>
   <EnergySourceItem Type="Wasteheat" CO2Factor="74" esus="1" Price="0"/>
   <EnergySourceItem Type="SolarElectric" CO2Factor="25" esus="1" Price="0"/>
   <EnergySourceItem Type="SolarTherm" CO2Factor="12" esus="1" Price="0"/>
   <EnergySourceItem Type="Wind" CO2Factor="27" esus="1" Price="0"/>
   <EnergySourceItem Type="AmbientHeat" CO2Factor="0" esus="1" Price="0"/>
   <EnergySourceItem Type="FussionEnergy" CO2Factor="0" esus="0" Price="0"/>
   <EnergySourceItem Type="RecuperedEnergy" CO2Factor="0" esus="0" Price="0"/>
  </EnergySources>
  <Radiator Nearest="1" CorrectionFactor="1" TubeLength="0" PowerRequestPlus="30" ForwardTemperature="90" BackwardTemperature="70" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="0" ValveMode1="0" DefaultMakro="" AvailablePressure="10000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="$U$He" ConnectionName1="$U$Hv"/>
  <FloorHeating OversideTemperature="-15" Oversidek="0.5" BundLength="300" CoolingForwardTemperature="15" CoolingBackwardTemperature="18" CoolingOversideTemperature="32" TubeLengthPlus="0" TubeLengthPlusMode="1" RegisterVolume="20" ForwardTemperature="45" BackwardTemperature="40" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="9" ValveMode1="9" DefaultMakro="" AvailablePressure="20000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="" ConnectionName1=""/>
  <OneTubeRound Nearest="1" CorrectionFactor="1" RadiatorName="" RadiatorFamily="" ForwardTemperature="90" BackwardTemperature="70" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="0" ValveMode1="0" DefaultMakro="" AvailablePressure="20000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="" ConnectionName1=""/>
  <Consumer CoolingForwardTemperature="6" CoolingBackwardTemperature="12" ForwardTemperature="90" BackwardTemperature="70" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="0" ValveMode1="0" DefaultMakro="" AvailablePressure="20000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="" ConnectionName1=""/>
  <HeatChanger CoolingForwardTemperature="6" CoolingBackwardTemperature="12" ForwardTemperature="90" BackwardTemperature="70" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="9" ValveMode1="9" DefaultMakro="" AvailablePressure="20000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="" ConnectionName1=""/>
  <FanCoil HeatingForwardTemp="50" HeatingdtMin="5" HeatingdtMax="20" HeatingdpMax="50" CoolingForwardTemp="5" CoolingdtMin="3" CoolingdtMax="10" CoolingdpMax="50" tnGived="0" CoolingWeetTemp="15" CoolingRelHum="0.7" ForwardTemperature="0" BackwardTemperature="0" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="0" ValveMode1="0" DefaultMakro="" AvailablePressure="20000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="" ConnectionName1=""/>
  <NormalSection ForwardTemperature="90" BackwardTemperature="70" MediumType="normál víz" Ro="971.9" Nu="3.673E-7" SpecificHeat="4173" TubeType="" IsolationType="" ValveType0="" ValveType1="" ValveMode0="0" ValveMode1="0" DefaultMakro="" AvailablePressure="20000" SpeedMax="0.5" PressureProMeterMax="100" TubeSizeMinimum="0" ConnectionName0="" ConnectionName1=""/>
  <Point>
   <PointFlags>0</PointFlags>
   <PointZeta ZetaIndex="0" ZetaValue="0.2"/>
  </Point>
 </WinWatt32ProjektOptions>
</WinWatt32Project>
```

## 6. WinWatt GUI-feltérképezés – kódtáblák, rendszerek, import-viselkedés (ELLENŐRIZVE, 2026-10-29)

Forrás: Péter gépén a WinWatt fecske (program: WinWatt 9.58, 2026.06.08; projektformátum „WinWatt 8.1”) végigkattintva, a `winwatt-teszt` mappában 8 export/import körrel. A kódtáblák a telepítési mappa `languages\Hungarian.xml` string-tábláiból (`IDS_xxx+n` → az XML-ben az `n` index) származnak, és az exportokkal visszaellenőriztem őket. Ha új verzió jön, ezt a fájlt kell újra kiolvasni (`<item id="IDS_CK+12" value="…">`).

### 6.1 Szerkezettípusok – teljes kódtábla (panel `Type=` attribútum ↔ Boundary `<Type>` ↔ `<Type>` szöveg)
0 `OutsideWall` külső fal · 1 `InsideWall` belső fal (fűtött terek közt) · 2 `Floor` padló (talajra fektetett) · 3 `Roof1` tető · 4 `Roof2` padlásfödém · **5 `Roof3` pincefödém, alsó zárófödém** · 6 `Roof4` árkád feletti födém · 7 `Roof5` belső födém (felfelé hűlő) · **8 `Roof6` belső födém (lefelé hűlő)** · 9 `WallInEarth` talajjal érintkező fal · 10 `OutsideWindow` ablak (külső, fa vagy PVC) · 11 `InsideWindow` ablak (belső) · 12 `OutsideDoor` ajtó (külső) · 13 `InsideDoor` ajtó (belső, fűtött terek közt) · 14 `OutsideWindDoor` üvegezett ajtó (külső, fa vagy PVC) · 15 `WindowedRoof` felülvilágító · 16 `OutsideBridge` hőhíd (külső) · 17 `InsideBridge` hőhíd (belső) · 18 `InsideWall1` belső fal (fűtetlen tér felé) · 19 `InsideWall2` belső fal (fűtött épületek közt) · 20 `OutsideWindow1` ablak (külső, fém) · 21 `InsideDoor1` ajtó (belső, fűtetlen tér felé) · 22 `OutsideWindDoor1` üvegezett ajtó (külső, fém) · 23 `OutsideGate` kapu (külső, üvegezetlen) · 24 `OutsideWindow2` ablak (külső, tetősíkban) · 25 `WallInEarthISO` talajjal érintkező fal (ISO 13370) · 26 `FloorISO` padló (talajra fektetett ISO 13370) · 27 `OutsideWindowWall` homlokzati üvegfal · 28 `Glass` üvegezés · 29 `SpecialGlass` különleges üvegezés · 30 `GlassRoof` üvegtető · 31 `IndustrialGate` ipari és tűzgátló ajtó és kapu · 32 `TrombeWall` tömegfal · 33 lábazati fal · `Undefined` = ismeretlen (60).
A kipróbált típusok (Roof2, Roof3, Roof6, InsideDoor1, InsideWall2, OutsideGate, OutsideWindow2) mind hibátlanul betöltődtek. Új panelhez a legközelebbi rokon panel klónja + `Type` attribútum + `<Type>` szöveg csere elég. GUI-alapértékek: pincefödém Rse = Rsi = 0,17, külső −2 / belső 20 °C, „Megengedett érték” 0,26; padlásfödém Rse = Rsi = 0,1, 0,17-es követelmény.

### 6.2 Fűtetlen tér felé néző határolók (pince, padlás, garázs, fűtetlen helyiség) – `OverSideTemp`
- A `Flags` mező bitjei: a 0–1. bit az adatmegadási mód (0 = túloldali hőmérséklet minden számításnál, 1 = Bu minden számításnál, **2 = energetikánál Bu, máshol túloldali hőmérséklet**), **+4 = „a túloldalon gyengén kapcsolt kondicionálatlan tér” télen, +8 = ugyanez nyáron**. Helyes beállítás fűtetlen tér felé: **`Flags="14"`**, `OverTempWinter` = a fűtetlen tér hőmérséklete (pl. pince 8 °C, a hőszükséglethez), `BuWinter` = b-tényező az ÉKM-táblából.
- **Csak a 4/8-as bittel kerül be a határoló a „fűtött teret határoló szerkezetek” közé** (épület → Fűtött teret határoló szerkezetek fül; U* = U·Bu). `Flags="2"` mellett a szerkezet **kimarad az energetikai burokból** (A/V, fajlagos hőveszteség, OÉNY-szerkezetlista). ⚠ Ez a régi váz `Belső fal_futetlen` (Type 18, Flags 2, Bu 1) határolójára is igaz: úgy nem számított. A GUI-ban a Bu csak bekapcsolt jelölőnégyzetekkel marad meg, enélkül OK után visszaugrik 1-re.
- ÉKM b-tényezők (Bu tél / nyár, a WinWatt „…” táblájából): padlástérrel határos födém/fal 0,9/0 · zárt, fűtetlen pincével határos 0,5/1,5 · zárt, fűtetlen mélygarázzsal 0,8/0,8 · zárt, fűtetlen garázzsal 0,9/0,9 · fűtetlen/hűtés nélküli helyiséggel 0,5/0,5 · fűtetlen, külső homlokzatú lépcsőházzal határos fal 0,7/0,7 · naptérrel határos fal 0,8 / 0,7 / 0,5 (egyrétegű / kétrétegű / hőszigetelő üvegezés).
- **⚠ XML-IMPORTKOR A WINWATT MINDEN HATÁROLÓ `OverSideTemp`-JÉT VISSZAÁLLÍTJA** `Flags=2 / 20 °C / Bu 1`-re. Ez a típustól és a panel `ExtendedInside`/`OverSideTemp` beállításától független: a panel szintjén megmarad, a határolón nem (2026-10-29, két körrel ellenőrizve). Ezért a generált XML-ben hiába írjuk helyesen. **Betöltés után kötelező lépés:** *Eszközök → Szerkezetek cseréje…* → a keresésben az adott szerkezet neve és típusa (U-mező üresen!), az „új adatok” résznél a U-mező is üresen. A „Túloldali hőmérséklet” fülön: „Télre bekapcsolni” + „Nyárra bekapcsolni”, a túloldali hőmérséklet és a Bu megadása → OK → a találati listában OK. Ezt szerkezetenként egyszer kell elvégezni, és az összes helyiségre egyszerre érvényes. Ellenőrzés: az épület „Fűtött teret határoló szerkezetek” fülén a szerkezet U*-gal szerepel. A naplóba a generátor írja ki szerkezetenként a beállítandó értéket (név, típus, t_túl, Bu).
- Ugyanez az ellenőrző-listán: a pincefödémnél „a szerkezetre vélhetőleg kellene az egyszerűsített számítás szerinti hőhíd növekményt alkalmazni” (`dUtb`, Hőhíd korrekció „…”).

### 6.3 Amit az XML-import visszaállít vagy töröl (export→import→export diff, 2026-10-29)
Az ID-k újraszámozódnak, és minden határoló `OverSideTemp`-je alapértékre áll (lásd 6.2). A `PanelRenovationItem` és a `PhotoAlbumItem` (`FileName=""`, `Category="6"`) üres sablonná válik, az `ETZone/ETZoneDoc` teljesen kiürül (Construction, Auditor, NettoArea, PurposeOfMaking, UsingMode, HeritageProtection, YearOfBuilding, SiteInspectionDate). Az épület szintű `EPBD/EnergyConsumptions` is kiürül (számított). **Megmarad**: minden panel a rétegekkel, a helyiségek és a határolók (U, méret, tájolás), valamint az összes gépészeti rendszer (fűtés, HMV, légtechnika, hűtés, világítás, napelem/nyereségáram) minden mezőjével. A gépészetet tehát XML-ből lehet hozni, a tanúsítási adminisztrációt és a fotókat viszont nem.

### 6.4 Gépészeti rendszerek – a GUI és az XML megfeleltetése
Az épület párbeszédablak → „Épülettechnikai rendszerek” fül. Az ikonsor balról: fűtés, HMV, világítás, légtechnika (ventilátor), hűtés, „+” = nyereségáram-forrás (napelem / szélkerék / más nyereségáram / veszteség), törlés. Oszlopok: „Eredeti rendszerek”, „Felújítás jó szint”, „Felújítás kiváló szint”. Rendszerenként „Export fájlba / Import fájlból” gomb is van. Minden rendszernek van „Terület megadása” füle (teljes épület / egyesítő nevek / helyiségek alapján → `UseZones` 0/1/2; `SystemArea` 0 = a teljes fűtött terület).
**⚠ Több azonos fajtájú rendszer esetén a területeket meg kell osztani.** Két, egyaránt a teljes területre vett fűtési rendszer = „Hibás terület érték az épülettechnikai rendszerre” (43,74/21,87). Ugyanazon rendszeren belüli több hőtermelőt a `Share` (energiaarány) osztja; ezek összege 1 legyen („A hőtermelők által lefedett energiaarányok összegének 1-et kell kiadnia!”).

**Közös hőtermelő-blokk** (`StokerItem` a fűtésnél, HMV-nél és légtechnikánál, `CoolerItem` a légtechnika hűtőgépénél, hűtési rendszerben `StokerItem Type 5`): `Type` (1 fűtés, 2 HMV, 3 légtechnika, 5 hűtés), `Share`, `EnergySourceType` + `EnergySourceTypeDescription`, `PrimerEnergyMultiplier`, `SusFactor`, `UserDefined` (1 = „felhasználó által megadva”), `CkType` + `CkDescription`, `Ck`, `qkv` (segédenergia), `QFinal`, `Flags`, `CogenerativEfficiency`. Látott energiahordozók: 0 elektromos áram (e = 2,5; sus 0,1) · 2 földgáz (1; 0) · 9 H hőszivattyús elektromos áram (1,8; 0,1). A teljes `IDS_ENERGYSOURCETYPES` lista: 0 elektromos áram, 1 csúcson kívüli áram, 2 földgáz, 3 tüzelőolaj, 4 szén, 5 fűtőművi távfűtés, 6 távfűtés kapcsolt, 7 tűzifa/biomassza, 8 megújuló, 9 H hőszivattyús áram, 10 PB-gáz, 11 pellet, 12–28 távfűtés-változatok, 29 távhűtés, 30 bio szilárd, 31 bio szilárd (*), 32 bio folyékony, 33 biogáz, 34 hulladékhő, 35 napenergia PV, 36 napenergia termikus, 37 szél, 38 környezeti hő, 40 talajkollektor/hővisszanyerő. A `ConsumptionTableItem ID` az `IDS_ENERGYCARRIER` index (2 fosszilis gáz, 7 hálózati villamos, 11 PV, 14 környezeti hő, 15 aktív megújuló).

**Fűtés – `CkType` (IDS_BOYLERTYPES):** 0 távfűtés · fűtött téren kívüli olaj-/gázkazán: 1 állandó hőm., 2 alacsony hőm., 3 kondenzációs · fűtött téren belüli: 4 állandó, 5 alacsony, 6 kondenzációs · elektromos HP: 7 víz 55/45, 8 víz 35/28, 9 talaj 55/45, 10 talaj 35/28, **11 levegő 55/45, 12 levegő 35/28**, 13 távozó levegő 55/45, 14 távozó levegő 35/28 · 15 szilárdtüzelésű kazán, 16 fatüzelésű, 17 pellet · 18 elektromos hősugárzó/fűtőfilm, 19 hőtárolós kályha, 20 gázkonvektor szabályozó nélkül, 21 kandalló (zárt), 22 kályha, 23 cserépkályha, 24–26 gázkonvektor kombinált szabályozással (hagyományos / ≥89 % / ≥93 %) · 27 faelgázosító · 28 földgázüzemű HP levegő 45/40 · 29 elektromos HP levegő→levegő · 30 elektromos kazán · 31 kandalló (nyitott). Mért értékek: kondenzációs kazán fűtött térben Ck 1,01, qkv 0,79; levegő-víz HP 55/45 Ck 0,37; 35/28 Ck 0,30.
- `qfvType` (elosztás): 0–3 fűtött téren **kívül** 90/70, 70/55, 55/45, 35/28 · 4–7 fűtött téren **belül** ugyanígy · 8 nincs. `qftType` (hőtárolás): 0 fűtött térben 55/45, 1 fűtött térben 35/28, 2 kívül 55/45, 3 kívül 35/28, 4 nincs. `EfszType` (keringtető szivattyú): 0–3 fordulatszám-szabályozott 20/15/10/7 K, 4–7 állandó fordulatú 20/15/10/7 K, 8 nincs, **9 EC-motoros EEI = 0,23, 10 EEI = 0,17**. `Efsz2Type` (levegő keringtetés): 0 fan-coil padlón/oldalfalon, 1 álmennyezetben, 2 légcsatornában, 3 négyirányú, 4 nincs.
- `SystemType`: 0 szabad fűtőfelület (radiátor), 1 beágyazott (padló/fal/mennyezet), 2 villamos, 3 közvetlen helyiséglevegő-fűtés. **`RegPart Index i Type t`**: i = a „Szabályozás” al-fül (0 hőtermelő-szabályozás, 1 hőmérséklet-hatás / rendszer, 2 határolószerkezet-hatás, 3 helyiségszabályozás, 4 hidraulikai beszabályozás), t = a sor indexe az `IDS_QFSZAB_<SystemType>_<i>` táblában. Radiátoros (0): 0 → 0 nincs / 1 P / 2 PI / 3 optimalizáló; 1 → 0–3 kétcsöves 90/70…45/35, 4–5 egycsöves, 6 ventilátoros radiátor; 2 → 0 belsőfali, 1 külsőfali, 2–3 üvegfelület előtt hőtükör nélkül/vele; 3 → 0 nincs, 1 kéziszelep, 2 termosztatikus szelep, 3 hálózatba integrált; 4 → 0–4 egycsöves, 5 kétcsöves beszabályozás nélkül, 6–11 statikus (≤10 / >10 hőleadó; csoportos nincs / statikus / dinamikus), 12 dinamikus. Beágyazott (1): 0 → 0 nincs, 1 ismeretlen, 2 kétpontos/P/PI/PID, 3 központi + helyiségenkénti, 4 optimalizáló; 1 → 0 nedves padlófűtés, 1 száraz, 2 réteggel fedett, 3 falfűtés, 4 mennyezetfűtés; 2 → 0–2 MSZ EN 1264-2 hőszigetelés nélkül / minimális / +100 %; 3 → 1 külön körök, 2 termosztatikus zónaszelep, 3 hálózatba integrált; 4 → 1–6 statikus, 7 dinamikus. `RegValue` = számított (radiátor PI + 55/45 + külsőfali + termosztát + dinamikus = 1,006).

**HMV – `CkType` (IDS_WATERBOYLERTYPES):** 0 távfűtés · 1–3 állandó / alacsony hőm. / kondenzációs kazán · 4–7 kombi kazán átfolyós / kis tárolós, ill. ugyanez kondenzációs · 8 elektromos fűtőpatron · 9 elektromos átfolyós/tároló · HP: 10 távozó levegő, 11 hővisszanyerős 60 %, 12 hővisszanyerős 80 %, **13 pincelevegő (beltéri levegős HMV-bojler)** · 14 gázüzemű bojler (Ck 1,22) · 15 átfolyós gáz-vízmelegítő · 16 szilárdtüzelésű fürdőhenger · 17–20 szilárd / fa / pellet / faelgázosító kazán · 21 HP víz, 22 HP talaj, **23 HP levegő**. `qfvType`: 0 kívül cirkulációval, 1 kívül cirkuláció nélkül, 2 belül cirkulációval, 3 belül cirkuláció nélkül, 4 nincs. `qftType`: 0–3 fűtött térben indirekt tároló / csúcson kívüli villanybojler / nappali villanybojler / gázbojler, 4–7 ugyanez fűtött téren kívül, 8 nincs. `EcType`: 0 cirkulációval EEI nem ismert, 1 EEI 0,23, 2 EEI 0,17, 3 nincs segédenergia. **A HMV `qfv` és `qft` %-ban értendő** (a nettó HMV-hőigény százaléka; pl. belül cirkulációval 24 %, gázbojler fűtött térben 78 %). `BuildingCategory` (Fogyasztás fül): 0 családi ház, 1 egyéb lakóépület, 2 egyéb épület. Ez utóbbinál `HMVUsingItem Type="Irodaház" DailyValue="0.4" Unit="0" Quantity="10"` sorok (IDS_HMVUSETYPE: irodaház, kórház, iskola, kereskedelmi, ipari, hotel, étterem, …). Napkollektor: `SimpleHMVCollector Type Surface Compass Gradient …` – az egyszerűsített módszer csak 40–300 m² rendszer-alapterületnél használható (különben ismétlődő hibaüzenet, amely az OK-t is blokkolja), és csak lakóépületre.

**Légtechnika (`WinWatt32AiringSystemItem`)** – a GUI-ban beállított, majd exportált teljes sorrend: `Name, Description, SystemArea, Area, TotalArea, UsingFlag, SpecificPrimerEnergy, Sus, WFinal, EnergyConsumptions, CO2Emission, Ref…, Base…, Mode, UseZones, StokerItem(Type 3, a kalorifer hőtermelője), CoolerItem(Type 5, hűtőgép), AirCanalItem×n(Type 0 kör / négyszög, d, A, B, Thickness, HeatingCond, Length, Speed, AirTemp, OutsideTemp, …, Heated, U, HeatLoss…), Volume, AirChangeFactLT, AirChangeFactInf, AirVolumeLTBase, AirVolumeLTBaseGived, RecuperationFlags, RecuperUsingRate, RecuperEfficiency, HeatedAirTemp, CooledAirTemp, AirHeatingUsingRate, Z, UserFlags, fszType, fszDescription, fsz, dpVent, VentEfficiency, VentWorkingMode, VentWorkingTimeValue, VentEnergy, OtherEnergy, AirCanalHeatingLosses, AirCanalCoolingLosses, WorkingSeasons, RecircledAirVolume`. `RecuperationFlags`: 1 = hővisszanyerő, +2 = fűtés (kalorifer), +32 = hűtés (a GUI-ban mindhárom bekapcsolva = 35). „Csak légtechnikával fűtünk/hűtünk” = további bitek. `WorkingSeasons`: 1 fűtési, +2 hűtési, +4 átmeneti időszak. `fszType` (IDS_AIRINGFSZ): 0–2 20 °C feletti befúvás (szabályozás nélkül / központi / helyiségenkénti), 3 20 °C alatti befúvás. Az alkalmazott előfűtés lehet nincs / fagyvédelmi / talajkollektor. A ventilátor-teljesítmény = dpVent · légmennyiség / VentEfficiency (150 Pa, 31 m³/h, 50 % → 2,6 W).

**Hűtés (`WinWatt32CoolingSystemItem`)**: `StokerItem Type 5`, `CkType` (IDS_COOLERTYPES): 0 split SEER 2,5 (Ck 0,4) · 1 léghűtéses folyadékhűtő SEER 3,0 (Ck 0,33) · 2–4 vízhűtéses scroll / csavar / turbó SEER 4,3 / 5,0 / 7,0 · 5 talaj-víz HP SEER 5,0 · 6–7 gázmotoros HP. `eszabType` (IDS_COOLINGESZAB): 0–4 hűtött víz 6/12, 8/14, 14/18, 16/18, 18/20 · 5–6 levegős passzív/aktív · 7 direkt elpárologtatás (1,13). `cHType` (látens hőigény, IDS_COOLINGCH): 0 16/18 (klímagerenda), 1 6/12 (fan-coil, 1,25), 2 közvetlen elpárologtatás 5 °C (1,45). `fszType` −1, `eszall` 1, `dpVent`, `VentEfficiency`, `SpecificLTVolume`. Ha a hűtési nettó energia 0 (lakóépület, nyári hőterhelés nincs számítva), a WFinal 0 marad.

**Világítás (`WinWatt32LightingSystemItem`)**: `EKMCalculation` attribútumokkal: `FH` (lm/W; IDS_LIGHTINGFHTYPE: 0 izzó … 6 LED = 120), `EtaVil` (0 üvegburás, 1 opál, 2 LED 0,5), `Ffe` (0 nem dimmelhető, 1–3 dimmelhető halogén / fénycső / LED 0,78), `Fkihaszn` (IDS_LIGHTINGFKIHASZNTYPE: múzeum … iroda 0,2 …), `Fszab` (0 kézi, 1 automatikus bekapcsolás/dimmelhető 0,975, …), `tnappal`/`tejjel` (IDS_LIGHTINGTTYPE: irodaépület 2250/250 …), `Fnappal` (0 >80 %, 1 40–80 % 0,45, 2 <40 %, 3 nincs természetes fény), `FOptions` (1 vészvilágítás, +2 stand-by), illetve `…Type` és `…Name` párok. **⚠ Lakóépületnél a világítási rendszer az ellenőrző listán hiba** („Hibásan felvett épülettechnikai rendszer … Világítási rendszer”), ezért csak nem lakó funkciónál vedd fel.

**Napelem / nyereségáram (`WinWatt32SolarSystemItem`)**: `Flags`, `Energy`, `OriginalEnergy`, `EnergySourceType 0`, a `PVGIS` és `PVGIS2` blokk (alapértékeken), valamint az egyszerűsített számítás: **`SimplePV PeakPower="5" Compass="180" Gradient="0" EnergyProduction="4710"`**. A GUI csak a megadott dőlésfokok közül enged választani (vízszintes, 10°…80°, függőleges). A PV a `EnergyConsumptions`-ben `SolarElectric` + negatív `Electric` értékként jelenik meg, és `ExportedEnergy`-ként kerül az OÉNY-be. A számítási módok: egyszerűsített, PVGIS, értékmegadás, saját szimuláció.

**Felújítás (`PanelRenovationItem`)**: a GUI „Felújítás (szerkezetek)” fülén látható adatok: „Típus a dokumentációban”, Jó / Kiváló szint (`Flags` bit 1 / bit 2), „Felújított érték” = kmax / kmin. A 2026-ban mért értékek: fal 0,24 / 0,16, tető és padlásfödém 0,17 / 0,12, **pincefödém 0,26 / 0,18**, ablak 0,8, tetősík ablak 1,0, ajtó 1,4 / 1,0, kapu 1,3. `Symbol` értékek: 0 homlokzati fal, 2 fűtött tetőteret határoló, 3 padlásfödém, 5 alsó zárófödém, 11 tetősík ablak, 13 ajtó, 14 kapu, 19 talajon fekvő padló, 21 fa/PVC ablak. Az importkor törlődik, a WinWatt újragenerálja.

### 6.5 Tanúsítási egység (ETZone) és e-tanúsítás export a GUI-ban
- Épület → „Zónák” fül: számítás célja (engedélyezési terv / energetikai minőségtanúsítvány), fűtött és hűtött zóna, használati zónák (`ZoneUsingType`, IDS_ZONEUSEINGTYPE: 0 lakóépület egésze, 1 kis iroda …), hőegyensúlyi zónák (`ThermicZone`), tanúsítási egységek (`ETZone`). Az ETZone-ra duplán kattintva: Követelmény (meglévő épület / új épület / jelentős felújítás), szimbólum, felújítási javaslat (jó / kiváló), valamint a „Számít” gomb és az eredményfülek: Indikátorok (= az OÉNY energiahordozó-táblája), Értékelések (szerkezet- és rendszerminősítés), **Ellenőrzések (= a WinWatt ellenőrző listája)**.
- Az ellenőrző lista látott tételei: hőhídnövekmény-javaslat; „a szerkezettípusnál megadott U-értéktől eltérő értékkel szerepel az épületnél”; **„a levonandó felületek lehet, hogy hibásak” (tájolásonkénti eltérés m²-ben – a MinA nem egyezik az azonos tájolású nyílászárókkal, a kaput és a fűtetlen felé nyíló ajtót is beleértve)**; hibásan felvett épülettechnikai rendszer; hibás terület; „A tanúsítás XML feltölthetőséghez szükséges fotó az első lapra, a jellemző hőleadóra és a jellemző nyílászáróra”.
- **e-tanúsítás XML**: *Fájl → Energetikai minőségtanúsítvány… → Tovább → (Ellenőrzések) → Tovább → „e-tanúsítás xml export…”* → „Adminisztrációs adatok” ablak. Kötelező (aláhúzott) mezők: megrendelő, cím, hrsz, **Építés éve**, hasznos alapterület, kondicionált térfogat, szintszám, a tanúsítás célja (IDS_PURPOSEOFMAKING2023: 0 új épület, 1 adásvétel, 2 bérbeadás, 3 állami közhasználatú, 4 pályázat, 5 egyéb → `ETZoneDoc PurposeOfMaking`), az épület funkciója (IDS_BUILDINGFUNCTION2023: 0 lakóépület, 1 üdülő … → `UsingMode`), védettség (0 nem védett, 1 műemlék, 2 régészeti, 3 világörökség, 4 helyi, 5 többféle → `HeritageProtection`), a tanúsítás tárgya, köztulajdon, közforgalom, a helyszíni szemle dátuma, alternatív energiák. Ezekből „Mentés fájlba / Betöltés fájlból” is van (újrahasználható admin-adat). Az OK után fájlnév → kész az `UploadRequest` (≈1,5 MB a PDF-fel). Fotók nélkül is legenerálja, de akkor a `<Photos/>` üres, és a WinWatt figyelmeztet.
- **Fotók**: épület → „Fotók” fül → Képfájl neve (a teljes elérési út beírható) + Kategória (IDS_PHOTOCATEGORY: 0 első lapra kerülő homlokzati kép, 1 homlokzati, 2 jellemző hőleadó, 3 jellemző nyílászáró, 4 hőtermelő/hőtároló, 5 megújuló rendszer, 6 egyéb) + szöveg → Felvesz. Az XML-ben `EPBD/PhotoAlbumItem FileName Text Category Flags` alakban szerepel, de importkor törlődik, ezért a GUI-ban kell felvenni.

### 6.6 OÉNY `UploadRequest` – új, most látott értékek (WinWatt 9.58 export)
`CertIssueReason`: RentingOut (bérbeadás), Other. `TypeOfStructure`: FacadeWall, StructuresEnclosingHeatedAtticSpace, **FloorStructureBelowAtticAndCrawlSpace** (padlásfödém), **LowerCeilingStructureAboveUnheatedSpaces** (pincefödém és lefelé hűlő födém együtt), FacadeOpeningsWithWoodenOrPvcFrames, **RoofPlaneWindow**, DoorBetweenFacadeOrHeatedAndUnheatedSpaces (külső és fűtetlen felé nyíló ajtó együtt), **GateBetweenFacadeOrHeatedAndUnheatedSpaces**, GroundLevelFloorInNewBuildings. `Quality`: Bad, Poor, Good, Excellent (a GUI-ban rossz / gyenge / közepes / jó / kiváló). `BuildingServicesSystemEnergeticQuality`: HeatingSystem, HotWaterSupplySystem, **IntegratedLighting**. `EnergySources`: Fossil/Gas, NetworkElectricity, **Sun/Electrical**, EnvironmentalHeat stb. A felhasználás szerinti bontásban Heating, HotWater, **Lighting** és **ExportedEnergy** (PV) szerepel; a NonRenewablePrimaryEnergy negatív is lehet (PV-többlet). `SoftwareAndVersion` = „WinWatt 9.58 (2026. 6. 8.)”.

### 6.7 GUI-automatizálás a linkelt gépen (computer_* eszközök) – bevált fogások
- Hozzáférés: `computer_resolve_access(["WinWatt fecske"])` (a „WinWatt” név nem oldódik fel), és a fókusz visszahozásához a Fájlkezelő/tálca kattintásos jogosultsága. **Futó WinWatt mellett ne hívd az `open_application`-t**, mert második példányt indít (azt az X-szel kell bezárni).
- A Delphi-mezőkben a triple-click nem jelöl ki: `ctrl+a` → gépelés → `tab`. Tizedesvessző: „0,5”. Legördülő listánál: kattintás, majd `home` és `down`×n, végül `return`. A kattintással való választás elcsúszhat, mert a lista görget.
- Fafa-választók (hőtermelő-katalógus): a „>” kinyitó ikonra kell kattintani, az elemre kattintva töltődik be a Ck / qkv. **Előbb az energiahordozót kell kiválasztani, utána újra a fa elemét**, csak ezután aktív a „…listájába újként felvesz” gomb.
- Az XML Import az *aktuális* projektbe tölt, ezért tiszta teszthez előbb Új projekt kell (ctrl+N → mentés → név → Projekt adatok OK). Az XML Export / Import a Fájl menüből indul, a fájlnév beírható.
- Visszaellenőrzés: Export → `device_bash` + lxml diff a bemenettel, NÉV szerint párosítva (az ID-k változnak).

### 6.8 Rendszer-sablonok (WinWatt 9.58 export, 2026-10-29 – klónozáshoz; a WFinal/EnergyConsumptions/CO2Emission/QFinal/VentEnergy számított, 0-zható)

Fűtés: kondenzációs gázkazán 0,7 + levegő-víz HP 55/45 0,3, radiátor, EC-szivattyú:
```xml
<WinWatt32HeatingSystemItem><Name>Fűtési rendszer</Name><Description>TESZT kondenzacios gazkazan + levego-viz HP bivalens, radiator 55/45</Description><SystemArea>0</SystemArea><Area>21.87</Area><TotalArea>0</TotalArea><UsingFlag>1</UsingFlag><SpecificPrimerEnergy>0</SpecificPrimerEnergy><Sus>0</Sus><WFinal>43.587</WFinal><EnergyConsumptions Electric="43.587" Gas="1079.4" GreenElectric="169.47" AmbientHeat="288.55"><SumValues E0="71.267" E1="16.116" E2="17.981"/><ConsumptionTableItem ID="7" Consumption="43.587" CalorificBurningFactor="1" Flags="1"/><ConsumptionTableItem ID="2" Consumption="1079.4" CalorificBurningFactor="0.9" Flags="0"/><ConsumptionTableItem ID="7" Consumption="169.47" CalorificBurningFactor="1" Flags="0"/><ConsumptionTableItem ID="14" Consumption="288.55" CalorificBurningFactor="1" Flags="0"/></EnergyConsumptions><CO2Emission>295.8</CO2Emission><RefEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></RefEnergyConsumptions><CO2Emission>0</CO2Emission><BaseEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></BaseEnergyConsumptions><CO2Emission>0</CO2Emission><Mode>1</Mode><UseZones>0</UseZones><StokerItem><Type>1</Type><Share>0.7</Share><EnergySourceType>2</EnergySourceType><EnergySourceTypeDescription>földgáz</EnergySourceTypeDescription><PrimerEnergyMultiplier>1</PrimerEnergyMultiplier><SusFactor>0</SusFactor><UserDefined>0</UserDefined><CkType>6</CkType><CkDescription>Fűtött téren belül elhelyezett kondenzációs olaj- vagy gázkazán</CkDescription><Ck>1.01</Ck><qkv>0.79</qkv><QFinal>1068.7</QFinal><Flags>0</Flags><CogenerativEfficiency>0</CogenerativEfficiency></StokerItem><StokerItem><Type>1</Type><Share>0.3</Share><EnergySourceType>9</EnergySourceType><EnergySourceTypeDescription>H hőszivattyús elektromos áram</EnergySourceTypeDescription><PrimerEnergyMultiplier>1.8</PrimerEnergyMultiplier><SusFactor>0.1</SusFactor><UserDefined>0</UserDefined><CkType>11</CkType><CkDescription>Elektromos üzemű hőszivattyú, levegő hőforrással, fűtővíz hőmérséklet 55/45</CkDescription><Ck>0.37</Ck><qkv>0</qkv><QFinal>458.01</QFinal><Flags>0</Flags><CogenerativEfficiency>0</CogenerativEfficiency></StokerItem><UserFlags>0</UserFlags><SpecificHeatingEnergy>61.639</SpecificHeatingEnergy><qfhType>-1</qfhType><qfhDescription/><qfh>0</qfh><qfvType>2</qfvType><qfvDescription>Elosztó vezetékek a fűtött téren kívül;vízhőmérséklet 55/45</qfvDescription><qfv>7.8</qfv><qftType>4</qftType><qftDescription>Nincs</qftDescription><qft>0</qft><Eft>0</Eft><EfszType>9</EfszType><EfszDescription>Elektronikusan szabályzott, állandó mágneses motorral;EEI=0,23</EfszDescription><Efsz>1.44</Efsz><Efsz2Type>4</Efsz2Type><Efsz2Description>Nincs</Efsz2Description><Efsz2>0</Efsz2><SystemType>0</SystemType><RegPart Index="0" Type="2" Value="1.042"/><RegPart Index="1" Type="2" Value="0.015"/><RegPart Index="2" Type="1" Value="0.009"/><RegPart Index="3" Type="2" Value="-0.06"/><RegPart Index="4" Type="12" Value="0"/><RegDescription/><RegValue>1.006</RegValue></WinWatt32HeatingSystemItem>
```

HMV: gázbojler, cirkuláció EEI 0,17, egyéb épület fogyasztással, egyszerűsített napkollektor-blokk:
```xml
<WinWatt32WaterHeatingSystemItem><Name>Melegvíz-termelő rendszer</Name><Description>TESZT gazboyler cirkulacioval</Description><SystemArea>0</SystemArea><Area>21.87</Area><TotalArea>0</TotalArea><UsingFlag>1</UsingFlag><SpecificPrimerEnergy>0</SpecificPrimerEnergy><Sus>0</Sus><WFinal>21.433</WFinal><EnergyConsumptions Electric="21.433" Gas="78689"><SumValues E0="3564.3" E1="0.294" E2="962.2"/><ConsumptionTableItem ID="7" Consumption="21.433" CalorificBurningFactor="1" Flags="1"/><ConsumptionTableItem ID="2" Consumption="78689" CalorificBurningFactor="0.9" Flags="0"/></EnergyConsumptions><CO2Emission>15903</CO2Emission><RefEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></RefEnergyConsumptions><CO2Emission>0</CO2Emission><BaseEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></BaseEnergyConsumptions><CO2Emission>0</CO2Emission><Mode>1</Mode><UseZones>0</UseZones><qHMV>1460</qHMV><StokerItem><Type>2</Type><Share>1</Share><EnergySourceType>2</EnergySourceType><EnergySourceTypeDescription>földgáz</EnergySourceTypeDescription><PrimerEnergyMultiplier>1</PrimerEnergyMultiplier><SusFactor>0</SusFactor><UserDefined>0</UserDefined><CkType>14</CkType><CkDescription>Gázüzemű boyler</CkDescription><Ck>1.22</Ck><qkv>0</qkv><QFinal>64499</QFinal><Flags>0</Flags><CogenerativEfficiency>0</CogenerativEfficiency></StokerItem><UserFlags>20</UserFlags><qfvType>2</qfvType><qfvDescription>Elosztó vezetékek a fűtött téren belül;cirkulációval</qfvDescription><qfv>24</qfv><Ec>0.98</Ec><qftType>3</qftType><qftDescription>Elhelyezés a fűtött térben;gázüzemű boyler</qftDescription><qft>78</qft><EcType>2</EcType><EcDescription>cirkulációval;EEI=0.17</EcDescription><BuildingCategory>2</BuildingCategory><HMVUsingItem Type="Irodaház" DailyValue="0.4" Unit="0" Quantity="10"/><SimpleHMVCollector Type="síkkolektor" Surface="4" Compass="180" Gradient="45" SystemArea="0" EnergyProduction="0" CoverRatio="0" ElectricRequest="0"/></WinWatt32WaterHeatingSystemItem>
```

Légtechnika: HR 85 %, kalorifer HP, hűtőgép, 1 légcsatorna-szakasz:
```xml
<WinWatt32AiringSystemItem><Name>Légtechnikai rendszer</Name><Description>TESZT hovisszanyeros legkezelo</Description><SystemArea>0</SystemArea><Area>21.87</Area><TotalArea>0</TotalArea><UsingFlag>1</UsingFlag><SpecificPrimerEnergy>0</SpecificPrimerEnergy><Sus>0</Sus><WFinal>13.219</WFinal><EnergyConsumptions Electric="13.219"><SumValues E0="1.3902" E1="0.18133" E2="0.27502"/><ConsumptionTableItem ID="7" Consumption="13.219" CalorificBurningFactor="1" Flags="1"/></EnergyConsumptions><CO2Emission>4.825</CO2Emission><RefEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></RefEnergyConsumptions><CO2Emission>0</CO2Emission><BaseEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></BaseEnergyConsumptions><CO2Emission>0</CO2Emission><Mode>1</Mode><UseZones>0</UseZones><StokerItem><Type>3</Type><Share>1</Share><EnergySourceType>9</EnergySourceType><EnergySourceTypeDescription>H hőszivattyús elektromos áram</EnergySourceTypeDescription><PrimerEnergyMultiplier>1.8</PrimerEnergyMultiplier><SusFactor>0.1</SusFactor><UserDefined>0</UserDefined><CkType>12</CkType><CkDescription>Elektromos üzemű hőszivattyú, levegő hőforrással, fűtővíz hőmérséklet 35/28</CkDescription><Ck>0.3</Ck><qkv>0</qkv><QFinal>0</QFinal><Flags>0</Flags><CogenerativEfficiency>0</CogenerativEfficiency></StokerItem><CoolerItem><Type>5</Type><Share>1</Share><EnergySourceType>0</EnergySourceType><EnergySourceTypeDescription>elektromos áram</EnergySourceTypeDescription><PrimerEnergyMultiplier>2.5</PrimerEnergyMultiplier><SusFactor>0.1</SusFactor><UserDefined>0</UserDefined><CkType>1</CkType><CkDescription>Léghűtéses kompakt és osztott kivitelű (távkondenzátoros) folyadékhűtő SEER=3,0</CkDescription><Ck>0.33</Ck><qkv>0</qkv><QFinal>0</QFinal><Flags>0</Flags><CogenerativEfficiency>0</CogenerativEfficiency></CoolerItem><AirCanalItem><Type>0</Type><d>160</d><A>0</A><B>0</B><Thickness>20</Thickness><HeatingCond>0.04</HeatingCond><Length>10</Length><Speed>2</Speed><AirTemp>20</AirTemp><OutsideTemp>20</OutsideTemp><AirTempSummer>20</AirTempSummer><OutsideTempSummer>20</OutsideTempSummer><Heated>0</Heated><U>0</U><HeatLoss>0</HeatLoss><HeatLossProYear>0</HeatLossProYear><HeatLossSummer>0</HeatLossSummer><HeatLossProYearSummer>0</HeatLossProYearSummer></AirCanalItem><Volume>62.33</Volume><AirChangeFactLT>0.5</AirChangeFactLT><AirChangeFactInf>0.5</AirChangeFactInf><AirVolumeLTBase>31.165</AirVolumeLTBase><AirVolumeLTBaseGived>0</AirVolumeLTBaseGived><RecuperationFlags>35</RecuperationFlags><RecuperUsingRate>0</RecuperUsingRate><RecuperEfficiency>85</RecuperEfficiency><HeatedAirTemp>20</HeatedAirTemp><CooledAirTemp>26</CooledAirTemp><AirHeatingUsingRate>0</AirHeatingUsingRate><Z>5090</Z><UserFlags>0</UserFlags><fszType>3</fszType><fszDescription>20 °C alatti befúvási hőmérséklet esetén</fszDescription><fsz>0</fsz><dpVent>150</dpVent><VentEfficiency>50</VentEfficiency><VentWorkingMode>0</VentWorkingMode><VentWorkingTimeValue>0</VentWorkingTimeValue><VentEnergy>13.219</VentEnergy><OtherEnergy>0</OtherEnergy><AirCanalHeatingLosses>0</AirCanalHeatingLosses><AirCanalCoolingLosses>0</AirCanalCoolingLosses><WorkingSeasons>3</WorkingSeasons><RecircledAirVolume>0</RecircledAirVolume></WinWatt32AiringSystemItem>
```

Hűtés: split, direkt elpárologtatás:
```xml
<WinWatt32CoolingSystemItem><Name>Hűtési rendszer</Name><Description>TESZT split klima</Description><SystemArea>0</SystemArea><Area>21.87</Area><TotalArea>0</TotalArea><UsingFlag>1</UsingFlag><SpecificPrimerEnergy>0</SpecificPrimerEnergy><Sus>0</Sus><WFinal>0</WFinal><EnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></EnergyConsumptions><CO2Emission>0</CO2Emission><RefEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></RefEnergyConsumptions><CO2Emission>0</CO2Emission><BaseEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></BaseEnergyConsumptions><CO2Emission>0</CO2Emission><Mode>1</Mode><UseZones>0</UseZones><StokerItem><Type>5</Type><Share>1</Share><EnergySourceType>0</EnergySourceType><EnergySourceTypeDescription>elektromos áram</EnergySourceTypeDescription><PrimerEnergyMultiplier>2.5</PrimerEnergyMultiplier><SusFactor>0.1</SusFactor><UserDefined>0</UserDefined><CkType>0</CkType><CkDescription>Kompresszoros léghűtés (split) SEER=2,5</CkDescription><Ck>0.4</Ck><qkv>0</qkv><QFinal>0</QFinal><Flags>0</Flags><CogenerativEfficiency>0</CogenerativEfficiency></StokerItem><UserFlags>0</UserFlags><NettoEnergy>0</NettoEnergy><WorkingHours>0</WorkingHours><fszType>-1</fszType><fszDescription/><fsz>0</fsz><eszabType>7</eszabType><eszabDescription>Hűtőközeg hőhordozó;Direkt elpárologtatás</eszabDescription><eszab>1.13</eszab><cHType>2</cHType><cHDescription>Közvetlen elpárologtatós rendszer (5 °C)</cHDescription><cH>1.45</cH><eszall>1</eszall><dpVent>0</dpVent><VentEfficiency>50</VentEfficiency><SpecificLTVolume>0</SpecificLTVolume><VentEnergy>0</VentEnergy><OtherEnergy>0</OtherEnergy><AirCanalHeatingLosses>0</AirCanalHeatingLosses></WinWatt32CoolingSystemItem>
```

Világítás (csak nem lakóépület!):
```xml
<WinWatt32LightingSystemItem><Name>Világítási rendszer</Name><Description/><SystemArea>0</SystemArea><Area>21.87</Area><TotalArea>0</TotalArea><UsingFlag>1</UsingFlag><SpecificPrimerEnergy>6.25</SpecificPrimerEnergy><Sus>0</Sus><WFinal>0</WFinal><EnergyConsumptions Electric="54.675"><SumValues E0="5.75" E1="0.75" E2="1.1375"/><ConsumptionTableItem ID="7" Consumption="54.675" CalorificBurningFactor="1" Flags="0"/></EnergyConsumptions><CO2Emission>19.956</CO2Emission><RefEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></RefEnergyConsumptions><CO2Emission>0</CO2Emission><BaseEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></BaseEnergyConsumptions><CO2Emission>0</CO2Emission><Mode>1</Mode><UseZones>0</UseZones><EKMCalculation MV="0" FH="120" EtaVil="0.5" Ffe="0.78" Fkihaszn="0.2" Fszab="0.975" tnappal="2250" tejjel="250" Fnappal="0.45" MVType="-1" FHType="6" EtaVilType="2" FfeType="3" FkihasznType="5" FszabType="1" tType="0" FnappalType="1" FOptions="3" MVName="" FHName="LED" EtaVilName="LED esetén minden változatban" FfeName="Dimmelhető LED" FkihasznName="Iroda" FszabName="Automatikus bekapcsolás/dimmelhető" tName="Irodaépület" FnappalName="Homlokzati üvegezési arány 40% - 80% között"/></WinWatt32LightingSystemItem>
```

Napelem 5 kWp, egyszerűsített:
```xml
<WinWatt32SolarSystemItem><Name>Nyereségáram forrás</Name><Description/><SystemArea>0</SystemArea><Area>21.87</Area><TotalArea>0</TotalArea><UsingFlag>1</UsingFlag><SpecificPrimerEnergy>0</SpecificPrimerEnergy><Sus>0</Sus><WFinal>0</WFinal><EnergyConsumptions Electric="-4710" SolarElectric="4710"><SumValues E0="-495.34" E1="150.75" E2="-82.053"/><ConsumptionTableItem ID="15" Consumption="4710" CalorificBurningFactor="1" Flags="2"/><ConsumptionTableItem ID="11" Consumption="4710" CalorificBurningFactor="1" Flags="0"/></EnergyConsumptions><CO2Emission>-1601.4</CO2Emission><RefEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></RefEnergyConsumptions><CO2Emission>0</CO2Emission><BaseEnergyConsumptions><SumValues E0="0" E1="0" E2="0"/></BaseEnergyConsumptions><CO2Emission>0</CO2Emission><Mode>1</Mode><UseZones>0</UseZones><Flags>24</Flags><Energy>0</Energy><OriginalEnergy>4710</OriginalEnergy><EnergySourceType>0</EnergySourceType><EnergySourceTypeDescription>elektromos áram</EnergySourceTypeDescription><PrimerEnergyMultiplier>2.5</PrimerEnergyMultiplier><UserDefined>0</UserDefined><PVGIS SystemMode="0" Latitude="0" Longitude="0" DatabaseIndex="-1" PVTechnologyIndex="0" PeakPower="0" SystemLoss="14" Slop="35" Azimut="0" Flags="3" EnergyProduction="0" Variability="0" TotalLoss="0" Irradiation="0" CalcedSlop="0" CalcedAzimut="0"><PVGISMonth Index="0" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="1" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="2" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="3" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="4" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="5" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="6" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="7" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="8" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="9" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="10" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="11" EnergyProduction="0" Irradiation="0" Variability="0"/><PVGISMonth Index="12" EnergyProduction="0" Irradiation="0" Variability="0"/></PVGIS><PVGIS2 PlaceType="0" Latitude="0" Longitude="0" DatabaseIndex="-2" NOCT="45" Gamma="-0.0036" InverterEfficiency="0.95" FeedbackLimit="-1" Losses="0.1" Capacity="0" CutOff="0.4" ChargingEfficiency="0.95" DischargingEfficiency="0.95" EnergyLimit="0" EnergyPrice_0_0="0" EnergyPrice_0_1="0" EnergyPrice_1_0="0" EnergyPrice_1_1="0"><Field Index="0" PeakPower="0" Slop="35" Azimut="0"/><Field Index="1" PeakPower="0" Slop="35" Azimut="0"/><Field Index="2" PeakPower="0" Slop="35" Azimut="0"/><PVGISConsumption ProfileID="ResidentalGeneral" TCurveFileName="" Mode="0" YearConsumption="0" MonthConsumptions="0;0;0;0;0;0;0;0;0;0;0;0"/></PVGIS2><SimplePV PeakPower="5" Compass="180" Gradient="0" EnergyProduction="4710"/></WinWatt32SolarSystemItem>
```
