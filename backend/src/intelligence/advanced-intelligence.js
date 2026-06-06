function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (valid.length === 0) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function getValidTickers(tickers) {
  return tickers.filter((ticker) => ticker && ticker.ok !== false && Number.isFinite(Number(ticker.lastPrice)) && Number(ticker.lastPrice) > 0);
}

function pickPrimaryTicker(tickers) {
  const valid = getValidTickers(tickers);
  return valid.find((ticker) => ticker.exchange === 'bitget') || valid[0] || null;
}

function liquidityScoreFromQuoteVolume(quoteVolume) {
  const value = Number(quoteVolume || 0);
  if (value >= 500_000_000) return 100;
  if (value >= 100_000_000) return 85;
  if (value >= 25_000_000) return 70;
  if (value >= 5_000_000) return 55;
  if (value >= 1_000_000) return 40;
  if (value > 0) return 25;
  return 10;
}

function calculateSpreadPercent(validTickers) {
  const prices = validTickers.map((ticker) => Number(ticker.lastPrice));
  if (prices.length < 2) return null;
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  return ((max - min) / min) * 100;
}

function calculateRangePosition(ticker) {
  const last = Number(ticker.lastPrice);
  const high = Number(ticker.highPrice);
  const low = Number(ticker.lowPrice);

  if (!Number.isFinite(last) || !Number.isFinite(high) || !Number.isFinite(low) || high <= low) {
    return null;
  }

  return clamp((last - low) / (high - low), 0, 1);
}

function calculateRangePercent(ticker) {
  const last = Number(ticker.lastPrice);
  const high = Number(ticker.highPrice);
  const low = Number(ticker.lowPrice);

  if (!Number.isFinite(last) || !Number.isFinite(high) || !Number.isFinite(low) || last <= 0 || high <= low) {
    return null;
  }

  return ((high - low) / last) * 100;
}

function roundPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (Math.abs(n) >= 1000) return Number(n.toFixed(2));
  if (Math.abs(n) >= 100) return Number(n.toFixed(3));
  if (Math.abs(n) >= 1) return Number(n.toFixed(4));
  if (Math.abs(n) >= 0.01) return Number(n.toFixed(6));
  return Number(n.toFixed(8));
}

function marketRegimeFromScore(score, riskTier) {
  if (riskTier === 'extreme') return 'red';
  if (score >= 78) return 'green';
  if (score >= 55) return 'yellow';
  return 'red';
}

function riskTierFromMetrics({ absChange, avgRangePercent, spreadPercent, liquidityScore }) {
  if ((spreadPercent !== null && spreadPercent > 0.8) || absChange >= 15 || (avgRangePercent !== null && avgRangePercent >= 22)) {
    return 'extreme';
  }

  if ((spreadPercent !== null && spreadPercent > 0.35) || absChange >= 9 || (avgRangePercent !== null && avgRangePercent >= 14) || liquidityScore < 35) {
    return 'high';
  }

  if (absChange >= 4 || (avgRangePercent !== null && avgRangePercent >= 7) || liquidityScore < 55) {
    return 'medium';
  }

  return 'low';
}

function smartActionFromMetrics({ avgChange, absChange, avgRangePosition, liquidityScore, spreadPercent, riskTier, confidence }) {
  if (liquidityScore < 35) {
    return {
      code: 'AVOID_LOW_LIQUIDITY',
      label: 'likidite zayıf',
      direction: 'none',
      explanation: 'Hacim zayıf; manipülasyon ve slippage riski yüksek.',
    };
  }

  if (spreadPercent !== null && spreadPercent > 0.35) {
    return {
      code: 'WAIT_SPREAD_RISK',
      label: 'spread bekle',
      direction: 'none',
      explanation: 'Borsalar arası fiyat farkı fazla; önce fiyat dengesi beklenmeli.',
    };
  }

  if (riskTier === 'extreme') {
    return {
      code: 'AVOID_EXTREME_MOVE',
      label: 'çok riskli',
      direction: 'none',
      explanation: 'Hareket aşırı; sistem kovalamaz, önce sakinleşme bekler.',
    };
  }

  if (avgChange > 4 && avgRangePosition !== null && avgRangePosition > 0.88) {
    return {
      code: 'AVOID_CHASE_TOP',
      label: 'tepe kovalanmaz',
      direction: 'none',
      explanation: 'Fiyat 24s tepeye çok yakın; FOMO/pump kovalamama kuralı devrede.',
    };
  }

  if (avgChange < -4 && avgRangePosition !== null && avgRangePosition < 0.12) {
    return {
      code: 'AVOID_FALLING_KNIFE',
      label: 'düşen bıçak',
      direction: 'none',
      explanation: 'Fiyat 24s dip bölgesinde sert düşmüş; tepki gelmeden işlem yok.',
    };
  }

  if (avgChange >= 1.2 && avgChange <= 7.5 && (avgRangePosition === null || (avgRangePosition >= 0.35 && avgRangePosition <= 0.82)) && confidence >= 45) {
    return {
      code: 'LONG_WATCH',
      label: 'long izle',
      direction: 'long',
      explanation: 'Momentum pozitif ama aşırı tepede değil; sadece sanal/manual izleme adayı.',
    };
  }

  if (avgChange <= -1.2 && avgChange >= -7.5 && (avgRangePosition === null || (avgRangePosition >= 0.18 && avgRangePosition <= 0.65)) && confidence >= 45) {
    return {
      code: 'SHORT_WATCH',
      label: 'short izle',
      direction: 'short',
      explanation: 'Momentum negatif ama panik dipte değil; sadece sanal/manual izleme adayı.',
    };
  }

  if (absChange < 1.2) {
    return {
      code: 'WAIT_NO_MOMENTUM',
      label: 'momentum yok',
      direction: 'none',
      explanation: 'Yön zayıf; sistem acele etmez.',
    };
  }

  return {
    code: 'WAIT_CONFIRMATION',
    label: 'onay bekle',
    direction: 'none',
    explanation: 'Veri ilginç ama işlem için yeterince temiz değil.',
  };
}

