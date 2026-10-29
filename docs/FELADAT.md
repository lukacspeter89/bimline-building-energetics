# Feladat: webes épületenergetikai számító- és tanúsítóprogram (WinWatt-alternatíva)

Te egy tapasztalt szoftverfejlesztő és épületenergetikai szakember vagy. A megrendelő Lukács Péter okleveles épületgépész mérnök, jogosult energetikai tanúsító (TÉ 07-52263), a BIMLine Gépész Kft. ügyvezetője. Egy **működőképes, webes épületenergetikai programot** kell építened. Ez kiváltja a WinWatt-ot: elkészíti a hőtechnikai és energetikai számítást, valamint az energetikai tanúsítványt, és előállítja az OÉNY (e-tanúsítás) feltöltő XML-jét. A felület, a dokumentáció és minden szöveg magyar nyelvű.

## A két legfontosabb követelmény (ebben a sorrendben)

1. **Jogszabály- és szabványhű számítás.** Minden számítási lépés a hatályos magyar jogszabályt és az abban hivatkozott szabványokat követi. Hogy a WinWatt mit csinál, csak másodlagos referencia. Ha a WinWatt logikája eltér a jogszabálytól vagy a szabványtól, **a jogszabály / szabvány nyer**. Az eltérést dokumentálni kell (`docs/ELTERESEK_WINWATT.md`). Egyetlen számot, táblázati értéket vagy képletet sem találhatsz ki: minden konstans és képlet mellett ott a forrás (jogszabályhely / szabvány fejezet, táblázat).
2. **A létező legegyszerűbb, leggyorsabb adatbevitel PC-n és telefonon egyaránt.** A program akkor ér valamit, ha egy családi ház teljes modellje gyorsabban felvihető, mint WinWattban, és a helyszíni bejárás adatai telefonon, egy kézzel, kesztyűben is rögzíthetők.

## 0. fázis – KUTATÁS (kódírás előtt, kötelező)

Kódot csak akkor írsz, ha ez a fázis kész, és Péter jóváhagyta a követelménymátrixot.

1. **Szerezd be és olvasd végig a hatályos, egységes szerkezetű szövegeket** (njt.hu, Magyar Közlöny, e-epites.hu, Lechner Tudásközpont):
   - 9/2023. (V. 25.) ÉKM rendelet az épületek energetikai jellemzőinek meghatározásáról – **minden melléklettel** (követelményértékek, számítási módszer, táblázatok, referenciaépület, közel nulla energiaigény, költségoptimalizált szint, nyári túlmelegedés, szerkezetminősítés, rendszerminősítés).
   - 176/2008. (VI. 30.) Korm. rendelet az épületek energetikai jellemzőinek tanúsításáról – a hatályos állapot, a tanúsítvány kötelező tartalma, besorolás, osztályhatárok.
   - Ellenőrizd, hogy az (EU) 2024/1275 irányelv (EPBD átdolgozás, átültetési határidő 2026. május 29.) hazai átültetése hozott-e új vagy módosított rendeletet, skálát vagy tanúsítvány-formátumot. Ha igen, az az irányadó. **Ne feltételezd, hogy a fenti rendeletek változatlanok; nézd meg a hatályos állapotot, és írd le a lekérés dátumát.**
   - A rendeletben hivatkozott szabványok, legalább: MSZ EN ISO 6946 (U-érték), MSZ EN ISO 13370 (talajjal érintkező szerkezetek), MSZ EN ISO 10211 / 14683 (hőhidak), MSZ EN ISO 10077-1 (nyílászárók), MSZ EN ISO 13789 (transzmissziós/szellőzési hőátbocsátás), MSZ EN ISO 13786 (dinamikus jellemzők), MSZ EN ISO 52000-1 / 52016-1 (energiamérleg), MSZ EN 12831-1 (hőszükséglet), MSZ EN 15316 sorozat (rendszerveszteségek), MSZ EN 16798 (szellőzés) – pontosan azt, és abban a változatban, amire a rendelet ténylegesen hivatkozik.
   - Az OÉNY e-tanúsítás feltöltő XML hivatalos dokumentációja és sémája (git.lechnerkozpont.hu/entan/dokumentacio, e-epites.hu „Elérhető az új e-tanúsítás”, general_cert.xml minta).
