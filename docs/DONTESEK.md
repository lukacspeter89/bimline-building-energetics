# Döntésnapló

Minden olyan döntés, amelyet a források nem döntenek el egyértelműen. Minden sorban: azonosító, a döntés, ki és mikor
hozta, és hol érvényesül a kódban vagy az adatban. A program felülete és a számítási dokumentáció ezekre hivatkozik.

## 2026-10-29 – Péter jóváhagyása a 0. fázisra

Péter 2026-10-29-én jóváhagyta a követelménymátrixot és a `NYITOTT_KERDESEK.md` A. részében szereplő javaslatokat
(„Jóváhagyom”). Az alábbi döntések ennek alapján érvényesek; bármelyik felülvizsgálható, ha Péter másként dönt.

| ID | Kérdés | Döntés | Érvényesül |
|----|--------|--------|------------|
| D-002 | K-002 szabványok | Az ISO 13370 (elemelt padló, fűtetlen pince), ISO 6946 F (fordított tető), ISO 52016-1 (csatolt zónák), szél és kapcsolt termelés esetén a program „részletes módszer szükséges” hibát ad, és csak kézi, forrással ellátott értéket fogad el. | `calc-core`: `ReszletesModszerSzukseges` hiba |
| D-003 | K-003 EPBD | A követelmények és a skála verziózott adatfájlok; új rendeletnél adatcsere + új verzió. | `data/normativ/rendelet` |
| D-004 | K-004 módszerverzió | A projekt rögzíti a módszer verzióját (jelenleg: „2023-07-27”). | `calc-core`: `MODSZER_VERZIO` |
| D-005 | K-005 OÉNY séma | A validációs szabályokból és a mintából épített séma (4. fázis). | – |
| D-006 | K-006 távhő | Lechner-adat nélkül a 7. melléklet tartalék értéke, figyelmeztetéssel. | 3. fázis |
| D-010 | K-010 KNZ qm-tábla | A lineáris képlet 0,3 ≤ A/V ≤ 1,3 között (az 1.3. pont grafikonja szerint). | `rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_qm_max`, `av_max = 1,3` |
| D-011 | K-011 nyári hővédelem | A súlyozó felület az üvegezés mérete szerinti A_ü (a képlet jelmagyarázata szerint), a 8%-os feltételnél is. | `calc-core/kovetelmeny` |
| D-012 | K-012 szerkezetminősítés | Ferde tetőtéri határoló → „magastető, lapostető”; árkád feletti és lefelé hűlő födém → „pincefödém”; ajtó, kapu, fűtött–fűtetlen fal → nincs minősítés. | `calc-core/kovetelmeny/minosites` |
| D-013 | K-013 csőszigetelés | „Az 1–4 sorok értékeinek fele” = a 2–5. sor (négy átmérő-kategória) értékének fele. | 3. fázis |
| D-014 | K-014 belső hőmérséklet | Lakó funkciónál az energetikai számításban 20 °C (2. függ. 2.1.), nem szerkeszthető; a helyiség-hőmérséklet csak a hőszükséglethez. | 2. fázis |
| D-015 | K-015 feltevés-értékek | Forrás nélküli érték csak „feltevés” jelöléssel és kötelező indoklással menthető; a tanúsítványban kiemelten látszik. | adatmodell, 3. fázis |
| D-016 | K-016 tájékoztató táblázatok | A 2. függ. 4.6. (panelos) táblázat kötelező alkalmazásként elérhető; a 4.1–4.5. csak meglévő épületnél, „módszer szerinti tájékoztató érték” forrással. | adatmodell |
| D-020 | K-020 hiányos táblák | Üres cellánál az ugyanabban az oszlopban legközelebbi kitöltött érték, „forráshiány – helyettesítő érték” jelöléssel; golden teszttel ellenőrizendő. | 2. fázis |
| D-021 | K-021 interpoláció | Lineáris interpoláció a táblázaton belül, a tartományon kívül a szélső érték (extrapoláció nélkül). | `calc-core/kozos/interpolacio` |
| D-022 | K-022 fűtőérték/égéshő | Végsőenergia égéshő alapon, indikátornál F_fé/éh szorzó. | 2. fázis |
| D-023 | K-023 PV-export | A 14. fejezet szerint; havi mérleg, ha van havi adat. | 2. fázis |
| D-024 | K-024 RER | E_ren / E_tot (súlyozott), WinWatt-exportokkal kalibrálva. | 2. fázis |
| D-025 | K-025 pince b_nyár | 1,5 – átvéve. | adat |
| D-026 | K-026 éghajlati adatok | Változatlanul. | adat |

