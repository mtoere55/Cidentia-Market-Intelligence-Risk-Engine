import { evaluateTradeRisk } from '../risk-engine/risk-engine.js';

const paperState = {
  virtualBalanceEur: 1000,
  positions: [],
  setups: [],
  journal: [],
};

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(value, decimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Number(n.toFixed(decimals));
}

function getEntryMid(setup) {
  const from = toNumber(setup.entryZone?.from);
  const to = toNumber(setup.entryZone?.to);
  if (from === null || to === null) return null;
  return (from + to) / 2;
}

function isPriceInEntryZone(setup, price) {
  const from = toNumber(setup.entryZone?.from);
  const to = toNumber(setup.entryZone?.to);
  if (from === null || to === null || price === null) return false;
  return price >= Math.min(from, to) && price <= Math.max(from, to);
}

function calculatePnl(setup, price) {
  const entry = toNumber(setup.entryPrice) ?? getEntryMid(setup);
  const current = toNumber(price);
  const size = toNumber(setup.positionSizeEur, 0);
  if (entry === null || current === null || entry <= 0 || size <= 0) {
    return { pnlEur: 0, pnlPercent: 0 };
  }

  const pnlPercent = setup.side === 'short'
    ? ((entry - current) / entry) * 100
    : ((current - entry) / entry) * 100;

  return {
    pnlEur: round(size * (pnlPercent / 100), 2),
    pnlPercent: round(pnlPercent, 2),
  };
}

function evaluateSetupWithPrice(setup, price) {
  const current = toNumber(price);
  if (current === null || !['queued', 'active', 'tp1_hit'].includes(setup.status)) return setup;

  const updated = { ...setup, currentPrice: current, lastCheckedAt: nowIso() };

  if (updated.status === 'queued' && isPriceInEntryZone(updated, current)) {
    updated.status = 'active';
    updated.activatedAt = updated.activatedAt || nowIso();
    updated.entryPrice = current;
  }

  if (updated.status === 'queued') {
    const pnl = calculatePnl(updated, current);
    updated.unrealizedPnlEur = pnl.pnlEur;
    updated.unrealizedPnlPercent = pnl.pnlPercent;
    return updated;
  }

  const stop = toNumber(updated.stopLoss);
  const tp1 = toNumber(updated.takeProfit1);
  const tp2 = toNumber(updated.takeProfit2);
  const isShort = updated.side === 'short';
  const hitStop = stop !== null && (isShort ? current >= stop : current <= stop);
  const hitTp2 = tp2 !== null && (isShort ? current <= tp2 : current >= tp2);
  const hitTp1 = tp1 !== null && (isShort ? current <= tp1 : current >= tp1);

  if (hitStop) {
    updated.status = 'stopped';
    updated.closedAt = updated.closedAt || nowIso();
    updated.exitPrice = current;
  } else if (hitTp2) {
    updated.status = 'tp2_hit';
    updated.closedAt = updated.closedAt || nowIso();
    updated.exitPrice = current;
  } else if (hitTp1 && updated.status !== 'tp1_hit') {
    updated.status = 'tp1_hit';
    updated.tp1HitAt = updated.tp1HitAt || nowIso();
  }

  const pnl = calculatePnl(updated, current);
  updated.unrealizedPnlEur = ['stopped', 'tp2_hit'].includes(updated.status) ? 0 : pnl.pnlEur;
  updated.unrealizedPnlPercent = ['stopped', 'tp2_hit'].includes(updated.status) ? 0 : pnl.pnlPercent;
  updated.realizedPnlEur = ['stopped', 'tp2_hit'].includes(updated.status) ? pnl.pnlEur : updated.realizedPnlEur || 0;
  updated.realizedPnlPercent = ['stopped', 'tp2_hit'].includes(updated.status) ? pnl.pnlPercent : updated.realizedPnlPercent || 0;

  return updated;
}

export function getPaperState() {
  return paperState;
}

export function resetPaperState() {
  paperState.positions = [];
  paperState.setups = [];
  paperState.journal.push({
    id: `paper_reset_${Date.now()}`,
    createdAt: nowIso(),
    type: 'PAPER_STATE_RESET',
  });
  return paperState;
}

