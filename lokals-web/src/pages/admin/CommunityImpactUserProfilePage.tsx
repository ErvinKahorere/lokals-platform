import { useParams } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useCommunityImpactUserProfile } from '../../hooks/queries'

const unwrapList = <T,>(payload: any): T[] => Array.isArray(payload) ? payload : (payload?.data ?? [])

export function CommunityImpactUserProfilePage() {
  const { userId } = useParams()
  const query = useCommunityImpactUserProfile(userId)
  const transactions = unwrapList<any>(query.data?.transactions)
  const redemptions = unwrapList<any>(query.data?.redemptions)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Resident impact profile" description="A private review surface for Community Impact history, approvals, and redemptions." />
      <QueryState isLoading={query.isLoading} error={query.error}>
        {!query.data ? <EmptyState title="Resident profile unavailable" body="Please try again shortly." /> : (
          <>
            <SectionCard className="bg-white p-5">
              <h2 className="text-xl font-semibold text-lokals-charcoal">{query.data.user.name}</h2>
              <p className="mt-2 text-sm text-lokals-muted">{query.data.user.email ?? query.data.user.phone ?? 'Resident account'}</p>
            </SectionCard>
            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard className="bg-white p-5">
                <h3 className="text-lg font-semibold text-lokals-charcoal">Transactions</h3>
                <div className="mt-4 space-y-3">
                  {transactions.map((item) => (
                    <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                      <p className="font-semibold text-lokals-charcoal">{item.reason}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.points} points • {item.verification_status}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard className="bg-white p-5">
                <h3 className="text-lg font-semibold text-lokals-charcoal">Redemptions</h3>
                <div className="mt-4 space-y-3">
                  {redemptions.map((item) => (
                    <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                      <p className="font-semibold text-lokals-charcoal">{('data' in (item.reward ?? {}) ? item.reward?.data?.title : item.reward?.title) ?? 'Reward'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.points_spent} points • {item.status}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        )}
      </QueryState>
    </div>
  )
}
