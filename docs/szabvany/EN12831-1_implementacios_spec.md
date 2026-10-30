# MSZ EN 12831-1:2017 – implementációs specifikáció (HeatLoad CAD)

Programozói leírás a szabvány teljes számítási módszeréről (6–9. fejezet, A–G melléklet), a képernyőfelvétel minden oldala alapján. A magyarázó szöveg saját megfogalmazás, nem a szabvány fordítása; a **képletek, egyenletszámok és az alapérték-táblázatok pontosan** a szabvány szerint szerepelnek, a táblákhoz JSON-kulcsjavaslattal.

**Jelölések:**
- `[?]` – bizonytalan leolvasás vagy a szabványban lévő (valószínű) sajtóhiba – kódolás előtt nézd meg az eredeti oldalt
- `[javaslat]` / `[értelmezés]` – programozói döntés, nem a szabvány előírása
- Adatforrás-prioritás minden bemenetnél: **terv/mérés → nemzeti melléklet (A) → B melléklet alapérték**

## Tartalom
1. A rész – 6.1–6.3.2: kimenetek, bemenő adatok (Table 6), tervezési hőterhelés, transzmisszió
2. B rész – 6.3.3: szellőzési hőveszteség
3. C rész – 6.3.3.7 vége, 6.3.4–6.3.8: felfűtés, időállandó, külső méretezési hőm., magas helyiségek
4. D rész – 7–9. fejezet: egyszerűsített módszerek, méretezési ellenőrzések
5. E rész – A melléklet (nemzetileg megadandó tételek) és B melléklet alapértékei
6. F rész – B.4 vége, C, D (θ_u), E (talaj), F (felfűtés), G melléklet


---

## 6 Szabványos módszer – helyiségek, épületrészek (BE) és épületek hőterhelése

Előzmény (4. táblázat, 20. o.): a program fő módszere a 6. fejezet (szabványos módszer); a 7. (egyedi helyiség, egyszerűsített) és 8. (épület, egyszerűsített) módszer csak lakó/hasonló rendeltetésű, meglévő, természetes szellőzésű épületekre használható, és nem válthatja ki a 6. fejezetet, ha a hőtermelést ÉS a hőleadást is érintő nagy beavatkozás történik.

## 6.1 Kimeneti adatok

Állandósult (steady-state) számítás, belső és külső méretezési feltételekkel.

| Szimbólum | Jelentés | Egység | Felhasználás |
|---|---|---|---|
| Φ_HL,i | fűtött helyiség méretezési hőterhelése | W | hőleadók, elosztás méretezése |
| Φ_HL,BE | épületrész (pl. lakás) méretezési hőterhelése | W | hőtermelő méretezése; bemenet a hőtermelési veszteségekhez (M3-2, M3-4 modulok) |
| Φ_HL,build | teljes épület méretezési hőterhelése | W | mint fent |

## 6.2 Bemeneti adatok (6. táblázat, tömörítve)

Forrás-prioritás jelölése: „terv” = épületadat/terv/mérés/szellőzési koncepció; „NA A.x” = nemzeti melléklet az A.x szerint; „B.x” = informatív alapérték a B.x szerint. A lánc balról jobbra csökkenő prioritású: a program az első rendelkezésre álló értéket használja.
Indexek: i = fűtött helyiség, z = szellőzési zóna, k = épületszerkezet, j = másik helyiség (átáramlás forrása).

| Szimbólum | Rövid jelentés | Egység | Forrás-prioritás |
|---|---|---|---|
| A_env,i | helyiség (i) burokfelülete (külső levegővel / fűtetlen térrel érintkező szerkezetek összfelülete) | m² | terv/mérés |
| A_env,build | épület burokfelülete | m² | terv/mérés |
| A_env,z | zóna (z) burokfelülete | m² | terv/mérés |
| A_k | szerkezet (k) felülete | m² | terv/mérés |
| c_eff | épület térfogatfajlagos hőtároló képessége | Wh/(m³·K) | terv → NA A.2.7 → B.2.7 |
| c_p | levegő fajhője állandó nyomáson | Wh/(kg·K) | terv → NA A.2.8 → B.2.8 |
| f_U,k | korrekció az U-számításban nem figyelembe vett szerkezeti/meteorológiai hatásokra | – | NA A.2.2 → B.2.2 |
| f_qv,z | zóna térfogatáram-tényezője; opcionális (természetes szellőzésű, légtömör, ATD nélküli zónánál nem kell) | – | NA A.2.12 → B.2.12 |
| f_dir,z | zóna tájolási tényezője | – | NA A.2.15 → B.2.15 |
| f_i-z | helyiség min. térfogatáramainak (q_v,min,i) és a teljes zóna eredő térfogatáramának aránya | – | NA A.2.9 → B.2.9 |
| f_fac,z | kitett homlokzatok számának korrekciója (EN ISO 13789); opcionális, csak kiegyenlítetlen szellőzésnél | – | NA A.2.16 → B.2.16 |
| f_θann | külső hőm. éves ingadozásának korrekciója (talaj) | – | NA A.2.3 → B.2.3 |
| G_θ,Ref | referenciahely hőmérséklet-gradiense (pozitív = magassággal nő) | K/m | NA A.4.1 (nincs informatív alapérték) |
| h_Build | épület átlagos tengerszint feletti magassága | m | terv/telekadat |
| h_Ref | referenciahely (ország/régió) átlagos tengerszint feletti magassága | m | NA A.4.1 (nincs informatív alapérték) |
| h_i | helyiség átlagos belmagassága; csak ha ≥ 4 m | m | terv/mérés |
| h_occup,i | tartózkodási zóna magassága; csak ha belmagasság ≥ 4 m | m | NA A.2.6 → B.2.6 |
| k_T | meredekség – külső méretezési hőm. korrekciója az épület időállandója szerint | K/h | NA A.4.1 → B.4.1 |
| n_min,i | minimális légcsereszám (levegőminőség/higiénia/komfort) | h⁻¹ | terv/szellőzési koncepció → NA A.2.11 → B.2.11 |
| q_env,50 (n_50) | légáteresztés (ill. légcsereszám) 50 Pa-on, ATD-k zárva; épülettulajdonság | m³/(m²·h) (h⁻¹) | terv / légtömörség-mérés (EN ISO 9972) → NA A.2.10 → B.2.10 |
| q_v,ATD,design,i | helyiség ATD-inek méretezési térfogatárama; csak ATD esetén | m³/h | terv → NA A.2.13 → B.2.13 |
| q_v,ATD,design,z | zóna ATD-inek méretezési térfogatárama; csak ATD esetén | m³/h | terv → NA A.2.13 → B.2.13 |
| q_v,comb,i | helyiségből elszívott, a szellőzőrendszer q_v,exh,i-jében nem szereplő légáram (pl. égési levegő, nyílt égésterű készülék); opcionális | m³/h | terv |
| q_v,exh,i | elszívott légáram (gépi elszívásnál) | m³/h | terv |
| q_v,open,i | nagy nyílásokon beáramló külső levegő; opcionális | m³/h | terv → NA A.2.17 → B.2.17 |
| q_v,sup,i | befújt légáram (gépi befúvásnál) | m³/h | terv |
| q_v,transfer,ij | j-ből i-be átáramló levegő; opcionális | m³/h | terv |
| U_equiv,k | talajjal érintkező szerkezet egyenértékű hőátbocsátási tényezője | W/(m²·K) | NA A.2.3 → B.2.3 / E melléklet |
| U_k | szerkezet hőátbocsátási tényezője (EN ISO 6946 tömör; EN ISO 10077-1 nyílászáró; ETA) | W/(m²·K) | terv → NA A.4.3 → B.4.3 |
| V_i | helyiség belső térfogata | m³ | terv/mérés |
| V_e | épület külső (bruttó) térfogata | m³ | terv/mérés |
| v_leak,z | zóna nyomáskitevője; csak ATD-s zónában | – | NA A.2.14 → B.2.14 |
| Δp_ATD,design,z | ATD-k méretezési nyomáskülönbsége; csak ATD-s zónában | Pa | terv → NA A.2.13 → B.2.13 |
| ΔU_TB | hőhidak átalány-pótléka | W/(m²·K) | NA A.2.1 → B.2.1 (részletesebb hőhídkezelés: E melléklet [?], ha nemzeti szabály nem tiltja) |
| Δθ_e,T,0 | külső méretezési hőm. korrekció alapértéke (időállandó) | K | NA A.4.1 → B.4.1 |
| Δθ_e,T,max | ugyanennek felső korlátja | K | NA A.4.1 → B.4.1 |
| Δθ_e,T,min | ugyanennek alsó korlátja | K | NA A.4.1 → B.4.1 |
| η_rec,z | zóna hővisszanyerési hatásfoka méretezési külső állapotban; ha ilyenkor bypass megy → 0 | – | terv |
| Φ_gain,i | méretezési külső állapotban fellépő hőnyereség | W | NA A.2.19 → B.2.19 |
| φ_hu,i | fajlagos felfűtési többletteljesítmény (szakaszos fűtés után) | W/m² | NA A.2.18 → B.2.18 / F melléklet |
| θ_e,m | éves átlagos külső hőmérséklet | °C | NA A.4.1 (nincs informatív alapérték) |
| θ_e,Ref | referenciahely külső méretezési hőmérséklete | °C | NA A.4.1 (nincs informatív alapérték) |
| θ_exh,z | zónából elszívott levegő hőmérséklete; csak gépi elszívásnál | °C | terv → becslés helyiségértékekből (6.3.3.7, (38)) |
| θ_int,i | helyiség belső méretezési hőmérséklete | °C | terv → NA A.4.2 → B.4.2 |
| θ_transfer,ij | j-ből átáramló levegő hőmérséklete; opcionális | °C | belmagasság < 4 m: = θ_int,j; ≥ 4 m: = θ*_int,j |
| θ_rec,z | befújt levegő hőm. hővisszanyerés után, aktív előfűtés NÉLKÜL (passzív, pl. talajhőcserélő beszámít); csak befúvás+elszívás esetén | °C | terv → 6.3.3.7, (37) |
| θ*_int,k | szerkezet (k) átlagos belső felületi hőmérséklete | °C | belmagasság < 4 m: = θ_int,i; ≥ 4 m: 6.3.8.2 |
| θ*_int,i | helyiség átlagos belső léghőmérséklete | °C | belmagasság < 4 m: = θ_int,i; ≥ 4 m: 6.3.8.3 |
| θ_u | fűtetlennek tekintett szomszédos épületrész hőmérséklete | °C | NA A.2.5 → B.2.5 / D melléklet |
| ρ | levegő sűrűsége | m³/kg [?] (nyilvánvalóan kg/m³) | terv → NA A.2.8 → B.2.8 |

Megvalósítási megjegyzések:
- A_env és A_k külső vagy belső méretre is vonatkozhat. Burokfelületnél (szellőzési veszteség) ugyanarra a méretkonvencióra kell vonatkoznia, mint a q_env,50 mérésnek/alapértéknek; transzmissziós H-számításnál ugyanarra, mint az U-értékeknek. Ha ismeretlen: külső méret (mindig elfogadható, biztonsági oldal).
- Magasság-elágazás: `if h_i < 4 m: θ*_int,i = θ*_int,k = θ_int,i, θ_transfer,ij = θ_int,j; else: 6.3.8.2/6.3.8.3 szerint` (h_i és h_occup,i csak ekkor szükséges bemenet).
- Az f_GW,k (talajvíz-korrekció) a (8)-ban szerepel, de a 6. táblázatban nincs felsorolva [?] – forrása feltehetően E melléklet / NA.

## 6.3 Számítási eljárás

### 6.3.1 Méretezési hőterhelés

Számítási sorrend: (1) minden helyiségre H_T,ix tagok (6.3.2) → Φ_T,i; (2) szellőzés (6.3.3) zónánként/helyiségenként; (3) opcionális Φ_hu,i, Φ_gain,i; (4) aggregálás BE-re és épületre. A BE/épület szint NEM a helyiség-Φ_HL,i-k összege: transzmisszióból csak a kifelé (közvetlen/közvetett), illetve BE-nél a más BE felé menő tagokat összegzi, a szellőzést zóna/épület szinten veszi.

#### 6.3.1.1 Épület (build)

```
Φ_HL,build = Σ_i (Φ_T,ie + Φ_T,iae + Φ_T,ig) + Φ_V,build + Σ_i (Φ_hu,i) − Σ_i (Φ_gain,i)      (1)
```
- Φ_HL,build – épület méretezési hőterhelése [W]
- Σ_i(Φ_T,ie + Φ_T,iae + Φ_T,ig) – összes fűtött helyiség közvetlen/közvetett külső transzmissziós vesztesége (6.3.2) [W]; a helyiségek egymás közti (ia) és BE-k közti (iaBE) tagjai kimaradnak
- Φ_V,build – teljes épület szellőzési hővesztesége (6.3.3) [W]
- Σ_i(Φ_hu,i) – egyidejűleg, méretezési külső állapotban fellépő felfűtési teljesítmények; opcionális [W]
- Σ_i(Φ_gain,i) – egyidejű hőnyereségek; opcionális, nemzeti szabályozás szerint [W]

Felfűtési teljesítmény a hőtermelő méretezésénél csak az egyidejűleg fellépő részben vehető figyelembe (túlméretezés elkerülése); erősen ajánlott a megrendelővel kifejezetten egyeztetni → a programban kapcsolóként (alapértelmezés: ki [javaslat]).

#### 6.3.1.2 Épületrész (BE)

```
Φ_HL,BE = Σ_i (Φ_T,ie + Φ_T,iae + Φ_T,iaBE + Φ_T,ig) + Φ_V,BE + Σ_i (Φ_hu,i) − Σ_i (Φ_gain,i)      (2)
```
- Φ_HL,BE – épületrész méretezési hőterhelése [W]
- Σ_i(...) – a BE-hez tartozó helyiségek külső és szomszédos BE felé menő transzmissziós veszteségei (6.3.2) [W]
- Φ_V,BE – BE szellőzési hővesztesége (6.3.3) [W]. Ha BE = egy zóna: Φ_V,BE = Φ_V,z; ha több zóna: Φ_V,BE = Σ_z Φ_V,z
- Σ_i(Φ_hu,i) – opcionális, jellemzően csak lakásonkénti hőtermelésnél [W]
- Σ_i(Φ_gain,i) – opcionális [W]

Ugyanaz az egyidejűségi/egyeztetési szabály, mint az épületnél.

#### 6.3.1.3 Fűtött helyiség (i)

```
Φ_HL,i = Φ_T,i + Φ_V,i + Φ_hu,i − Φ_gain,i      (3)
```
- Φ_HL,i – helyiség méretezési hőterhelése [W]
- Φ_T,i – helyiség teljes transzmissziós vesztesége (6.3.2, minden tag) [W]
- Φ_V,i – helyiség szellőzési vesztesége (6.3.3) [W]
- Φ_hu,i – opcionális felfűtési többletteljesítmény szakaszos fűtésnél [W]
- Φ_gain,i – opcionális hőnyereség méretezési külső állapotban [W]

### 6.3.2 Fűtött helyiség méretezési transzmissziós hővesztesége

#### 6.3.2.1 Teljes és rész-transzmissziós veszteség Φ_T,i, Φ_T,ix

Elv: minden H_T,ix hőmérséklet-korrigált (f_ix,k-val), és mindig a (θ_int,i − θ_e) különbségre vonatkozik, függetlenül a szerkezet tényleges hőmérséklet-különbségétől → a H-k összeadhatók, de más szabványok szerinti H-értékekkel nem feltétlenül egyeznek meg.

```
Φ_T,i  = (H_T,ie + H_T,ia + H_T,iae + H_T,iaBE + H_T,ig) · (θ_int,i − θ_e)      (4)
Φ_T,ix = H_T,ix · (θ_int,i − θ_e)                                              (5)
```
- Φ_T,i – teljes transzmissziós veszteség [W]
- Φ_T,ix – részveszteség x felé [W], x ∈ {e: külső tér; a: szomszédos fűtött helyiség; ae: külső tér fűtetlen téren / szomszéd épületen át; aBE: szomszédos épületrész; g: talaj}
- H_T,ix – transzmissziós hőátadási tényező [W/K]:
  - H_T,ie → 6.3.2.2
  - H_T,ia → 6.3.2.3, eset (1)
  - H_T,iae → 6.3.2.3, eset (3)/(4)
  - H_T,iaBE → 6.3.2.3, eset (2)
  - H_T,ig → 6.3.2.4
- θ_int,i – belső méretezési hőmérséklet [°C]; θ_e – külső méretezési hőmérséklet [°C]

Megjegyzés: Φ_T,ia negatív is lehet (melegebb szomszéd felé), a program ne vágja nullára [értelmezés, a szöveg ezt nem mondja ki].

#### 6.3.2.2 Közvetlenül a külső tér felé: H_T,ie

```
H_T,ie = Σ_k ( A_k · (U_k + ΔU_TB) · f_U,k · f_ie,k )      (6)
```
- A_k – szerkezet felülete [m²]
- U_k – hőátbocsátási tényező [W/(m²·K)]
- ΔU_TB – hőhíd-átalánypótlék [W/(m²·K)]; ha a hőhidakat más módon (pl. részletesen, „Annex C” [?] – a 6. táblázat itt E mellékletet ír) veszik figyelembe a nemzeti szabályok szerint, az érintett szerkezeteknél ΔU_TB = 0
- f_U,k – korrekció az U-ban nem szereplő szerkezeti/meteorológiai hatásokra [–]
- f_ie,k – hőmérséklet-korrekciós tényező (6.3.2.5); külső tér felé f_1 = 1

