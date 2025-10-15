import { useState } from 'react';

const categories = ['Internet', 'Home', 'TV', 'Electric', 'Mobile'] as const;

type Category = (typeof categories)[number];

type Provider = {
  name: string;
  description: string;
  phone: string;
};

const providerCatalog: Record<Category, Provider[]> = {
  Internet: [
    { name: 'Spectrum', description: 'High-speed home internet with flexible bundles.', phone: '1-800-555-0115' },
    { name: 'AT&T Fiber', description: 'Gigabit fiber plans with Wi-Fi equipment included.', phone: '1-800-555-0199' }
  ],
  Home: [
    { name: 'ADT Home', description: 'Smart security and monitoring packages.', phone: '1-800-555-0147' },
    { name: 'Vivint', description: 'Connected home devices with professional support.', phone: '1-800-555-0152' }
  ],
  TV: [
    { name: 'DirecTV', description: 'Every sports channel plus local networks.', phone: '1-800-555-0188' },
    { name: 'Dish', description: 'Affordable plans with 99% signal reliability.', phone: '1-800-555-0166' }
  ],
  Electric: [
    { name: 'GreenGrid Power', description: 'Fixed-rate electricity and renewable add-ons.', phone: '1-800-555-0123' },
    { name: 'BrightSource', description: 'Budget-friendly energy plans with autopay discounts.', phone: '1-800-555-0174' }
  ],
  Mobile: [
    { name: 'Verizon', description: 'Nationwide 5G coverage with family plans.', phone: '1-800-555-0135' },
    { name: 'T-Mobile', description: 'Unlimited plans with built-in streaming perks.', phone: '1-800-555-0190' }
  ]
};

const tollFreeNumber = '1-888-555-2025';

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('Internet');
  const providers = providerCatalog[activeCategory];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.4em] text-primary">PayBillsWithUs</p>
            <h1 className="text-2xl font-semibold text-slate-900">25% OFF Every Month — Call Now</h1>
          </div>
          <a
            href={`tel:${tollFreeNumber}`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600"
          >
            Call {tollFreeNumber}
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Let our agents handle every bill — you enjoy automatic savings.
            </h2>
            <p className="text-lg text-slate-600">
              Discover the best providers for internet, home, TV, electric, and mobile services. Our experts enroll you over the phone,
              apply your 25% discount, and manage ongoing payments securely.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${tollFreeNumber}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600"
              >
                Call us to enroll
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
              >
                View FAQs
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-6 rounded-xl bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
              <div>
                <p className="font-semibold text-slate-900">Secure portal access</p>
                <p>Track your profile, payment methods, and receipts once enrolled.</p>
              </div>
              <div className="h-12 w-px bg-slate-200" role="presentation"></div>
              <div>
                <p className="font-semibold text-slate-900">Real agents, real savings</p>
                <p>Every account is verified by phone to guarantee eligibility.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-surface to-blue-50 p-8 shadow-xl">
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="zip">
                  Check providers in your ZIP
                </label>
                <input
                  id="zip"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 30301"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600"
              >
                Search providers
              </button>
              <p className="text-xs text-slate-500">
                We&apos;ll match you to the top providers in your area. Sign up by phone to activate savings.
              </p>
            </form>
          </div>
        </section>

        <section aria-labelledby="category-heading" className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 id="category-heading" className="text-2xl font-semibold text-slate-900">
                Explore providers by category
              </h3>
              <p className="text-sm text-slate-600">
                Choose a category to view marquee providers. Prefer to talk? Call us anytime.
              </p>
            </div>
            <a href={`tel:${tollFreeNumber}`} className="text-sm font-semibold text-primary hover:underline">
              Speak to an agent →
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  activeCategory === category
                    ? 'border-primary bg-primary text-white shadow'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-primary/60 hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {providers.map((provider) => (
              <article key={provider.name} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-slate-900">{provider.name}</h4>
                  <p className="text-sm text-slate-600">{provider.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Call to enroll</span>
                  <a
                    href={`tel:${provider.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-200"
                  >
                    {provider.phone}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-xl lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-slate-900">Already enrolled?</h3>
            <p className="mt-3 text-sm text-slate-600">
              Log in to view your dashboard, manage your profile, and see the latest bills and receipts shared by your assigned agent.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
              User Login
            </button>
            <button className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
              Agent Login
            </button>
            <button className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
              Admin Login
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 text-sm text-slate-600">
            <p>© {new Date().getFullYear()} PayBillsWithUs. All rights reserved.</p>
            <div className="flex gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
              <a className="hover:text-primary" href="#">FAQ</a>
              <a className="hover:text-primary" href="#">Privacy</a>
              <a className="hover:text-primary" href="#">Terms</a>
              <a className="hover:text-primary" href="#">Contact</a>
            </div>
          </div>
          <a
            href={`tel:${tollFreeNumber}`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
          >
            Call {tollFreeNumber}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
