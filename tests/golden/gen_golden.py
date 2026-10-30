"""Golden teszt esetek generálása WinWatt NativeExport XML-be.
Sablon: export_2_rendszerek.xml (WinWatt 9.58 saját exportja).
Minden eset: inputs/<id>.json (alkalmazás-független bemenet) + import/<id>_import.xml (WinWatt-ba).
A rétegadatok TESZT-BEMENETEK (nem termékadatok), csak a számítás összevetésére.
"""
import copy, json, math, os, sys
from lxml import etree

TPL = os.path.join(os.path.dirname(__file__), '..', 'export_2_rendszerek.xml')
OUT = os.path.dirname(__file__)

# ---------------------------------------------------------------- anyagok (teszt)
# név: (rho kg/m3, lambda W/mK, c kJ/kgK, mu)
MAT = {
    'Mészcementvakolat':        (1700, 0.87, 0.88, 10),
    'Kerámia falazóblokk 30 (teszt)': (800, 0.184, 0.92, 6),
    'EPS homlokzati hőszigetelés': (20, 0.039, 1.46, 30),
    'Vékonyvakolat':            (1600, 0.70, 0.88, 15),
    'Vasbeton':                 (2400, 1.55, 0.84, 80),
    'EPS 100 lapostető':        (20, 0.035, 1.46, 30),
    'Bitumenes lemez':          (1100, 0.17, 1.46, 20000),
    'Cementesztrich':           (2000, 1.40, 0.84, 20),
    'XPS':                      (35, 0.035, 1.46, 100),
    'Kerámia burkolat':         (2300, 1.05, 0.84, 200),
    'Ásványgyapot':             (30, 0.037, 0.84, 1),
    'Kőzetgyapot lamella':      (80, 0.040, 0.84, 1),
}

def L(name, d_cm):
    return {'name': name, 'd_cm': d_cm}

PANELS = {
  'R1./ Külső fal': {'type':'OutsideWall','code':0,'Rsi':0.13,'Rse':0.04,'layers':[
      L('Vékonyvakolat',0.5), L('EPS homlokzati hőszigetelés',15), L('Kerámia falazóblokk 30 (teszt)',30), L('Mészcementvakolat',1.5)]},
  'R2./ Lapostető': {'type':'Roof1','code':3,'Rsi':0.10,'Rse':0.04,'gradient':0,'layers':[
      L('Bitumenes lemez',1), L('EPS 100 lapostető',25), L('Vasbeton',20), L('Mészcementvakolat',1.5)]},
  'R3./ Talajon fekvő padló': {'type':'FloorISO','code':26,'Rsi':0.17,'Rse':0.04,'layers':[
      L('Kerámia burkolat',1), L('Cementesztrich',6), L('XPS',15), L('Vasbeton',10)]},
  'R4./ Közbenső födém': {'type':'Roof5','code':7,'Rsi':0.10,'Rse':0.10,'layers':[
      L('Kerámia burkolat',1), L('Cementesztrich',6), L('Vasbeton',18), L('Mészcementvakolat',1.5)]},
  'R5./ Padlásfödém': {'type':'Roof2','code':4,'Rsi':0.10,'Rse':0.10,'layers':[
      L('Ásványgyapot',25), L('Vasbeton',18), L('Mészcementvakolat',1.5)]},
  'R6./ Pincefödém': {'type':'Roof3','code':5,'Rsi':0.17,'Rse':0.17,'layers':[
      L('Kerámia burkolat',1), L('Cementesztrich',6), L('Vasbeton',20), L('Kőzetgyapot lamella',15)]},
  'R7./ Fal fűtetlen garázs felé': {'type':'InsideWall1','code':18,'Rsi':0.13,'Rse':0.13,'layers':[
      L('Mészcementvakolat',1.5), L('Kerámia falazóblokk 30 (teszt)',30), L('EPS homlokzati hőszigetelés',8), L('Vékonyvakolat',0.5)]},
}
WINDOW = {'name':'Ablak','Ug':0.6,'g':0.5,'Uf':1.0,'frame_mm':110,'glass':'3 rétegű 4-14-4-14-4 argon (teszt)','frame':'PVC 82 mm (teszt)'}
DOOR = {'name':'Bejárati ajtó','U':1.4}

