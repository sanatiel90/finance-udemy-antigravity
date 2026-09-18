"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Modal } from "@/components/Modal";
import {
  LineChart,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Briefcase,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function PortfolioPage() {
  const [data, setData] = useState<any>({ stocks: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ticker: "",
    shares: "",
    avgPrice: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stocks");
      const json = await res.json();
      if (json && json.stocks) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load portfolio", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleSyncPrices = async () => {
    try {
      setSyncing(true);
      setSyncMessage("Fetching latest market quotes...");
      const res = await fetch("/api/stocks/sync", { method: "POST" });
      const resJson = await res.json();
      if (res.ok) {
        setSyncMessage(`Updated ${resJson.syncedCount} stock prices.`);
        await fetchPortfolio();
        setTimeout(() => setSyncMessage(null), 3000);
      } else {
        setSyncMessage("Failed to sync prices.");
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch {
      setSyncMessage("Network error syncing prices.");
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const url = editingId ? `/api/stocks/${editingId}` : "/api/stocks";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: formData.ticker.toUpperCase().trim(),
          shares: parseFloat(formData.shares),
          avgPrice: formData.avgPrice ? parseFloat(formData.avgPrice) : null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to save stock holding");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ ticker: "", shares: "", avgPrice: "" });
      fetchPortfolio();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this stock from your portfolio?")) return;
    try {
      const res = await fetch(`/api/stocks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPortfolio();
      }
    } catch (err) {
      console.error("Failed to delete stock", err);
    }
  };

  const handleEdit = (stk: any) => {
    setEditingId(stk.id);
    setFormData({
      ticker: stk.ticker,
      shares: stk.shares.toString(),
      avgPrice: stk.avgPrice ? stk.avgPrice.toString() : "",
    });
    setIsModalOpen(true);
  };

  const metrics = {
    totalValue: data?.metrics?.totalValue ?? 0,
    totalInvested: data?.metrics?.totalInvested ?? 0,
    totalProfitLoss: data?.metrics?.totalProfitLoss ?? 0,
    totalProfitLossPercent: data?.metrics?.totalProfitLossPercent ?? 0,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
              <LineChart className="h-7 w-7 text-indigo-400" />
              Stock Portfolio
            </h1>
            <p className="text-sm text-zinc-400">
              Track holdings, real-time market value, capital invested, and return on investment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncPrices}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-400 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncMessage || "Sync Market Prices"}</span>
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ ticker: "", shares: "", avgPrice: "" });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Add Stock
            </button>
          </div>
        </div>

        {/* Portfolio KPI Summary (Section 4.2) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Portfolio Value
            </span>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              ${metrics.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-zinc-500">{data.stocks.length} assets held</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Capital Invested
            </span>
            <div className="mt-2 text-2xl font-bold text-zinc-300 font-mono">
              ${metrics.totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-zinc-500">Based on purchase price</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Unrealized Profit / Loss
            </span>
            <div
              className={`mt-2 text-2xl font-bold font-mono flex items-center gap-1.5 ${
                metrics.totalProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {metrics.totalProfitLoss >= 0 ? (
                <ArrowUpRight className="h-6 w-6" />
              ) : (
                <ArrowDownRight className="h-6 w-6" />
              )}
              ${Math.abs(metrics.totalProfitLoss).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-zinc-500">Current value minus cost</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Return (ROI)
            </span>
            <div
              className={`mt-2 text-2xl font-bold font-mono ${
                metrics.totalProfitLossPercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {metrics.totalProfitLossPercent >= 0 ? "+" : ""}
              {metrics.totalProfitLossPercent}%
            </div>
            <p className="mt-1 text-xs text-zinc-500">Weighted return on investment</p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5">Ticker</th>
                  <th className="px-6 py-3.5 text-right">Shares</th>
                  <th className="px-6 py-3.5 text-right">Avg Cost</th>
                  <th className="px-6 py-3.5 text-right">Market Price</th>
                  <th className="px-6 py-3.5 text-right">Total Invested</th>
                  <th className="px-6 py-3.5 text-right">Current Value</th>
                  <th className="px-6 py-3.5 text-right">P&L ($)</th>
                  <th className="px-6 py-3.5 text-right">P&L (%)</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      Loading stock holdings...
                    </td>
                  </tr>
                ) : data.stocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      No stocks in portfolio yet. Click "Add Stock" to begin tracking.
                    </td>
                  </tr>
                ) : (
                  data.stocks.map((stk: any) => {
                    const isPositive = stk.profitLoss >= 0;
                    return (
                      <tr key={stk.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 font-bold text-white">
                          <span className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-mono tracking-wider border border-zinc-700">
                            {stk.ticker}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-zinc-300">
                          {stk.shares}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-zinc-400 text-xs">
                          {stk.avgPrice ? `$${stk.avgPrice.toFixed(2)}` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono font-semibold text-white">
                          ${stk.currentPrice.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-zinc-400 text-xs">
                          ${stk.investedValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono font-bold text-white">
                          ${stk.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right font-mono font-semibold text-xs ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          ${stk.profitLoss.toFixed(2)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right font-mono font-bold text-xs ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 ${
                              isPositive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {stk.profitLossPercent}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(stk)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                              title="Edit holding"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(stk.id)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                              title="Delete holding"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Stock Holding" : "Add Stock to Portfolio"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300">Stock Ticker Symbol</label>
            <input
              type="text"
              required
              placeholder="e.g., AAPL, NVDA, MSFT, TSLA, SPY"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm font-mono uppercase text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Shares Owned</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g., 10"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Avg Cost / Share ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 150.00"
                value={formData.avgPrice}
                onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Current closing prices will be fetched automatically via daily market sync.
          </p>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Update Holding" : "Add to Portfolio"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
