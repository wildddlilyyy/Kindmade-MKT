const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const elements={};
const context=vm.createContext({window:{},document:{getElementById(id){return elements[id]??={innerHTML:'',textContent:''};}}});
vm.runInContext(fs.readFileSync('docs/article-traffic-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('docs/article-traffic.js','utf8'),context);
function period(start,end){return JSON.parse(vm.runInContext(`JSON.stringify(articleWindow('${start}','${end}'))`,context));}
assert.deepEqual(period('2026-09-24','2026-10-22'),{days:29,ready:false,first30End:'2026-10-23'});
assert.deepEqual(period('2026-09-24','2026-10-23'),{days:30,ready:true,first30End:'2026-10-23'});
assert.equal(period('2026-11-03','2026-11-02').days,0);
assert.equal(period('2026-10-08','2026-11-02').days,26);
assert.equal(period('2026-09-24','2026-11-02').days,40);
assert.equal(vm.runInContext('viewsLabel(0)',context),'0');
assert.equal(vm.runInContext('viewsLabel(null)',context),'待匯入');
assert.equal((elements['traffic-rows'].innerHTML.match(/<tr>/g)||[]).length,5);
assert.equal((elements['traffic-rows'].innerHTML.match(/>觀察中</g)||[]).length,4);
assert.equal((elements['traffic-rows'].innerHTML.match(/>已滿 30 天 ↗</g)||[]).length,1);
assert.match(elements['traffic-rows'].innerHTML,/href="article-seo-sustainable-coaster.html#article-performance"/);
assert.ok(!/<a[^>]*>觀察中<\/a>/.test(elements['traffic-rows'].innerHTML));
for(const article of context.window.ARTICLE_TRAFFIC.articles){
  const detail={innerHTML:''};
  const detailContext=vm.createContext({window:{},location:{pathname:'/docs/'+article.strategy},document:{getElementById(id){return id==='article-performance'?detail:null;}}});
  for(const file of ['article-traffic-data.js','article-traffic.js','article-performance.js'])vm.runInContext(fs.readFileSync('docs/'+file,'utf8'),detailContext);
  assert.match(detail.innerHTML,/文章成效數據/);
  assert.match(detail.innerHTML,/工作階段來源／媒介/);
  if(article.published<='2026-11-02')assert.match(detail.innerHTML,/待確認追蹤/);
  assert.ok(!detail.innerHTML.includes('undefined'));
  if(article.published==='2026-09-24')assert.match(detail.innerHTML,/2026-09-24 ～ 2026-10-23/);
  else assert.match(detail.innerHTML,/觀察中/);
  const markup=fs.readFileSync('docs/'+article.strategy,'utf8');
  assert.equal((markup.match(/id="article-performance"/g)||[]).length,1);
}
console.log('Passed: inclusive date windows, 29/30-day boundary, future publication, missing versus zero, five article rows.');
