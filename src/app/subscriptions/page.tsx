"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Modal } from "@/components/Modal";
import {
  Repeat,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingFilter, setUpcomingFilter] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingCycle: "monthly",
    nextBillingDate: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const url = upcomingFilter ? "/api/subscriptions?upcoming=true" : "/api/subscriptions";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubscriptions(data);
      }
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [upcomingFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const url = editingId ? `/api/subscriptions/${editingId}` : "/api/subscriptions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          billingCycle: formData.billingCycle,
          nextBillingDate: formData.nextBillingDate,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to save subscription");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        amount: "",
        billingCycle: "monthly",
        nextBillingDate: new Date().toISOString().split("T")[0],
      });
      fetchSubscriptions();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscription?")) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (err) {
      console.error("Failed to delete subscription", err);
    }
  };

  const handleEdit = (sub: any) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      amount: sub.amount.toString(),
      billingCycle: sub.billingCycle,
      nextBillingDate: new Date(sub.nextBillingDate).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  // Monthly burn rate calculation
  const totalMonthlyEquivalent = subscriptions.reduce(
    (sum, s) => sum + (s.monthlyEquivalent || (s.billingCycle === "yearly" ? s.amount / 12 : s.amount)),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
              <Repeat className="h-7 w-7 text-indigo-400" />
              Subscription Tracker
            </h1>
            <p className="text-sm text-zinc-400">
              Manage recurring SaaS, entertainment, gym, and household services.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: "",
                amount: "",
                billingCycle: "monthly",
                nextBillingDate: new Date().toISOString().split("T")[0],
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Subscription
          </button>
        </div>

        {/* Metric Cards & Filter */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Active
            </span>
            <div className="mt-2 text-2xl font-bold text-white">
              {subscriptions.length} <span className="text-sm font-normal text-zinc-500">services</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Monthly Burn Rate
            </span>
            <div className="mt-2 text-2xl font-bold text-indigo-400 font-mono">
              ${totalMonthlyEquivalent.toFixed(2)}{" "}
              <span className="text-sm font-normal text-zinc-500">/ month</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Filter Scope
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                {upcomingFilter ? "Showing renewals in next 30 days" : "Showing all active subscriptions"}
              </p>
            </div>
            <button
              onClick={() => setUpcomingFilter(!upcomingFilter)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border ${
                upcomingFilter
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
              }`}
            >
              {upcomingFilter ? "Show All" : "Due in 30 Days"}
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5">Subscription Name</th>
                  <th className="px-6 py-3.5">Billing Cycle</th>
                  <th className="px-6 py-3.5">Next Renewal</th>
                  <th className="px-6 py-3.5 text-right">Cost</th>
                  <th className="px-6 py-3.5 text-right">Monthly Equiv.</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      {upcomingFilter
                        ? "No subscriptions due within the next 30 days."
                        : "No subscriptions configured yet."}
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const renewalDate = new Date(sub.nextBillingDate);
                    const daysRemaining = Math.ceil(
                      (renewalDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                    );

                    return (
                      <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span>{sub.name}</span>
                            {sub.isUpcoming && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                                Due Soon
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-700 capitalize">
                            {sub.billingCycle}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                            {renewalDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            <span className="text-zinc-500 ml-1">
                              ({daysRemaining > 0 ? `in ${daysRemaining}d` : "today"})
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono font-semibold text-white">
                          ${sub.amount.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-zinc-400 text-xs">
                          ${sub.monthlyEquivalent?.toFixed(2)}/mo
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(sub)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                              title="Edit subscription"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                              title="Delete subscription"
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

      {/* Subscription Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Subscription" : "Add Subscription"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300">Service Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Netflix, Spotify, AWS, GitHub..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Next Billing Date</label>
            <input
              type="date"
              required
              value={formData.nextBillingDate}
              onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

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
              {submitting ? "Saving..." : editingId ? "Update Subscription" : "Save Subscription"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
