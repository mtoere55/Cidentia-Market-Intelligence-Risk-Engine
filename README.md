# Cidentia Market Intelligence & Risk Engine

Cidentia Market Intelligence & Risk Engine is a safety-first multi-exchange market intelligence and risk-control system for crypto markets.

It is not designed as a guaranteed profit bot. It is designed as a controlled trading operator that can read markets, compare exchanges, generate structured signals, simulate trades, enforce strict risk limits, and only later support real execution under explicit safety gates.

## Core principle

The system must protect capital before it tries to make profit.

A good operator does not trade every signal. It waits, filters, measures risk, rejects bad market conditions, and only acts when the risk engine allows it.

## Supported exchange plan

- Binance adapter
- Bitget adapter
- Exchange manager abstraction
- Paper trading first
- Real trading disabled by default

## Safety-first stages

1. Read-only market radar
2. Paper trading engine
3. Manual approval mode
4. Small test account mode
5. Semi-automatic mode
6. Real trading only after verified logs and risk reports

## Architecture

```text
User capital / isolated exchange account
        ↓
Secure API configuration
        ↓
Exchange adapters: Binance + Bitget
        ↓
Market data normalization
        ↓
Market intelligence engine
        ↓
Liquidity / psychology / regime filters
        ↓
Risk engine
        ↓
Paper trading or execution engine
        ↓
Logs, reports, audit trail
```

## Golden rules

- Never connect a main wallet directly.
- Never enable withdrawal permission on API keys.
- Use a separate exchange sub-account or limited test account.
- Start in `paper` mode.
- Keep `ALLOW_REAL_TRADING=false` until the system is proven.
- Every trade must have a reason, stop-loss, risk amount, and audit log.

## Current state

This repository starts with the safe foundation: documentation, configuration template, exchange adapter structure, risk engine, paper-trading mode, and hard execution locks.

Real order execution is intentionally blocked in the first version.

## Quick start

```bash
cd backend
cp ../.env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:8787/health
http://localhost:8787/status
http://localhost:8787/market/BTCUSDT
```

## Important disclaimer

Crypto trading is high risk. This project does not provide financial advice and does not guarantee profit. Automated systems can fail. Users are responsible for their own risk decisions.
