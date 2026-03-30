import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiChartBar, HiClock, HiCurrencyDollar, HiLightBulb, HiSparkles } from 'react-icons/hi';
import api from '../services/api';
import { CATEGORY_MAP, MONTHS } from '../utils/constants';
import { formatCurrency, getDaysInMonth, getMonthLabel } from '../utils/helpers';
import { getSettings, saveSettings, SETTINGS_CHANGED_EVENT } from '../utils/preferences';

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(() => getSettings());
  const [budgetInput, setBudgetInput] = useState(() => String(getSettings().monthlyBudget));
  const [categoryBudgets, setCategoryBudgets] = useState(() => getSettings().categoryBudgets || {});
  const [categoryBudgetInputs, setCategoryBudgetInputs] = useState({});

  useEffect(() => {
    const syncSettings = () => {
      const nextSettings = getSettings();
      setSettings(nextSettings);
      setBudgetInput(String(nextSettings.monthlyBudget));
      setCategoryBudgets(nextSettings.categoryBudgets || {});
    };

    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/monthly-summary', { params: { year } }),
      api.get('/analytics/category-summary', { params: { year, month } }),
    ])
      .then(([monthlyRes, categoryRes]) => {
        setMonthlySummary(monthlyRes.data);
        setCategorySummary(categoryRes.data);
      })
      .catch(() => toast.error('Failed to load budget insights'))
      .finally(() => setLoading(false));
  }, [month, year]);

  const currentMonth = monthlySummary.find((item) => item.month === month) || {
    income: 0,
    expense: 0,
  };

  const monthlyBudget = Number(settings.monthlyBudget || 0);
  const spent = currentMonth.expense;
  const remaining = monthlyBudget - spent;
  const progress = monthlyBudget ? Math.min((spent / monthlyBudget) * 100, 100) : 0;
  const daysInMonth = getDaysInMonth(year, month);
  const elapsedDays =
    month === now.getMonth() + 1 && year === now.getFullYear() ? now.getDate() : daysInMonth;
  const dailyAverage = elapsedDays ? spent / elapsedDays : 0;
  const daysLeft = Math.max(daysInMonth - elapsedDays, 0);
  const forecast = dailyAverage * daysInMonth;

  const topCategories = useMemo(
    () =>
      categorySummary
        .filter((item) => item.type === 'expense')
        .sort((a, b) => b.total - a.total),
    [categorySummary]
  );

  const monthComparison = useMemo(() => {
    const start = Math.max(month - 5, 1);
    const candidates = monthlySummary.filter((item) => item.month >= start && item.month <= month);
    const maxValue = Math.max(monthlyBudget, ...candidates.map((item) => item.expense), 1);

    return candidates.map((item) => ({
      ...item,
      label: MONTHS[item.month - 1].slice(0, 3),
      height: (item.expense / maxValue) * 100,
      budgetHeight: (monthlyBudget / maxValue) * 100,
    }));
  }, [month, monthlyBudget, monthlySummary]);

  const insights = [
    spent > monthlyBudget
      ? `You are ${formatCurrency(spent - monthlyBudget)} over budget this month.`
      : `You still have ${formatCurrency(Math.max(remaining, 0))} available before hitting your limit.`,
    topCategories[0]
      ? `${CATEGORY_MAP[topCategories[0].category]?.label || topCategories[0].category} is applying the most pressure at ${formatCurrency(topCategories[0].total)}.`
      : 'Add more expenses to unlock category guidance.',
    forecast > monthlyBudget
      ? `At the current pace you are projected to reach ${formatCurrency(forecast)} by month end.`
      : `Your current pace projects a comfortable finish around ${formatCurrency(forecast)}.`,
  ];

  const handleBudgetSave = (event) => {
    event.preventDefault();
    const value = Number(budgetInput);

    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a valid monthly budget');
      return;
    }

    const next = saveSettings({ monthlyBudget: value });
    setSettings(next);
    toast.success('Monthly budget updated');
  };

  const handleCategoryBudgetSave = (category) => {
    const raw = categoryBudgetInputs[category];
    const value = Number(raw);
    if (raw === undefined || raw === '' || !Number.isFinite(value) || value < 0) {
      toast.error('Enter a valid budget amount');
      return;
    }
    const nextBudgets = { ...categoryBudgets, [category]: value };
    saveSettings({ categoryBudgets: nextBudgets });
    setCategoryBudgets(nextBudgets);
    setCategoryBudgetInputs((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
    toast.success(`Budget for ${CATEGORY_MAP[category]?.label || category} saved`);
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
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget & insights</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Stay ahead of your monthly spending.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Track how much is used, what remains, and how likely the month is to finish above target.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>{label}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {Array.from({ length: 7 }, (_, index) => now.getFullYear() - 3 + index).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Monthly spending</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(spent)}
              </h3>
              <p className="pb-1 text-lg font-semibold text-slate-400">
                / {formatCurrency(monthlyBudget)}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{getMonthLabel(year, month)}</p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">
              {progress.toFixed(0)}%
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Used this month</p>
          </div>
        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BudgetMetric title="Remaining" value={formatCurrency(Math.max(remaining, 0))} icon={<HiCurrencyDollar className="text-lg" />} />
          <BudgetMetric title="Daily Avg" value={formatCurrency(dailyAverage)} icon={<HiClock className="text-lg" />} />
          <BudgetMetric title="Days Left" value={`${daysLeft} Days`} icon={<HiChartBar className="text-lg" />} />
          <BudgetMetric title="Forecast" value={formatCurrency(forecast)} icon={<HiSparkles className="text-lg" />} accent="text-orange-500" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <div key={insight} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              {index === 0 ? <HiLightBulb className="text-lg" /> : index === 1 ? <HiSparkles className="text-lg" /> : <HiChartBar className="text-lg" />}
            </div>
            <h4 className="mt-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {index === 0 ? 'Budget signal' : index === 1 ? 'Pressure point' : 'Forecast'}
            </h4>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{insight}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Monthly Summary Comparison</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Compare actual spend with your configured budget over recent months.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Spend</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Budget</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-6">
            {monthComparison.map((item) => (
              <div key={item.month} className="flex flex-col items-center justify-end rounded-[22px] bg-slate-50 px-3 py-4 dark:bg-slate-800/70">
                <div className="flex h-44 items-end gap-2">
                  <div className="w-5 rounded-t-full bg-slate-200 dark:bg-slate-700" style={{ height: `${item.budgetHeight}%` }} />
                  <div className="w-5 rounded-t-full bg-indigo-600" style={{ height: `${item.height}%` }} />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Category breakdown</h3>
            <div className="mt-6 space-y-4">
              {topCategories.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                  No expense categories for the selected period.
                </p>
              ) : (
                topCategories.slice(0, 5).map((item) => {
                  const share = spent ? (item.total / spent) * 100 : 0;
                  const category = CATEGORY_MAP[item.category];
                  const catBudget = Number(categoryBudgets[item.category] || 0);
                  const overBudget = catBudget > 0 && item.total > catBudget;
                  const catProgress = catBudget > 0
                    ? Math.min((item.total / catBudget) * 100, 100)
                    : Math.min(share, 100);
                  const inputVal = categoryBudgetInputs[item.category] ?? (catBudget > 0 ? String(catBudget) : '');

                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category?.color || '#64748b' }} />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{category?.label || item.category}</span>
                          {overBudget && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">Over budget</span>
                          )}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatCurrency(item.total)}
                          {catBudget > 0 ? ` / ${formatCurrency(catBudget)}` : ` · ${share.toFixed(0)}%`}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${catProgress}%`,
                            backgroundColor: overBudget ? '#ef4444' : (category?.color || '#64748b'),
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Set limit..."
                          value={inputVal}
                          onChange={(e) =>
                            setCategoryBudgetInputs((prev) => ({ ...prev, [item.category]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleCategoryBudgetSave(item.category)}
                          className="shrink-0 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Budget settings</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Update the monthly target used across the dashboard and insights screens.</p>

            <form onSubmit={handleBudgetSave} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly budget</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                Save budget
              </button>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}

function BudgetMetric({ title, value, icon, accent = 'text-indigo-600 dark:text-indigo-300' }) {
  return (
    <div className="rounded-[22px] bg-slate-50 px-4 py-4 dark:bg-slate-800/70">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <span className={accent}>{icon}</span>
      </div>
      <p className={`mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white ${title === 'Forecast' ? 'text-orange-500 dark:text-orange-400' : ''}`}>{value}</p>
    </div>
  );
}
