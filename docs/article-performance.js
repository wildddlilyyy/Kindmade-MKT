'use strict';
const performanceRoot=document.getElementById('article-performance');
const currentStrategy=location.pathname.split('/').pop();
const currentArticle=traffic.articles.find(a=>a.strategy===currentStrategy);
if(performanceRoot&&currentArticle){
  const period=articleWindow(currentArticle.published,traffic.cutoff);
  const metrics=[
    ['views','瀏覽量','GA4','頁面被觀看的次數，包含同一位訪客重複瀏覽。'],
    ['activeUsers','活躍使用者','GA4','在此期間與文章互動的活躍使用者，不同日人數不直接相加。'],
    ['averageEngagementSeconds','平均參與時間／活躍使用者','GA4','文章在瀏覽器前景的參與時間，除以活躍使用者；不是讀完整篇的時間。'],
    ['landingSessions','入口工作階段','GA4','以這篇文章作為到達網頁的工作階段，反映文章帶來的進站造訪。'],
    ['searchClicks','Google 搜尋點擊','GSC','Google 自然搜尋結果導向這篇文章的點擊，不等於 GA4 瀏覽量。'],
    ['lineClicks','LINE 詢問點擊','GA4 事件','從文章點擊 LINE 入口的次數；需確認事件追蹤，點擊不代表已送出訊息。']
  ];
  function metricValue(article,key,first30){
    if(first30&&!period.ready)return '—';
    if(!first30&&!period.days)return '尚無完整日';
    const bucket=article[first30?'first30Metrics':'cumulativeMetrics']||{};
    const value=key==='views'?(bucket.views??article[first30?'first30Views':'cumulativeViews']):bucket[key];
    if(key==='lineClicks'&&value==null)return '待確認追蹤';
    if(value==null||!Number.isFinite(value))return '待匯入';
    return key==='averageEngagementSeconds'?Math.round(value)+' 秒':viewsLabel(value);
  }
  const cumulativeRange=period.days?currentArticle.published+' ～ '+traffic.cutoff:'截至統計日尚無完整日資料';
  const firstRange=currentArticle.published+' ～ '+period.first30End;
  const firstStatus=period.ready?'已滿 30 天 · 等待數據匯入':'觀察中 · 未滿 30 天，不計算首期成效';
  performanceRoot.innerHTML=`<div class="performance-head"><div><div class="eyebrow">ARTICLE PERFORMANCE</div><h2>文章成效數據</h2><p>統計截止：${traffic.cutoff} · ${traffic.timezone}</p></div><span class="performance-state">GA4 數據待匯入</span></div>
  <div class="performance-summary"><div><small>上架日期</small><strong>${currentArticle.published}</strong></div><div><small>上架累積天數</small><strong>${period.days} 天</strong></div><div><small>累積瀏覽量</small><strong>${metricValue(currentArticle,'views',false)}</strong></div><div><small>首 30 天瀏覽量</small><strong>${period.ready?metricValue(currentArticle,'views',true):'觀察中'}</strong></div></div>
  <div class="performance-periods"><div><h3>上架累積成效</h3><p>${cumulativeRange}</p><p>隨資料更新持續累積。</p></div><div><h3>上架首 30 天</h3><p>${firstRange}</p><p>${firstStatus}</p></div></div>
  <div class="performance-scroll"><table class="performance-table"><thead><tr><th scope="col">指標</th><th scope="col">累積成效</th><th scope="col">首 30 天</th><th scope="col">數據如何解讀</th></tr></thead><tbody>${metrics.map(([key,title,source,description])=>`<tr><th scope="row">${title}<small>${source}</small></th><td>${metricValue(currentArticle,key,false)}</td><td>${metricValue(currentArticle,key,true)}</td><td>${description}</td></tr>`).join('')}</tbody></table></div>
  <h3 class="performance-subtitle">從哪裡進站？</h3><p>依到達網頁篩選本篇文章，查看「工作階段來源／媒介」；用來判斷搜尋、社群與其他網站帶來的入口造訪。</p>
  <div class="performance-scroll"><table class="performance-table"><thead><tr><th scope="col">工作階段來源／媒介</th><th scope="col">累積入口工作階段</th><th scope="col">首 30 天入口工作階段</th></tr></thead><tbody><tr><td colspan="3" class="performance-empty">來源數據待匯入${period.ready?'':'；首 30 天仍在觀察中'}</td></tr></tbody></table></div>
  <p class="performance-note">上架當天為第 1 天，首期固定為 30 個日曆日；資料不含今日。累積期間與首 30 天各自統計使用者與平均參與時間，不以每日結果相加或簡單平均。待匯入不代表零流量。時區暫採台北，匯入時需與 GA4 資源一致。</p>`;
}
