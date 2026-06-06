import express from 'express';
import cors from 'cors';
import { config, realTradingGateIsOpen } from './config.js';
import { getAllExchangeHealth, getCombinedTicker, getExchange, listExchanges } from './exchanges/exchange-manager.js';
import { analyzeTicker, combineExchangeAnalysis } from './intelligence/simple-intelligence.js';
import { evaluateTradeRisk } from './risk-engine/risk-engine.js';
import { getPaperState, openPaperTrade, resetPaperState } from './paper-trading/paper-engine.js';
import { DEFAULT_SCANNER_SYMBOLS, scanMarket } from './scanner/market-scanner.js';

export const app = express();

app.use(cors());
app.use(express.json());

function dashboardHtml() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cidentia Market Intelligence & Risk Engine</title>
  <style>
    :root { color-scheme: dark; }
    body { margin:0; font-family: Arial, sans-serif; background:#080b12; color:#eef3ff; }
    .wrap { max-width:1380px; margin:0 auto; padding:28px; }
    .hero { border:1px solid #1f2a44; border-radius:22px; padding:26px; background:linear-gradient(135deg,#10182a,#0b1020); box-shadow:0 16px 60px rgba(0,0,0,.35); }
    h1 { margin:0 0 8px; font-size:30px; }
    p { color:#aebbd4; line-height:1.55; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top:18px; }
    .card { border:1px solid #1f2a44; border-radius:18px; padding:18px; background:#0d1424; }
    .label { color:#8fa1c4; font-size:13px; }
    .value { font-size:24px; font-weight:700; margin-top:7px; }
    .safe { color:#4ade80; } .warn { color:#facc15; } .danger { color:#fb7185; }
    button { border:0; border-radius:12px; padding:12px 16px; font-weight:700; cursor:pointer; background:#2f6df6; color:white; margin:6px 8px 6px 0; }
    button.secondary { background:#334155; }
    button.dangerBtn { background:#9f1239; }
    code, pre { background:#050814; border:1px solid #1f2a44; border-radius:14px; color:#d7e4ff; }
    pre { padding:16px; overflow:auto; min-height:120px; max-height:360px; }
    a { color:#93c5fd; }
    .tableWrap { overflow:auto; }
    table { width:100%; border-collapse:collapse; margin-top:14px; overflow:hidden; border-radius:14px; min-width:1080px; }
    th, td { border-bottom:1px solid #1f2a44; padding:11px 10px; text-align:left; font-size:13px; white-space:nowrap; }
    th { color:#8fa1c4; background:#0a1020; }
    .pill { display:inline-block; padding:5px 9px; border-radius:999px; font-weight:700; font-size:12px; }
    .pill.green { background:rgba(74,222,128,.14); color:#4ade80; }
    .pill.yellow { background:rgba(250,204,21,.14); color:#facc15; }
    .pill.red { background:rgba(251,113,133,.14); color:#fb7185; }
    .pill.long { background:rgba(34,197,94,.14); color:#4ade80; }
    .pill.short { background:rgba(248,113,113,.14); color:#fb7185; }
    .pill.wait { background:rgba(250,204,21,.14); color:#facc15; }
    .pill.avoid { background:rgba(148,163,184,.14); color:#cbd5e1; }
    .muted { color:#8fa1c4; }
    .notice { margin-top:14px; padding:12px 14px; border:1px solid #334155; border-radius:14px; color:#cbd5e1; background:#0a1020; }
    .summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-top:14px; }
    .summary div { background:#0a1020; border:1px solid #1f2a44; border-radius:14px; padding:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Cidentia Market Intelligence & Risk Engine</h1>
      <p>Güvenli demo paneli. v0.3 Smart Radar artık momentum, likidite, 24 saat aralık konumu, spread riski, pump/dump kovalamama ve yön eğilimi okur. Gerçek emir hâlâ kilitlidir.</p>
      <div class="grid">
        <div class="card"><div class="label">Trading Mode</div><div id="mode" class="value">loading</div></div>
        <div class="card"><div class="label">Real Trading Gate</div><div id="gate" class="value">loading</div></div>
        <div class="card"><div class="label">Scanner</div><div id="scannerCount" class="value">0</div></div>
        <div class="card"><div class="label">Paper Positions</div><div id="paper" class="value">0</div></div>
      </div>
      <p>
        <button onclick="loadStatus()">Status Oku</button>
        <button onclick="loadScanner()">Smart Radar v0.3</button>
        <button onclick="loadMarket('BTCUSDT')">BTCUSDT Analiz</button>
        <button onclick="loadMarket('ETHUSDT')">ETHUSDT Analiz</button>
        <button onclick="openPaperDemo()">Paper Trade Test</button>
        <button class="dangerBtn" onclick="resetPaper()">Paper Sıfırla</button>
        <button class="secondary" onclick="clearOutput()">Çıktıyı Temizle</button>
      </p>
      <div class="notice">Not: Binance Vercel cloud üzerinde 451 ile bloklanabilir. Bu durumda panel Bitget verisiyle çalışır; VPS/server aşamasında Binance tekrar normal denenir.</div>
    </section>

    <div class="card" style="margin-top:18px;">
      <h2>Smart Radar v0.3</h2>
      <p>Akıllı tarama: long izle, short izle, onay bekle, tepe kovalanmaz, düşen bıçak, likidite zayıf gibi kararlar üretir. Bu kararlar sadece demo/paper mod içindir.</p>
      <div id="scannerSummary" class="summary"></div>
      <div id="scannerTable" class="muted">Scanner henüz çalışmadı.</div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Canlı API</h2>
        <p><a href="/health">/health</a></p>
        <p><a href="/status">/status</a></p>
        <p><a href="/scanner">/scanner</a></p>
        <p><a href="/market/BTCUSDT">/market/BTCUSDT</a></p>
        <p><a href="/exchange/binance/ticker/BTCUSDT">/exchange/binance/ticker/BTCUSDT</a></p>
        <p><a href="/exchange/bitget/ticker/BTCUSDT">/exchange/bitget/ticker/BTCUSDT</a></p>
      </div>
      <div class="card">
        <h2>Güvenlik Durumu</h2>
        <p>Gerçek emir endpointi kilitlidir. API key olmadan sadece public veri okunur. Live trading sonradan server/VPS aşamasında ayrıca açılır.</p>
      </div>
    </div>

    <h2>Çıktı</h2>
    <pre id="out">Panel yükleniyor...</pre>
  </div>
<script>
function show(data) {
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);
}
function showSmall(label, data) {
  document.getElementById('out').textContent = label + '\n' + JSON.stringify(data, null, 2);
}
async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json();
  show(data);
  return data;
}
function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 6 });
}
function pct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toFixed(2) + '%';
}
function pill(regime) {
  const cls = regime === 'green' ? 'green' : regime === 'yellow' ? 'yellow' : 'red';
  return '<span class="pill ' + cls + '">' + regime + '</span>';
}
function actionPill(action, label) {
  let cls = 'wait';
  if (action === 'LONG_WATCH') cls = 'long';
  else if (action === 'SHORT_WATCH') cls = 'short';
  else if (action.startsWith('AVOID')) cls = 'avoid';
  return '<span class="pill ' + cls + '">' + label + '</span>';
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
async function loadScanner() {
  const data = await api('/scanner');
  document.getElementById('scannerCount').textContent = data.count;
  const s = data.summary || {};
  document.getElementById('scannerSummary').innerHTML =
    '<div><b>Long İzle</b><br>' + (s.longWatch || 0) + '</div>' +
    '<div><b>Short İzle</b><br>' + (s.shortWatch || 0) + '</div>' +
    '<div><b>Bekle</b><br>' + (s.wait || 0) + '</div>' +
    '<div><b>Kaçın</b><br>' + (s.avoid || 0) + '</div>' +
    '<div><b>Green</b><br>' + (s.green || 0) + '</div>' +
    '<div><b>Yellow</b><br>' + (s.yellow || 0) + '</div>' +
    '<div><b>Red</b><br>' + (s.red || 0) + '</div>';
  const rows = data.results.map((item) => {
    const binance = item.tickers.find((x) => x.exchange === 'binance') || {};
    const bitget = item.tickers.find((x) => x.exchange === 'bitget') || {};
    const metrics = item.metrics || {};
    return '<tr>' +
      '<td><b>' + item.symbol + '</b></td>' +
      '<td>' + item.score + '</td>' +
      '<td>' + item.confidence + '</td>' +
      '<td>' + pill(item.regime) + '</td>' +
      '<td>' + item.riskTier + '</td>' +
      '<td>' + item.directionBias + '</td>' +
      '<td>' + actionPill(item.decision.action, item.decision.label) + '</td>' +
      '<td>' + money(binance.lastPrice) + '</td>' +
      '<td>' + money(bitget.lastPrice) + '</td>' +
      '<td>' + pct(metrics.avgChange) + '</td>' +
      '<td>' + pct(metrics.avgRangePosition !== null && metrics.avgRangePosition !== undefined ? metrics.avgRangePosition * 100 : null) + '</td>' +
      '<td>' + (metrics.liquidityScore ?? '-') + '</td>' +
      '<td>' + pct(item.spreadPercent) + '</td>' +
      '<td class="muted">' + item.decision.reason + '</td>' +
    '</tr>';
  }).join('');
  document.getElementById('scannerTable').innerHTML = '<div class="tableWrap"><table><thead><tr><th>Coin</th><th>Score</th><th>Güven</th><th>Regime</th><th>Risk</th><th>Yön</th><th>Akıllı Karar</th><th>Binance</th><th>Bitget</th><th>24s %</th><th>Aralık Konumu</th><th>Likidite</th><th>Spread</th><th>Açıklama</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  showSmall('Smart Radar v0.3 özeti: ' + data.count + ' coin tarandı.', data.results.map(item => ({ symbol:item.symbol, score:item.score, confidence:item.confidence, risk:item.riskTier, yon:item.directionBias, karar:item.decision.label, action:item.decision.action, neden:item.decision.reason, warnings:item.warnings })));
}
async function openPaperDemo() {
  await api('/paper/open', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ exchange:'binance', symbol:'BTCUSDT', side:'long', entryPrice:100000, stopLoss:99000, takeProfit:102000, positionSizeEur:100 })
  });
  await loadStatus();
}
async function resetPaper() {
  const data = await api('/paper/reset', { method:'POST' });
  document.getElementById('paper').textContent = data.positions.length;
}
function clearOutput() {
  document.getElementById('out').textContent = 'Çıktı temizlendi.';
}
loadStatus();
loadScanner();
</script>
</body>
</html>`;
}

app.get('/', async (req, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.send(dashboardHtml());
});

app.get('/health', async (req, res) => {
  res.json({
    ok: true,
    service: 'Cidentia Market Intelligence & Risk Engine',
    mode: config.tradingMode,
    realTradingGateOpen: realTradingGateIsOpen(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/status', async (req, res) => {
  const exchangeHealth = await getAllExchangeHealth();
  res.json({
    ok: true,
    config: {
      tradingMode: config.tradingMode,
      allowRealTrading: config.allowRealTrading,
      realTradingGateOpen: realTradingGateIsOpen(),
      defaultExchange: config.defaultExchange,
      defaultSymbol: config.defaultSymbol,
      defaultPositionSizeEur: config.defaultPositionSizeEur,
      maxRiskPerTradeEur: config.maxRiskPerTradeEur,
      maxDailyLossEur: config.maxDailyLossEur,
      maxOpenPositions: config.maxOpenPositions,
      requireStopLoss: config.requireStopLoss,
    },
    exchanges: listExchanges(),
    exchangeHealth,
    paper: getPaperState(),
  });
});

app.get('/scanner', async (req, res) => {
  const symbols = req.query.symbols
    ? String(req.query.symbols).split(',')
    : DEFAULT_SCANNER_SYMBOLS;
  res.json(await scanMarket(symbols));
});

app.get('/market/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const tickers = await getCombinedTicker(symbol);
  const analyses = tickers.map(analyzeTicker);
  res.json({
    symbol,
    tickers,
    intelligence: combineExchangeAnalysis(analyses),
  });
});

app.get('/exchange/:exchange/ticker/:symbol', async (req, res, next) => {
  try {
    const exchange = getExchange(req.params.exchange);
    const ticker = await exchange.getTicker(req.params.symbol.toUpperCase());
    res.json({ ticker, intelligence: analyzeTicker(ticker) });
  } catch (error) {
    next(error);
  }
});

app.post('/risk/evaluate', (req, res) => {
  res.json(evaluateTradeRisk(req.body || {}));
});

app.get('/paper', (req, res) => {
  res.json(getPaperState());
});

app.post('/paper/open', (req, res) => {
  res.json(openPaperTrade(req.body || {}));
});

app.post('/paper/reset', (req, res) => {
  res.json(resetPaperState());
});

app.post('/order/live', (req, res) => {
  res.status(403).json({
    accepted: false,
    reason: 'LIVE_ORDER_ENDPOINT_LOCKED_IN_SAFE_FOUNDATION_VERSION',
    message: 'Use paper trading first. Live execution is intentionally blocked.',
  });
});

app.use((error, req, res, next) => {
  res.status(500).json({ ok: false, error: error.message });
});
