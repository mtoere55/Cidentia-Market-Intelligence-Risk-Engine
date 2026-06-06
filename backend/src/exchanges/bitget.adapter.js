import { ExchangeAdapter } from './exchange.interface.js';
import { config, realTradingGateIsOpen } from '../config.js';

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

  async getTicker(symbol) {
    const bitgetSymbol = symbol.replace('USDT', 'USDT');
    const response = await fetch(`${this.baseUrl}/api/v2/spot/market/tickers?symbol=${encodeURIComponent(bitgetSymbol)}`);
    if (!response.ok) {
      throw new Error(`Bitget ticker request failed: ${response.status}`);
    }
    const payload = await response.json();
    const item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!item) {
      throw new Error(`Bitget ticker not found for ${symbol}`);
    }
    return {
      exchange: this.getExchangeName(),
      symbol: item.symbol || symbol,
      lastPrice: Number(item.lastPr || item.close || item.price || 0),
      priceChangePercent: Number(item.change24h || 0) * 100,
      highPrice: Number(item.high24h || 0),
      lowPrice: Number(item.low24h || 0),
      volume: Number(item.baseVolume || 0),
      quoteVolume: Number(item.quoteVolume || 0),
      raw: payload,
    };
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
