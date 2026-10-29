# Nyitott kérdések

Összeállítva: 2026-10-29. Az **A. rész** Péter döntését vagy közreműködését igényli; minden kérdésnél ott a javaslatom
(ha Péter jóváhagyja, a program így készül, és a döntés a naplóba kerül). A **B. rész** a forrásdokumentumok
(rendelet, 1. és 2. Függelék) talált hibáinak, kétértelműségeinek és hiányainak teljes listája, oldalszámmal; ezek
közül a számítást érdemben befolyásolókat az A. rész kiemeli.

## A. Döntést vagy közreműködést igénylő kérdések

### Források és bemenetek

**K-001 – Hálózati hozzáférés a jogszabályokhoz** — *lezárva (2026-10-29).* Péter engedélyezte; az `njt.jog.gov.hu`,
a `kormany.hu`, a `magyarkozlony.hu` és a `git.lechnerkozpont.hu` elérhető. Az `e-epites.hu` és az `njt.hu` továbbra
sem érhető el (lásd K-006).

**K-002 – Szabványszövegek.** A módszer egyszerűsített eljárásai a szövegben teljesek; szabvány ott kell, ahol a módszer
saját eljárást nem ad. Kötelező esetek (képlet a módszerben nincs):
- talajtól elemelt (búvóteres) padló, fűtetlen pince, részlegesen fűtött pince súlyozása – **MSZ EN ISO 13370** (1. függ. 4.4.2–4.4.4);
- fordított tető korrekciója – **MSZ EN ISO 6946 F melléklet** (1. függ. 4.1.6, 28. o.);
- termikusan összekapcsolt zónák figyelembevétele – **MSZ EN ISO 52016-1** (1. függ. 6. fejezet);
- szélenergia és kapcsolt energiatermelés – csak szabvány (MSZ EN 15316-4-10, -4-4; 1. függ. 13.3–13.4).
*Javaslat:* az első változatban ezek az esetek „részletes módszer szükséges” jelzést kapnak, és kézi értékmegadással (forrás-dokumentummal) vihetők be. Ha Péter rendelkezésre bocsátja az ISO 13370-et és az ISO 6946-ot, ezek kerülnek be elsőként.

**K-003 – EPBD (EU 2024/1275) hazai átültetése.** A lekérés napján (2026-10-29) a 9/2023. ÉKM és a 176/2008. Korm.
rendelet nem módosult az irányelv miatt, új skálát vagy tanúsítványformátumot nem találtam (FORRASOK.md 1.).
*Kérdés Péterhez:* tud-e tervezetről vagy kihirdetés előtti rendeletről? *Javaslat:* a besorolási skála és a követelmények
verziózott adatfájlok (`data/normativ/rendelet`), így egy új rendelet adatcserével és új verzióval kezelhető.

**K-004 – A számítási módszer verziója.** A kormany.hu-n egyetlen változat érhető el (közzétéve 2023.07.27., PDF
2023.09.18.); újabb változatról szóló hivatalos-értesítőbeli közleményt nem találtam. *Kérdés:* tud-e Péter javított
(errata) változatról? A program projektenként rögzíti a módszer verzióját (9/2023 ÉKM 7. § (4)–(5)).

**K-005 – OÉNY `UploadRequest` séma.** A Lechner git-tárban (commit 507735b, 2026-09-28) **nincs XSD**, csak minta
XML/JSON, szótár és validációs szabályok. *Javaslat:* a program a validációs szabályokból és a mintából gépi sémát
(JSON Schema) épít, és a teszt-feltöltőfelületen (oeny-nuat.e-epites.hu) próbál feltöltést, ha Péter ehhez hozzáférést ad.
*Kérdés:* van-e Péternek hivatalos XSD-je (pl. az entanhelpdesk@e-epites.hu-tól)?

**K-006 – Távhő-súlyozótényezők (e-epites.hu).** A 9/2023 ÉKM 8. § (1) szerint a Lechner minden év március 15-ig
közzéteszi az e-epites.hu-n. Ez a host a munkakörnyezetből nem érhető el. *Kérés:* engedélyezni az `e-epites.hu`-t, vagy
feltölteni a listát. Addig a program a 7. melléklet 10–11. sorának tartalék értékét (1,38 / 0 / 1,38 / 374) használja, figyelmeztetéssel.

**K-007 – Golden tesztek bemenetei.** Kérem a valós projektek WinWatt-exportjait (`WinWatt32Project`), a hozzájuk
tartozó OÉNY `UploadRequest` XML-eket és a WinWatt-hibrid (Python/FastAPI) motor forráskódját. Az ELTERESEK_WINWATT.md
„E?” tételei ezekkel dönthetők el.

**K-008 – Órai meteorológiai adat.** A részletes módszerhez az órai klímaadat (F-05) csak PDF-ként érhető el
(„Meteo_hatteradat.xlsx” nyomtatási képe, 630 oldal). *Javaslat:* a PDF-ből gépi kinyerés, ellenőrzőösszegekkel a 2. függ.
1.5–1.6. táblázat havi értékeihez. *Kérdés:* megvan-e Péternek az eredeti xlsx?

### A rendelet szövegének értelmezése

**K-010 – KNZ fajlagos hőveszteség-tényező: a táblázat 2. sora „0,3 ≤ A/V ≤ 1,0”** (9/2023 ÉKM 2. melléklet 1.2.).
Az 1,0 < A/V < 1,3 tartományt a táblázat nem fedi le; az 1.3. pont grafikonja 1,3-ig lineáris, és a képlet 1,3-nál
pontosan 0,37-et ad (a 3. melléklet azonos táblázata is 1,3-at ír). *Javaslat:* a lineáris képlet 1,3-ig, a döntés
jelölésével (`rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek.json#knze_qm_max`).

**K-011 – Nyári hővédelem: súlyozó felület.** A szöveg „bruttó felülettel súlyozott” átlagot ír, a képlet
jelmagyarázata szerint A_ü „a transzparens szerkezet felülete, az üvegezés mérete alapján számolva”
(9/2023 ÉKM 1. melléklet 2. pont). *Javaslat:* a képlet szerinti üvegezési felület (a képlet a konkrétabb), a feltétel
(8%-os küszöb) vizsgálatánál is.

**K-012 – Szerkezetminősítés: hiányzó típusok.** A 176/2008 4. melléklete nem ad osztályt ajtóra, kapura, fűtött
tetőteret határoló szerkezetre, árkád feletti födémre, lefelé hűlő belső födémre, fűtött–fűtetlen közötti falra.
A 4. § (4) szerint a fűtött tetőteret határoló szerkezet és az árkád feletti födém mértékadó szerkezet lehet.
*Javaslat:* ferde tetőtéri határoló → „magastető, lapostető” sor; árkád feletti és lefelé hűlő födém → „pincefödém” sor;
ajtó, kapu, fűtött–fűtetlen fal → nincs minősítés (az OÉNY-ben a WinWatt mit ad? → golden teszt). Kérem Péter megerősítését.

