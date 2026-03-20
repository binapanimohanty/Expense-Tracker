import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiBell,
  HiHome,
  HiCreditCard,
  HiChartBar,
  HiCollection,
  HiCash,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiMoon,
  HiSun,
  HiSearch,
} from 'react-icons/hi';
import { applyTheme, getSettings, saveSettings, SETTINGS_CHANGED_EVENT } from '../utils/preferences';
import { getInitials } from '../utils/helpers';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: HiHome },
  { to: '/app/transactions', label: 'Transactions', icon: HiCreditCard },
  { to: '/app/budgets', label: 'Budget', icon: HiCollection },
  { to: '/app/income', label: 'Income', icon: HiCash },
  { to: '/app/reports', label: 'Reports', icon: HiChartBar },
  { to: '/app/settings', label: 'Settings', icon: HiCog },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(() => getSettings());
  const [search, setSearch] = useState('');

  useEffect(() => {
    applyTheme(settings.theme);

    const syncSettings = () => setSettings(getSettings());
    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);

    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
  }, [settings.theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = useMemo(() => {
    const match = navItems.find((item) => item.to === location.pathname);
    return match?.label || 'Workspace';
  }, [location.pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate({
      pathname: '/app/transactions',
      search: query ? createSearchParams({ search: query }).toString() : '',
    });
    setSidebarOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
        : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(82vw,18rem)] flex-col border-r border-slate-200 bg-white/95 backdrop-blur transition-transform dark:border-slate-800 dark:bg-slate-900/95 lg:static lg:w-64 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <HiCash className="text-xl" />
            </div>
            <div className="text-left">
              <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">ExpenseTracker</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Finance workspace</p>
            </div>
          </button>
          <button
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-[24px] bg-indigo-600 px-4 py-5 text-white shadow-lg shadow-indigo-600/20">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Monthly budget</p>
            <p className="mt-2 text-2xl font-black text-white">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: settings.currency,
                maximumFractionDigits: 0,
              }).format(settings.monthlyBudget)}
            </p>
            <button
              type="button"
              onClick={() => navigate('/app/budgets')}
              className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Adjust budget
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => saveSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {settings.theme === 'dark' ? <HiSun className="text-lg" /> : <HiMoon className="text-lg" />}
              Switch to {settings.theme === 'dark' ? 'light' : 'dark'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <HiCog className="text-lg" />
              Preferences
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <HiLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              >
                <HiMenu className="text-2xl" />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <form onSubmit={handleSearchSubmit} className="hidden max-w-xl flex-1 md:block">
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search transactions..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </form>

              <button
                type="button"
                className="hidden rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
              >
                <HiBell className="text-lg" />
              </button>

              <button
                type="button"
                onClick={() => saveSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {settings.theme === 'dark' ? <HiSun className="text-lg" /> : <HiMoon className="text-lg" />}
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/settings')}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                  {getInitials(user?.name || 'User')}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
