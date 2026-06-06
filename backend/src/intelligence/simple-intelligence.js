export function analyzeTicker(ticker) {
  if (!ticker || ticker.ok === false) {
    return {
      exchange: ticker?.exchange,
      symbol: ticker?.symbol,
      status: 'unavailable',
      score: 0,
      regime: 'red',
      reasons: ['TICKER_UNAVAILABLE'],
    };
  }

  const reasons = [];
  const change = Number(ticker.priceChangePercent || 0);
  const quoteVolume = Number(ticker.quoteVolume || 0);

  let score = 50;

  if (Math.abs(change) > 8) {
    score -= 20;
    reasons.push('HIGH_24H_MOVE_RISK');
  } else if (Math.abs(change) > 3) {
    score += 10;
    reasons.push('ACTIVE_MARKET');
  }

  if (quoteVolume > 100000000) {
    score += 15;
    reasons.push('STRONG_LIQUIDITY');
  } else if (quoteVolume < 1000000) {
    score -= 20;
    reasons.push('LOW_LIQUIDITY');
  }

  const regime = score >= 70 ? 'green' : score >= 45 ? 'yellow' : 'red';

  return {
    exchange: ticker.exchange,
    symbol: ticker.symbol,
    lastPrice: ticker.lastPrice,
    priceChangePercent: change,
    quoteVolume,
    score,
    regime,
    reasons,
  };
}

export function combineExchangeAnalysis(analyses) {
  const valid = analyses.filter((item) => item.status !== 'unavailable');
  if (valid.length === 0) {
    return { regime: 'red', score: 0, reasons: ['NO_VALID_EXCHANGE_DATA'], exchanges: analyses };
  }

  const averageScore = valid.reduce((sum, item) => sum + item.score, 0) / valid.length;
  const regime = averageScore >= 70 ? 'green' : averageScore >= 45 ? 'yellow' : 'red';

  return {
    regime,
    score: Math.round(averageScore),
    reasons: [...new Set(valid.flatMap((item) => item.reasons))],
    exchanges: analyses,
  };
}