Lebegő padló és fűtetlen pince felé menő szerkezet is ide (6.3.2.2) tartozik, nem a talaj-képletbe.

#### 6.3.2.3 Szomszédos terek felé: H_T,ia(...)

Szomszédos tér típusai (külön részeredményként tárolandók, mert az (1)/(2) eltérően összegzi őket):
1. másik fűtött helyiség ugyanabban a BE-ben → H_T,ia
2. másik BE ugyanabban az épületben (pl. szomszéd lakás) → H_T,iaBE
3. fűtetlen tér (padlás, pince, télikert stb.) → H_T,iae
4. szomszédos épület → H_T,iae

```
H_T,ia(...) = Σ_k ( A_k · U_k · f_ia,k )      (7)
```
- H_T,ia(...) – H_T,ia, H_T,iaBE vagy H_T,iae [W/K]
- A_k [m²], U_k [W/(m²·K)]
- f_ia,k – hőmérséklet-korrekciós tényező (6.3.2.5)

Hőhidak itt alapból kimaradnak (nincs ΔU_TB, nincs f_U,k); nagy hőmérséklet-különbségnél opcionálisan a (6) analógiájára figyelembe vehetők → programban opcionális kapcsoló.

#### 6.3.2.4 Talaj felé: H_T,ig

U_equiv,k meghatározása (nemzeti szabályozás szerint): részletesen EN ISO 13370 szerint VAGY egyszerűsítve az E melléklet szerint.

```
H_T,ig = f_θann · Σ_k ( A_k · U_equiv,k · f_ig,k · f_GW,k )      (8)
```
- H_T,ig – helyiség → talaj hőátadási tényező [W/K]
- f_θann – külső hőmérséklet éves ingadozásának korrekciója [–] (a szumma előtt, egyszer)
- A_k – talajjal érintkező szerkezet felülete [m²]
- U_equiv,k – egyenértékű hőátbocsátási tényező [W/(m²·K)]
- f_ig,k – hőmérséklet-korrekciós tényező (6.3.2.5), θ_x = θ_e,m
- f_GW,k – talajvíz-korrekció [–]

Csak közvetlenül talajjal érintkező szerkezetekre; lebegő padló / fűtetlen pince → 6.3.2.2.

#### 6.3.2.5 Hőmérséklet-korrekciós tényező f_ix,k

Cél: minden H_T,ix,k a (θ_int,i − θ_e) különbségre normált legyen.

```
f_ix,k = f_1 + f_2                                  (9)
f_1    = (θ_int,i − θ_x) / (θ_int,i − θ_e)          (10)
f_2    = (θ*_int,k − θ_int,i) / (θ_int,i − θ_e)     (11)
```
- f_ix,k – korrekció i → x irányban a k szerkezeten át [–]; x = e, a, ae, aBE, g szerint f_ie,k, f_ia,k, f_ig,k stb.
- f_1 – a szomszéd tér (θ_x) és a külső méretezési hőm. eltérése (10) + 7. táblázat; átfed az EN ISO 13789 szerinti b hőmérséklet-csökkentési tényezővel
- f_2 – a belső méretezési hőm. és a szerkezet átlagos belső felületi hőm. eltérése (11) + 8. táblázat (következő oldal, nem e szakasz része)
- θ_int,i – helyiség belső méretezési hőm. [°C]
- θ_x – szomszédos tér hőmérséklete a 7. táblázat szerint [°C]
- θ_e – külső méretezési hőm. [°C]
- θ*_int,k – szerkezet átlagos belső felületi hőm. [°C]; belmagasság < 4 m esetén = θ_int,i → f_2 = 0

Él-eset: θ_int,i = θ_e esetén nullával osztás → a program kezelje (pl. Φ_T,ix = 0, vagy közvetlenül A·U·(θ_int,i − θ_x) számítás) [javaslat].

**7. táblázat – Szomszédos tér hőmérséklete θ_x**

| x | θ_x [°C] | Megjegyzés |
|---|---|---|
| külső tér (e) | θ_e | → f_1 = 1 |
| szomszédos fűtött helyiség ugyanabban a BE-ben (a) | θ_int,a | a szomszéd helyiség belső méretezési hőm. (6. táblázat, θ_int,i) |
| szomszédos BE ugyanabban az épületben (aBE), pl. szomszéd lakás | θ_u | fűtetlennek tekintett BE hőmérséklete: NA A.2.5 → B.2.5 / D melléklet |
| talaj (g) | θ_e,m | éves átlagos külső hőm. (6. táblázat) |
| szomszédos fűtetlen tér (ae) | a fűtetlen tér hőmérséklete, ha ismert | ha nem ismert: f_1 alapértéke NA A.2.4 → B.2.4; alternatíva: D melléklet |
| másik épület (fűtött vagy fűtetlen) | max(θ_e,m; 5 °C) | a várható legalacsonyabb hőm. nemzetileg más értékre állítható |

Elágazás a programban (fűtetlen tér, ae): `if θ_unheated ismert: f_1 = (10) szerint; else if f_1 alapérték (NA A.2.4 / B.2.4): közvetlenül azt használja; else: D melléklet`.


---

> Megjegyzés: a 32. oldal és a 33. oldal teteje még a 6.3.2 (transzmisszió) része (7. és 8. táblázat). Ezeket a 6.3.2-es fejezetrészhez tartozó kiegészítésként a fájl végén ("Függelék – 7. és 8. táblázat") adom meg, hogy a programban ne vesszenek el.

## 6.3.3 Méretezési szellőzési hőveszteség – áttekintés

### Számítási út kiválasztása (elágazás)

```
HA épület légtömör (nemzeti kritérium, pl. n50 <= 3 1/h)
   ÉS nincs gépi (ventilátoros) szellőzés
   ÉS nincs ATD (külső falon/ablakon lévő légbevezető elem)
   ÉS nincs befúvás/elszívás, technológiai légáram, nagy nyílás stb.
AKKOR  -> egyszerűsített módszer (6.3.3.2)
KÜLÖNBEN -> általános módszer (6.3.3.3)
```

- Az általános módszer (6.3.3.3) kezeli: természetes és gépi szellőzés, kiegyenlített és kiegyenlítetlen szellőzés, többlet légáramok (pl. égési levegő), hővisszanyerés.
- Az egyszerűsített módszer a 6.3.3.3 korlátozott bemenetekkel: kis n50, nincs ATD-légáram, nincs befúvás/elszívás/technológiai/nagy nyílás légáram.
- Indoklás (tájékoztató, a programban validációs figyelmeztetésként használható): a résen át beszivárgó légcsereszám kb. az n50 10 %-a; ha n_min = 0,5 1/h (lakóépület tipikus értéke, ld. B.2.11) teljesül, az infiltráció hatása elhanyagolható, ha n50 lényegesen kisebb, mint 5 1/h. Ajánlott nemzeti határ a "magas légtömörségre": pl. n50 ≤ 3 1/h.

Konstansok: n_min = 0,5 h⁻¹ (tipikus lakó), határ 5 h⁻¹, példa-kritérium n50 ≤ 3 h⁻¹, infiltráció ≈ 10 % · n50.

### Hierarchia és számítási sorrend (általános módszer)

Szintek: helyiség (i) ⊂ szellőzési zóna (z) ⊂ épület (build). Egy zónában a külső légáram (q_v,env,z) zóna szinten keletkezik, majd helyiségekre osztódik.

Javasolt számítási sorrend:

1. Helyiség geometriák: V_i, A_env,i (36) → zóna A_env,z (35), épület A_env,build (34), V_build = Σ_i V_i.
2. Légtömörség: n50 (mért vagy alapérték; kis nyílásokkal korrigálva (32)) → q_env,50 (31).
3. Helyiség minimális légáram q_v,min,i (33).
4. Helyiség szintű gépi légáramok bemenetként: q_v,sup,i, q_v,exh,i, q_v,comb,i, q_v,transfer,ij (+ θ_transfer,ij), q_v,open,i, q_v,ATD,design,i.
5. Technológiai légáram q_v,techn,i (23).
6. Zóna összegek: q_v,exh,z (25), q_v,comb,z (26), q_v,sup,z (27), q_v,ATD,design,z (= Σ_i q_v,ATD,design,i [?] – a szabvány itt nem ad explicit képletet).
7. ATD 50 Pa-on: q_v,ATD,50,z (30).
8. Kiegyenlítetlenségi tényező f_e,z (29) (kiegyenlített szellőzésnél f_e,z = 1).
9. Többlet infiltráció q_v,inf-add,z (28).
10. Zóna külső légáram q_v,env,z (24).
11. ATD-autoritás a_ATD,z (22) → q_v,leak,z (20), q_v,ATD,z (21).
12. Helyiségre jutó rés+ATD légáram q_v,leak+ATD,i (19).
13. Helyiség külső légárama q_v,env,i (18).
14. Hőveszteségek: helyiség Φ_V,i (17), zóna Φ_V,z (16), épület Φ_V,build (15).

Megjegyzés: (16) zónaszinten q_v,leak+ATD,i-t használ (orientációs tényező és többlet-infiltráció NÉLKÜL), (17) helyiségszinten q_v,env,i-t (azokkal). Ezért Φ_V,z ≠ Σ_i Φ_V,i általában; a zóna/épület értéket a (16)-ból kell számolni, NEM a helyiségek összegéből. Hasonlóan zónában a minimális légáram f_i-z-vel súlyozott.

## 6.3.3.2 Egyszerűsített számítás légtömör, gépi szellőzés és ATD nélküli épületekre

### 6.3.3.2.1 Általános

Ld. fenti elágazás. Csak a minimális légcsere (q_v,min,i) határozza meg a hőveszteséget; infiltrációval nem számol.

### 6.3.3.2.2 Épület / zóna / helyiség szellőzési hővesztesége

```
(12)  Φ_V,build = Σ_z ⟨ Φ_V,z ⟩

(13)  Φ_V,z = ρ · c_p · Σ_i ⟨ f_i-z · q_v,min,i · (θ_int,i − θ_e) ⟩

(14)  Φ_V,i = ρ · c_p · q_v,min,i · (θ_int,i − θ_e)
```

Jelölések:
- Φ_V,build/z/i – épület / zóna / helyiség szellőzési hővesztesége [W]
- ρ – levegő sűrűsége θ_int,i hőmérsékleten [kg/m³]
- c_p – levegő fajhője θ_int,i hőmérsékleten [Wh/(kg·K)]
- f_i-z – a zónához tartozó egyes helyiségek minimális légáramainak és a zóna eredő légáramának aránya [-] (képletét a szabvány itt nem adja meg [?])
- q_v,min,i – helyiség minimális légárama, 6.3.3.5 szerint [m³/h]
- θ_int,i – helyiség belső méretezési hőmérséklete [°C]
- θ_e – külső méretezési hőmérséklet [°C]

## 6.3.3.3 Általános számítási modell

### 6.3.3.3.1 Épület / zóna / helyiség szellőzési hővesztesége

```
(15)  Φ_V,build = Σ_z ⟨ Φ_V,z ⟩

(16)  Φ_V,z = ρ · c_p · Σ_i ⟨
          max⟨ q_v,leak+ATD,i + q_v,open,i ; f_i-z · q_v,min,i − q_v,techn,i ⟩ · (θ*_int,i − θ_e)
        + q_v,sup,i · (θ*_int,i − θ_rec,z)
        + q_v,transfer,ij · (θ*_int,i − θ_transfer,ij)
      ⟩

(17)  Φ_V,i = ρ · c_p · (
          max⟨ q_v,env,i + q_v,open,i ; q_v,min,i − q_v,techn,i ⟩ · (θ*_int,i − θ_e)
        + q_v,sup,i · (θ*_int,i − θ_rec,z)
        + q_v,transfer,ij · (θ*_int,i − θ_transfer,ij)
      )
```

Logika: a külső levegő légárama a "természetes" bejutás (rés+ATD vagy env, plusz nagy nyílás) és a minimális higiéniai igény technológiai légárammal csökkentett része közül a nagyobb. A befúvott levegő a hővisszanyerő (és passzív előmelegítés) utáni θ_rec,z hőmérsékletről, az átáramló levegő a szomszéd helyiség θ_transfer,ij hőmérsékletéről melegítendő fel. Aktív előfűtés nem vehető figyelembe θ_rec,z-ben.

Jelölések:
- Φ_V,build/z/i – szellőzési hőveszteség [W]
- ρ, c_p – mint fent (θ_int,i-n) [kg/m³], [Wh/(kg·K)]
- f_i-z – helyiség min. légáram / zóna eredő légáram arány [-]
- q_v,leak+ATD,i – helyiségbe réseken és ATD-n át jutó külső légáram, (19) [m³/h]
- q_v,open,i – helyiség nagy nyílásain át jutó külső légáram [m³/h]
- q_v,min,i – helyiség minimális légárama, 6.3.3.5 [m³/h]
- q_v,techn,i – helyiség technológiai légárama, 6.3.3.3.3 [m³/h]
- q_v,sup,i – helyiség befúvott légárama [m³/h]
- q_v,transfer,ij – j szomszéd helyiségből i-be átáramló légáram [m³/h]
- q_v,env,i – helyiségbe a burkon át jutó külső légáram, 6.3.3.3.2 [m³/h]
- θ*_int,i – a helyiség belső léghőmérséklete [°C] (magas tereknél eltérhet θ_int,i-től)
- θ_e – külső méretezési hőmérséklet [°C]
- θ_rec,z – zóna befúvott levegőjének hőmérséklete hővisszanyerés és esetleges passzív előmelegítés után, aktív előfűtés nélkül [°C] (becslés: 6.3.3.7)
- θ_transfer,ij – az átáramló levegő hőmérséklete [°C]

Implementációs megjegyzés: a "q_v,transfer,ij · (…)" tag több szomszéd esetén értelemszerűen Σ_j-ként kezelendő [?] (a szabvány egyetlen j-vel írja).

### 6.3.3.3.2 Helyiség külső légárama a burkon át, q_v,env,i

A zóna légáramából vezetjük le: a többlet-infiltrációs rész orientációs tényezővel (f_dir) korrigált és a zóna összértékével felülről korlátozott, a maradék rész arányosan oszlik.

```
(18)  q_v,env,i = (q_v,inf-add,z / q_v,env,z) · min⟨ q_v,env,z ; q_v,leak+ATD,i · f_dir ⟩
                + ((q_v,env,z − q_v,inf-add,z) / q_v,env,z) · q_v,leak+ATD,i

(19)  q_v,leak+ATD,i = q_v,leak,z · (A_env,i / A_env,z)
                     + q_v,ATD,z · (q_v,ATD,design,i / q_v,ATD,design,z)
```

ATD nélkül (q_v,ATD,z = q_v,ATD,design,i = q_v,ATD,design,z = 0) a (19) második tagja = 0 (0/0 elkerülése a kódban!).
Hasonlóan (18)-ban q_v,env,z = 0 esetén védőfeltétel kell (ilyenkor q_v,env,i = 0 [?] – a szabvány nem rendelkezik).

Jelölések:
- q_v,env,i – helyiség külső légárama a burkon át [m³/h]
- q_v,inf-add,z – zóna többlet-infiltrációs légárama, 6.3.3.3.5 [m³/h]
- q_v,env,z – zóna külső légárama a burkon át, 6.3.3.3.4 [m³/h]
- q_v,open,z – zóna nagy nyílásain át jutó légáram [m³/h] (a jelöléslistában szerepel, a (18)-ban nem)
- q_v,leak+ATD,i – (19) szerint [m³/h]
- f_dir (a listában f_dir,z) – orientációs tényező [-] (értéke nemzeti melléklet / B függelék)
- q_v,open,i – helyiség nagy nyílásain át jutó légáram [m³/h]
- q_v,leak,z – zóna réseken át jutó légárama, (20) [m³/h]
- A_env,i, A_env,z – helyiség / zóna burokfelülete [m²] (6.3.3.6)
- q_v,ATD,z – zóna ATD-n át jutó légárama, (21) [m³/h]
- q_v,ATD,design,i, q_v,ATD,design,z – helyiség / zóna ATD-inek tervezési légárama [m³/h]

Rés és ATD szétosztása zóna szinten az ATD-autoritással:

```
(20)  q_v,leak,z = (1 − a_ATD,z) · q_v,env,z

(21)  q_v,ATD,z  = a_ATD,z · q_v,env,z

(22)  a_ATD,z = q_v,ATD,50,z / (q_v,ATD,50,z + q_env,50 · A_env,z)
```

- a_ATD,z – zóna ATD-autoritása [-]
- q_v,ATD,50,z – zóna ATD-in átjutó légáram 50 Pa-on, (30) [m³/h]
- q_env,50 – burok fajlagos légáteresztése 50 Pa-on [m³/(m²·h)]
- A_env,z – zóna burokfelülete [m²]

### 6.3.3.3.3 Helyiség technológiai légárama

```
(23)  q_v,techn,i = max⟨ q_v,sup,i + q_v,transfer,ij ; q_v,exh,i + q_v,comb,i ⟩
```

