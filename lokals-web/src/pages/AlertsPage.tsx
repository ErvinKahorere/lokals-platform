import { useMemo, useState } from 'react'
import { BellRing, Megaphone, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, QueryState } from '../components/Ui'
import { useAlertsFeed, useFollowingFeed } from '../hooks/queries'

const tabs = ['all', 'following', 'urgent', 'municipal', 'promotions'] as const

export function AlertsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('all')
  const alertsQuery = useAlertsFeed()
  const followingFeedQuery = useFollowingFeed()
  const alerts = alertsQuery.data?.data ?? []
  const following = followingFeedQuery.data?.data ?? []

  const items = useMemo(() => {
    const baseAlerts = alerts.map((item) => ({
      key: item.id,
      source: item.source_type === 'municipal_alert' ? 'Municipal alert' : item.source_type === 'announcement' ? 'Announcement' : item.source_type === 'job' ? 'Job alert' : 'Local alert',
      title: item.title,
      body: item.body,
      severity: item.severity ?? 'normal',
      location: item.location,
      timestamp: item.timestamp,
      to: '/alerts',
      type: item.source_type,
    }))
    const followed = following.map((item) => ({
      key: `followed-${item.id}`,
      source: item.category ?? 'Followed source',
      title: item.title ?? item.name ?? 'Followed update',
      body: item.body ?? 'Update from a followed organization or provider.',
      severity: 'normal',
      location: item.location,
      timestamp: item.timestamp ?? item.created_at,
      to: '/activity',
      type: 'following',
    }))

    const merged = tab === 'following'
      ? followed
      : tab === 'urgent'
        ? baseAlerts.filter((item) => ['critical', 'high', 'urgent'].includes(item.severity))
        : tab === 'municipal'
          ? baseAlerts.filter((item) => item.type === 'municipal_alert')
        : tab === 'promotions'
          ? baseAlerts.filter((item) => item.type === 'announcement' || /sale|promo|discount/i.test(item.title + item.body))
          : [...baseAlerts, ...followed]

    return merged
      .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
      .slice(0, 20)
  }, [alerts, following, tab])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Alerts"
        title="Local alerts"
        description="Actionable updates from the city, followed organizations, and local activity around you."
        actions={<Link to="/notifications" className="text-sm font-semibold text-lokals-purple">Open notifications</Link>}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === item ? 'bg-lokals-purple text-white' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}
          >
            {item === 'all' ? 'All' : item === 'following' ? 'Following' : item === 'urgent' ? 'Urgent' : item === 'municipal' ? 'Municipal' : 'Promotions'}
          </button>
        ))}
      </div>

      <QueryState isLoading={alertsQuery.isLoading || followingFeedQuery.isLoading} error={alertsQuery.error ?? followingFeedQuery.error} empty={items.length === 0}>
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const isCritical = ['critical', 'high', 'urgent'].includes(item.severity)
            const isPromotion = /promo|discount|sale/i.test(item.title + item.body)
            const Icon = isCritical ? ShieldAlert : isPromotion ? Megaphone : BellRing
            const tone = isCritical ? 'text-red-600 bg-red-50' : isPromotion ? 'text-amber-700 bg-amber-50' : 'text-lokals-purple bg-violet-50'

            return (
              <Link key={item.key} to={item.to} className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card transition hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-lokals-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-lokals-muted">{item.source}</span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${isCritical ? 'bg-red-50 text-red-600' : isPromotion ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{item.severity}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-lokals-charcoal">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-lokals-muted">{item.body}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-lokals-muted">{item.location ?? 'Okahandja, Namibia'}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{item.timestamp ?? 'Recent'}</p>
                      </div>
                      <span className="text-sm font-semibold text-lokals-purple">{item.type === 'following' ? 'Open activity' : item.type === 'job' ? 'View job' : 'Open alert'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </QueryState>
    </div>
  )
}
