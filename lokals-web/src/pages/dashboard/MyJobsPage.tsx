import { useMyJobs } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

export function MyJobsPage() {
  const jobsQuery = useMyJobs()
  const jobs = jobsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard" title="My jobs" description="Operator, seller, or employer job posts stay visible here." />
      <QueryState isLoading={jobsQuery.isLoading} error={jobsQuery.error} empty={jobs.length === 0}>
        {jobs.length === 0 ? (
          <EmptyState title="No jobs published" body="Posted jobs will show here with applications as they arrive." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job: any) => (
              <SectionCard key={job.id} className="bg-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{job.title}</h3>
                  <StatusBadge value={job.status} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{job.description}</p>
                <p className="mt-3 text-sm">{job.location}</p>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
