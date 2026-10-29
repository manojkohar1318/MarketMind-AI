import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query

load_dotenv(Path(__file__).resolve().parents[2] / ".env.local")
app = FastAPI(title="MarketMind Groww Read-only Adapter")


def sanitized_error(exc: Exception) -> str:
    message = str(exc).lower()
    if "401" in message or "403" in message or "auth" in message or "token" in message:
        return "Groww authentication or approval failed. Verify API approval and permissions."
    if "rate" in message or "429" in message:
        return "Groww rate limit reached. Try again later."
    if "timeout" in message or "timed out" in message:
        return "Groww request timed out."
    return "Groww quote request failed. Verify the instrument and API permissions."


def get_quote(symbol: str) -> dict[str, Any]:
    api_key = os.getenv("GROWW_API_KEY")
    api_secret = os.getenv("GROWW_API_SECRET")
    if not api_key or not api_secret:
        raise RuntimeError("Groww credentials are not configured")
    try:
        from growwapi import GrowwAPI

        access_token = GrowwAPI.get_access_token(api_key=api_key, secret=api_secret)
        groww = GrowwAPI(access_token)
        payload = groww.get_quote(
            exchange=groww.EXCHANGE_NSE,
            segment=groww.SEGMENT_CASH,
            trading_symbol=symbol,
        )
        if not isinstance(payload, dict) or not payload.get("last_price"):
            raise RuntimeError("Malformed quote response")
        return {
            "provider": "Groww",
            "status": "LIVE DATA",
            "symbol": symbol,
            "lastPrice": payload.get("last_price"),
            "dayChange": payload.get("day_change"),
            "dayChangePercent": payload.get("day_change_perc"),
            "volume": payload.get("volume"),
            "openInterest": payload.get("open_interest"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        raise HTTPException(status_code=502, detail=sanitized_error(exc)) from None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/quote")
def quote(symbol: str = Query(default="NIFTY", min_length=1, max_length=40)) -> dict[str, Any]:
    return get_quote(symbol.upper())
