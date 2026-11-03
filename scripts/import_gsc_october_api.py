"""Import the verified October 2026 GSC API snapshot."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
raw = json.loads((root/'output/gsc-october-api.json').read_text(encoding='utf-8'))
daily = raw['daily']['rows']
assert [r['keys'][0] for r in daily] == [f'2026-10-{d:02d}' for d in range(1,32)]
total = raw['total']['rows'][0]
assert sum(r['clicks'] for r in daily) == total['clicks']
assert sum(r['impressions'] for r in daily) == total['impressions']
def record(row, device=False):
    name = row['keys'][0]
    if device:
        name = {'DESKTOP':'桌面','MOBILE':'行動裝置','TABLET':'平板電腦'}.get(name.upper(),name)
    return dict(name=name,clicks=int(row['clicks']),impressions=int(row['impressions']),ctr=row['ctr']*100,position=row['position'])
month = dict(month='2026-10',clicks=int(total['clicks']),impressions=int(total['impressions']),ctr=total['ctr']*100,
             position=total['position'],estimated=False,days=31,source='gsc-october-source.json',sourceLabel='GSC 同步資料',
             devices=[record(r,True) for r in raw['devices']['rows']])
for key in ['queries','pages']:
    month[key] = sorted([record(r) for r in raw[key]['rows']],key=lambda r:(-r['clicks'],-r['impressions'],r['name']))[:10]
for field in ['clicks','impressions']:
    assert sum(r[field] for r in month['devices']) == month[field]
target = root/'docs/gsc-data.js'
data = json.loads(target.read_text(encoding='utf-8').removeprefix('window.GSC_DATA = ').strip().removesuffix(';'))
data['months'] = sorted([r for r in data['months'] if r['month'] != month['month']]+[month],key=lambda r:r['month'])
data['updated'] = '2026-11-03'
target.write_text('window.GSC_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
source = dict(period='2026-10-01 – 2026-10-31',imported='2026-11-03',site='https://kindmade.com.tw/',
              searchType='web',dataState='final',total=total,daily=daily,devices=month['devices'],queries=month['queries'],pages=month['pages'])
(root/'docs/gsc-october-source.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(month,ensure_ascii=True))
