"""
Kézi kontrollpélda: egyzónás doboz lakóépület nettó fűtési és hűtési energiaigénye
a 9/2023. ÉKM rendelet 7. § (1) a) szerinti számítási módszer (1. Függelék 4. és 6. fejezet) szerint.

Független referencia-implementáció: a képleteket a módszer szövegéből (PDF-oldalak, egyenletszámokkal)
írja le, NEM a TypeScript kódból. Csak a táblázati adatokat (éghajlat, sugárzás, ζ, Ψ, b) olvassa a
data/normativ JSON-fájlokból. Futtatás: python3 -I docs/kontrollpeldak/doboz_epulet.py
"""
import json, math, calendar, pathlib

GY = pathlib.Path(__file__).resolve().parents[2] / 'data' / 'normativ' / 'modszer'
def T(fajl, tid):
    return next(t for t in json.load(open(GY / f'{fajl}.json'))['tablazatok'] if t['id'] == tid)

# --- Bemenet --------------------------------------------------------------------------------------
A_N, V = 100.0, 300.0                 # 10 × 10 m, belmagasság 3 m
theta_iF, theta_iH = 20.0, 26.0       # 2. függ. 2.1. tábl., lakóépület (kötelező)
q_b = 5.0                             # 2. függ. 2.1. tábl., lakóépület
C_m = 280.0 * A_N                     # 6.5. tábl. 3. kategória (nehéz épület), kJ/K
sigma_F = sigma_H = 1.0               # 2. függ. 2.5–2.6. tábl.: nincs automatika / nincs leszabályozás
# Opak homlokzati fal 100 m², U 0,24, külső hőszigetelés, gyengén hőhidas → ζ 0,15 (6.1. tábl.)
# Lapostető 100 m², U 0,17, gyengén hőhidas → ζ 0,10; ablakok 20 m², U_w 1,1 (ζ nélkül)
zeta_fal = next(r['zeta'] for r in T('netto_energiaigeny', 'tabla_6_1')['sorok'] if r['szerkezet'] == 'Külső falak' and r['besorolas'] == 'gyengén hőhidas' and r['alcsoport'].startswith('külső oldali'))
zeta_teto = next(r['zeta'] for r in T('netto_energiaigeny', 'tabla_6_1')['sorok'] if r['szerkezet'] == 'Lapostetők' and r['besorolas'] == 'gyengén hőhidas')
H_trD = 100 * 0.24 * (1 + zeta_fal) + 100 * 0.17 * (1 + zeta_teto) + 20 * 1.1      # (6.1)–(6.3)
# Talajon fekvő padló: A 100, P 40, d_f 0,4 m, R_p 3,0, λ_talaj 2,0 (ismeretlen talaj), z = 0   (4.20)–(4.23)
B = 100 / (0.5 * 40)
d_p = 0.4 + 2.0 * (0.17 + 3.0 + 0.04)
U_Tp = 2.0 / (0.457 * B + d_p) if d_p >= B else 2 * 2.0 / (math.pi * B + d_p) * math.log(math.pi * B / d_p + 1)
# Ψ_p,f: falazat λ 0,2 (0,15–0,45 sáv), külső hőszigetelés, lábazat a terepszint alatt 0,5 m-ig szigetelt, padló szigetelt (6.4. tábl.)
psi = next(r['psi_pf'] for r in T('netto_energiaigeny', 'tabla_6_4')['sorok'] if r['lambda_min'] == 0.15 and r['kulso_fal_kialakitasa'].startswith('külső') and r['labazati_fal'].endswith('0,5 m-ig hőszigetelt') and r['padlo'] == 'Padló hőszigetelt')
H_trT = 100 * U_Tp + 40 * psi                                                       # (6.5)
# Szellőzés: természetes, n_szüks 0,5 (2.1. tábl.), n_filt 0,06 (2.4. tábl. jó légzárás, több homlokzat)   (6.10)
H_szF = 0.35 * (0.5 * 1 + 0.06) * V
H_ejjel = 0.35 * (1.5 * 7 / 24 * 6) * V                                             # (6.11): b 1,5, n_éjjel 6 (több homlokzat)
# Ablakok: D 10, K 4, Ny 4, É 2 m², függőleges, keretarány 0,3, g_n 0,5, F_ü 0,9; árnyékolásvizsgálat nélkül
ablakok = {'D': 10, 'K': 4, 'Ny': 4, 'É': 2}
F_keret, g_n, F_u = 0.3, 0.5, 0.9

