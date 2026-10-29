# Nyitott kérdések

Lekérés dátuma: 2026-10-29

## K-001 – A jogszabályszövegek nem érhetők el ebből a futtatási környezetből (BLOKKOLÓ)

A 0. fázishoz (kutatás) a hatályos, egységes szerkezetű jogszabályszövegeket kell elolvasni. A felhőben futó
munkakörnyezet hálózati szabályai ezeket a hosztokat nem engedik:

- `njt.hu`, `njt.jog.gov.hu` (Nemzeti Jogszabálytár) – a lekérés DNS-hibával elutasítva
- `net.jogtar.hu`, `magyarkozlony.hu`, `e-epites.hu`, `git.lechnerkozpont.hu` – a proxy 403-mal elutasította

Emlékezetből normatív értéket, táblázatot vagy képletet nem írunk be (FELADAT.md, 1. követelmény), ezért a
`KOVETELMENYMATRIX.md` és a `data/normativ/` addig nem készül el, amíg a forrás nincs meg.

**Két lehetséges megoldás (Péter dönt):**
1. A környezet hálózati beállításaiban (Network access → Allowed domains) engedélyezni kell:
   `njt.jog.gov.hu`, `njt.hu`, `magyarkozlony.hu`, `e-epites.hu`, `lechnerkozpont.hu`, `git.lechnerkozpont.hu`,
   `kormany.hu`, `eur-lex.europa.eu`.
   Leírás: https://code.claude.com/docs/en/cloud-environments#network-access
2. Péter feltölti a szövegeket PDF-ként vagy HTML-ként (lásd `FORRASOK.md`, „Beszerzendő” rész).

## K-002 – Fizetős szabványok

A szabványszövegekhez (MSZ EN ISO 6946, 13370, 10077-1, 13789, 13786, 52016-1, MSZ EN 12831-1, MSZ EN 15316)
Péternek van hozzáférése. Melyikekre lesz szükség, az a rendelet hivatkozásaiból derül ki, a K-001 megoldása után.

## K-003 – Golden tesztek bemenetei

Kérjük a WinWatt-exportokat (`WinWatt32Project` XML), a hozzájuk tartozó OÉNY `UploadRequest` XML-eket és a
WinWatt-hibrid Python/FastAPI motor forráskódját (auditáláshoz, referenciának).
