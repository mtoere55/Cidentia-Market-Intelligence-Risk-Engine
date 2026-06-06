import { getBitgetTopSymbols, getCombinedTicker } from '../exchanges/exchange-manager.js';
import { analyzeSmartMarket } from '../intelligence/advanced-intelligence.js';
import { attachOperatorAdvice, buildOperatorSummary } from '../operator/operator-advice.js';

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

function opportunityTier(item) {
  const rr = Number(item.virtualTradePlan?.riskRewardToTp1 || 0);
  const confidence = Number(item.confidence || 0);
  if (item.virtualTradePlan?.quality === 'sanal test uygun' && rr >= 1.5 && confidence >= 65) return 'güçlü aday';
  if (item.virtualTradePlan?.quality === 'sanal test uygun') return 'sanal aday';
  if (rr > 0 && rr < 1) return 'risk/ödül zayıf';
  if (item.decision?.action === 'LONG_WATCH' || item.decision?.action === 'SHORT_WATCH') return 'izle';
  return 'bekle';
}

function moneyManagementPlan(item, accountSizeEur = 100, riskPercent = 2) {
  const plan = item.virtualTradePlan;
  if (!plan?.enabled || !plan.entryZone || !plan.stopLoss) {
    return {
      enabled: false,
      explanation: 'Sanal para yönetimi için uygun giriş/stop planı yok.',
    };
  }

  const entryMid = (Number(plan.entryZone.from) + Number(plan.entryZone.to)) / 2;
  const stop = Number(plan.stopLoss);
  const stopDistancePercent = Math.abs(entryMid - stop) / entryMid;
  const maxRiskEur = Number(accountSizeEur) * (Number(riskPercent) / 100);
  const suggestedPositionEur = stopDistancePercent > 0 ? maxRiskEur / stopDistancePercent : 0;
  const cappedPositionEur = Math.max(0, Math.min(suggestedPositionEur, Number(accountSizeEur)));

  return {
    enabled: true,
    accountSizeEur: Number(accountSizeEur),
    riskPercent: Number(riskPercent),
    maxRiskEur: Number(maxRiskEur.toFixed(2)),
    stopDistancePercent: Number((stopDistancePercent * 100).toFixed(2)),
    suggestedPositionEur: Number(cappedPositionEur.toFixed(2)),
    explanation: 'Bu gerçek emir değildir. Hesap, sanal testte en fazla kaç euro riske gireceğini gösterir.',
  };
}

function buildTopLists(results) {
  const ranked = [...results].sort((a, b) => {
    const rrA = Number(a.virtualTradePlan?.riskRewardToTp1 || 0);
    const rrB = Number(b.virtualTradePlan?.riskRewardToTp1 || 0);
    const opA = Number(a.operatorAdvice?.priority || 0);
    const opB = Number(b.operatorAdvice?.priority || 0);
    return (b.score + b.confidence + rrB * 20 + opB) - (a.score + a.confidence + rrA * 20 + opA);
  });

  return {
    topOpportunities: ranked
      .filter((item) => item.decision.action === 'LONG_WATCH' || item.decision.action === 'SHORT_WATCH')
      .slice(0, 5)
      .map((item) => ({
        symbol: item.symbol,
        score: item.score,
        confidence: item.confidence,
        direction: item.directionBias,
        risk: item.riskTier,
        rr: item.virtualTradePlan?.riskRewardToTp1 ?? null,
        plan: opportunityTier(item),
        operator: item.operatorAdvice?.label || null,
      })),
    highestRisk: ranked
      .filter((item) => item.riskTier === 'high' || item.riskTier === 'extreme' || item.decision.action.startsWith('AVOID'))
      .slice(0, 5)
      .map((item) => ({
        symbol: item.symbol,
        score: item.score,
        direction: item.directionBias,
        risk: item.riskTier,
        decision: item.decision.label,
        operator: item.operatorAdvice?.label || null,
      })),
  };
}

export async function scanSymbol(symbol, moneyOptions = {}) {
  const tickers = await getCombinedTicker(symbol);
  const spreadPercent = calculateSpreadPercent(tickers);
  const smart = analyzeSmartMarket({ symbol, tickers, spreadPercent });
  const baseItem = {
    symbol,
    timestamp: new Date().toISOString(),
    score: smart.score,
    confidence: smart.confidence,
    regime: smart.regime,
    riskTier: smart.riskTier,
    directionBias: smart.directionBias,
    primaryExchange: smart.primaryExchange,
    primaryPrice: smart.primaryPrice,
    decision: {
      action: smart.smartAction.code,
      label: smart.smartAction.label,
      direction: smart.smartAction.direction,
      reason: smart.smartAction.explanation,
    },
    smartAction: smart.smartAction,
    virtualTradePlan: smart.virtualTradePlan,
    metrics: smart.metrics,
    spreadPercent: smart.metrics.spreadPercent,
    reasons: smart.reasons,
    warnings: smart.warnings,
    tickers: tickers.map(compactTicker),
  };

  return {
    ...baseItem,
    opportunityTier: opportunityTier(baseItem),
    moneyManagement: moneyManagementPlan(baseItem, moneyOptions.accountSizeEur, moneyOptions.riskPercent),
  };
}