2. **Fizetős szabványszöveg:** ha nem éred el, ne rekonstruáld fejből. A rendeletben szereplő egyszerűsített módszert és táblázatot használd, a hiányt írd a `docs/NYITOTT_KERDESEK.md`-be, és kérdezd meg Pétert (neki van hozzáférése).
3. **Kimenetek a fázis végén:**
   - `docs/FORRASOK.md` – forrásjegyzék (cím, hatályossági állapot, URL, lekérés dátuma).
   - `docs/KOVETELMENYMATRIX.md` – minden számítási lépés, bemenet, konstans és ellenőrzés → pontos jogszabályhely / szabványpont. Ez a tesztek és a kód gerince.
   - `data/normativ/*.json` (vagy YAML) – a rendeleti táblázatok gépileg olvasható, verziózott formában (pl. hőtermelők Ck/qk,v, elosztási és tárolási veszteségek, segédenergiák, primerenergia- és CO₂-tényezők, követelményértékek, osztályhatárok, b-tényezők, éghajlati adatok). Minden rekordban: `forras`, `hatalyos_tol`, `megjegyzes`. A számítási kód soha nem tartalmaz bedrótozott normatív számot.
   - `docs/ELTERESEK_WINWATT.md` – ahol a WinWatt működése (lásd alább) eltér a jogszabálytól, ott a különbség, a helyes értelmezés és a hatás.

## Kiinduló tudás (nem normatív, csak segédlet)

- A `docs/winwatt/SKILL_winwatt.md` fájlban (Péter adja át a projekthez) részletesen le van írva a WinWatt projekt-XML formátuma (`WinWatt32Project`), a teljes szerkezettípus- és gépészeti kódtábla, a WinWatt GUI logikája, az import-viselkedés és az OÉNY `UploadRequest` szerkezete. Ezt használd a WinWatt-kompatibilis import/exporthoz és a szakmai fogalmak felméréséhez, de **normatív forrásnak ne tekintsd**.
- Péternek van egy korábbi Python/FastAPI számítómotorja („WinWatt-hibrid”: ISO 6946, ISO 13786, Glaser, EN 12831, 12 hónapos mérleg). Ha megkapod, auditáld a követelménymátrix alapján, és referencia-/teszteredményként használd. Vakon ne vedd át.

## Péter szakmai szabályai (ezek bele vannak tervezve a programba)

- Kizárólag a 9/2023. (V. 25.) ÉKM rendelet (ill. a kutatásban talált hatályos utódja) a követelmény-alap. A 7/2006. TNM rendeletre hivatkozni súlyos hiba; legfeljebb régi projekt olvasásakor jelenhet meg, figyelmeztetéssel.
- Ha a terv nem ad U-értéket, az ajtó és a kapu a rendeleti követelményértéken kerül fel (homlokzati vagy fűtött–fűtetlen közötti ajtó 1,4; kapu, pl. garázskapu 1,8; ipari és tűzgátló 2,0 W/m²K). **Minden más általunk felvett érték csak valós termék adatlapjából vagy teljesítménynyilatkozatából származhat.** A termékadatbázis minden rekordja forrásmezőt kap (gyártó, termék, dokumentum, dátum). „Tipikus”, becsült érték nem adható meg; a program ezt ki is kényszeríti (forrás nélkül nincs mentés, vagy „feltevés” jelölés kerül rá, ami a dokumentációban látszik).
- A rétegrendeket az építészeti terv jelölése szerint nevezzük el (pl. „R7./ Teherhordó falazat”).
- Mindig egy változatot kell előállítani. Ahol egy feltevés bizonytalan, a program kérdez, és a döntést naplózza; nem generál A/B változatokat.

## Számítási mag – funkcionális követelmények

