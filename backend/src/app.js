import express from 'express';
import cors from 'cors';
import { config, realTradingGateIsOpen } from './config.js';
import { getAllExchangeHealth, getCombinedTicker, getExchange, listExchanges } from './exchanges/exchange-manager.js';
import { analyzeTicker, combineExchangeAnalysis } from './intelligence/simple-intelligence.js';
import { evaluateTradeRisk } from './risk-engine/risk-engine.js';
import { getPaperState, openPaperTrade } from './paper-trading/paper-engine.js';

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
    .wrap { max-width:1180px; margin:0 auto; padding:28px; }
    .hero { border:1px solid #1f2a44; border-radius:22px; padding:26px; background:linear-gradient(135deg,#10182a,#0b1020); box-shadow:0 16px 60px rgba(0,0,0,.35); }
    h1 { margin:0 0 8px; font-size:30px; }
    p { color:#aebbd4; line-height:1.55; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; margin-top:18px; }
    .card { border:1px solid #1f2a44; border-radius:18px; padding:18px; background:#0d1424; }
    .label { color:#8fa1c4; font-size:13px; }
    .value { font-size:24px; font-weight:700; margin-top:7px; }
    .safe { color:#4ade80; } .warn { color:#facc15; } .danger { color:#fb7185; }
    button { border:0; border-radius:12px; padding:12px 16px; font-weight:700; cursor:pointer; background:#2f6df6; color:white; margin:6px 8px 6px 0; }
    code, pre { background:#050814; border:1px solid #1f2a44; border-radius:14px; color:#d7e4ff; }
    pre { padding:16px; overflow:auto; min-height:180px; }
    a { color:#93c5fd; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Cidentia Market Intelligence & Risk Engine</h1>
      <p>Güvenli demo paneli. Sistem şu anda gerçek emir açmaz. Binance ve Bitget public piyasa verisini okur, risk kilidi ve paper trading mantığıyla çalışır.</p>
      <div class="grid">
        <div class="card"><div class="label">Trading Mode</div><div id="mode" class="value">loading</div></div>
        <div class="card"><div class="label">Real Trading Gate</div><div id="gate" class="value">loading</div></div>
        <div class="card"><div class="label">Default Symbol</div><div id="symbol" class="value">BTCUSDT</div></div>
        <div class="card"><div class="label">Paper Positions</div><div id="paper" class="value">0</div></div>
      </div>
      <p>
        <button onclick="loadStatus()">Status Oku</button>
        <button onclick="loadMarket('BTCUSDT')">BTCUSDT Analiz</button>
        <button onclick="loadMarket('ETHUSDT')">ETHUSDT Analiz</button>
        <button onclick="openPaperDemo()">Paper Trade Test</button>
      </p>
    </section>

    <div class="grid">
      <div class="card">
        <h2>Canlı API</h2>
        <p><a href="/health">/health</a></p>
        <p><a href="/status">/status</a></p>
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
async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json();
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);
  return data;
}
async function loadStatus() {
  const data = await api('/status');
  document.getElementById('mode').textContent = data.config.tradingMode;
  document.getElementById('mode').className = 'value safe';
  document.getElementById('gate').textContent = data.config.realTradingGateOpen ? 'OPEN' : 'LOCKED';
  document.getElementById('gate').className = data.config.realTradingGateOpen ? 'value danger' : 'value safe';
  document.getElementById('symbol').textContent = data.config.defaultSymbol;
  document.getElementById('paper').textContent = data.paper.positions.length;
}
async function loadMarket(symbol) { await api('/market/' + symbol); }
async function openPaperDemo() {
  await api('/paper/open', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ exchange:'binance', symbol:'BTCUSDT', side:'long', entryPrice:100000, stopLoss:99000, takeProfit:102000, positionSizeEur:100 })
  });
  await loadStatus();
}
loadStatus();
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