**K-013 – Csőszigetelés: „az 1–4 sorok értékeinek fele”** (1. melléklet 3.3.2., 6–7. sor). A vastagságok a táblázat
2–5. sorában vannak (az 1. sor a fejléc). *Javaslat:* a négy átmérő-kategória (2–5. sor) értékének fele.

### Bevitel és munkamód (WinWatt-eltérések)

**K-014 – Fűtési hőmérséklet lakóépületben: 20 °C kötelező** (2. függ. 2.1. táblázat, 2. pont: „a megadott értékek
használata kötelező”), szemben a WinWattban beállított 22 °C-kal (ELTERESEK_WINWATT.md E-01). *Javaslat:* az energetikai
számításban 20 °C, nem szerkeszthető; a 22 °C csak a méretezési hőszükséglethez. Kérem a megerősítést.

**K-015 – „Feltevés” jelölésű általános értékek.** A FELADAT.md szerint minden általunk felvett érték csak valós
termékadatlapból származhat, vagy „feltevés” jelölést kap. A Solymár-projektben (SKILL 1. fejezet) Péter maga cserélte
a gyártói adatot általános, „– feltevés” jelölésű értékre (pl. N+F 30 λ 0,23; Ug 0,6 g 0,50; Uf 1,0). *Kérdés:* a program a
„feltevés” értéket engedje mentésre (látható jelöléssel és a dokumentációban „feltételezett jellemzők … ettől eltérő
csak legalább ilyen hőtechnikai jellemzőkkel építhető be” mondattal), vagy forrás nélkül tiltsa? *Javaslat:* engedje,
de csak kötelező indoklással és a tanúsítványban kiemelten.

**K-016 – A módszer tájékoztató értékei.** A 2. Függelék 4.1–4.5. táblázata (üvegezések, keretek, Ψ, árnyékolók) és a
4.6. táblázat (panelos falak, 1992 előttre *kötelező*) a módszer része, de „tájékoztató” jellegű. Péter szabálya szerint
termékadat nélkül „tipikus” érték nem adható meg. *Javaslat:* a 4.6. (panelos) táblázat kötelező alkalmazásként
elérhető; a 4.1–4.5. táblázat értékei csak meglévő épület tanúsításakor, „módszer szerinti tájékoztató érték” forrással
választhatók, új épületnél nem.

### A módszer hiányai, amelyek döntést kívánnak

**K-020 – Hiányos táblázatok a forrásban** (a PDF-képen ellenőrizve, nem átviteli hiba):
- 8.2. táblázat (58. o.): fűtött téren belüli kazán – kondenzációs és alacsony hőmérsékletű csak 100 m²-nél, állandó hőmérsékletű 500 m²-ig;
- 8.15. táblázat (66. o.): hőtárolás fűtött térben – sok üres cella;
- 9.11. táblázat (74. o.): HMV elosztás cirkuláció nélkül – csak 100 m²-nél;
- 8.4. táblázat (58. o.): szilárd tüzelés segédenergiája – csak 500 m²-ig;
- 10.8. táblázat (81. o.): ventilátor-hatásfok – csak „2010 előtt”.
*Javaslat:* az üres cellánál a legközelebbi kitöltött érték (a nagyobb alapterület felé konzervatívan), jelöléssel és a
WinWatt-értékkel összevetve (golden teszt). Másik lehetőség: a 8.1. (fűtött téren kívüli) táblázat használata. Kérem Péter döntését.

**K-021 – Táblázati értékek interpolációja.** A 7. fejezet (55. o.) az alapterület szerinti táblázatoknál lineáris
interpolációt ír elő, de több táblázat „alapterületig” fejléccel lépcsős olvasást sugall (8.4, 8.8, 8.9, 8.15, 9.x). A
tartományon kívüli (100 m² alatti, 10000 m² feletti) esetre nincs szabály. *Javaslat:* lineáris interpoláció a táblázaton
belül, a tartományon kívül a szélső érték (extrapoláció nélkül).

**K-022 – Fűtőérték / égéshő.** A hőtermelők teljesítménytényezői égéshőre vonatkoznak (55. o.), a súlyozó tényezők a
fűtőértéken számított végsőenergiára (9/2023 ÉKM 7. §(3)); a (14.2)–(14.5) az F_fé/éh szorzót alkalmazza (2. függ. 3.1.).
*Javaslat:* a végsőenergia égéshő alapon, az indikátornál F_fé/éh szorzóval (az OÉNY-ben a WinWatt is így: `CalorificBurningFactor` 0,9).

**K-023 – Napelem-export és önfogyasztás.** A 13.1 szerint egyszerűsítve a teljes termelés exportként számolható el, a
14. fejezet szerint csak a nem szabályozott fogyasztóknak átadott rész; az önfogyasztás kezelése nincs kidolgozva.
*Javaslat:* a 14. fejezet (az épület saját fogyasztását kiváltó rész az épület igényéből levonódik, a többlet
exportált), havi mérleggel, ha a módszer havi adatot ad; egyébként éves. Golden teszt a WinWatt `ExportedEnergy` mezőjével.

**K-024 – Megújuló részarány.** A jelölésjegyzékben „RER” szerepel, de képlet nincs sem a módszerben, sem a rendeletben,
az OÉNY viszont `RenewableEnergyUsage` (%) mezőt kér. *Javaslat:* E_ren / E_tot (súlyozott, f_ren ill. f_tot alapon),
a WinWatt-exportokkal kalibrálva; a döntés a naplóba.

**K-025 – Fűtetlen pince nyári b-tényezője 1,5** (1. függ. 6.3. táblázat). Fizikailag szokatlan (> 1), de a forrás így
írja, és a WinWatt is ezt használja. *Javaslat:* átvesszük, megjegyzéssel.

**K-026 – Éghajlati adatok havi menete** (2. függ. 1.1. táblázat): február −0,1 °C (hidegebb a januári 2,1 °C-nál),
december −0,1 °C, október 8,3 / november 7,6 °C. A PDF így írja, és az 1.4. táblázat ugyanezt a menetet követi.
*Javaslat:* változatlanul használjuk (ez a normatív referenciaév).

---

## B. A forrásdokumentumok anomáliái (teljes lista, fejezetenként)

A tételeket az adatkivonatolás során, a PDF-oldal képén ellenőrizve gyűjtöttük. A forrásértéket egyik esetben sem
javítottuk; a JSON-fájlok `megjegyzes` mezője ugyanezt rögzíti. A rendeleti anomáliák (K-010, K-011, K-013, valamint
az 1. melléklet 1.1. táblázatának 22. sorából hiányzó nyitó zárójel) az A. részben szerepelnek.

