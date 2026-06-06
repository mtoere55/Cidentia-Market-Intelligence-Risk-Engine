import { evaluateTradeRisk } from '../risk-engine/risk-engine.js';

const paperState = {
  virtualBalanceEur: 1000,
  positions: [],
  journal: [],
};

export function getPaperState() {
  return paperState;
}

export function resetPaperState() {
  paperState.positions = [];
  paperState.journal.push({
    id: `paper_reset_${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: 'PAPER_STATE_RESET',
  });
  return paperState;
}

export function openPaperTrade(order) {
  const risk = evaluateTradeRisk({
    exchange: order.exchange,
    symbol: order.symbol,
    side: order.side,
    positionSizeEur: order.positionSizeEur,
    stopLoss: order.stopLoss,
    entryPrice: order.entryPrice,
    currentDailyLossEur: 0,
    openPositions: paperState.positions.length,
  });

  const event = {
    id: `paper_${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: 'OPEN_PAPER_TRADE_ATTEMPT',
    order,
    risk,
  };

  if (!risk.accepted) {
    paperState.journal.push(event);
    return { accepted: false, event };
  }

  const position = {
    id: event.id,
    exchange: order.exchange,
    symbol: order.symbol,
    side: order.side,
    entryPrice: Number(order.entryPrice),
    stopLoss: Number(order.stopLoss),
    takeProfit: order.takeProfit ? Number(order.takeProfit) : null,
    positionSizeEur: Number(order.positionSizeEur),
    openedAt: event.createdAt,
    status: 'open',
  };

  paperState.positions.push(position);
  paperState.journal.push({ ...event, type: 'OPEN_PAPER_TRADE_ACCEPTED', position });

  return { accepted: true, position, risk };
}