def u_layers(p):
    R = p['Rsi'] + p['Rse'] + sum(l['d_cm']/100/MAT[l['name']][1] for l in p['layers'])
    return 1/R

def u_window(w,h):
    f = WINDOW['frame_mm']/1000
    A = w*h; Ag = max(w-2*f,0)*max(h-2*f,0); Af = A-Ag
    return round((Ag*WINDOW['Ug']+Af*WINDOW['Uf'])/A, 2)

# ---------------------------------------------------------------- geometriai segéd
def box_walls(lx, ly, h, windows, door=None, compass0=0):
    """Téglalap alaprajz falai. windows: {'S':[(w,h,db),...],...}. Égtáj→fok: N0 E90 S180 W270."""
    deg = {'N':0,'E':90,'S':180,'W':270}
    lens = {'N':lx,'S':lx,'E':ly,'W':ly}
    out=[]
    for side in ['N','E','S','W']:
        open_a = sum(w*hh*n for (w,hh,n) in windows.get(side,[]))
        if door and door[0]==side: open_a += door[1]*door[2]
        out.append({'side':side,'compass':deg[side],'x':lens[side],'y':h,'A':round(lens[side]*h,3),'MinA':round(open_a,3)})
    return out

# ---------------------------------------------------------------- esetek
def case_G1():
    lx,ly,h = 12.0, 8.0, 2.7
    wins={'S':[(1.5,1.5,4)],'E':[(1.2,1.2,1)],'W':[(1.2,1.2,1)],'N':[(0.9,1.2,1)]}
    door=('N',1.0,2.1)
    room={'name':'Lakótér','function':'Nappali','area':lx*ly,'height':h,'temp':20,
          'walls':box_walls(lx,ly,h,wins,door),'windows':wins,'door':door,
          'roof':{'panel':'R2./ Lapostető','A':lx*ly},
          'floor':{'panel':'R3./ Talajon fekvő padló','A':lx*ly,'P':2*(lx+ly),'x':2*(lx+ly)}}
    return {'id':'G1','title':'G1 – Földszintes lapostetős ház, kondenzációs gázkazán','rooms':[room],
        'heated_area':lx*ly,
        'systems':{
          'heating':{'gen':[{'CkType':6,'energy':2,'share':1}],'SystemType':0,'qfvType':6,'qftType':4,'EfszType':9,'Efsz2Type':4,
                     'RegPart':[2,2,1,2,7],'desc':'Kondenzációs gázkazán a fűtött térben, kétcsöves radiátoros 55/45, termosztatikus szelepek, EC szivattyú'},
          'dhw':{'gen':[{'CkType':3,'energy':2,'share':1}],'qfvType':3,'qftType':0,'EcType':3,'BuildingCategory':0,
                 'desc':'A kazán indirekt tárolót fűt (fűtött térben), cirkuláció nélkül'}},
        'iso':{'A':lx*ly,'P':2*(lx+ly),'w':0.47}}

