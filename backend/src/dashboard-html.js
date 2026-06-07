export function dashboardHtml() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cidentia Broker Ops Terminal</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:Arial,sans-serif; background:#05070d; color:#eef3ff; }
    .wrap { max-width:1520px; margin:0 auto; padding:14px; }
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
    button.secondary { background:#334155; } button.dangerBtn { background:#9f1239; } button.soundBtn { background:#0f766e; } button.paperBtn { background:#16a34a; } button.nowBtn { background:#f59e0b; color:#111827; }
    input { background:#050814; color:#eef3ff; border:1px solid #334155; border-radius:8px; padding:7px; width:72px; }
    label { color:#aebfe1; font-size:12px; }
    .kpiGrid { display:grid; grid-template-columns:repeat(8,1fr); gap:8px; margin-top:10px; }
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
    .workspace { display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:12px; margin-top:12px; align-items:start; }
    .panel,.sideCard,.tabsBox { padding:12px; }
    .miniSummary { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; margin-bottom:10px; }
    .miniSummary div { background:#070b12; border:1px solid #1f2a44; border-radius:10px; padding:8px; font-size:12px; }
    .tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:9px; }
    .tabBtn { background:#111a2e; border:1px solid #25314e; }
    .tabBtn.active { background:#2f6df6; }
    .tabContent { min-height:100px; max-height:170px; overflow:auto; }
    .tabContent p { font-size:12px; border-bottom:1px solid #172033; padding-bottom:6px; }
    .side { position:sticky; top:12px; display:flex; flex-direction:column; gap:10px; }
    .ticketRow { display:flex; justify-content:space-between; border-bottom:1px solid #172033; padding:6px 0; gap:10px; font-size:12px; }
    .ticketRow b { color:#fff; text-align:right; }
    .priceMap { background:#070b12; border:1px solid #1f2a44; border-radius:12px; padding:10px; margin-top:8px; }
    .pathLine { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:8px; }
    .pathBox { background:#0d1424; border:1px solid #25314e; border-radius:10px; padding:8px; font-size:11px; }
    .scanLine { font-family:Consolas,monospace; font-size:11px; color:#cbd5e1; border-bottom:1px solid #172033; padding:5px 0; }
    .scanLog { max-height:170px; overflow:auto; }
    .setupList { max-height:180px; overflow:auto; }
    .setupItem { border-bottom:1px solid #172033; padding:6px 0; font-size:11px; color:#cbd5e1; }
    .tableWrap { overflow:auto; border:1px solid #1f2a44; border-radius:12px; }
    table { width:100%; min-width:1180px; border-collapse:collapse; }
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
    .hidden { display:none; }
    pre { background:#050814; border:1px solid #1f2a44; border-radius:12px; color:#d7e4ff; padding:12px; overflow:auto; min-height:90px; max-height:230px; font-size:11px; }
    @media (max-width: 1150px) { .workspace { grid-template-columns:1fr; } .side { position:static; } .kpiGrid,.miniSummary { grid-template-columns:repeat(2,1fr); } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="topbar">
      <div class="brandLine">
        <div><h1>Cidentia Broker Ops Terminal</h1><p>v1.3 Paper Şimdi Gir — seçili coinde mevcut fiyattan sanal pozisyon aç, PnL’yi hemen izle.</p></div>
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
        <div class="kpi"><div class="label">Paper PnL</div><div id="paperPnl" class="value">€0</div></div>
        <div class="kpi"><div class="label">Win Rate</div><div id="winRate" class="value">0%</div></div>
      </div>
      <div class="controls">
        <label>Tarama <input id="limit" value="40" /></label>
        <label>Sermaye € <input id="accountSize" value="100" /></label>
        <label>Risk % <input id="riskPercent" value="3" /></label>
        <button onclick="loadScanner()">Live Scan</button>
        <button class="nowBtn" onclick="paperMarketNow()">Paper Şimdi Gir</button>
        <button class="paperBtn" onclick="queueSelectedSetup()">Queue Paper Setup</button>
        <button class="paperBtn" onclick="refreshPerformance()">Refresh Performance</button>
        <button class="soundBtn" onclick="enableSoundSignal()">Sesli Sinyal Aç</button>
        <button class="secondary" onclick="toggleAdvanced()">Basic / Advanced</button>
        <button class="secondary" onclick="toggleDense()">Dense View</button>
        <button class="secondary" onclick="toggleOutput()">Output Aç/Kapat</button>
        <button class="dangerBtn" onclick="resetPaper()">Sanal Sıfırla</button>
      </div>
      <div id="signalBanner" class="signalStrip">
        <div><div class="signalTitle" id="signalTitle">SIGNAL MONITOR: STANDBY</div><div class="muted" id="signalText">Paper Şimdi Gir gerçek emir değildir; mevcut fiyattan sanal takip başlatır.</div></div>
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
            <button class="tabBtn" onclick="showTab('paper', this)">Paper Setups</button>
          </div>
          <div id="tabContent" class="tabContent">Tarama bekleniyor.</div>
        </div>
        <h2 style="margin-top:12px;">Execution Grid</h2>
        <div id="scannerTable" class="muted">Scanner henüz çalışmadı.</div>
      </section>

      <aside class="side">
        <div class="sideCard"><h3>Price Map / Fiyat Haritası</h3><div id="priceMapBox" class="muted">Satır seçilmedi.</div></div>
        <div class="sideCard"><h3>Execution Ticket</h3><div id="executionTicket" class="muted">Sinyal seçilmedi.</div></div>
        <div class="sideCard"><h3>Paper Performance</h3><div id="paperPerformance" class="muted">Performans bekleniyor.</div></div>
        <div class="sideCard"><h3>Risk Snapshot</h3><div id="riskSnapshot" class="muted">Risk özeti bekleniyor.</div></div>
        <div class="sideCard"><h3>Live Scan Log</h3><div id="scanLog" class="scanLog">Tarama bekleniyor.</div></div>
      </aside>
    </main>

    <div id="outputPanel" class="panel hidden" style="margin-top:12px;"><h2>Output</h2><pre id="out">Output kapalı. Açmak için Output Aç/Kapat.</pre></div>
  </div>
<script>
let lastResults = [];
let lastData = null;
let activeTab = 'operator';
let selectedIndex = 0;
let paperPerformance = null;
let soundEnabled = false;
let audioCtx = null;
let lastSignalKey = '';
function out(text) { var el = document.getElementById('out'); if (el) el.textContent = text; }
function show(data) { out(JSON.stringify(data, null, 2)); }
function showSmall(label, data) { out(label + String.fromCharCode(10) + JSON.stringify(data, null, 2)); }
async function api(path, options) { try { const res = await fetch(path, options); const data = await res.json(); show(data); return data; } catch (err) { out('Hata: ' + err.message); throw err; } }
function money(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('en-US', { maximumFractionDigits: 8 }); }
function eur(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits: 2 }); }
function pct(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toFixed(2) + '%'; }
function absPct(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Math.abs(Number(value)).toFixed(2) + '%'; }
function regimePill(regime) { const cls = regime === 'green' ? 'green' : regime === 'yellow' ? 'yellow' : 'red'; return '<span class="pill ' + cls + '">' + regime + '</span>'; }
function actionPill(action, label) { let cls = 'wait'; if (action === 'LONG_WATCH') cls = 'long'; else if (action === 'SHORT_WATCH') cls = 'short'; else if (String(action || '').startsWith('AVOID')) cls = 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function whalePill(w) { const level = w?.level || '-'; const cls = level === 'yüksek' || level === 'şüpheli' ? 'red' : level === 'dikkat' ? 'whale' : 'green'; return '<span class="pill ' + cls + '">' + level + '</span>'; }
function trendPill(t) { const label = t?.label || '-'; const cls = label === 'çok güçlü' || label === 'güçlü' ? 'green' : label === 'orta' ? 'yellow' : 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function operatorPill(advice) { const action = advice?.operatorAction || ''; let cls = 'avoid'; if (action === 'VIRTUAL_TEST_STRONG') cls = 'ready'; else if (action === 'VIRTUAL_TEST_SMALL') cls = 'long'; else if (action === 'WATCH_ONLY') cls = 'wait'; return '<span class="pill ' + cls + '">' + (advice?.label || '-') + '</span>'; }
function planPill(plan) { if (!plan || !plan.enabled) return '<span class="pill avoid">yok</span>'; if (plan.quality === 'güçlü aday' || plan.quality === 'sanal test uygun') return '<span class="pill ready">' + plan.quality + '</span>'; if (Number(plan.riskRewardToTp1) < 1) return '<span class="pill wait">R/R zayıf</span>'; return '<span class="pill avoid">' + (plan.quality || 'bekle') + '</span>'; }
function getBitgetPrice(item) { const t = (item.tickers || []).find(x => x.exchange === 'bitget'); return Number(t?.lastPrice || item.primaryPrice || 0) || null; }
function signedDistancePct(current, target) { if (!current || !target) return null; return ((target - current) / current) * 100; }
function buildPriceMap(item) {
  const p = item.virtualTradePlan || {};
  const current = getBitgetPrice(item);
  const side = p.side || item.directionBias || '-';
  if (!current || !p.enabled || !p.entryZone) return { current, side, status:'plan yok', statusClass:'avoid', toEntry:null, toStop:null, toTp1:null, toTp2:null, text:'Bu satırda hesaplanmış giriş/stop/kar planı yok.' };
  const from = Number(p.entryZone.from);
  const to = Number(p.entryZone.to);
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const inZone = current >= low && current <= high;
  let status = 'bekle';
  let statusClass = 'wait';
  let entryTarget = current;
  let text = '';
  if (inZone) { status = 'giriş bölgesinde'; statusClass = 'ready'; entryTarget = current; text = 'Fiyat şu anda giriş bölgesinin içinde. Paper setup seçilmişse izlenebilir.'; }
  else if (side === 'short') { if (current > high) { status = 'girişe düşmesi lazım'; entryTarget = high; text = 'Short için fiyatın giriş bölgesine doğru aşağı gelmesi beklenir.'; } else { status = 'giriş altına kaçmış'; entryTarget = low; text = 'Fiyat giriş bölgesinin altında. Paper Şimdi Gir ile kovalama riski olabilir.'; statusClass = 'avoid'; } }
  else if (side === 'long') { if (current < low) { status = 'girişe yükselmesi lazım'; entryTarget = low; text = 'Long için fiyatın giriş bölgesine doğru yukarı gelmesi beklenir.'; } else { status = 'giriş üstüne kaçmış'; entryTarget = high; text = 'Fiyat giriş bölgesinin üstünde. Paper Şimdi Gir ile kovalama riski olabilir.'; statusClass = 'avoid'; } }
  return { current, side, status, statusClass, entryLow: low, entryHigh: high, toEntry: inZone ? 0 : signedDistancePct(current, entryTarget), toStop: signedDistancePct(current, Number(p.stopLoss)), toTp1: signedDistancePct(current, Number(p.takeProfit1)), toTp2: signedDistancePct(current, Number(p.takeProfit2)), text };
}
function enableSoundSignal() { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); soundEnabled = true; document.getElementById('soundState').textContent = 'SOUND: ON'; playSignalBeep('enable'); }
function beep(freq, start, duration, gainValue) { if (!audioCtx) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.value = freq; gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + start); gain.gain.exponentialRampToValueAtTime(gainValue, audioCtx.currentTime + start + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration); osc.connect(gain).connect(audioCtx.destination); osc.start(audioCtx.currentTime + start); osc.stop(audioCtx.currentTime + start + duration + 0.03); }
function playSignalBeep(type) { if (!soundEnabled || !audioCtx) return; if (type === 'strong') { beep(880,0,0.14,0.10); beep(1320,0.16,0.18,0.09); beep(1760,0.38,0.14,0.07); } else { beep(660,0,0.12,0.08); } }
function toggleAdvanced() { document.body.classList.toggle('advanced'); }
function toggleDense() { document.body.classList.toggle('dense'); }
function toggleOutput() { document.getElementById('outputPanel').classList.toggle('hidden'); }
async function loadStatus() { const data = await api('/status'); document.getElementById('mode').textContent = data.config.tradingMode; document.getElementById('mode').className = 'value safe'; document.getElementById('gate').textContent = data.config.realTradingGateOpen ? 'OPEN' : 'LOCKED'; document.getElementById('gate').className = data.config.realTradingGateOpen ? 'value danger' : 'value safe'; if (data.paperPerformance) renderPerformance({ summary: data.paperPerformance, setups: data.paper?.setups || [] }); }
function showTab(name, btn) { activeTab = name; document.querySelectorAll('.tabBtn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); renderTabs(); }
function renderTickerTape(results) { const items = results.slice(0, 20).map(x => '<span class="tickerItem">' + x.symbol + ' ' + pct(x.metrics?.avgChange) + ' | ' + money(getBitgetPrice(x)) + ' | ' + (x.directionBias || '-') + '</span>').join(''); document.getElementById('tickerTape').innerHTML = '<div class="tickerInner">' + items + items + '</div>'; }
function renderTabs() { if (!lastData && activeTab !== 'paper') return; const top = lastData?.topLists || {}; const op = lastData?.operatorSummary || {}; let html = ''; if (activeTab === 'operator') html = (op.topOperatorList || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b> — '+x.action+'<br>Bias '+x.direction+' | Score/Conf '+x.score+'/'+x.confidence+' | R/R '+(x.rr ?? '-')+'</p>').join('') || '<p>Operatör adayı yok.</p>'; if (activeTab === 'opportunity') html = (top.topOpportunities || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>Yön '+x.direction+' | Puan '+x.score+' | Güven '+x.confidence+' | R/R '+(x.rr ?? '-')+'<br>'+x.plan+'</p>').join('') || '<p>Uygun fırsat yok.</p>'; if (activeTab === 'risk') html = (top.highestRisk || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>Risk '+x.risk+' | Karar '+x.decision+'</p>').join('') || '<p>Risk listesi boş.</p>'; if (activeTab === 'paper') html = renderPaperSetupsHtml(); document.getElementById('tabContent').innerHTML = html; }
function renderPaperSetupsHtml() { const setups = paperPerformance?.setups || []; if (!setups.length) return '<p>Paper setup kuyruğu boş. Satır seçip Paper Şimdi Gir veya Queue Paper Setup bas.</p>'; return '<div class="setupList">' + setups.slice(0, 20).map(s => '<div class="setupItem"><b>'+s.symbol+'</b> | '+s.side+' | '+s.status+' | '+(s.entryMode || '-')+' | Current '+money(s.currentPrice)+' | PnL '+eur((s.realizedPnlEur || 0) + (s.unrealizedPnlEur || 0))+'<br>Entry '+(s.entryPrice || (s.entryZone?.from + ' - ' + s.entryZone?.to))+' | Stop '+s.stopLoss+' | TP1 '+s.takeProfit1+'</div>').join('') + '</div>'; }
function renderScanLog(results) { const lines = results.slice(0, 12).map((x,i)=>{ const pm = buildPriceMap(x); return '<div class="scanLine">'+new Date().toLocaleTimeString()+' | '+String(i+1).padStart(2,'0')+' | '+x.symbol+' | now '+money(pm.current)+' | '+pm.status+' | entry '+absPct(pm.toEntry)+'</div>'; }).join(''); document.getElementById('scanLog').innerHTML = lines || 'Log yok.'; }
function renderPriceMap(item) { const pm = buildPriceMap(item); const p = item.virtualTradePlan || {}; document.getElementById('priceMapBox').innerHTML = '<div class="ticketRow"><span>Şu anki fiyat</span><b>'+money(pm.current)+'</b></div><div class="ticketRow"><span>Yön</span><b>'+pm.side+'</b></div><div class="ticketRow"><span>Durum</span><b><span class="pill '+pm.statusClass+'">'+pm.status+'</span></b></div><div class="ticketRow"><span>Girişe uzaklık</span><b>'+absPct(pm.toEntry)+'</b></div><div class="ticketRow"><span>Stop uzaklığı</span><b>'+absPct(pm.toStop)+'</b></div><div class="ticketRow"><span>Kar 1 uzaklığı</span><b>'+absPct(pm.toTp1)+'</b></div><div class="pathLine"><div class="pathBox"><b>NOW</b><br>'+money(pm.current)+'</div><div class="pathBox"><b>ENTRY</b><br>'+money(pm.entryLow)+' - '+money(pm.entryHigh)+'</div><div class="pathBox"><b>TP1 / STOP</b><br>'+money(p.takeProfit1)+' / '+money(p.stopLoss)+'</div></div><p class="muted">'+pm.text+'</p>'; }
function selectTicket(index) { selectedIndex = index; const item = lastResults[index]; if (!item) return; const p = item.virtualTradePlan || {}; const mm = item.moneyManagement || {}; const adv = item.operatorAdvice || {}; const pm = buildPriceMap(item); const zone = p.entryZone ? money(p.entryZone.from)+' - '+money(p.entryZone.to) : '-'; renderPriceMap(item); document.getElementById('executionTicket').innerHTML = '<div class="ticketRow"><span>Symbol</span><b>'+item.symbol+'</b></div><div class="ticketRow"><span>Current</span><b>'+money(pm.current)+'</b></div><div class="ticketRow"><span>Decision</span><b>'+ (adv.label || '-') +'</b></div><div class="ticketRow"><span>Bias</span><b>'+item.directionBias+'</b></div><div class="ticketRow"><span>Entry</span><b>'+zone+'</b></div><div class="ticketRow"><span>Stop</span><b>'+money(p.stopLoss)+'</b></div><div class="ticketRow"><span>TP1 / TP2</span><b>'+money(p.takeProfit1)+' / '+money(p.takeProfit2)+'</b></div><div class="ticketRow"><span>R/R</span><b>'+ (p.riskRewardToTp1 ?? '-') +'</b></div><div class="ticketRow"><span>Size</span><b>'+ (mm.enabled ? eur(mm.suggestedPositionEur) : '-') +'</b></div><button class="nowBtn" onclick="paperMarketNow()">Paper Şimdi Gir</button> <button class="paperBtn" onclick="queueSelectedSetup()">Queue Paper Setup</button><p class="muted">Paper Şimdi Gir = mevcut fiyattan sanal active. Queue = giriş bölgesini bekler.</p>'; const trend = item.trendStrength || item.metrics?.trendStrength || {}; const whale = item.whaleRisk || item.metrics?.whaleRisk || {}; document.getElementById('riskSnapshot').innerHTML = '<div class="ticketRow"><span>Trend</span><b>'+ (trend.label || '-') +'</b></div><div class="ticketRow"><span>Whale</span><b>'+ (whale.level || '-') +'</b></div><div class="ticketRow"><span>Liquidity</span><b>'+ (item.metrics?.liquidityScore ?? '-') +'</b></div><div class="ticketRow"><span>Risk Tier</span><b>'+ item.riskTier +'</b></div><div class="ticketRow"><span>24h</span><b>'+ pct(item.metrics?.avgChange) +'</b></div>'; }
function applySignalEffect(data) { const strong = (data.operatorSummary?.topOperatorList || []).find(x => x.action && x.action.includes('güçlü')) || (data.topLists?.topOpportunities || [])[0]; const banner = document.getElementById('signalBanner'); const title = document.getElementById('signalTitle'); const text = document.getElementById('signalText'); const pill = document.getElementById('signalPill'); banner.classList.remove('active'); void banner.offsetWidth; if (strong) { const item = lastResults.find(r => r.symbol === strong.symbol); const pm = item ? buildPriceMap(item) : null; const key = strong.symbol + ':' + strong.rr + ':' + strong.action; document.getElementById('bestCandidate').textContent = strong.symbol; title.textContent = 'SIGNAL LOCKED: ' + strong.symbol; text.textContent = 'Now ' + money(pm?.current) + ' | Entry ' + money(pm?.entryLow) + ' - ' + money(pm?.entryHigh) + ' | ' + (pm?.status || '-') + ' | R/R ' + (strong.rr ?? '-') + ' | PAPER ONLY'; pill.className = 'pill ready'; pill.textContent = 'PAPER SIGNAL'; banner.classList.add('active'); if (key !== lastSignalKey) { playSignalBeep('strong'); lastSignalKey = key; } } else { document.getElementById('bestCandidate').textContent = '-'; title.textContent = 'SIGNAL MONITOR: NO CLEAN SETUP'; text.textContent = 'Temiz güçlü aday yok. Sistem beklemeyi tercih ediyor.'; pill.className = 'pill avoid'; pill.textContent = 'NO TRADE'; } }
function renderPerformance(data) { paperPerformance = data; const s = data?.summary || {}; const total = Number(s.totalPnlEur || 0); const cls = total >= 0 ? 'safe' : 'danger'; document.getElementById('paperPnl').textContent = eur(total); document.getElementById('paperPnl').className = 'value ' + cls; document.getElementById('winRate').textContent = (s.winRate || 0) + '%'; document.getElementById('paperPerformance').innerHTML = '<div class="ticketRow"><span>Queued</span><b>'+(s.queued||0)+'</b></div><div class="ticketRow"><span>Active</span><b>'+(s.active||0)+'</b></div><div class="ticketRow"><span>TP1 / TP2</span><b>'+(s.tp1Hit||0)+' / '+(s.tp2Hit||0)+'</b></div><div class="ticketRow"><span>Stopped</span><b>'+(s.stopped||0)+'</b></div><div class="ticketRow"><span>Win Rate</span><b>'+(s.winRate||0)+'%</b></div><div class="ticketRow"><span>Total</span><b>'+eur(s.totalPnlEur||0)+'</b></div><button onclick="refreshPerformance()">Refresh Performance</button>'; if (activeTab === 'paper') renderTabs(); }
async function loadPerformance() { const data = await api('/paper/performance'); renderPerformance(data); return data; }
async function refreshPerformance() { const data = await api('/paper/refresh', { method:'POST' }); renderPerformance(data); return data; }
function buildPaperPayload(item) { const p = item.virtualTradePlan || {}; const mm = item.moneyManagement || {}; return { exchange:'bitget', symbol:item.symbol, side:p.side || item.directionBias, entryZone:p.entryZone, stopLoss:p.stopLoss, takeProfit1:p.takeProfit1, takeProfit2:p.takeProfit2, positionSizeEur:mm.suggestedPositionEur || 0, maxRiskEur:mm.maxRiskEur || 0, riskRewardToTp1:p.riskRewardToTp1, sourceDecision:item.operatorAdvice?.label || item.decision?.label || null }; }
async function queueSelectedSetup() { const item = lastResults[selectedIndex]; if (!item) { alert('Önce tabloda bir satır seç.'); return; } const p = item.virtualTradePlan || {}; if (!p.enabled || !p.entryZone) { alert('Bu satırda queue edilecek temiz sanal setup yok.'); return; } const data = await api('/paper/queue', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(buildPaperPayload(item)) }); if (data.accepted) { playSignalBeep('strong'); await loadPerformance(); showTab('paper', document.querySelectorAll('.tabBtn')[3]); } else { alert('Queue reddedildi: ' + (data.reason || 'unknown')); } }
async function paperMarketNow() { const item = lastResults[selectedIndex]; if (!item) { alert('Önce tabloda bir satır seç.'); return; } const p = item.virtualTradePlan || {}; if (!p.enabled || !p.entryZone) { alert('Bu satırda hemen girilecek sanal setup yok.'); return; } const ok = confirm(item.symbol + ' için mevcut Bitget fiyatından SANAL işleme girilsin mi? Gerçek emir açılmaz.'); if (!ok) return; const data = await api('/paper/market-now', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(buildPaperPayload(item)) }); if (data.accepted) { playSignalBeep('strong'); await refreshPerformance(); showTab('paper', document.querySelectorAll('.tabBtn')[3]); } else { alert('Paper Şimdi Gir reddedildi: ' + (data.reason || 'unknown')); } }
async function loadScanner() { document.getElementById('scanEngine').textContent = 'SCANNING...'; const limit = encodeURIComponent(document.getElementById('limit').value || '40'); const accountSize = encodeURIComponent(document.getElementById('accountSize').value || '100'); const riskPercent = encodeURIComponent(document.getElementById('riskPercent').value || '3'); const data = await api('/scanner?mode=top-bitget&limit=' + limit + '&accountSizeEur=' + accountSize + '&riskPercent=' + riskPercent); lastData = data; lastResults = data.results || []; document.getElementById('scanEngine').textContent = 'ACTIVE'; document.getElementById('scannerCount').textContent = data.count || 0; const s = data.summary || {}; document.getElementById('strongCount').textContent = s.operatorStrongVirtual || 0; document.getElementById('avoidCount').textContent = s.operatorAvoid || 0; document.getElementById('scannerSummary').innerHTML = '<div><b>Strong</b><br>'+(s.operatorStrongVirtual||0)+'</div><div><b>Small Paper</b><br>'+(s.operatorSmallVirtual||0)+'</div><div><b>Watch</b><br>'+(s.operatorWatchOnly||0)+'</div><div><b>Avoid</b><br>'+(s.operatorAvoid||0)+'</div><div><b>Long</b><br>'+(s.longWatch||0)+'</div><div><b>Short</b><br>'+(s.shortWatch||0)+'</div><div><b>Source</b><br>'+(data.scannerSource||'-')+'</div>'; renderTabs(); renderTickerTape(lastResults); renderScanLog(lastResults); applySignalEffect(data); const rows = lastResults.map((item,index)=>{ const m=item.metrics||{}; const d=item.decision||{}; const p=item.virtualTradePlan||{}; const mm=item.moneyManagement||{}; const adv=item.operatorAdvice||{}; const trend=item.trendStrength||m.trendStrength||{}; const whale=item.whaleRisk||m.whaleRisk||{}; const pm=buildPriceMap(item); const zone=p.entryZone?money(p.entryZone.from)+' - '+money(p.entryZone.to):'-'; return '<tr onclick="selectTicket('+index+')"><td><b>'+item.symbol+'</b></td><td>'+operatorPill(adv)+'</td><td>'+money(pm.current)+'</td><td><span class="pill '+pm.statusClass+'">'+pm.status+'</span></td><td>'+absPct(pm.toEntry)+'</td><td>'+zone+'</td><td>'+money(p.stopLoss)+'</td><td>'+money(p.takeProfit1)+'</td><td>'+item.directionBias+'</td><td>'+(p.riskRewardToTp1??'-')+'</td><td>'+(mm.enabled?eur(mm.suggestedPositionEur):'-')+'</td><td><button class="nowBtn" onclick="event.stopPropagation(); selectedIndex='+index+'; paperMarketNow();">Şimdi</button></td><td class="advancedOnly">'+item.score+'</td><td class="advancedOnly">'+item.confidence+'</td><td class="advancedOnly">'+trendPill(trend)+'</td><td class="advancedOnly">'+whalePill(whale)+'</td><td class="advancedOnly">'+regimePill(item.regime)+'</td><td class="advancedOnly">'+item.riskTier+'</td><td class="advancedOnly">'+actionPill(d.action,d.label)+'</td><td class="advancedOnly">'+pct(m.avgChange)+'</td><td class="advancedOnly">'+(m.liquidityScore??'-')+'</td><td class="advancedOnly">'+planPill(p)+'</td><td class="advancedOnly">'+money(p.takeProfit2)+'</td><td class="advancedOnly">'+absPct(pm.toStop)+'</td><td class="advancedOnly">'+absPct(pm.toTp1)+'</td><td class="advancedOnly muted">'+(pm.text||adv.actionText||d.reason||'')+'</td></tr>'; }).join(''); document.getElementById('scannerTable').innerHTML = '<div class="tableWrap"><table><thead><tr><th>Coin</th><th>Ben Olsam</th><th>Şu An</th><th>Fiyat Durumu</th><th>Girişe</th><th>Giriş Bölgesi</th><th>Stop</th><th>Kar 1</th><th>Yön</th><th>R/R</th><th>Size €</th><th>Paper</th><th class="advancedOnly">Score</th><th class="advancedOnly">Conf</th><th class="advancedOnly">Trend</th><th class="advancedOnly">Whale</th><th class="advancedOnly">Regime</th><th class="advancedOnly">Risk</th><th class="advancedOnly">Signal</th><th class="advancedOnly">24h</th><th class="advancedOnly">Liq</th><th class="advancedOnly">Plan</th><th class="advancedOnly">Kar 2</th><th class="advancedOnly">Stop Uzak</th><th class="advancedOnly">Kar1 Uzak</th><th class="advancedOnly">Açıklama</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; if (lastResults.length) selectTicket(0); await loadPerformance(); showSmall('Market-now v1.3: Paper Şimdi Gir mevcut fiyattan sanal active açar.', data.operatorSummary || data.topLists || {}); }
async function resetPaper() { await api('/paper/reset', { method:'POST' }); await loadPerformance(); }
loadStatus().then(loadScanner).then(loadPerformance).catch((err) => out('Panel başlatma hatası: ' + err.message));
</script>
</body>
</html>`;
}
