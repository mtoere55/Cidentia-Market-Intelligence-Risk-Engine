# Security Policy

## API key rules

The system must never require withdrawal permission.

Recommended exchange API permissions:

- Read market/account data
- Trade permission only after paper mode is proven
- Withdrawal permission: disabled
- IP whitelist: enabled where possible
- Separate sub-account or limited test account
- Limited funds only

## Secret handling

Never commit real API keys, secrets, passphrases, wallet private keys, seed phrases, or credentials to GitHub.

Use `.env` locally and keep it out of Git.

The repository contains `.env.example` only.

## Real trading lock

Real trading must be blocked unless all of these are true:

```text
TRADING_MODE=live
ALLOW_REAL_TRADING=true
REAL_TRADING_ACK=I_UNDERSTAND_THE_RISK
```

Even then, the risk engine must enforce:

- maximum daily loss
- maximum risk per trade
- maximum open positions
- stop-loss requirement
- kill switch
- audit logging

## Incident response

If an API key is exposed:

1. Disable/delete the key at the exchange immediately.
2. Create a new key.
3. Review exchange account logs.
4. Rotate `.env` locally.
5. Check repository history before pushing anything else.

## Safe development default

Default mode is paper trading. Real order execution is intentionally disabled in early versions.
