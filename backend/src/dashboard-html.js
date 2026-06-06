export function dashboardHtml() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cidentia Market Intelligence & Risk Engine</title>
  <style>
    :root { color-scheme: dark; }
    body { margin:0; font-family:Arial,sans-serif; background:#070b12; color:#eef3ff; }
    .wrap { max-width:1540px; margin:0 auto; padding:28px; }
    .hero,.card { border:1px solid #1f2a44; border-radius:22px; background:#0d1424; box-shadow:0 16px 60px rgba(0,0,0,.25); }
    .hero { padding:26px; background:linear-gradient(135deg,#10182a,#0b1020); }
    h1 { margin:0 0 8px; font-size:30px; }
    h2 { margin:0 0 12px; }
    p { color:#bfd0ee; line-height:1.55; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top:18px; }
    .card { padding:18px; }
    .label { color:#93a7cb; font-size:13px; }
    .value { font-size:24px; font-weight:800; margin-top:7px; }
    .safe { color:#4ade80; } .danger { color:#fb7185; }
    button { border:0; border-radius:12px; padding:12px 16px; font-weight:800; cursor:pointer; background:#2f6df6; color:white; margin:6px 8px 6px 0; }
    button.secondary { background:#334155; } button.dangerBtn { background:#9f1239; }
    input { background:#050814; color:#eef3ff; border:1px solid #334155; border-radius:10px; padding:10px; width:90px; }
    a { color:#93c5fd; }
    .notice { margin-top:14px; padding:12px 14px; border:1px solid #334155; border-radius:14px; color:#cbd5e1; background:#0a1020; }
    .help,.summary,.tops { margin-top:18px; display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:10px; }
    .help div,.summary div,.tops div { background:#0a1020; border:1px solid #1f2a44; border-radius:14px; padding:12px; color:#cbd5e1; line-height:1.45; }
    .help b,.tops b { color:#fff; }
    .tableWrap { overflow:auto; }
    table { width:100%; min-width:1480px; border-collapse:collapse; margin-top:14px; }
    th,td { border-bottom:1px solid #1f2a44; padding:10px 9px; text-align:left; font-size:12px; white-space:nowrap; }
    th { color:#93a7cb; background:#0a1020; }
    .pill { display:inline-block; padding:5px 9px; border-radius:999px; font-weight:800; font-size:12px; }
    .green { background:rgba(74,222,128,.14); color:#4ade80; }
    .yellow { background:rgba(250,204,21,.14); color:#facc15; }
    .red { background:rgba(251,113,133,.14); color:#fb7185; }
    .long { background:rgba(34,197,94,.14); color:#4ade80; }
    .short { background:rgba(248,113,113,.14); color:#fb7185; }
    .wait { background:rgba(250,204,21,.14); color:#facc15; }
    .avoid { background:rgba(148,163,184,.14); color:#cbd5e1; }
    .ready { background:rgba(59,130,246,.16); color:#93c5fd; }
    .muted { color:#93a7cb; }
    pre { background:#050814; border:1px solid #1f2a44; border-radius:14px; color:#d7e4ff; padding:16px; overflow:auto; min-height:120px; max-height:360px; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Cidentia Market Intelligence & Risk Engine</h1>
      <p>Bitget odaklı güvenli demo paneli. v0.6 artık Bitget USDT piyasasından hacme göre en güçlü coinleri seçer, TOP 40 tarar, fırsat/risk listesi ve sanal para yönetimi üretir. Gerçek emir hâlâ kilitlidir.</p>
      <div class="grid">
        <div class="card"><div class="label">Trading Mode</div><div id="mode" class="value">loading</div></div>
        <div class="card"><div class="label">Real Trading Gate</div><div id="gate" class="value">loading</div></div>
        <div class="card"><div class="label">Scanner</div><div id="scannerCount" class="value">0</div></div>
        <div class="card"><div class="label">Sanal Pozisyonlar</div><div id="paper" class="value">0</div></div>
      </div>
      <p>
        <label>Tarama <input id="limit" value="40" /></label>
        <label>Sanal sermaye € <input id="accountSize" value="100" /></label>
        <label>Risk % <input id="riskPercent" value="2" /></label>
      </p>
      <p>
        <button onclick="loadStatus()">Status Oku</button>
        <button onclick="loadScanner()">Bitget Smart Radar v0.6</button>
        <button onclick="loadMarket('BTCUSDT')">BTCUSDT Analiz</button>
        <button onclick="loadMarket('ETHUSDT')">ETHUSDT Analiz</button>
        <button onclick="openVirtualDemo()">Sanal İşlem Test</button>
        <button class="dangerBtn" onclick="resetPaper()">Sanal İşlemleri Sıfırla</button>
        <button class="secondary" onclick="clearOutput()">Çıktıyı Temizle</button>
      </p>
      <div class="notice">Sanal işlem = gerçek para yok. Sistem sadece “sanki işlem açmış gibi” test kaydı tutar. Bu sürüm Bitget USDT piyasasından dinamik coin seçer.</div>
      <div class="help">
        <div><b>Sabit liste değil</b><br>Varsayılan tarama Bitget hacimli USDT coinleri içinden gelir.</div>
        <div><b>Giriş bölgesi</b><br>Fiyat bu alana gelirse sistem sanal takip planı oluşturur.</div>
        <div><b>Stop</b><br>Fikir yanlış çıkarsa sanal zarar kesme seviyesidir.</div>
        <div><b>Kar 1 / Kar 2</b><br>Sanal kar alma hedefleridir.</div>
        <div><b>R/R</b><br>Risk/ödül oranı. 1 altı zayıf, 1.5 üstü daha iyidir.</div>
        <div><b>Önerilen €</b><br>100 € sanal sermayede %2 riskle önerilen sanal pozisyon büyüklüğü.</div>
      </div>
    </section>

    <div class="card" style="margin-top:18px;">
      <h2>Bitget Smart Radar v0.6</h2>
      <p>Dinamik tarama: Bitget TOP hacimli USDT coinleri, TOP fırsatlar, yüksek riskliler, sanal giriş-stop-kar hedefleri ve para yönetimi.</p>
      <div id="scannerSummary" class="summary"></div>
      <div id="topLists" class="tops"></div>
      <div id="scannerTable" class="muted">Scanner henüz çalışmadı.</div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Canlı API</h2>
        <p><a href="/health">/health</a></p>
        <p><a href="/status">/status</a></p>
        <p><a href="/scanner">/scanner</a></p>
        <p><a href="/scanner?limit=40&accountSizeEur=100&riskPercent=2">/scanner?limit=40&accountSizeEur=100&riskPercent=2</a></p>
        <p><a href="/exchange/bitget/ticker/BTCUSDT">/exchange/bitget/ticker/BTCUSDT</a></p>
      </div>
      <div class="card"><h2>Güvenlik Durumu</h2><p>Gerçek emir endpointi kilitlidir. API key olmadan sadece public Bitget verisi okunur. Gerçek işlem altyapısı server/VPS aşamasında ayrıca ve kontrollü açılır.</p></div>
    </div>

    <h2>Çıktı</h2>
    <pre id="out">Panel yükleniyor...</pre>
  </div>
<script>
function out(text) { document.getElementById('out').textContent = text; }
function show(data) { out(JSON.stringify(data, null, 2)); }
function showSmall(label, data) { out(label + String.fromCharCode(10) + JSON.stringify(data, null, 2)); }
async function api(path, options) {
  try {
    const res = await fetch(path, options);
    const data = await res.json();
    show(data);
    return data;
  } catch (err) {
    out('Hata: ' + err.message);
    throw err;
  }
}
function money(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('en-US', { maximumFractionDigits: 8 }); }
function eur(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toLocaleString('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits: 2 }); }
function pct(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'; return Number(value).toFixed(2) + '%'; }
function regimePill(regime) { const cls = regime === 'green' ? 'green' : regime === 'yellow' ? 'yellow' : 'red'; return '<span class="pill ' + cls + '">' + regime + '</span>'; }
function actionPill(action, label) { let cls = 'wait'; if (action === 'LONG_WATCH') cls = 'long'; else if (action === 'SHORT_WATCH') cls = 'short'; else if (String(action || '').startsWith('AVOID')) cls = 'avoid'; return '<span class="pill ' + cls + '">' + label + '</span>'; }
function readablePlanQuality(plan) { if (!plan || !plan.enabled) return 'yok'; if (plan.quality === 'sanal test uygun') return 'sanal test uygun'; if (plan.riskRewardToTp1 !== null && plan.riskRewardToTp1 !== undefined && Number(plan.riskRewardToTp1) < 1) return 'risk/ödül zayıf'; if (plan.quality === 'sadece izle') return 'işlem açma, takip et'; return plan.quality || 'bekle'; }
function planPill(plan) { const text = readablePlanQuality(plan); if (text === 'yok') return '<span class="pill avoid">yok</span>'; if (text === 'sanal test uygun') return '<span class="pill ready">sanal test uygun</span>'; if (text === 'risk/ödül zayıf') return '<span class="pill wait">risk/ödül zayıf</span>'; return '<span class="pill avoid">' + text + '</span>'; }
async function loadStatus() {
  const data = await api('/status');
  document.getElementById('mode').textContent = data.config.tradingMode;
  document.getElementById('mode').className = 'value safe';
  document.getElementById('gate').textContent = data.config.realTradingGateOpen ? 'OPEN' : 'LOCKED';
  document.getElementById('gate').className = data.config.realTradingGateOpen ? 'value danger' : 'value safe';
  document.getElementById('paper').textContent = data.paper.positions.length;
}
async function loadMarket(symbol) { await api('/market/' + symbol); }
function renderTopLists(data) {
  const top = data.topLists || {};
  const opp = (top.topOpportunities || []).map((x, i) => '<p><b>' + (i+1) + '. ' + x.symbol + '</b><br>Yön: ' + x.direction + ' | Puan: ' + x.score + ' | Güven: ' + x.confidence + ' | R/R: ' + (x.rr ?? '-') + '<br>' + x.plan + '</p>').join('') || '<p>Uygun fırsat yok.</p>';
  const risk = (top.highestRisk || []).map((x, i) => '<p><b>' + (i+1) + '. ' + x.symbol + '</b><br>Risk: ' + x.risk + ' | Karar: ' + x.decision + '</p>').join('') || '<p>Yüksek risk listesi boş.</p>';
  document.getElementById('topLists').innerHTML = '<div><h3>TOP Fırsatlar</h3>' + opp + '</div><div><h3>En Riskli Coinler</h3>' + risk + '</div>';
}
async function loadScanner() {
  const limit = encodeURIComponent(document.getElementById('limit').value || '40');
  const accountSize = encodeURIComponent(document.getElementById('accountSize').value || '100');
  const riskPercent = encodeURIComponent(document.getElementById('riskPercent').value || '2');
  const data = await api('/scanner?mode=top-bitget&limit=' + limit + '&accountSizeEur=' + accountSize + '&riskPercent=' + riskPercent);
  document.getElementById('scannerCount').textContent = data.count || 0;
  const s = data.summary || {};
  document.getElementById('scannerSummary').innerHTML =
    '<div><b>Long İzle</b><br>' + (s.longWatch || 0) + '</div>' +
    '<div><b>Short İzle</b><br>' + (s.shortWatch || 0) + '</div>' +
    '<div><b>Sanal Uygun</b><br>' + (s.virtualReady || 0) + '</div>' +
    '<div><b>Güçlü Aday</b><br>' + (s.strongCandidates || 0) + '</div>' +
    '<div><b>Bekle</b><br>' + (s.wait || 0) + '</div>' +
    '<div><b>Kaçın</b><br>' + (s.avoid || 0) + '</div>' +
    '<div><b>Kaynak</b><br>' + (data.scannerSource || '-') + '</div>';
  renderTopLists(data);
  const rows = (data.results || []).map((item) => {
    const tickers = item.tickers || [];
    const bitget = tickers.find((x) => x.exchange === 'bitget') || {};
    const m = item.metrics || {};
    const d = item.decision || {};
    const p = item.virtualTradePlan || {};
    const mm = item.moneyManagement || {};
    const zone = p.entryZone ? money(p.entryZone.from) + ' - ' + money(p.entryZone.to) : '-';
    return '<tr>' +
      '<td><b>' + item.symbol + '</b></td>' +
      '<td>' + item.score + '</td>' +
      '<td>' + item.confidence + '</td>' +
      '<td>' + regimePill(item.regime) + '</td>' +
      '<td>' + item.riskTier + '</td>' +
      '<td>' + item.directionBias + '</td>' +
      '<td>' + actionPill(d.action, d.label) + '</td>' +
      '<td>' + money(bitget.lastPrice) + '</td>' +
      '<td>' + pct(m.avgChange) + '</td>' +
      '<td>' + (m.liquidityScore ?? '-') + '</td>' +
      '<td>' + (item.opportunityTier || '-') + '</td>' +
      '<td>' + planPill(p) + '</td>' +
      '<td>' + zone + '</td>' +
      '<td>' + money(p.stopLoss) + '</td>' +
      '<td>' + money(p.takeProfit1) + '</td>' +
      '<td>' + money(p.takeProfit2) + '</td>' +
      '<td>' + (p.riskRewardToTp1 ?? '-') + '</td>' +
      '<td>' + (mm.enabled ? eur(mm.suggestedPositionEur) : '-') + '</td>' +
      '<td>' + (mm.enabled ? eur(mm.maxRiskEur) : '-') + '</td>' +
      '<td class="muted">' + (d.reason || '') + '</td>' +
    '</tr>';
  }).join('');
  document.getElementById('scannerTable').innerHTML = '<div class="tableWrap"><table><thead><tr><th>Coin</th><th>Puan</th><th>Güven</th><th>Durum</th><th>Risk</th><th>Yön</th><th>Akıllı Karar</th><th>Bitget</th><th>24s %</th><th>Likidite</th><th>Fırsat</th><th>Sanal Plan</th><th>Giriş Bölgesi</th><th>Stop</th><th>Kar 1</th><th>Kar 2</th><th>R/R</th><th>Önerilen €</th><th>Max Risk</th><th>Açıklama</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  showSmall('Bitget Smart Radar v0.6 özeti: ' + (data.count || 0) + ' coin tarandı. Kaynak: ' + (data.scannerSource || '-') + '. Sanal işlem gerçek para kullanmaz.', (data.topLists || {}));
}
async function openVirtualDemo() { await api('/paper/open', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ exchange:'bitget', symbol:'BTCUSDT', side:'long', entryPrice:100000, stopLoss:99000, takeProfit:102000, positionSizeEur:100 }) }); await loadStatus(); }
async function resetPaper() { const data = await api('/paper/reset', { method:'POST' }); document.getElementById('paper').textContent = data.positions.length; }
function clearOutput() { out('Çıktı temizlendi.'); }
loadStatus().then(loadScanner).catch((err) => out('Panel başlatma hatası: ' + err.message));
</script>
</body>
</html>`;
}
