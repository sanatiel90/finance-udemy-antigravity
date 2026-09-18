"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Modal } from "@/components/Modal";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/validations";
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Tag,
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    amount: string;
    date: string;
    category: string;
    subcategory: string;
    notes: string;
  }>({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: DEFAULT_EXPENSE_CATEGORIES[0],
    subcategory: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory && filterCategory !== "all") params.append("category", filterCategory);
      if (filterSubcategory) params.append("subcategory", filterSubcategory);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      }
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory, filterSubcategory, filterStartDate, filterEndDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          date: formData.date,
          category: formData.category,
          subcategory: formData.subcategory || null,
          notes: formData.notes || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to save expense entry");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: DEFAULT_EXPENSE_CATEGORIES[0],
        subcategory: "",
        notes: "",
      });
      fetchExpenses();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchExpenses();
      }
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      amount: item.amount.toString(),
      date: new Date(item.date).toISOString().split("T")[0],
      category: item.category,
      subcategory: item.subcategory || "",
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  const totalFilteredExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
              <Receipt className="h-7 w-7 text-rose-400" />
              Expense Management
            </h1>
            <p className="text-sm text-zinc-400">
              Categorize and monitor your spending habits with subcategories and detailed notes.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                amount: "",
                date: new Date().toISOString().split("T")[0],
                category: DEFAULT_EXPENSE_CATEGORIES[0],
                subcategory: "",
                notes: "",
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-rose-400 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Record Expense
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Subcategory Search</label>
            <input
              type="text"
              placeholder="e.g., Groceries, Uber..."
              value={filterSubcategory}
              onChange={(e) => setFilterSubcategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1">From Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1">To Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2 flex lg:justify-end items-center gap-3 pt-2 lg:pt-0">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Total Expenses
              </span>
              <span className="text-lg font-bold text-rose-400 font-mono">
                ${totalFilteredExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {(filterCategory !== "all" || filterSubcategory || filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setFilterCategory("all");
                  setFilterSubcategory("");
                  setFilterStartDate("");
                  setFilterEndDate("");
                }}
                className="text-xs text-zinc-400 hover:text-white underline ml-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Subcategory</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      Loading expense records...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No expense records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  expenses.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-zinc-400">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 border border-zinc-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {item.subcategory ? (
                          <span className="inline-flex items-center gap-1 text-zinc-300">
                            <Tag className="h-3 w-3 text-zinc-500" />
                            {item.subcategory}
                          </span>
                        ) : (
                          <span className="italic text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400 max-w-xs truncate">
                        {item.notes || <span className="italic text-zinc-600">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-mono font-semibold text-rose-400">
                        -${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                            title="Edit expense"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                            title="Delete expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Expense Record" : "Record New Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
              >
                {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Subcategory (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Supermarket, Gas, Doctor, Concert..."
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g., Weekly groceries at Whole Foods..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
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
              className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-400 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
