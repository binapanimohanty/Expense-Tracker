import { Link, Navigate } from 'react-router-dom';
import {
  HiChartBar,
  HiCheckCircle,
  HiCollection,
  HiCreditCard,
  HiPlay,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: HiCreditCard,
    title: 'Smart Tracking',
    description: 'Automatically categorize your transactions and track every penny with high-precision finance workflows.',
  },
  {
    icon: HiCollection,
    title: 'Flexible Budgets',
    description: 'Set custom limits for dining, shopping, or rent. Get notified before you overspend.',
  },
  {
    icon: HiChartBar,
    title: 'Actionable Insights',
    description: 'Visualize spending patterns with beautiful, interactive charts that tell the real story.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    note: '/month',
    description: 'Perfect for getting started.',
    cta: 'Get Started Free',
    featured: false,
    perks: ['Manual tracking', 'Basic reports', '1 account connection'],
  },
  {
    name: 'Pro',
    price: '$9.99',
    note: '/month',
    description: 'The full power for pros.',
    cta: 'Upgrade to Pro',
    featured: true,
    perks: ['Automatic bank sync', 'Advanced AI insights', 'Unlimited accounts', 'Data export (CSV/PDF)'],
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <HiCreditCard className="text-lg" />
            </div>
            <p className="text-lg font-black tracking-tight">ExpenseTracker</p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex">
            <a href="#features" className="transition hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#pricing" className="transition hover:text-slate-900 dark:hover:text-white">Pricing</a>
            <a href="#about" className="transition hover:text-slate-900 dark:hover:text-white">About</a>
          </nav>

          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-[#f7f9ff] px-4 py-16 sm:px-6 lg:px-10 lg:py-20 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr,1.05fr]">
            <div>
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                New: AI-Powered Insights is here
              </div>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                Master Your <span className="text-indigo-600">Finances</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500 dark:text-slate-400">
                Take control of your spending, set flexible budgets, and reach your financial goals with an intuitive dashboard and smart tracking tools.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-8 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <HiPlay className="text-sm" />
                  View Demo
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2">
                  <span className="h-5 w-5 rounded-full border-2 border-white bg-slate-200 dark:border-slate-950 dark:bg-slate-700" />
                  <span className="h-5 w-5 rounded-full border-2 border-white bg-slate-300 dark:border-slate-950 dark:bg-slate-600" />
                  <span className="h-5 w-5 rounded-full border-2 border-white bg-slate-400 dark:border-slate-950 dark:bg-slate-500" />
                </div>
                <span>Joined by 10,000+ savers</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-[24px] bg-slate-50 p-8 dark:bg-slate-950">
                <div className="mx-auto max-w-md rounded-[22px] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Dashboard</span>
                    <span>⋯</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                    <div className="grid grid-cols-8 items-end gap-2">
                      {[24, 30, 42, 38, 56, 62, 51, 78].map((value, index) => (
                        <div key={index} className="flex h-28 items-end">
                          <div className="w-full rounded-t-lg bg-cyan-400/80" style={{ height: `${value}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                    <div className="grid gap-2">
                      {['Groceries', 'Transport', 'Subscriptions'].map((item) => (
                        <div key={item} className="grid grid-cols-[1fr,auto] gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/70">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{item}</span>
                          <span className="text-slate-400">••••</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Everything You Need</h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Manage your money effectively with powerful tools designed for modern financial freedom.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <feature.icon className="text-2xl" />
                  </div>
                  <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#f7f9ff] px-4 py-20 sm:px-6 lg:px-10 dark:bg-slate-950/60">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Start for free and upgrade as you grow.</p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[28px] border bg-white p-8 text-left shadow-sm dark:bg-slate-900 ${
                  plan.featured
                    ? 'border-indigo-600 shadow-xl shadow-indigo-600/10 dark:border-indigo-400'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    Recommended
                  </span>
                )}
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="pb-2 text-slate-500 dark:text-slate-400">{plan.note}</span>
                </div>
                <p className="mt-3 text-slate-500 dark:text-slate-400">{plan.description}</p>
                <button
                  type="button"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                    plan.featured
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700'
                      : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10'
                  }`}
                >
                  {plan.cta}
                </button>
                <div className="mt-8 space-y-4">
                  {plan.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <HiCheckCircle className="text-indigo-600 dark:text-indigo-300" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="bg-indigo-50/60 px-4 py-20 sm:px-6 lg:px-10 dark:bg-slate-900/50">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Ready to save more?</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500 dark:text-slate-400">
              Join thousands of users who have transformed their financial lives. Start your 14-day free Pro trial today.
            </p>
            <Link
              to="/register"
              className="mt-10 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              Download Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-4 py-10 sm:px-6 lg:px-10 dark:border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr,1fr,1fr,1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <HiCreditCard className="text-base" />
              </div>
              <p className="font-black tracking-tight">ExpenseTracker</p>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-500 dark:text-slate-400">
              Building the future of personal finance management. One transaction at a time.
            </p>
          </div>

          <FooterColumn title="Product" items={['Features', 'Security', 'Integrations']} />
          <FooterColumn title="Company" items={['About Us', 'Careers', 'Blog']} />
          <FooterColumn title="Legal" items={['Privacy Policy', 'Terms of Service']} />
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
      <div className="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}
