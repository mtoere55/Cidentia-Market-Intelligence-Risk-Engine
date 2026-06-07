export function dashboardHtml() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cidentia Market Intelligence</title>
  <style>
    *{box-sizing:border-box} body{margin:0;font-family:Arial,sans-serif;background:#05070d;color:#eef3ff}
    .wrap{max-width:1400px;margin:0 auto;padding:16px}.box{background:#0d1424;border:1px solid #1f2a44;border-radius:16px;padding:14px;margin-bottom:14px}
    h1{margin:0;font-size:24px} p{color:#bfd0ee}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pill{padding:6px 10px;border-radius:999px;background:#07101f;border:1px solid #263858;font-weight:800;font-size:12px}.green{color:#4ade80}.red{color:#fb7185}.yellow{color:#facc15}.blue{color:#93c5fd}.muted{color:#93a7cb}
    .kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:12px}.kpi{background:#070b12;border:1px solid #1f2a44;border-radius:12px;padding:10px}.label{font-size:11px;color:#93a7cb;text-transform:uppercase}.value{font-size:19px;font-weight:900;margin-top:5px}
    input,button{background:#050814;color:#eef3ff;border:1px solid #334155;border-radius:9px;padding:9px}button{background:#2f6df6;border:0;font-weight:900;cursor:pointer}.okbtn{background:#16a34a}.warnbtn{background:#f59e0b;color:#111827}.dangerbtn{background:#9f1239}.graybtn{background:#334155}
    .grid{display:grid;grid-template-columns:minmax(0,1fr)360px;gap:14px}.side{display:flex;flex-direction:column;gap:14px}table{width:100%;border-collapse:collapse;min-width:980px}th,td{border-bottom:1px solid #1f2a44;padding:8px;font-size:12px;text-align:left;white-space:nowrap}th{background:#0a1020;color:#93a7cb}tr:hover{background:rgba(47,109,246,.10);cursor:pointer}.selected{background:rgba(47,109,246,.20)}.tablewrap{overflow:auto;border:1px solid #1f2a44;border-radius:12px}pre{background:#050814;border:1px solid #1f2a44;border-radius:12px;padding:12px;white-space:pre-wrap;max-height:280px;overflow:auto}.ticket{display:flex;justify-content:space-between;border-bottom:1px solid #172033;padding:7px 0;gap:8px}.ticket b{text-align:right}@media(max-width:1000px){.grid{grid-template-columns:1fr}.kpis{grid-template-columns:repeat(2,1fr)}}
  </style>
</head>
<body>
<div class="wrap">
  <section class="box">
    <div class="row" style="justify-content:space-between">
      <div><h1>Cidentia Market Intelligence & Risk Engine</h1><p>Bitget public data, risk kontrol, paper trading. Gerçek emir kapalıdır.</p></div>
      <span class="pill red">LIVE ORDER LOCKED</span>
    </div>
    <div class="row"><span class="pill green">ENGINE ONLINE</span><span class="pill yellow">PAPER ONLY</span><span class="pill blue">BITGET READ ONLY</span><span id="clock" class="pill">bekleniyor</span></div>
    <div class="kpis"><div class="kpi"><div class="label">Mode</div><div id="mode" class="value">...</div></div><div class="kpi"><div class="label">Gate</div><div id="gate" class="value">...</div></div><div class="kpi"><div class="label">Scanned</div><div id="scanned" class="value">0</div></div><div class="kpi"><div class="label">Best</div><div id="best" class="value blue">-</div></div><div class="kpi"><div class="label">Paper PnL</div><div id="pnl" class="value">€0</div></div><div class="kpi"><div class="label">Win Rate</div><div id="win" class="value">0%</div></div></div>
    <div class="row" style="margin-top:12px"><label>Limit <input id="limit" value="25" style="width:70px"></label><label>Sermaye € <input id="account" value="100" style="width:80px"></label><label>Risk % <input id="risk" value="3" style="width:70px"></label><button onclick="scan()">Live Scan</button><button class="warnbtn" onclick="paperNow()">Paper Şimdi Gir</button><button class="okbtn" onclick="paperQueue()">Queue Paper</button><button class="graybtn" onclick="refreshPaper()">Refresh</button><button class="dangerbtn" onclick="resetPaper()">Sanal Sıfırla</button></div>
    <p id="signal" class="yellow">Hazır. Live Scan bas.</p>
  </section>
  <main class="grid">
    <section class="box"><h2>Execution Grid</h2><div class="tablewrap"><table><thead><tr><th>#</th><th>Symbol</th><th>Price</th><th>Decision</th><th>Bias</th><th>Score</th><th>Conf</th><th>Risk</th><th>R/R</th><th>Plan</th></tr></thead><tbody id="rows"><tr><td colspan="10" class="muted">Scanner bekleniyor.</td></tr></tbody></table></div></section>
    <aside class="side"><section class="box"><h2>Ticket</h2><div id="ticket" class="muted">Satır seçilmedi.</div></section><section class="box"><h2>Paper</h2><div id="paper" class="muted">Yükleniyor.</div></section><section class="box"><h2>Output</h2><pre id="out">-</pre></section></aside>
  </main>
</div>
<script>
var results=[];var selected=0;
function e(id){return document.getElementById(id)}
function show(x){e('out').textContent=JSON.stringify(x,null,2)}
function esc(x){return String(x==null?'':x).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function num(x,d){var n=Number(x);return Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d||8}):'-'}
function eur(x){var n=Number(x||0);return n.toLocaleString('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:2})}
function pct(x){var n=Number(x||0);return Number.isFinite(n)?n.toFixed(2)+'%':'-'}
async function api(path,opt){var r=await fetch(path,opt||{});var t=await r.text();var j;try{j=JSON.parse(t)}catch(_){j={raw:t}}show(j);if(!r.ok)throw j;return j}
function price(item){if(Number.isFinite(Number(item.primaryPrice)))return Number(item.primaryPrice);var a=item.tickers||[];var b=a.find(function(x){return x.exchange==='bitget'});return b?Number(b.lastPrice):null}
function cls(action){action=String(action||'');if(action.indexOf('LONG')>=0)return 'green';if(action.indexOf('SHORT')>=0)return 'red';if(action.indexOf('AVOID')>=0||action.indexOf('FAILED')>=0)return 'red';return 'yellow'}
async function status(){try{var d=await api('/status');var c=d.config||{};e('mode').textContent=c.tradingMode||d.mode||'paper';e('mode').className='value green';e('gate').textContent=(c.realTradingGateOpen||d.realTradingGateOpen)?'OPEN':'LOCKED';e('gate').className=(c.realTradingGateOpen||d.realTradingGateOpen)?'value red':'value green';if(d.paperPerformance)renderPaper({summary:d.paperPerformance,setups:d.paper&&d.paper.setups||[]});e('clock').textContent=new Date().toLocaleTimeString()}catch(err){e('signal').textContent='Status hata: '+(err.error||err.message||'bilinmiyor')}}
function renderRows(){if(!results.length){e('rows').innerHTML='<tr><td colspan="10" class="muted">Sonuç yok.</td></tr>';return}e('rows').innerHTML=results.map(function(x,i){var d=x.decision||{};var p=x.virtualTradePlan||{};var rr=p.riskRewardToTp1==null?'-':Number(p.riskRewardToTp1).toFixed(2);return '<tr '+(i===selected?'class="selected"':'')+' onclick="pick('+i+')"><td>'+(i+1)+'</td><td><b>'+esc(x.symbol)+'</b></td><td>'+num(price(x),8)+'</td><td class="'+cls(d.action)+'">'+esc(d.label||d.action||'-')+'</td><td>'+esc(x.directionBias||'-')+'</td><td>'+esc(x.score||0)+'</td><td>'+esc(x.confidence||0)+'</td><td>'+esc(x.riskTier||'-')+'</td><td>'+rr+'</td><td>'+esc(x.opportunityTier||p.quality||'-')+'</td></tr>'}).join('')}
function pick(i){selected=i;renderRows();renderTicket()}
function renderTicket(){var x=results[selected];if(!x){e('ticket').textContent='Satır seçilmedi.';return}var p=x.virtualTradePlan||{};var m=x.moneyManagement||{};var d=x.decision||{};var entry=p.entryZone?num(p.entryZone.from,8)+' - '+num(p.entryZone.to,8):'-';e('ticket').innerHTML='<div class="ticket"><span>Symbol</span><b>'+esc(x.symbol)+'</b></div><div class="ticket"><span>Price</span><b>'+num(price(x),8)+'</b></div><div class="ticket"><span>Decision</span><b>'+esc(d.label||d.action||'-')+'</b></div><div class="ticket"><span>Entry</span><b>'+entry+'</b></div><div class="ticket"><span>Stop</span><b>'+num(p.stopLoss,8)+'</b></div><div class="ticket"><span>TP1 / TP2</span><b>'+num(p.takeProfit1,8)+' / '+num(p.takeProfit2,8)+'</b></div><div class="ticket"><span>Size</span><b>'+(m.enabled?eur(m.suggestedPositionEur):'-')+'</b></div><p class="muted">Paper gerçek emir değildir.</p>'}
function renderPaper(d){var s=d.summary||{};var setups=d.setups||[];e('pnl').textContent=eur(s.totalPnlEur||0);e('pnl').className=Number(s.totalPnlEur||0)>=0?'value green':'value red';e('win').textContent=pct(s.winRate||0);var html='<div class="ticket"><span>Queued</span><b>'+(s.queued||0)+'</b></div><div class="ticket"><span>Active</span><b>'+(s.active||0)+'</b></div><div class="ticket"><span>Closed</span><b>'+(s.closed||0)+'</b></div><div class="ticket"><span>Total</span><b>'+eur(s.totalPnlEur||0)+'</b></div>';html+=setups.slice(0,5).map(function(x){return '<p class="muted"><b>'+esc(x.symbol)+'</b> '+esc(x.side)+' '+esc(x.status)+' PnL '+eur((x.realizedPnlEur||0)+(x.unrealizedPnlEur||0))+'</p>'}).join('');e('paper').innerHTML=html}
async function scan(){e('signal').textContent='Tarama çalışıyor...';try{var d=await api('/scanner?mode=top-bitget&limit='+encodeURIComponent(e('limit').value)+'&accountSizeEur='+encodeURIComponent(e('account').value)+'&riskPercent='+encodeURIComponent(e('risk').value));results=d.results||[];selected=0;e('scanned').textContent=d.count||0;e('best').textContent=results[0]?results[0].symbol:'-';renderRows();renderTicket();e('signal').textContent=results[0]?'Best: '+results[0].symbol:'Tarama bitti, aday yok.'}catch(err){e('signal').textContent='Scan hata: '+(err.error||err.message||'bilinmiyor');show(err)}}
function body(){var x=results[selected];if(!x)throw new Error('Satır seç.');var p=x.virtualTradePlan||{};var m=x.moneyManagement||{};var side=p.side||x.directionBias;if(String(side).toLowerCase()!=='long'&&String(side).toLowerCase()!=='short')throw new Error('Bu satır long/short değil.');if(!p.entryZone||!p.stopLoss||!p.takeProfit1)throw new Error('Bu satırda plan yok.');return {exchange:'bitget',symbol:x.symbol,side:String(side).toLowerCase(),entryZone:p.entryZone,stopLoss:p.stopLoss,takeProfit1:p.takeProfit1,takeProfit2:p.takeProfit2||p.takeProfit1,positionSizeEur:m.enabled?m.suggestedPositionEur:25,maxRiskEur:m.enabled?m.maxRiskEur:null,riskRewardToTp1:p.riskRewardToTp1,sourceDecision:x.decision||null}}
async function paperQueue(){try{await api('/paper/queue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body())});await refreshPaper()}catch(err){alert(err.message||err.reason||'Queue hata');show(err)}}
async function paperNow(){try{await api('/paper/market-now',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body())});await refreshPaper()}catch(err){alert(err.message||err.reason||'Paper hata');show(err)}}
async function refreshPaper(){try{await api('/paper/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});var d=await api('/paper/performance');renderPaper(d)}catch(err){show(err)}}
async function resetPaper(){if(!confirm('Sanal paper sıfırlansın mı?'))return;await api('/paper/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await refreshPaper()}
window.pick=pick;window.scan=scan;window.paperQueue=paperQueue;window.paperNow=paperNow;window.refreshPaper=refreshPaper;window.resetPaper=resetPaper;status();setInterval(refreshPaper,15000);
</script>
</body>
</html>`;
}