### B.1 1. Függelék 2–5. fejezet (jelölések, módszertan, határoló szerkezetek, zónázás)

1. **(4.15), 28. o.** – A függönyfal-elem képletének második (vonalmenti) tagjában `l_g,ü·ψ_g,ü`, `l_g,k·ψ_g,k` és a nevezőben `ΣA_g` szerepel, a jelmagyarázat és a jelölésjegyzék viszont lizénát (`l`) ír (ψ_l,ü, ψ_l,k, A_l), „g” index nincs definiálva. A második tag nevezőjéből `ΣA_l` hiányzik (helyette `ΣA_g`), és a jelmagyarázatban szereplő `ψ_l,p·l_l,p` (lizéna–panel) tag a képletből teljesen hiányzik. A PDF-en (300 dpi) is így szerepel. Valószínű szándék: g ≡ l, és egy nevező. Nem javítottuk.
2. **4.3. táblázat, 30. o.** – A 4. osztály („alacsony”) feltétele `beth ≥ 8`, ami átfed az 1–3. osztállyal, a 3 < b_eth < 8 tartomány pedig egyik osztályba sem esik. Valószínűleg `3 < beth < 8` a szándék (MSZ EN ISO 10077-1-hez hasonlóan) – nem javítottuk.
3. **(4.4), 25. o.** – A képletben az A_szell mm2-ben értendő (1500, 500, 1000 állandók), a jelmagyarázat szerint viszont „A_szell a nyílások területe [m2]”. Ráadásul az A_szell fajlagos mennyiség (mm2/fm, ill. mm2/m2), amit a jelölés nem jelez.
4. **3.4, 22. o.** – Társított árnyékoló, automatikus szabályozás: „napkeltéig napnyugtától nyitva van, egyébként csukva” – a mondat értelmetlen/ellentmondásos (szó szerint fordítva a kézi esethez képest); a nyitva tartási időszak nem határozható meg egyértelműen.
5. **(4.9), 26. o.** – `R_tot,alsó = Σ R_j` – a szöveg nem mondja ki, hogy a homogén rétegek és a felületi hőátadási ellenállások (R_si, R_se) is a szummába tartoznak (MSZ EN ISO 6946 szerint igen); a jelölés csak az inhomogén rétegek R_j-jét definiálja.
6. **(4.17), 30. o.** – Az R_l (kapcsolt szárnyak közötti légréteg) meghatározásának módja nincs megadva (4.2. táblázat? MSZ EN ISO 10077-1?); a jelölés „U_Ny,1” nagy N-nel, a jelmagyarázatban „U_ny,1”.
7. **4.4. és 4.5. táblázat, 31. o.** – A 4.4. táblázat 1. osztályra ΔR = 0,08 állandót ad, míg a 4.5. táblázat „1-2 osztály” oszlopa 0,09–0,14 értékeket – a két táblázat összevont osztályai miatt nem konzisztens; a forrás nem rendezi, melyik az elsődleges, ha R_árny csak becsült.
8. **4.1.6, 28. o.** – Fordított tető ΔU_ford: „az MSZ EN ISO 6946 szabvány F melléklete szerint”, p = 1,3 mm/nap – a képletet és a további paramétereket (f·x tényező) a módszer nem adja meg. Szabvány beszerzése szükséges.
9. **4.1.1, 24. o.** – MSZ EN ISO 10456 korrekciós tényezők és MSZ 24140 mellékleteinek anyagjellemzői nincsenek a módszerben; adatbázist külön kell biztosítani.
10. **4.4.2 / 4.4.4, 33–34. o.** – Talajtól elemelt padló és fűtetlen pince (részlegesen fűtött pince súlyozásához) számítása csak „MSZ EN ISO 13370 szerint” – a módszer nem adja meg a képleteket. A „súlyozni kell” módját (H vagy U súlyozása) nem rögzíti.
11. **4.4.3, 33. o.** – „legalább m > 0,5 m” – a „legalább” (≥) és a szigorú „>” jel ellentmond; programban `m > 0,5` vagy `m ≥ 0,5` kérdéses. A (4.24) feltétele a padló területére (≤ 250 m2) vonatkozik, de a B-t (4.25)/(4.26) a 4.4.2 szerinti módon kell-e számolni, nincs kimondva (feltételezhetően igen).
12. **4.4.3, (4.25), 33. o.** – U_talaj magyarázata: „ha van lábazati szigetelés, akkor azt figyelembe lehet venni U_talaj-ban a terepszint alatt” – a módját nem adja meg (a (4.25) nem tartalmaz R tagot).
13. **4.4.5, (4.31)–(4.33), 34. o.** – A jelölésjegyzék ψ_psz-t (kisbetű), a képletek Ψ_psz,v / Ψ_psz,f-et (nagybetű) használnak; a jelölésjegyzékben P_psz és l_psz is szerepel ugyanarra („a perem hőszigetelés hossza”). (4.33)-ban az A jelentése (padlóterület) nincs külön megadva.
14. **4.1.7, 28. o. vs. 2. függ. 4.3, 28. o.** – Az 1. függ. szerint a panel-U-k az elemen belüli hőhidakat tartalmazzák; a 2. függ. ezt nem mondja ki. Az 1. függ. „1992 előtt épült” rendszerekről beszél, a 2. függ. 4.6 táblázata 1994-ig terjedő időszakokat (pl. 1984-1994, 1987-1994) is tartalmaz. A kiegészítő hőszigetelés vastagságának (0…20) mértékegysége a táblázatfejben hiányzik (valószínűleg cm); zárójeles rétegvastagságok (pl. „265 (210)”) jelentése nincs megmagyarázva; csoporton belül átfedő gyártási időszakok (pl. Budapest I. 1975-1983 / 1982-1990) – a választás szabálya nem adott.
15. **2. fejezet, 18. o.** – ϑ_e,o „méretezési külső hőmérséklet” mértékegysége „-” (°C helyett), és a θ_e,o-val párhuzamos, külön jelölés. Üres mértékegység: C_h, b_éjjel, b_szell,k, ε_LT,UF (5., 13., 17. o.).
16. **5. fejezet, 37. o.** – „hőtároló képességben két osztálynál kisebb különbség” – a hőtároló-képességi osztályokat az 5. fejezet nem definiálja (feltehetően a 6. fejezet / 2. függelék könnyű–nehéz besorolása). A „fűtési és hűtési parancsolt hőmérsékletek közötti különbség kevesebb, mint 4 K” megfogalmazás kétértelmű: a két zóna azonos szezonú alapjelei közötti különbséget, vagy egy zónán belül a fűtési és hűtési alapjel különbségét jelenti-e (a szövegkörnyezet az előbbit valószínűsíti).
17. **5. fejezet, 35. o.** – Erősen kapcsolt példa: „a tér nagyon kisméretű, lsd. 6. pont” – a „6. pont” a zónázás 6. lépésére (nagyon kisméretű zóna, < 1%) utal, nem a 6. fejezetre; ez értelmezés. A „gyengén kapcsolt” felsorolás „például” jellegű, így nem kimerítő besorolási szabály. Az 5.1. táblázat csak lakóépületekre vonatkozik; egyéb épületekre nincs megfelelő táblázat.
18. **3.4, 21–22. o.** – Hivatkozott, kötelező/alternatív szabványok (a módszer nem tartalmazza őket): MSZ EN ISO 10211 (részletes U, rögzítőelem, talaj – alternatív részletes), MSZ EN ISO 6946 (D: légréteg, E: változó vastagság, F: fordított tető – részletes; F a fordított tetőnél feltételesen kötelező), MSZ EN ISO 10456 (tervezési λ – kötelező), MSZ 24140 (anyagjellemzők, állagvédelem – alternatív), MSZ EN ISO 13788 (állagvédelem – alternatív), MSZ EN ISO 12631 (függönyfal – részletes; SG/SSG/átszellőztetett esetben kötelező), MSZ EN ISO 10077-1/-2 (nyílászáró – részletes), MSZ EN ISO 13370 (talaj – részletes; búvóteres padló, fűtetlen pince esetén kötelező), MSZ EN ISO 16798-1 (szimulációs fogyasztói profil lakóépületnél – kötelező, vagy egyenértékű), MSZ EN ISO 52016-1 (napterek részletes számítása – kötelező részletes esetben).