hom = T('eghajlat', 'tabla_f2_1_1')['sorok'][0]
sug = T('eghajlat', 'tabla_f2_1_6')['sorok']
def Gs(taj, m):
    return next(r[f'm{m:02d}'] for r in sug if r['tajolas'] == taj and r['hajlasszog'] == 90)

QF = QH = 0.0
qm_sum = 0.0
print(f'H_trD = {H_trD:.6f} W/K, U_T,p = {U_Tp:.6f}, Ψ_p,f = {psi}, H_trT = {H_trT:.6f} W/K, H_szell,F = {H_szF:.6f} W/K')
print(' hó   θe     Q_tr,F    Q_sz,F    Q_sd,F     Q_b      γ_F     η_F    Q_F,net   Q_H,net')
for m in range(1, 13):
    dt = calendar.monthrange(2023, m)[1] * 24
    te, tev = hom[f'm{m:02d}'], hom['eves']
    QtrF = (H_trD * (theta_iF - te) + H_trT * (theta_iF - tev)) * dt / 1000          # (6.7)
    QtrH = (H_trD * (theta_iH - te) + H_trT * (theta_iH - tev)) * dt / 1000
    H_szH = H_szF + (H_ejjel if m in (5, 6, 7, 8, 9) else 0.0)
    QszF = H_szF * (theta_iF - te) * dt / 1000                                        # (6.20)
    QszH = H_szH * (theta_iH - te) * dt / 1000
    Au = {k: a * (1 - F_keret) for k, a in ablakok.items()}                           # (6.23)
    QsdF = sum(a * F_u * g_n * 1 * 1 * Gs('É', m) for a in Au.values())               # (6.22), fűtés: északi sugárzás
    QsdH = sum(a * F_u * g_n * 1 * 1 * Gs(k, m) for k, a in Au.items())               # hűtés: zavartalan benapozás
    Qb = A_N * q_b * dt / 1000                                                        # (6.26)
    Qv, Qn = sigma_F * (QtrF + QszF), QsdF + Qb                                       # (6.27)/(6.33), (6.29)
    Ql, Qt = QtrH + QszH, QsdH + Qb                                                   # (6.28), (6.30)
    tauF = (C_m / 3.6) / (H_trD + H_trT + H_szF)                                      # (6.34)
    tauH = (C_m / 3.6) / (H_trD + H_trT + H_szH)
    aF, aH = 1 + tauF / 15, 1 + tauH / 15                                             # (6.39), (6.46)
    gF = Qn / Qv                                                                      # (6.31)
    etaF = (1 - gF ** aF) / (1 - gF ** (aF + 1)) if gF > 0 and gF != 1 else (aF / (aF + 1) if gF == 1 else (1 / gF if Qn > 0 else 1))
    QFn = 0.0 if (gF <= 0 and Qn > 0) or gF > 2.0 else max(0.0, Qv - etaF * Qn)        # (6.40) + nullázás
    gH = Qt / Ql                                                                      # (6.32)
    etaH = (1 - gH ** -aH) / (1 - gH ** -(aH + 1)) if gH > 0 and gH != 1 else (aH / (aH + 1) if gH == 1 else 1)
    QHn = Qt - etaH * Ql                                                              # (6.47)
    if (1 / gH if gH != 0 else math.inf) > 2.0 or QHn < 0: QHn = 0.0
    QHn *= sigma_H                                                                    # (6.49)
    QF += QFn; QH += QHn
    if m in (11, 12, 1, 2, 3):
        qm_sum += (QtrF - etaF * QsdF) / (theta_iF - te)                              # (6.53)
    print(f'{m:3d} {te:5.1f} {QtrF:9.3f} {QszF:9.3f} {QsdF:9.3f} {Qb:8.3f} {gF:8.4f} {etaF:7.4f} {QFn:9.3f} {QHn:9.3f}')
qm = 1000 / (V * 3624) * qm_sum
QFo = (H_trD + H_trT + H_szF) * (theta_iF - (-13))                                     # (6.54)–(6.55)
print(f'Q_F,net,év = {QF:.6f} kWh/év   q_F,net = {QF / A_N:.6f} kWh/m²év')
print(f'Q_H,net,év = {QH:.6f} kWh/év   q_H,net = {QH / A_N:.6f} kWh/m²év')
print(f'q_m = {qm:.8f} W/m³K   Q_F,o = {QFo:.6f} W')
