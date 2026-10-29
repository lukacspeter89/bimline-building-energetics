# Forrásjegyzék

Lekérés dátuma (minden tételnél, ha nincs külön jelölve): **2026-10-29**.
A letöltött eredeti fájlok a `docs/forrasok/` mappában vannak (SHA-256 alább), így a hivatkozott szöveg később is visszakereshető.

## 1. Jogszabályok (normatív)

| # | Forrás | Hatályos időállapot | URL | Helyi másolat |
|---|--------|---------------------|-----|---------------|
| F-01 | **9/2023. (V. 25.) ÉKM rendelet** az épületek energetikai jellemzőinek meghatározásáról, 1–8. melléklettel | **2023.11.02.** (a lekérés napján hatályos, egyetlen időállapot a 2023.11.01-i hatálybalépés óta) | https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X | `docs/forrasok/jogszabaly/9_2023_EKM_2023-11-02.txt` (szöveg), a 2., 3. és 8. melléklet PDF-ként, az 1. melléklet 2. pontjának és az 5. melléklet 1.2. pontjának képletei PNG-ként |
| F-02 | **176/2008. (VI. 30.) Korm. rendelet** az épületek energetikai jellemzőinek tanúsításáról, 1–5. melléklettel | **2026.01.06.** (utolsó módosítás: 436/2025. (XII. 23.) Korm. rendelet 6. §, a 9. § (2) hatályon kívül helyezése) | https://njt.jog.gov.hu/jogszabaly/2008-176-20-22 | `docs/forrasok/jogszabaly/176_2008_Korm_2026-01-06.txt`, az 1. melléklet két PDF-je (tanúsítvány elemei, képjelmagyarázat) |

**Megállapítások a hatályos állapotról**
- A 9/2023. ÉKM rendelet 2023.11.02. óta nem módosult (njt, 2026-10-29). A 7/2006. (V. 24.) TNM rendeletet csak a 2023.10.31-ig bejelentett/kérelmezett építési tevékenységekre kell alkalmazni (9/2023. ÉKM 10. § (2)); a program a TNM-et csak régi projekt olvasásakor, figyelmeztetéssel jeleníti meg.
- A 176/2008. Korm. rendelet besorolási skálája a 2023-as (A+++2023 … I2023) skála (3. melléklet), a 200/2023. (V. 25.) Korm. rendelettel megállapított szöveg szerint.
- **EPBD-átdolgozás ((EU) 2024/1275, átültetési határidő 2026.05.29.)**: a lekérés napján sem a 9/2023. ÉKM, sem a 176/2008. Korm. rendelet nem hivatkozik a 2024/1275 irányelvre (176/2008 11. § (3) csak a 2002/91/EK, 2006/32/EK, 2010/31/EU és 2018/844 irányelvet nevezi meg), és nem találtam új épületenergetikai vagy tanúsítási rendeletet, új skálát, illetve új tanúsítványformátumot. Webes keresés (2026-10-29): a MEHI 2026. februári útmutatója és a 2026. márciusi szakmai hírek szerint a hazai átültetés még folyamatban van. A 122/2015. (V. 26.) Korm. rendelet (az energiahatékonysági törvény végrehajtása) már hivatkozik a 2024/1275 irányelvre, de az nem a számítási módszert vagy a tanúsítványt szabályozza. **Ez a megállapítás a lekérés napjára érvényes**; lásd NYITOTT_KERDESEK.md K-003.

## 2. A 9/2023. ÉKM 7. § (1) a) szerinti számítási módszer (normatív, ha a tervező ezt választja)

A rendelet 7. § (1) a) pontja szerint az energetikai jellemzőket „az energiapolitikáért felelős miniszter által vezetett minisztérium honlapján elérhető számítási módszer” szerint (vagy a 6. mellékletnek megfelelő, egyenértékű módszerrel) kell meghatározni. A program ezt a módszert követi; az új változatokról a miniszter a Hivatalos Értesítőben közleményt tesz közzé (7. § (4)), és a közléstől számított 90 nap után kell alkalmazni (7. § (5)).

