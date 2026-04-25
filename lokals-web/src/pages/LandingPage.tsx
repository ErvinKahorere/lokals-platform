import { ArrowRight, BellRing, BriefcaseBusiness, Building2, MapPinned, Package, ShieldCheck, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Ui'
import { GlassCard } from '../components/glass/GlassCard'

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
      <section className="glass-surface overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,rgba(49,46,129,0.98)_0%,rgba(79,70,229,0.92)_45%,rgba(124,58,237,0.9)_100%)] px-6 py-8 text-white shadow-soft-lg md:px-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">LOKALS CITY PLATFORM</p>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">Everything in your city, in one app.</h1>
              <p className="max-w-xl text-base text-white/80 md:text-lg">
                LOKALS helps people get help, earn, shop, stay informed, and connect with the city around them. It also gives businesses and municipalities one platform to manage it all.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register"><Button variant="accent">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/services"><Button variant="secondary">Explore City</Button></Link>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <GlassCard className="bg-white/14 text-white">
                <p className="text-2xl font-semibold">1 app</p>
                <p className="mt-1 text-sm text-white/75">For services, jobs, shopping, delivery, and city updates.</p>
              </GlassCard>
              <GlassCard className="bg-white/14 text-white">
                <p className="text-2xl font-semibold">Local first</p>
                <p className="mt-1 text-sm text-white/75">Built around town, area, and real nearby action.</p>
              </GlassCard>
              <GlassCard className="bg-white/14 text-white">
                <p className="text-2xl font-semibold">Role aware</p>
                <p className="mt-1 text-sm text-white/75">Useful for citizens, businesses, and city teams.</p>
              </GlassCard>
            </div>
          </div>
          <GlassCard className="space-y-4 bg-white/12 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">How it works</p>
            <div className="space-y-4">
              {[
                ['Find', 'Search services, products, jobs, and places around you.'],
                ['Book', 'Choose a provider, view rates, and confirm with less typing.'],
                ['Connect', 'Follow organizations, get alerts, and stay close to your city.'],
              ].map(([title, body], index) => (
                <div key={title} className="rounded-[22px] bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Step {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-white/75">{body}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map(({ title, body, icon: Icon, to }) => (
          <GlassCard key={title} className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-lokals-charcoal">{title}</h2>
              <p className="mt-2 text-sm text-lokals-muted">{body}</p>
            </div>
            <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-lokals-purple">
              Open {title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-4">
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
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
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
        </GlassCard>
      </section>

      <section className="rounded-[28px] border border-lokals-border bg-lokals-surface/80 px-6 py-8 text-center shadow-card backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-lokals-charcoal">Mobile downloads are coming soon.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-lokals-muted">
          LOKALS is already designed mobile-first. This landing page sets up future app store launches while keeping the web experience ready today.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/register"><Button>Get started</Button></Link>
          <Link to="/directory"><Button variant="secondary">Explore the directory</Button></Link>
        </div>
      </section>

      <footer className="flex flex-col gap-3 rounded-[24px] border border-lokals-border bg-lokals-surface/70 px-6 py-5 text-sm text-lokals-muted shadow-card backdrop-blur-xl md:flex-row md:items-center md:justify-between">
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