### B.2 1. Függelék 6. fejezet (nettó fűtési és hűtési igény)

1. **38. o.** – A módszerválasztási felsorolás mindkét pontja „a)” jelölésű (helyesen a)/b)).
2. **38–53. o.** – A θ_i,F/H parancsolt hőmérséklet és a θ_e,átlag / θ_e,év éghajlati adatok forrását a 6. fejezet a (6.7)-nél nem nevezi meg (feltehetően 2. Függelék 2.1. táblázat, illetve 1.2. pont). Ezt a 2. Függelék feldolgozásával kell egyeztetni.
3. **41. o. (6.6)** – A `z` tényező (feltehetően a pincepadló terepszint alatti mélysége, m) a fejezetben nincs definiálva.
4. **41. o. 6.3. táblázat** – A zárt, fűtetlen pince b_nyár = 1,5 (> 1), a padlás b_nyár = 0,0. Átvettük, ahogy a forrásban van. A b > 1 fizikailag szokatlan, ellenőrizni kell.
5. **40. o. 6.2. táblázat; 42. o. 6.4. táblázat** – A határértékek zártsága nem egyértelmű (pontosan 0,8 / 1,0 fm/m², illetve λ = 0,15 / 0,45 W/mK esetén). A JSON-ban a közepes sávot zártnak vettük; ez értelmezés, és jelöltük is.
6. **39. o.** – Belső oldali hőszigetelésnél a módszer csak „javasolja” a részletes hőhídmodellt vagy a szakirodalmi adatot, kötelező alternatív eljárást nem ad.
7. **44. o. (6.14)** – A képlet n_szüks-t használ, a szöveg viszont azt mondja: „Az n_term értéke a 6.2.2 fejezet alapján határozható meg”. n_term nem szerepel sem a képletben, sem a 6.2.2-ben.
8. **44. o. (6.12)** – A képletben nincs időarány (folyamatos üzemet feltételez). A (6.13) összegzési indexe (Σ) nincs megadva.
9. **45. o.** – Hibás kereszthivatkozás: „ekkor a 0. pont szerinti részletes módszer alkalmazható” (törött mezőhivatkozás).
10. **43. o. és 45. o.** – n_szüks forrása egyszer „2. Függelék 2. pontja / V̇_LT-ből számítandó”, másszor „2. Függelék 2.1. táblázat”. Konzisztens lehet, de egyeztetni kell.
11. **47. o.** – „MSZ EN 52016-1” – az „ISO” hiányzik (máshol MSZ EN ISO 52016-1).
12. **47. o.** – Hűtésnél F_h, F_v, F_f közül „a legnagyobb vehető figyelembe”. Mivel ezek ≤ 1 szorzók, a „legnagyobb” a legkisebb árnyékolást jelenti; nem egyértelmű, hogy a tényező értéke vagy a hatása értendő. Az is kétértelmű, hogy ez a „biztonság javára elhagyás” alternatívája-e.
13. **46. o.** – A keretarány-esetek elsőbbsége nem rendezett (pl. régi és egyben kisméretű nyílászáró).
14. **46. o. (6.22)** – A g_árny,H,i index „H”, a képlet viszont F/H-ra vonatkozik; fűtésnél g_árny,F = 1 (47. o.).
15. **48. o. (6.27) vs (6.33)** – Q_veszt kétszer van definiálva, σ_F nélkül és σ_F-fel. A γ_F-be és a (6.40)-be a σ_F-es érték kerül-e, azt a szöveg csak implicit adja. A Σ összegzési tartománya (szerkezetek? zónák?) sincs megadva.
16. **48. o. / 51. o.** – A szakaszos üzem fűtésnél a veszteséget korrigálja (σ_F·Q_veszt), hűtésnél a nettó igényt (σ_H·Q_H,net). Ez eltérő logika; a forrás szerint vettük át.
17. **49. o. (6.34)** – Nem egyértelmű, hogy H_tr,F/H („a talajjal érintkező szerkezetek hatása nélkül”) tartalmazza-e a b-vel módosított H_tr,x-et. A Σ indexe sincs megadva.
18. **50. o. (6.37)** – γ_F ≤ 0 és Q_nyer > 0 esetén η_F = 1/γ_F negatív, γ_F = 0-nál nincs értelmezve. A 6.7.2 a) nullázó szabálya miatt az eredmény Q_F,net = 0, így a képlet gyakorlatilag hatástalan.
19. **50–51. o.** – A γ_F > 2,0 és az 1/γ_H > 2,0 nullázó küszöb az MSZ EN ISO 13790 módszerében nem szerepel; nemzeti kiegészítés, így vettük át. γ_F ∈ (1; 2] tartományban (6.35) érvényes.
20. **51. o.** – A (6.48) és a (6.50) azonos képlet, kétszer szerepel. Nincs kimondva, hogy az éves összeg a σ_H-val korrigált havi értékekből áll, de ez következik a sorrendből.
21. **51. o. (6.49)** – A jelölés nem egységes: a képletben Q_H,net,folyt, a magyarázatban Q_net,folyt,H.
22. **52. o. (6.53)** – A V „fűtött térfogat” csak a szöveges definícióból következik. A Q_tr,F tartalmazza a θ_e,év-vel számolt talajtagot, a nevező viszont θ_i,F − θ_e,átlag. Δt = 3624 h fix érték (151 nap); szökőévre nincs szabály.
23. **53. o. (6.54)** – A mértékegység „[w]” (helyesen W). A jelölés ϑ, nem θ. Nincs megadva, hogy H_tr,F tartalmazza-e H_tr,T-t és a b-vel módosított tagokat, illetve hogy σ_F nélkül értendő-e.
24. **Hivatkozott szabványok** (mind részletes / alternatív módszerként, az egyszerűsített a táblázatos):
    - MSZ EN ISO 52016-1: órai módszer, termikusan összekapcsolt zónák (ez kötelező, ha a zónák közti kapcsolatot figyelembe veszik), árnyékolás, indirekt nyereség, σ_F/σ_H, C_m,eff, látens igény, opak szoláris;
    - MSZ EN ISO 10211: hőhidak, Ψ_p,f;
    - MSZ EN ISO 13789: b tényező;
    - MSZ EN ISO 13786: C_m,eff.

