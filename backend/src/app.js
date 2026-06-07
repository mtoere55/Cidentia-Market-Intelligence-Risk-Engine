import express from 'express';
import cors from 'cors';
import { config, realTradingGateIsOpen } from './config.js';
import { getAllExchangeHealth, getCombinedTicker, getExchange, listExchanges } from './exchanges/exchange-manager.js';
import { analyzeTicker, combineExchangeAnalysis } from './intelligence/simple-intelligence.js';
import { evaluateTradeRisk } from './risk-engine/risk-engine.js';
import { getPaperState, openPaperTrade, resetPaperState, queueVirtualSetup, updateVirtualSetups, getPaperPerformance } from './paper-trading/paper-engine.js';
import { DEFAULT_SCANNER_SYMBOLS, scanMarket } from './scanner/market-scanner.js';
import { dashboardHtml } from './dashboard-html.js';

export const app = express();

app.use(cors());
app.use(express.json());

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
    paperPerformance: getPaperPerformance().summary,
  });
});

app.get('/scanner', async (req, res) => {
  const symbols = req.query.symbols ? String(req.query.symbols).split(',') : [];
  const mode = req.query.mode ? String(req.query.mode) : 'top-bitget';
  const limit = req.query.limit ? Number(req.query.limit) : 40;
  const accountSizeEur = req.query.accountSizeEur ? Number(req.query.accountSizeEur) : 100;
  const riskPercent = req.query.riskPercent ? Number(req.query.riskPercent) : 2;

  res.json(await scanMarket({
    symbols,
    mode,
    limit,
    accountSizeEur,
    riskPercent,
  }));
});

app.get('/scanner/default', async (req, res) => {
  res.json(await scanMarket({ symbols: DEFAULT_SCANNER_SYMBOLS, mode: 'fixed-default', limit: DEFAULT_SCANNER_SYMBOLS.length }));
});

app.get('/market/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const tickers = await getCombinedTicker(symbol);
  const analyses = tickers.map(analyzeTicker);
  res.json({ symbol, tickers, intelligence: combineExchangeAnalysis(analyses) });
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

app.get('/paper/performance', (req, res) => {
  res.json(getPaperPerformance());
});

app.post('/paper/queue', (req, res) => {
  res.json(queueVirtualSetup(req.body || {}));
});

app.post('/paper/market-now', async (req, res) => {
  try {
    const body = req.body || {};
    const symbol = String(body.symbol || '').toUpperCase();
    if (!symbol) {
      return res.status(400).json({ accepted: false, reason: 'MISSING_SYMBOL' });
    }
    const ticker = await getExchange('bitget').getTicker(symbol);
    res.json(queueVirtualSetup({
      ...body,
      exchange: body.exchange || 'bitget',
      symbol,
      currentPrice: ticker.lastPrice,
      activateNow: true,
    }));
  } catch (error) {
    res.status(500).json({ accepted: false, reason: error.message });
  }
});

app.post('/paper/refresh', async (req, res) => {
  const symbols = getPaperState().setups
    .filter((item) => ['queued', 'active', 'tp1_hit'].includes(item.status))
    .map((item) => item.symbol);

  const uniqueSymbols = [...new Set(symbols)];
  const priceMap = {};

  for (const symbol of uniqueSymbols) {
    try {
      const ticker = await getExchange('bitget').getTicker(symbol);
      priceMap[symbol] = ticker.lastPrice;
    } catch (error) {
      priceMap[symbol] = null;
    }
  }

  res.json(updateVirtualSetups(priceMap));
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
    message: 'Use virtual trading first. Live execution is intentionally blocked.',
  });
});

app.use((error, req, res, next) => {
  res.status(500).json({ ok: false, error: error.message });
});
