export function dashboardHtml() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cidentia Broker Ops Terminal</title>
  <style>
    :root { color-scheme: dark; }
    body { margin:0; font-family:Arial,sans-serif; background:#05070d; color:#eef3ff; }
    .wrap { max-width:1500px; margin:0 auto; padding:14px; }
    .topbar,.panel,.sideCard,.signalStrip,.tabsBox { border:1px solid #1f2a44; background:#0d1424; border-radius:14px; box-shadow:0 12px 40px rgba(0,0,0,.26); }
    .topbar { padding:10px 12px; background:linear-gradient(135deg,#10182a,#070b12); }
    .brandLine { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
    h1 { margin:0; font-size:21px; letter-spacing:.2px; }
    h2 { margin:0 0 9px; font-size:16px; }
    h3 { margin:0 0 8px; font-size:14px; }
    p { color:#bfd0ee; line-height:1.4; margin:6px 0; }
    .compactStatus { display:flex; gap:7px; flex-wrap:wrap; margin-top:8px; }
    .statusItem { background:#070b12; border:1px solid #1f2a44; border-radius:10px; padding:7px 9px; font-size:12px; }
    .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#4ade80; box-shadow:0 0 10px #4ade80; margin-right:5px; }
    .safe { color:#4ade80; } .danger { color:#fb7185; } .warnText { color:#facc15; } .blueText { color:#93c5fd; }
    .controls { display:flex; gap:7px; align-items:center; flex-wrap:wrap; margin-top:9px; }
    button { border:0; border-radius:9px; padding:8px 10px; font-weight:800; cursor:pointer; background:#2f6df6; color:white; font-size:12px; }
    button.secondary { background:#334155; } button.dangerBtn { background:#9f1239; } button.soundBtn { background:#0f766e; }
    input { background:#050814; color:#eef3ff; border:1px solid #334155; border-radius:8px; padding:7px; width:72px; }
    label { color:#aebfe1; font-size:12px; }
    .kpiGrid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-top:10px; }
    .kpi { background:#070b12; border:1px solid #1f2a44; border-radius:11px; padding:9px; min-height:50px; }
    .label { color:#93a7cb; font-size:10px; text-transform:uppercase; letter-spacing:.4px; }
    .value { font-size:18px; font-weight:900; margin-top:4px; }
    .signalStrip { margin-top:10px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .signalStrip.active { border-color:#22c55e; box-shadow:0 0 24px rgba(34,197,94,.22); animation:pulse 1s ease-in-out 3; }
    @keyframes pulse { 0% { transform:scale(1); } 50% { transform:scale(1.006); } 100% { transform:scale(1); } }
    .signalTitle { font-size:15px; font-weight:1000; }
    .tickerTape { margin-top:8px; border:1px solid #1f2a44; border-radius:10px; background:#070b12; overflow:hidden; white-space:nowrap; }
    .tickerInner { display:inline-block; padding:7px 0; animation:tape 28s linear infinite; }
    .tickerItem { display:inline-block; margin:0 18px; font-weight:800; font-size:12px; }
    @keyframes tape { from { transform:translateX(0); } to { transform:translateX(-50%); } }
    .workspace { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:12px; margin-top:12px; align-items:start; }
    .panel,.sideCard,.tabsBox { padding:12px; }
    .miniSummary { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; margin-bottom:10px; }
    .miniSummary div { background:#070b12; border:1px solid #1f2a44; border-radius:10px; padding:8px; font-size:12px; }
    .tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:9px; }
    .tabBtn { background:#111a2e; border:1px solid #25314e; }
    .tabBtn.active { background:#2f6df6; }
    .tabContent { min-height:120px; max-height:190px; overflow:auto; }
    .tabContent p { font-size:12px; border-bottom:1px solid #172033; padding-bottom:6px; }
    .side { position:sticky; top:12px; display:flex; flex-direction:column; gap:10px; }
    .ticketRow { display:flex; justify-content:space-between; border-bottom:1px solid #172033; padding:6px 0; gap:10px; font-size:12px; }
    .ticketRow b { color:#fff; text-align:right; }
    .scanLine { font-family:Consolas,monospace; font-size:11px; color:#cbd5e1; border-bottom:1px solid #172033; padding:5px 0; }
    .scanLog { max-height:210px; overflow:auto; }
    .tableWrap { overflow:auto; border:1px solid #1f2a44; border-radius:12px; }
    table { width:100%; min-width:1120px; border-collapse:collapse; }
    th,td { border-bottom:1px solid #1f2a44; padding:8px 7px; text-align:left; font-size:11px; white-space:nowrap; }
    th { color:#93a7cb; background:#0a1020; position:sticky; top:0; z-index:1; }
    tr:hover { background:rgba(47,109,246,.08); cursor:pointer; }
    .advancedOnly { display:none; }
    body.advanced .advancedOnly { display:table-cell; }
    body.dense .wrap { max-width:1700px; padding:8px; }
    body.dense .topbar, body.dense .panel, body.dense .sideCard, body.dense .tabsBox { border-radius:10px; padding:8px; }
    body.dense th, body.dense td { padding:5px 6px; font-size:10.5px; }
    body.dense .kpi { padding:6px; min-height:42px; }
    body.dense .value { font-size:15px; }
    .pill { display:inline-block; padding:4px 7px; border-radius:999px; font-weight:900; font-size:10px; }
    .green { background:rgba(74,222,128,.14); color:#4ade80; }
    .yellow { background:rgba(250,204,21,.14); color:#facc15; }
    .red { background:rgba(251,113,133,.14); color:#fb7185; }
    .long { background:rgba(34,197,94,.14); color:#4ade80; }
    .short { background:rgba(248,113,113,.14); color:#fb7185; }
    .wait { background:rgba(250,204,21,.14); color:#facc15; }
    .avoid { background:rgba(148,163,184,.14); color:#cbd5e1; }
    .ready { background:rgba(59,130,246,.16); color:#93c5fd; }
    .whale { background:rgba(168,85,247,.16); color:#d8b4fe; }
    .muted { color:#93a7cb; }
    pre { background:#050814; border:1px solid #1f2a44; border-radius:12px; color:#d7e4ff; padding:12px; overflow:auto; min-height:90px; max-height:230px; font-size:11px; }
    a { color:#93c5fd; }
    @media (max-width: 1150px) { .workspace { grid-template-columns:1fr; } .side { position:static; } .kpiGrid,.miniSummary { grid-template-columns:repeat(2,1fr); } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="topbar">
      <div class="brandLine">
        <div><h1>Cidentia Broker Ops Terminal</h1><p>v1.0 Compact Technical Layout — canlı Bitget tarama, sesli paper signal, operatör kararı ve sağ execution rail.</p></div>
        <div class="pill avoid">LIVE ORDER LOCKED</div>
      </div>
      <div class="compactStatus">
        <div class="statusItem"><span class="dot"></span>BITGET LIVE</div>
        <div class="statusItem"><span class="dot"></span><span id="scanEngine">SCAN ARMED</span></div>
        <div class="statusItem"><span class="dot"></span>RISK SURVIVAL</div>
        <div class="statusItem danger">EXECUTION: PAPER ONLY</div>
        <div class="statusItem" id="soundState">SOUND: OFF</div>
      </div>
      <div class="kpiGrid">
        <div class="kpi"><div class="label">Mode</div><div id="mode" class="value">loading</div></div>
        <div class="kpi"><div class="label">Gate</div><div id="gate" class="value">loading</div></div>
        <div class="kpi"><div class="label">Scanned</div><div id="scannerCount" class="value">0</div></div>
        <div class="kpi"><div class="label">Best</div><div id="bestCandidate" class="value blueText">-</div></div>
        <div class="kpi"><div class="label">Strong</div><div id="strongCount" class="value safe">0</div></div>
        <div class="kpi"><div class="label">Avoid</div><div id="avoidCount" class="value danger">0</div></div>
      </div>
      <div class="controls">
        <label>Tarama <input id="limit" value="40" /></label>
        <label>Sermaye € <input id="accountSize" value="100" /></label>
        <label>Risk % <input id="riskPercent" value="2" /></label>
        <button onclick="loadScanner()">Live Scan</button>
        <button class="soundBtn" onclick="enableSoundSignal()">Sesli Sinyal Aç</button>
        <button class="secondary" onclick="toggleAdvanced()">Basic / Advanced</button>
        <button class="secondary" onclick="toggleDense()">Dense View</button>
        <button onclick="loadStatus()">Status</button>
        <button class="dangerBtn" onclick="resetPaper()">Sanal Sıfırla</button>
      </div>
      <div id="signalBanner" class="signalStrip">
        <div><div class="signalTitle" id="signalTitle">SIGNAL MONITOR: STANDBY</div><div class="muted" id="signalText">Güçlü paper setup çıkarsa pulse ve sesli uyarı verir. Gerçek emir yok.</div></div>
        <div class="pill avoid" id="signalPill">PAPER ONLY</div>
      </div>
      <div id="tickerTape" class="tickerTape"><div class="tickerInner">MARKET FEED WAITING...</div></div>
    </section>

    <main class="workspace">
      <section class="panel">
        <div class="miniSummary" id="scannerSummary"></div>
        <div class="tabsBox">
          <div class="tabs">
            <button class="tabBtn active" onclick="showTab('operator', this)">Operator Queue</button>
            <button class="tabBtn" onclick="showTab('opportunity', this)">Opportunity Set</button>
            <button class="tabBtn" onclick="showTab('risk', this)">Risk Watch</button>
          </div>
          <div id="tabContent" class="tabContent">Tarama bekleniyor.</div>
        </div>
        <h2 style="margin-top:12px;">Execution Grid</h2>
        <div id="scannerTable" class="muted">Scanner henüz çalışmadı.</div>
      </section>

      <aside class="side">
        <div class="sideCard"><h3>Execution Ticket</h3><div id="executionTicket" class="muted">Sinyal seçilmedi.</div></div>
        <div class="sideCard"><h3>Risk Snapshot</h3><div id="riskSnapshot" class="muted">Risk özeti bekleniyor.</div></div>
        <div class="sideCard"><h3>Live Scan Log</h3><div id="scanLog" class="scanLog">Tarama bekleniyor.</div></div>
      </aside>
    </main>

    <div class="panel" style="margin-top:12px;"><h2>Output</h2><pre id="out">Panel yükleniyor...</pre></div>
  </div>
<script>
let lastResults = [];
let lastData = null;
let activeTab = 'operator';
let soundEnabled = false;
let audioCtx = null;
let lastSignalKey = '';
function out(text) { document.getElementById('out').textContent = text; }
function show(data) { out(JSON.stringify(data, null, 2)); }
function showSmall(label, data) { out(label + String.fromCharCode(10) + JSON.stringify(data, null, 2)); }
async function api(path, options) { try { const res = await fetch(path, options); const data = await res.json(); show(data); return data; } catch (err) { out('Hata: ' + err.message); throw err; } }
function money(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('en-US', { maximumFractionDigits: 8 }); }
function eur(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits: 2 }); }
function pct(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toFixed(2) + '%'; }
function regimePill(regime) { const cls = regime === 'green' ? 'green' : regime === 'yellow' ? 'yellow' : 'red'; return '<span class="pill ' + cls + '">' + regime + '</span>'; }
function actionPill(action, label) { let cls = 'wait'; if (action === 'LONG_WATCH') cls = 'long'; else if (action === 'SHORT_WATCH') cls = 'short'; else if (String(action || '').startsWith('AVOID')) cls = 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function whalePill(w) { const level = w?.level || '-'; const cls = level === 'yüksek' || level === 'şüpheli' ? 'red' : level === 'dikkat' ? 'whale' : 'green'; return '<span class="pill ' + cls + '">' + level + '</span>'; }
function trendPill(t) { const label = t?.label || '-'; const cls = label === 'çok güçlü' || label === 'güçlü' ? 'green' : label === 'orta' ? 'yellow' : 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function operatorPill(advice) { const action = advice?.operatorAction || ''; let cls = 'avoid'; if (action === 'VIRTUAL_TEST_STRONG') cls = 'ready'; else if (action === 'VIRTUAL_TEST_SMALL') cls = 'long'; else if (action === 'WATCH_ONLY') cls = 'wait'; return '<span class="pill ' + cls + '">' + (advice?.label || '-') + '</span>'; }
function planPill(plan) { if (!plan || !plan.enabled) return '<span class="pill avoid">yok</span>'; if (plan.quality === 'güçlü aday' || plan.quality === 'sanal test uygun') return '<span class="pill ready">' + plan.quality + '</span>'; if (Number(plan.riskRewardToTp1) < 1) return '<span class="pill wait">R/R zayıf</span>'; return '<span class="pill avoid">' + (plan.quality || 'bekle') + '</span>'; }
function enableSoundSignal() { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); soundEnabled = true; document.getElementById('soundState').textContent = 'SOUND: ON'; playSignalBeep('enable'); }
function beep(freq, start, duration, gainValue) { if (!audioCtx) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.value = freq; gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + start); gain.gain.exponentialRampToValueAtTime(gainValue, audioCtx.currentTime + start + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration); osc.connect(gain).connect(audioCtx.destination); osc.start(audioCtx.currentTime + start); osc.stop(audioCtx.currentTime + start + duration + 0.03); }
function playSignalBeep(type) { if (!soundEnabled || !audioCtx) return; if (type === 'strong') { beep(880,0,0.14,0.10); beep(1320,0.16,0.18,0.09); beep(1760,0.38,0.14,0.07); } else { beep(660,0,0.12,0.08); } }
async function loadStatus() { const data = await api('/status'); document.getElementById('mode').textContent = data.config.tradingMode; document.getElementById('mode').className = 'value safe'; document.getElementById('gate').textContent = data.config.realTradingGateOpen ? 'OPEN' : 'LOCKED'; document.getElementById('gate').className = data.config.realTradingGateOpen ? 'value danger' : 'value safe'; }
function toggleAdvanced() { document.body.classList.toggle('advanced'); }
function toggleDense() { document.body.classList.toggle('dense'); }
function showTab(name, btn) { activeTab = name; document.querySelectorAll('.tabBtn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); renderTabs(); }
function renderTickerTape(results) { const items = results.slice(0, 20).map(x => '<span class="tickerItem">' + x.symbol + ' ' + pct(x.metrics?.avgChange) + ' | ' + (x.directionBias || '-') + '</span>').join(''); document.getElementById('tickerTape').innerHTML = '<div class="tickerInner">' + items + items + '</div>'; }
function renderTabs() { if (!lastData) return; const top = lastData.topLists || {}; const op = lastData.operatorSummary || {}; let html = ''; if (activeTab === 'operator') html = (op.topOperatorList || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b> — '+x.action+'<br>Bias '+x.direction+' | Score/Conf '+x.score+'/'+x.confidence+' | R/R '+(x.rr ?? '-')+'</p>').join('') || '<p>Operatör adayı yok.</p>'; if (activeTab === 'opportunity') html = (top.topOpportunities || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>Yön '+x.direction+' | Puan '+x.score+' | Güven '+x.confidence+' | R/R '+(x.rr ?? '-')+'<br>'+x.plan+'</p>').join('') || '<p>Uygun fırsat yok.</p>'; if (activeTab === 'risk') html = (top.highestRisk || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>Risk '+x.risk+' | Karar '+x.decision+'</p>').join('') || '<p>Risk listesi boş.</p>'; document.getElementById('tabContent').innerHTML = html; }
function renderScanLog(results) { const lines = results.slice(0, 12).map((x,i)=>'<div class="scanLine">'+new Date().toLocaleTimeString()+' | '+String(i+1).padStart(2,'0')+' | '+x.symbol+' | '+(x.directionBias||'-')+' | R/R '+(x.virtualTradePlan?.riskRewardToTp1 ?? '-')+' | '+(x.operatorAdvice?.label || x.decision?.label || '-')+'</div>').join(''); document.getElementById('scanLog').innerHTML = lines || 'Log yok.'; }
function selectTicket(index) { const item = lastResults[index]; if (!item) return; const p = item.virtualTradePlan || {}; const mm = item.moneyManagement || {}; const adv = item.operatorAdvice || {}; const zone = p.entryZone ? money(p.entryZone.from)+' - '+money(p.entryZone.to) : '-'; document.getElementById('executionTicket').innerHTML = '<div class="ticketRow"><span>Symbol</span><b>'+item.symbol+'</b></div><div class="ticketRow"><span>Decision</span><b>'+ (adv.label || '-') +'</b></div><div class="ticketRow"><span>Bias</span><b>'+item.directionBias+'</b></div><div class="ticketRow"><span>Entry</span><b>'+zone+'</b></div><div class="ticketRow"><span>Stop</span><b>'+money(p.stopLoss)+'</b></div><div class="ticketRow"><span>TP1 / TP2</span><b>'+money(p.takeProfit1)+' / '+money(p.takeProfit2)+'</b></div><div class="ticketRow"><span>R/R</span><b>'+ (p.riskRewardToTp1 ?? '-') +'</b></div><div class="ticketRow"><span>Size</span><b>'+ (mm.enabled ? eur(mm.suggestedPositionEur) : '-') +'</b></div><div class="ticketRow"><span>Max Risk</span><b>'+ (mm.enabled ? eur(mm.maxRiskEur) : '-') +'</b></div><p class="muted">PAPER ONLY. Gerçek emir yok.</p>'; const trend = item.trendStrength || item.metrics?.trendStrength || {}; const whale = item.whaleRisk || item.metrics?.whaleRisk || {}; document.getElementById('riskSnapshot').innerHTML = '<div class="ticketRow"><span>Trend</span><b>'+ (trend.label || '-') +'</b></div><div class="ticketRow"><span>Whale</span><b>'+ (whale.level || '-') +'</b></div><div class="ticketRow"><span>Liquidity</span><b>'+ (item.metrics?.liquidityScore ?? '-') +'</b></div><div class="ticketRow"><span>Risk Tier</span><b>'+ item.riskTier +'</b></div><div class="ticketRow"><span>24h</span><b>'+ pct(item.metrics?.avgChange) +'</b></div>'; }
function applySignalEffect(data) { const strong = (data.operatorSummary?.topOperatorList || []).find(x => x.action && x.action.includes('güçlü')) || (data.topLists?.topOpportunities || [])[0]; const banner = document.getElementById('signalBanner'); const title = document.getElementById('signalTitle'); const text = document.getElementById('signalText'); const pill = document.getElementById('signalPill'); banner.classList.remove('active'); void banner.offsetWidth; if (strong) { const key = strong.symbol + ':' + strong.rr + ':' + strong.action; document.getElementById('bestCandidate').textContent = strong.symbol; title.textContent = 'SIGNAL LOCKED: ' + strong.symbol; text.textContent = 'Bias ' + (strong.direction || '-') + ' | R/R ' + (strong.rr ?? '-') + ' | PAPER ONLY'; pill.className = 'pill ready'; pill.textContent = 'PAPER SIGNAL'; banner.classList.add('active'); if (key !== lastSignalKey) { playSignalBeep('strong'); lastSignalKey = key; } } else { document.getElementById('bestCandidate').textContent = '-'; title.textContent = 'SIGNAL MONITOR: NO CLEAN SETUP'; text.textContent = 'Temiz güçlü aday yok. Sistem beklemeyi tercih ediyor.'; pill.className = 'pill avoid'; pill.textContent = 'NO TRADE'; } }
async function loadScanner() { document.getElementById('scanEngine').textContent = 'SCANNING...'; const limit = encodeURIComponent(document.getElementById('limit').value || '40'); const accountSize = encodeURIComponent(document.getElementById('accountSize').value || '100'); const riskPercent = encodeURIComponent(document.getElementById('riskPercent').value || '2'); const data = await api('/scanner?mode=top-bitget&limit=' + limit + '&accountSizeEur=' + accountSize + '&riskPercent=' + riskPercent); lastData = data; lastResults = data.results || []; document.getElementById('scanEngine').textContent = 'ACTIVE'; document.getElementById('scannerCount').textContent = data.count || 0; const s = data.summary || {}; document.getElementById('strongCount').textContent = s.operatorStrongVirtual || 0; document.getElementById('avoidCount').textContent = s.operatorAvoid || 0; document.getElementById('scannerSummary').innerHTML = '<div><b>Strong</b><br>'+(s.operatorStrongVirtual||0)+'</div><div><b>Small Paper</b><br>'+(s.operatorSmallVirtual||0)+'</div><div><b>Watch</b><br>'+(s.operatorWatchOnly||0)+'</div><div><b>Avoid</b><br>'+(s.operatorAvoid||0)+'</div><div><b>Long</b><br>'+(s.longWatch||0)+'</div><div><b>Short</b><br>'+(s.shortWatch||0)+'</div><div><b>Source</b><br>'+(data.scannerSource||'-')+'</div>'; renderTabs(); renderTickerTape(lastResults); renderScanLog(lastResults); applySignalEffect(data); const rows = lastResults.map((item,index)=>{ const bitget=(item.tickers||[]).find(x=>x.exchange==='bitget')||{}; const m=item.metrics||{}; const d=item.decision||{}; const p=item.virtualTradePlan||{}; const mm=item.moneyManagement||{}; const adv=item.operatorAdvice||{}; const trend=item.trendStrength||m.trendStrength||{}; const whale=item.whaleRisk||m.whaleRisk||{}; const zone=p.entryZone?money(p.entryZone.from)+' - '+money(p.entryZone.to):'-'; return '<tr onclick="selectTicket('+index+')"><td><b>'+item.symbol+'</b></td><td>'+operatorPill(adv)+'</td><td>'+item.directionBias+'</td><td>'+item.score+'</td><td>'+item.confidence+'</td><td>'+trendPill(trend)+'</td><td>'+whalePill(whale)+'</td><td>'+(p.riskRewardToTp1??'-')+'</td><td>'+zone+'</td><td>'+money(p.stopLoss)+'</td><td>'+money(p.takeProfit1)+'</td><td>'+(mm.enabled?eur(mm.suggestedPositionEur):'-')+'</td><td class="advancedOnly">'+regimePill(item.regime)+'</td><td class="advancedOnly">'+item.riskTier+'</td><td class="advancedOnly">'+actionPill(d.action,d.label)+'</td><td class="advancedOnly">'+money(bitget.lastPrice)+'</td><td class="advancedOnly">'+pct(m.avgChange)+'</td><td class="advancedOnly">'+(m.liquidityScore??'-')+'</td><td class="advancedOnly">'+planPill(p)+'</td><td class="advancedOnly">'+money(p.takeProfit2)+'</td><td class="advancedOnly">'+(mm.enabled?eur(mm.maxRiskEur):'-')+'</td><td class="advancedOnly muted">'+(adv.actionText||d.reason||'')+'</td></tr>'; }).join(''); document.getElementById('scannerTable').innerHTML = '<div class="tableWrap"><table><thead><tr><th>Coin</th><th>Ben Olsam</th><th>Bias</th><th>Score</th><th>Conf</th><th>Trend</th><th>Whale</th><th>R/R</th><th>Entry</th><th>Stop</th><th>TP1</th><th>Size €</th><th class="advancedOnly">Regime</th><th class="advancedOnly">Risk</th><th class="advancedOnly">Signal</th><th class="advancedOnly">Bitget</th><th class="advancedOnly">24h</th><th class="advancedOnly">Liq</th><th class="advancedOnly">Plan</th><th class="advancedOnly">TP2</th><th class="advancedOnly">Max Risk</th><th class="advancedOnly">Explanation</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; if (lastResults.length) selectTicket(0); showSmall('Compact Broker Ops v1.0: '+(data.count||0)+' coin tarandı. Basic görünüm aktif; detay için Basic/Advanced butonunu kullan.', data.operatorSummary || data.topLists || {}); }
async function resetPaper() { const data = await api('/paper/reset', { method:'POST' }); }
function clearOutput() { out('Çıktı temizlendi.'); }
loadStatus().then(loadScanner).catch((err) => out('Panel başlatma hatası: ' + err.message));
</script>
</body>
</html>`;
}