### B.3 1. Függelék 7–8. fejezet (rendszer-alapelvek, fűtés)

1. **8.2. táblázat (58. o.)**: a 2. εF-oszlop fejléce hibásan „[kWh/m2év]” (a 8.1. analógiája alapján valószínűleg „Alacsony hőmérsékletű kazán”); az Állandó hőmérsékletű oszlop 750–10000 m2 között üres; a 2. és a Kondenzációs oszlop csak 100 m2-nél ad értéket (1,08; 1,01). Nem eldönthető, hogy az üres cella a fenti érték továbbvitelét jelenti-e. JSON-ban null.
2. **8.15. táblázat (66. o.)**: a „fűtött térben” oszlopokban sok üres cella (55/45: 500, 750, 1500–10000 m2; 35/28: csak 100 m2 = 0,1 és 300 m2 = 0,0 kitöltött). Értelmezés (továbbvitel/interpoláció/0) nincs megadva.
3. **8.4. táblázat (58. o.)**: csak 500 m2-ig; nagyobb alapterületre nincs érték. A 8.3. táblázat Faelgázosító kazánjához nincs segédenergia-oszlop.
4. **(8.3) egyenlet (56. o.)**: a szöveg szerint a szabályozás, elosztás, tárolás és hőtermelő segédenergiáját kell összegezni, a képlet viszont csak W_F,sziv + W_F,tár + W_F,term tagot tartalmaz (W_F,szab nincs), és a 8.17. táblázat fan coil segédenergiája (W_FC, ráadásul fűtés+hűtés összesítve) sem szerepel benne; a fűtés/hűtés közötti megosztás nincs szabályozva.
5. **8.1 (56. o.)**: „amíg a Q_F,net értéke legalább zérus nem lesz” – a szövegkörnyezet alapján Q_F,net,FR-nek kellene lennie (nem javítottuk).
6. **8.3.1.1 (57. o.)**: „de a 0 szerinti egyszerűsített módszer nem” – hibás kereszthivatkozás („0”), valószínűleg a 8.3.1.2-re utal.
7. **(8.6) és (8.9) (59., 61. o.)**: a szöveg „szezonális hatásfok érték reciproka”-ként írja, a képlet viszont ε_F = 1/(2,5·η_s); a 2,5 szorzó eredetét a módszer nem magyarázza (valószínűleg az ErP primerenergia-átváltási tényező).
8. **Segédenergia megfogalmazás**: ErP hőszivattyúnál „nem szabad figyelembe venni” (59. o.), ErP kazánnál és egyedi fűtésnél „nem kell figyelembe venni” (57., 61. o.) – eltérő szigorúság; nem egyértelmű, hogy a „nem kell” megengedi-e a figyelembevételt.
9. **Közepes hőmérsékletkülönbség (55., 62. o.)**: a hőfoklépcső-interpoláció változójának (számtani/logaritmikus közép, viszonyítási belső hőmérséklet) definíciója hiányzik.
10. **„Alapterületig” fejlécű táblák (8.4, 8.8, 8.9, 8.15, 58–66. o.)**: a fejléc lépcsős olvasást sugall, a 7. fejezet (55. o.) viszont köztes értékekre lineáris interpolációt ír elő – a két szabály viszonya nem egyértelmű. A 8.1/8.2 táblák alapterület-tartományán kívüli (100 m2 alatti, 10000 m2 feletti) kezelés nincs megadva.
11. **8.10./8.11. táblázat (63. o.)**: az 1,042-es alapérték cellája helyiségenkénti hőmérséklet-szabályozást is említ, miközben a Korrekció 3 szintén helyiségenkénti szabályozásra ad levonást – a halmozás szabálya nincs rendezve. A „Ventilátoros radiátorok” sor az egycsöves alcsoport alatt áll, alcsoport-fejléc nélkül.
12. **8.16. táblázat (66–67. o.)**: a 7 K oszlopokhoz nincs hőmérséklet-pár; az EC-szivattyú (EEI) oszlopok nem bontanak fűtőfelület és hőfoklépcső szerint. Fejléccellák tördelése széteső (értelemszerűen összefűzve).
13. **8.5. táblázat (60. o.)**: Levegő/levegő sor fűtővíz-hőmérséklete üres (értelemszerű); 8.14. táblázatban magasabb rendű szabályozású gázkonvektor belső falnál nincs megadva.
14. **8.4 Napkollektorok (61. o.)**: csak az MSZ EN 15316-4-3 részletes módszer („történhet”), egyszerűsített módszer nincs – a program számára kötelezően részletes módszert igényel.
15. **8.3.3 Távhő (60. o.)**: a hőközpontonkénti 215 kWh/év segédenergia nem fajlagos; bivalens/részrendszeres esetben az RA-023 szerinti arányosítás alkalmazhatósága nem egyértelmű.

### B.4 1. Függelék 9–10. fejezet (HMV, szellőzés)

