import { FlaskConical } from 'lucide-react'
import { isDemoMode } from '../../config/appMode'

export function DemoModeBanner() {
  if (!isDemoMode) {
    return null
  }

  return (
    <div className="border-b border-lokals-gold/30 bg-lokals-gold/15 px-4 py-2 text-sm text-lokals-charcoal">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <FlaskConical className="h-4 w-4 text-lokals-purple" />
        <span className="font-semibold">Demo Mode</span>
        <span className="text-lokals-muted">Browsing is live, but new submissions are simulated so testing stays safe.</span>
      </div>
    </div>
  )
}
