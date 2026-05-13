import { useState } from 'react'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useApproveCommunityImpactTransaction, useAwardCommunityImpact, usePendingCommunityImpactTransactions, useRejectCommunityImpactTransaction } from '../../hooks/queries'
import type { CommunityImpactTransaction } from '../../types'

export function CommunityImpactPendingPage() {
  const pendingQuery = usePendingCommunityImpactTransactions()
  const award = useAwardCommunityImpact()
  const approve = useApproveCommunityImpactTransaction()
  const reject = useRejectCommunityImpactTransaction()
  const items = pendingQuery.data?.data ?? []
  const [userId, setUserId] = useState('')
  const [points, setPoints] = useState('25')
  const [reason, setReason] = useState('Exceptional community contribution')
  const [category, setCategory] = useState('town_manager_bonus')

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Manager" title="Pending Community Impact approvals" description="Approve only verified positive actions. No penalties, no public deed logs." />
      <SectionCard className="bg-white p-5">
        <h2 className="text-lg font-semibold text-lokals-charcoal">Award points manually</h2>
        <p className="mt-2 text-sm text-lokals-muted">Use this only for verified exceptional contribution or contributions that need careful manual handling.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" />
          <Input value={points} onChange={(event) => setPoints(event.target.value)} placeholder="Points" />
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
          <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
        </div>
        <div className="mt-4">
          <Button disabled={award.isPending} onClick={() => award.mutate({ user_id: Number(userId), points: Number(points), reason, category })}>
            {award.isPending ? 'Creating award...' : 'Create pending award'}
          </Button>
        </div>
      </SectionCard>
      <QueryState isLoading={pendingQuery.isLoading} error={pendingQuery.error}>
        <SectionCard className="bg-white p-5">
          {items.length === 0 ? <EmptyState title="No pending approvals" body="Fresh Community Impact reviews will appear here." /> : (
            <div className="space-y-3">
              {items.map((item: CommunityImpactTransaction) => (
                <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <p className="font-semibold text-lokals-charcoal">{item.reason}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.points} points | {item.category.replaceAll('_', ' ')}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button disabled={approve.isPending} onClick={() => approve.mutate({ id: item.id })}>Approve</Button>
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