export function queueVirtualSetup(setup) {
  const symbol = String(setup.symbol || '').toUpperCase();
  const side = String(setup.side || '').toLowerCase();
  const entryZone = setup.entryZone || {};
  const stopLoss = toNumber(setup.stopLoss);
  const takeProfit1 = toNumber(setup.takeProfit1);
  const takeProfit2 = toNumber(setup.takeProfit2);
  const positionSizeEur = toNumber(setup.positionSizeEur, 0);
  const maxRiskEur = toNumber(setup.maxRiskEur, null);

  if (!symbol || !['long', 'short'].includes(side)) {
    return { accepted: false, reason: 'INVALID_SYMBOL_OR_SIDE' };
  }

  if (toNumber(entryZone.from) === null || toNumber(entryZone.to) === null || stopLoss === null || takeProfit1 === null || positionSizeEur <= 0) {
    return { accepted: false, reason: 'MISSING_ENTRY_STOP_TP_OR_SIZE' };
  }

  const duplicate = paperState.setups.find((item) => item.symbol === symbol && ['queued', 'active', 'tp1_hit'].includes(item.status));
  if (duplicate) {
    return { accepted: false, reason: 'SETUP_ALREADY_ACTIVE_OR_QUEUED', setup: duplicate };
  }

  const queued = {
    id: `setup_${Date.now()}_${symbol}`,
    symbol,
    exchange: setup.exchange || 'bitget',
    side,
    entryZone: {
      from: toNumber(entryZone.from),
      to: toNumber(entryZone.to),
    },
    entryPrice: null,
    stopLoss,
    takeProfit1,
    takeProfit2,
    positionSizeEur,
    maxRiskEur,
    riskRewardToTp1: toNumber(setup.riskRewardToTp1, null),
    sourceDecision: setup.sourceDecision || null,
    status: 'queued',
    createdAt: nowIso(),
    lastCheckedAt: null,
    currentPrice: null,
    unrealizedPnlEur: 0,
    unrealizedPnlPercent: 0,
    realizedPnlEur: 0,
    realizedPnlPercent: 0,
  };

  paperState.setups.unshift(queued);
  paperState.journal.push({ id: `queue_${Date.now()}`, createdAt: nowIso(), type: 'QUEUE_VIRTUAL_SETUP', setup: queued });
  return { accepted: true, setup: queued, state: paperState };
}

export function updateVirtualSetups(priceMap = {}) {
  const before = paperState.setups.map((item) => item.status).join('|');
  paperState.setups = paperState.setups.map((setup) => evaluateSetupWithPrice(setup, priceMap[setup.symbol]));
  const after = paperState.setups.map((item) => item.status).join('|');
  if (before !== after) {
    paperState.journal.push({ id: `refresh_${Date.now()}`, createdAt: nowIso(), type: 'REFRESH_VIRTUAL_SETUPS', priceMap });
  }
  return getPaperPerformance();
}

export function getPaperPerformance() {
  const setups = paperState.setups;
  const closed = setups.filter((item) => ['stopped', 'tp2_hit'].includes(item.status));
  const winners = closed.filter((item) => Number(item.realizedPnlEur || 0) > 0);
  const losers = closed.filter((item) => Number(item.realizedPnlEur || 0) <= 0);
  const realizedPnlEur = round(closed.reduce((sum, item) => sum + Number(item.realizedPnlEur || 0), 0), 2);
  const unrealizedPnlEur = round(setups.reduce((sum, item) => sum + Number(item.unrealizedPnlEur || 0), 0), 2);

  return {
    ok: true,
    mode: 'paper-performance-v1.1',
    generatedAt: nowIso(),
    summary: {
      queued: setups.filter((item) => item.status === 'queued').length,
      active: setups.filter((item) => item.status === 'active').length,
      tp1Hit: setups.filter((item) => item.status === 'tp1_hit').length,
      tp2Hit: setups.filter((item) => item.status === 'tp2_hit').length,
      stopped: setups.filter((item) => item.status === 'stopped').length,
      closed: closed.length,
      winners: winners.length,
      losers: losers.length,
      winRate: closed.length ? round((winners.length / closed.length) * 100, 2) : 0,
      realizedPnlEur,
      unrealizedPnlEur,
      totalPnlEur: round(realizedPnlEur + unrealizedPnlEur, 2),
    },
    setups,
    journal: paperState.journal.slice(-30),
  };
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
    createdAt: nowIso(),
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
