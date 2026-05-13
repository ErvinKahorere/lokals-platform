import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, TextArea } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { useApplyToJob, useJob, useJobs } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { getDisplayDistance, getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'
import { Card } from '../components/ui/Card'
import { JobCard } from '../components/Ui'

export function JobDetailsPage() {
  const { id } = useParams()
  const [message, setMessage] = useState('Ready to work and available nearby.')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const token = useAuthStore((state) => state.token)
  const jobQuery = useJob(id)
  const jobsQuery = useJobs()
  const applyToJob = useApplyToJob()
  const job = jobQuery.data
  const relatedJobs = (jobsQuery.data?.data ?? [])
    .filter((item) => item.id !== job?.id && ((item.skills ?? []).some((skill) => job?.skills?.includes(skill)) || item.employment_type === job?.employment_type))
    .slice(0, 3)

  return (
    <QueryState isLoading={jobQuery.isLoading || jobsQuery.isLoading} error={jobQuery.error ?? jobsQuery.error} empty={!job}>
      {!job ? (
        <EmptyState title="Job not found" body="This job may have closed or moved out of the current feed." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Job details" title={job.title} description={job.description} />

          <div className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
            <SectionCard className="bg-white">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{job.status === 'open' ? 'Open now' : job.status.replaceAll('_', ' ')}</span>
                <span className="rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-lokals-purple">{job.employment_type.replaceAll('_', ' ')}</span>
                <span className="rounded-full bg-lokals-gold-soft px-3 py-2 text-xs font-semibold text-lokals-charcoal">{job.compensation ? getDisplayPrice(job.compensation) : 'Negotiable'}</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Location</p>
                  <p className="mt-2 text-sm font-medium text-lokals-charcoal">{job.location ?? getDisplayDistance(job.distance_km, job.location)}</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Posted</p>
                  <p className="mt-2 text-sm font-medium text-lokals-charcoal">Recently</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Applications</p>
                  <p className="mt-2 text-sm font-medium text-lokals-charcoal">{job.applications_count ? `${job.applications_count} so far` : 'Be one of the first'}</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Poster</p>
                  <p className="mt-2 text-sm font-medium text-lokals-charcoal">{job.user?.name ?? job.organization?.name ?? 'Local poster'}</p>
                </Card>
              </div>
              {job.skills?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{skill}</span>)}
                </div>
              ) : null}
            </SectionCard>

            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Apply quickly</h3>
              <p className="mt-2 text-sm text-lokals-muted">Keep it short. If you already have the right skills, a small note is enough.</p>
              <div className="mt-4">
                <TextArea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} placeholder="Share a short note about your availability or experience." />
              </div>
              {feedback ? <p className="mt-3 text-sm font-medium text-emerald-700">{feedback}</p> : null}
              {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
              <div className="mt-4 flex flex-col gap-3">
                {token ? (
                  <Button
                    disabled={applyToJob.isPending}
                    onClick={async () => {
                      setFeedback('')
                      setError('')
                      try {
                        await applyToJob.mutateAsync({ jobId: job.id, message: message.trim() || undefined })
                        setFeedback('Application sent. The poster can contact you shortly.')
                      } catch (caught) {
                        setError(getApiErrorMessage(caught, 'Unable to apply right now.'))
                      }
                    }}
                  >
                    {applyToJob.isPending ? 'Applying...' : 'Apply now'}
                  </Button>
                ) : (
                  <Link to="/login"><Button className="w-full">Login to apply</Button></Link>
                )}
                <ContactActions
                  name={job.user?.name ?? job.organization?.name ?? job.title}
                  phone={job.user?.phone}
                  conversationUserId={job.user?.id}
                  conversationSubject={job.title}
                  conversationContext="job"
                  className="flex flex-wrap gap-2"
                />
              </div>
            </SectionCard>
          </div>

          {relatedJobs.length ? (
            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-lokals-charcoal">Related jobs</h2>
                <Link to="/jobs" className="text-sm font-semibold text-lokals-purple">View all</Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {relatedJobs.map((item) => (
                  <JobCard key={item.id} job={item} canApply={Boolean(token)} onApply={token ? async () => {
                    setFeedback('')
                    setError('')
                    try {
                      await applyToJob.mutateAsync({ jobId: item.id, message: 'Ready to work and available nearby.' })
                      setFeedback(`Application sent for ${item.title}.`)
                    } catch (caught) {
                      setError(getApiErrorMessage(caught, 'Unable to apply right now.'))
                    }
                  } : undefined} />
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      )}
    </QueryState>
  )
}
