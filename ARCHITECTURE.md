# Architecture

## Goal

Build a multi-exchange market intelligence and risk engine that starts safely in paper mode and can later support controlled execution.

## Main layers

```text
Exchange adapters
  Binance
  Bitget
        ↓
Market data normalization
        ↓
Market intelligence
        ↓
Psychology and liquidity analysis
        ↓
Market regime detection
        ↓
Risk engine
        ↓
Paper trading engine
        ↓
Execution engine, locked by default
        ↓
Audit logs and reports
```

## Three brains

### 1. Analyst

Reads market structure, price, candles, volume, volatility, liquidity, exchange differences, and signal strength.

### 2. Risk Controller

Decides whether a trade is allowed. It checks daily loss, risk per trade, stop-loss, open positions, volatility, exchange health, and account limits.

### 3. Operator

Creates paper trades or controlled live orders only when all safety gates pass.

## First version rule

The first working version must not send real orders. It must simulate and log decisions.

## Exchange adapter interface

Every exchange adapter should support the same high-level methods:

```text
getExchangeName()
getHealth()
getTicker(symbol)
getCandles(symbol, interval, limit)
getBalance()
getOpenPositions()
placeOrder(order)
cancelOrder(orderId)
```

`placeOrder` must reject live orders unless the execution safety gate is open.

## Risk gate

The risk gate is the heart of the system. No signal can bypass it.

A trade can pass only when:

- trading mode allows it
- daily loss limit is not reached
- risk per trade is inside limits
- stop-loss exists
- open position limit is not exceeded
- exchange adapter is healthy
- symbol is allowed
- kill switch is off

## Audit trail

Every decision must be logged with:

- timestamp
- exchange
- symbol
- market data snapshot
- signal score
- risk decision
- rejected or accepted reason
- paper/live mode
- final result when closed
