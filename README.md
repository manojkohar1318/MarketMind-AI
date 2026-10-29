# MarketMind AI

MarketMind AI is an independent Phase 1 prototype for an Indian Futures & Options research terminal.

## Scope

- Dark, responsive Next.js App Router interface
- F&O explorer for NIFTY, BANK NIFTY, FINNIFTY, and L&T demo instruments
- Illustrative candlestick chart, volume, option chain, and analysis panel
- Explicit DEMO labels throughout

There is no live market feed, broker connection, API credential, order execution, or working AI signal engine in this phase. All displayed values are illustrative placeholders.

## Data-provider architecture

`lib/market-data.ts` defines the typed `MarketDataProvider` interface. `demoProvider` is the only provider enabled today and returns deterministic DEMO candles and option quotes. A future Angel One SmartAPI, Groww, or other authorized provider should implement this interface behind a secure server-side route, keep credentials in environment variables, validate the official instrument master, and never expose broker secrets to the browser.

Indicator calculations live in `lib/indicators.ts`; rule-based educational signals live in `lib/signals.ts`; paper-trade risk checks live in `lib/risk.ts`. No real orders are possible.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional Groww read-only quote adapter

The first Groww milestone is server-side only and never places orders. Start the adapter with Python 3.9+ and an isolated environment:

```bash
python -m venv services/groww-api/.venv
services/groww-api/.venv/Scripts/pip install -r services/groww-api/requirements.txt
services/groww-api/.venv/Scripts/uvicorn services.groww-api.main:app --port 8000
```

The Next.js UI calls `/api/groww/quote`, which proxies to the adapter. `GROWW_API_KEY` and `GROWW_API_SECRET` are read only by the Python service from the root `.env.local`. The UI remains DEMO DATA until an authenticated Groww quote succeeds. Groww API-key/secret access requires an active subscription and daily approval.

## Verification

```bash
npm run lint
npm run type-check
npm run build
```
