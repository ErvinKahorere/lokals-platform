import { EmptyState, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useCommunityImpactTransactions } from '../../hooks/queries'
import type { CommunityImpactTransaction } from '../../types'

export function CommunityImpactHistoryPage() {
  const query = useCommunityImpactTransactions()
  const items = query.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Private history" title="My Points History" description="Your detailed Community Impact history stays private to you plus authorized reviewers." />
      <QueryState isLoading={query.isLoading} error={query.error}>
        <SectionCard className="bg-white p-5">
          {items.length === 0 ? <EmptyState title="No points history yet" body="Verified contribution records will show here." /> : (
            <div className="space-y-3">
              {items.map((item: CommunityImpactTransaction) => (
                <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <p className="font-semibold text-lokals-charcoal">{item.reason}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.points} points • {item.verification_status.replaceAll('_', ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </QueryState>
    </div>
  )
}
