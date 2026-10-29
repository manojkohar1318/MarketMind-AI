import { describe, expect, it } from "vitest";
import { createDemoCandles, type Candle } from "../lib/market-data";
import { averageTrueRange, bollingerBands, calculateIndicators, exponentialMovingAverage, relativeStrengthIndex, volumeWeightedAveragePrice } from "../lib/indicators";
import { analyzeSignal, evaluateSignal, type SignalEngineConfig } from "../lib/signals";
import { validatePaperTrade } from "../lib/risk";

const candles = (closes: number[], volumes = closes.map(() => 10), sessions?: string[]): Candle[] => closes.map((close, i) => ({ time: i + 1, open: close - 1, high: close + 2, low: close - 2, close, volume: volumes[i], session: sessions?.[i] }));
const signalConfig: SignalEngineConfig = { underlying: "TEST", timeframe: "15m", minCandles: 60, staleAfterSeconds: 0, maxAtrPct: 1, minConfirmations: 3, now: 1000, settings: { ema: [9, 20, 50, 200], rsi: 14, macdFast: 12, macdSlow: 26, macdSignal: 9, bollingerPeriod: 20, bollingerStdDev: 2, atr: 14 } };
const directionalCandles = (direction: 1 | -1) => { const result = candles(Array.from({ length: 220 }, (_, i) => 100 + direction * i * .08 + Math.sin(i / 2) * 1.4), Array.from({ length: 220 }, (_, i) => 100 + (i % 8) * 5 + (i > 200 ? 20 : 0))); return direction === -1 ? result.map((c) => ({ ...c, open: c.close + 1 })) : result; };
describe("technical indicators", () => {
  it("uses SMA seed then alpha for EMA", () => expect(exponentialMovingAverage([1, 2, 3, 4], 3)).toEqual([null, null, 2, 3]));
  it("does not fabricate EMA before enough values", () => expect(exponentialMovingAverage([1, null, 3], 3)).toEqual([null, null, null]));
  it("calculates Wilder RSI with a bounded value", () => { const result = relativeStrengthIndex(candles([1, 2, 3, 2, 3, 4]), 3); expect(result.slice(0, 3)).toEqual([null, null, null]); expect(result[3]).toBeCloseTo(66.6667, 3); });
  it("calculates MACD and configured indicator arrays", () => { const result = calculateIndicators(createDemoCandles()); expect(result.ema[9]).toHaveLength(120); expect(result.macdHistogram.length).toBe(120); expect(result.rsi.at(-1)).toBeGreaterThanOrEqual(0); });
  it("calculates Bollinger bands from the period window", () => { const result = bollingerBands([1, 2, 3, 4], 2, 2); expect(result.middle[0]).toBeNull(); expect(result.middle[1]).toBe(1.5); expect(result.upper[1]).toBeCloseTo(2.5, 5); });
  it("resets VWAP when the session changes and handles zero volume", () => { const result = volumeWeightedAveragePrice(candles([10, 12, 20], [10, 10, 0], ["a", "a", "b"])); expect(result[1]).toBeCloseTo(11); expect(result[2]).toBeNull(); });
  it("uses Wilder ATR smoothing and preserves insufficient gaps", () => { const result = averageTrueRange(candles([10, 11, 13, 12]), 3); expect(result.slice(0, 2)).toEqual([null, null]); expect(result[2]).toBe(4); expect(result[3]).toBeCloseTo(4, 5); });
  it("returns transparent rule-based signals and risk decisions", () => { const signal = analyzeSignal(createDemoCandles()); expect(["BUY", "SELL/EXIT", "NO TRADE"]).toContain(signal.type); expect(signal.demo).toBe(true); expect(validatePaperTrade(100, 90, 1000).accepted).toBe(false); });
  it("returns a BUY candidate only with multiple confirmations", () => { const result = evaluateSignal(directionalCandles(1), signalConfig); expect(result.type).toBe("BUY CANDIDATE"); expect(result.demo).toBe(true); expect(result.invalidationLevel).not.toBeNull(); expect(result.riskReward).toBe(2); });
  it("returns a SELL/EXIT candidate for a bearish sequence", () => { const result = evaluateSignal(directionalCandles(-1), signalConfig); expect(result.type).toBe("SELL/EXIT CANDIDATE"); expect(result.targetLevels.length).toBe(1); });
  it("returns NO TRADE for insufficient and invalid data", () => { expect(evaluateSignal(candles([1, 2, 3]), signalConfig).type).toBe("NO TRADE"); const invalid = directionalCandles(1); invalid[200].close = Number.NaN; const result = evaluateSignal(invalid, signalConfig); expect(result.type).toBe("NO TRADE"); expect(result.risks[0]).toMatch(/invalid/i); });
  it("returns NO TRADE when evidence conflicts", () => { const mixed = directionalCandles(1); mixed[mixed.length - 1] = { ...mixed.at(-1)!, open: mixed.at(-1)!.close + 8, close: mixed.at(-1)!.close - 8 }; const result = evaluateSignal(mixed, signalConfig); expect(result.type).toBe("NO TRADE"); expect(result.conflicts.length + result.risks.length).toBeGreaterThan(0); });
});