function buildVirtualTradePlan({ symbol, primaryTicker, smartAction, riskTier, confidence }) {
  if (!primaryTicker || !['long', 'short'].includes(smartAction.direction)) {
    return {
      enabled: false,
      mode: 'sanal test',
      explanation: 'Bu coin için şu an sanal işlem planı üretilmedi; sistem beklemeyi tercih ediyor.',
    };
  }

  const last = Number(primaryTicker.lastPrice);
  const high = Number(primaryTicker.highPrice);
  const low = Number(primaryTicker.lowPrice);
  const rawRange = Number.isFinite(high) && Number.isFinite(low) && high > low ? high - low : last * 0.04;
  const safeRange = Math.max(rawRange, last * 0.01);
  const side = smartAction.direction;

  let entryLow;
  let entryHigh;
  let stopLoss;
  let takeProfit1;
  let takeProfit2;

  if (side === 'long') {
    entryLow = last - safeRange * 0.08;
    entryHigh = last + safeRange * 0.03;
    stopLoss = Math.min(low - safeRange * 0.05, last - safeRange * 0.28);
    takeProfit1 = last + safeRange * 0.22;
    takeProfit2 = last + safeRange * 0.42;
  } else {
    entryLow = last - safeRange * 0.03;
    entryHigh = last + safeRange * 0.08;
    stopLoss = Math.max(high + safeRange * 0.05, last + safeRange * 0.28);
    takeProfit1 = last - safeRange * 0.22;
    takeProfit2 = last - safeRange * 0.42;
  }

  const entryMid = (entryLow + entryHigh) / 2;
  const risk = Math.abs(entryMid - stopLoss);
  const reward = Math.abs(takeProfit1 - entryMid);
  const rr = risk > 0 ? reward / risk : null;

  let quality = 'sadece izle';
  if (confidence >= 65 && rr !== null && rr >= 0.8 && riskTier !== 'high') quality = 'sanal test uygun';
  if (confidence < 45 || riskTier === 'extreme') quality = 'bekle';

  return {
    enabled: true,
    mode: 'sanal test',
    dataSource: primaryTicker.exchange || 'bitget',
    side,
    entryZone: {
      from: roundPrice(Math.min(entryLow, entryHigh)),
      to: roundPrice(Math.max(entryLow, entryHigh)),
    },
    stopLoss: roundPrice(stopLoss),
    takeProfit1: roundPrice(takeProfit1),
    takeProfit2: roundPrice(takeProfit2),
    riskRewardToTp1: rr === null ? null : Number(rr.toFixed(2)),
    quality,
    explanation: 'Bu gerçek emir değildir. Sistem sadece fiyat buraya gelirse sanal test için izlenecek bölgeyi hesaplar.',
  };
}

