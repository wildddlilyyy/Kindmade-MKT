'use strict';
const traffic = window.ARTICLE_TRAFFIC;
const dayMillis = 86400000;
function articleWindow(published, cutoff) {
  const start = Date.parse(published+'T00:00:00Z');
  const end = Date.parse(cutoff+'T00:00:00Z');
  const days = Math.max(0, Math.floor((end-start)/dayMillis)+1);
  return {days,ready:days>=30,first30End:new Date(start+29*dayMillis).toISOString().slice(0,10)};
}
const escapeTraffic = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const viewsLabel = value => Number.isInteger(value)&&value>=0 ? value.toLocaleString('zh-TW') : '待匯入';
if (document.getElementById('traffic-rows')) {
document.getElementById('traffic-cutoff').textContent = traffic.cutoff+' · '+traffic.timezone;
document.getElementById('traffic-rows').innerHTML = traffic.articles.map(article=>{
  const period=articleWindow(article.published,traffic.cutoff);
  const accumulation=period.days ? viewsLabel(article.cumulativeViews) : '尚無完整日';
  const first30=period.ready ? viewsLabel(article.first30Views) : '—';
  const status=period.ready?`<a class="traffic-badge traffic-ready traffic-open" href="${escapeTraffic(article.strategy)}#article-performance" aria-label="查看${escapeTraffic(article.title)}的首 30 天數據">已滿 30 天 ↗</a>`:'<span class="traffic-badge">觀察中</span>';
  return `<tr><td><a href="${escapeTraffic(article.strategy)}">${escapeTraffic(article.title)}</a></td><td>${article.published}</td><td>${period.days} 天</td><td>${accumulation}<small>${period.days?article.published+'～'+traffic.cutoff:'自上架次日起可查看完整日資料'}</small></td><td>${first30}<small>${period.ready?article.published+'～'+period.first30End:'滿 30 個完整日後呈現'}</small></td><td>${status}</td></tr>`;
}).join('');
}