A pontos lépéseket és képleteket a követelménymátrix adja; ez a lista a terjedelem:
- Rétegrendek U-értéke (ISO 6946), inhomogén rétegek, rögzítőelem- és fordított tető korrekció, hőhidak (vonalmenti Ψ katalógus és/vagy rendeleti egyszerűsített módszer), páradiffúzió, dinamikus jellemzők, hőtároló tömeg.
- Nyílászárók U-értéke Ug/Uf/Ψg alapján (ISO 10077-1), g-érték, árnyékolás.
- Talajjal érintkező padló és fal (ISO 13370) a tényleges A/P geometriából.
- Fűtetlen terek: b-tényező / túloldali hőmérséklet, az energetikai burokba tartozás egyértelmű kezelése.
- Geometria: helyiségek, szintek, burokfelület, fűtött térfogat, A/V, nettó alapterület.
- Fajlagos hőveszteség-tényező, nettó fűtési és hűtési energiaigény (a rendelet szerinti módszer: havi mérleg, ha az az előírt), nyári túlmelegedés.
- Gépészeti rendszerek: fűtés (több hőtermelő aránnyal, elosztás, tárolás, szabályozás, szivattyú), HMV (cirkuláció, tároló), szellőzés (hővisszanyerés, ventilátor), hűtés, beépített világítás (csak nem lakó funkciónál), megújulók (PV, napkollektor, hőszivattyú környezeti hője), exportált energia.
- Primerenergia (nem megújuló / megújuló), CO₂, megújuló részarány, összesített energetikai jellemző, besorolás, követelményteljesülés (alap, költségoptimalizált, közel nulla, jelentős felújítás), referenciaépület.
- Tanúsítási egység, zónák, több rendszer területarányos megosztása.
- Felújítási javaslatok (jó és kiváló szint) a rendelet szerint.
- Méretezési hőszükséglet (MSZ EN 12831-1) helyiségenként, mint gépészeti melléktermék.

## Adatbevitel – UX követelmények (második legfontosabb szempont)

Cél: egy 150 m²-es családi ház terv alapján **15 percen belül** felvihető legyen PC-n, a helyszíni bejárás adatai pedig telefonon, internet nélkül rögzíthetők.

**Általános elvek**
- Mobile-first, reszponzív. Telefonon egyoszlopos lépések, nagy (≥ 48 px) érintési célok, alsó navigáció és hüvelykujjzóna. PC-n több panel, táblázatos szerkesztés, teljes billentyűzetes vezérlés (Tab/Enter folyik, gyorsbillentyűk, parancspaletta: Ctrl+K).
- PWA, **offline működés** (IndexedDB), automatikus mentés minden mezőváltozáskor, visszavonás/újra. Nincs „mentés” gomb, és nem lehet adatot veszíteni.
- Magyar számformátum: tizedesvessző és tizedespont is elfogadott. Mértékegység a mező mellett, és a mező egyszerű kifejezést is elfogad (pl. `5,4*2,85-1,2*1,4`).
- Minden mezőnek van értelmes, forrással ellátott alapértéke vagy javaslata. Kötelező csak az, ami tényleg kell; a hiányzó adatokat egy élő „Hiányzik még” lista mutatja, ugrással a mezőhöz.
- Azonnali, mezőszintű validáció érthető magyar üzenettel, a WinWatt ellenőrző-listájánál jobb élő ellenőrzéssel (U-eltérés, levonandó felületek tájolásonként, burokba nem kerülő fűtetlen határolók, rendszer-területek összege, hőtermelő-arányok összege = 1, hiányzó fotók a tanúsítványhoz).
- Az eredmény (besorolás, fajlagos értékek, követelményteljesülés) bevitel közben élőben frissül egy mindig látható összesítő sávban.

**Gyorsító megoldások (mind kötelező)**
- **Projekt-varázsló:** épülettípus, kor, cím (hrsz), szintek → kész alap-modellváz.
- **Rétegrend-építő:** termékadatbázisból kereséssel (gyártó/termék/λ, forrással), húzással rendezhető rétegek, élő U és megfelelés a követelményhez; sablonok és „másolás projektből”.
- **Helyiségbevitel falankénti logikával:** méret + tájolás + falhosszak; nyílászáró hozzáadása a falhoz, a levonandó felület automatikus; „következő helyiség” egy gombbal; másolás és tükrözés; egyformák szorzóval.
- **Kontúr-rajzolás:** az alaprajz vázlatosan bekattintható (rács, méretbeírás). Ebből a program számolja a falakat, tájolásokat, kerületet és az ISO 13370 A/P értékét; a födémek és padlók automatikusan keletkeznek, az egyes szinteken a helyiségekhez rendelve.
- **Import:** WinWatt XML (a SKILL alapján), és ha a kutatás után reális, DXF/IFC alaprajz-kontúr. Export: WinWatt XML, saját JSON.
- **Helyszíni mód telefonon:** fotó kategóriával (első lap / homlokzat / hőleadó / nyílászáró / hőtermelő / megújuló), adattábla-fotó a gépészeti eszközről, jegyzet, diktálás, GPS és dátum a helyszíni szemléhez. Az adatok a projekthez szinkronizálódnak.
- **Gépészet egy képernyőn:** „milyen fűtésed van?” jellegű, kérdés-alapú választó (pl. „levegő-víz hőszivattyú, padlófűtés, puffer a fűtött térben”). Ebből a program a rendeleti táblák alapján tölti ki a részletes paramétereket, amelyek kibontva szerkeszthetők és forrással látszanak.
- **Adminisztráció:** a megrendelő, a tanúsító (Péter adatai profilból) és az épületadatok egyszer kerülnek felvitelre. A tanúsítványhoz kötelező mezők (építés éve, cél, funkció, védettség stb.) a varázslóban kérdezve.