- q_v,techn,i – technológiai légáram [m³/h]
- q_v,sup,i – befúvott [m³/h]; q_v,transfer,ij – átáramló (j → i) [m³/h]
- q_v,exh,i – elszívott [m³/h]
- q_v,comb,i – égési (vagy más technológiailag szükséges) a helyiségből elvont légáram [m³/h]

### 6.3.3.3.4 Zóna külső légárama a burkon át, q_v,env,z

Az elszívás + égési levegő befúvással nem fedezett része (ha pozitív), plusz a többlet-infiltráció. Kiegyenlített vagy túlnyomásos rendszernél az első tag 0.

```
(24)  q_v,env,z = max⟨ q_v,exh,z + q_v,comb,z − q_v,sup,z ; 0 ⟩ + q_v,inf-add,z

(25)  q_v,exh,z  = Σ_i ⟨ q_v,exh,i ⟩

(26)  q_v,comb,z = Σ_i ⟨ q_v,comb,i ⟩

(27)  q_v,sup,z  = Σ_i ⟨ q_v,sup,i ⟩
```

- q_v,exh,z / q_v,comb,z / q_v,sup,z – zóna elszívott / égési / befúvott légárama [m³/h]
- q_v,inf-add,z – 6.3.3.3.5 [m³/h]

### 6.3.3.3.5 Többlet-infiltráció a zónába, q_v,inf-add,z

```
(28)  q_v,inf-add,z = (q_env,50 · A_env,z + q_v,ATD,50,z) · f_qv,z · f_e,z

(29)  f_e,z = 1 / ( 1 + (f_fac,z / f_qv,z) · ( (q_v,exh,z + q_v,comb,z − q_v,sup,z)
                                              / (q_env,50 · A_env,z + q_v,ATD,50,z) )^2 )

(30)  q_v,ATD,50,z = q_v,ATD,design,z · ( 50 [Pa] / Δp_design,z )^(v_leak,z)
```

Elágazás: kiegyenlített szellőzésnél f_e,z = 1 (a (29)-ben a számláló különbség 0 → f_e,z = 1 automatikusan is).
Megjegyzés: (29)-ben a különbség négyzetre emelve, tehát előjeltől független (túlnyomás és depresszió egyaránt csökkenti f_e,z-t).

- q_env,50 – burok fajlagos légáteresztése 50 Pa-on [m³/(m²·h)]
- A_env,z – zóna burokfelülete [m²]
- q_v,ATD,50,z – zóna ATD-légárama 50 Pa-on, (30) [m³/h] (a jelöléslista egy helyen "Formula (3)"-ra hivatkozik – sajtóhiba, helyesen (30))
- f_qv,z – térfogatáram-tényező [-]
- f_e,z – kiegyenlítetlen szellőzés okozta többlet nyomáskülönbség tényezője [-]
- f_fac,z – kitett homlokzatok számának tényezője [-]
- q_v,exh,z, q_v,comb,z, q_v,sup,z – 6.3.3.3.4 [m³/h]
- q_v,ATD,design,z – zóna ATD-inek tervezési légárama [m³/h]
- Δp_design,z – zóna ATD-inek tervezési nyomáskülönbsége [Pa]
- v_leak,z – résáramlás nyomáskitevője [-]

(f_qv,z, f_fac,z, v_leak,z értékei: nemzeti melléklet / B függelék – nem ezen az oldalakon.)

## 6.3.3.4 Légtömörség

- Két egyenértékű jellemző: q_env,50 (burok fajlagos légáteresztése) és n50 (légcsereszám), mindkettő 50 Pa-ra. Forrás: mérés (pl. EN ISO 9972) vagy alapérték. Méréskor az ATD-k le vannak zárva, ATD-légáram nincs benne.
- Alapértékek: nemzeti (A.2.10); ha sem mért, sem nemzeti adat nincs → tájékoztató B.2.10.
- A számítás q_env,50-nel dolgozik; ha n50 adott, átszámítás:

```
(31)  q_env,50 = n50 · V_build / A_env,build
      V_build = Σ_i ⟨ V_i ⟩
```

- q_env,50 – légáteresztés 50 Pa-on [m³/(m²·h)]
- n50 – légcsereszám 50 Pa-on [h⁻¹]
- V_build – épület belső (lég)térfogata [m³]
- A_env,build – épület burokfelülete [m²]

Kis nyílások korrekciója: ha a légtömörségi érték nem tartalmazza a kis nyílásokat (pl. liftakna-szellőzők – ATD-k NEM; pl. EN ISO 9972 "B" módszer szerinti mérésnél), növelni kell; nemzeti eltérő előírás hiányában:

```
(32)  n50 = n50,measure + 2 [m³/(h·cm²)] · A_small_open / V_build
```

- n50 – légcsereszám 50 Pa-on (a listában tévesen m³/(m²·h) egység szerepel; helyesen h⁻¹ [?])
- n50,measure – mért légcsereszám 50 Pa-on, zárt kis nyílásokkal, EN ISO 9972 B módszer szerinti belső térfogattal [h⁻¹]
- A_small_open – kis nyílások felülete [cm²]
- V_build – [m³]
- Konstans: 2 m³/(h·cm²)

## 6.3.3.5 Minimális légáram

```
(33)  q_v,min,i = n_min,i · V_i
```

- q_v,min,i – helyiség minimális légárama [m³/h]
- n_min,i – helyiség minimális légcsereszáma [h⁻¹] (pl. lakó: 0,5 h⁻¹, ld. B.2.11)
- V_i – helyiség belső (lég)térfogata [m³]

## 6.3.3.6 Burokfelületek A_env,z/i

- Szellőzési hőveszteség szempontjából burok: a vizsgált teret a külső levegőtől (e) és fűtetlen terektől (ae) elválasztó felület(ek).
- Méretezési konvenció: a légtömörségi érték forrásával egyezően; ha ismeretlen → külső méretek (mindig elfogadható, biztonságos oldali).
- Talajjal érintkező, nagyrészt légtömör elemek (pl. betonlemez) csak akkor számítanak, ha a q_env,50 meghatározásakor is számoltak velük (konzisztencia-kapcsoló a programban).

```
(34)  A_env,build/z/i = A_fac,build/z/i + A_roof,build/z/i + A_bottom,build/z/i

(35)  A_env,z = Σ_i ⟨ A_env,i ⟩

(36)  A_env,i = Σ_k ⟨ A_k ⟩
```

- A_env,build/z/i – épület / zóna / helyiség burokfelülete [m²]
- A_fac,… – homlokzatfelület [m²]; A_roof,… – tetőfelület [m²]; A_bottom,… – padló(alsó határoló) felület [m²]
- Σ_i A_env,i – a zóna helyiségeinek burokfelület-összege [m²]
- Σ_k A_k – a helyiség külső térrel és fűtetlen terekkel határos szerkezeteinek felület-összege [m²]

## 6.3.3.7 Befúvott és elszívott levegő hőmérsékletének becslése

- Befúvásos zónáknál a befúvott és elszívott levegő hőmérsékletét (θ_rec,z stb.) a szellőzési koncepcióból / rendszer méretezéséből kell venni.
- Ha nincs adat: az ezt követő becslés használható (nemzeti igényekhez igazítható). Minden paraméter méretezési külső állapotra vonatkozik, így eltérhet az éves átlagos értékektől.
- [A becslő képletek a 41. oldalon folytatódnak – nem az én oldaltartományom.]

## Függelék – 7. és 8. táblázat (6.3.2-hez, a 32–33. oldalon)

f_ix,k jelölései (a megelőző képlethez, (10)/(11)):
- f_ix,k – hőmérséklet-korrekciós tényező i → x hőátadáshoz a k szerkezeten át [-]
- f_1 – x tér és θ_e eltérése, (10) és 7. táblázat [-] (átfed az EN ISO 13789 b tényezőjével)
- f_2 – θ_int,i és a szerkezet átlagos belső felületi hőmérséklete eltérése, (11) és 8. táblázat [-]
- θ_int,i, θ_x, θ_e, θ*_int,k [°C]

7. táblázat – szomszédos terek hőmérséklete θ_x:
| x | θ_x | megjegyzés |
|---|---|---|
| külső tér (e) | θ_e | f_1 = 1 |
| szomszédos fűtött tér ugyanazon épületegységben (a) | θ_int,a | 6. táblázat szerinti belső méretezési hőmérséklet |
| szomszédos épületegység ugyanabban az épületben (aBE), pl. szomszéd lakás | θ_u | fűtetlennek tekintett BE hőmérséklete: nemzeti melléklet A.2.5, vagy B.2.5 / D függelék |
| talaj (g) | θ_e,m | éves külső középhőmérséklet, 6. táblázat |
| szomszédos fűtetlen tér (ae) | a fűtetlen tér hőmérséklete, ha ismert | ha nem ismert: f_1 alapértékei nemzeti mellékletből (A.2.4) vagy B.2.4; alternatíva: D függelék |
| másik épület (fűtött vagy fűtetlen) | max⟨θ_e,m ; 5 °C⟩ | nemzetileg más érték is megadható |

8. táblázat – belső felületi hőmérséklet θ*_int,k:
| belmagasság | θ*_int,k | megjegyzés |
|---|---|---|
| < 4 m | θ_int,i | f_2 = 0 |
| ≥ 4 m ("magas terek") | θ*_int,k | átlagos belső felületi hőmérséklet, 6.3.8.2 szerint |


---

## 6.3.3 (folytatás, 41. oldal) – Befújt levegő hőmérséklete hővisszanyerés után; zóna elszívott levegőjének hőmérséklete

Megjegyzés: ez a 6.3.3 vége (az előző oldalakról átnyúló rész). A hővisszanyerő hatásfokát a méretezési külső körülményekhez kell venni: fagyvédelem/leolvasztás miatt csökkentett hatásfok vagy akár bypass (η = 0) is lehet.

Implementációs szabály:
- θ_rec,z csak a hővisszanyerésből és a **passzív** előmelegítésből (pl. talajhőcserélő) származó hőmérséklet-emelkedést tartalmazhatja.
- **Aktív** előmelegítés (hőtermelővel, pl. kazánnal fűtött előfűtő) teljesítménye a méretezési hőterhelés része, ezért θ_rec,z számításánál NEM vehető figyelembe. θ_rec,z így eltérhet a valós befújt hőmérséklettől.

```
(37)  θ_rec,z = θ_e,0 + η_rec,z · (θ_exh,z − θ_e,0)
```
- θ_rec,z – a zónába (z) befújt levegő hőmérséklete hővisszanyerés és (ha van) passzív előmelegítés után, aktív előmelegítés nélkül [°C]
- θ_e,0 – külső méretezési hőmérséklet az építési helyszínen, időállandó szerinti korrekció NÉLKÜL (6.3.7, (46)) [°C]
- η_rec,z – a zónához rendelt szellőző rendszer hővisszanyerési hatásfoka méretezési külső körülmények között [-]
- θ_exh,z – a zónából elszívott levegő hőmérséklete [°C]

A zóna elszívott levegőjének hőmérséklete a zónához tartozó helyiségek elszívott térfogatáramaival súlyozott átlagként becsülhető:

```
(38)  θ_exh,z = Σ_i ( q_v,exh,i · θ*_int,i ) / Σ_i ( q_v,exh,i )
```
- q_v,exh,i – az (i) helyiség elszívott légtérfogatárama (i ∈ zóna z) [m³/h]
- θ*_int,i – az (i) helyiség (átlagos) belső léghőmérséklete [°C] (magas helyiségnél (49) szerint, 6.3.8.3; egyébként θ_int,i)

Számítási sorrend: θ*_int,i minden helyiségre → (38) θ_exh,z → (37) θ_rec,z.

---

## 6.3.4 Szakaszos fűtésű terek többlet felfűtési teljesítménye

Szakaszos (temperálással / éjszakai csökkentéssel üzemelő) fűtésnél a belső méretezési hőmérséklet adott időn belüli visszaállításához többlet felfűtési teljesítmény kellhet. Ennek nagysága függ: hőszigetelési szinttől, a csökkentés és felfűtés alatti külső légcserétől, a szerkezetek és berendezés hőtároló képességétől, a csökkentés alatti hőmérsékleteséstől, a megengedett felfűtési időtől, és a szabályozás jellemzőitől.

Program-logika:
- Alapértelmezés: Φ_hu,i = 0 (opcionális tétel, csak kifejezett bekapcsolásra).
- Jellemzően nem kell, ha a szabályozás a leghidegebb napokon megakadályozza a csökkentést, és/vagy a csökkentés alatti hőveszteség elhanyagolható (jó hőszigetelés + kis légcsere csökkentés alatt).
- A felfűtési többlet elsősorban a hőleadók méretezését érinti; a hőtermelő túlméretezését kerülni kell (készenléti veszteség, ciklizálás). A felfűtési teljesítményt / felfűtési időt a megrendelővel egyeztetni ajánlott.
- Ha a hőtermelő méretezésébe beszámítjuk, azt a kimeneti jelentésben **külön, kifejezetten fel kell tüntetni** (külön sor/flag).
- Meghatározás: nemzeti szabályozás szerint részletes módszerrel, VAGY az alábbi egyszerűsített módszerrel, a nemzeti melléklet vagy a tájékoztató F melléklet φ_hu értékeivel.

Egyszerűsített módszer (helyiségenként):

```
(39)  Φ_hu,i = A_i · φ_hu,i
```
- Φ_hu,i – az (i) helyiség teljes felfűtési teljesítménye [W]
- A_i – az (i) helyiség alapterülete [m²]
- φ_hu,i – fajlagos felfűtési teljesítmény [W/m²] (táblázat: nemzeti melléklet / F melléklet – nem ezen az oldalon)

---

## 6.3.5 Időállandó

Csak akkor kell számítani, ha a számítás igényli (pl. a külső méretezési hőmérséklet épületjellemzők szerinti korrekciója, 6.3.7, (47)).

```
(40)  τ = C_eff / H
(41)  C_eff = c_eff · V_e
```
- τ – épület időállandó [h]
- C_eff – az épület effektív teljes hőtároló képessége [Wh/K]
- c_eff – az épület / épületrész térfogatra fajlagos effektív hőtároló képessége [Wh/(m³·K)]
- V_e – az épület / épületrész külső (bruttó) térfogata [m³]
- H – az épület teljes hőátbocsátási tényezője, 6.3.6 (42) szerint, hőmérséklet-korrekció nélkül [W/K]

H-ba CSAK az épület egészére vonatkozó veszteségek kerülnek:
- transzmisszió (közvetlenül vagy fűtetlen tereken át):
  - külső tér felé (közvetlenül és fűtetlen tereken keresztül),
  - talaj felé,
  - szomszédos épületek felé;
- a teljes épületre számított szellőzési hőveszteség.
(Belső, fűtött helyiségek közötti hőcsere nem számít bele.)

Megjegyzések az implementációhoz:
- Alapeset: egy τ az egész épületre, és ezt minden fűtött helyiségre alkalmazzuk.
- Részletesebb eset (pl. masszív pince + könnyűszerkezetes emeletek): épületrészenként (BE) τ_BE, C_eff,BE, H_BE.
- H a vizsgált időszak feltételeitől függ (pl. eltérő légcsere hétköznap ill. hétvégi csökkentéskor) → ugyanarra az épületre több H és így több τ is számítható; a program engedjen meg több „H-szcenáriót”.

---

## 6.3.6 Hőátbocsátási tényezők hőmérséklet-korrekció nélkül

A 6.3.2 szerinti transzmissziós tényezők hőmérséklet-korrekciós tényezőt tartalmaznak (így azonos helyiség elemei összehasonlíthatók és összeadhatók). Ahol korrekció nélküli érték kell (pl. H a (40)-hez), az alábbi képletek használandók.

```
(42)  H_12   = H_T,12 + H_V,12
(43)  H_T,12 = Σ_k ( A_k · (U_k + ΔU_TB) )
(44)  H_V,12 = q_v,12 · ρ · c_p
```
Talajjal érintkező szerkezeteknél a (43)-at ki kell egészíteni a talajvíz hatását kifejező f_GW tényezővel [?: a képletben a pontos elhelyezés nincs megadva; értelemszerűen szorzóként az adott elem A_k·(U_k+ΔU_TB) tagján, a 6.3.2 talajos képletével összhangban].

- H_12 – teljes hőátbocsátási tényező az (1) és (2) tér között [W/K]
  - (1): pl. a vizsgált helyiség (i), vagy a teljes épület stb.
  - (2): pl. szomszédos fűtetlen tér, szomszédos épületrész, külső tér (e) stb.
- H_T,12 – transzmissziós hőátbocsátási tényező (1)–(2) között [W/K]
- H_V,12 – szellőzési hőátbocsátási tényező (1)–(2) között [W/K]
- A_k – a (k) épületszerkezet felülete [m²]
- U_k – a (k) szerkezet hőátbocsátási tényezője [W/(m²·K)]
- ΔU_TB – általános (blanket) hőhíd-pótlék [W/(m²·K)]; ha a hőhidakat más módon (pl. C melléklet szerinti részletes számítással) veszik figyelembe, az érintett szerkezeteknél ΔU_TB = 0
- q_v,12 – légtérfogatáram (1) és (2) között [m³/h]
- ρ – levegő sűrűsége [kg/m³]
- c_p – levegő fajhője [Wh/(kg·K)]
(ρ és c_p számértéke nem ezen az oldalon szerepel.)

---

## 6.3.7 Külső méretezési hőmérséklet (klimatikus adatok)

