"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Receipt,
  Wallet,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  Layers,
  Repeat,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Navigation } from "@/components/Navigation";
import { Modal } from "@/components/Modal";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/validations";

const CATEGORY_COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#64748B", // Slate
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<"income" | "expense" | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    subcategory: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const endpoint = activeModal === "income" ? "/api/income" : "/api/expenses";
      const payload: any = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        notes: formData.notes,
      };
      if (activeModal === "expense" && formData.subcategory) {
        payload.subcategory = formData.subcategory;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to submit transaction");
      }

      setActiveModal(null);
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        subcategory: "",
        notes: "",
      });
      loadDashboard();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const summary = {
    monthlyIncome: data?.summary?.monthlyIncome ?? 0,
    monthlyExpenses: data?.summary?.monthlyExpenses ?? 0,
    netBalance: data?.summary?.netBalance ?? 0,
  };
  const portfolio = {
    totalValue: data?.portfolio?.totalValue ?? 0,
    totalInvested: data?.portfolio?.totalInvested ?? 0,
    totalProfitLoss: data?.portfolio?.totalProfitLoss ?? 0,
    totalProfitLossPercent: data?.portfolio?.totalProfitLossPercent ?? 0,
    topHoldings: data?.portfolio?.topHoldings ?? [],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Financial Overview
            </h1>
            <p className="text-sm text-zinc-400">
              Real-time snapshot of your income, expenses, subscriptions, and stock portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFormData({
                  amount: "",
                  date: new Date().toISOString().split("T")[0],
                  category: DEFAULT_INCOME_CATEGORIES[0],
                  subcategory: "",
                  notes: "",
                });
                setActiveModal("income");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-emerald-400 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Add Income
            </button>
            <button
              onClick={() => {
                setFormData({
                  amount: "",
                  date: new Date().toISOString().split("T")[0],
                  category: DEFAULT_EXPENSE_CATEGORIES[0],
                  subcategory: "",
                  notes: "",
                });
                setActiveModal("expense");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Top KPI Cards (Section 5) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Monthly Income */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Monthly Income
              </span>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                ${summary.monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <p className="mt-1 text-xs text-zinc-500">Current calendar month</p>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Monthly Expenses
              </span>
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                ${summary.monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <p className="mt-1 text-xs text-zinc-500">Total spent this month</p>
            </div>
          </div>

          {/* Net Balance */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Net Balance
              </span>
              <div
                className={`rounded-lg p-2 ${
                  summary.netBalance >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  summary.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                ${summary.netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <p className="mt-1 text-xs text-zinc-500">Income minus expenses</p>
            </div>
          </div>

          {/* Portfolio Total Value */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Stock Portfolio
              </span>
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <LineChart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                ${portfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span
                  className={`font-semibold inline-flex items-center ${
                    portfolio.totalProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {portfolio.totalProfitLoss >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  ${Math.abs(portfolio.totalProfitLoss).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ({portfolio.totalProfitLossPercent}%)
                </span>
                <span className="text-zinc-500">all-time P&L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid: 6 Months Trend & Expense Category Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Trend Chart (Section 5: Last 6 months trend) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Income vs Expenses</h3>
                <p className="text-xs text-zinc-400">Last 6 months financial flow</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Income
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Expenses
                </div>
              </div>
            </div>

            <div className="mt-6 h-72 w-full">
              {data?.sixMonthsTrend?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sixMonthsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      stroke="#71717a"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                      tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        borderRadius: "0.75rem",
                        color: "#f43f5e",
                      }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No historical trend data yet.
                </div>
              )}
            </div>
          </div>

          {/* Expense Breakdown Donut Chart (Section 5) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4 shadow-sm flex flex-col justify-between">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-base font-semibold text-white">Category Breakdown</h3>
              <p className="text-xs text-zinc-400">Current month expenses by category</p>
            </div>

            <div className="h-56 w-full my-4">
              {data?.expenseCategories?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.expenseCategories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {data.expenseCategories.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        borderRadius: "0.75rem",
                      }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, "Amount"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No expenses recorded this month.
                </div>
              )}
            </div>

            {/* Category list legend */}
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {data?.expenseCategories?.slice(0, 5).map((cat: any, i: number) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-zinc-300 font-medium">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-mono">${cat.amount.toFixed(0)}</span>
                    <span className="text-zinc-500 text-[11px] w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Stock Holdings + Upcoming Subscriptions + Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Top Stock Holdings (Section 5) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Top Holdings</h3>
                <p className="text-xs text-zinc-400">Stock portfolio distribution</p>
              </div>
              <Link
                href="/portfolio"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/60">
              {portfolio.topHoldings?.length ? (
                portfolio.topHoldings.map((stk: any) => (
                  <div key={stk.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{stk.ticker}</span>
                        <span className="text-[11px] text-zinc-500">{stk.shares} shares</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                        ${stk.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white font-mono">
                        ${stk.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p
                        className={`text-xs font-medium inline-flex items-center justify-end ${
                          stk.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {stk.profitLoss >= 0 ? "+" : ""}
                        {stk.profitLossPercent}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No stocks in portfolio yet.{" "}
                  <Link href="/portfolio" className="text-emerald-400 underline">
                    Add holdings
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Subscriptions (Section 3.3 & 5: Next 30 days) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Upcoming Bills</h3>
                <p className="text-xs text-zinc-400">Subscriptions due in next 30 days</p>
              </div>
              <Link
                href="/subscriptions"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Manage &rarr;
              </Link>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/60">
              {data?.upcomingSubscriptions?.length ? (
                data.upcomingSubscriptions.map((sub: any) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{sub.name}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(sub.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white font-mono">
                        ${sub.amount.toFixed(2)}
                      </p>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                        {sub.billingCycle}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No subscriptions due within 30 days.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
                <p className="text-xs text-zinc-400">Latest income and expenses</p>
              </div>
              <div className="text-xs text-zinc-500">Live</div>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/60">
              {data?.recentTransactions?.length ? (
                data.recentTransactions.map((tx: any) => {
                  const isInc = tx.type === "income";
                  return (
                    <div key={`${tx.type}-${tx.id}`} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-1.5 ${
                            isInc ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {isInc ? <TrendingUp className="h-3.5 w-3.5" /> : <Receipt className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.category}</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {tx.notes ? ` • ${tx.notes}` : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold font-mono ${
                          isInc ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isInc ? "+" : "-"}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">No transactions recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Entry Modal */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal === "income" ? "Record Income" : "Record Expense"}
      >
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300">Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {(activeModal === "income" ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES).map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
              </input>
            </div>
          </div>

          {activeModal === "expense" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300">Subcategory (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Groceries, Uber, Electric"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Additional description..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