## Kimenetek

- Energetikai tanúsítvány és számítási dokumentáció PDF-ben, a 176/2008 (ill. a hatályos utód) szerinti tartalommal, a rétegrendek nevével és a feltevések jelölésével.
- **OÉNY e-tanúsítás feltöltő XML (`UploadRequest`)** a hivatalos séma szerint, beágyazott fotókkal és PDF-fel. A program exportálás előtt validál a séma szerint, és keresztellenőrzi a számított értékekkel (a SKILL 3. fejezete szerinti ellenőrzések).
- Engedélyezési terv energetikai munkarésze (követelményigazolás) külön nyomtatási sablonnal.
- WinWatt projekt-XML export, hogy Péter a WinWatt-tal is keresztellenőrizhessen.

## Ellenőrzés és tesztelés (kész csak akkor, ha ez zöld)

- A számítási mag tiszta, mellékhatásmentes könyvtár, a felülettől függetlenül. Minden követelménymátrix-sorhoz van legalább egy unit teszt, amely a forrást is megnevezi.
- **Kézi kontrollpéldák:** a szabványok és a rendelet mintapéldái, illetve néhány kézzel végigszámolt, dokumentált eset (egy fal U-értéke, egy ISO 13370 padló, egy egyszerű doboz-épület teljes mérlege).
- **Golden tesztek:** Péter valós projektjei (WinWatt-exportok és a hozzájuk tartozó OÉNY XML-ek). Importálva le kell futniuk, az eredményeket össze kell vetni. Ahol eltérés van, azt a követelménymátrix alapján meg kell indokolni („a WinWatt itt X-et csinál, a rendelet Y-t ír elő”); ami nem indokolható, az hiba.
- E2E tesztek (Playwright) telefon- és asztali nézetben a fő bevitelfolyamatra; az időmérés a 15 perces célhoz kerül a tesztriportba.
- Akadálymentesség (WCAG 2.1 AA) és Lighthouse PWA-ellenőrzés.

## Technikai keret

- Frontend: TypeScript, React (Vite), PWA, IndexedDB (pl. Dexie). Kiforrott, akadálymentes UI-komponenskészlet, nagy érintési célokkal.
- Számítási mag: TypeScript csomag (`packages/calc-core`), amely böngészőben és Node-ban is fut. Így offline, szerverköltség nélkül számol. A normatív adatok a `data/normativ` mappából kerülnek betöltésre, verziózva.
- Exportok (PDF, XML) a kliensen készülnek. Szerver csak opcionális szinkronhoz és több eszköz közötti megosztáshoz kell; az első verzió szerver nélkül is teljes értékű.
- Monorepo, CI-ben lint + típusellenőrzés + tesztek, `README.md` és `docs/` magyarul.

## Munkarend

1. 0. fázis: kutatás → `FORRASOK.md`, `KOVETELMENYMATRIX.md`, `data/normativ`, `NYITOTT_KERDESEK.md`. **Itt megállsz, és Péter jóváhagyását kéred.**
2. Számítási mag + tesztek (először a hőtechnika, aztán a mérleg, aztán a rendszerek), golden tesztek a WinWatt-exportokkal.
3. Adatmodell + bevitel UX (először a telefonos helyszíni mód és a PC-s gyors bevitel), élő összesítő és ellenőrzések.
4. Kimenetek: PDF, OÉNY XML, WinWatt XML.
5. Minden fázis végén rövid demó-forgatókönyv és a nyitott kérdések listája.

Szabályok: ha egy szakmai kérdést a források nem döntenek el egyértelműen, kérdezz, ne feltételezz. Minden feltevés kerüljön a naplóba és a felhasználói felületen is jelölve. Egy változatot építs, ne alternatívákat. Ha egy WinWatt-szokás és a jogszabály ütközik, a jogszabályt kövesd, és dokumentáld.
