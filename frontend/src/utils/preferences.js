export const SETTINGS_STORAGE_KEY = 'expense-tracker-settings';
export const SETTINGS_CHANGED_EVENT = 'expense-tracker-settings-changed';

export const DEFAULT_SETTINGS = {
  theme: 'light',
  currency: 'USD',
  monthlyBudget: 2000,
  categoryBudgets: {},
};

export function getSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }

  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function saveSettings(nextSettings) {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_SETTINGS,
      ...nextSettings,
    };
  }

  const merged = {
    ...getSettings(),
    ...nextSettings,
  };

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  applyTheme(merged.theme);
  window.dispatchEvent(
    new CustomEvent(SETTINGS_CHANGED_EVENT, {
      detail: merged,
    })
  );

  return merged;
}