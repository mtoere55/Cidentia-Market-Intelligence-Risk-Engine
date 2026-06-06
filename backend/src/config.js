import dotenv from 'dotenv';

dotenv.config();

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return value;
}

function boolFromEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return String(raw).toLowerCase() === 'true';
}

export const config = {
  port: numberFromEnv('PORT', 8787),
  nodeEnv: process.env.NODE_ENV || 'development',
  tradingMode: process.env.TRADING_MODE || 'paper',
  allowRealTrading: boolFromEnv('ALLOW_REAL_TRADING', false),
  realTradingAck: process.env.REAL_TRADING_ACK || '',
  defaultExchange: process.env.DEFAULT_EXCHANGE || 'binance',
  defaultSymbol: process.env.DEFAULT_SYMBOL || 'BTCUSDT',
  defaultPositionSizeEur: numberFromEnv('DEFAULT_POSITION_SIZE_EUR', 100),
  maxRiskPerTradeEur: numberFromEnv('MAX_RISK_PER_TRADE_EUR', 1),
  maxDailyLossEur: numberFromEnv('MAX_DAILY_LOSS_EUR', 3),
  maxOpenPositions: numberFromEnv('MAX_OPEN_POSITIONS', 2),
  requireStopLoss: boolFromEnv('REQUIRE_STOP_LOSS', true),
  binanceBaseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com',
  bitgetBaseUrl: process.env.BITGET_BASE_URL || 'https://api.bitget.com',
};

export function realTradingGateIsOpen() {
  return (
    config.tradingMode === 'live' &&
    config.allowRealTrading === true &&
    config.realTradingAck === 'I_UNDERSTAND_THE_RISK'
  );
}
