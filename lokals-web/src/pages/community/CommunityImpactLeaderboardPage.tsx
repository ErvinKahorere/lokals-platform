import { useState } from 'react'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusPill } from '../../components/Ui'
import { useCommunityImpactLeaderboard } from '../../hooks/queries'
import type { CommunityImpactLeaderboardEntry } from '../../types'

export function CommunityImpactLeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time')
  const query = useCommunityImpactLeaderboard(period)
  const items = query.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Opt-in only" title="Community Impact Leaderboard" description="A positive leaderboard for residents who choose visibility. Detailed deeds are never shown publicly." />
      <div className="flex flex-wrap gap-3">
        {[
          ['weekly', 'Weekly'],
          ['monthly', 'Monthly'],
          ['all_time', 'All time'],
        ].map(([key, label]) => (
          <Button key={key} variant={period === key ? 'primary' : 'secondary'} onClick={() => setPeriod(key as typeof period)}>{label}</Button>
        ))}
      </div>
      <QueryState isLoading={query.isLoading} error={query.error}>
        <SectionCard className="bg-white p-5">
          {items.length === 0 ? <EmptyState title="No public entries yet" body="Residents can opt in from their Community Impact privacy settings." /> : (
            <div className="space-y-3">
              {items.map((item: CommunityImpactLeaderboardEntry) => (
                <div key={`${item.rank}-${item.display_name}`} className="flex items-center justify-between gap-4 rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">#{item.rank} {item.display_name}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{item.points} points</p>
                  </div>
                  <StatusPill value={item.level} tone="success" />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </QueryState>
    </div>
  )
}
