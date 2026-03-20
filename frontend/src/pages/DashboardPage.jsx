import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowRight,
  HiCash,
  HiChartPie,
  HiClock,
  HiCreditCard,
  HiPlus,
  HiTrendingDown,
  HiTrendingUp,
} from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../services/api';
import { CATEGORY_MAP } from '../utils/constants';
import { formatCurrency, formatDate, getMonthLabel } from '../utils/helpers';
import { getSettings, SETTINGS_CHANGED_EVENT } from '../utils/preferences';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(() => getSettings());

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    Promise.all([
      api.get('/analytics/monthly-summary', { params: { year } }),
      api.get('/analytics/category-summary', { params: { year, month } }),
      api.get('/transactions', { params: { page: 1, page_size: 5 } }),
    ])
      .then(([summaryRes, categoryRes, recentRes]) => {
        setSummary(summaryRes.data);
        setCategorySummary(categoryRes.data);
        setRecent(recentRes.data.items);
      })
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => {
    const syncSettings = () => setSettings(getSettings());
    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
  }, []);

  const totals = useMemo(
    () =>
      summary.reduce(
        (acc, item) => ({
          income: acc.income + item.income,
          expense: acc.expense + item.expense,
        }),
        { income: 0, expense: 0 }
      ),
    [summary]
  );

  const currentMonth = summary.find((entry) => entry.month === month) ?? {
    income: 0,
    expense: 0,
  };

  const balance = totals.income - totals.expense;
  const budgetRemaining = settings.monthlyBudget - currentMonth.expense;
  const budgetProgress = settings.monthlyBudget
    ? Math.min((currentMonth.expense / settings.monthlyBudget) * 100, 100)
    : 0;

  const expenseCategories = useMemo(
    () =>
      categorySummary
        .filter((item) => item.type === 'expense')
        .sort((a, b) => b.total - a.total),
    [categorySummary]
  );

  const donutData = expenseCategories.slice(0, 4).map((item) => ({
    name: CATEGORY_MAP[item.category]?.label || item.category,
    value: item.total,
    color: CATEGORY_MAP[item.category]?.color || '#64748b',
  }));

  const topCategory = donutData[0];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.55fr,0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Welcome back. Here&apos;s what&apos;s happening today.
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Financial Overview
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                A polished snapshot of your inflow, outflow, and budget status for {getMonthLabel(year, month)}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/app/transactions')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                View all
                <HiArrowRight />
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/transactions')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                <HiPlus />
                Add Expense
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <OverviewCard
              title="Daily Average"
              value={formatCurrency(currentMonth.expense / Math.max(now.getDate(), 1))}
              delta="-2.4%"
              deltaTone="negative"
              icon={<HiClock className="text-xl" />}
              iconTone="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
            />
            <OverviewCard
              title="Weekly Total"
              value={formatCurrency(currentMonth.expense / 4.3)}
              delta="-5.1%"
              deltaTone="negative"
              icon={<HiCreditCard className="text-xl" />}
              iconTone="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
            />
            <OverviewCard
              title="Monthly Spend"
              value={formatCurrency(currentMonth.expense)}
              delta="+12.8%"
              deltaTone="positive"
              icon={<HiCash className="text-xl" />}
              iconTone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
            />
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-600/15 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-100">This month</p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">{formatCurrency(balance)}</h3>
          <p className="mt-2 text-sm text-indigo-100/90">Net balance after income and spending.</p>

          <div className="mt-8 rounded-[24px] bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-indigo-100">
              <span>Budget progress</span>
              <span>{budgetProgress.toFixed(0)}% used</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${budgetProgress}%` }} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CompactMetric label="Spent" value={formatCurrency(currentMonth.expense)} />
              <CompactMetric label="Remaining" value={formatCurrency(Math.max(budgetRemaining, 0))} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Monthly Budget Progress
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Keep the month in range with a quick snapshot of spend versus target.
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {budgetProgress.toFixed(0)}% used
            </p>
          </div>

          <div className="mt-8 h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${budgetProgress}%` }} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Spent</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(currentMonth.expense)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(Math.max(budgetRemaining, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <button
              type="button"
              onClick={() => navigate('/app/transactions')}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              View All
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {recent.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                Add a transaction to bring this panel to life.
              </p>
            ) : (
              recent.map((txn) => {
                const category = CATEGORY_MAP[txn.category];
                return (
                  <div key={txn.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                      style={{ backgroundColor: category?.color || '#64748b' }}
                    >
                      <HiCash className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{txn.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {category?.label || txn.category} • {formatDate(txn.transaction_date)}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Spending by Category
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Your top categories for {getMonthLabel(year, month)}.
              </p>
            </div>
            <HiChartPie className="text-2xl text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="mt-6 grid items-center gap-4 lg:grid-cols-[0.95fr,1.05fr]">
            <div className="h-[260px]">
              {donutData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[24px] bg-slate-50 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                  No category data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-4">
              {donutData.length === 0 ? null : donutData.map((entry) => {
                const share = currentMonth.expense ? (entry.value / currentMonth.expense) * 100 : 0;
                return (
                  <div key={entry.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.name}</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">{share.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, backgroundColor: entry.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Quick insights
          </h3>
          <div className="mt-6 space-y-4">
            <InsightCard
              icon={<HiTrendingUp className="text-lg" />}
              iconTone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
              title="Income this year"
              body={formatCurrency(totals.income)}
              caption="All recorded income streams"
            />
            <InsightCard
              icon={<HiTrendingDown className="text-lg" />}
              iconTone="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
              title="Spent this year"
              body={formatCurrency(totals.expense)}
              caption="Every tracked expense combined"
            />
            <InsightCard
              icon={<HiChartPie className="text-lg" />}
              iconTone="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
              title="Top category"
              body={topCategory?.name || 'No data'}
              caption={topCategory ? `${formatCurrency(topCategory.value)} spent` : 'Track a few expenses to see trends'}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function OverviewCard({ title, value, delta, deltaTone, icon, iconTone }) {
  return (
    <div className="rounded-[26px] border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconTone}`}>
          {icon}
        </div>
        <span className={`text-sm font-bold ${deltaTone === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {delta}
        </span>
      </div>
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function CompactMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function InsightCard({ icon, iconTone, title, body, caption }) {
  return (
    <div className="rounded-[26px] border border-slate-200 p-5 dark:border-slate-800">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconTone}`}>
        {icon}
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{body}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );
}
