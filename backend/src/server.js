import express from 'express';
import cors from 'cors';
import { config, realTradingGateIsOpen } from './config.js';
import { getAllExchangeHealth, getCombinedTicker, getExchange, listExchanges } from './exchanges/exchange-manager.js';
import { analyzeTicker, combineExchangeAnalysis } from './intelligence/simple-intelligence.js';
import { evaluateTradeRisk } from './risk-engine/risk-engine.js';
import { getPaperState, openPaperTrade } from './paper-trading/paper-engine.js';

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(config.port, () => {
  console.log(`Cidentia Market Intelligence & Risk Engine running on port ${config.port}`);
  console.log(`Trading mode: ${config.tradingMode}`);
  console.log(`Real trading gate open: ${realTradingGateIsOpen()}`);
});
