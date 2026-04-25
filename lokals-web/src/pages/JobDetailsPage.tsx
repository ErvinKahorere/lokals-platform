import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { TrustRow } from '../components/experience/TrustRow'
import { useJobs } from '../hooks/queries'
import { getDisplayDistance, getDisplayPrice } from '../lib/display'

export function JobDetailsPage() {
  const { id } = useParams()
  const jobsQuery = useJobs()
  const job = useMemo(() => jobsQuery.data?.data.find((item) => String(item.id) === id), [id, jobsQuery.data])

  return (
    <QueryState isLoading={jobsQuery.isLoading} error={jobsQuery.error} empty={!job}>
      {!job ? (
        <EmptyState title="Job not found" body="This job may have closed or moved out of the current feed." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Job details" title={job.title} description={job.description} />
          <SectionCard className="bg-white">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">{job.employment_type}</span>
              <span className="rounded-full bg-lokals-gold-soft px-3 py-2 text-xs font-semibold text-lokals-charcoal">{job.compensation ? getDisplayPrice(job.compensation) : 'Negotiable'}</span>
            </div>
            <div className="mt-4">
              <TrustRow
                ratingLabel={job.applications_count ? `${job.applications_count} applicants` : 'Be one of the first'}
                distanceLabel={getDisplayDistance(job.distance_km, job.location)}
                completedLabel={job.location ?? 'Local opportunity'}
              />
            </div>
            {job.skills?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{skill}</span>)}
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/jobs" className="sm:flex-1"><Button className="w-full">Apply</Button></Link>
              <ContactActions name={job.title} className="sm:flex-1 flex flex-wrap gap-2" />
            </div>
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}