| # | Forrás | Állapot | URL | Helyi másolat |
|---|--------|---------|-----|---------------|
| F-03 | Energiaügyi Minisztérium: „Épületek energetikai jellemzőinek meghatározása – számítási módszer”, **1. Függelék – Számítási módszer** (91 oldal) | közzétéve 2023.07.27. (dokumentumtár-bejegyzés); PDF létrehozva 2023.09.18. | https://kormany.hu/dokumentumtar/epuletek-energetikai-jellemzoinek-meghatarozasa-szamitasi-modszer-2 (fájl: https://kormany.hu/application/documents/4221bd44-f937-4d4c-b4df-a25bc38c8f22/download) | `docs/forrasok/modszer/9_2023_EKM_szamitasi_modszer_1_fuggelek.pdf` (+ `.txt` szövegkivonat) |
| F-04 | ugyanott, **2. Függelék – Számítási módszer referenciaértékei** (30 oldal: éghajlati adatok, profilok, fűtőérték/égéshő, nyílászárók, árnyékolók) | mint fent | fájl: https://kormany.hu/application/documents/1a3d32df-3de9-4a73-a152-53ef05c6252a/download | `docs/forrasok/modszer/9_2023_EKM_szamitasi_modszer_2_fuggelek.pdf` (+ `.txt`) |
| F-05 | ugyanott, **Meteo háttéradat** (630 oldal, órai bontású referenciaév: hőmérséklet, nedvesség, szél, sugárzás 8 tájolásra és 4 dőlésszögre) | PDF létrehozva 2023.07.27. („Meteo_hatteradat.xlsx”) | fájl: https://kormany.hu/application/documents/8d9b61f8-ddc6-4143-9707-450dfbc23a39/download | nincs a repóban (4,8 MB); SHA-256 alább. A részletes (órai) módszerhez kell, később gépileg kinyerendő. |

A webes keresés (2026-10-29) nem talált a módszer újabb változatáról szóló hivatalos-értesítőbeli közleményt; a kormany.hu oldalon egyetlen változat érhető el. Lásd K-004.

## 3. Szabványok

A 9/2023. ÉKM rendelet a következő szabványokat nevezi meg közvetlenül: MSZ EN 16798-1 (1. mell. 3.1.1., ajánlott), MSZ EN 16798-3 (3.5.1.1.), MSZ EN 13053:2006 (3.5.1.2.), MSZ EN 12237 (3.5.2.1.), MSZ EN ISO/IEC 17050 (3.5.2.1.). A 6. melléklet általánosan az MSZT ICS 27 és ICS 91 szakterület érvényes szabványait engedi részletes módszerként. A 176/2008. Korm. rendelet az MSZ EN 15459-et nevezi meg (7. § (3) a)). A számítási módszer (F-03) által hivatkozott szabványok listája és az, hogy melyik kötelező és melyik csak alternatív részletes módszer, a `KOVETELMENYMATRIX.md`-ben, a hivatkozó sornál szerepel.

**A szabványok szövege fizetős, nem érhető el ebből a környezetből.** A program elsődlegesen a módszer egyszerűsített eljárásait valósítja meg (ezek a módszer szövegében teljesek); ahol a módszer csak szabványra utal és saját eljárást nem ad, az a NYITOTT_KERDESEK.md-be került. Szabványszöveget fejből nem rekonstruálunk.

## 4. OÉNY e-tanúsítás (feltöltő XML)

| # | Forrás | Állapot | URL | Helyi másolat |
|---|--------|---------|-----|---------------|
| F-06 | Lechner Tudásközpont – `entan/dokumentacio` git-tár: README, szótár (`dictionary.md`), validációs szabályok (`validationRules.md`, ill. az elírt nevű régebbi `validtationRules.md`), verziókülönbségek (`differentByVersions.md`, legutóbbi: v3.0.4859), minta `general_cert.xml` / `general_cert.json`, felhasználói útmutató PDF | commit `507735b0d1ab3f7b130fc1fef56e65e6a3bac552` (2026-09-28) | https://git.lechnerkozpont.hu/entan/dokumentacio | `docs/forrasok/entan/` (md + minta XML/JSON; a PDF-ek és a 1 MB-os `functional_unit_full_data.json` nincsenek bemásolva) |

**XSD séma nincs a tárban**, a formátumot a minta XML/JSON, a szótár és a validációs szabályok írják le. Teszt-feltöltőfelület: https://oeny-nuat.e-epites.hu/oeny/e-tanusitas/. Lásd K-005.

## 5. Nem elért források

- `e-epites.hu` és `njt.hu` (régi cím): a munkakörnyezet hálózati szabálya nem engedi (a jogszabályokat az `njt.jog.gov.hu` adta). Az e-epites.hu-n közzétett **éves távhő-súlyozótényezők** (9/2023. ÉKM 8. § (1)) emiatt nincsenek letöltve – lásd K-006.
- `net.jogtar.hu`: nem kellett (az njt.jog.gov.hu hivatalos forrás).

## 6. Nem normatív segédlet

