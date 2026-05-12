import { Link } from 'react-router-dom'
import { CommunityProjectCard } from '../components/community/CommunityProjectCard'
import { EmptyState, PageHeader, QueryState } from '../components/Ui'
import { usePendingCommunityProjects } from '../hooks/queries'

export function TownManagerCommunityProjectsPage() {
  const pendingQuery = usePendingCommunityProjects()

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Manager" title="Pending community initiative approvals" description="Review each submission before it becomes visible in Get Involved." />
      <QueryState isLoading={pendingQuery.isLoading} error={pendingQuery.error} empty={(pendingQuery.data?.data?.length ?? 0) === 0}>
        {(pendingQuery.data?.data?.length ?? 0) === 0 ? (
          <EmptyState title="No pending initiatives" body="New submissions waiting for verification will appear here." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {(pendingQuery.data?.data ?? []).map((project) => (
              <CommunityProjectCard
                key={project.id}
                project={project}
                compact
                action={<Link to={`/dashboard/town-manager/community-projects/${project.id}`} className="text-sm font-semibold text-lokals-purple">Review submission</Link>}
              />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
