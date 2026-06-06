import { BinanceAdapter } from './binance.adapter.js';
import { BitgetAdapter } from './bitget.adapter.js';

const adapters = {
  binance: new BinanceAdapter(),
  bitget: new BitgetAdapter(),
};

export function getExchange(name = 'binance') {
  const key = String(name).toLowerCase();
  const adapter = adapters[key];
  if (!adapter) {
    throw new Error(`Unsupported exchange: ${name}`);
  }
  return adapter;
}

export function listExchanges() {
  return Object.keys(adapters);
}

export async function getAllExchangeHealth() {
  const results = [];
  for (const name of listExchanges()) {
    try {
      results.push(await adapters[name].getHealth());
    } catch (error) {
      results.push({ exchange: name, ok: false, error: error.message });
    }
  }
  return results;
}

export async function getCombinedTicker(symbol) {
  const results = [];
  for (const name of listExchanges()) {
    try {
      results.push(await adapters[name].getTicker(symbol));
    } catch (error) {
      results.push({ exchange: name, ok: false, symbol, error: error.message });
    }
  }
  return results;
}