export function analyzeSmartMarket({ symbol, tickers, spreadPercent = null }) {
  const validTickers = getValidTickers(tickers);
  const primaryTicker = pickPrimaryTicker(tickers);
  const unavailable = tickers.filter((ticker) => ticker && ticker.ok === false);
  const reasons = [];
  const warnings = [];

  if (validTickers.length === 0) {
    return {
      symbol,
      score: 0,
      confidence: 0,
      regime: 'red',
      riskTier: 'extreme',
      directionBias: 'none',
      primaryExchange: null,
      smartAction: {
        code: 'NO_MARKET_DATA',
        label: 'veri yok',
        direction: 'none',
        explanation: 'Hiçbir borsadan geçerli fiyat alınamadı.',
      },
      virtualTradePlan: {
        enabled: false,
        mode: 'sanal test',
        explanation: 'Veri olmadığı için sanal işlem planı üretilmedi.',
      },
      metrics: {
        validExchangeCount: 0,
        avgChange: null,
        absChange: null,
        avgRangePosition: null,
        avgRangePercent: null,
        liquidityScore: 0,
        spreadPercent,
      },
      reasons: ['NO_VALID_TICKER'],
      warnings: unavailable.map((item) => `${item.exchange}: ${item.error}`),
    };
  }

  const analysisTickers = primaryTicker ? [primaryTicker] : validTickers;
  const avgChange = average(analysisTickers.map((ticker) => Number(ticker.priceChangePercent)));
  const absChange = Math.abs(avgChange || 0);
  const avgRangePosition = average(analysisTickers.map(calculateRangePosition));
  const avgRangePercent = average(analysisTickers.map(calculateRangePercent));
  const liquidityScore = Math.round(average(analysisTickers.map((ticker) => liquidityScoreFromQuoteVolume(ticker.quoteVolume))) || 0);
  const actualSpreadPercent = spreadPercent ?? calculateSpreadPercent(validTickers);

  if (primaryTicker?.exchange === 'bitget') reasons.push('BITGET_PRIMARY_DATA');
  if (unavailable.length > 0) warnings.push(...unavailable.map((item) => `${item.exchange?.toUpperCase() || 'EXCHANGE'}_UNAVAILABLE`));

  if (liquidityScore >= 80) reasons.push('DEEP_LIQUIDITY');
  else if (liquidityScore >= 60) reasons.push('GOOD_LIQUIDITY');
  else if (liquidityScore < 35) reasons.push('LOW_LIQUIDITY');

  if (avgChange > 2) reasons.push('POSITIVE_MOMENTUM');
  if (avgChange < -2) reasons.push('NEGATIVE_MOMENTUM');
  if (absChange >= 9) reasons.push('OVEREXTENDED_MOVE');

  if (avgRangePosition !== null && avgRangePosition > 0.85) reasons.push('NEAR_24H_HIGH');
  if (avgRangePosition !== null && avgRangePosition < 0.15) reasons.push('NEAR_24H_LOW');

  if (actualSpreadPercent !== null && actualSpreadPercent > 0.35) reasons.push('EXCHANGE_SPREAD_RISK');

  const riskTier = riskTierFromMetrics({
    absChange,
    avgRangePercent,
    spreadPercent: actualSpreadPercent,
    liquidityScore,
  });

  let score = 45;
  score += liquidityScore * 0.30;
  score += Math.min(absChange, 6) * 2.0;
  score -= absChange > 8 ? (absChange - 8) * 3.5 : 0;
  score -= avgRangePercent && avgRangePercent > 12 ? (avgRangePercent - 12) * 1.8 : 0;
  score -= actualSpreadPercent && actualSpreadPercent > 0.2 ? actualSpreadPercent * 30 : 0;
  score -= riskTier === 'high' ? 8 : 0;
  score -= riskTier === 'extreme' ? 30 : 0;
  score = Math.round(clamp(score, 0, 100));

  const confidence = Math.round(clamp(
    40 + liquidityScore * 0.35 - (riskTier === 'high' ? 10 : 0) - (riskTier === 'extreme' ? 25 : 0),
    0,
    100
  ));

  const directionBias = avgChange > 1.2 ? 'long' : avgChange < -1.2 ? 'short' : 'neutral';
  const smartAction = smartActionFromMetrics({
    avgChange,
    absChange,
    avgRangePosition,
    liquidityScore,
    spreadPercent: actualSpreadPercent,
    riskTier,
    confidence,
  });

  const regime = marketRegimeFromScore(score, riskTier);
  const virtualTradePlan = buildVirtualTradePlan({
    symbol,
    primaryTicker,
    smartAction,
    riskTier,
    confidence,
  });

  return {
    symbol,
    score,
    confidence,
    regime,
    riskTier,
    directionBias,
    primaryExchange: primaryTicker?.exchange || null,
    primaryPrice: primaryTicker?.lastPrice || null,
    smartAction,
    virtualTradePlan,
    metrics: {
      validExchangeCount: validTickers.length,
      avgChange,
      absChange,
      avgRangePosition,
      avgRangePercent,
      liquidityScore,
      spreadPercent: actualSpreadPercent,
    },
    reasons,
    warnings,
  };
}
