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
    .wrap { max-width:1680px; margin:0 auto; padding:24px; }
    .hero,.card,.terminalBar,.ticket,.scanLogBox { border:1px solid #1f2a44; border-radius:18px; background:#0d1424; box-shadow:0 16px 60px rgba(0,0,0,.28); }
    .hero { padding:22px; background:radial-gradient(circle at top left,rgba(47,109,246,.18),transparent 34%),linear-gradient(135deg,#10182a,#070b12); }
    h1 { margin:0 0 8px; font-size:30px; letter-spacing:.2px; }
    h2 { margin:0 0 12px; }
    h3 { margin:0 0 10px; }
    p { color:#bfd0ee; line-height:1.55; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin-top:16px; }
    .opsGrid { display:grid; grid-template-columns:1.2fr .8fr; gap:14px; margin-top:14px; }
    .card,.ticket,.scanLogBox { padding:16px; }
    .label { color:#93a7cb; font-size:12px; text-transform:uppercase; letter-spacing:.4px; }
    .value { font-size:24px; font-weight:900; margin-top:7px; }
    .safe { color:#4ade80; } .danger { color:#fb7185; } .warnText { color:#facc15; } .blueText { color:#93c5fd; }
    button { border:0; border-radius:11px; padding:11px 14px; font-weight:900; cursor:pointer; background:#2f6df6; color:white; margin:5px 7px 5px 0; }
    button.secondary { background:#334155; } button.dangerBtn { background:#9f1239; } button.soundBtn { background:#0f766e; }
    input { background:#050814; color:#eef3ff; border:1px solid #334155; border-radius:10px; padding:10px; width:90px; }
    a { color:#93c5fd; }
    .terminalBar { margin-top:14px; padding:12px; display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:8px; }
    .terminalItem { background:#070b12; border:1px solid #1f2a44; border-radius:12px; padding:10px; }
    .dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#4ade80; box-shadow:0 0 12px #4ade80; margin-right:6px; }
    .notice { margin-top:14px; padding:12px 14px; border:1px solid #334155; border-radius:14px; color:#cbd5e1; background:#0a1020; }
    .help,.summary,.tops { margin-top:14px; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; }
    .help div,.summary div,.tops div { background:#0a1020; border:1px solid #1f2a44; border-radius:14px; padding:12px; color:#cbd5e1; line-height:1.45; }
    .help b,.tops b { color:#fff; }
    .tickerTape { margin-top:14px; border:1px solid #1f2a44; border-radius:14px; background:#070b12; overflow:hidden; white-space:nowrap; }
    .tickerInner { display:inline-block; padding:10px 0; animation:tape 28s linear infinite; }
    .tickerItem { display:inline-block; margin:0 22px; font-weight:900; }
    @keyframes tape { from { transform:translateX(0); } to { transform:translateX(-50%); } }
    .signalBanner { margin-top:14px; border-radius:16px; padding:14px; border:1px solid #334155; background:#0a1020; display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .signalBanner.active { border-color:#22c55e; box-shadow:0 0 24px rgba(34,197,94,.28); animation:pulse 1s ease-in-out 3; }
    @keyframes pulse { 0% { transform:scale(1); } 50% { transform:scale(1.01); } 100% { transform:scale(1); } }
    .signalTitle { font-size:20px; font-weight:1000; }
    .tableWrap { overflow:auto; }
    table { width:100%; min-width:1840px; border-collapse:collapse; margin-top:14px; }
    th,td { border-bottom:1px solid #1f2a44; padding:10px 9px; text-align:left; font-size:12px; white-space:nowrap; }
    th { color:#93a7cb; background:#0a1020; position:sticky; top:0; z-index:1; }
    tr:hover { background:rgba(47,109,246,.08); cursor:pointer; }
    .pill { display:inline-block; padding:5px 9px; border-radius:999px; font-weight:900; font-size:12px; }
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
    .scanLine { font-family:Consolas,monospace; font-size:12px; color:#cbd5e1; border-bottom:1px solid #172033; padding:6px 0; }
    .ticketRow { display:flex; justify-content:space-between; border-bottom:1px solid #172033; padding:8px 0; gap:12px; }
    .ticketRow b { color:#fff; }
    pre { background:#050814; border:1px solid #1f2a44; border-radius:14px; color:#d7e4ff; padding:16px; overflow:auto; min-height:120px; max-height:360px; }
    @media (max-width: 1100px) { .opsGrid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Cidentia Broker Ops Terminal</h1>
      <p>Quantum Survival Radar v0.9. Bitget odaklı broker terminal hissi: canlı tarama, operatör kararı, sesli sinyal, execution ticket, trend gücü, balina riski ve sanal para yönetimi. Gerçek emir kilitlidir.</p>

      <div class="terminalBar">
        <div class="terminalItem"><span class="dot"></span><span class="label">Market Feed</span><div class="safe"><b>BITGET LIVE</b></div></div>
        <div class="terminalItem"><span class="dot"></span><span class="label">Scan Engine</span><div id="scanEngine" class="safe"><b>ARMED</b></div></div>
        <div class="terminalItem"><span class="dot"></span><span class="label">Risk Engine</span><div class="warnText"><b>SURVIVAL MODE</b></div></div>
        <div class="terminalItem"><span class="dot"></span><span class="label">Execution</span><div class="danger"><b>LIVE LOCKED</b></div></div>
        <div class="terminalItem"><span class="dot"></span><span class="label">Sound Signal</span><div id="soundState" class="muted"><b>OFF</b></div></div>
      </div>

      <div class="grid">
        <div class="card"><div class="label">Trading Mode</div><div id="mode" class="value">loading</div></div>
        <div class="card"><div class="label">Real Trading Gate</div><div id="gate" class="value">loading</div></div>
        <div class="card"><div class="label">Scanner</div><div id="scannerCount" class="value">0</div></div>
        <div class="card"><div class="label">Sanal Pozisyonlar</div><div id="paper" class="value">0</div></div>
        <div class="card"><div class="label">Best Candidate</div><div id="bestCandidate" class="value blueText">-</div></div>
      </div>

      <p>
        <label>Tarama <input id="limit" value="40" /></label>
        <label>Sanal sermaye € <input id="accountSize" value="100" /></label>
        <label>Risk % <input id="riskPercent" value="2" /></label>
      </p>
      <p>
        <button onclick="loadStatus()">Status Oku</button>
        <button onclick="loadScanner()">Live Scan Başlat</button>
        <button class="soundBtn" onclick="enableSoundSignal()">Sesli Sinyal Aç</button>
        <button onclick="loadMarket('BTCUSDT')">BTCUSDT Analiz</button>
        <button onclick="loadMarket('ETHUSDT')">ETHUSDT Analiz</button>
        <button onclick="openVirtualDemo()">Sanal İşlem Test</button>
        <button class="dangerBtn" onclick="resetPaper()">Sanal İşlemleri Sıfırla</button>
        <button class="secondary" onclick="clearOutput()">Çıktıyı Temizle</button>
      </p>

      <div id="signalBanner" class="signalBanner">
        <div><div class="signalTitle" id="signalTitle">SIGNAL MONITOR: STANDBY</div><div class="muted" id="signalText">Güçlü sanal aday çıkarsa görsel ve sesli uyarı verir. Gerçek emir açmaz.</div></div>
        <div class="pill avoid" id="signalPill">PAPER ONLY</div>
      </div>

      <div id="tickerTape" class="tickerTape"><div class="tickerInner">MARKET FEED WAITING...</div></div>
      <div class="notice">Zor durum modu: Sistem para baskısı hissedildiğinde işlem iştahını artırmaz; tersine filtresi sertleşir. Avantaj yoksa “işlem açmazdım” der.</div>
    </section>

    <div class="card" style="margin-top:18px;">
      <h2>Quantum Survival Radar v0.9</h2>
      <p>Broker Ops UI: TOP fırsatlar, yüksek riskliler, canlı scan log, execution ticket, sesli uyarı ve sanal risk hesabı.</p>
      <div id="scannerSummary" class="summary"></div>
      <div class="opsGrid">
        <div>
          <div id="topLists" class="tops"></div>
          <div id="scannerTable" class="muted">Scanner henüz çalışmadı.</div>
        </div>
        <div>
          <div class="ticket"><h3>Execution Ticket</h3><div id="executionTicket" class="muted">Sinyal seçilmedi.</div></div>
          <div class="scanLogBox" style="margin-top:14px;"><h3>Live Scan Log</h3><div id="scanLog">Tarama bekleniyor.</div></div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card"><h2>Canlı API</h2><p><a href="/health">/health</a></p><p><a href="/status">/status</a></p><p><a href="/scanner">/scanner</a></p><p><a href="/scanner?limit=40&accountSizeEur=100&riskPercent=2">/scanner?limit=40&accountSizeEur=100&riskPercent=2</a></p><p><a href="/exchange/bitget/ticker/BTCUSDT">/exchange/bitget/ticker/BTCUSDT</a></p></div>
      <div class="card"><h2>Güvenlik Durumu</h2><p>Gerçek emir endpointi kilitlidir. Sesli sinyal sadece “incele” uyarısıdır; gerçek al/sat talimatı değildir.</p></div>
    </div>

    <h2>Çıktı</h2>
    <pre id="out">Panel yükleniyor...</pre>
  </div>
<script>
let lastResults = [];
let soundEnabled = false;
let audioCtx = null;
let lastSignalKey = '';
function out(text) { document.getElementById('out').textContent = text; }
function show(data) { out(JSON.stringify(data, null, 2)); }
function showSmall(label, data) { out(label + String.fromCharCode(10) + JSON.stringify(data, null, 2)); }
async function api(path, options) {
  try { const res = await fetch(path, options); const data = await res.json(); show(data); return data; }
  catch (err) { out('Hata: ' + err.message); throw err; }
}
function money(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('en-US', { maximumFractionDigits: 8 }); }
function eur(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits: 2 }); }
function pct(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toFixed(2) + '%'; }
function regimePill(regime) { const cls = regime === 'green' ? 'green' : regime === 'yellow' ? 'yellow' : 'red'; return '<span class="pill ' + cls + '">' + regime + '</span>'; }
function actionPill(action, label) { let cls = 'wait'; if (action === 'LONG_WATCH') cls = 'long'; else if (action === 'SHORT_WATCH') cls = 'short'; else if (String(action || '').startsWith('AVOID')) cls = 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function whalePill(w) { const level = w?.level || '-'; const cls = level === 'yüksek' || level === 'şüpheli' ? 'red' : level === 'dikkat' ? 'whale' : 'green'; return '<span class="pill ' + cls + '">' + level + '</span>'; }
function trendPill(t) { const label = t?.label || '-'; const cls = label === 'çok güçlü' || label === 'güçlü' ? 'green' : label === 'orta' ? 'yellow' : 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function operatorPill(advice) { const action = advice?.operatorAction || ''; let cls = 'avoid'; if (action === 'VIRTUAL_TEST_STRONG') cls = 'ready'; else if (action === 'VIRTUAL_TEST_SMALL') cls = 'long'; else if (action === 'WATCH_ONLY') cls = 'wait'; return '<span class="pill ' + cls + '">' + (advice?.label || '-') + '</span>'; }
function readablePlanQuality(plan) { if (!plan || !plan.enabled) return 'yok'; if (plan.quality === 'güçlü aday') return 'güçlü aday'; if (plan.quality === 'sanal test uygun') return 'sanal test uygun'; if (plan.riskRewardToTp1 !== null && plan.riskRewardToTp1 !== undefined && Number(plan.riskRewardToTp1) < 1) return 'risk/ödül zayıf'; if (plan.quality === 'sadece izle') return 'işlem açma, takip et'; return plan.quality || 'bekle'; }
function planPill(plan) { const text = readablePlanQuality(plan); if (text === 'yok') return '<span class="pill avoid">yok</span>'; if (text === 'güçlü aday') return '<span class="pill ready">güçlü aday</span>'; if (text === 'sanal test uygun') return '<span class="pill ready">sanal test uygun</span>'; if (text === 'risk/ödül zayıf') return '<span class="pill wait">risk/ödül zayıf</span>'; return '<span class="pill avoid">' + text + '</span>'; }
function enableSoundSignal() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
  soundEnabled = true;
  document.getElementById('soundState').innerHTML = '<b>ON</b>';
  playSignalBeep('enable');
}
function beep(freq, start, duration, gainValue) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine'; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(gainValue, audioCtx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + start); osc.stop(audioCtx.currentTime + start + duration + 0.03);
}
function playSignalBeep(type) {
  if (!soundEnabled || !audioCtx) return;
  if (type === 'strong') { beep(880,0,0.16,0.12); beep(1320,0.18,0.20,0.10); beep(1760,0.42,0.16,0.08); }
  else if (type === 'risk') { beep(220,0,0.25,0.12); beep(180,0.28,0.25,0.10); }
  else { beep(660,0,0.12,0.08); }
}
async function loadStatus() {
  const data = await api('/status');
  document.getElementById('mode').textContent = data.config.tradingMode;
  document.getElementById('mode').className = 'value safe';
  document.getElementById('gate').textContent = data.config.realTradingGateOpen ? 'OPEN' : 'LOCKED';
  document.getElementById('gate').className = data.config.realTradingGateOpen ? 'value danger' : 'value safe';
  document.getElementById('paper').textContent = data.paper.positions.length;
}
async function loadMarket(symbol) { await api('/market/' + symbol); }
function renderTickerTape(results) {
  const items = results.slice(0, 18).map(x => '<span class="tickerItem">' + x.symbol + ' ' + pct(x.metrics?.avgChange) + ' | ' + (x.directionBias || '-') + '</span>').join('');
  document.getElementById('tickerTape').innerHTML = '<div class="tickerInner">' + items + items + '</div>';
}
function renderTopLists(data) {
  const top = data.topLists || {}; const op = data.operatorSummary || {};
  const operator = (op.topOperatorList || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>'+x.action+'<br>Yön: '+x.direction+' | Puan/Güven: '+x.score+'/'+x.confidence+' | R/R: '+(x.rr ?? '-')+'</p>').join('') || '<p>Operatör adayı yok.</p>';
  const opp = (top.topOpportunities || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>Yön: '+x.direction+' | Puan: '+x.score+' | Güven: '+x.confidence+' | R/R: '+(x.rr ?? '-')+'<br>'+x.plan+'</p>').join('') || '<p>Uygun fırsat yok.</p>';
  const risk = (top.highestRisk || []).map((x,i)=>'<p><b>'+(i+1)+'. '+x.symbol+'</b><br>Risk: '+x.risk+' | Karar: '+x.decision+'</p>').join('') || '<p>Yüksek risk listesi boş.</p>';
  document.getElementById('topLists').innerHTML = '<div><h3>Operator Decision Queue</h3>'+operator+'</div><div><h3>Primary Opportunity Set</h3>'+opp+'</div><div><h3>High Risk / Avoid List</h3>'+risk+'</div>';
}
function renderScanLog(results) {
  const lines = results.slice(0, 16).map((x,i)=>'<div class="scanLine">['+new Date().toLocaleTimeString()+'] '+String(i+1).padStart(2,'0')+' | '+x.symbol+' scanned | bias '+(x.directionBias||'-')+' | R/R '+(x.virtualTradePlan?.riskRewardToTp1 ?? '-')+' | '+(x.operatorAdvice?.label || x.decision?.label || '-')+'</div>').join('');
  document.getElementById('scanLog').innerHTML = lines || 'Log yok.';
}
function selectTicket(index) {
  const item = lastResults[index]; if (!item) return;
  const p = item.virtualTradePlan || {}; const mm = item.moneyManagement || {}; const adv = item.operatorAdvice || {}; const zone = p.entryZone ? money(p.entryZone.from)+' - '+money(p.entryZone.to) : '-';
  document.getElementById('executionTicket').innerHTML =
    '<div class="ticketRow"><span>Selected Symbol</span><b>'+item.symbol+'</b></div>'+
    '<div class="ticketRow"><span>Decision</span><b>'+ (adv.label || '-') +'</b></div>'+
    '<div class="ticketRow"><span>Bias / Signal</span><b>'+item.directionBias+' / '+(item.decision?.label || '-')+'</b></div>'+
    '<div class="ticketRow"><span>Entry Zone</span><b>'+zone+'</b></div>'+
    '<div class="ticketRow"><span>Stop</span><b>'+money(p.stopLoss)+'</b></div>'+
    '<div class="ticketRow"><span>TP1 / TP2</span><b>'+money(p.takeProfit1)+' / '+money(p.takeProfit2)+'</b></div>'+
    '<div class="ticketRow"><span>R/R</span><b>'+ (p.riskRewardToTp1 ?? '-') +'</b></div>'+
    '<div class="ticketRow"><span>Suggested Size</span><b>'+ (mm.enabled ? eur(mm.suggestedPositionEur) : '-') +'</b></div>'+
    '<div class="ticketRow"><span>Max Risk</span><b>'+ (mm.enabled ? eur(mm.maxRiskEur) : '-') +'</b></div>'+
    '<div class="notice">Execution Mode: PAPER ONLY. Bu ticket gerçek emir açmaz.</div>';
}
function applySignalEffect(data) {
  const strong = (data.operatorSummary?.topOperatorList || []).find(x => x.action && x.action.includes('güçlü')) || (data.topLists?.topOpportunities || [])[0];
  const banner = document.getElementById('signalBanner');
  const title = document.getElementById('signalTitle');
  const text = document.getElementById('signalText');
  const pill = document.getElementById('signalPill');
  banner.classList.remove('active'); void banner.offsetWidth;
  if (strong) {
    const key = strong.symbol + ':' + strong.rr + ':' + strong.action;
    document.getElementById('bestCandidate').textContent = strong.symbol;
    title.textContent = 'SIGNAL LOCKED: ' + strong.symbol;
    text.textContent = 'Operatör sinyali yakalandı. Yön: ' + (strong.direction || '-') + ' | R/R: ' + (strong.rr ?? '-') + ' | gerçek emir yok, sadece sanal inceleme.';
    pill.className = 'pill ready'; pill.textContent = 'PAPER SIGNAL'; banner.classList.add('active');
    if (key !== lastSignalKey) { playSignalBeep('strong'); lastSignalKey = key; }
  } else {
    document.getElementById('bestCandidate').textContent = '-';
    title.textContent = 'SIGNAL MONITOR: NO CLEAN SETUP';
    text.textContent = 'Temiz güçlü aday yok. Sistem beklemeyi tercih ediyor.';
    pill.className = 'pill avoid'; pill.textContent = 'NO TRADE';
  }
}
async function loadScanner() {
  document.getElementById('scanEngine').innerHTML = '<b>SCANNING...</b>';
  const limit = encodeURIComponent(document.getElementById('limit').value || '40');
  const accountSize = encodeURIComponent(document.getElementById('accountSize').value || '100');
  const riskPercent = encodeURIComponent(document.getElementById('riskPercent').value || '2');
  const data = await api('/scanner?mode=top-bitget&limit=' + limit + '&accountSizeEur=' + accountSize + '&riskPercent=' + riskPercent);
  lastResults = data.results || [];
  document.getElementById('scanEngine').innerHTML = '<b>ACTIVE</b>';
  document.getElementById('scannerCount').textContent = data.count || 0;
  const s = data.summary || {};
  document.getElementById('scannerSummary').innerHTML = '<div><b>Güçlü Sanal</b><br>'+(s.operatorStrongVirtual||0)+'</div><div><b>Küçük Sanal</b><br>'+(s.operatorSmallVirtual||0)+'</div><div><b>Sadece İzle</b><br>'+(s.operatorWatchOnly||0)+'</div><div><b>Uzak Dur</b><br>'+(s.operatorAvoid||0)+'</div><div><b>Long İzle</b><br>'+(s.longWatch||0)+'</div><div><b>Short İzle</b><br>'+(s.shortWatch||0)+'</div><div><b>Kaynak</b><br>'+(data.scannerSource||'-')+'</div>';
  renderTopLists(data); renderTickerTape(lastResults); renderScanLog(lastResults); applySignalEffect(data);
  const rows = lastResults.map((item,index)=>{ const bitget=(item.tickers||[]).find(x=>x.exchange==='bitget')||{}; const m=item.metrics||{}; const d=item.decision||{}; const p=item.virtualTradePlan||{}; const mm=item.moneyManagement||{}; const adv=item.operatorAdvice||{}; const trend=item.trendStrength||m.trendStrength||{}; const whale=item.whaleRisk||m.whaleRisk||{}; const zone=p.entryZone?money(p.entryZone.from)+' - '+money(p.entryZone.to):'-'; return '<tr onclick="selectTicket('+index+')"><td><b>'+item.symbol+'</b></td><td>'+operatorPill(adv)+'</td><td>'+item.score+'</td><td>'+item.confidence+'</td><td>'+regimePill(item.regime)+'</td><td>'+item.riskTier+'</td><td>'+item.directionBias+'</td><td>'+trendPill(trend)+'</td><td>'+whalePill(whale)+'</td><td>'+actionPill(d.action,d.label)+'</td><td>'+money(bitget.lastPrice)+'</td><td>'+pct(m.avgChange)+'</td><td>'+(m.liquidityScore??'-')+'</td><td>'+(item.opportunityTier||'-')+'</td><td>'+planPill(p)+'</td><td>'+zone+'</td><td>'+money(p.stopLoss)+'</td><td>'+money(p.takeProfit1)+'</td><td>'+money(p.takeProfit2)+'</td><td>'+(p.riskRewardToTp1??'-')+'</td><td>'+(mm.enabled?eur(mm.suggestedPositionEur):'-')+'</td><td>'+(mm.enabled?eur(mm.maxRiskEur):'-')+'</td><td class="muted">'+(adv.actionText||d.reason||'')+'</td></tr>'; }).join('');
  document.getElementById('scannerTable').innerHTML = '<div class="tableWrap"><table><thead><tr><th>Coin</th><th>Ben Olsam</th><th>Puan</th><th>Güven</th><th>Durum</th><th>Risk</th><th>Yön</th><th>Trend Gücü</th><th>Balina Riski</th><th>Akıllı Karar</th><th>Bitget</th><th>24s %</th><th>Likidite</th><th>Fırsat</th><th>Sanal Plan</th><th>Giriş Bölgesi</th><th>Stop</th><th>Kar 1</th><th>Kar 2</th><th>R/R</th><th>Önerilen €</th><th>Max Risk</th><th>Açıklama</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  if (lastResults.length) selectTicket(0);
  showSmall('Broker Ops v0.9 özeti: '+(data.count||0)+' coin tarandı. Sesli sinyal sadece sanal inceleme uyarısıdır.', data.operatorSummary || data.topLists || {});
}
async function openVirtualDemo() { await api('/paper/open', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ exchange:'bitget', symbol:'BTCUSDT', side:'long', entryPrice:100000, stopLoss:99000, takeProfit:102000, positionSizeEur:100 }) }); await loadStatus(); }
async function resetPaper() { const data = await api('/paper/reset', { method:'POST' }); document.getElementById('paper').textContent = data.positions.length; }
function clearOutput() { out('Çıktı temizlendi.'); }
loadStatus().then(loadScanner).catch((err) => out('Panel başlatma hatası: ' + err.message));
</script>
</body>
</html>`;
}
