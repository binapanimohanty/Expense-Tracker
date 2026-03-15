import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionModal from '../components/TransactionModal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CATEGORIES, CATEGORY_MAP, MONTHS } from '../utils/constants';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';

export default function TransactionsPage() {
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
    search: '',
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (filters.month) params.month = parseInt(filters.month);
      if (filters.year) params.year = parseInt(filters.year);
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

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
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
        >
          <HiPlus /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All months</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            No transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    Title
                  </th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    Type
                  </th>
                  <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    Amount
                  </th>
                  <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      {formatDate(txn.transaction_date)}
                    </td>
                    <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">
                      {txn.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
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
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          txn.type === 'income'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${
                        txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.type === 'income' ? '+' : '-'}
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          setEditing({
                            ...txn,
                            amount: txn.amount.toString(),
                          })
                        }
                        className="text-gray-400 hover:text-indigo-600 p-1"
                        title="Edit"
                      >
                        <HiPencil />
                      </button>
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="text-gray-400 hover:text-red-600 p-1 ml-1"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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
