const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
const document = {getElementById(id) {if (!elements.has(id)) elements.set(id,{value:'',innerHTML:'',textContent:'',events:{},addEventListener(type,fn){this.events[type]=fn;}}); return elements.get(id);}};
const context = vm.createContext({window:{},document,URL});
vm.runInContext(fs.readFileSync('docs/gsc-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('docs/gsc-report.js','utf8'),context);
assert.equal(context.window.GSC_DATA.months.length,8);
for (const d of context.window.GSC_DATA.months) {
  assert.equal(d.devices.reduce((s,r)=>s+r.clicks,0),d.clicks);
  assert.equal(d.devices.reduce((s,r)=>s+r.impressions,0),d.impressions);
  assert.ok(Math.abs(d.ctr-d.clicks/d.impressions*100)<1e-10);
}
assert.match(elements.get('cards').innerHTML,/402/);
assert.match(elements.get('cards').innerHTML,/15,991/);
assert.match(elements.get('cards').innerHTML,/13.6%/);
assert.match(elements.get('queries').innerHTML,/鳳梨皮革/);
assert.match(elements.get('pages').innerHTML,/pineapple-leather/);
for (const d of context.window.GSC_DATA.months) {
  for (const key of ['queries','pages']) {
    assert.equal(d[key].length,10);
    assert.ok(d[key].every(r=>[r.clicks,r.impressions,r.ctr,r.position].every(Number.isFinite)));
    for(let i=1;i<10;i++) assert.ok(d[key][i-1].clicks>=d[key][i].clicks);
  }
  vm.runInContext(`render('${d.month}')`,context);
  assert.equal((elements.get('queries').innerHTML.match(/<tr>/g)||[]).length,10);
  assert.equal((elements.get('pages').innerHTML.match(/<tr>/g)||[]).length,10);
  assert.match(elements.get('queries-title').textContent,new RegExp(Number(d.month.slice(5))+' 月'));
}
assert.equal(vm.runInContext("escapeHTML('<img>')",context),'&lt;img&gt;');
assert.ok(!vm.runInContext("pageLink('javascript:alert(1)')",context).includes('<a'));
elements.get('month').events.change({target:{value:'2026-01'}});
assert.match(elements.get('cards').innerHTML,/138/);
assert.match(elements.get('cards').innerHTML,/無上月資料/);
elements.get('months').events.click({target:{closest:()=>({dataset:{month:'2026-07'}})}});
assert.equal(elements.get('month').value,'2026-07');
assert.match(elements.get('devices').innerHTML,/259/);
assert.equal(vm.runInContext("change({clicks:3},{clicks:0},'clicks')",context),'上月為零，無法計算');
assert.equal(vm.runInContext("previous({month:'2026-10'})",context),undefined);
console.log('Passed: monthly totals, CTR, initial cards, month switching, device details, missing/zero comparison.');
