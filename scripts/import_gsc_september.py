"""Read the supplied September export and update the dashboard snapshot."""
import json
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
book = openpyxl.load_workbook(source, data_only=True)
daily = list(book['圖表'].values)[1:]
assert len(daily) == 30
assert [r[0] for r in daily] == [f'2026-09-{d:02d}' for d in range(1, 31)]
filters = list(book['篩選器'].values)
assert '2026年9月1日-2026年9月30日' in str(filters)

def records(tab):
    return [dict(name=r[0], clicks=int(r[1]), impressions=int(r[2]), ctr=float(r[3])*100, position=float(r[4]))
            for r in list(book[tab].values)[1:] if r[0] is not None]

clicks = sum(int(r[1]) for r in daily)
impressions = sum(int(r[2]) for r in daily)
devices = records('裝置')
assert sum(r['clicks'] for r in devices) == clicks
assert sum(r['impressions'] for r in devices) == impressions
month = dict(month='2026-09', clicks=clicks, impressions=impressions,
             ctr=clicks/impressions*100,
             position=sum(float(r[4])*int(r[2]) for r in daily)/impressions,
             estimated=True, days=30, source='gsc-september-source.json', sourceLabel='匯入資料',
             devices=devices)
for tab, key in [('查詢','queries'), ('網頁','pages')]:
    month[key] = sorted(records(tab), key=lambda r: (-r['clicks'], -r['impressions'], r['name']))[:10]

root = Path(__file__).resolve().parents[1]
data_path = root/'docs/gsc-data.js'
data = json.loads(data_path.read_text(encoding='utf-8').removeprefix('window.GSC_DATA = ').strip().removesuffix(';'))
data['months'] = sorted([m for m in data['months'] if m['month'] != '2026-09']+[month], key=lambda m:m['month'])
data['updated'] = '2026-10-20'
data_path.write_text('window.GSC_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
provenance = dict(period='2026-09-01 – 2026-09-30', imported='2026-10-20',
                  daily=[dict(date=r[0],clicks=int(r[1]),impressions=int(r[2]),ctr=float(r[3])*100,position=float(r[4])) for r in daily],
                  devices=devices, queries=month['queries'], pages=month['pages'])
(root/'docs/gsc-september-source.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(clicks=clicks,impressions=impressions,ctr=month['ctr'],position=month['position'],clickChange=(clicks/402-1)*100),ensure_ascii=True))