A (45)–(47) képletek a megadott külső hőmérséklet módosítását teszik lehetővé:
- nemzeti klímaviszonyok változatossága (referenciahely adatai),
- a helyszín és a mérési adat (pl. meteorológiai állomás) közti magasságkülönbség,
- az épület időállandójának hatása.

Alapeset: épületenként egy θ_e. Részletesebb eset: szintenként vagy épületrészenként (pl. magasház; szintenként jelentősen eltérő hőtároló viselkedés, pl. masszív pince + könnyű emeletek) – ekkor θ_e, θ_e,0, Δθ_e,τ, h_build, τ szintenként/épületrészenként adható meg.

Nemzeti kikapcsolás:
- G_θ,Ref = 0 → nincs magasság-korrekció;
- Δθ_e,τ = 0 → nincs időállandó-korrekció;
- ha a nemzeti szabályozás egyiket sem alkalmazza, θ_e fix nemzeti érték, és (45)–(47) nem kell.

Számítási sorrend: (46) θ_e,0 → (szükség esetén 6.3.5 τ) → (47) Δθ_e,τ → (45) θ_e.

```
(45)  θ_e      = θ_e,0 + Δθ_e,τ
(46)  θ_e,0    = θ_e,Ref + G_θ,Ref · (h_build − h_Ref)
(47)  Δθ_e,τ   = max( min( k_τ · τ + Δθ_e,τ,0 ; Δθ_e,τ,max ) ; Δθ_e,τ,min )
```
- θ_e – külső méretezési hőmérséklet a vizsgált épületre (helyi klíma + tengerszint feletti magasság + időállandó) [°C]
- θ_e,0 – külső méretezési hőmérséklet a helyszínen (időállandó-korrekció nélkül) [°C]
- Δθ_e,τ – időállandó szerinti hőmérséklet-korrekció [K]

Helyi klíma és magasság hatása:
- θ_e,Ref – külső méretezési hőmérséklet a kijelölt referenciahelyen [°C]
- G_θ,Ref – hőmérséklet-gradiens a referenciahelyre [K/m]; definíció szerint negatív érték = magassággal csökkenő hőmérséklet
- h_build – a vizsgált épület átlagos tengerszint feletti magassága [m]; egyszerűsítésként a helyszíni terepszint magassága is használható (1. ábra); szükség esetén szintenként/épületrészenként (pl. magasház)
- h_Ref – a referenciahely tengerszint feletti magassága [m]

Időállandó hatása:
- k_τ – meredekség [K/h]
- τ – a vizsgált épület időállandója 6.3.5 szerint [h] (szükség esetén szintenként)
- Δθ_e,τ,0 – alapérték [K]
- Δθ_e,τ,max – felső korlát [K]; ha nincs nemzeti érték: +∞ (a min() hatástalan)
- Δθ_e,τ,min – alsó korlát [K]; ha nincs nemzeti érték: −∞ (a max() hatástalan)

Implementáció: a korlátokat None/±inf-ként kezelni; k_τ, Δθ_e,τ,0, θ_e,Ref, G_θ,Ref, h_Ref a nemzeti mellékletből / klímaadatbázisból jönnek (itt nincs számérték).

1. ábra (sematikus): referenciahely és vizsgált épület. Jelmagyarázat: 1 – épület átlagos tengerszint feletti magassága; 2 – terepszint az építési helyen; 3 – referenciahely magassága; 4 – tengerszint; 5 – a referenciahely érvényességi területe; a – egyszerűsített (h_build terepszintről mérve). A betét-diagram θ–h egyenest mutat: (θ_e,Ref; h_Ref) pontból a G_θ,Ref meredekséggel jutunk (θ_e,0; h_Build)-be.

---

## 6.3.8 A hőleadó rendszer hatása magas helyiségekben (belmagasság ≥ 4 m)

### 6.3.8.1 Általános

Elágazás helyiségenként a belmagasság (h) szerint:
- **h < 4 m**: a hőleadó rendszer jellege elhanyagolható → θ*_int,k = θ_int,i és θ*_int,i = θ_int,i (nincs korrekció) [a standard ezt implicit módon mondja: a hőleadó hatása elhagyható].
- **h ≥ 4 m**: figyelembe kell venni a függőleges hőmérséklet-gradienst, az eltérő lég- és sugárzási hőmérsékletet, és a fűtött épületrészek hőveszteségét. Ezt két mennyiség hordozza:
  - θ*_int,k/l/m – átlagos belső felületi hőmérséklet szerkezetre (k), vonalmenti (l) és pontszerű (m) hőhídra → (48);
  - θ*_int,i – átlagos belső léghőmérséklet → (49).

Több hőleadó rendszer egy helyiségben – elfogadható megoldások:
1. ha egy rendszer messze domináns, a többi elhagyható;
2. a helyiség al-helyiségekre bontható (mindegyik külön fűtött tér (i)); ekkor a többi paramétert (pl. befújt/elszívott térfogatáram) is szét kell osztani;
3. bontás helyett a hőleadó rendszerek bemenő paraméterei (G_θ,air, Δθ_surf, Δθ_rad) terület- vagy térfogat-súlyozott átlaggal összevonhatók.

### 6.3.8.2 Átlagos belső felületi hőmérsékletek

Felhasználás: a 6.3.2 szerinti transzmissziós hőmérséklet-korrekciós tényezők számítása. Bemenő paraméterek: függőleges léghőmérséklet-gradiens G_θ,air és a lég- és felületi hőmérséklet eltérését kifejező pótlék; egyszerűsítésként ezeket kizárólag a hőleadó rendszer jellemzőjének tekintjük (táblázatos értékek nem ezen az oldalon).

Figyelem: az így kapott értékek csak a transzmissziós hőveszteség számítására alkalmasak, NEM valós felületi hőmérsékletek – harmatpont/páralecsapódás vizsgálatra nem használhatók.

Részletes hőhíd-számításnál (pl. C melléklet) ugyanez a képlet használható vonalmenti (l) és pontszerű (m) hőhidak átlagos belső felületi hőmérsékletének becslésére (k helyett l ill. m indexszel, h_k helyett a hőhíd magasságával).

```
(48)  θ*_int,k = θ_int,i + G_θ,air,i · (h_k − h_occup,i) + Δθ_surf,k
```
- θ*_int,k – a (k) szerkezet átlagos belső felületi hőmérséklete [°C]
- θ_int,i – a (k) szerkezeteket tartalmazó (i) helyiség belső méretezési hőmérséklete [°C]
- G_θ,air,i – az (i) helyiségben alkalmazott hőleadó rendszer léghőmérséklet-gradiense [K/m]
- Δθ_surf,k – korrekció az eltérő lég- és felületi hőmérsékletre (pl. sugárzó fűtők által megvilágított padló/fal, padlófűtés miatti magasabb padlóhőmérséklet) [K]
- h_k – a (k) szerkezet átlagos magassága a padlószint felett [m]; jelentősen eltérő padlószintek esetén a terület-súlyozott átlagos padlómagasság vehető padlószintnek, a többi helyiségmagasságot ehhez kell igazítani
- h_occup,i – az (i) helyiség tartózkodási zónájának magassága [m]

Megjegyzés: a bevezető szöveg a pótlékot Δθ_rad-ként említi, a képlet Δθ_surf,k-t használ – a programban a (48)-hoz Δθ_surf,k a mérvadó.

### 6.3.8.3 Átlagos belső léghőmérséklet

Felhasználás: magas helyiségek szellőzési hőveszteségének számítása (6.3.3), valamint (38). Bemenő paraméterek: G_θ,air és az operatív és léghőmérséklet közti átlagos különbség Δθ_rad; egyszerűsítésként a hőleadó rendszer jellemzői.

[?] A szöveg „Formula (B.2)”-re hivatkozik, de a fejezetben megadott képlet a (49) – a programban a (49)-et alkalmazzuk (valószínűleg a B melléklet azonos képletére utal).

```
(49)  θ*_int,i = θ_int,i + G_θ,air,i · (h_i / 2 − h_occup,i) − Δθ_rad
```
- θ*_int,i – az (i) helyiség átlagos belső léghőmérséklete [°C]
- θ_int,i – belső méretezési (operatív) hőmérséklet [°C]
- G_θ,air,i – a hőleadó rendszer léghőmérséklet-gradiense [K/m]
- h_i – az (i) helyiség belmagassága [m] (h_i/2: a légtér közepe)
- h_occup,i – a tartózkodási zóna magassága [m]
- Δθ_rad – az operatív és léghőmérséklet közötti átlagos különbség (a hőleadó rendszer jellemzője) [K]; levonandó
(A (49) jelmagyarázata a következő oldalon folytatódik – nem része ennek a szakasznak.)


---

> Megjegyzés: a 48. oldal teteje (θ*_int,i, θ_int,i, G_θ,air,i, Δθ_rad, h_i, h_occup,i jelmagyarázat) még a 6. fejezet (6.3.x, belső léghőmérséklet-korrekció) szimbólumlistájának vége, nem ennek a szakasznak a része.

## 7. Egyszerűsített módszer – fűtött helyiség (egyedi helyiség) tervezési hővesztesége

### 7.1 Kimenő adat (Table 9)

| Leírás | Jel | Egység | Felhasználás | Célmodul |
|---|---|---|---|---|
| Fűtött helyiség (i) tervezési hőterhelése | Φ_HL,i | W | hőleadók méretezése; hidraulikai beszabályozás | – |

Alkalmazhatóság: állandósult állapotú számítás egy helyiségre; csak az 5. fejezetben ("Description of the methods") megadott alkalmazási esetekre és peremfeltételekre használható. A programban: az egyszerűsített módszer választását az 5. fejezet feltételeihez kell kötni (validáció).

### 7.2 Bemenő adatok (Table 10)

Több forrás esetén a felsorolás sorrendje = prioritás (első a legmagasabb).

| Jel | Tartalom | Egység | Forrás (prioritás szerint) |
|---|---|---|---|
| A_k | határoló szerkezet (k) felülete | m² | épületadat / felmérés |
| f_int-ext | külső/belső felület aránya | – | épületadat (ha van); nemzeti melléklet A.3.1; B.3.1 |
| U_k | szerkezet (k) hőátbocsátási tényezője | W/(m²·K) | épületadat; nemzeti melléklet A.4.3; B.4.3 |
| ΔU_TB | átalányos hőhíd-pótlék | W/(m²·K) | nemzeti melléklet A.3.2 (alternatívaként A.2.1); B.3.2 (alternatívaként B.2.1) |
| V_i | helyiség (i) belső (levegő)térfogata | m³ | épületadat / felmérés |
| n_i | helyiség (i) légcsereszáma | h⁻¹ | épületadat; nemzeti melléklet A.3.4; B.3.4 |
| θ_int,i | helyiség (i) belső tervezési hőmérséklete | °C | épületadat/terv; nemzeti melléklet A.4.2; B.4.2 |
| θ_e | külső tervezési hőmérséklet | °C | nemzeti melléklet A.4.1 (lábjegyzet a) |
| f_x | hőmérséklet-korrekciós tényező | – | nemzeti melléklet A.3.3 (alternatívaként A.2.4, →f_1); B.3.3 (alternatívaként B.2.4, →f_1) |

Lábjegyzet a: az egyszerűsített módszerben θ_e = θ_e,Ref.

### 7.3 Számítási eljárás

Számítási sorrend helyiségenként:
1. Szerkezetek szűrése (ΔT > 4 K szabály, lásd 7.3.2).
2. Szükség esetén belső méretből külső felület: (52).
3. Φ_T,i transzmissziós veszteség: (51).
4. Φ_V,i szellőzési veszteség: (53).
5. Opcionálisan Φ_hu,i felfűtési többletteljesítmény (6.3.4 szerint).
6. Φ_HL,i összegzés: (50).

#### 7.3.1 Helyiség tervezési hőterhelése

```
(50)  [7.3.1]
Φ_HL,i = Φ_T,i + Φ_V,i + Φ_hu,i
```
- Φ_HL,i – helyiség (i) tervezési hővesztesége/hőterhelése [W]
- Φ_T,i – transzmissziós tervezési hőveszteség [W] (a szabvány szövege itt "Formula (48)"-ra hivatkozik – valójában (51) [?], valószínű szabványhiba)
- Φ_V,i – szellőzési tervezési hőveszteség [W] (a szöveg "Formula (50)"-re hivatkozik – valójában (53) [?], valószínű szabványhiba)
- Φ_hu,i – felfűtési többletteljesítmény a 6.3.4 szerint [W]; opcionális ("may be taken into account"), alapértelmezés 0.

#### 7.3.2 Helyiség tervezési transzmissziós hővesztesége

Szűrési szabály: csak azokat a határoló szerkezeteket (k) kell figyelembe venni, amelyeknél a vizsgált helyiség és a szomszédos tér közötti hőmérséklet-különbség **> 4 K**. (Implementáció: |θ_int,i − θ_szomszéd| > 4 K → bekerül; ≤ 4 K → kihagyva. [?] a szabvány nem mondja ki, abszolút értékről van-e szó; értelemszerűen igen.)

```
(51)  [7.3.2]
Φ_T,i = Σ_k Φ_T,k = Σ_k ⟨ A_k · (U_k + ΔU_TB) · f_x,k ⟩ · (θ_int,i − θ_e)
```
- Φ_T,k – szerkezet (k) transzmissziós vesztesége [W]
- A_k – szerkezet felülete [m²] (külső méretek alapján!)
- U_k – hőátbocsátási tényező [W/(m²·K)]
- ΔU_TB – átalányos hőhíd-pótlék [W/(m²·K)]; ha a hőhidakat más módon veszik figyelembe (pl. részletesen a C melléklet szerint, a nemzeti szabályozással összhangban), az érintett szerkezeteknél ΔU_TB = 0
- f_x,k – hőmérséklet-korrekciós (adjusztációs) tényező [–] (szomszédos tér típusától függ: külső levegő, fűtetlen tér, talaj, szomszédos fűtött tér…)
- θ_int,i – helyiség belső tervezési hőmérséklete [°C]
- θ_e – külső tervezési hőmérséklet [°C]

Felületszámítás: a falfelületek a szabványban **külső méretekre** vonatkoznak. Ha a külső falnak csak belső mérete ismert:

```
(52)  [7.3.2]
A_k = f_int-ext · A_k,inner
```
- A_k – külső fal (k) felülete, külső méretekkel [m²]
- f_int-ext – külső/belső felület aránya [–] (A.3.1 / B.3.1)
- A_k,inner – külső fal (k) felülete, belső méretekkel [m²]

#### 7.3.3 Helyiség tervezési szellőzési hővesztesége

```
(53)  [7.3.3]
Φ_V,i = V_i · n_i · ρ_L · c_p,L · (θ_int,i − θ_e)
```
- V_i – helyiség belső (levegő)térfogata [m³]
- n_i – légcsereszám [h⁻¹]
- ρ_L · c_p,L – a levegő anyagállandója [Wh/(m³·K)]; a jelmagyarázat ρ_a, c_p,a jelölést használ (ugyanaz a mennyiség). Egyszerűsített módszerben **fix: ρ_a · c_p,a = 0,34 Wh/(m³·K)**
- θ_int,i, θ_e – mint fent [°C]

Megjegyzés: az egyszerűsített módszerben nincs külön infiltráció/gépi szellőzés/hővisszanyerés bontás – egyetlen n_i légcsereszám szerepel.

## 8. Egyszerűsített módszer – épület tervezési hőterhelése

### 8.1 Kimenő adat (Table 11)

| Leírás | Jel | Egység | Felhasználás | Célmodul |
|---|---|---|---|---|
| Épület tervezési hőterhelése | Φ_HL,build | W | hőtermelő rendszer elemeinek (pl. kazán) méretezése | – |

Alkalmazhatóság: állandósult állapotú, egész épületre vonatkozó számítás; csak az 5. fejezet szerinti esetekben/peremfeltételekkel. Nem helyiségenkénti összegzés – az épület egy zónaként kezelt.

### 8.2 Bemenő adatok (Table 12)

Több forrás esetén a sorrend = prioritás.

| Jel | Tartalom | Egység | Forrás (prioritás szerint) |
|---|---|---|---|
| A_k | szerkezet (k) felülete | m² | épületadat / felmérés |
| U_k | hőátbocsátási tényező | W/(m²·K) | épületadat; nemzeti melléklet A.4.3; B.4.3 |
| ΔU_TB | átalányos hőhíd-pótlék | W/(m²·K) | nemzeti melléklet A.3.2 (alternatívaként A.2.1); B.3.2 (alternatívaként B.2.1) |
| V_Build | fűtött épület belső térfogata | m³ | épületadat / felmérés |
| n_Build | épület légcsereszáma | h⁻¹ | épületadat; nemzeti melléklet A.3.4; B.3.4 |
| θ_int,build | épület belső tervezési hőmérséklete | °C | épületadat/terv; nemzeti melléklet A.4.2; B.4.2 |
| θ_e | külső tervezési hőmérséklet | °C | nemzeti melléklet A.4.1 (lábjegyzet a) |
| f_x | hőmérséklet-korrekciós tényező | – | nemzeti melléklet A.3.3 (alternatívaként A.2.4, →f_1); B.3.3 (alternatívaként B.2.4, →f_1) |

Lábjegyzet a: az egyszerűsített módszerben θ_e = θ_e,Ref.
(Megj.: Table 12-ben f_int-ext nem szerepel, szemben a Table 10-zel.)

### 8.3 Számítási eljárás