## Kódolás közben hozott értelmezések (1. fázis)

| ID | Kérdés | Döntés | Indoklás / forrás |
|----|--------|--------|-------------------|
| D-101 | A (4.21) képletben az R_si és R_se értéke talajon fekvő padlónál | R_si a 4.1. táblázat „lefelé” értéke (0,17), R_se = 0,04 | A padlón a hőáram lefelé irányul (1. függ. 4.1.2, 4.1. táblázat). |
| D-102 | ΔU elhanyagolása, ha < 3% (4.1.6) | A program nem hanyagolja el, mindig a teljes korrekcióval számol | A módszer csak megengedi az elhanyagolást; a teljes korrekció a pontosabb. |
| D-103 | Árnyékoló légáteresztési osztálya (4.3. táblázat, 4. osztály „b_eth ≥ 8” átfed) | Az 1–3. osztály elsőbbséget kap; 3 < b_eth < 8 esetén a program nem sorol be, a felhasználónak kell az osztályt megadnia | A táblázat a 3–8 mm-t nem fedi le (NYITOTT_KERDESEK B.1/2). |
| D-104 | Függönyfal elem (4.15) képlete | Nem valósítjuk meg, amíg a „g” index nincs tisztázva; csak a (4.14) súlyozás és a kézzel megadott elem-U | NYITOTT_KERDESEK B.1/1. |
| D-105 | (4.24) feltétele: „legalább m > 0,5 m” | `m > 0,5` (szigorú) | A képletes jelölés a konkrétabb. |
| D-106 | Lineáris interpoláció a 4.2. táblázatban 300 mm felett | Nem alkalmazható: d > 0,3 m légréteg nem vehető figyelembe a U-ban (4.1.3 a)) | 1. függ. 4.1.3, 24. o. |
| D-107 | Inhomogén réteg alsó határértéke (4.9): beleszámít-e R_si és R_se | Igen: R_tot,alsó = R_si + Σ R_j + R_se | A (4.5) az alsó és a felső határértéket átlagolja; a felső határértékben (4.6) az R_tot,q a felületi ellenállásokat tartalmazza, így az összevethetőséghez az alsóban is szerepelniük kell (NYITOTT_KERDESEK B.1/5). |
| D-108 | Fűtött pincefal (4.27) R_si és R_se értéke | A 4.1. táblázat vízszintes hőáramhoz tartozó értéke (0,13 / 0,04) | Falról van szó, a hőáram vízszintes (1. függ. 4.1.2). |
| D-109 | Sugárzás köztes hajlásszögnél (2. függ. 1.6. táblázat, KLI-025) | Lineáris interpoláció a 0, 30, 45, 60, 90°-os értékek között; a 8 fő tájolás közül a legközelebbit kell választani | A D-021 elvével azonos; a táblázat interpolációs szabályt nem ad. |
| D-111 | Időállandó (6.34): a H_tr,F/H tartalmazza-e a fűtetlen tér felé eső, b-vel módosított tagot | Igen, az adott hónap b-tényezőjével (a hónapra számított τ) | A (6.34) „teljes transzmissziós hőátviteli tényező, a talajjal érintkező szerkezetek hatása nélkül” (49. o.); a fűtetlen tér felé eső tag része a transzmissziónak. |
| D-112 | Szakaszos üzem (6.33) a γ_F-ben | A σ_F-fel csökkentett Q_veszt kerül a (6.31) γ_F-be és a (6.40)-be is | A (6.33) a Q_veszt-et definiálja újra; a fejezet ezután mindenhol Q_veszt-et használ. |
| D-113 | Becsült hőszükséglet (6.54): melyik havi H_szell,F és b | A januári b és szellőzési tényező, ha a felhasználó nem ad meg külön értéket | A (6.54) nem nevez meg hónapot; január a leghidegebb méretezési hónaphoz legközelebbi. A képlet rendszerméretezésre nem használható (HSZ-003). |
| D-114 | Ψ_p,f táblázat (6.4.) λ-sávhatárai | 0,15 és 0,45 W/mK a középső sávba esik | A táblázat „0,15 W/mK és 0,45 W/mK közötti” szövege a határokat magában foglalja. |
| D-115 | Hőhidasság-besorolás (6.2.) határai | A 0,8 / 1,0 (és a lapostető, tetőtér határai) a közepes sávba esnek | A „0,8 - 1,0” jelölés zárt intervallum. |
| D-116 | (6.6) képletben a z tényező | A fűtött pince padlójának terepszint alatti mélysége [m] | A 4.4.4 (4.28) z-jelölésével azonos; a (6.6) dimenzióhelyes így. |
| D-117 | Árnyékolásvizsgálat nélkül (6.3.1) | Fűtésnél az északi tájolás sugárzása, hűtésnél a saját tájolásé, F_árny = 1 | 1. függ. 6.3.1, 47. o. (NY-015). |
| D-027 | Forráshierarchia: a tanúsítói felkészülési segédlet (kamarai kiadás, 2024) | Nem normatív: mintapéldákhoz és értelmezéshez használható; ellentmondás esetén a jogszabály és a 7. § (1) a) szerinti módszer az erősebb | Péter, 2026-10-29 |
| D-028 | K-008 órai meteorológiai adat | A forrás a Meteo PDF (F-05); a Drive-on lévő xlsx feldolgozást figyelmen kívül hagyjuk | Péter, 2026-10-29 |
| D-118 | A 8.8., 8.9. (és hasonló) táblázatok „> 500” sora | 500 m² felett a „> 500” sor értéke állandó; 500 m²-ig a számszerű sorok között lineáris interpoláció | Az utolsó sor nyitott tartomány, interpolációs pontja nincs (NYITOTT_KERDESEK B.3); a 7. fejezet interpolációs szabálya a számszerű sorokra alkalmazható. |
| D-119 | A hőfoklépcső szerinti interpoláció változója (RA-024, FUT-031, FUT-048) | Az előremenő és a visszatérő hőmérséklet számtani középértéke, lineárisan; a tartományon kívül a szélső érték | A módszer „a közepes hőmérsékletkülönbségre viszonyított” interpolációt ír elő (62. o.); a számtani közép a hőfoklépcsők közötti egyetlen egyértelmű skalár. |
| D-120 | Fan coil W_FC (8.17. táblázat, FUT-073) fűtés és hűtés közötti megosztása | A teljes éves érték egyszer, a fűtés segédenergiájánál számít; a hűtésnél nem számoljuk újra | A táblázat egész éves üzemre (fűtés + hűtés) adja meg; a kétszeres beszámítás hibás lenne. |
| D-121 | 8.10. táblázat, egy cellában két alapérték-leírás (1,042) és a Korrekció 3 halmozása | A két leírás egy választható sor; a (8.12) összeg minden tagja összeadódik, a program nem zárja ki a halmozást | A (8.12) összegképlet; a halmozás tilalmát a módszer nem mondja ki (NYITOTT_KERDESEK B.3). |
| D-122 | A HMV-táblázatok (9.4., 9.6., 9.9.–9.12.) „Alapterületig” fejléce: lépcsős vagy interpolált olvasás | Lineáris interpoláció a sorok között, mint a fűtésnél; a „> X” sor X felett állandó (D-118) | A 7. fejezet szerint az egyszerűsített módszer táblázatainál „köztes értékek esetén lineáris interpolációt kell alkalmazni” (55. o.); a fejléc szövege ezt nem írja felül. A mátrix HMV-028 példája ennek megfelelően javítva. |
| D-123 | (9.9) ErP elektromos HMV: a szöveg „reciprokának 2,5-szerese”, a képlet ε = 1/(2,5·η_s) | A képlet: ε = 1/(2,5·η_s) | A képlet egyezik a fűtés (8.6), (8.9) képletével; az ErP η_s primerenergia-alapú (2,5-ös szorzóval), így a végső energiához a 2,5·η_s reciproka tartozik (NYITOTT_KERDESEK B.4/28). |
| D-124 | Távhő HMV segédenergiája (265 kWh/év) közös fűtés+HMV hőközpontnál | A fűtés (215) és a HMV (265) segédenergiája külön-külön, a felhasználó által megadott hőközpontszámmal számít | A módszer mindkét fejezetben külön értéket ad, megosztási szabályt nem; a szó szerinti olvasat a kettő összege. |
| D-125 | Tároló nélküli HMV-rendszer | Q_HMV,tár = 0 | A 9.9–9.10. táblázat tárolótípusokra ad értéket; tároló hiányában tárolási veszteség nincs. |
| D-126 | Cirkulációs szivattyú EEI-oszlopa (9.12. táblázat) 0,17 és 0,23 közötti, ill. 0,23 feletti EEI-nél | EEI ≤ 0,17 → „0,17”; 0,17 < EEI ≤ 0,23 → „0,23”; EEI > 0,23 vagy ismeretlen → „nem ismert” | A kedvezőtlenebb oszlop felé kerekít, így nem ad a valósnál kedvezőbb eredményt. |
| D-127 | Q_koll,max (9.1–9.2. táblázat) köztes és tartományon kívüli értékei | Kétirányú lineáris interpoláció; 1,5–10 m² és 40–300 m² tartományon kívül a program részletes módszert kér | A 7. fejezet interpolációs szabálya; a tartomány alatti szélsőérték-tartás a valósnál nagyobb termelést adna. |
| D-128 | (9.6) negatív eredménye | Q_HMV,vég,2 = max(0, …), jelöléssel | A kollektor nem fedezhet többet a teljes igénynél (NYITOTT_KERDESEK B.4/2). |
| D-129 | Súlyozás égéshő- vagy fűtőérték-alapon | A hőtermelők teljesítménytényezői égéshőre vonatkoznak (7. fejezet); a súlyozó tényezők fűtőértékre (7. melléklet; 14.1. táblázat), ezért E = Q_vég·F_fé/éh·f + W·f, (14.2) | A G1 golden teszt (WinWatt) ugyanígy számol: 4226·0,9·1,1 + 214,08·2,3 = 4676 kWh/év = 48,71 kWh/m²év. |
| D-130 | Golden tesztek tűrése | A tests/golden/README.md javaslata: geometria ±0,5 %, U ±0,002, nettó igény, q, Ep, CO₂ ±3 %; nagyobb eltérésnél a módszer dönt, és az eltérést az ELTERESEK_WINWATT.md rögzíti | Péter (golden csomag README), 2026-10-29 |
| D-131 | D-020 pontosítása: üres táblázati cella, ha a keresett alapterület mindkét oldalán van kitöltött cella | Lineáris interpoláció a szomszédos kitöltött cellák között, jelöléssel; ha csak egy oldalon van kitöltött cella, marad a D-020 (legközelebbi érték) | A 7. fejezet interpolációs szabálya (55. o.). A G2 golden teszt szerint a WinWatt is így számol: 8.15. táblázat, fűtött tér, 35/28 °C, 160 m²: 0,1 (100 m²) és 0,0 (300 m²) között 0,07 kWh/m²év. A D-020 „golden teszttel ellenőrizendő” kikötése alapján. |
| D-132 | F_fé/éh bio folyékony és bio gáz tüzelőanyagra | A 2. függ. 3.1. táblázat nem ad értéket; a felhasználónak forrással kell megadnia, különben a program megáll | A táblázat csak földgázt, fa/biomasszát, szenet, olajat és nem éghető hordozót sorol fel; becslés nem vehető fel. |
