# Roadmap

## Phase 0: Safe repository foundation

- Project documentation
- Security policy
- Disclaimer
- Architecture
- Basic backend skeleton
- Paper mode as default
- Real trading locked

## Phase 1: Read-only radar

- Binance public market data adapter
- Bitget public market data adapter
- Normalized ticker endpoint
- Health endpoint
- Market status endpoint

## Phase 2: Paper trading

- Simulated positions
- Virtual balance
- Entry, stop, take-profit model
- Trade journal
- Daily report

## Phase 3: Risk engine

- Max daily loss
- Max risk per trade
- Max open positions
- Stop-loss required
- Kill switch
- Symbol allowlist
- Exchange health gate

## Phase 4: Intelligence engine

- Trend filters
- Volatility filters
- Volume filters
- Liquidity direction score
- Crowd psychology score
- Market regime mode: green, yellow, red

## Phase 5: Manual approval trading

- System proposes a trade
- User approves manually
- Execution engine sends order only after risk gate

## Phase 6: Limited semi-auto mode

- Very small test account only
- Strict daily loss
- Strict position size
- Automatic stop-loss
- Full audit logs

## Phase 7: Product dashboard

- Web UI
- Current market mode
- Open paper/live positions
- Why trade was accepted or rejected
- Daily risk report
- Exchange status
