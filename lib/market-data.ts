export type Timeframe = "1m" | "5m" | "15m" | "1h" | "1D";
export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number; session?: string };
export type MarketInstrument = { symbol: string; name: string; exchange: "NSE"; category: "INDEX" | "STOCK"; lotSize: number; expiries: string[]; demo: true };
export type OptionQuote = { strike: number; call: { ltp: number; bid: number; ask: number; volume: number; oi: number; oiChange: number; iv: number }; put: { ltp: number; bid: number; ask: number; volume: number; oi: number; oiChange: number; iv: number } };

const symbols = ["NIFTY", "BANKNIFTY", "FINNIFTY", "RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TCS", "LT"];
export const demoInstruments: MarketInstrument[] = symbols.map((symbol, index) => ({ symbol, name: ["NIFTY 50", "NIFTY BANK", "NIFTY FIN SERVICE", "Reliance Industries", "HDFC Bank", "ICICI Bank", "Infosys", "TCS", "Larsen & Toubro"][index], exchange: "NSE", category: index < 3 ? "INDEX" : "STOCK", lotSize: index === 1 ? 15 : index < 3 ? 25 : 100, expiries: ["28 Nov 2024", "05 Dec 2024", "26 Dec 2024"], demo: true }));

export interface MarketDataProvider { getInstruments(): Promise<MarketInstrument[]>; getCandles(symbol: string, timeframe: Timeframe): Promise<Candle[]>; getOptionChain(symbol: string, expiry: string): Promise<OptionQuote[]>; }

export function createDemoCandles(count = 120, seed = 0, intervalSeconds = 900): Candle[] { return Array.from({ length: count }, (_, i) => { const base = 24000 + seed * 37 + Math.sin((i + seed) / 8) * 180 + i * 1.4; const open = base + Math.sin((i + seed) * 1.7) * 24; const close = base + Math.cos((i + seed) / 3) * 22; return { time: 1732185600 + i * intervalSeconds, open, high: Math.max(open, close) + 35 + (i % 7), low: Math.min(open, close) - 30 - (i % 5), close, volume: 90000 + ((i + seed) % 11) * 14500 }; }); }

export const demoProvider: MarketDataProvider = { async getInstruments() { return demoInstruments; }, async getCandles(symbol, timeframe) { const seed = Array.from(symbol).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 97; const interval = timeframe === "1m" ? 60 : timeframe === "5m" ? 300 : timeframe === "1h" ? 3600 : timeframe === "1D" ? 86400 : 900; return createDemoCandles(120, seed, interval); }, async getOptionChain(_, __) { return [24000, 24100, 24200, 24300, 24400].map((strike, i) => ({ strike, call: { ltp: 210 - i * 18, bid: 208 - i * 18, ask: 212 - i * 18, volume: 120000 + i * 4300, oi: 320000 + i * 18000, oiChange: i * 2.4, iv: 13.8 + i * .4 }, put: { ltp: 150 + i * 15, bid: 148 + i * 15, ask: 152 + i * 15, volume: 112000 + i * 3900, oi: 280000 + i * 22000, oiChange: -i * 1.8, iv: 14.2 + i * .3 } })); } };

