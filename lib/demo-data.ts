import type { Instrument, NavItem } from "./types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "⌂" }, { label: "Futures & Options", icon: "⌁", active: true },
  { label: "AI Analysis", icon: "✦", badge: "BETA" }, { label: "Watchlist", icon: "☆" },
  { label: "Signals & Alerts", icon: "⌁", badge: "0" }, { label: "Paper Trading", icon: "▣" },
  { label: "Backtesting", icon: "◌" }, { label: "Settings", icon: "⚙" }
];

export const instruments: Instrument[] = [
  { symbol: "NIFTY", name: "NIFTY 50", expiry: "28 Nov 2024", ltp: "24,221.90", change: "+0.84%", positive: true, tag: "INDEX" },
  { symbol: "BANKNIFTY", name: "NIFTY BANK", expiry: "27 Nov 2024", ltp: "51,742.30", change: "+1.12%", positive: true, tag: "INDEX" },
  { symbol: "FINNIFTY", name: "NIFTY FIN SERVICE", expiry: "26 Nov 2024", ltp: "23,184.55", change: "-0.18%", tag: "INDEX" },
  { symbol: "L&T", name: "Larsen & Toubro", expiry: "28 Nov 2024", ltp: "3,612.40", change: "+0.46%", positive: true, tag: "STOCK" }
];