Sorrend: (1) a termikus burok külső határoló szerkezeteinek összegyűjtése → (2) Φ_T,build (55) → (3) Φ_V,build (56) → (4) Φ_HL,build (54).

#### 8.3.1 Épület tervezési hőterhelése

Az egyszerűsített épületszintű módszerben **nincs felfűtési többletteljesítmény**, ezért a tervezési hőveszteség = tervezési hőterhelés.

```
(54)  [8.3.1]
Φ_HL,build = Φ_T,build + Φ_V,build
```
- Φ_HL,build – épület tervezési hővesztesége [W]
- Φ_T,build – épület transzmissziós hővesztesége, (55) [W]
- Φ_V,build – épület szellőzési hővesztesége, (56) [W]

#### 8.3.2 Épület tervezési transzmissziós hővesztesége

Csak a termikus burok külső felületei számítanak, azaz azok a szerkezetek, amelyek határosak:
- külső levegővel (e),
- fűtetlen terekkel (u),
- talajjal (g).

Belső (fűtött–fűtött) határolók nem szerepelnek.

```
(55)  [8.3.2]
Φ_T,build = Σ_k Φ_T,k = Σ_k ⟨ A_k · (U_k + ΔU_TB) · f_x,k ⟩ · (θ_int,build − θ_e)
```
- Φ_T,k – szerkezet (k) transzmissziós vesztesége [W]
- A_k, U_k, ΔU_TB, f_x,k – mint (51)-nél (ΔU_TB = 0, ha a hőhidak más módon, pl. C melléklet szerint, figyelembe vannak véve)
- θ_int,build – épület belső tervezési hőmérséklete [°C]
- θ_e – külső tervezési hőmérséklet [°C]

#### 8.3.3 Épület tervezési szellőzési hővesztesége

```
(56)  [8.3.3]
Φ_V,build = V_build · n_build · ρ_L · c_p,L · (θ_int,build − θ_e)
```
- V_build – épület belső (levegő)térfogata [m³]
- n_build – épület légcsereszáma [h⁻¹]
- ρ_a · c_p,a (= ρ_L · c_p,L) – levegő anyagállandója; egyszerűsített módszerben **fix 0,34 Wh/(m³·K)**
- θ_int,build, θ_e [°C]

## 9. Megfelelőség-ellenőrzés (Compliance check)

Megjegyzés: a 9. fejezet a 54. oldalon véget ér (9.1–9.3); az 55. oldalon az A melléklet kezdődik. A fejezet nem tartalmaz képletet, sem kötelező jelentés-tartalomjegyzéket – csak méretezési útmutatást ad.

### 9.1 Általános

A szabvány a hőterhelést (helyiség, épületrész, épület) határozza meg, jellemzően a fűtési rendszer elemeinek méretezése előtt. A tényleges méretezést / annak ellenőrzését további tényezők befolyásolják, amelyeket a program eredmény-ellenőrző/riport moduljában érdemes kezelni (bemenetként vagy figyelmeztetésként):
- több hőleadó egy helyiségben → a hőterhelés százalékos felosztása hőleadónként;
- jelentős HMV-igény esetén a használati melegvíz-készítés teljesítménye;
- több hőtermelő esetén az egyes hőtermelőkre jutó teljesítményarány, vagy feladathoz rendelés (HMV, fűtés, klíma stb.);
- a szükséges teljesítményű hőtermelők/hőleadók piaci elérhetősége;
- az eredmények módosítása olyan rendszer- vagy épülettulajdonságok miatt, amelyeket a szabvány nem kezel;
- gazdaságossági szempontok stb.

Ezeket figyelembe kell venni, amikor a fűtési rendszert/elemeit a szabvány szerinti hőterhelés alapján ellenőrzik. A 9.2/9.3 ad iránymutatást.

### 9.2 Hőleadó rendszerek méretezése

Ellenőrzési szabály (helyiségenként):
- A helyiséghez rendelt összes hőleadó együttes teljesítménye (külső tervezési állapotban) **ne legyen jelentősen kisebb**, mint a helyiség számított hőterhelése (Φ_HL,i).
- Az "összes fűtőteljesítménybe" beleszámít minden, a helyiséghez rendelt hőleadó (radiátor, légfűtő/recirkulációs készülék, felületfűtés, betonmag-temperálás stb.), valamint – ha van – a helyiségbe befújt levegő előfűtése (pl. központi légkezelés).
- A "jelentősen" mértékét a szabvány nem számszerűsíti [?] → a programban konfigurálható tűrés javasolt.

Programszerűen: Σ Φ_emitter,i (+ Φ_légelőfűtés,i) ≥ Φ_HL,i · (1 − tűrés) → különben figyelmeztetés.

### 9.3 Hőtermelők méretezése

Ellenőrzési szabály (épület/épületrész szinten), ha nincs HMV-készítés vagy annak teljesítményigénye elhanyagolható:
- Az összes hőtermelő együttes teljesítménye (külső tervezési állapotban, beleértve az esetleges légelőfűtést) **se jelentősen kisebb, se jelentősen nagyobb** ne legyen, mint az általa fűtött épület(ek)/épületrész(ek) összes hőterhelése.
- A tűréshatárt a szabvány nem számszerűsíti [?] → konfigurálható alsó és felső tűrés.

### Riportba javasolt tartalom (a 9. fejezetből levezetve, saját összefoglalás)
- helyiségenként: Φ_HL,i, Φ_T,i, Φ_V,i, Φ_hu,i és a hozzárendelt hőleadók összteljesítménye, eltérés %-ban;
- több hőleadó esetén a teljesítmény-megosztás hőleadónként;
- épület/épületrész szinten: összes hőterhelés és a hőtermelők összteljesítménye, alul-/túlméretezés jelzése;
- HMV-teljesítmény, ha jelentős, és a hőtermelők feladat szerinti hozzárendelése;
- a szabvány által nem kezelt, kézzel alkalmazott korrekciók külön jelölve, indoklással.


---

# A és B melléklet – bemeneti adatok, alapértékek (EN 12831-1:2017, 55–75. o.)

## A melléklet: nemzetileg megadandó tételek

Az A melléklet (normatív) csak sablon: üres táblázatszerkezeteket ad, amelyeket a nemzeti melléklet tölt ki. Ha nincs nemzeti adat, a B melléklet (tájékoztató) alapértékei érvényesek. A nemzeti melléklet a szerkezetet módosíthatja (sorok hozzáadása/törlése, kategóriák cseréje).

Nemzetileg megadandó (zárójelben a B-beli tartalék):

- **A.2.1** Hőhíd-pótlék ΔU_TB [W/(m²K)] kiválasztási kritériumok szerint (A.1 tábla) – vagy más módszer (pl. részletes, C melléklet). → B.2.1 / B.1 tábla
- **A.2.2** U-érték korrekciós tényező f_U,k (szerkezeti és meteorológiai hatások). → B.2.2 (=1)
- **A.2.3** Talaj: f_θann (külső hőm. éves ingadozása), f_GW (talajvíz), valamint egyszerűsített U_equiv,k módszer. → B.2.3, E melléklet
- **A.2.4** f_1 hőmérséklet-igazító tag fűtetlen terek felé (A.2 tábla). → B.2.4 / B.2 tábla
- **A.2.5** Szomszédos, fűtetlennek tekintett épületrészek belső hőmérséklete θ_u. → D melléklet
- **A.2.6** Hőleadó rendszer hatása magas terekben: G_θair, Δθ_rad, Δθ_surf (padló/fal/mennyezet) (A.3 tábla), valamint h_occup (tartózkodási zóna magassága). → B.3 tábla, h_occup = 1 m
- **A.2.7** Fajlagos hőtároló képesség c_eff kategóriánként (A.4 tábla). → B.4 tábla
- **A.2.8** Levegő sűrűsége ρ és fajhője c_p. → ρ·c_p = 0,34 Wh/(m³K)
- **A.2.9** f_i-z helyiség/zóna térfogatáram-arány (A.5 tábla). → B.5 tábla
- **A.2.10** Légtömörség: q_env,50 vagy n_50 osztályonként (A.6 tábla) + méretezési konvenció (belső/külső méret, mely szerkezetek). → B.6 tábla
- **A.2.11** Minimális légcsereszám n_min helyiségtípusonként (A.7 tábla). → B.7 tábla
- **A.2.12** f_qv,z térfogatáram-arány együttható (A.8 tábla: homlokzatszám, zónamagasság terep felett, Δh_z, árnyékoltság). → B.8 tábla
- **A.2.13** Külső légbevezetők (ATD) tervezési adatai: q_v,ATD,design,i, q_v,ATD,design,z, Δp_ATD,design,z. → B.2.12
- **A.2.14** Résáramlási nyomáskitevő v_leak,z. → 0,67
- **A.2.15** Tájolási tényező f_dir,z. → 2
- **A.2.16** Homlokzatszám-tényező f_fac,z (EN ISO 13789 szerint, A.9 tábla). → B.9 tábla
- **A.2.17** Nagy nyílásokon át áramló légmennyiség q_v,open,i, q_v,open,z (termikus és/vagy szél). → G melléklet
- **A.2.18** Felfűtési többletteljesítmény Φ_hu szakaszos fűtésnél. → F melléklet
- **A.2.19** Hőnyereség Φ_gain módszere/alapértéke, ha a nemzeti szabályozás figyelembe veszi; egyébként Φ_gain = 0.
- **A.3.1** Külső/belső felületarány f_int-ext szerkezetenként (A.10 tábla). → B.10 tábla
- **A.3.2** Egyszerűsített hőhíd-pótlék ΔU_TB (vagy A.2.1 értékei). → 0,1 W/(m²K)
- **A.3.3** Hőmérséklet-korrekciós tényező f_x (e/u/g/j) (A.11 tábla), vagy f_1 az A.2.4 szerint. → B.11 tábla
- **A.3.4** Légcsereszám az egyszerűsített módszerekhez (7: helyiség, 8: épület) (A.12 tábla). → B.12 tábla
- **A.4.1** Klímaadatok: θ_e,m (éves középhőm.), θ_e,Ref (méretezési külső hőm., pl. EN ISO 15927-5 szerint), referencia-helyszínek (szövegesen vagy térképen, A.1 ábra), továbbá h_Ref, G_θ,Ref, Δθ_e,τ,0, k_τ, Δθ_e,τ,min, Δθ_e,τ,max (A.13 tábla; A: országos egy sor, B: referencia-helyszínenként, C: hőmérséklet-igazítás nélkül, θ_e = θ_e,Ref). → B.4.1: külső hőmérsékletre nincs alapérték, csak B.13 tábla
- **A.4.2** Belső méretezési hőmérséklet θ_int épület/helyiségtípusonként (A.14 tábla), külön is a standard és az egyszerűsített módszerre. → B.14 tábla
- **A.4.3** Egyszerűsített U-érték becslés: külső falak, padlók, tetők; belső falak, födémek; ablakok. → B.4.3

---

## B.1 Általános

A B melléklet tájékoztató jellegű alapértékeket ad, amelyek akkor érvényesek, ha nincs nemzeti adat (A melléklet). Nem minden A-beli tételhez van B-beli érték (pl. klímaadat).

Megjegyzés a számozáshoz: a B.2.10 alpont után a „Minimális légcsereszám” számozatlan bekezdésként szerepel, ezért a B.2.11-től a B-számozás eggyel elcsúszik az A-hoz képest (A.2.12 ↔ B.2.11, A.2.13 ↔ B.2.12, …, A.2.19 ↔ B.2.18).

## B.2.1 Hőhidak figyelembevétele

Átalány hőhíd-pótlék ΔU_TB, ha nincs nemzeti adat.

**B.1 tábla – Hőhíd-pótlék ΔU_TB** · JSON: `dU_TB_standard`

| Kiválasztási kritérium | ΔU_TB [W/(m²K)] |
|---|---|
| Új épület, magas hőszigetelési szint, igazoltan az általános gyakorlatot meghaladó hőhíd-minimalizálással | 0,02 |
| Új épület, az általánosan elismert hőhíd-minimalizálási szabályoknak megfelelően | 0,05 |
| Túlnyomóan belső oldali hőszigeteléssel, tömör födémek (pl. vasbeton) által megszakítva | 0,15 |
| Minden egyéb épület | 0,10 |

Javasolt kulcsok: `new_high_attested`, `new_standard`, `internal_insulation_broken`, `other`.

## B.2.2 U-érték korrekció (szerkezet, meteorológia)

f_U,k nemzetileg adandó. Ha nem kell korrekció (pl. EN ISO 6946 szerinti U) vagy nincs nemzeti adat:

```
f_U,k = 1
```

JSON: `f_U_k_default = 1.0`

## B.2.3 Talajon át történő hőveszteség

```
f_θann = 1,45
f_GW   = 1,00   ha a feltételezett talajvízszint és a padlólemez távolsága > 1 m
f_GW   = 1,15   ha ez a távolság ≤ 1 m
```

JSON: `ground_factors = { "f_theta_ann": 1.45, "f_GW": [ {"dist_gt_1m": 1.00}, {"dist_le_1m": 1.15} ] }`

Az egyenértékű U_equiv,k egyszerűsített meghatározása nemzeti; ennek hiányában az E melléklet (tájékoztató) alkalmazandó.

## B.2.4 Hőmérséklet-igazítás fűtetlen terek felé (f_1)

Fűtetlen tér felé, **4 m-nél kisebb belmagasság esetén** f_1 a B.2 táblából vehető, ha nemzetileg nincs más előírva.

**B.2 tábla – f_1 hőmérséklet-igazító tag** · JSON: `f1_unheated`

| Fűtetlen tér | Részletezés | | f_1 |
|---|---|---|---|
| Helyiség / szomszédos helyiségcsoport | 1 külső fal | | 0,4 |
| Helyiség / szomszédos helyiségcsoport | 2 külső fal | külső ajtó nélkül | 0,5 |
| Helyiség / szomszédos helyiségcsoport | 2 külső fal | külső ajtóval | 0,6 |
| Helyiség / szomszédos helyiségcsoport | ≥ 3 külső fal; pl. külső (fűtött [?: így szerepel – „external (heated) staircase”]) lépcsőház | | 0,8 |
| Pince ^a | külső ajtó/ablak nélkül | | 0,5 |
| Pince ^a | külső ajtóval/ablakkal | | 0,8 |
| Tetőtér (padlás) | nagy légcsere; pl. nem folytonos fedés (cserép stb.) záró alátéthéjazat nélkül | | 1,0 |
| Tetőtér (padlás) | egyéb, hőszigeteletlen tető | | 0,9 |
| Tetőtér (padlás) | hőszigetelt tető | | 0,7 |
| Közlekedőtér | belső tér (külső fal nélkül), kis légcsere (≤ 0,5 h⁻¹) | | 0,0 |
| Közlekedőtér | szabadon szellőző: A_openings / V > 0,005 [m²/m³] | | 1,0 |
| Padló | függesztett (padló mászótér felett) | | 0,8 |

^a Egy helyiség pincének tekinthető, ha a külső falfelületének több mint 70 %-a talajjal érintkezik.

Javasolt kulcsok: `room_1ext`, `room_2ext_nodoor`, `room_2ext_door`, `room_3plus_ext`, `basement_noopen`, `basement_open`, `roof_high_vent`, `roof_uninsulated`, `roof_insulated`, `circ_internal_lowvent`, `circ_free_vent`, `floor_crawlspace`.

Feltételek a programban: `h_room < 4 m`; pince-osztályozás: `A_wall_ground / A_wall_ext > 0.70`; szabadon szellőző közlekedő: `A_openings / V > 0.005 m²/m³`; kis légcsere: `n ≤ 0.5 1/h`.

## B.2.5 Szomszédos épületrészek belső hőmérséklete

θ_u nemzetileg adandó; ennek hiányában a D melléklet alkalmazandó. Itt nincs táblázat.

## B.2.6 Hőleadó rendszer hatása magas terekben

A 6.3.8 szerinti közepes belső hőmérsékletek számításához szükséges paraméterek; nemzeti adat hiányában a B.3 tábla.

**B.3 tábla – Hőleadási jellemzők** · JSON: `emission_high_rooms`

| Hőleadó rendszer | G_θair,i [K/m] | Δθ_rad [K] | Δθ_surf padló [K] | Δθ_surf fal [K] | Δθ_surf mennyezet [K] |
|---|---|---|---|---|---|
| Meleglevegős fűtés, kiegészítő destratifikáció nélkül | 1,00 | 0,00 | 0,00 | 0,00 | 0,00 |
| Meleglevegős fűtés, kiegészítő destratifikációval | 0,35 | 0,00 | 0,00 | 0,00 | 0,00 |
| Mennyezeti sugárzó panel | 0,35 | 1,50 | 0,00 | 0,00 | 0,00 |
| Sugárzócsöves hősugárzó (sötétsugárzó) | 0,20 | 1,50 | 0,00 | 0,00 | 0,00 |
| Világító (fényes) hősugárzó | 0,20 | 1,50 | 0,00 | 0,00 | 0,00 |
| Felületbe épített hőleadó (padló-/fal-/mennyezetfűtés) | 0,20 | 1,50 | 1,50 ^a | 1,50 ^a | 1,50 ^a |
| Radiátor | 1,00 | 0,00 | 0,00 | 0,00 | 0,00 |

^a A Δθ_surf értéket csak a fűtött felületre kell alkalmazni (pl. padlófűtéses helyiségben a padlóra). Nem fűtött felületeken Δθ_surf = 0 K.

