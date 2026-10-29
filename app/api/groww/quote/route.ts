import { NextResponse } from "next/server";

const serviceUrl = process.env.GROWW_SERVICE_URL ?? "http://127.0.0.1:8001";

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get("symbol") ?? "NIFTY";
  try {
    const response = await fetch(`${serviceUrl}/quote?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
    const body = await response.json().catch(() => ({ detail: "Groww service returned an invalid response." }));
    if (!response.ok) return NextResponse.json({ status: "CONNECTION ERROR", error: body.detail ?? "Groww quote request failed." }, { status: 502 });
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "DEMO DATA", error: "Groww service is unavailable; continuing in DEMO mode." }, { status: 503 });
  }
}
