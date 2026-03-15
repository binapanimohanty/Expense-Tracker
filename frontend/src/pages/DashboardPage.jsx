import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { CATEGORY_MAP } from '../utils/constants';
import { HiTrendingUp, HiTrendingDown, HiCash } from 'react-icons/hi';

export default function DashboardPage() {
  const [summary, setSummary] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      api.get('/analytics/monthly-summary', { params: { year } }),
      api.get('/transactions', { params: { page: 1, page_size: 5 } }),
    ])
      .then(([summaryRes, recentRes]) => {
        setSummary(summaryRes.data);
        setRecent(recentRes.data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const totals = summary.reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      expense: acc.expense + m.expense,
    }),
    { income: 0, expense: 0 }
  );
  const balance = totals.income - totals.expense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          title="Total Income"
          amount={formatCurrency(totals.income)}
          icon={<HiTrendingUp className="text-green-500 text-2xl" />}
          color="green"
        />
        <Card
          title="Total Expenses"
          amount={formatCurrency(totals.expense)}
          icon={<HiTrendingDown className="text-red-500 text-2xl" />}
          color="red"
        />
        <Card
          title="Balance"
          amount={formatCurrency(balance)}
          icon={<HiCash className="text-indigo-500 text-2xl" />}
          color="indigo"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h2>
        {recent.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No transactions yet. Add your first one!
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_MAP[txn.category]?.color || '#6b7280' }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {txn.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {txn.category} · {new Date(txn.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold text-sm ${
                    txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {txn.type === 'income' ? '+' : '-'}
                  {formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, amount, icon, color }) {
  const borderColors = {
    green: 'border-l-green-500',
    red: 'border-l-red-500',
    indigo: 'border-l-indigo-500',
  };
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 ${borderColors[color]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{amount}</p>
    </div>
  );
}
