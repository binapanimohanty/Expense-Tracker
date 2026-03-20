import { useState, useEffect } from 'react';
import api from '../services/api';
import { MONTHS, CATEGORY_MAP } from '../utils/constants';
import { formatCurrency, getDaysInMonth } from '../utils/helpers';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { HiDocumentDownload, HiDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/monthly-summary', { params: { year } }),
      api.get('/analytics/category-summary', { params: { year, month } }),
    ])
      .then(([monthlyRes, categoryRes]) => {
        setMonthlySummary(
          monthlyRes.data.map((m) => ({
            ...m,
            name: MONTHS[m.month - 1]?.substring(0, 3),
          }))
        );
        setCategorySummary(categoryRes.data);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const monthSummary = monthlySummary.find((item) => item.month === month) || {
    income: 0,
    expense: 0,
  };

  const expenseByCategory = categorySummary
    .filter((c) => c.type === 'expense')
    .map((c) => ({
      name: CATEGORY_MAP[c.category]?.label || c.category,
      value: c.total,
      color: CATEGORY_MAP[c.category]?.color || '#6b7280',
    }));

  const topCategory = [...expenseByCategory].sort((a, b) => b.value - a.value)[0];
  const averageDailySpend = monthSummary.expense / getDaysInMonth(year, month);

  const handleExport = async () => {
    try {
      const res = await api.get('/report/export', {
        params: { year, month },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${year}_${String(month).padStart(2, '0')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handlePdf = () => {
    toast('PDF export UI is ready; backend generation is the next step.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Financial Reports
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Compare income against expenses, drill into categories, and export records for your
              accountant, spreadsheet, or future regret analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <HiDownload /> Export CSV
            </button>
            <button
              onClick={handlePdf}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <HiDocumentDownload /> Download PDF
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <TabPill label="Weekly" />
          <TabPill label="Monthly" active />
          <TabPill label="Yearly" />
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <span>Custom</span>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-transparent outline-none">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-transparent outline-none">
              {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <InsightCard label="Total Spent" value={formatCurrency(monthSummary.expense)} note="-5.2%" accent="text-rose-500" />
        <InsightCard label="Avg. Daily Spend" value={formatCurrency(averageDailySpend)} note="+2.1%" accent="text-emerald-500" />
        <InsightCard label="Highest Category" value={topCategory?.name || 'No data'} note={topCategory ? `${Math.round((topCategory.value / Math.max(monthSummary.expense, 1)) * 100)}% of total` : 'No category data'} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr,0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Spending Trends
          </h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Daily outflow for current month</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="expense" fill="#2340d8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Category Distribution
            </h2>
          {expenseByCategory.length === 0 ? (
            <p className="py-12 text-center text-slate-500 dark:text-slate-400">
              No expense data for this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Top Categories
            </h3>
            <div className="space-y-4">
              {expenseByCategory.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No category data available.</p>
              ) : (
                expenseByCategory
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 4)
                  .map((entry) => {
                    const share = monthSummary.expense ? (entry.value / monthSummary.expense) * 100 : 0;

                    return (
                      <div key={entry.name} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.name}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(entry.value)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: entry.color }} />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Income vs Expenses</h3>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2340d8]" /> Income</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Expenses</span>
          </div>
        </div>
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="income" fill="#2340d8" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#dce4f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function InsightCard({ label, value, note, accent }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className={`mt-2 text-xs ${accent || 'text-slate-500 dark:text-slate-400'}`}>{note}</p>
    </div>
  );
}

function TabPill({ label, active = false }) {
  return (
    <button
      type="button"
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );
}