def case_G2():
    lx,ly,h = 10.0, 8.0, 2.7
    wins0={'S':[(2.0,2.2,2),(1.2,1.5,1)],'E':[(1.2,1.5,1)],'W':[(1.2,1.5,1)],'N':[(0.9,1.2,1)]}
    door=('N',1.0,2.1)
    wins1={'S':[(1.5,1.5,3)],'E':[(1.2,1.5,1)],'W':[(1.2,1.5,1)],'N':[(0.9,1.2,2)]}
    r0={'name':'Földszint','function':'Nappali','area':lx*ly,'height':h,'temp':20,
        'walls':box_walls(lx,ly,h,wins0,door),'windows':wins0,'door':door,
        'ceiling_internal':{'panel':'R4./ Közbenső födém','A':lx*ly},
        'floor':{'panel':'R3./ Talajon fekvő padló','A':lx*ly,'P':2*(lx+ly),'x':2*(lx+ly)}}
    r1={'name':'Emelet','function':'Hálószoba','area':lx*ly,'height':h,'temp':20,
        'walls':box_walls(lx,ly,h,wins1),'windows':wins1,'door':None,
        'attic':{'panel':'R5./ Padlásfödém','A':lx*ly,'t_over':-2,'Bu':0.9}}
    return {'id':'G2','title':'G2 – Kétszintes ház hideg padlással, levegő-víz hőszivattyú + HMV-HP + napelem','rooms':[r0,r1],
        'heated_area':2*lx*ly,
        'systems':{
          'heating':{'gen':[{'CkType':12,'energy':9,'share':1}],'SystemType':1,'qfvType':7,'qftType':1,'EfszType':9,'Efsz2Type':4,
                     'RegPart':[2,0,1,2,7],'desc':'Levegő-víz hőszivattyú, padlófűtés 35/28, puffertároló fűtött térben, EC szivattyú'},
          'dhw':{'gen':[{'CkType':23,'energy':9,'share':1}],'qfvType':3,'qftType':0,'EcType':3,'BuildingCategory':0,
                 'desc':'Ugyanaz a hőszivattyú indirekt HMV-tárolóval (fűtött térben), cirkuláció nélkül'},
          'pv':{'kWp':4,'compass':180,'gradient':30}},
        'iso':{'A':lx*ly,'P':2*(lx+ly),'w':0.47}}

def case_G3():
    lx,ly,h = 12.0, 8.0, 2.7
    wins={'S':[(2.4,2.2,2),(1.2,1.5,1)],'E':[(1.2,1.5,1)],'N':[(0.9,1.2,1)]}
    door=('N',1.0,2.1)
    # nyugati oldal: fűtetlen garázs felé néző fal (nem homlokzat)
    walls=[w for w in box_walls(lx,ly,h,wins,door) if w['side']!='W']
    room={'name':'Lakótér','function':'Nappali','area':lx*ly,'height':h,'temp':20,
          'walls':walls,'windows':wins,'door':door,
          'garage_wall':{'panel':'R7./ Fal fűtetlen garázs felé','x':ly,'y':h,'A':ly*h,'t_over':5,'Bu':0.9},
          'roof':{'panel':'R2./ Lapostető','A':lx*ly},
          'basement':{'panel':'R6./ Pincefödém','A':lx*ly,'t_over':8,'Bu':0.5}}
    return {'id':'G3','title':'G3 – Fűtetlen pince és garázs mellett, hőszivattyú + hővisszanyerős szellőzés + split hűtés','rooms':[room],
        'heated_area':lx*ly,
        'systems':{
          'heating':{'gen':[{'CkType':12,'energy':9,'share':1}],'SystemType':1,'qfvType':7,'qftType':4,'EfszType':9,'Efsz2Type':4,
                     'RegPart':[2,0,1,2,7],'desc':'Levegő-víz hőszivattyú, padlófűtés 35/28, puffer nélkül'},
          'dhw':{'gen':[{'CkType':23,'energy':9,'share':1}],'qfvType':3,'qftType':0,'EcType':3,'BuildingCategory':0,
                 'desc':'Hőszivattyú indirekt HMV-tárolóval, cirkuláció nélkül'},
          'airing':{'n':0.5,'eta':85,'dp':150,'fan_eff':50,'fszType':3},
          'cooling':{'CkType':0,'eszabType':7,'cHType':2}},
        'iso':None}

CASES=[case_G1(),case_G2(),case_G3()]

# ---------------------------------------------------------------- XML építés
BOYLER_DESC={3:'Fűtött téren kívül elhelyezett kondenzációs olaj- vagy gázkazán',6:'Fűtött téren belül elhelyezett kondenzációs olaj- vagy gázkazán',
             12:'Elektromos üzemű hőszivattyú, levegő hőforrással, fűtővíz hőmérséklet 35/28'}