1. **9.2, 68. o.** A szöveg szerint a HMV segédenergiához „az elosztás, a tárolás és a hőtermelő” segédenergiáját kell összegezni, a (9.2) képlet viszont csak W_HMV,sziv + W_HMV,term; tárolási segédenergia-tag és -érték nincs.
2. **(9.6), 69. o.** Q_HMV,vég,2 negatív lehet, ha Q_koll,max·k·ε_HMV,2 > Q_HMV,vég,koll_nélkül; levágásról (0-ra) a forrás nem rendelkezik. Kérdéses az is, hogy (9.5) a hő vagy a végső energia: (9.5) Q_HMV,vég,koll-nak nevezi a kollektortermelést, de (9.6)-ban ε_HMV,2-vel szorozva vonja le.
3. **9.1., 9.2. táblázat, 69–70. o.** Köztes A_koll / A_rszr értékekre nincs interpolációs vagy kerekítési szabály; a táblázattartományon kívüli (A_koll < 1,5 vagy > 10 m², A_rszr < 40 vagy > 300 m²) esetre sincs. A 9.2. tábla címében „vákumcsöves” elírás.
4. **9.1. ábra, 69. o.** A jelmagyarázat felirata csonka („Hajlásszö”); egy felirat nélküli vízszintes vonal is van ~82%-nál (feltehetően α=0°, k=0,821). Az ábra és a (9.7) képlet közül melyik az irányadó eltérés esetén, nincs megadva.
5. **9.3. táblázat, 70. o.** A havi részarányok összege 99,99%, nem 100%.
6. **9.3 fejezet, 70. o.** A 9.3.1 alfejezetcím hiányzik (9.3 után közvetlenül 9.3.1.1 jön; értelemszerűen kazánok). A „részletes módszer” a 9.3-ban nincs szabványhoz kötve.
7. **9.3.3.1, 72. o.** Hivatkozási hiba: „de a 9.3.2.2 szerinti egyszerűsített módszer nem” – a 9.3.3.1-ben értelemszerűen 9.3.3.2 lenne.
8. **9.4. táblázat, 71. o.** ÁF: V<2 l, KT: 2<V<10 l – V=2 l, V=10 l és V≥10 l nincs definiálva. Kombikazán és kondenzációs kombikazán oszlopok csak 500 m²-ig kitöltöttek. A csillag (ÁF/KT*) magyarázata a táblázat alatti szövegben.
9. **9.6. táblázat, 71. o.** A jelölés W_F,term (fűtési index) a HMV-fejezetben – vélhetően W_HMV,term. 500 m² felett nincs adat; a faelgázosító kazán a hasábfa-oszlopba van vonva, míg a 9.5-ben külön szerepel.
10. **9.7. táblázat, 72. o.** ErP hatályán kívüli elektromos készülék (pl. hőszivattyú) segédenergiájára nincs érték.
11. **9.3.4, 73. o.** A távhő teljesítménytényező jelölése εF=1,01 (fűtési index) a HMV-fejezetben. A 265 kWh/év hőközpontonkénti segédenergia megosztása közös fűtés+HMV hőközpont esetén nincs szabályozva.
12. **9.9. vs 9.10. táblázat, 73–74. o.** A fűtött téren belüli tábla „> 500” sorral zárul, a kívüli 10000 m²-ig részletez – aszimmetria; 10000 m² felett a 9.10-ben nincs adat.
13. **9.4.2, 74. o.** A szöveg „Az elosztási veszteségek a … összefüggéssel határozhatók meg a HMV tárolóra” – szövegezési hiba (tárolási veszteség). A szabvány csak „15316-5”-ként szerepel (MSZ EN előtag nélkül). A visszanyerhető rész („a nettó fűtési igényből levonandó, de itt figyelembe kell venni”) fűtési oldali levonásának módja nincs kifejtve; az egyszerűsített módszernél erről nincs szó.
14. **9.11. táblázat, 74. o.** A „Cirkuláció nélkül” oszlopokban csak a 100 m²-es sor kitöltött (13% / 10%); 100 m² felett üres – nem egyértelmű, hogy ugyanaz az érték érvényes-e.
15. **9.12. táblázat, 75. o.** 0,17 és 0,23 közötti vagy 0,17 alatti EEI esetén az oszlopválasztás/interpoláció nincs szabályozva. W_HMV,sziv_talaj (9.3) értékére egyszerűsített módszer nincs.
16. **(10.1) vs (10.14), 76–77. o.** Indexsorrend eltér: Q_F,LT,n,recirk (10.1) ↔ Q_F,LT,recirk,n (10.14), (10.18). A (10.5) mellől a mértékegység hiányzik. Jelölésváltozatok: θ_bef;F / θ_bef,F, Q_F;UF / Q_F,UF.
17. **(10.8), 76. o.** A fagyvédelmi órákon kívüli időszakra is θ_e;átlag (a teljes időszak átlaga) szerepel, nem a −4 °C feletti órák átlaga – a forrás szerint átvéve, de fizikailag pontatlan lehet.
18. **(10.15), 78. o.** „Q_F,UF,1/2n,friss” index értelmezése bizonytalan (1. vagy 2. üzemállapot n?); a nevezőben „CRTL” elírás (CTRL). A (10.15) nem tartalmazza a recirkulációt, f_LT-t és légcsatorna-veszteséget (mint a 10.18), és a CTRL kitevő nélkül szerepel, míg (10.17)-ben CTRL^x.
19. **10.2. táblázat, 79. o.** Címe és oszlopfejléce szó szerint azonos a 10.3-mal („Szellőzés térfogatáram szabályozása”, „Ventilátor vezérlés típusa”), de a sorok légcsatornázottságot írnak le.
20. **10.1.4.1, 78. o.** SPI hiánya esetén (2018 előtti készülék) alapérték nincs megadva.
21. **(10.20), 79. o.** Az üzemidő a képletben „Δt_LT,a,” (n index hiányos); Δp_LT (nyomásesés, Pa) nincs definiálva, alapértéke nincs megadva.
22. **10.5. táblázat, 79–80. o.** Pontosan 20 °C befúvási hőmérséklet esete nincs besorolva.
23. **(10.21), 80. o.** Az index „Q_F,LT,lcs,nn” és az üzemidő „Δt_LT,” – elírás; l_v, a, b, θ_bef jelölések nincsenek definiálva (értelemszerűen légcsatorna hossza, oldalméretei). Nincs megadva, hogy a „környezeti hőmérséklet” (15 K-feltétel) θ_i;F vagy a légcsatorna környezete.
24. **10.7. táblázat, 80. o.** 2 m/s sor: 60 mm → 0,69 > 50 mm → 0,68 (a többi sor monoton csökkenő, 0,55–0,62) – valószínű elírás; a forrás értéke maradt.
25. **10.8. táblázat, 81. o.** Az oszlop „2010 előtt” – 2010 utáni ventilátorokra érték nincs.
26. **10.2, 81. o.** Részletes módszer szabványlistájában az „MSZ EN 16798-5-2” kétszer szerepel (valószínűleg az egyik 16798-5-1 lenne).
27. **0,35 szorzó, (10.3)–(10.14).** Mértékegysége (Wh/(m³·K)) a forrásban nincs kiírva; az értelmezés a képlet szerkezetéből adódik.

### B.5 1. Függelék 11–14. fejezet (hűtés, világítás, nyereségáramok, indikátorok)

