import { config, realTradingGateIsOpen } from '../config.js';

export function evaluateTradeRisk({
  exchange,
  symbol,
  side,
  positionSizeEur = config.defaultPositionSizeEur,
  stopLoss,
  entryPrice,
  currentDailyLossEur = 0,
  openPositions = 0,
}) {
  const reasons = [];

  if (!exchange) reasons.push('EXCHANGE_REQUIRED');
  if (!symbol) reasons.push('SYMBOL_REQUIRED');
  if (!['long', 'short'].includes(String(side).toLowerCase())) reasons.push('SIDE_MUST_BE_LONG_OR_SHORT');

  if (config.requireStopLoss && (stopLoss === undefined || stopLoss === null || stopLoss === '')) {
    reasons.push('STOP_LOSS_REQUIRED');
  }

  if (openPositions >= config.maxOpenPositions) {
    reasons.push('MAX_OPEN_POSITIONS_REACHED');
  }

  if (Math.abs(currentDailyLossEur) >= config.maxDailyLossEur) {
    reasons.push('MAX_DAILY_LOSS_REACHED');
  }

  let estimatedRiskEur = null;
  if (entryPrice && stopLoss && positionSizeEur) {
    const distance = Math.abs(Number(entryPrice) - Number(stopLoss));
    const riskPercent = distance / Number(entryPrice);
    estimatedRiskEur = Number(positionSizeEur) * riskPercent;
    if (estimatedRiskEur > config.maxRiskPerTradeEur) {
      reasons.push('MAX_RISK_PER_TRADE_EXCEEDED');
    }
  }

  const liveGateOpen = realTradingGateIsOpen();
  if (config.tradingMode === 'live' && !liveGateOpen) {
    reasons.push('REAL_TRADING_GATE_CLOSED');
  }

  return {
    accepted: reasons.length === 0,
    mode: config.tradingMode,
    liveGateOpen,
    exchange,
    symbol,
    side,
    positionSizeEur: Number(positionSizeEur),
    estimatedRiskEur,
    limits: {
      maxRiskPerTradeEur: config.maxRiskPerTradeEur,
      maxDailyLossEur: config.maxDailyLossEur,
      maxOpenPositions: config.maxOpenPositions,
      requireStopLoss: config.requireStopLoss,
    },
    reasons,
  };
}
