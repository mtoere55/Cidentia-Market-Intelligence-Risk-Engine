import { ExchangeAdapter } from './exchange.interface.js';
import { config, realTradingGateIsOpen } from '../config.js';

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBitgetTicker(item, fallbackSymbol = '') {
  return {
    exchange: 'bitget',
    symbol: item.symbol || fallbackSymbol,
    lastPrice: toNumber(item.lastPr || item.close || item.price || 0),
    priceChangePercent: toNumber(item.change24h || 0) * 100,
    highPrice: toNumber(item.high24h || 0),
    lowPrice: toNumber(item.low24h || 0),
    volume: toNumber(item.baseVolume || 0),
    quoteVolume: toNumber(item.quoteVolume || 0),
    raw: item,
  };
}

function isAllowedUsdtSymbol(symbol) {
  const s = String(symbol || '').toUpperCase();
  if (!s.endsWith('USDT')) return false;
  const blocked = new Set([
    'USDCUSDT',
    'BUSDUSDT',
    'DAIUSDT',
    'FDUSDUSDT',
    'TUSDUSDT',
    'EURUSDT',
    'TRYUSDT',
  ]);
  if (blocked.has(s)) return false;
  if (s.includes('3L') || s.includes('3S') || s.includes('5L') || s.includes('5S')) return false;
  return true;
}

export class BitgetAdapter extends ExchangeAdapter {
  constructor() {
    super();
    this.baseUrl = config.bitgetBaseUrl;
  }

  getExchangeName() {
    return 'bitget';
  }

  async getHealth() {
    const startedAt = Date.now();
    const response = await fetch(`${this.baseUrl}/api/v2/public/time`);
    return {
      exchange: this.getExchangeName(),
      ok: response.ok,
      latencyMs: Date.now() - startedAt,
      mode: 'public-read-only',
    };
  }

  async getAllTickers() {
    const response = await fetch(`${this.baseUrl}/api/v2/spot/market/tickers`);
    if (!response.ok) {
      throw new Error(`Bitget all tickers request failed: ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload.data) ? payload.data : [];
    return rows.map((item) => normalizeBitgetTicker(item, item.symbol));
  }

  async getTopSymbols(limit = 40) {
    const all = await this.getAllTickers();
    return all
      .filter((ticker) => isAllowedUsdtSymbol(ticker.symbol))
      .filter((ticker) => Number.isFinite(ticker.lastPrice) && ticker.lastPrice > 0)
      .sort((a, b) => b.quoteVolume - a.quoteVolume)
      .slice(0, Math.max(1, Math.min(Number(limit) || 40, 100)))
      .map((ticker) => ticker.symbol);
  }

  async getTicker(symbol) {
    const bitgetSymbol = String(symbol || '').toUpperCase();
    const response = await fetch(`${this.baseUrl}/api/v2/spot/market/tickers?symbol=${encodeURIComponent(bitgetSymbol)}`);
    if (!response.ok) {
      throw new Error(`Bitget ticker request failed: ${response.status}`);
    }
    const payload = await response.json();
    const item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!item) {
      throw new Error(`Bitget ticker not found for ${symbol}`);
    }
    return normalizeBitgetTicker(item, bitgetSymbol);
  }

  async getCandles(symbol, interval = '1h', limit = 100) {
    return {
      exchange: this.getExchangeName(),
      symbol,
      interval,
      limit,
      candles: [],
      note: 'Bitget candles adapter placeholder. Public ticker is implemented first.',
    };
  }

  async getBalance() {
    return { exchange: this.getExchangeName(), mode: 'not-connected', balances: [] };
  }

  async getOpenPositions() {
    return { exchange: this.getExchangeName(), mode: 'not-connected', positions: [] };
  }

  async placeOrder(order) {
    if (!realTradingGateIsOpen()) {
      return {
        accepted: false,
        exchange: this.getExchangeName(),
        reason: 'REAL_TRADING_GATE_CLOSED',
        order,
      };
    }
    throw new Error('Live Bitget order execution is not implemented in this safe foundation version.');
  }

  async cancelOrder(orderId) {
    if (!realTradingGateIsOpen()) {
      return {
        accepted: false,
        exchange: this.getExchangeName(),
        reason: 'REAL_TRADING_GATE_CLOSED',
        orderId,
      };
    }
    throw new Error('Live Bitget cancel execution is not implemented in this safe foundation version.');
  }
}
