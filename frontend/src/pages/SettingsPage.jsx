import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiBell, HiCog, HiLockClosed, HiLogout, HiShieldCheck, HiUser } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { getSettings, saveSettings, SETTINGS_CHANGED_EVENT } from '../utils/preferences';

const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

export default function SettingsPage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [settingsForm, setSettingsForm] = useState(() => getSettings());
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [bio, setBio] = useState('A short bio about yourself...');

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    const syncSettings = () => setSettingsForm(getSettings());
    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
  }, []);

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    void (async () => {
      if (!profileForm.name.trim() || !profileForm.email.trim()) {
        toast.error('Name and email are required');
        return;
      }

      try {
        setSavingProfile(true);
        await updateProfile({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        });
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to update profile');
      } finally {
        setSavingProfile(false);
      }
    })();
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    void (async () => {
      try {
        setSavingPassword(true);
        await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to update password');
      } finally {
        setSavingPassword(false);
      }
    })();
  };

  const handlePreferencesSubmit = (event) => {
    event.preventDefault();

    const budgetValue = Number(settingsForm.monthlyBudget);
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
      toast.error('Monthly budget must be greater than zero');
      return;
    }

    saveSettings({
      currency: settingsForm.currency,
      theme: settingsForm.theme,
      monthlyBudget: budgetValue,
    });
    toast.success('Preferences saved');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              {getInitials(user?.name || 'User')}
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Settings</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your profile, security, and workspace preferences.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.34fr,0.66fr]">
        <aside className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <nav className="space-y-2">
            <SidebarItem icon={<HiUser className="text-lg" />} label="Profile" active />
            <SidebarItem icon={<HiBell className="text-lg" />} label="Notifications" />
            <SidebarItem icon={<HiShieldCheck className="text-lg" />} label="Security" />
            <SidebarItem icon={<HiLockClosed className="text-lg" />} label="Billing" />
            <SidebarItem icon={<HiCog className="text-lg" />} label="App Settings" />
          </nav>

          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <HiLogout className="text-lg" />
              Log Out
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {getInitials(user?.name || 'User')}
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Public Profile</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your profile information and how it is displayed.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  {savingProfile ? 'Saving profile...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
            <div className="flex items-center gap-3">
              <HiLockClosed className="text-xl text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Current password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">New password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Workspace preferences</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose the budget, currency, and theme used across the app.</p>

            <form onSubmit={handlePreferencesSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Currency</label>
                <select
                  value={settingsForm.currency}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, currency: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {currencyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Theme</label>
                <select
                  value={settingsForm.theme}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, theme: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly budget</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={settingsForm.monthlyBudget}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, monthlyBudget: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Save preferences
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[30px] border border-rose-200 bg-rose-50/50 p-6 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/10 lg:p-8">
            <h3 className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-300">Delete Account</h3>
            <p className="mt-2 text-sm text-rose-600/80 dark:text-rose-300/80">
              Permanently delete your account and all your data. This action cannot be undone. The backend endpoint is not yet available, so logout remains the safe supported action for now.
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-6 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
