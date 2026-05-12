import { Link } from 'react-router-dom'
import { Card, EmptyState, PageHeader, QueryState } from '../components/Ui'
import { useMyCommunityPledges } from '../hooks/queries'

export function MyCommunityPledgesPage() {
  const pledgesQuery = useMyCommunityPledges()

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My pledges" title="Support I offered" description="See the donations, volunteer time, and services you pledged to community initiatives." />
      <QueryState isLoading={pledgesQuery.isLoading} error={pledgesQuery.error} empty={(pledgesQuery.data?.data?.length ?? 0) === 0}>
        {(pledgesQuery.data?.data?.length ?? 0) === 0 ? (
          <EmptyState title="No pledges yet" body="When you support a community project, your pledge history will appear here." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {(pledgesQuery.data?.data ?? []).map((pledge) => (
              <Card key={pledge.id} className="space-y-3 p-5">
                <h3 className="text-lg font-semibold text-lokals-charcoal">{pledge.project?.title ?? 'Community project'}</h3>
                <p className="text-sm leading-6 text-lokals-muted">{pledge.pledge_description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-lokals-purple-soft px-3 py-2 text-xs font-semibold text-lokals-purple">{pledge.pledge_type}</span>
                  {pledge.status ? <span className="rounded-full bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">{pledge.status}</span> : null}
                  {pledge.amount ? <span className="rounded-full bg-lokals-green-soft px-3 py-2 text-xs font-semibold text-lokals-green">N$ {pledge.amount}</span> : null}
                </div>
                {pledge.project ? <Link to={`/get-involved/${pledge.project.slug}`} className="text-sm font-semibold text-lokals-purple">Open project</Link> : null}
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
