import { EmptyState, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useCommunityImpactRedemptions } from '../../hooks/queries'
import type { CommunityImpactRedemption, CommunityImpactReward } from '../../types'

const rewardTitle = (reward?: CommunityImpactReward | { data: CommunityImpactReward } | null) =>
  reward ? ('data' in reward ? reward.data.title : reward.title) : 'Reward'

export function CommunityImpactRedemptionsPage() {
  const query = useCommunityImpactRedemptions()
  const items = query.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My rewards" title="My Redemptions" description="Track reward requests from approval through fulfillment." />
      <QueryState isLoading={query.isLoading} error={query.error}>
        <SectionCard className="bg-white p-5">
          {items.length === 0 ? <EmptyState title="No reward requests yet" body="Requested rewards will show up here." /> : (
            <div className="space-y-3">
              {items.map((item: CommunityImpactRedemption) => (
                <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <p className="font-semibold text-lokals-charcoal">{rewardTitle(item.reward)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.points_spent} points • {item.status.replaceAll('_', ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </QueryState>
    </div>
  )
}
