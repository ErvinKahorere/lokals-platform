import { Link } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusPill } from '../../components/Ui'
import { useCommunityImpactDashboard } from '../../hooks/queries'
import type { CommunityImpactAccount, CommunityImpactBadge, CommunityImpactTransaction } from '../../types'

type WrappedResource<T> = { data: T } | T
type WrappedList<T> = { data?: T[] } | T[] | null | undefined

const unwrapAccount = (payload: WrappedResource<CommunityImpactAccount>): CommunityImpactAccount => ('data' in payload ? payload.data : payload)
const unwrapBadge = (payload: WrappedResource<CommunityImpactBadge>): CommunityImpactBadge => ('data' in payload ? payload.data : payload)
const unwrapList = <T,>(payload: WrappedList<T>): T[] => (Array.isArray(payload) ? payload : (payload?.data ?? []))

export function CommunityImpactDashboardPage() {
  const dashboardQuery = useCommunityImpactDashboard()
  const account = dashboardQuery.data ? unwrapAccount(dashboardQuery.data.account) : undefined
  const recentApproved = unwrapList<CommunityImpactTransaction>(dashboardQuery.data?.recent_approved)
  const pending = unwrapList<CommunityImpactTransaction>(dashboardQuery.data?.pending_transactions)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Community Impact" title="Community Impact Rewards" description="Verified positive contribution, private by default, and never a punitive score." />
      <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error}>
        {!account ? <EmptyState title="Community Impact unavailable" body="Please try again shortly." /> : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Available points', account.available_points],
                ['Lifetime points', account.lifetime_points],
                ['Redeemed points', account.redeemed_points],
                ['Level', account.current_level],
              ].map(([label, value]) => (
                <SectionCard key={String(label)} className="bg-white p-5">
                  <p className="text-sm text-lokals-muted">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-lokals-charcoal">{value}</p>
                </SectionCard>
              ))}
            </div>

            <SectionCard className="bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={account.current_level} tone="accent" />
                <StatusPill value={account.public_leaderboard_opt_in ? 'Leaderboard visible' : 'Leaderboard private'} tone={account.public_leaderboard_opt_in ? 'success' : 'neutral'} />
                {account.current_badge ? <StatusPill value={unwrapBadge(account.current_badge).title} tone="success" /> : null}
              </div>
              <p className="mt-3 text-sm text-lokals-muted">
                {account.next_badge ? `Next milestone: ${unwrapBadge(account.next_badge).title} at ${unwrapBadge(account.next_badge).points_threshold ?? 0} points.` : 'You have reached the current top badge threshold.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/community-impact/history"><Button variant="secondary">Points history</Button></Link>
                <Link to="/community-impact/rewards"><Button variant="secondary">Rewards</Button></Link>
                <Link to="/community-impact/redemptions"><Button variant="secondary">My redemptions</Button></Link>
                <Link to="/community-impact/leaderboard"><Button variant="secondary">Leaderboard</Button></Link>
                <Link to="/community-impact/privacy"><Button variant="secondary">Privacy settings</Button></Link>
              </div>
            </SectionCard>

            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard className="bg-white p-5">
                <h2 className="text-lg font-semibold text-lokals-charcoal">Recent approved activity</h2>
                <p className="mt-2 text-sm text-lokals-muted">Only you and authorized reviewers can see the detailed reasons here.</p>
                <div className="mt-4 space-y-3">
                  {recentApproved.length === 0 ? <EmptyState title="No approved points yet" body="Verified contributions will show up here once they are approved." /> : recentApproved.map((item) => (
                    <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                      <p className="font-semibold text-lokals-charcoal">{item.reason}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.points} points | {item.category.replaceAll('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard className="bg-white p-5">
                <h2 className="text-lg font-semibold text-lokals-charcoal">Pending verification</h2>
                <p className="mt-2 text-sm text-lokals-muted">Pending items do not become spendable until review is complete.</p>
                <div className="mt-4 space-y-3">
                  {pending.length === 0 ? <EmptyState title="Nothing pending right now" body="Fresh verified actions will appear here when they need review." /> : pending.map((item) => (
                    <div key={item.id} className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                      <p className="font-semibold text-lokals-charcoal">{item.reason}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.points} points | awaiting review</p>
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
