import { Link } from 'react-router-dom'
import { CommunityProjectCard } from '../components/community/CommunityProjectCard'
import { Button, EmptyState, PageHeader, QueryState } from '../components/Ui'
import { useMyCommunityProjects } from '../hooks/queries'

export function MyCommunityProjectsPage() {
  const projectsQuery = useMyCommunityProjects()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My initiatives"
        title="Projects I submitted"
        description="Track approval status, verification notes, and support progress across your community initiatives."
        actions={<Link to="/get-involved/submit"><Button>Submit another project</Button></Link>}
      />
      <QueryState isLoading={projectsQuery.isLoading} error={projectsQuery.error} empty={(projectsQuery.data?.data?.length ?? 0) === 0}>
        {(projectsQuery.data?.data?.length ?? 0) === 0 ? (
          <EmptyState title="No projects submitted yet" body="Start a verified local initiative for donations, volunteers, or community support." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {(projectsQuery.data?.data ?? []).map((project) => (
              <CommunityProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
