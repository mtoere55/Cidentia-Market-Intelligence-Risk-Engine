import { getCombinedTicker } from '../exchanges/exchange-manager.js';
import { analyzeTicker, combineExchangeAnalysis } from '../intelligence/simple-intelligence.js';

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
];

function tradeDecisionFromRegime(regime, score) {
  if (regime === 'green' && score >= 70) {
    return {
      action: 'WATCH_HIGH_PRIORITY',
      label: 'izlenebilir',
      reason: 'Market score is strong, but paper/manual confirmation is still required.',
    };
  }

  if (regime === 'yellow') {
    return {
      action: 'WAIT_FOR_CONFIRMATION',
      label: 'bekle',
      reason: 'Market is active but not clean enough for automatic action.',
    };
  }

  return {
    action: 'RISKY_AVOID',
    label: 'riskli',
    reason: 'Risk score is weak or exchange data is incomplete.',
  };
}

function calculateSpreadPercent(tickers) {
  const validPrices = tickers
    .filter((item) => item && item.ok !== false && Number.isFinite(Number(item.lastPrice)) && Number(item.lastPrice) > 0)
    .map((item) => Number(item.lastPrice));

  if (validPrices.length < 2) return null;

  const max = Math.max(...validPrices);
  const min = Math.min(...validPrices);
  return ((max - min) / min) * 100;
}

export async function scanSymbol(symbol) {
  const tickers = await getCombinedTicker(symbol);
  const analyses = tickers.map(analyzeTicker);
  const combined = combineExchangeAnalysis(analyses);
  const spreadPercent = calculateSpreadPercent(tickers);
  const decision = tradeDecisionFromRegime(combined.regime, combined.score);

  return {
    symbol,
    timestamp: new Date().toISOString(),
    score: combined.score,
    regime: combined.regime,
    decision,
    spreadPercent,
    reasons: combined.reasons,
    exchanges: analyses,
    tickers,
  };
}

export async function scanMarket(symbols = DEFAULT_SCANNER_SYMBOLS) {
  const uniqueSymbols = [...new Set(symbols.map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean))];
  const limitedSymbols = uniqueSymbols.slice(0, 20);

  const results = await Promise.all(
    limitedSymbols.map(async (symbol) => {
      try {
        return await scanSymbol(symbol);
      } catch (error) {
        return {
          symbol,
          timestamp: new Date().toISOString(),
          score: 0,
          regime: 'red',
          decision: tradeDecisionFromRegime('red', 0),
          spreadPercent: null,
          reasons: ['SCAN_FAILED', error.message],
          exchanges: [],
          tickers: [],
        };
      }
    })
  );

  const sorted = results.sort((a, b) => b.score - a.score);

  return {
    ok: true,
    mode: 'read-only-paper-demo',
    count: sorted.length,
    generatedAt: new Date().toISOString(),
    symbols: limitedSymbols,
    results: sorted,
  };
}