Javasolt kulcsok: `warm_air_no_destrat`, `warm_air_destrat`, `ceiling_radiant_panel`, `radiant_tube`, `luminous_radiant`, `surface_embedded`, `radiator`.

Tartózkodási zóna magassága (ha nemzetileg nincs megadva):

```
h_occup = 1 m
```

## B.2.7 Fajlagos hőtároló képesség c_eff

**B.4 tábla – Térfogatra vonatkoztatott hőtároló képesség** · JSON: `c_eff`

| Kategória | Jellemzés | c_eff [Wh/(m³K)] |
|---|---|---|
| alacsony (`low`) | a) nagy belső/külső térfogatarány (pl. ipari és raktárcsarnok); b) túlnyomóan könnyűszerkezet: 1) könnyű tetők, 2) könnyű falak (fa vázas, szendvicspanel stb.); c) álmennyezetek; d) emelt padlók | 15 |
| közepes/magas (`medium_high`) | a) kis belső/külső térfogatarány, kis belmagasság, vastag falak; b) túlnyomóan nehézszerkezet: 1) tégla- vagy betonfalak, 2) beton födémek/mennyezetek | 50 |

(A tábla címe az eredetiben tévesen „national default values”.)

## B.2.8 A levegő fajlagos jellemzői

```
ρ · c_p = 0,34 Wh/(m³·K)
```

JSON: `rho_cp_air = 0.34`

## B.2.9 Helyiség (i) / zóna (z) térfogatáram-arány

**B.5 tábla – f_i-z** · JSON: `f_i_z`

| Helyiségek száma a zónában | f_i-z |
|---|---|
| 1 | 1 |
| ≥ 2 | 0,5 |

## B.2.10 Légtömörség

A külső levegővel érintkező épületburok légáteresztése (q_env,50) a B.6 tábla szerint.

**B.6 tábla – Légáteresztés q_env,50** · JSON: `q_env50_class`

| Légtömörségi osztály | Légtömörség-mérés | Légtömörségi követelmény | q_env,50 [m³/(m²h)] |
|---|---|---|---|
| I | átadás után mérés lesz | magas | 2 |
| II | átadás után mérés lesz | közepes | 3 |
| III | nem volt és nem is lesz mérés | közepes | 6 |
| IV | nem volt és nem is lesz mérés | alacsony ^a | 12 |

^a Meglévő épületállománynál, légtömörségi adat hiányában alacsony követelmény feltételezhető olyan épületekben, amelyek: alacsony belső hőmérsékleti igényűek; hőmérséklet-érzéketlen/-tűrő áruk tárolására szolgálnak; alig használtak, vagy sok nyilvánvaló réssel bírnak.

Kulcsok: `"I": 2, "II": 3, "III": 6, "IV": 12`.

### Minimális légcsereszám (számozatlan bekezdés a B.2.10-ben)

n_min nemzetileg adandó; ennek hiányában a B.7 tábla. **3 m-nél nagyobb belmagasságnál nem javasolt** használni.

**B.7 tábla – n_min** · JSON: `n_min`

| Helyiségtípus | n_min [h⁻¹] |
|---|---|
| Állandó tartózkodású terek; pl. nappali, iroda (`permanent`) | 0,5 |
| Konyha, fürdő, WC stb. (ablakkal) (`wet_with_window`) | 0,5 |
| Mellékhelyiségek, belső (ablaktalan) helyiségek (`secondary_internal`) | 0,0 |

## B.2.11 Térfogatáram-arány együttható f_qv,z

**B.8 tábla – f_qv,z** · JSON: `f_qv_z`

(Az eredeti egyesített cellái itt kibontva, minden sorra kiírva.)

| Kitett homlokzatok | Zóna magassága terep felett h_g,z | Árnyékoltság | Δh_z ≤ 5 m | 5 < Δh_z ≤ 10 m | 10 < Δh_z ≤ 20 m | Δh_z > 20 m |
|---|---|---|---|---|---|---|
| Egy külső homlokzat | – | – | 0,03 | 0,05 | 0,08 | 0,11 |
| Több külső homlokzat | 0 m < h_g,z ≤ 50 m | intenzív ^a | 0,03 | 0,05 | 0,08 | 0,11 |
| Több külső homlokzat | 0 m < h_g,z ≤ 50 m | normál ^b | 0,05 | 0,05 | 0,08 | 0,11 |
| Több külső homlokzat | 0 m < h_g,z ≤ 50 m | nincs ^c | 0,07 | 0,07 | 0,08 | 0,11 |
| Több külső homlokzat | h_g,z > 50 m | – | 0,09 | 0,09 | 0,09 | 0,11 |

^a Intenzív árnyékolás: pl. belváros vagy erdő.
^b Normál árnyékolás: pl. néhány épülettel vagy fával lazán körülvett.
^c Nincs árnyékolás: szabad terület.

Javasolt JSON-szerkezet: `{"one_facade": [0.03,0.05,0.08,0.11], "multi_le50_intensive": [...], "multi_le50_normal": [...], "multi_le50_none": [...], "multi_gt50": [0.09,0.09,0.09,0.11]}`, Δh_z-sávhatárok: `[5, 10, 20]` (felső határ zárt: ≤).

## B.2.12 Külső légbevezetők (ATD) tervezési adatainak becslése

- Ha minden ATD (vagy minden ATD-s helyiség) tervezési térfogatárama ismert: a zóna értéke a helyiségek összege (B.1).
- Ha csak a zóna összes ATD-térfogatárama ismert: helyiségekre térfogatarányosan szétosztjuk (B.2).
- Ha egyik sem ismert: a zóna értéke 0,3 h⁻¹ × zónatérfogat (B.3), majd szétosztás (B.2) szerint.

```
q_v,ATD,design,z = Σ_i ( q_v,ATD,design,i )                                        (B.1)

q_v,ATD,design,i = V_i / Σ_i(V_i)_ATD · q_v,ATD,design,z                            (B.2)

q_v,ATD,design,z = 0,3 [h⁻¹] · V_z = 0,3 [h⁻¹] · Σ_i ( V_i )                         (B.3)
```

ahol
- q_v,ATD,design,z – a zóna összes ATD-tervezési térfogatárama [m³/h]
- q_v,ATD,design,i – a zónához tartozó i helyiség ATD-tervezési térfogatárama [m³/h]
- V_i – az i helyiség belső térfogata [m³]
- Σ_i(V_i)_ATD – a zóna ATD-vel rendelkező helyiségeinek összes belső térfogata [m³]
- V_z, Σ_i(V_i) – a z szellőzési zóna belső térfogata = a zóna összes helyiségének belső térfogatösszege [m³]

ATD tervezési nyomáskülönbség:

```
Δp_ATD,design,z = 4 Pa
```

JSON: `atd = { "n_default_1_h": 0.3, "dp_design_Pa": 4 }`

## B.2.13 Résáramlási nyomáskitevő

```
v_leak,z = 0,67
```

## B.2.14 Tájolási tényező

```
f_dir,z = 2
```

## B.2.15 Homlokzatszám-tényező (EN ISO 13789 szerint)

**B.9 tábla – f_fac,z** · JSON: `f_fac_z`

| Kitett homlokzatok száma | f_fac,z |
|---|---|
| 1 | 12 |
| > 1 | 8 |

## B.2.16 Nagy nyílásokon át áramló levegő

Módszer nemzetileg; ennek hiányában a G melléklet (tájékoztató) használható.

## B.2.17 Felfűtési többletteljesítmény Φ_hu

Módszer nemzetileg; ennek hiányában az F melléklet (tájékoztató) használható.

## B.2.18 Hőnyereség Φ_gain

Eltérő nemzeti előírás hiányában a hőnyereséget figyelmen kívül kell hagyni:

```
Φ_gain = 0
```

---

## B.3.1 Külső és belső felületarány (egyszerűsített módszerek: 7, 8)

**B.10 tábla – f_int-ext** · JSON: `f_int_ext`

| Szerkezet | f_int-ext |
|---|---|
| Függőleges külső fal (`ext_wall`) | 1,25 |
| Tető (`roof`) | 1 |
| Legfelső födém (`top_ceiling`) | 1 |
| Fűtetlen tér (pince stb.) feletti padló (`floor_unheated`) | 1 |
| Talajon fekvő padló (`floor_ground`) | 1 |

## B.3.2 Hőhidak (egyszerűsített)

```
ΔU_TB = 0,1 W/(m²·K)
```

(Az eredetiben elírás: „0,1 W/m²KW/(m²·K)”.) Alternatíva: a B.2.1 (B.1 tábla) standard értékei.

JSON: `dU_TB_simplified = 0.1`

## B.3.3 Hőmérséklet-korrekciós tényező f_x

Nemzeti adat hiányában a B.11 tábla; alternatívaként a B.2.4 szerinti f_1 tagok.

**B.11 tábla – f_x** · JSON: `f_x`

| Szerkezet határoló közege | f_x | Index |
|---|---|---|
| külső levegő (e) | 1,0 | ie |
| fűtetlen tér vagy másik épületrész (u) | 0,5 | iu |
| talaj (g) | 0,3 | ig |
| fűtött tér (j) | 0,3 | ij |

(Fejléc az eredetiben: „Correction facto f_x” – elírás.)

## B.3.4 Légcsereszám (egyszerűsített módszerek)

**B.12 tábla – Légcsereszám n** · JSON: `n_simplified`

| Alkalmazás (módszer) | Légtömörségi szint | Jellemző | n [h⁻¹] |
|---|---|---|---|
| Egyes helyiség hőterhelése (7) | – | – | 0,5 |
| Épület hőterhelése (8) | n_50 ≤ 3 h⁻¹ | építési év ≥ 1995; tömören záró ablakok | 0,25 |
| Épület hőterhelése (8) | 3 h⁻¹ < n_50 ≤ 6 h⁻¹ | építési év < 1995 | 0,5 |
| Épület hőterhelése (8) | n_50 > 6 h⁻¹ | építési év < 1977; nyilvánvaló résekkel bíró épület | 1 |

Javasolt kulcsok: `room_method7: 0.5`, `building_method8: [{"n50_max":3,"n":0.25},{"n50_max":6,"n":0.5},{"n50_max":null,"n":1.0}]`.

---

## B.4.1 Klímaadatok

Külső hőmérsékletre (θ_e,Ref, θ_e,m) a szabvány **nem ad** alapértéket – ezt nemzetileg kell megadni.

Az épület időállandójának (hőtároló képesség + hőszigetelés) hatását kifejező hőmérséklet-igazítás – **csak a standard módszerhez (6)** – nemzeti adat hiányában a B.13 tábla szerint:

**B.13 tábla – Időállandó szerinti hőmérséklet-igazítás** · JSON: `dtheta_e_tau`

| Alapérték Δθ_e,τ,0 [K] | Meredekség k_τ [K/h] | Alsó határ Δθ_e,τ,min [K] | Felső határ Δθ_e,τ,max [K] |
|---|---|---|---|
| −0,800 | 0,016 | 0,000 | 4,000 |

Kulcsok: `{"d0": -0.800, "k_tau": 0.016, "min": 0.000, "max": 4.000}` (az összefüggés maga a fő szövegben, nem a B mellékletben van).

## B.4.2 Belső méretezési hőmérséklet

θ_int,i alapértékei épület-/helyiségtípusonként. Az egész épületre vonatkozó egyszerűsített számításnál (8. fejezet) a legjellemzőbb használati típust kell kiválasztani, és annak értékét az egész épületre alkalmazni.

**B.14 tábla – θ_int,i** · JSON: `theta_int_default`

| Épület/helyiség típusa | θ_int,i [°C] |
|---|---|
| Egyszemélyes iroda (`single_office`) | 20 |
| Egyterű (open-space) iroda (`landscaped_office`) | 20 |
| Tárgyaló (`conference_room`) | 20 |
| Előadóterem (`auditorium`) | 20 |
| Étkezde/étterem (`cafeteria_restaurant`) | 20 |
| Tanterem (`classroom`) | 20 |
| Bölcsőde/óvoda (`nursery`) | 20 |
| Áruház (`department_store`) | 16 |
| Lakás (`residential`) | 20 |
| Fürdőszoba (`bathroom`) | 24 |
| Templom (`church`) | 15 |
| Múzeum/galéria (`museum_gallery`) | 16 |

## B.4.3 U-értékek egyszerűsített meghatározása

### B.4.3.1 Építési év alapján

**B.15 tábla – U-érték becslés építési év szerint [W/(m²K)]** · JSON: `U_by_build_year`

Évsávok (kulcsok): `le1918` (≤ 1918), `1919_48`, `1949_57`, `1958_68`, `1969_78`, `1979_83`, `1984_94`, `ge1995` (≥ 1995). „–” = nem jellemző / nincs érték (`null`).

| Szerkezet | Kivitel | ≤1918 | 1919–48 | 1949–57 | 1958–68 | 1969–78 | 1979–83 | 1984–94 | ≥1995 |
|---|---|---|---|---|---|---|---|---|---|
| Ablak, erkélyajtó | fa keret, egyrétegű üvegezés | 5,0 | 5,0 | 5,0 | 5,0 | 5,0 | 5,0 | – | – |
| Ablak, erkélyajtó | fa keret, kétrétegű üvegezés | 2,7 | 2,7 | 2,7 | 2,7 | 2,7 | 2,7 | 2,7 | – |
| Ablak, erkélyajtó | fa keret, hőszigetelő üvegezés | – | – | – | – | – | – | – | 1,8 |
| Ablak, erkélyajtó | műanyag keret, hőszigetelő üvegezés | – | – | – | 3,0 | 3,0 | 3,0 | 3,0 | 1,8 |
| Ablak, erkélyajtó | fém keret, hőszigetelő üvegezés | – | – | – | 4,3 | 4,3 | 4,3 | 4,3 | 1,8 |
| Redőny(tok) | régi, hőszigeteletlen | 3,0 | 3,0 | 3,0 | 3,0 | 3,0 | 3,0 | 3,0 | 3,0 |
| Redőny(tok) | új, hőszigetelt | 1,8 | 1,8 | 1,8 | 1,8 | 1,8 | 1,8 | 1,8 | 1,8 |
| Ajtók | – | 3,5 | 3,5 | 3,5 | 3,5 | 3,5 | 3,5 | 3,5 | 3,5 |
| Külső fal, talajjal érintkező fal, fűtetlen pince felé néző belső fal | tömör (falazott, beton v. hasonló) | 1,7 | 1,7 | 1,4 | 1,4 | 1,0 | 0,8 | 0,6 | 0,5 |
| Külső fal, talajjal érintkező fal, fűtetlen pince felé néző belső fal | faszerkezet (favázas, előregyártott ház v. hasonló) | 2,0 | 2,0 | 1,4 | 1,4 | 0,6 | 0,5 | 0,4 | 0,4 |
| Talaj / fűtetlen pince feletti födém | tömör (falazott, beton v. hasonló) | 1,2 | 1,2 | 1,5 | 1,0 | 1,0 | 0,8 | 0,6 | 0,6 |
| Talaj / fűtetlen pince feletti födém | fagerendás födém | 1,0 | 0,8 | 0,8 | 0,8 | 0,6 | 0,6 | 0,4 | 0,4 |
| Tető és fűtött/fűtetlen padlástér közötti fal | tömör szerkezet | 2,1 | 2,1 | 2,1 | 2,1 | 0,6 | 0,5 | 0,4 | 0,3 |
| Tető és fűtött/fűtetlen padlástér közötti fal | faszerkezet | 2,6 | 1,4 | 1,4 | 1,4 | 0,8 | 0,5 | 0,4 | 0,3 |
| Legfelső födém, külső levegő feletti födém (átjáró stb.) | tömör | 2,1 | 2,1 | 2,1 | 2,1 | 0,6 | 0,5 | 0,4 | 0,3 |
| Legfelső födém, külső levegő feletti födém (átjáró stb.) | fagerendás födém | 1,0 | 0,8 | 0,8 | 0,8 | 0,6 | 0,4 | 0,3 | 0,3 |

Megjegyzések: a redőny és ajtó sorok az eredetiben az összes évsávon átívelő egyetlen értéket tartalmaznak (itt kibontva). A pincefödém „tömör” sorában az 1949–57 sáv 1,5-e nagyobb, mint a szomszédos értékek – a képen egyértelműen így olvasható, nem elírás az átírásban.

### B.4.3.2 Utólag hőszigetelt szerkezetek

**B.16 tábla – U-érték utólagos hőszigeteléssel [W/(m²K)]** · JSON: `U_retrofit_insulation`

Sorok: kiinduló U (szigetelés nélkül); oszlopok: utólagos hőszigetelés vastagsága [cm].

| U szigetelés nélkül [W/(m²K)] | 2 cm | 5 cm | 8 cm | 12 cm | 16 cm | 20 cm | 30 cm | 40 cm |
|---|---|---|---|---|---|---|---|---|
| U > 2,5 | 1,20 | 0,63 | 0,53 | 0,30 | 0,23 | 0,19 | 0,13 | 0,10 |
| 2,0 < U ≤ 2,5 | 1,11 | 0,61 | 0,42 | 0,29 | 0,23 | 0,19 | 0,13 | 0,10 |
| 1,5 < U ≤ 2,0 | 1,00 | 0,57 | 0,40 | 0,29 | 0,22 | 0,18 | 0,13 | 0,10 |
| 1,0 < U ≤ 1,5 | 0,86 | 0,52 | 0,38 | 0,27 | 0,21 | 0,18 | 0,12 | 0,09 |
| 0,7 < U ≤ 1,0 | 0,67 | 0,44 | 0,33 | 0,25 | 0,20 | 0,17 | 0,12 | 0,09 |
| 0,5 < U ≤ 0,7 | 0,52 | 0,37 | 0,29 | 0,23 | 0,18 | 0,16 | 0,11 | 0,09 |
| U ≤ 0,5 | 0,40 | 0,31 | 0,25 | 0,20 | 0,17 | 0,14 | 0,11 | 0,08 |

