import { ArrowRight, BellRing, BriefcaseBusiness, Building2, MapPinned, Package, ShieldCheck, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Ui'

const featureCards = [
  { title: 'Services', body: 'Find trusted providers, compare rates, and book faster.', icon: ShieldCheck, to: '/services' },
  { title: 'Jobs', body: 'Discover local work, hire nearby talent, and move quickly.', icon: BriefcaseBusiness, to: '/jobs' },
  { title: 'Store', body: 'Shop local products and contact sellers without leaving the app.', icon: Store, to: '/store' },
  { title: 'Delivery', body: 'Request parcel delivery with a simple, location-first flow.', icon: Package, to: '/delivery' },
  { title: 'Directory', body: 'Reach clinics, police, schools, and businesses in one place.', icon: Building2, to: '/directory' },
  { title: 'Alerts', body: 'Stay informed with city notices, outages, and promotions near you.', icon: BellRing, to: '/activity' },
]

export function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-white px-6 py-8 shadow-card md:px-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <img src="/brand/lokals-logo.svg" alt="LOKALS" className="h-10 w-auto" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lokals-purple">LOKALS CITY PLATFORM</p>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-lokals-charcoal md:text-5xl">Everything in your city, in one app.</h1>
              <p className="max-w-xl text-base text-lokals-muted md:text-lg">
                LOKALS helps people get help, earn, shop, stay informed, and connect with the city around them. It also gives businesses and municipalities one platform to manage it all.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register"><Button>Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/services"><Button variant="secondary">Explore City</Button></Link>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {[
                ['1 app', 'For services, jobs, shopping, delivery, and city updates.'],
                ['Local first', 'Built around town, area, and real nearby action.'],
                ['Role aware', 'Useful for citizens, businesses, and city teams.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[24px] border border-lokals-border bg-lokals-surface p-5 shadow-card">
                  <p className="text-2xl font-semibold text-lokals-charcoal">{title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-[28px] border border-lokals-border bg-lokals-surface p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lokals-green">How it works</p>
            <div className="space-y-4">
              {[
                ['Find', 'Search services, products, jobs, and places around you.'],
                ['Book', 'Choose a provider, view rates, and confirm with less typing.'],
                ['Connect', 'Follow organizations, get alerts, and stay close to your city.'],
              ].map(([title, body], index) => (
                <div key={title} className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-green">Step {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map(({ title, body, icon: Icon, to }) => (
          <div key={title} className="flex h-full flex-col justify-between rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-lokals-charcoal">{title}</h2>
              <p className="mt-2 text-sm text-lokals-muted">{body}</p>
            </div>
            <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-lokals-green">
              Open {title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-gold/20 text-amber-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-lokals-charcoal">For Businesses</h2>
              <p className="text-sm text-lokals-muted">Reach nearby customers, manage products and services, and publish updates.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-lokals-muted">
            <li>Manage services, rates, availability, and followers in one dashboard.</li>
            <li>Publish promotions and announcements without extra tools.</li>
            <li>Keep your profile, store, and booking experience in sync.</li>
          </ul>
          <Link to="/register"><Button>Join as a business</Button></Link>
        </div>

        <div className="space-y-4 rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-lokals-charcoal">For Cities</h2>
              <p className="text-sm text-lokals-muted">Communicate with residents, manage reports, and monitor city activity with clarity.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-lokals-muted">
            <li>Publish city alerts and emergency notices with higher trust.</li>
            <li>Track reports, response time, and the most active areas.</li>
            <li>Keep the directory useful with verified public services.</li>
          </ul>
          <Link to="/login"><Button variant="secondary">Town manager access</Button></Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-lokals-border bg-white px-6 py-8 text-center shadow-card">
        <h2 className="text-2xl font-semibold text-lokals-charcoal">Mobile downloads are coming soon.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-lokals-muted">
          LOKALS is already designed mobile-first. This landing page sets up future app store launches while keeping the web experience ready today.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/register"><Button>Get started</Button></Link>
          <Link to="/directory"><Button variant="secondary">Explore the directory</Button></Link>
        </div>
      </section>

      <footer className="flex flex-col gap-3 rounded-[24px] border border-lokals-border bg-white px-6 py-5 text-sm text-lokals-muted shadow-card md:flex-row md:items-center md:justify-between">
        <p>LOKALS helps citizens, businesses, and city teams move faster together.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/settings">Settings</Link>
          <Link to="/directory">Directory</Link>
          <Link to="/services">Services</Link>
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  )
}
