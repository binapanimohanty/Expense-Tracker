import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import TransactionModal from '../components/TransactionModal';
import { CATEGORY_MAP, MONTHS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';
import { HiChevronRight, HiDocumentDownload, HiPlusCircle } from 'react-icons/hi';

export default function IncomePage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category: 'salary',
    frequency: 'Monthly',
  });

  const fetchIncomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        api.get('/transactions', {
          params: {
            page: 1,
            page_size: 50,
            year: currentYear,
            type: 'income',
          },
        }),
        api.get('/analytics/monthly-summary', { params: { year: currentYear } }),
      ]);

      setEntries(transactionsRes.data.items);
      setSummary(summaryRes.data);
    } catch {
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  const yearIncome = summary.reduce((total, item) => total + item.income, 0);
  const averageIncome = summary.length ? yearIncome / summary.length : 0;
  const currentMonthSummary = summary.find((item) => item.month === currentMonth) || {
    income: 0,
    expense: 0,
  };
  const netThisMonth = currentMonthSummary.income - currentMonthSummary.expense;

  const recentIncome = useMemo(
    () => entries.slice().sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)),
    [entries]
  );

  const lastSixMonths = useMemo(() => summary.slice(Math.max(summary.length - 6, 0)), [summary]);

  const handleCreate = async (payload) => {
    try {
      await api.post('/transactions', payload);
      toast.success('Income entry added');
      setModalOpen(false);
      setCreateForm({
        title: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        category: 'salary',
        frequency: 'Monthly',
      });
      fetchIncomeData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add income');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await api.put(`/transactions/${editing.id}`, payload);
      toast.success('Income entry updated');
      setEditing(null);
      fetchIncomeData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update income');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) {
      return;
    }

    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Income entry deleted');
      fetchIncomeData();
    } catch {
      toast.error('Failed to delete income entry');
    }
  };

  const handleInlineSubmit = (event) => {
    event.preventDefault();

    if (!createForm.title.trim()) {
      toast.error('Income source title is required');
      return;
    }

    const amount = Number(createForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    void handleCreate({
      title: createForm.title.trim(),
      amount,
      type: 'income',
      category: createForm.category,
      transaction_date: createForm.transaction_date,
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Income Tracker</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Manage salary, freelance work, and investment inflows from a single dedicated workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="hidden rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 lg:inline-flex"
          >
            Add income source
          </button>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Metric label="Income this year" value={formatCurrency(yearIncome)} />
        <Metric label="Total Expenses" value={formatCurrency(currentMonthSummary.expense)} tone="negative" note="↗ +2.1% from last month" />
        <Metric label="Remaining Balance" value={formatCurrency(netThisMonth)} highlight note="Current month net cash flow" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr,1.28fr]">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <HiPlusCircle className="text-2xl text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Add New Income</h3>
            </div>

            <form onSubmit={handleInlineSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Income Source</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="e.g. Freelance Project"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={createForm.amount}
                    onChange={(event) => setCreateForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={createForm.transaction_date}
                    onChange={(event) => setCreateForm((current) => ({ ...current, transaction_date: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="salary">Salary</option>
                    <option value="freelance">Freelance</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Frequency</label>
                  <select
                    value={createForm.frequency}
                    onChange={(event) => setCreateForm((current) => ({ ...current, frequency: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>Monthly</option>
                    <option>One-time</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                Save Income Source
              </button>
            </form>
          </section>

          <section className="rounded-[30px] bg-gradient-to-br from-indigo-700 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-600/15">
            <h3 className="text-2xl font-black tracking-tight">Smart Savings Tip</h3>
            <p className="mt-3 text-sm leading-7 text-indigo-100">
              Consider moving 20% of your remaining balance to your high-yield savings account this month.
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Monthly Income Sources</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your most recent income transactions and source mix.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <HiDocumentDownload /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    <th className="pb-4">Source</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Frequency</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-right">Amount</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentIncome.map((entry) => {
                    const category = CATEGORY_MAP[entry.category];
                    return (
                      <tr key={entry.id}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: `${category?.color || '#6b7280'}15` }}>
                              <span className="text-xs font-black" style={{ color: category?.color || '#6b7280' }}>
                                {(entry.title || 'I').slice(0, 1).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{entry.title}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{entry.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">{category?.label || entry.category}</td>
                        <td className="py-4">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                            Monthly
                          </span>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">{formatDate(entry.transaction_date)}</td>
                        <td className="py-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(entry.amount)}</td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditing({ ...entry, amount: String(entry.amount) })}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            className="ml-2 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              View All Transactions
              <HiChevronRight />
            </button>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Income vs Expenses (Last 6 Months)</h3>
            <div className="mt-8 flex h-56 items-end justify-between gap-3">
            {lastSixMonths.map((item) => {
              const maxIncome = Math.max(...lastSixMonths.map((entry) => entry.income), 1);
              const incomeHeight = (item.income / maxIncome) * 100;
              const expenseHeight = (item.expense / maxIncome) * 100;

              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-40 items-end gap-2">
                    <div className="w-4 rounded-t-full bg-slate-200 dark:bg-slate-700" style={{ height: `${expenseHeight}%` }} />
                    <div className="w-4 rounded-t-full bg-indigo-600" style={{ height: `${incomeHeight}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{MONTHS[item.month - 1].slice(0, 3)}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(item.income)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-indigo-600" /> Income</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" /> Expenses</span>
          </div>
          </section>
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        defaultType="income"
        lockedType
      />
      <TransactionModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
        initial={editing}
        defaultType="income"
        lockedType
      />
    </div>
  );
}

function Metric({ label, value, tone, note, highlight = false }) {
  return (
    <div className={`rounded-[28px] border p-5 shadow-sm dark:border-slate-800 ${highlight ? 'border-indigo-200 bg-indigo-50/60 dark:bg-indigo-500/10' : 'border-slate-200 bg-white dark:bg-slate-900'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-black tracking-tight ${highlight ? 'text-indigo-700 dark:text-indigo-300' : tone === 'negative' ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      {note ? <p className={`mt-2 text-xs ${tone === 'negative' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>{note}</p> : null}
    </div>
  );
}