async function resolveSymbols({ symbols, mode, limit }) {
  if (Array.isArray(symbols) && symbols.length > 0) {
    return {
      source: 'custom-symbols',
      symbols,
    };
  }

  if (mode === 'top-bitget') {
    try {
      const topSymbols = await getBitgetTopSymbols(limit);
      return {
        source: 'bitget-top-volume-usdt',
        symbols: topSymbols,
      };
    } catch (error) {
      return {
        source: 'fallback-default-symbols',
        symbols: DEFAULT_SCANNER_SYMBOLS,
        warning: error.message,
      };
    }
  }

  return {
    source: 'default-fixed-symbols',
    symbols: DEFAULT_SCANNER_SYMBOLS,
  };
}

export async function scanMarket(options = {}) {
  const inputSymbols = Array.isArray(options.symbols) ? options.symbols : [];
  const mode = options.mode || 'top-bitget';
  const limit = Math.max(1, Math.min(Number(options.limit) || 40, 80));
  const accountSizeEur = Number(options.accountSizeEur || 100);
  const riskPercent = Number(options.riskPercent || 2);

  const resolved = await resolveSymbols({ symbols: inputSymbols, mode, limit });
  const uniqueSymbols = [...new Set(resolved.symbols.map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean))];
  const limitedSymbols = uniqueSymbols.slice(0, limit);

  const rawResults = await Promise.all(
    limitedSymbols.map(async (symbol) => {
      try {
        return await scanSymbol(symbol, { accountSizeEur, riskPercent });
      } catch (error) {
        return {
          symbol,
          timestamp: new Date().toISOString(),
          score: 0,
          confidence: 0,
          regime: 'red',
          riskTier: 'extreme',
          directionBias: 'none',
          primaryExchange: null,
          primaryPrice: null,
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
          virtualTradePlan: {
            enabled: false,
            mode: 'sanal test',
            explanation: error.message,
          },
          opportunityTier: 'tarama hatası',
          moneyManagement: { enabled: false, explanation: error.message },
          metrics: {},
          spreadPercent: null,
          reasons: ['SCAN_FAILED'],
          warnings: [error.message],
          tickers: [],
        };
      }
    })
  );

  const advised = attachOperatorAdvice(rawResults);

  const sorted = advised.sort((a, b) => {
    const actionWeight = (item) => {
      if (item.operatorAdvice?.operatorAction === 'VIRTUAL_TEST_STRONG') return 60;
      if (item.operatorAdvice?.operatorAction === 'VIRTUAL_TEST_SMALL') return 45;
      if (item.opportunityTier === 'güçlü aday') return 45;
      if (item.opportunityTier === 'sanal aday') return 30;
      if (item.decision.action === 'LONG_WATCH' || item.decision.action === 'SHORT_WATCH') return 20;
      if (item.decision.action === 'WAIT_CONFIRMATION') return 5;
      return 0;
    };
    return (b.score + b.confidence + actionWeight(b)) - (a.score + a.confidence + actionWeight(a));
  });

  const summary = {
    longWatch: sorted.filter((item) => item.decision.action === 'LONG_WATCH').length,
    shortWatch: sorted.filter((item) => item.decision.action === 'SHORT_WATCH').length,
    wait: sorted.filter((item) => item.decision.action.startsWith('WAIT')).length,
    avoid: sorted.filter((item) => item.decision.action.startsWith('AVOID')).length,
    virtualReady: sorted.filter((item) => item.virtualTradePlan?.quality === 'sanal test uygun').length,
    strongCandidates: sorted.filter((item) => item.opportunityTier === 'güçlü aday').length,
    operatorStrongVirtual: sorted.filter((item) => item.operatorAdvice?.operatorAction === 'VIRTUAL_TEST_STRONG').length,
    operatorSmallVirtual: sorted.filter((item) => item.operatorAdvice?.operatorAction === 'VIRTUAL_TEST_SMALL').length,
    operatorWatchOnly: sorted.filter((item) => item.operatorAdvice?.operatorAction === 'WATCH_ONLY').length,
    operatorAvoid: sorted.filter((item) => item.operatorAdvice?.operatorAction === 'AVOID').length,
    green: sorted.filter((item) => item.regime === 'green').length,
    yellow: sorted.filter((item) => item.regime === 'yellow').length,
    red: sorted.filter((item) => item.regime === 'red').length,
  };

  return {
    ok: true,
    mode: 'bitget-operator-decision-demo',
    version: '0.7-operator-advice-engine',
    explanation: 'Sistem Bitget USDT piyasasında hacimli coinleri tarar ve her coin için “ben olsam ne yapardım?” kararını üretir. Sanal işlem gerçek para kullanmaz.',
    scannerSource: resolved.source,
    scannerWarning: resolved.warning || null,
    accountModel: {
      accountSizeEur,
      riskPercent,
      explanation: 'Para yönetimi hesabı sanaldır. Gerçek borsa emri açmaz.',
    },
    count: sorted.length,
    generatedAt: new Date().toISOString(),
    symbols: limitedSymbols,
    summary,
    operatorSummary: buildOperatorSummary(sorted),
    topLists: buildTopLists(sorted),
    results: sorted,
  };
}