Programozási javaslat: sávhatárok `[0.5, 0.7, 1.0, 1.5, 2.0, 2.5]` (felső határ zárt), vastagságok `[2,5,8,12,16,20,30,40]`; köztes vastagságnál a szabvány nem ír elő interpolációt [?: a szöveg erről hallgat – programozói döntés, javasolt a kisebb vastagság értéke (biztonság javára)].

### B.4.3.3 U-érték becslése hőmérsékletméréssel

Opak szerkezetek U-értéke helyszíni mérésből becsülhető a (B.4) képlettel (a képlet a 76. oldalon folytatódik – nem ennek a szakasznak a része). Peremfeltételek:

- a) csak fűtött tér és külső levegő közötti opak szerkezetre;
- b) minimális sugárzási hatás: 1) borult ég, 2) sugárzás ellen árnyékolt hőmérséklet-érzékelők;
- c) stacioner állapot: nincs számottevő változás 1) a belső, 2) a külső hőmérsékletben és sugárzásban;
- d) nyugvó levegő;
- e) pontos mérés: 1) belső–külső léghőmérséklet-különbség ≥ 10 °C, 2) mérési bizonytalanság ≤ ±0,1 °C;
- f) felületi hőmérséklet csak sík felületen, a legközelebbi hőhídtól legalább a szerkezetvastagság háromszorosára, de min. 1 m-re.


---

## Annex B / B (folytatás, 76. old.) – U-érték meghatározása helyszíni hőmérséklet-mérésből

**Cél:** meglévő, nem ismert rétegrendű, nem átlátszó szerkezet U-értékének becslése egyidejű belső levegő-, belső felületi és külső léghőmérséklet mérésből.

**Eljárás:** a belső felületi hőátadási ellenállást (R_si) a szerkezet típusa szerint a B.17 táblázatból kell venni; az U a belső oldali hőmérséklet-esés és a teljes hőmérséklet-különbség arányából adódik.

```
U = (1 / R_si) · (θ_meas,int − θ_meas,si) / (θ_meas,int − θ_meas,e)        (B.4)
```

| Jel | Jelentés | Mértékegység |
|---|---|---|
| U | nem átlátszó szerkezet hőátbocsátási tényezője | W/(m²·K) |
| R_si | belső hőátadási ellenállás (B.17 táblázat) | m²K/W |
| θ_meas,int | mért belső léghőmérséklet | °C |
| θ_meas,si | mért belső felületi hőmérséklet | °C |
| θ_meas,e | mért külső léghőmérséklet | °C |

**B.17 táblázat – Belső hőátadási ellenállás** (JSON kulcs: `rsi_meres_B17`)

| Szerkezet | R_si [m²K/W] |
|---|---|
| Függőleges fal | 0,13 |
| Födém fűtött terek között | 0,17 |
| Födém/padló fűtetlen tér felé | 0,11 |

Javasolt kulcsok: `fuggoleges_fal`, `fodem_futott_kozott`, `fodem_padlo_futetlen_fele`.

---

## Annex C / C – Hőhidak részletes figyelembevétele (tájékoztató)

**Cél:** ha a transzmissziós hőátviteli tényezőnél nem átalány-pótlékot (ΔU_TB), hanem tételes hőhíd-számítást kell alkalmazni, ez a módszer adja H_T,12-t. Nemzeti módszerrel helyettesíthető vagy módosítható.

**Eljárás (program):**
1. Felületi elemek (k): A_k · U_k · e_k · f_12,k összegzése.
2. Vonalmenti hőhidak (l): l_l · Ψ_l · e_l · f_12,l összegzése. Az l hossz méretezési konvenciója kövesse Ψ konvencióját (külső méret ↔ külső méretre vonatkozó Ψ, belső méret ↔ belső méretre vonatkozó Ψ).
3. Pontszerű hőhidak (m): χ_m · e_m · f_12,m összegzése.
4. f_12 a 6.3.2 szerint (magas belmagasságú helyiségek hőleadó-hatása, ill. H_T igazítása a külső méretezési hőmérséklettől eltérő túloldali hőmérséklethez); ha nem kell hőmérséklet-korrekció: f_12 = 1.

```
H_T,12 = Σ_k ⟨A_k · U_k · e_k · f_12,k⟩ + Σ_l ⟨l_l · Ψ_l · e_l · f_12,l⟩ + Σ_m ⟨χ_m · e_m · f_12,m⟩        (C.1)
```

| Jel | Jelentés | Mértékegység |
|---|---|---|
| H_T,12 | hőátviteli tényező az (1) térből a (2) térbe | W/K |
| A_k | k szerkezet felülete | m² |
| U_k | k szerkezet hőátbocsátási tényezője (EN ISO 6946 nem átlátszó; EN ISO 10077-1 ajtó/ablak; európai műszaki engedély adatai) | W/(m²·K) |
| f_U,k/l/m (a képletben e_k/e_l/e_m) | korrekciós tényező az épületrész-tulajdonságok és meteorológiai viszonyok hatására; csak külső tér felé érvényes [?: a képletben „e”, a jelmagyarázatban „f_U” szerepel] | – |
| f_12,k/l/m | hőmérséklet-igazító tényező (6.3.2); korrekció nélkül 1 | – |
| Ψ_l | vonalmenti hőhíd hőátbocsátási tényezője | W/(m·K) |
| l_l | vonalmenti hőhíd hossza | m |
| χ_m | pontszerű hőhíd hőátbocsátási tényezője | W/K |

Táblázat nincs.

---

## Annex D / D – Szomszédos épületegységek / fűtetlen terek belső hőmérséklete θ_u (tájékoztató)

**Cél:** állandósult hőmérleg alapján becsülni (1) szomszédos, használaton kívüli épületegység (pl. lakás), vagy (2) épületegységhez nem tartozó fűtetlen tér (padlás, pince, folyosó) hőmérsékletét, ha a burok felületei/minősége és a szomszédos terek hőmérséklete ismert. Nemzeti módszerrel helyettesíthető.

**Feltevések (épületegység mint szomszéd):**
- a) Az (u) egység lakatlan, nem fűtik a használók; hőmérséklete a környezettel való hőcseréből adódik, vagy a fűtőrendszer tartja (fagyvédelem).
- b) A lakatlan állapot elég hosszú a kiegyenlítődéshez → (u) belső falait figyelmen kívül hagyjuk; θ_u az egész egység (pl. teljes lakás) jellemzője.
- c) A szomszédos (j) terek hőmérséklete a D.2 táblázat szerint: rendszeresen használt egységek → belső méretezési hőmérséklet; alkalmanként használt egységek → fűtetlennek tekintve, várható legalacsonyabb hőmérséklet (θ_j,min).
- d) Nincs számottevő légcsere (u) és környezete között – szellőzési hőátadás elhanyagolva.

**Program-logika:**
1. θ_u-t minden olyan épületegységre ki kell számítani, amely másik épületegységgel határos ugyanabban az épületben.
2. Az (u)-t határoló minden (j) térre: H_T,uj és θ_j a D.2 táblázatból.
3. θ_u = a H_T,uj-vel súlyozott θ_j átlag, alulról korlátozva θ_u,min-nel (D.1 táblázat).
4. Ajánlás az alulhatározott modell elkerülésére: a fűtetlen tereket (2) NE a D.1 képlettel számold, hanem rögzített értéket rendelj hozzájuk a D.2 táblázat szerint; a D.1 képletet csak a szomszédos épületegységekre (1) alkalmazd.

```
θ_u = max⟨ Σ_j⟨H_T,uj · θ_j⟩ / Σ_j⟨H_T,uj⟩ ; θ_u,min ⟩        (D.1)
```

| Jel | Jelentés | Mértékegység |
|---|---|---|
| θ_u | az (u) tér belső hőmérséklete | °C |
| θ_u,min | az (u) egység szabályozással/fagyvédelemmel tartott minimális hőmérséklete (D.1 táblázat) | °C |
| θ_j | az (u)-val határos (j) tér hőmérséklete (D.2 táblázat) | °C |
| θ_e | külső méretezési hőmérséklet | °C |
| H_T,uj | transzmissziós hőátviteli tényező (j) és (u) között (D.2 táblázat) | W/K |

**D.1 táblázat – Az (u) tér minimális hőmérséklete** (JSON kulcs: `theta_u_min_D1`)

| Eset | θ_u,min [°C] |
|---|---|
| Fűtőrendszer fagyvédelemmel (központi fűtésnél jellemző) | 5 |
| Nincs fagyvédelem | −∞ |

Kulcsok: `fagyvedelemmel: 5`, `fagyvedelem_nelkul: null` (vagy `-Infinity`).

**D.2 táblázat – A szomszédos (j) terek paraméterei** (JSON kulcs: `szomszed_ter_parameterek_D2`)

| (j) tér típusa | H_T,uj | θ_j |
|---|---|---|
| Azonos épület – tervezetten fűtött – másik épületegység helyisége – rendszeresen használt (pl. lakás) | H_T,ia a 6.3.2.3 szerint, de f_1 = 1 (6.3.2.5) | θ_int,j a 6. táblázat szerint (lásd θ_int,i) |
| Azonos épület – tervezetten fűtött – másik épületegység helyisége – alkalmanként használt (pl. üdülőlakás) | H_T,ia a 6.3.2.3 szerint, de f_1 = 1 | θ_j,min ᵃ |
| Azonos épület – tervezetten fűtött – nem tartozik épületegységhez (pl. lakások közötti fűtött belső folyosó) | H_T,ia a 6.3.2.3 szerint, de f_1 = 1 | θ_j,min ᵃ |
| Azonos épület – tervezetten fűtetlen | H_T,ia a 6.3.2.3 szerint, de f_1 = 1 | θ_j,min ᵃ |
| Másik épület része | H_T,ia a 6.3.2.3 szerint, de f_1 = 1 | θ_j,min ᵃ |
| Külső levegő | H_T,ie a 6.3.2.2 szerint (f_1 = 1) | θ_e a 6.3.7 szerint |
| Talaj | H_T,ig a 6.3.2.4 szerint, de f_1 = 1 (6.3.2.5) | θ_e,m a 6. táblázat szerint |

ᵃ θ_j,min: a (j) tér várható legalacsonyabb hőmérséklete méretezési külső viszonyok mellett; nemzetileg rögzítendő. Alapértelmezés hiányában:
- rendszeresen fűtött (j) terekben: ≤ 15 °C, de legfeljebb a (j) belső méretezési hőmérséklete;
- rendszeresen fűtetlen (j) terekben és szomszédos épületekben: ≥ 5 °C, de nem kevesebb, mint az éves külső középhőmérséklet θ_e,m.

(Megjegyzés: a H_T,uj és θ_j oszlop cellái az eredetiben összevontak; a fenti hozzárendelés a cellaösszevonás olvasata – a H_T,ia cella a külső levegő sorig, a θ_j,min cella az „alkalmanként használt” sortól a „másik épület” sorig tart.)

Javasolt alkulcsok: `rendszeresen_hasznalt_egyseg`, `alkalmankent_hasznalt_egyseg`, `futott_kozos_ter`, `tervezetten_futetlen`, `masik_epulet`, `kulso_levego`, `talaj`; alapértékek: `theta_j_min_futott_max: 15`, `theta_j_min_futetlen_min: 5`.

**D.1 ábra – Hőcsere az (u) épületegység és környező (j) terei között (vázlat):** az (u) egységet (θ_u) körülveszik: j=1, 2, 3, 4, 5 szomszédos fűtött terek (θ_j = θ_int,j), j=6 külső levegő/padló alatti irány (θ_6 = θ_e), j=7 alkalmanként használt tér (θ_7 = θ_7,min). Az (u)-n belüli szaggatott vonalak a figyelmen kívül hagyott belső falakat jelölik. Számértéket nem tartalmaz.

---

## Annex E / E – Talajjal érintkező szerkezetek egyenértékű hőátbocsátási tényezője (tájékoztató)

**Cél:** az EN ISO 13370-ből peremfeltételek szűkítésével levezetett, enyhén biztonság javára tévedő egyszerűsített képlet U_equiv,k meghatározására padlóra és pincefalra.

**Érvényességi tartomány (validálandó bemenetek):**
- padlólemez U_fl ≤ 4 W/(m²·K) (EN ISO 6946 szerint számítva);
- pincefal U_bw ≤ 3 W/(m²·K);
- függőleges falvastagság w = 0,4 m (rögzített feltevés);
- talaj hővezetési tényezője λ = 2 W/(m·K) (rögzített feltevés);
- 2 m ≤ B′ ≤ 50 m;
- 0 m ≤ z ≤ 5 m; z = 0 → nincs pincefal; pincefal esetén z > 0.

**Program-logika:**
1. B′ számítása (E.2). Egyes helyiségeknél: az egész épületre számított B′-t kell használni, ha a helyiségnek nincs külső fala, vagy jól hőszigetelt a padlója (U_floor ≤ 0,5 W/(m²·K)); egyébként a helyiségre egyedileg számított B′ (óvatos becslés).
2. Paraméterek (a, b, c1..c3, n1..n3, d) az E.1 táblázatból a szerkezettípus (padló / pincefal) szerint.
3. U_equiv,k az (E.1) képlettel. ΔU_TB = 0, ha a hőhidakat más módon (pl. C melléklet szerint) veszik figyelembe.
4. Pincefalnál c1 = 0 és n1 = 0, így B′ nem hat az eredményre, de B′ ≠ 0 kell legyen (0^0 elkerülése / matematikai konzisztencia).

```
U_equiv,k = a / ( b + (c1 + B')^n1 + (c2 + z)^n2 + (c3 + U_k + ΔU_TB)^n3 ) + d        (E.1)
```

```
B' = A_G / (0,5 · P)        (E.2)
```

| Jel | Jelentés | Mértékegység |
|---|---|---|
| U_equiv,k | a talajjal érintkező k épületrész egyenértékű U-értéke | W/(m²·K) |
| a, b, c, d, n | esetfüggő paraméterek (E.1 táblázat) | – |
| B′ | padlólemez geometriai paramétere (E.2) | m |
| z | a padlólemez felső síkjának mélysége a terepszint alatt (E.1 ábra); z ≥ 0 | m |
| U_k | a talajjal érintkező k szerkezet hőátbocsátási tényezője (EN ISO 6946 analógiájára) | W/(m²·K) |
| ΔU_TB | hőhíd-átalánypótlék; tételes hőhídszámításnál 0 | W/(m²·K) |
| A_G | padlólemez területe | m² |
| P | a padlólemez szabad (exponált) kerülete (E.2 ábra) | m |

**E.1 táblázat – U_equiv,k paraméterei** (JSON kulcs: `uequiv_parameterek_E1`)

| Szerkezet | a | b | c1 | c2 | c3 | n1 | n2 | n3 | d |
|---|---|---|---|---|---|---|---|---|---|
| Padló (`padlo`) | 0,9671 | −7,455 | 10,76 | 9,773 | 0,0265 | 0,5532 | 0,6027 | −0,9296 | −0,0203 |
| Pincefal (`pincefal`) | 0,93328 | −2,1552 | 0 ᵃ | 1,466 | 0,1006 | 0 ᵃ | 0,45325 | −1,0068 | −0,0692 |

ᵃ Pincefalon át történő hőveszteségnél B′-nek nincs hatása; matematikai konzisztencia miatt azonban B ≠ 0 [eredetiben „B”, értsd B′] kell legyen.

**E.1 ábra – Terepszint alatti mélység z:** kétszintes épület metszete, a padlólemez felső síkja a terepszint alatt; z = a terepszint és a padlólemez felső síkja közötti függőleges távolság. Számérték nincs.

**E.2 ábra – Szabad kerület (felülnézeti példák):** 1 = vizsgált fűtött épület/helyiség, 2 = szomszédos fűtött épület/helyiség, 3 = szomszédos fűtetlen épület/helyiség. Vastag vonal = szabad kerület P, szürke = padlólemez. Szabály a példákból: a fűtött szomszéddal (2) közös él NEM számít P-be; a külső térrel és a fűtetlen szomszéddal (3) közös él P-be számít. Számérték nincs.

---

## Annex F / F – Felfűtési teljesítmény szakaszosan fűtött terekben (6.3.4) (tájékoztató)

### F.1 Általános

**Cél:** szakaszos fűtésnél (éjszakai/hétvégi csökkentés) a visszahűlt helyiség elfogadható időn belüli felfűtéséhez szükséges többlet-teljesítmény (φ_hu,i, W/m² padlófelületre) durva becslése.

