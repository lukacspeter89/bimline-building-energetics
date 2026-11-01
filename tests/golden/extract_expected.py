"""WinWatt-kimenetekből (projekt-XML export + e-tanúsítás UploadRequest) golden expected.json.
Használat: python3 extract_expected.py <mappa a Gx_winwatt_export.xml és Gx_etan.xml fájlokkal> <kimeneti mappa>"""
import sys, json, os
import lxml.etree as e

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)


def f(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return x


def ln(el):
    return el.tag.split('}')[-1]


def etan(path):
    r = e.parse(path).getroot()
    g = lambda p: r.find('.//{*}' + p.replace('/', '/{*}'))
    t = lambda p: (g(p).text.strip() if g(p) is not None and g(p).text else None)
    d = {
        'besorolas_Ep': t('Header/EnergyClassification'),
        'besorolas_CO2': t('Header/Co2Emission'),
        'hasznos_alapterulet_m2': f(t('BuildingData/UsefulFloorArea')),
        'kondicionalt_terfogat_m3': f(t('BuildingData/ConditionedVolume')),
        'AV_arany': f(t('BuildingData/BuildingAreaToVolumeRatio')),
        'megujulo_arany_pct': f(t('EfficiencyCategories/RenewableEnergyUsage')),
        'Ep_kWh_m2a': f(t('EfficiencyCategories/CurrentValues/SummariesEnergyRating/Value')),
        'Ep_szazalek': f(t('EfficiencyCategories/CurrentValues/SummariesEnergyRating/Percentage')),
        'CO2_kg_m2a': f(t('EfficiencyCategories/CurrentValues/Co2/Value')),
        'CO2_szazalek': f(t('EfficiencyCategories/CurrentValues/Co2/Percentage')),
        'q_fajlagos_hoveszteseg_W_m3K': f(t('EfficiencyCategories/CurrentValues/HeatLossFactor/Value')),
        'kovetelmeny_felujitas_Ep': f(t('EfficiencyCategories/MajorRenovationRequirementLevel/SummariesEnergyRating/Value')),
        'kovetelmeny_felujitas_q': f(t('EfficiencyCategories/MajorRenovationRequirementLevel/HeatLossFactor/Value')),
        'kovetelmeny_kozel_nulla_Ep': f(t('EfficiencyCategories/NearZeroEnergyBuildingRequirementLevel/SummariesEnergyRating/Value')),
        'kovetelmeny_kozel_nulla_CO2': f(t('EfficiencyCategories/NearZeroEnergyBuildingRequirementLevel/Co2/Value')),
        'kovetelmeny_kozel_nulla_q': f(t('EfficiencyCategories/NearZeroEnergyBuildingRequirementLevel/HeatLossFactor/Value')),
        'futesi_rendszer_minosites': t('BuildingServicesSystemEnergeticQuality/HeatingSystem'),
        'hmv_rendszer_minosites': t('BuildingServicesSystemEnergeticQuality/HotWaterSupplySystem'),
    }
    # szerkezetlista
    d['szerkezetek'] = []
    for s in r.iter('{*}BoundaryAndOpeningStructure'):
        typ = s.find('{*}TypeOfStructure').text
        for q in s.iter('{*}EnergeticQuality'):
            d['szerkezetek'].append({'tipus': typ, 'minosites': q.find('{*}Quality').text,
                                     'U': f(q.find('{*}U').text), 'felulet_m2': f(q.find('{*}Dimension').text)})
    # energiahordozók
    es = g('EnergyConsumptionByUse/CalculatedEnergyUse/EnergySources')
    d['energiahordozok_kWh_m2a'] = {}
    if es is not None:
        for el in es.iter():
            if ln(el) == 'CurrentEnergyConsumption':
                path = [ln(a) for a in el.iterancestors() if a is not es][::-1]
                path = [p for p in path if p not in ('EnergySources', 'CalculatedEnergyUse', 'EnergyConsumptionByUse', 'UploadRequest')]
                d['energiahordozok_kWh_m2a']['/'.join(path)] = f(el.text)
    # felhasználási célonként (export energiával)
    bu = g('EnergyConsumptionByUseWithExportEnergy/UsageTarget/ByEnergySources')
    d['felhasznalas_celonkent_kWh_m2a'] = {}
    if bu is not None:
        for el in bu.iter():
            if len(el) == 0 and el.text and el.text.strip():
                path = [ln(a) for a in el.iterancestors() if a is not bu][::-1]
                path = [p for p in path if p not in ('ByEnergySources', 'UsageTarget', 'EnergyConsumptionByUseWithExportEnergy', 'UploadRequest')]
                d['felhasznalas_celonkent_kWh_m2a']['/'.join(path + [ln(el)])] = f(el.text)
    d['alternativ_energiak'] = [a.text for a in r.iter('{*}AlternativeEnergy')]
    return d


def native(path):
    r = e.parse(path).getroot()
    out = {'panelek': {}, 'helyisegek': {}, 'epulet': {}}
    for p in r.findall('WinWatt32Panel'):
        name = p.find('ItemHeader/ItemName').text
        out['panelek'][name] = {'Type': p.findtext('Type'), 'k': f(p.findtext('k')),
                                'kFromLayers': f(p.findtext('kFromLayers'))}
    for rm in r.findall('WinWatt32Room'):
        name = rm.find('ItemHeader/ItemName').text
        h = rm.find('Heating')
        out['helyisegek'][name] = {
            'Area': f(rm.findtext('Area')), 'Height': f(rm.findtext('Height')),
            'CalculatedVolume': f(rm.findtext('CalculatedVolume')),
            'TransPower_W': f(h.findtext('TransPower')), 'FiltPower_W': f(h.findtext('FiltPower')),
            'Power_W': f(h.findtext('Power')),
            'hatarolok': [{'Name': b.findtext('Name'), 'Type': b.findtext('Type'), 'A': f(b.findtext('A')),
                           'U': f(b.findtext('U')), 'Compass': f(b.findtext('Compass')),
                           'HeatingPower_W': f(b.findtext('HeatingPower'))} for b in rm.findall('Boundary')]}
    b = r.find('WinWatt32Building')
    ep = b.find('EPBD')
    out['epulet'] = {
        'HeatingPower_W': f(b.findtext('HeatingPower')),
        'HeatingFiltrationPower_W': f(b.findtext('HeatingFiltrationPower')),
        'TotalOutsideSurface_m2': f(b.findtext('TotalOutsideSurface')),
        'TotalVolume_m3': f(b.findtext('TotalVolume')),
        'CalculatedSpecificLoss_W_m3K': f(b.findtext('CalculatedSpecificLoss')),
        'SpecificMass_kg_m2': f(b.findtext('SpecificMass')),
    }
    for k in ['ISRG', 'ISRGSum', 'dTWinter', 'AirVolume', 'HeatedArea', 'Qb', 'QHMV', 'TempGrad', 'HeatingHours',
              'HeatingEnergy', 'CoolingNettoEnergy', 'SpecificHeatingMass', 'PrimerEnergyLimit',
              'OptimalPrimerEnergyLimit', 'NeerNullPrimerEnergyLimit', 'CO2Emission']:
        out['epulet']['EPBD_' + k] = f(ep.findtext(k))
    ec = ep.find('EnergyConsumptions')
    if ec is not None:
        out['epulet']['EPBD_EnergyConsumptions_attr'] = {k: f(v) for k, v in ec.attrib.items()}
    out['epulet']['EPBD_rendszerek'] = {}
    for tag in ['WinWatt32HeatingSystemItem', 'WinWatt32WaterHeatingSystemItem', 'WinWatt32AiringSystemItem',
                'WinWatt32CoolingSystemItem', 'WinWatt32SolarSystemItem']:
        for s in ep.findall(tag):
            out['epulet']['EPBD_rendszerek'].setdefault(tag, []).append(
                {'Name': s.findtext('Name'), 'SpecificPrimerEnergy': f(s.findtext('SpecificPrimerEnergy')),
                 'WFinal': f(s.findtext('WFinal')), 'QFinal': f(s.findtext('QFinal'))})
    return out


for g in ['G1', 'G2', 'G3']:
    res = {'eset': g,
           'forras': 'WinWatt fecske 9.58 (2026.06.08) – XML import után a GUI-lépések a README szerint, 2026-10-29',
           'oeny_etanusitas': etan(os.path.join(SRC, f'{g}_etan.xml')),
           'winwatt_projekt': native(os.path.join(SRC, f'{g}_winwatt_export.xml'))}
    with open(os.path.join(OUT, f'{g}_expected.json'), 'w', encoding='utf-8') as fh:
        json.dump(res, fh, ensure_ascii=False, indent=1)
    o = res['oeny_etanusitas']
    print(g, o['besorolas_Ep'], o['Ep_kWh_m2a'], o['CO2_kg_m2a'], o['q_fajlagos_hoveszteseg_W_m3K'], o['AV_arany'],
          res['winwatt_projekt']['epulet']['HeatingPower_W'], res['winwatt_projekt']['epulet']['EPBD_HeatingEnergy'])
