import { useEffect, useMemo, useState } from 'react';
import {
  HiCalendar,
  HiCash,
  HiCreditCard,
  HiDocumentText,
  HiPhotograph,
  HiTag,
  HiX,
} from 'react-icons/hi';
import { CATEGORIES, INCOME_CATEGORY_VALUES } from '../utils/constants';

function buildInitialForm(initial, defaultType) {
  return {
    title: initial?.title || '',
    amount: initial?.amount || '',
    type: initial?.type || defaultType,
    category: initial?.category || (defaultType === 'income' ? 'salary' : 'food'),
    transaction_date:
      initial?.transaction_date || new Date().toISOString().split('T')[0],
    payment_method: 'card',
    notes: '',
    receipt_name: '',
  };
}

export default function TransactionModal({
  open,
  onClose,
  onSubmit,
  initial,
  defaultType = 'expense',
  lockedType = false,
}) {
  const [form, setForm] = useState(() => buildInitialForm(initial, defaultType));

  const isExpenseMode = form.type === 'expense';
  const isExpenseCreateFlow = !initial && defaultType === 'expense' && !lockedType;
  const showTypeSelector = !lockedType && !isExpenseCreateFlow;

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(initial, defaultType));
    }
  }, [defaultType, initial, open]);

  if (!open) return null;

  const categoryOptions = useMemo(() => {
    if (form.type === 'income') {
      return CATEGORIES.filter((category) => INCOME_CATEGORY_VALUES.includes(category.value));
    }

    return CATEGORIES.filter((category) => !INCOME_CATEGORY_VALUES.includes(category.value));
  }, [form.type]);

  const handleChange = (e) => {
    const nextForm = { ...form, [e.target.name]: e.target.value };

    if (e.target.name === 'type') {
      nextForm.category = e.target.value === 'income' ? 'salary' : 'food';
    }

    setForm(nextForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      transaction_date: form.transaction_date,
    });
  };

  const modalTitle = initial
    ? `Edit ${form.type === 'income' ? 'Income' : 'Expense'}`
    : defaultType === 'income'
      ? 'Add Income'
      : 'Add Expense';

  const saveLabel = initial
    ? `Update ${form.type === 'income' ? 'income' : 'expense'}`
    : defaultType === 'income'
      ? 'Save Income'
      : 'Save Expense';

  const paymentOptions = [
    { value: 'card', label: 'Card', icon: HiCreditCard },
    { value: 'cash', label: 'Cash', icon: HiCash },
    { value: 'wallet', label: 'Wallet', icon: HiCash },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            <HiCash className="text-indigo-600 dark:text-indigo-400" />
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Title
              </label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder={form.type === 'income' ? 'e.g. Salary deposit' : 'e.g. Starbucks Coffee'}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-slate-500 dark:text-slate-400">
                  $
                </span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-slate-900 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <div className="relative">
                <HiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-slate-900 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Date
              </label>
              <div className="relative">
                <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="transaction_date"
                  type="date"
                  required
                  value={form.transaction_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-900 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {showTypeSelector ? (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          ) : null}

          {isExpenseMode ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Payment Method
                </label>
                <div className="flex w-full rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                  {paymentOptions.map((option) => {
                    const selected = form.payment_method === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, payment_method: option.value }))}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                          selected
                            ? 'bg-white font-semibold text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                            : 'font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="text-lg" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Notes (Optional)
                </label>
                <div className="relative">
                  <HiDocumentText className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    name="notes"
                    rows="3"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Add some details..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-900 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <label className="group relative block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-6 transition-all hover:border-indigo-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      receipt_name: event.target.files?.[0]?.name || '',
                    }))
                  }
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <HiPhotograph />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {form.receipt_name || 'Upload Receipt'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG or PDF (max. 5MB)
                  </p>
                </div>
              </label>
            </>
          ) : null}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