**Szabályok a programhoz:**
- Elsősorban helyiségenkénti hőterhelésnél (hőleadó méretezés) kell figyelembe venni; a (központi) hőtermelőnél külön mérlegelendő – jellemzően csak egy- és kétlakásos házaknál, lakásonkénti/szintenkénti fűtésnél.
- Hőtermelő túlméretezésének elkerülése: csak a méretezési külső állapotban fellépő felfűtési igényeket, a helyi és központi szabályozást, használói viselkedést, speciális felfűtési stratégiákat és a HMV-rendszer meglévő teljesítménytartalékait kell figyelembe venni.
- Két módszer: F.2 – a használaton kívüli idő (t_du) alapján; F.3 – a csökkentés alatti hőmérséklet-esés (Δθ_sb) alapján.
- Ha a hőmérséklet-esés ismeretlen, F.2 alkalmazható, feltéve: jó hőszigetelés; kis belmagasság (átlagos belmagasság ≤ 3,5 m); a hőmérséklet-esés szabályozással 5 K-re korlátozott (pl. 20 °C → támaszhőmérséklet ≥ 15 °C).
- Ha a hőmérséklet-esés ismert, vagy a fenti feltételek nem teljesülnek (pl. gyenge hőszigetelés): F.3; ismeretlen esésnél F.3 becslőképlete (F.1) használható.

**F.1 ábra – Hőmérséklet-profilok szakaszos fűtésnél (vázlat):** függőleges tengely θ_int, vízszintes t.
- a) Szabad visszahűlés a felfűtés kezdetéig; a belső hőmérséklet a támaszhőmérséklet (θ_support) felett marad.
- b) Szabad visszahűlés a θ_support eléréséig, utána a szabályozás azon tartja a felfűtés kezdetéig.
- Jelölések: t_du = használaton kívüli időszak = t_sb (csökkentési időszak) + t_hu (felfűtési időszak); θ_int,i = célhőmérséklet (belső méretezési hőmérséklet); θ_support = támaszhőmérséklet; Δθ_sb = hőmérséklet-esés a csökkentési időszak végén. Számérték nincs.

### F.2 φ_hu,i meghatározása a használaton kívüli idő alapján

**Eljárás:** φ_hu,i kiolvasása az F.1 táblázatból t_du,i, n_sb,i (légcsere csökkentés alatt), hőtároló-képesség (l/h) és t_hu,i (felfűtési idő) szerint; közbenső értékek lineárisan interpolálhatók. φ_hu,i = 0 → a méretezési hőterhelés elegendő, nincs többlet. Nagyon nagy érték → túlméretezés veszélye, peremfeltételeket (pl. hosszabb felfűtési idő) felül kell vizsgálni. 100 W/m² feletti értékek „> 100”-ként szerepelnek (tájékoztató jelleg; ilyenkor a felfűtési többlet legalább a méretezési hőterhelés nagyságrendjébe esik). Szürke cella (táblázatban `*`): a választott forgatókönyvnél a belső hőmérséklet nagy valószínűséggel 5 K-nél többet esik (→ F.2 feltétele sérül, figyelmeztetés).

**F.1 táblázat – Fajlagos felfűtési teljesítmény φ_hu,i [W/m²], t_du = 8…168 h** (JSON kulcs: `phi_hu_tdu_F1`)

Oszlopfejek:
- t_du,i = 8 h: éjszakai csökkentés lakóépületben; kétműszakos üzem
- t_du,i = 14 h: éjszakai csökkentés irodában; egyműszakos üzem
- t_du,i = 62 h: hétvégi csökkentés
- t_du,i = 168 h: szabadság/üdülési időszak (n_sb nincs megadva: „-”)
- n_sb,i [h⁻¹] ᵃ: 0,1 vagy 0,5; hőtároló-képesség ᵇ: l = alacsony, h = közepes/nagy

`*` = szürke cella (valószínűleg > 5 K hőmérséklet-esés).

| t_hu,i [h] | 8/0,1/l | 8/0,1/h | 8/0,5/l | 8/0,5/h | 14/0,1/l | 14/0,1/h | 14/0,5/l | 14/0,5/h | 62/0,1/l | 62/0,1/h | 62/0,5/l | 62/0,5/h | 168/–/l | 168/–/h |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0,5 | 63 | 16 | 74* | 26 | 88* | 38 | 91* | 56 | 92* | >100 | 92* | >100* | 92* | >100* |
| 1 | 34 | 10 | 43* | 16 | 50* | 29 | 50* | 43 | 55* | 100 | 55* | >100* | 55* | >100* |
| 2 | 14 | 3 | 21* | 8 | 28* | 18 | 28* | 29 | 32* | 86 | 32* | >100* | 32* | >100* |
| 3 | 5 | 0 | 10 | 2 | 17* | 12 | 18* | 21 | 23* | 73 | 22* | 94* | 23* | >100* |
| 4 | 0 | 0 | 3 | 0 | 11* | 7 | 12* | 15 | 17* | 64 | 17* | 84* | 17* | 95* |
| 6 | 0 | 0 | 0 | 0 | 3 | 1 | 5* | 5 | 10* | 52 | 10* | 70* | 10* | 81* |
| 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2* | 31 | 2* | 45* | 2* | 57* |

ᵃ n_sb,i = 0,1 h⁻¹ feltételezhető, ha az ablakok és ajtók zárva vannak. (A fejlécben az egység „[h]”-ként szerepel – helyesen h⁻¹.)
ᵇ l – alacsony; h – közepes/nagy; lásd c_eff, 6.3.5, A.2.7/B.2.7.

Javasolt JSON-struktúra: `phi_hu_tdu_F1[t_du][n_sb][kapacitas][t_hu] = {"ertek": number, "tobb_mint": bool, "szurke": bool}`; „>100” → `{"ertek": 100, "tobb_mint": true}`; 168 h-nál `n_sb = null`.

### F.3 φ_hu,i meghatározása a csökkentés alatti belső hőmérséklet-esés alapján

**Eljárás:** φ_hu,i kiolvasása az F.2 táblázatból Δθ_sb,i, n_sb,i, hőtároló-képesség és t_hu,i szerint; közbenső értékek lineárisan interpolálhatók. Ha Δθ_sb,i ismeretlen, az (F.1) képlettel becsülhető.

**F.2 táblázat – Fajlagos felfűtési teljesítmény φ_hu,i [W/m²], Δθ_sb = 1…5 K** (JSON kulcs: `phi_hu_dtheta_F2`)

Oszlopfej: Δθ_sb,i [K] / n_sb,i [h⁻¹] / hőtároló-képesség (l/h). „–” = nincs adat. (Szürke cella nincs.)

| t_hu,i [h] | 1/0,1/l | 1/0,1/h | 1/0,5/l | 1/0,5/h | 2/0,1/l | 2/0,1/h | 2/0,5/l | 2/0,5/h | 3/0,1/l | 3/0,1/h | 3/0,5/l | 3/0,5/h | 4/0,1/l | 4/0,1/h | 4/0,5/l | 4/0,5/h | 5/0,1/l | 5/0,1/h | 5/0,5/l | 5/0,5/h |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0,5 | 12 | 12 | 14 | 18 | 27 | 28 | 29 | 35 | 39 | 44 | 44 | 53 | 50 | 60 | 58 | 69 | – | – | – | – |
| 1 | 8 | 8 | 10 | 14 | 18 | 21 | 21 | 28 | 26 | 34 | 32 | 43 | 33 | 48 | 41 | 56 | – | – | – | – |
| 2 | 5 | 5 | 7 | 11 | 10 | 15 | 13 | 22 | 15 | 25 | 21 | 33 | 20 | 35 | 28 | 43 | 43 | 85 | 47 | 94 |
| 3 | 3 | 3 | 5 | 10 | 7 | 12 | 10 | 19 | 9 | 20 | 15 | 27 | 14 | 29 | 21 | 37 | 33 | 75 | 37 | 84 |
| 4 | 2 | 2 | 4 | 9 | 5 | 10 | 8 | 17 | 7 | 18 | 13 | 25 | 10 | 26 | 17 | 34 | 28 | 72 | 31 | 76 |

ᵃ n_sb,i = 0,1 h⁻¹ feltételezhető zárt ablakoknál/ajtóknál.
ᵇ l – alacsony; h – közepes/nagy; lásd c_eff, 6.3.5, A.2.7/B.2.7.

Javasolt JSON-struktúra: `phi_hu_dtheta_F2[dtheta_K][n_sb][kapacitas][t_hu] = number | null`.

**Hőmérséklet-esés becslése (ha ismeretlen):**

```
Δθ_sb,i = (θ_int,i − θ_e,sb) · (1 − e^(−t_sb,i / τ))        (F.1)
```

| Jel | Jelentés | Mértékegység |
|---|---|---|
| Δθ_sb,i | hőmérséklet-esés a csökkentési időszak végén | K |
| θ_int,i | belső méretezési hőmérséklet | °C |
| θ_e,sb | külső hőmérséklet a csökkentési időszak alatt; ismeretlen esetén θ_e,sb = θ_e | °C |
| t_sb,i | csökkentési időszak hossza | h |
| τ | épület időállandója | h |

Megjegyzés a programhoz: ha a számított Δθ_sb,i > 5 K, az F.2 táblázat tartományán kívül esik (5 K-nál csak t_hu ≥ 2 h-ra van adat); célszerű figyelmeztetést adni / a szabályozott támaszhőmérséklettel korlátozni (Δθ_sb ≤ θ_int,i − θ_support).

---

## Annex G / G – Nagy nyílásokon át beáramló külső levegő térfogatárama (tájékoztató)

**Cél:** nagy nyílások (pl. nyitott kapuk, nagy ablakok) okozta külső légtérfogatáram közelítése helyiségre (q_v,open,i) és zónára (q_v,open,z), termikus (kéményhatás) és szél okozta komponensekből.

**Program-logika (helyiségenként):**
1. A helyiség homlokzati nyílásfelületeit legfeljebb 4, páronként merőleges irányba csoportosítsd (a, b, c, d – körbejárási sorrendben, óramutató szerint vagy ellentétesen); „a” a legnagyobb nyílásfelületű homlokzat. 4-nél több tájolás esetén is max. 4 egymásra merőleges csoportba kell vonni.
2. A_open,fac1,i (G.11), A_open,fac2,i (G.10), A_eff,i (G.12).
3. Termikus áramok: q_fac1,th (G.5), q_fac2,th (analóg, A_open,fac2,i-vel), q_fac1-2,th (G.6).
4. v_fac (G.9) a v_meteo, H_g,z, z_0,site (G.4 táblázat) alapján; ΔC_p a G.1–G.3 táblázatból.
5. Szél okozta áramok: q_fac1,w (G.7), q_fac2,w (analóg), q_fac1-2,w (G.8).
6. Komponensek kvadratikus összegzése (G.3, G.4), majd helyiség: a két egyoldali áram összege vs. kétoldali áram maximuma (G.2).
7. Zóna: helyiségértékek összege (G.1).

**Állandók:** C_D = 0,61; g = 9,81 m/s²; T_e = θ_e + 273 K; v_meteo alapérték ≈ 3 m/s (ha helyi adat nincs); referenciamagasság 80 m (G.9).

```
q_v,open,z = Σ_i ⟨q_v,open,i⟩        (G.1)
```

```
q_v,open,i = max⟨ q_v,open,fac1,i + q_v,open,fac2,i ; q_v,open,fac1−2,i ⟩        (G.2)
```

```
q_v,open,fac1,i = sqrt( q_v,open,fac1,th,i² + q_v,open,fac1,w,i² )
q_v,open,fac2,i = sqrt( q_v,open,fac2,th,i² + q_v,open,fac2,w,i² )        (G.3)
```

```
q_v,open,fac1−2,i = sqrt( q_v,open,fac1−2,th,i² + q_v,open,fac1−2,w,i² )        (G.4)
```

Termikus (felhajtóerő okozta) térfogatáramok:

```
q_v,open,fac1,th,i = (1/3) · C_D · A_open,fac1,i · sqrt( g · h_1,i · Δθ_i−e / T_e ) · 3600 [s/h]        (G.5)
(q_v,open,fac2,th,i analóg módon A_open,fac2,i és h_2,i alapján)
```

```
q_v,open,fac1−2,th,i = C_D · A_eff,i · sqrt( 2 · g · h_1−2,i · Δθ_i−e / T_e ) · 3600 [s/h]        (G.6)
```

```
T_e = θ_e + 273 [K]
```

Szél okozta térfogatáramok:

```
q_v,open,fac1,w,i = 0,05 · A_open,fac1,i · v_fac · 3600 [s/h]        (G.7)
(q_v,open,fac2,w,i analóg módon A_open,fac2,i alapján)
```

```
q_v,open,fac1−2,w,i = C_D · A_eff,i · sqrt(ΔC_p) · v_fac · 3600 [s/h]        (G.8)
```

Homlokzati szélsebesség:

```
v_fac = 1,36 · v_meteo · ln⟨H_g,z / z_0,site⟩ / ln⟨80 [m] / z_0,site⟩        (G.9)
```

Nyílásfelületek:

```
A_open,fac2,i = A_a,i + A_b,i + A_c,i + A_d,i − A_open,fac1,i        (G.10)
```

```
A_open,fac1,i = A_a,i + min⟨A_b,i ; A_d,i⟩   ha  A_a,i <  (A_b,i + A_c,i + A_d,i)
A_open,fac1,i = A_a,i                         ha  A_a,i ≥ (A_b,i + A_c,i + A_d,i)        (G.11)
```

```
A_eff,i = ( |A_open,fac1,i|^(−2) + |A_open,fac2,i|^(−2) )^(−0,5) · 1 [m²]        (G.12)
```

(Megjegyzés: ha A_open,fac2,i = 0, akkor A_eff,i = 0 – a programban a 0^(−2) osztást kezelni kell.)

| Jel | Jelentés | Mértékegység |
|---|---|---|
| q_v,open,z | nagy nyílásokon át beáramló külső levegő, zóna (z) | m³/h |
| q_v,open,i | nagy nyílásokon át beáramló külső levegő, helyiség (i) | m³/h |
| q_v,open,fac1,i / fac2,i | légáram az 1. ill. 2. homlokzati tájolásban | m³/h |
| q_v,open,fac1,th,i / fac2,th,i | termikus légáram, 1./2. tájolás (G.5) | m³/h |
| q_v,open,fac1,w,i / fac2,w,i | szél okozta légáram, 1./2. tájolás (G.7) | m³/h |
| q_v,open,fac1−2,i | kétoldali (átszellőzés) légáram az 1. és 2. tájolás között | m³/h |
| q_v,open,fac1−2,th,i | kétoldali termikus légáram (G.6) | m³/h |
| q_v,open,fac1−2,w,i | kétoldali szél okozta légáram (G.8) | m³/h |
| C_D | átfolyási tényező, 0,61 | – |
| A_open,fac1,i / A_open,fac2,i | a helyiség nagy nyílásainak effektív felülete az 1./2. tájolásban (G.11/G.10) | m² |
| A_eff,i | kétoldali szellőzés effektív nyílásfelülete (G.12) | m² |
| g | nehézségi gyorsulás, 9,81 | m/s² |
| h_1,i / h_2,i | a nyílások átlagos magassága (alsó éltől felső élig), 1./2. tájolás | m |
| h_1−2,i | az 1. és 2. tájolású nyílások felületi súlypontjai közötti átlagos magasságkülönbség | m |
| Δθ_i−e | belső és külső léghőmérséklet különbsége. Belső: általában θ_int,i; h ≥ 4 m belmagasságnál a B.3 szerinti átlagos belső léghőmérséklet, ahol a (B.2) képletben h_i/2 helyére az összes figyelembe vett nagy nyílás átlagos súlyponti magassága kerül. Külső: θ_e | K |
| T_e | külső levegő átlagos termodinamikai hőmérséklete | K |
| v_fac | átlagos helyi szélsebesség a homlokzaton (G.9) | m/s |
| ΔC_p | szél felőli és szél alatti nyomástényezők különbsége (G.1 táblázat) | – |
| v_meteo | meteorológiai szélsebesség 10 m magasságban, szabad helyen; ismeretlen → ≈ 3 m/s | m/s |
| H_g,z | a (z) szellőzési zóna átlagos magassága a terep felett | m |
| z_0,site | érdességi paraméter a homlokzati helyi szélsebességhez (G.4 táblázat) | m |
| A_a,i … A_d,i | az a, b, c, d homlokzatok nyílásfelületei (körbejárási sorrendben; „a” a legnagyobb) | m² |

**G.1 táblázat – ΔC_p becslése** (JSON kulcs: `delta_cp_G1`)

| Külső homlokzatok száma | ΔC_p |
|---|---|
| 1 | 0,05 |
| > 1 | f_shield · f_height |

**G.2 táblázat – Árnyékolási tényező** (JSON kulcs: `f_shield_G2`)

| Árnyékolás | f_shield |
|---|---|
| nincs (`nincs`) | 1,5 |
| közepes (`kozepes`) | 1,0 |
| erős (`eros`) | 0,5 |

**G.3 táblázat – Magassági tényező** (JSON kulcs: `f_height_G3`)

| Homlokzatszakasz | f_height |
|---|---|
| alsó (`also`) | 0,75 |
| közép (`kozep`) | 0,90 |
| felső (`felso`) | 1,00 |

**G.4 táblázat – Érdesség z_0** (JSON kulcs: `z0_erdesseg_G4`)

| H_g,z | Árnyékolás | z_0 [m] |
|---|---|---|
| ≤ 80 m | nincs | 0,03 |
| ≤ 80 m | közepes | 0,25 |
| ≤ 80 m | erős | 0,50 |
| > 80 m | – | 0,03 |

---

## Bibliography

(kihagyva)