- **Segédlet az Épületenergetikai Tanúsítói Jogosultság megszerzéséhez a 9/2023 ÉKM rendelet alapján** (Dr. Csoknyai Tamás, Dr. Szalay Zsuzsa, Dr. Nagy Balázs, Dr. Horváth Miklós: Alkalmazott Épületenergetika c. kézikönyv alapján; szerk. Nagy Péter; Budapest, 2024. január). Kamarai kiadás, **nem jogszabály**. Péter Google Drive-ján (`Felkeszulesi_segedlet_TE_2024_01.pdf`, 2026-10-29). Felhasználás: kidolgozott mintapéldák a tesztekhez és értelmezési segítség. Ellentmondás esetén a jogszabály és a 7. § (1) a) szerinti módszer az irányadó; az eltérést a DONTESEK.md rögzíti (Péter, 2026-10-29).
- Péter Drive-mappájában lévő további anyagok: a két rendelet CompLex-nyomata (9/2023: „Hatály: 2023.XI.2. –”, 176/2008: „Hatály: 2026.I.6. –”) – ugyanaz az időállapot, mint az F-01 és F-02; az 1. és 2. Függelék és a Meteo PDF – bájtra azonos az F-03 … F-05-tel. A „9_2023 ÉKM órai havi adatsorok.xlsx” a Meteo adatsor feldolgozása; Péter kérésére figyelmen kívül hagyjuk (2026-10-29), az órai adat forrása az F-05.

- `docs/winwatt/SKILL_winwatt.md` – a WinWatt projekt-XML és az OÉNY `UploadRequest` leírása (Péter, 2026-10-29). Csak import/export-kompatibilitáshoz és a WinWatt-eltérések felméréséhez.
- `docs/FELADAT.md` – a projekt feladatleírása.

## 7. Ellenőrzőösszegek (SHA-256)

```
4250d2c7c82a62915771079b70b9b8b4ca599690272e29bb662b1c39f7d71276  jogszabaly/9_2023_EKM_2023-11-02.txt
858d975b0668126e514e09c7068df22d6e3bf1bf28833cb124cd67bf28f7bfdb  jogszabaly/9_2023_EKM_2_melleklet.pdf
144db9fb7228af4f838f7cff569044d677404a3b71132a77aee622d73b82cddc  jogszabaly/9_2023_EKM_3_melleklet.pdf
a9db40dcdb1121db6a9f9093291c2ce5384b1b5c31ac4fc34851c58b7b9878fb  jogszabaly/9_2023_EKM_8_melleklet.pdf
f116df35199c3429d08f22df798d52dd0624c6547304ca45d3efaacbaf9b755d  jogszabaly/9_2023_EKM_1_melleklet_2pont_keplet.png
2e918da3c405028f872fb4b24fcb7670bba15120aa6ba5cf89f6773af0f21e46  jogszabaly/9_2023_EKM_5_melleklet_1_2_Enren.png
edbbfd38ff718e62ff0f548f65b07310542a876ecc833b1f1670f108cb248436  jogszabaly/9_2023_EKM_5_melleklet_1_2_ECO2.png
a50e92d7a20a64c63c29ebd68ec4d0a7ddde7733114da1c3f07d48bf4c8ddb1f  jogszabaly/176_2008_Korm_2026-01-06.txt
314708741ca8a51d7b918295a8415a039c60c8b464485e183ebc9ee14ac537fd  jogszabaly/176_2008_Korm_1_melleklet_1_tanusitvany_elemei.pdf
daafc79908f50231d2056d476a7b34b7b9ab3c86353d260755f47f761db37511  jogszabaly/176_2008_Korm_1_melleklet_2_kepjelmagyarazat.pdf
22e0e6ade5907e4c722b392584e80b1b056c0a73ea5b9be34ffde693621b0e50  modszer/9_2023_EKM_szamitasi_modszer_1_fuggelek.pdf
a665c01b1562646b1ad347af2132a434606376daf99e644e96e59d787f8ed976  modszer/9_2023_EKM_szamitasi_modszer_2_fuggelek.pdf
dfb4cbe5fc97c87b9b8291e915272776d98fae5f5404802400d5c4097a064494  (nincs a repóban) Meteo háttéradat PDF, F-05
```

**A TE segédlet feldolgozása (2026-10-29):** a Drive-connector a PDF szövegét csak a 6.2.4 pontig (kb. 81. oldal, a 232-ből) adta vissza. Ebben a részben kidolgozott, tesztnek alkalmas számpélda nincs. Az értelmezései közül a programban figyelembe vett pontok (mind összhangban a módszerrel): talajon fekvő padlónál B = A/(0,5P) a kondicionált tér padlójára; ismeretlen talaj 2. típus; b_tél október–április, b_nyár május–szeptember; a megújuló részarány csak informatív indikátor. A segédlet saját belső ellentmondása (4.5. ábra: „fűtött” a képlet „fűtetlen” szövegével szemben) a programot nem érinti, a módszer szövegét követjük. A 82. oldaltól a PDF-et más úton kell beolvasni.
