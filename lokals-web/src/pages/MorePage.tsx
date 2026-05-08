import { Bell, Building2, CalendarDays, Home, Newspaper, Package, Settings, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActionTile, PageHeader, SectionCard } from '../components/Ui'

export function MorePage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="More" title="Everything else, without cluttering the main app" description="Secondary actions live here so the main experience stays simple and fast." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ActionTile to="/directory" label="Directory" subtitle="Police, clinics, schools, businesses" icon={Building2} />
        <ActionTile to="/accommodation" label="Stay" subtitle="Rentals, homes, B&Bs" icon={Home} />
        <ActionTile to="/delivery" label="Send Parcel" subtitle="Pickup and drop-off requests" icon={Package} />
        <ActionTile to="/activity" label="Alerts & Activity" subtitle="City alerts and updates" icon={Bell} />
        <ActionTile to="/news" label="News" subtitle="Aggregated local stories and announcements" icon={Newspaper} />
        <ActionTile to="/events" label="Events" subtitle="Local events, tickets, and reminders" icon={CalendarDays} />
        <ActionTile to="/settings" label="Settings" subtitle="Location, theme, notifications" icon={Settings} />
        <ActionTile to="/sos" label="SOS" subtitle="Emergency support" icon={ShieldAlert} />
      </section>
      <SectionCard className="bg-white">
        <h2 className="text-lg font-semibold text-lokals-charcoal">Need help fast?</h2>
        <p className="mt-2 text-sm text-lokals-muted">LOKALS is optimized around one main path: find a trusted local service and contact or book quickly.</p>
        <div className="mt-4">
          <Link to="/services" className="text-sm font-semibold text-lokals-green">Open Get Help</Link>
        </div>
      </SectionCard>
    </div>
  )
}
