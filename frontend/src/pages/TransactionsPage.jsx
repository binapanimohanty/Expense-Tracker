import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionModal from '../components/TransactionModal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CATEGORIES, CATEGORY_MAP, MONTHS } from '../utils/constants';
import { HiCalendar, HiDotsHorizontal, HiDownload, HiPencil, HiPlus, HiSearch, HiTrash } from 'react-icons/hi';

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    category: '',
    type: '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    const nextSearch = searchParams.get('search') || '';
    setFilters((current) =>
      current.search === nextSearch ? current : { ...current, search: nextSearch }
    );
  }, [searchParams]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (filters.month) params.month = parseInt(filters.month);
      if (filters.year) params.year = parseInt(filters.year);
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.items);
      setTotalPages(res.data.total_pages);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAdd = async (data) => {
    try {
      await api.post('/transactions', data);
      toast.success('Transaction added');
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add');
    }
  };

  const handleEdit = async (data) => {
    try {
      await api.put(`/transactions/${editing.id}`, data);
      toast.success('Transaction updated');
      setEditing(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleFilterChange = (e) => {
    const nextFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(nextFilters);
    setPage(1);

    if (e.target.name === 'search') {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (e.target.value.trim()) {
          next.set('search', e.target.value);
        } else {
          next.delete('search');
        }
        return next;
      });
    }
  };

  const filteredTotals = useMemo(
    () =>
      transactions.reduce(
        (acc, txn) => {
          if (txn.type === 'income') {
            acc.income += txn.amount;
          } else {
            acc.expense += txn.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      ),
    [transactions]
  );

  const handleExport = async () => {
    try {
      const response = await api.get('/report/export', {
        params: {
          year: filters.year ? parseInt(filters.year) : undefined,
          month: filters.month ? parseInt(filters.month) : undefined,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Transactions exported');
    } catch {
      toast.error('Failed to export transactions');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">View and manage all your expenses and incomes</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Transaction History
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Search, filter, export, and update the full ledger from one clean workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <HiDownload />
              Export CSV
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <HiPlus /> Add expense
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-5">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr,1fr,1fr,1fr,auto]">
          <SelectLike label="Last 30 Days" icon={<HiCalendar className="text-base" />} />
          <div>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Payment Method</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl px-3 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 xl:justify-end">
            Showing {transactions.length} transactions
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All months</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">
            No transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Transaction
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Category
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Date
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Method
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-5 py-4 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${CATEGORY_MAP[txn.category]?.color || '#6b7280'}15` }}
                        >
                          <HiCash style={{ color: CATEGORY_MAP[txn.category]?.color || '#6b7280' }} />
                        </div>
                        <div>
                          <p className="font-semibold">{txn.title}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{txn.type === 'income' ? 'Income source' : 'Weekly groceries'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor:
                            (CATEGORY_MAP[txn.category]?.color || '#6b7280') + '20',
                          color: CATEGORY_MAP[txn.category]?.color || '#6b7280',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_MAP[txn.category]?.color || '#6b7280',
                          }}
                        />
                        {CATEGORY_MAP[txn.category]?.label || txn.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(txn.transaction_date)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <HiCreditCard className="text-slate-400" />
                        {txn.type === 'income' ? 'Bank Transfer' : 'Visa •••• 4242'}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-bold ${
                        txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {txn.type === 'income' ? '+' : '-'}
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        title="More actions"
                      >
                        <HiDotsHorizontal />
                      </button>
                      <button
                        onClick={() =>
                          setEditing({
                            ...txn,
                            amount: txn.amount.toString(),
                          })
                        }
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <HiPencil />
                      </button>
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="ml-1 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                        title="Delete"
                      >
                        <HiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="Spent this month" value={formatCurrency(filteredTotals.expense)} tone="red" note="12% more than last month" />
        <SummaryCard label="Earned this month" value={formatCurrency(filteredTotals.income)} tone="green" note="On track with average" />
        <SummaryCard label="Savings rate" value={`${filteredTotals.income ? (((filteredTotals.income - filteredTotals.expense) / filteredTotals.income) * 100).toFixed(1) : 0}%`} tone="indigo" note="Savings versus income on this page" />
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
      />
      <TransactionModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        initial={editing}
      />
    </div>
  );
}

function SummaryCard({ label, value, tone, note }) {
  const styles = {
    green: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-300',
    red: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-300',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-300',
  };

  return (
    <div className={`rounded-[28px] border border-slate-200 bg-gradient-to-br p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${styles[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  );
}

function SelectLike({ label, icon }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
      {icon}
      {label}
    </div>
  );
}
