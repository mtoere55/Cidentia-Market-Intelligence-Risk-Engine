import { ExchangeAdapter } from './exchange.interface.js';
import { config, realTradingGateIsOpen } from '../config.js';

function normalizeSpotTicker(data) {
  return {
    symbol: data.symbol,
    lastPrice: Number(data.lastPrice),
    priceChangePercent: Number(data.priceChangePercent),
    highPrice: Number(data.highPrice),
    lowPrice: Number(data.lowPrice),
    volume: Number(data.volume),
    quoteVolume: Number(data.quoteVolume),
  };
}

function normalizeFuturesTicker(data) {
  return {
    symbol: data.symbol,
    lastPrice: Number(data.lastPrice),
    priceChangePercent: Number(data.priceChangePercent),
    highPrice: Number(data.highPrice),
    lowPrice: Number(data.lowPrice),
    volume: Number(data.volume),
    quoteVolume: Number(data.quoteVolume),
  };
}

export class BinanceAdapter extends ExchangeAdapter {
  constructor() {
    super();
    this.baseUrl = config.binanceBaseUrl;
    this.futuresBaseUrl = config.binanceFuturesBaseUrl;
  }

  getExchangeName() {
    return 'binance';
  }

  async getHealth() {
    const startedAt = Date.now();
    const attempts = [];

    try {
      const spot = await fetch(`${this.baseUrl}/api/v3/ping`);
      attempts.push({ market: 'spot', ok: spot.ok, status: spot.status });
      if (spot.ok) {
        return {
          exchange: this.getExchangeName(),
          ok: true,
          latencyMs: Date.now() - startedAt,
          mode: 'public-read-only',
          source: 'spot',
          attempts,
        };
      }
    } catch (error) {
      attempts.push({ market: 'spot', ok: false, error: error.message });
    }

    try {
      const futures = await fetch(`${this.futuresBaseUrl}/fapi/v1/ping`);
      attempts.push({ market: 'futures', ok: futures.ok, status: futures.status });
      return {
        exchange: this.getExchangeName(),
        ok: futures.ok,
        latencyMs: Date.now() - startedAt,
        mode: 'public-read-only',
        source: futures.ok ? 'futures' : 'unavailable',
        attempts,
      };
    } catch (error) {
      attempts.push({ market: 'futures', ok: false, error: error.message });
      return {
        exchange: this.getExchangeName(),
        ok: false,
        latencyMs: Date.now() - startedAt,
        mode: 'public-read-only',
        source: 'unavailable',
        attempts,
      };
    }
  }

  async getTicker(symbol) {
    const attempts = [];

    try {
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`);
      attempts.push({ market: 'spot', ok: response.ok, status: response.status });
      if (response.ok) {
        const data = await response.json();
        return {
          exchange: this.getExchangeName(),
          source: 'spot',
          ...normalizeSpotTicker(data),
          raw: data,
        };
      }
    } catch (error) {
      attempts.push({ market: 'spot', ok: false, error: error.message });
    }

    try {
      const response = await fetch(`${this.futuresBaseUrl}/fapi/v1/ticker/24hr?symbol=${encodeURIComponent(symbol)}`);
      attempts.push({ market: 'futures', ok: response.ok, status: response.status });
      if (response.ok) {
        const data = await response.json();
        return {
          exchange: this.getExchangeName(),
          source: 'futures',
          ...normalizeFuturesTicker(data),
          raw: data,
        };
      }
      throw new Error(`Binance ticker unavailable. Attempts: ${JSON.stringify(attempts)}`);
    } catch (error) {
      throw new Error(`Binance ticker request failed after spot/futures fallback: ${error.message}`);
    }
  }

  async getCandles(symbol, interval = '1h', limit = 100) {
    const response = await fetch(`${this.baseUrl}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`);
    if (!response.ok) {
      const futuresResponse = await fetch(`${this.futuresBaseUrl}/fapi/v1/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`);
      if (!futuresResponse.ok) {
        throw new Error(`Binance candles request failed: spot ${response.status}, futures ${futuresResponse.status}`);
      }
      const rows = await futuresResponse.json();
      return rows.map((row) => ({
        openTime: row[0],
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
        volume: Number(row[5]),
        closeTime: row[6],
        source: 'futures',
      }));
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
      source: 'spot',
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
