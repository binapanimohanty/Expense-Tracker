export const CATEGORIES = [
  { value: 'salary', label: 'Salary', color: '#22c55e' },
  { value: 'freelance', label: 'Freelance', color: '#3b82f6' },
  { value: 'investment', label: 'Investment', color: '#8b5cf6' },
  { value: 'food', label: 'Food', color: '#f97316' },
  { value: 'transport', label: 'Transport', color: '#eab308' },
  { value: 'entertainment', label: 'Entertainment', color: '#ec4899' },
  { value: 'shopping', label: 'Shopping', color: '#14b8a6' },
  { value: 'bills', label: 'Bills', color: '#ef4444' },
  { value: 'health', label: 'Health', color: '#06b6d4' },
  { value: 'education', label: 'Education', color: '#6366f1' },
  { value: 'rent', label: 'Rent', color: '#a855f7' },
  { value: 'travel', label: 'Travel', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
);

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
