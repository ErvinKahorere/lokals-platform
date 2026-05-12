import { Button, EmptyState, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useCommunityImpactRewards, useRedeemCommunityImpactReward } from '../../hooks/queries'
import type { CommunityImpactReward } from '../../types'

export function CommunityImpactRewardsPage() {
  const query = useCommunityImpactRewards()
  const redeem = useRedeemCommunityImpactReward()
  const items = query.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Rewards" title="Rewards Marketplace" description="Approved points can be exchanged for active sponsor rewards without exposing your private contribution history." />
      <QueryState isLoading={query.isLoading} error={query.error}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? <EmptyState title="No rewards yet" body="Sponsored rewards will appear here as the pilot grows." /> : items.map((reward: CommunityImpactReward) => (
            <SectionCard key={reward.id} className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-green">{reward.reward_type}</p>
              <h2 className="mt-2 text-lg font-semibold text-lokals-charcoal">{reward.title}</h2>
              <p className="mt-2 text-sm text-lokals-muted">{reward.description}</p>
              <p className="mt-4 text-2xl font-semibold text-lokals-charcoal">{reward.points_required} pts</p>
              <p className="mt-1 text-sm text-lokals-muted">{reward.sponsor_name ?? 'Community sponsor'}</p>
              <div className="mt-4">
                <Button disabled={redeem.isPending} onClick={() => redeem.mutate(reward.id)}>{redeem.isPending ? 'Requesting...' : 'Redeem'}</Button>
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
