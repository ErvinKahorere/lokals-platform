import { ArrowRight, BriefcaseBusiness, MapPin, ShieldAlert, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { GlassPanel } from '../glass/GlassPanel'

const slides = [
  { icon: MapPin, title: 'Everything in your city.', body: 'One app for services, jobs, delivery, alerts, listings, and city life.' },
  { icon: Sparkles, title: 'Find Help', body: 'Book services nearby instantly with clear actions and less typing.' },
  { icon: BriefcaseBusiness, title: 'Earn & Sell', body: 'Get jobs, offer skills, and post local items in a few taps.' },
  { icon: ShieldAlert, title: 'Stay Connected', body: 'Follow organizations, receive alerts, and stay safer every day.' },
]

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-lokals-purple text-white shadow-brand">
            <Icon className="h-6 w-6" />
          </div>
          <button aria-label="Skip onboarding" onClick={onComplete} className="flex h-10 w-10 items-center justify-center rounded-full bg-lokals-surface/70 text-lokals-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-lokals-purple">Welcome</p>
        <h2 className="mt-3 text-3xl font-semibold text-lokals-charcoal">{slide.title}</h2>
        <p className="mt-3 text-base text-lokals-muted">{slide.body}</p>
        <div className="mt-6 flex items-center gap-2">
          {slides.map((_, itemIndex) => (
            <span key={itemIndex} className={`h-2.5 rounded-full transition-all ${itemIndex === index ? 'w-8 bg-lokals-purple' : 'w-2.5 bg-lokals-border'}`} />
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onComplete}>Skip</Button>
          <Button onClick={() => {
            if (index === slides.length - 1) {
              onComplete()
              return
            }
            setIndex((current) => current + 1)
          }}>
            {index === slides.length - 1 ? 'Continue' : <>Next <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </GlassPanel>
    </div>
  )
}
