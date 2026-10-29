# BIMLine épületenergetika

Webes épületenergetikai számító- és tanúsítóprogram (WinWatt-alternatíva): hőtechnikai és energetikai számítás,
energetikai tanúsítvány, OÉNY e-tanúsítás feltöltő XML. A feladatleírás: `docs/FELADAT.md`.

## Állapot

**0. fázis (kutatás) – kész, Péter jóváhagyására vár.** Kód a követelménymátrix jóváhagyása után készül.

| Dokumentum | Tartalom |
|------------|----------|
| `docs/FORRASOK.md` | Forrásjegyzék: hatályos jogszabályok (9/2023. ÉKM, 176/2008. Korm.), a hivatalos számítási módszer, az OÉNY-dokumentáció; hatályossági állapot, URL, lekérési dátum, SHA-256 |
| `docs/KOVETELMENYMATRIX.md` | 804 sor: minden számítási lépés, bemenet, konstans és ellenőrzés → jogszabályhely / módszer fejezet, egyenlet, táblázat, oldal |
| `docs/NYITOTT_KERDESEK.md` | A. döntést igénylő kérdések javaslattal; B. a forrásdokumentumok anomáliái oldalszámmal |
| `docs/ELTERESEK_WINWATT.md` | Hol tér el a WinWatt (vagy a WinWatt-os munkamód) a jogszabálytól, és hol egyezik |
| `docs/forrasok/` | A letöltött eredeti források (szöveg, PDF) |
| `docs/winwatt/SKILL_winwatt.md` | WinWatt projekt-XML és OÉNY `UploadRequest` leírás (nem normatív) |
| `data/normativ/rendelet/` | A rendeletek táblázatai gépileg olvasható formában |
| `data/normativ/modszer/` | A számítási módszer 1. és 2. Függelékének összes táblázata és konstansa |

Minden normatív táblázat tartalmazza a `forras`, `hatalyos_tol` és `megjegyzes` mezőt. A számítási kód normatív
számot csak ezekből a fájlokból olvashat.