WATER_DESC={3:'Kondenzációs olaj- vagy gázkazán',23:'Elektromos üzemű hőszivattyú, levegő hőforrással'}
EN_DESC={2:('földgáz',1,0),9:('H hőszivattyús elektromos áram',1.8,0.1),0:('elektromos áram',2.5,0.1)}
QFV={6:'Elosztó vezetékek a fűtött téren belül;vízhőmérséklet 55/45',7:'Elosztó vezetékek a fűtött téren belül;vízhőmérséklet 35/28'}
QFT={1:'Elhelyezés a fűtött térben;vízhőmérséklet 35/28',4:'Nincs'}
WQFV={3:'Elosztó vezetékek a fűtött téren belül;cirkuláció nélkül'}
WQFT={0:'Elhelyezés a fűtött térben;indirekt fűtésű tároló'}

def S(e,tag,val):
    x=e.find(tag); x.text=str(val); return x

def build(case, tpl):
    root=copy.deepcopy(tpl)
    P={p.findtext('ItemHeader/ItemName'):p for p in root.findall('WinWatt32Panel')}
    rtpl=root.find('WinWatt32Room'); B={b.findtext('Name'):b for b in rtpl.findall('Boundary')}
    layer_tpl=copy.deepcopy(P['Külső fal'].find('PanelLayer'))
    for p in root.findall('WinWatt32Panel'): root.remove(p)
    for r in root.findall('WinWatt32Room'): root.remove(r)
    bld=root.find('WinWatt32Building')
    nid=[100]
    def newid(): nid[0]+=1; return str(nid[0])
    used=set()
    for rm in case['rooms']:
        for k in ('roof','floor','ceiling_internal','attic','basement','garage_wall'):
            if rm.get(k): used.add(rm[k]['panel'])
    used.add('R1./ Külső fal')
    panel_k={}
    # --- rétegelt panelek
    srcmap={'OutsideWall':'Külső fal','Roof1':'Tető','FloorISO':'Padló','Roof5':'Emelet födém','Roof2':'Emelet födém','Roof3':'Emelet födém','InsideWall1':'Belső fal_futetlen'}
    for name in [n for n in PANELS if n in used]:
        d=PANELS[name]; p=copy.deepcopy(P[srcmap[d['type']]])
        p.set('Type',d['type']); p.find('ItemHeader/ItemName').text=name; p.find('ItemHeader/ID').text=newid()
        typetext={'OutsideWall':'külső fal','Roof1':'tető','FloorISO':'padló (talajra fektetett ISO 13370)','Roof5':'belső födém (felfelé hűlő)',
                  'Roof2':'padlásfödém','Roof3':'pincefödém, alsó zárófödém','InsideWall1':'belső fal (fűtetlen tér felé)'}[d['type']]
        p.find('Type').text=typetext
        for pl in p.findall('PanelLayer'): p.remove(pl)
        km=p.find('kModifier')
        if km is not None: p.remove(km)
        for l in d['layers']:
            rho,lam,c,mu=MAT[l['name']]; e=copy.deepcopy(layer_tpl)
            S(e,'LayerName',l['name']); S(e,'Thickness',l['d_cm']); S(e,'Density',rho); S(e,'ThermalCond',lam); S(e,'ThermalRes',0)
            S(e,'HeatCapacity',c); S(e,'SteamDiffCond',round(0.19/mu,6)); S(e,'SteamDiffRes',0); S(e,'SteamDiffResNum',0)
            S(e,'ThermalCondFactor',0); S(e,'PermitHumidity',0)
            p.append(e)
        u=u_layers(d); panel_k[name]=round(u,3)
        S(p,'Rsi',d['Rsi']); S(p,'Rse',d['Rse']); S(p,'kFromLayers',round(u,5)); S(p,'kFromLayersOriginal',round(u,5)); S(p,'k',round(u,3))
        if d['type']=='Roof1': S(p,'Gradient',d.get('gradient',0))
        if d['type'] in ('Roof2','Roof3','Roof5','InsideWall1'):
            S(p,'OutSideTemp',-2 if d['type']!='Roof5' else 20); S(p,'InSideTemp',20)
        if d['type']=='FloorISO':
            iso=[c['iso'] for c in [case] if c['iso']][0]
            p.find('ISOFloor').set('Area',str(iso['A'])); p.find('ISOFloor').set('Perimeter',str(iso['P']))
            S(p,'BaseWidth',iso['w']); S(p,'FloorIsolationThickness',0); S(p,'FloorIsolationResist',0); S(p,'FloorIsolationHeight',0); S(p,'FloorIsolationWidth',0)
        root.insert(list(root).index(bld),p)
    # --- ablak, ajtó
    w=copy.deepcopy(P['Ablak']); w.find('ItemHeader/ID').text=newid()
    wc=w.find('WindowCalc'); g=wc.find('GlassType'); g.set('Ug',str(WINDOW['Ug'])); g.set('g',str(WINDOW['g'])); g.text=WINDOW['glass']
    f=wc.find("FrameType[@Index='0']"); f.set('Uf',str(WINDOW['Uf'])); f.set('Width',str(WINDOW['frame_mm'])); f.text=WINDOW['frame']
    S(w,'GlassgValue',WINDOW['g']); S(w,'k',u_window(1.2,1.2)); S(w,'ShadowMode',0); S(w,'ShadowFactor',1)
    root.insert(list(root).index(bld),w)
    dr=copy.deepcopy(P['Ajtó']); dr.find('ItemHeader/ID').text=newid(); dr.find('ItemHeader/ItemName').text=DOOR['name']; S(dr,'k',DOOR['U'])
    root.insert(list(root).index(bld),dr)
    # --- helyiségek
    bid=bld.find('ItemHeader/ID').text
    def bnd(src,name,typ,x,y,A,U,MinA=0,compass=None,grad=None):
        b=copy.deepcopy(B[src]); S(b,'Name',name); S(b,'Type',typ); S(b,'x',x); S(b,'y',y); S(b,'A',round(A,4)); S(b,'MinA',MinA); S(b,'U',U); S(b,'NumOf',1)
        if compass is not None and b.find('Compass') is not None: S(b,'Compass',compass)
        if grad is not None and b.find('Gradient') is not None: S(b,'Gradient',grad)
        return b
    for rm in case['rooms']:
        r=copy.deepcopy(rtpl)
        for b in r.findall('Boundary'): r.remove(b)
        S(r,'ItemHeader/ItemName',rm['name']); S(r,'ItemHeader/ID',newid()); S(r,'Function',rm['function'])
        S(r,'Area',rm['area']); S(r,'Height',rm['height']); S(r,'GivedVolume',0); S(r,'BuildingRefID',bid)
        S(r,'Heating/Temp',rm['temp']); S(r,'Heating/Filtration/Mode',0); S(r,'Heating/Filtration/AirChangeFact',0.5)
        for wl in rm['walls']:
            r.append(bnd('Külső fal','R1./ Külső fal',0,wl['x'],wl['y'],wl['A'],panel_k['R1./ Külső fal'],wl['MinA'],wl['compass'],90))
        deg={'N':0,'E':90,'S':180,'W':270}
        for side,lst in rm['windows'].items():
            for (ww,hh,n) in lst:
                b=bnd('Ablak','Ablak',10,ww,hh,ww*hh,u_window(ww,hh),0,deg[side],90); S(b,'NumOf',n)
                S(b,'ShadowMode',0); S(b,'ShadowFactor',1)
                bwc=b.find('WindowCalc'); bwc.getparent().replace(bwc,copy.deepcopy(wc))
                r.append(b)
        if rm.get('door'):
            s,ww,hh=rm['door']; r.append(bnd('Ajtó',DOOR['name'],12,ww,hh,ww*hh,DOOR['U'],0,deg[s],90))
        if rm.get('roof'):
            r.append(bnd('Tető',rm['roof']['panel'],3,rm['roof']['A'],1,rm['roof']['A'],panel_k[rm['roof']['panel']],0,0,0))
        if rm.get('floor'):
            fl=rm['floor']; b=bnd('Padló',fl['panel'],26,fl['x'],1,fl['A'],panel_k[fl['panel']]); r.append(b)
        if rm.get('ceiling_internal'):
            c=rm['ceiling_internal']; r.append(bnd('Emelet födém',c['panel'],7,c['A'],1,c['A'],panel_k[c['panel']]))
        for key,typ,src in (('attic',4,'Emelet födém'),('basement',5,'Emelet födém'),('garage_wall',18,'Belső fal_futetlen')):
            if rm.get(key):
                c=rm[key]; x=c.get('x',c['A']); y=c.get('y',1)
                b=bnd(src,c['panel'],typ,x,y,c['A'],panel_k[c['panel']])
                o=b.find('OverSideTemp'); o.set('Flags','14'); o.set('OverTempWinter',str(c['t_over'])); o.set('BuWinter',str(c['Bu']))
                r.append(b)
        root.insert(list(root).index(bld),r)
    # --- épület/EPBD rendszerek
    ep=bld.find('EPBD'); A=case['heated_area']
    S(ep,'CalcArea',A); S(ep,'HeatedArea',A)
    tplsys={t:[copy.deepcopy(x) for x in ep.findall(t)] for t in ['WinWatt32HeatingSystemItem','WinWatt32WaterHeatingSystemItem','WinWatt32AiringSystemItem','WinWatt32CoolingSystemItem','WinWatt32LightingSystemItem','WinWatt32SolarSystemItem']}
    for t in tplsys:
        for x in ep.findall(t): ep.remove(x)
    anchor=ep.find('HeatingPrimerEnergy')
    sysd=case['systems']
    def stoker(e,gen,typ):
        S(e,'Type',typ); S(e,'Share',gen['share']); n,mult,sus=EN_DESC[gen['energy']]
        S(e,'EnergySourceType',gen['energy']); S(e,'EnergySourceTypeDescription',n); S(e,'PrimerEnergyMultiplier',mult); S(e,'SusFactor',sus)
        S(e,'CkType',gen['CkType']); S(e,'CkDescription',(BOYLER_DESC if typ==1 else WATER_DESC).get(gen['CkType'],'')); S(e,'UserDefined',0)
    # fűtés
    h=sysd['heating']; hs=tplsys['WinWatt32HeatingSystemItem'][1]
    S(hs,'Description',h['desc']); S(hs,'SystemArea',0); S(hs,'Area',A)
    sts=hs.findall('StokerItem')
    for s in sts[1:]: hs.remove(s)
    stoker(sts[0],h['gen'][0],1)
    S(hs,'SystemType',h['SystemType']); S(hs,'qfvType',h['qfvType']); S(hs,'qfvDescription',QFV[h['qfvType']])
    S(hs,'qftType',h['qftType']); S(hs,'qftDescription',QFT[h['qftType']]); S(hs,'EfszType',h['EfszType']); S(hs,'Efsz2Type',h['Efsz2Type'])
    for i,rp in enumerate(hs.findall('RegPart')): rp.set('Type',str(h['RegPart'][i]))
    anchor.addprevious(hs); n_heat=1
    d=sysd['dhw']; ws=tplsys['WinWatt32WaterHeatingSystemItem'][1]
    S(ws,'Description',d['desc']); S(ws,'SystemArea',0); S(ws,'Area',A)
    stoker(ws.find('StokerItem'),d['gen'][0],2)
    S(ws,'qfvType',d['qfvType']); S(ws,'qfvDescription',WQFV[d['qfvType']]); S(ws,'qftType',d['qftType']); S(ws,'qftDescription',WQFT[d['qftType']])
    S(ws,'EcType',d['EcType']); S(ws,'EcDescription','nincs segédenergia igény'); S(ws,'BuildingCategory',d['BuildingCategory'])
    for t in ('HMVUsingItem','SimpleHMVCollector'):
        x=ws.find(t)
        if x is not None: ws.remove(x)
    S(ws,'UserFlags',0)
    anchor.addprevious(ws)
    n_air=n_cool=n_sol=0
    if 'airing' in sysd:
        a=sysd['airing']; asys=tplsys['WinWatt32AiringSystemItem'][0]
        V=sum(rm['area']*rm['height'] for rm in case['rooms'])
        S(asys,'Description','Központi hővisszanyerős szellőztető, η=%d %%'%a['eta']); S(asys,'SystemArea',0); S(asys,'Area',A)
        S(asys,'Volume',V); S(asys,'AirChangeFactLT',a['n']); S(asys,'AirVolumeLTBase',round(a['n']*V,3)); S(asys,'RecuperEfficiency',a['eta'])
        S(asys,'RecuperationFlags',1); S(asys,'WorkingSeasons',1); S(asys,'dpVent',a['dp']); S(asys,'VentEfficiency',a['fan_eff'])
        for t in ('StokerItem','CoolerItem','AirCanalItem'):
            x=asys.find(t)
            if x is not None: asys.remove(x)
        anchor.addprevious(asys); n_air=1
    if 'cooling' in sysd:
        cs=tplsys['WinWatt32CoolingSystemItem'][0]; S(cs,'Description','Split klíma a lakótérben'); S(cs,'SystemArea',0); S(cs,'Area',A)
        anchor.addprevious(cs); n_cool=1
    if 'pv' in sysd:
        pv=sysd['pv']; so=tplsys['WinWatt32SolarSystemItem'][0]; S(so,'Description','Napelem %s kWp'%pv['kWp'])
        sp=so.find('SimplePV'); sp.set('PeakPower',str(pv['kWp'])); sp.set('Compass',str(pv['compass'])); sp.set('Gradient',str(pv['gradient'])); sp.set('EnergyProduction','0')
        S(so,'Area',A); anchor.addprevious(so); n_sol=1
    S(ep,'NumOfHeatingSystems',n_heat); S(ep,'NumOfWaterHeatingSystems',1); S(ep,'NumOfAiringSystems',n_air)
    S(ep,'NumOfCoolingSystems',n_cool); S(ep,'NumOfLightingSystems',0); S(ep,'NumOfOtherSystems',n_sol)
    for x in ep.findall('PanelRenovationItem')+ep.findall('PhotoAlbumItem'): ep.remove(x)
    # projektfejléc
    pd=root.find('ProjektData'); lines=pd.findall('Line')
    lines[0].text='GOLDEN '+case['id']; lines[1].text='8060 Mór'; lines[2].text='Teszt utca 1. Hrsz: 0000/'+case['id'][1]
    lines[3].text='Golden teszt megrendelő'; lines[4].text='8060 Mór, Teszt utca 1.'
    c=pd.find('Construction'); c.set('Name','GOLDEN '+case['id']); c.set('ZipCode','8060'); c.set('City','Mór'); c.set('Street','Teszt'); c.set('HousNr','1')
    c.set('LotNr','0000/'+case['id'][1]); c.set('YearOfBuilding','2025'); c.set('YearOfModernization','')
    c.text='GOLDEN %s\\r\\n8060 Mór\\r\\nTeszt utca 1.\\r\\n'%case['id']
    co=pd.find('Consumer'); co.set('Name','Golden teszt megrendelő'); co.set('ZipCode','8060'); co.set('City','Mór'); co.set('Address','Teszt utca 1.')
    co.text='Golden teszt megrendelő\\r\\n8060 Mór, Teszt utca 1.\\r\\n'
    S(bld,'ItemHeader/ItemName','Épület '+case['id'])
    return root, panel_k

def main():
    tpl=etree.parse(TPL).getroot()
    os.makedirs(os.path.join(OUT,'import'),exist_ok=True); os.makedirs(os.path.join(OUT,'inputs'),exist_ok=True)
    for case in CASES:
        root,pk=build(case,tpl)
        etree.ElementTree(root).write(os.path.join(OUT,'import',case['id']+'_import.xml'),encoding='utf-8',xml_declaration=True)
        inp=dict(case); inp['materials_used']={k:dict(zip(['rho','lambda','c_kJkgK','mu'],v)) for k,v in MAT.items()}
        inp['panels']={k:PANELS[k] for k in pk}; inp['panel_U_hand']=pk; inp['window']=WINDOW; inp['door']=DOOR
        json.dump(inp,open(os.path.join(OUT,'inputs',case['id']+'.json'),'w'),ensure_ascii=False,indent=1)
        print(case['id'],pk)
main()
