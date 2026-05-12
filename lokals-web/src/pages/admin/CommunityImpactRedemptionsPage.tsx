import { Button, EmptyState, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useApproveCommunityImpactRedemption, useCommunityImpactRedemptionsAdmin, useFulfillCommunityImpactRedemption, useRejectCommunityImpactRedemption } from '../../hooks/queries'
import type { CommunityImpactRedemption, CommunityImpactReward } from '../../types'

const rewardTitle = (reward?: CommunityImpactReward | { data: CommunityImpactReward } | null) =>
  reward ? ('data' in reward ? reward.data.title : reward.title) : 'Reward'

export function CommunityImpactRedemptionsAdminPage() {
  const query = useCommunityImpactRedemptionsAdmin()
  const approve = useApproveCommunityImpactRedemption()
  const fulfill = useFulfillCommunityImpactRedemption()
  const reject = useRejectCommunityImpactRedemption()
  const items = query.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Community Impact redemptions" description="Approve, fulfill, or reject reward requests with a clean resident-facing audit trail." />
      <QueryState isLoading={query.isLoading} error={query.error}>
        <SectionCard className="bg-white p-5">
          {items.length === 0 ? <EmptyState title="No redemptions yet" body="Reward requests will appear here." /> : (
            <div className="space-y-3">
              {items.map((item: CommunityImpactRedemption) => (
                <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <p className="font-semibold text-lokals-charcoal">{rewardTitle(item.reward)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.points_spent} points • {item.status.replaceAll('_', ' ')}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button disabled={approve.isPending} onClick={() => approve.mutate({ id: item.id })}>Approve</Button>
                    <Button variant="secondary" disabled={fulfill.isPending} onClick={() => fulfill.mutate({ id: item.id })}>Fulfill</Button>
                    <Button variant="secondary" disabled={reject.isPending} onClick={() => reject.mutate({ id: item.id })}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </QueryState>
    </div>
  )
}
