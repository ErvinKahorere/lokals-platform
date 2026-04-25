import { useFollowingFeed, useFollows } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'
import { ActivityTimeline, type ActivityTimelineItem } from '../../components/experience/ActivityTimeline'

export function FollowingFeedPage() {
  const feedQuery = useFollowingFeed()
  const followsQuery = useFollows()
  const feedItems = feedQuery.data?.data ?? []
  const follows = followsQuery.data?.data ?? []
  const timelineItems: ActivityTimelineItem[] = feedItems.map((item: any, index: number) => ({
    id: `${item.type ?? 'feed'}-${item.id ?? index}`,
    kind: item.type === 'job' ? 'job' : item.type === 'listing' ? 'listing' : item.type === 'report' ? 'report' : 'booking',
    title: item.title ?? item.name ?? 'Follow update',
    message: item.body ?? item.description ?? 'A followed source has a new update.',
    timestamp: item.created_at ?? 'Recently',
    status: item.priority ?? item.type ?? 'update',
    href: '/activity',
  }))

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard" title="Activity" description="A single low-data timeline for bookings, alerts, reports, jobs, and followed entities." />
      <SectionCard className="bg-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Followed sources</h3>
          <StatusBadge value={`${follows.length} following`} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {follows.map((follow: any) => (
            <span key={follow.id} className="rounded-full bg-[var(--bg)] px-3 py-2 text-xs font-semibold">
              {follow.followable?.name ?? follow.followable?.title ?? `Item ${follow.followable_id}`}
            </span>
          ))}
        </div>
      </SectionCard>
      <QueryState isLoading={feedQuery.isLoading || followsQuery.isLoading} error={feedQuery.error ?? followsQuery.error} empty={feedItems.length === 0}>
        {feedItems.length === 0 ? (
          <EmptyState title="Nothing new from followed sources" body="As organizations and providers publish alerts, they will appear here." />
        ) : (
          <ActivityTimeline items={timelineItems} />
        )}
      </QueryState>
    </div>
  )
}