- **A-HUT-1** (83. o., 11.2. táblázat): földgáz üzemű HP, hulladékhő hasznosítva: SEER 1,7 → ε_H 0,58, holott 1/1,7 = 0,588 (két tizedesre 0,59). A többi sor kerekítve egyezik. Átvéve 0,58-ként.
- **A-HUT-2** (82. o., 11.1.2): a szöveg szerint ε_H = 1/SEER csak elektromos üzemű hőszivattyúkra áll, a táblázat mégis ad értéket földgáz üzemű hőszivattyúra. Ennek energiahordozója (földgáz) és az F_fé/éh alkalmazása (14.5) nincs kimondva; az sem, hogy a gázmotoros SEER fűtőérték vagy égéshő alapú.
- **A-HUT-3** (82. o., (11.1)): a képlet bal oldalán Q_H,vég,j áll („hő- és villamos energiára külön”). A villamos hűtőgép eredménye a jelölés szerint mégis „Q”, a 14. fejezet pedig W_H,vég,i-t is vár. A szöveg nem mondja ki, hogy villamos hűtőgépnél a (11.1) eredménye W-nek számít-e (14.5). Ráadásul (11.2) W_H,vég-et a segédenergiára használja, amely egyszerűsített esetben 0.
- **A-HUT-4** (82–83. o.): a segédenergia jele (11.2)-ben W_H,seg, a 11.1.2 szövegben W_H,s. A passzív talajhőcserélős szabály (1 kWh → 10 kWh) nincs képletbe illesztve. Nyitott, hogy a csökkentett nettó igény belép-e a (11.1)-be, és hogy a W_H,s „egyszerűsített esetben W_H,vég = 0” mellett is beszámítandó-e.
- **A-HUT-5** (82. o., 11.1. táblázat): c_H csak 3 esetre „irányadó”. Más rendszerre (pl. 8/14 °C, 14/18 °C, levegős passzív hűtés) nincs szabály, pedig a 11.3. táblázat ezeket ismeri.
- **A-HUT-6** (83. o., 11.1.3): a szabványjelölés „MSZ-EN-15316-3” kötőjelekkel, évszám nélkül (máshol, 3279. sor: „MSZ-EN-15316-3:2017”). Valószínűleg MSZ EN 15316-3.
- **A-VIL-1** (84. o., 12.1): a szöveg a „hő- és villamos energiaigény” energiahordozónkénti meghatározását írja, a (12.1) viszont csak villamos energiát ad (sablonszöveg). A jelöléslista F_kihaszn-t felsorolja, a (12.1)-ben azonban csak közvetve, F_szab-on keresztül szerepel.
- **A-VIL-2** (85–86. o.): a 12.4. (F_kihaszn) és a 12.6. (üzemórák) táblázat épülettípus-listája eltér. Kereskedelmi egységre nincs F_kihaszn. Múzeumra, könyvtárra, színházra és konferenciateremre nincs üzemóra. A 2. Függelék 2.1. táblázat funkcióihoz nincs megfeleltetés.
- **A-VIL-3** (86. o., 12.7. táblázat): a 40% és a 80% pontosan melyik sávba esik, nem egyértelmű. Az „üvegezési arány” zónára vagy épületre vonatkozik? Ez sincs megadva.
- **A-VIL-4** (85. o., 12.5. táblázat): a 12.4-es értékekhez nem kell interpolálni, de a módszer nem rendezi, hogyan kell kezelni a rácsponton kívüli F_kihaszn-t vagy a táblázatban nem szereplő szabályozástípust.
- **A-VIL-5** (85. o., 12.2. táblázat): a fejléc „Fényforrás típusa”, az értékek azonban lámpatest-búrára vonatkoznak. Búra nélküli / egyéb lámpatestre nincs érték.
- **A-VIL-6** (84. o. vs. 89. o.): a jelölés a 12. fejezetben W_V,vég, a (14.6)-ban W_vil,vég,i; a (14.1)-ben E_vil,súlyozott, a (14.6)-ban és a (14.13)-ban E_V,súlyozott.
- **A-MEG-1** (87. o., 13.1. táblázat): északi tájolásra (É, ÉK, ÉNy) és köztes hajlásszögekre nincs érték, interpolációs szabály sincs. A hajlásszög mértékegysége (°) nincs kiírva. A táblázat „tájékoztató”.
- **A-MEG-2** (87. o., 13.1 vs. 14 fej. 89. o.): a 13.1 szerint egyszerűsítve a teljes termelés exportként számolható el, és az épület villamos igénye teljesen hálózati. A 14. fejezet bevezetője szerint viszont csak a nem szabályozott fogyasztásra jutó PV-áram „tekintendő” exportáltnak, ami részletes módszernél önfogyasztás-beszámítást enged. Az önfogyasztás W_vég-ből való levonásának módja nincs megadva.
- **A-MEG-3** (87–88. o.): szélenergiára és kapcsolt termelésre nincs egyszerűsített módszer, csak szabvány (MSZ EN 15316-4-10, MSZ EN 15316-4-4). A gázmotor saját tüzelőanyag-felhasználásának és hőtermelésének a (14.x) mérlegbe illesztése (Q_exp, f_súly,term) nincs kidolgozva. A 7. mellékletben nincs külön tényező kapcsolt termelésű villamos energiára.
- **A-IND-1** (10. o. jelöléslista; 91. o.): a „RER megújuló energia részarány [%]” jelölés szerepel, de a 14. fejezetben nincs rá definíció/képlet (pl. E_ren,tot / E_tot). A rendelet szövegében (ekm9.txt) sincs részarány-képlet vagy -követelmény. Nem pótoltam.
- **A-IND-2** (89–90. o.): a 14.1. táblázat szerint a végsőenergia „fűtőérték alapján” értendő. A (14.2)–(14.5) ennek ellenére F_fé/éh szorzót alkalmaz a Q_vég tagokra, ami arra utal, hogy a 8–11. fejezet Q_vég értékei égéshő alapúak. Ezt a 14. fejezet kifejezetten nem mondja ki; a többi fejezettel össze kell vetni.
- **A-IND-3** (89. o., (14.7)): f_súly,term „az energiatermelő súlyozó tényezője” – a 7. mellékletben PV-re (13. sor) és szélre (15. sor) van érték. Gázmotornál és hőexportnál (Q_exp) nem egyértelmű, melyik sor f_súly,exp és f_súly,term; hőexportra a 7. melléklet nem ad „exportált hő” sort.
- **A-IND-4** (91. o., 14.3): E_ren,tot összetevőinek számítása (különösen E_passzív és E_ren,távol) nincs képlettel megadva. Nyitott, hogy az f_ren-nel súlyozott E_ren ((14.1) f_ren-nel) és az E_ren,tot hogyan viszonyul egymáshoz; és hogy a hőszivattyús Q·(1/ε−1) tag melyik energiahordozó f_ren-jével szorzandó (környezeti hő 7. mell. 16. sor: f_ren=1 – értelmezés).
- **A-IND-5** (ÉKM 7. mell.): a táblázat oszlopbetűi A, B, C, E, F – a „D” kimaradt (az A két cellát fog össze). Tartalmi hatása nincs. A rendelet „fCO2eq (g/kWh)” jelölést használ, az 1. Függelék „fCO2”-t és kg CO2-t. Az 1. Függelék 14.2 nem ismétli a súlyozó tényezők táblázatát, így számszerű eltérés nem volt vizsgálható. Belső ellenőrzés: minden sorban f_tot = f_nren + f_ren.
- **A-IND-6** (89. o.): a (14.2)–(14.6) Σ_i energiahordozónként összegez, a (11.1) pedig j indexet használ az energiahordozóra – jelölési következetlenség.

