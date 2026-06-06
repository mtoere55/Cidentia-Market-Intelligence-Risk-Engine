export class ExchangeAdapter {
  getExchangeName() {
    throw new Error('getExchangeName() not implemented');
  }

  async getHealth() {
    throw new Error('getHealth() not implemented');
  }

  async getTicker(symbol) {
    throw new Error('getTicker(symbol) not implemented');
  }

  async getCandles(symbol, interval = '1h', limit = 100) {
    throw new Error('getCandles(symbol, interval, limit) not implemented');
  }

  async getBalance() {
    throw new Error('getBalance() not implemented');
  }

  async getOpenPositions() {
    throw new Error('getOpenPositions() not implemented');
  }

  async placeOrder(order) {
    throw new Error('placeOrder(order) not implemented');
  }

  async cancelOrder(orderId) {
    throw new Error('cancelOrder(orderId) not implemented');
  }
}
