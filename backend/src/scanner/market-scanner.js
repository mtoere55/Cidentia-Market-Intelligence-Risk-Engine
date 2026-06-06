import { getCombinedTicker } from '../exchanges/exchange-manager.js';
import { analyzeSmartMarket } from '../intelligence/advanced-intelligence.js';

export const DEFAULT_SCANNER_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'TRXUSDT',
  'TONUSDT',
  'DOTUSDT',
  'LTCUSDT',
  'BCHUSDT',
  'NEARUSDT',
];

function calculateSpreadPercent(tickers) {
  const validPrices = tickers
    .filter((item) => item && item.ok !== false && Number.isFinite(Number(item.lastPrice)) && Number(item.lastPrice) > 0)
    .map((item) => Number(item.lastPrice));

  if (validPrices.length < 2) return null;

  const max = Math.max(...validPrices);
  const min = Math.min(...validPrices);
  return ((max - min) / min) * 100;
}

function compactTicker(ticker) {
  if (!ticker || ticker.ok === false) {
    return {
      exchange: ticker?.exchange,
      ok: false,
      error: ticker?.error,
    };
  }

  return {
    exchange: ticker.exchange,
    ok: true,
    source: ticker.source || 'spot',
    symbol: ticker.symbol,
    lastPrice: ticker.lastPrice,
    priceChangePercent: ticker.priceChangePercent,
    highPrice: ticker.highPrice,
    lowPrice: ticker.lowPrice,
    quoteVolume: ticker.quoteVolume,
  };
}

export async function scanSymbol(symbol) {
  const tickers = await getCombinedTicker(symbol);
  const spreadPercent = calculateSpreadPercent(tickers);
  const smart = analyzeSmartMarket({ symbol, tickers, spreadPercent });

  return {
    symbol,
    timestamp: new Date().toISOString(),
    score: smart.score,
    confidence: smart.confidence,
    regime: smart.regime,
    riskTier: smart.riskTier,
    directionBias: smart.directionBias,
    decision: {
      action: smart.smartAction.code,
      label: smart.smartAction.label,
      direction: smart.smartAction.direction,
      reason: smart.smartAction.explanation,
    },
    smartAction: smart.smartAction,
    metrics: smart.metrics,
    spreadPercent: smart.metrics.spreadPercent,
    reasons: smart.reasons,
    warnings: smart.warnings,
    tickers: tickers.map(compactTicker),
  };
}

export async function scanMarket(symbols = DEFAULT_SCANNER_SYMBOLS) {
  const uniqueSymbols = [...new Set(symbols.map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean))];
  const limitedSymbols = uniqueSymbols.slice(0, 25);

  const results = await Promise.all(
    limitedSymbols.map(async (symbol) => {
      try {
        return await scanSymbol(symbol);
      } catch (error) {
        return {
          symbol,
          timestamp: new Date().toISOString(),
          score: 0,
          confidence: 0,
          regime: 'red',
          riskTier: 'extreme',
          directionBias: 'none',
          decision: {
            action: 'SCAN_FAILED',
            label: 'tarama hatası',
            direction: 'none',
            reason: error.message,
          },
          smartAction: {
            code: 'SCAN_FAILED',
            label: 'tarama hatası',
            direction: 'none',
            explanation: error.message,
          },
          metrics: {},
          spreadPercent: null,
          reasons: ['SCAN_FAILED'],
          warnings: [error.message],
          tickers: [],
        };
      }
    })
  );

  const sorted = results.sort((a, b) => {
    const actionWeight = (item) => {
      if (item.decision.action === 'LONG_WATCH' || item.decision.action === 'SHORT_WATCH') return 20;
      if (item.decision.action === 'WAIT_CONFIRMATION') return 5;
      return 0;
    };
    return (b.score + actionWeight(b)) - (a.score + actionWeight(a));
  });

  const summary = {
    longWatch: sorted.filter((item) => item.decision.action === 'LONG_WATCH').length,
    shortWatch: sorted.filter((item) => item.decision.action === 'SHORT_WATCH').length,
    wait: sorted.filter((item) => item.decision.action.startsWith('WAIT')).length,
    avoid: sorted.filter((item) => item.decision.action.startsWith('AVOID')).length,
    green: sorted.filter((item) => item.regime === 'green').length,
    yellow: sorted.filter((item) => item.regime === 'yellow').length,
    red: sorted.filter((item) => item.regime === 'red').length,
  };

  return {
    ok: true,
    mode: 'smart-read-only-paper-demo',
    version: '0.3-smart-radar',
    count: sorted.length,
    generatedAt: new Date().toISOString(),
    symbols: limitedSymbols,
    summary,
    results: sorted,
  };
}