### B.6 2. Függelék (referenciaértékek)

1. 2. függ. 1. o., 1.1. tábl.: havi középhőmérséklet szokatlan értékei (feb. −0,1 °C < jan. 2,1 °C; dec. −0,1 °C; okt. 8,3 ≈ nov. 7,6 °C) – a PDF-képen ellenőrizve, a forrás így írja; változatlanul átvéve. (Az 1.4. tábl. pv,t sora ugyanezt a menetet mutatja.)
2. 2. függ. 1. o., 1.2.1: a szöveg hőfokhidat „az egyensúlyi hőmérsékletkülönbség függvényében” említ, de ilyen táblázat nincs.
3. 2. függ. 1. o., 1.3. tábl.: a súlyozott éves átlag −5,714 °C, a táblázat −5,72-t ad (0,01 eltérés); a nem listázott hónapok értéke (0 h) nincs kimondva.
4. 2. függ. 2. o., 1.4. tábl.: plev, pv,t, x jelölések feloldása hiányzik; pv,t értékei telítési gőznyomásnak felelnek meg.
5. 2. függ. 3. o., 1.5. tábl.: a cím „energiahozam”, de az egység W/m2 (intenzitás).
6. 2. függ. 4. o., 1.6. tábl.: két éves összeg kerekítési eltérése (ÉK 45°: 798,5 vs. 798,3; D 30°: 1480,7 vs. 1480,9).
7. 2. függ. 3–4. o.: köztes hajlásszögekre/tájolásokra nincs interpolációs szabály.
8. 2. függ. 6–19. o.: árnyékoló segédtáblák számozatlanok; nincs interpoláció; F_h csak 10–70° és 90°/30° hajlásra; F_v/F_f csak 30–90° és függőleges nyílászáróra.
9. 2. függ. 16. és 19. o.: „Fv – 90 fok” tábla cellánként azonos a „Fh – 70 fok – 90° hajlás” táblával.
10. 1. függ. 47. o.: hűtésnél „a legnagyobb” árnyékoltsági tényező figyelembevétele kétértelmű.
11. 1. függ. 21. o. / 2. függ. 1. o.: a részletes módszer órai klíma-adatfile-ja nincs csatolva, letöltési hely nincs megadva.
12. 2. függ. 20–22. o., 2.1. tábl.: vonatkoztatási felület V̇_LT/A_k (20. o.) vs. V̇_LT/A_N (21–22. o.).
13. 2. függ. 22. o., 2.1. tábl. ** lábjegyzet: meglévő (nem korszerűsített) rendszerek megvilágítási értéke nincs megadva.
14. 2. függ. 23. o., 2.2. tábl.: „naponta” értékekhez az éves napszám nincs megadva; Hotel egyszerű/luxus kritérium hiányzik; fajlagosítás „nettó kondicionált alapterület” (2. függ.) vs. „hasznos alapterület” (1. függ. 9.1, 68. o.).
15. 2. függ. 23. o., 2.3. tábl.: mértékegység nincs feltüntetve (1/h értelmezés).
16. 2. függ. 24. o., 2.4. tábl.: q50 mértékegysége „h-1”; „7-” szintsáv értelmezése; mérés megléte, de kiváló feltétel nem teljesül → teendő nincs megadva.
17. 2. függ. 25. o., 2.5. tábl.: τ = 24 h pontosan nincs lefedve.
18. 1. függ. 51. o., 6.8.3: σ_H-ra a „2. Függelék 2.5. táblázat”-ra hivatkozik, holott az a 2.6. táblázat.
19. 2. függ. 25. o., 3.1. tábl.: nem listázott tüzelőanyagok (PB-gáz, pellet stb.) besorolása hiányzik.
20. 2. függ. 26–28. o., 4.2/4.4. tábl.: kategóriahatárok nem definiáltak; 4.4-ben a „> 2 mm”/„> 4 mm” átfed, egy kombináció hiányzik.
21. 2. függ. 28. o., 4.6 tábl.: a kiegészítő hőszigetelés vastagságának egysége hiányzik; cím előtt nincs „táblázat:”; zárójeles rétegértékek jelentése nincs megadva.
22. 2. függ. 29. o., 4.6 tábl.: Szolnok 1989-1991 teljes vastagság 260 ≠ 60+60+160 = 280.
23. 2. függ. 29–30. o., 4.6 tábl.: U_12 = 0,276 (Budapest III. 1984-1994) vs. 0,278 (Debrecen 1987-1994, Szeged 1982-1987) azonos rétegrendnél.
24. 1. függ. 28. o. vs. 2. függ. 28–30. o.: „1992 előtt épült” alkalmazási kör, de 1992 utáni gyártási idők a táblában; az 1. függ. szerint az elemen belüli hőhidakat tartalmazza, a 2. függ. ezt nem mondja; átfedő gyártási időszakoknál nincs választási szabály.

Hivatkozott szabványok (a 2. függ.-ben és a felhasználó 1. függ.-helyeken):
- MSZ EN 12207 – nyílászárók légáteresztési osztálya (4-es osztály → „jó légzárású”), besorolási kritérium (2. függ. 24. o.).
- MSZ EN ISO 9972 – légtömörség-mérés; a „kiváló légzárású” sor feltétele, kötelező (2. függ. 24. o.).
- MSZ EN ISO 52016-1 (az 1. függ. 47. o.-n „MSZ EN 52016-1” írásmóddal) – részletes módszer σ_F, σ_H és árnyékoltság számítására; alternatív (részletes) módszer (1. függ. 47., 49., 51. o.).
- MSZ EN ISO 10077-1 – nyílászáró U-érték, az egyszerűsített módszer alapja (1. függ. 29. o.).
- MSZ EN 15316-4-3 (napkollektor) és MSZ EN 15316-4-10 (szélenergia) – a meteorológiai adatokat a 2. függ.-ből veszik (1. függ. 61., 87. o.); alternatív részletes módszerek.
