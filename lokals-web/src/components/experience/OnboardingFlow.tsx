import { ArrowRight, BellRing, BriefcaseBusiness, Building2, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'

const slides = [
  { icon: MapPin, title: 'Everything in your city', body: 'Find services, jobs, events, alerts and help around Okahandja.' },
  { icon: Building2, title: 'Get help nearby', body: 'Book trusted providers, find public services, and contact local businesses.' },
  { icon: BellRing, title: 'Stay connected', body: 'Receive alerts, local news, events and town updates.' },
  { icon: BriefcaseBusiness, title: 'Built for Okahandja', body: 'LOKALS is currently piloting in Okahandja.' },
]

export function OnboardingFlow({
  onGetStarted,
  onSkip,
  onLogin,
}: {
  onGetStarted: () => void
  onSkip: () => void
  onLogin: () => void
}) {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.45),_transparent_38%),linear-gradient(135deg,#6D28D9_0%,#8B5CF6_42%,#A78BFA_100%)] p-6 shadow-[0_28px_80px_rgba(76,29,149,0.24)] md:p-8">
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(to_top,rgba(255,255,255,0.14),transparent)]" />
      <div className="absolute left-[-2rem] top-16 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-12 right-[-1rem] h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <section className="relative mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onSkip} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            Skip
          </button>
          <button type="button" onClick={onLogin} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            Login
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-5">
            <img src="/brand/lokals-logo.svg" alt="LOKALS" className="h-11 w-auto brightness-0 invert" />
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <MapPin className="h-3.5 w-3.5" />
              Okahandja Pilot
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-white/12 shadow-[0_18px_46px_rgba(15,23,42,0.15)]">
              <Icon className="h-9 w-9 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-semibold leading-tight text-white">{slide.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/82">{slide.body}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/20 bg-white/12 p-6 shadow-[0_18px_46px_rgba(15,23,42,0.15)] backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              {slides.map((item, itemIndex) => {
                const ItemIcon = item.icon
                const active = itemIndex === index
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setIndex(itemIndex)}
                    className={`rounded-[22px] border p-4 text-left transition ${
                      active
                        ? 'border-white/50 bg-white text-lokals-charcoal shadow-card'
                        : 'border-white/15 bg-white/10 text-white hover:bg-white/14'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-violet-50 text-lokals-purple' : 'bg-white/10 text-white'}`}>
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-semibold">{item.title}</p>
                    <p className={`mt-2 text-sm leading-6 ${active ? 'text-lokals-muted' : 'text-white/80'}`}>{item.body}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((_, itemIndex) => (
            <span key={itemIndex} className={`h-2.5 rounded-full transition-all ${itemIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/35'}`} />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={onSkip}>Skip</Button>
          <Button onClick={() => {
            if (index === slides.length - 1) {
              onGetStarted()
              return
            }
            setIndex((current) => current + 1)
          }}>
            {index === slides.length - 1 ? 'Get Started' : <>Next <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </section>
    </div>
  )
}
