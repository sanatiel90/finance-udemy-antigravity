"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Repeat,
  LineChart,
  RefreshCw,
  Wallet,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Income", href: "/income", icon: TrendingUp },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Subscriptions", href: "/subscriptions", icon: Repeat },
    { name: "Portfolio", href: "/portfolio", icon: LineChart },
  ];

  const handleSyncPrices = async () => {
    setIsSyncing(true);
    setSyncStatus("Syncing...");
    try {
      const res = await fetch("/api/stocks/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(`Updated ${data.syncedCount} tickers`);
        setTimeout(() => {
          setSyncStatus(null);
          window.location.reload();
        }, 1200);
      } else {
        setSyncStatus("Sync failed");
        setTimeout(() => setSyncStatus(null), 3000);
      }
    } catch {
      setSyncStatus("Sync error");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              ApexFinance
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:ml-8 md:flex md:space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-zinc-800 text-emerald-400 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Stock Price Sync button */}
          <button
            onClick={handleSyncPrices}
            disabled={isSyncing}
            title="Sync daily market closing prices"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{syncStatus || "Sync Prices"}</span>
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              AM
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-zinc-200 leading-none">Alex Morgan</p>
              <p className="text-[10px] text-zinc-500 leading-tight">demo@antigravity.finance</p>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 md:hidden">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-zinc-800 text-emerald-400"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
