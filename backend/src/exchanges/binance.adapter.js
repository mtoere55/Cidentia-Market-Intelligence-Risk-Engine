import { ExchangeAdapter } from './exchange.interface.js';
import { config, realTradingGateIsOpen } from '../config.js';

export class BinanceAdapter extends ExchangeAdapter {
  constructor() {
    super();
    this.baseUrl = config.binanceBaseUrl;
  }

  getExchangeName() {
    return 'binance';
  }

  async getHealth() {
    const startedAt = Date.now();
    const response = await fetch(`${this.baseUrl}/api/v3/ping`);
    return {
      exchange: this.getExchangeName(),
      ok: response.ok,
      latencyMs: Date.now() - startedAt,
      mode: 'public-read-only',
    };
  }

  async getTicker(symbol) {
    const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`);
    if (!response.ok) {
      throw new Error(`Binance ticker request failed: ${response.status}`);
    }
    const data = await response.json();
    return {
      exchange: this.getExchangeName(),
      symbol: data.symbol,
      lastPrice: Number(data.lastPrice),
      priceChangePercent: Number(data.priceChangePercent),
      highPrice: Number(data.highPrice),
      lowPrice: Number(data.lowPrice),
      volume: Number(data.volume),
      quoteVolume: Number(data.quoteVolume),
      raw: data,
    };
  }

  async getCandles(symbol, interval = '1h', limit = 100) {
    const response = await fetch(`${this.baseUrl}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Binance candles request failed: ${response.status}`);
    }
    const rows = await response.json();
    return rows.map((row) => ({
      openTime: row[0],
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
      closeTime: row[6],
    }));
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
    throw new Error('Live Binance order execution is not implemented in this safe foundation version.');
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
    throw new Error('Live Binance cancel execution is not implemented in this safe foundation version.');
  }
}
