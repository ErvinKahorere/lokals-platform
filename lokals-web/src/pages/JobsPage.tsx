import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, Sparkles, UserRoundSearch } from 'lucide-react'
import { Button, EmptyState, Input, JobCard, PageHeader, QueryState, SearchBar, SectionCard, Tabs, TextArea } from '../components/Ui'
import { useApplyToJob, useCreateJob, useCreateWorkerProfile, useJobs, useWorkers } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { navigateToLogin } from '../lib/authNavigation'
import { getDisplayDistance, getDisplayPrice } from '../lib/display'
import { OKAHANDJA_AREAS, PILOT_TOWN } from '../lib/pilot'
import { useAuthStore } from '../store/auth'
import { Card } from '../components/ui/Card'

const skillFilters = ['All', 'Cleaning', 'Painting', 'Gardening', 'Driving', 'Tutoring']

export function JobsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [mode, setMode] = useState<'find-help' | 'earn-money'>('find-help')
  const [skill, setSkill] = useState('All')
  const [feedback, setFeedback] = useState('')
  const [jobError, setJobError] = useState('')
  const [applyError, setApplyError] = useState('')
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const jobsQuery = useJobs()
  const workersQuery = useWorkers()
  const createJob = useCreateJob()
  const applyToJob = useApplyToJob()
  const createWorkerProfile = useCreateWorkerProfile()

  const jobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (jobsQuery.data?.data ?? []).filter((job) => {
      const matchesQuery = !query || job.title.toLowerCase().includes(query) || job.description.toLowerCase().includes(query) || (job.skills ?? []).some((item) => item.toLowerCase().includes(query))
      const matchesSkill = skill === 'All' || (job.skills ?? []).some((item) => item.toLowerCase().includes(skill.toLowerCase())) || job.title.toLowerCase().includes(skill.toLowerCase())
      return matchesQuery && matchesSkill
    })
  }, [jobsQuery.data, search, skill])

  const workers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (workersQuery.data?.data ?? []).filter((worker) => {
      const matchesQuery = !query || worker.headline.toLowerCase().includes(query) || (worker.user?.name?.toLowerCase().includes(query) ?? false) || (worker.skills ?? []).some((item) => item.toLowerCase().includes(query))
      const matchesSkill = skill === 'All' || (worker.skills ?? []).some((item) => item.toLowerCase().includes(skill.toLowerCase())) || worker.headline.toLowerCase().includes(skill.toLowerCase())
      return matchesQuery && matchesSkill
    })
  }, [workersQuery.data, search, skill])

  const submitJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setJobError('')
    setFeedback('')
    const formData = new FormData(event.currentTarget)
    try {
      await createJob.mutateAsync({
        title: formData.get('title'),
        location: formData.get('location'),
        employment_type: formData.get('employment_type'),
        compensation: formData.get('compensation') || null,
        description: formData.get('description') || null,
        status: 'open',
        skills: formData.get('skills')?.toString().split(',').map((item) => item.trim()).filter(Boolean) ?? [],
      })
      setFeedback('Job posted successfully. Nearby workers can now apply.')
      event.currentTarget.reset()
    } catch (caught) {
      setJobError(getApiErrorMessage(caught, 'Unable to post the job right now.'))
    }
  }

  const submitWorkerProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setJobError('')
    setFeedback('')
    const formData = new FormData(event.currentTarget)
    try {
      await createWorkerProfile.mutateAsync({
        headline: formData.get('headline'),
        location: formData.get('location'),
        skills: formData.get('skills')?.toString().split(',').map((item) => item.trim()).filter(Boolean) ?? [],
        experience_years: formData.get('experience_years') || null,
        hourly_rate: formData.get('hourly_rate') || null,
        is_available: true,
      })
      setFeedback('Worker profile saved. You can now apply faster.')
    } catch (caught) {
      setJobError(getApiErrorMessage(caught, 'Unable to save your worker profile right now.'))
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-gradient-to-br from-[#2B1E8C] via-[#3F2BCB] to-[#5B46E8] p-5 text-white shadow-card">
        <PageHeader
          eyebrow="Work"
          title="Jobs and local workers in Okahandja"
          description="Post small jobs quickly, browse trusted local workers, or apply to open work nearby in Okahandja."
          actions={
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              recentKey="work"
              suggestions={['Cleaner needed', 'Painter nearby', 'Driver work', 'Tutor jobs']}
              shortcuts={[{ label: 'Near me', value: 'near me' }, { label: 'Urgent', value: 'urgent' }, { label: 'Verified', value: 'verified' }]}
              placeholder="Search jobs or workers in Okahandja..."
              className="w-full md:w-80"
            />
          }
        />
      </section>

      <SectionCard className="bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Local work flow</p>
            <h2 className="mt-1 text-lg font-semibold text-lokals-charcoal">Hire fast or find work without leaving Okahandja</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-lokals-purple">
            {user?.default_area ? `${user.default_area}, ${PILOT_TOWN}` : PILOT_TOWN}
          </div>
        </div>
        <div className="mt-4">
          <Tabs
            value={mode}
            onChange={(value) => setMode(value as 'find-help' | 'earn-money')}
            items={[
              { label: 'Find Help', value: 'find-help' },
              { label: 'Earn Money', value: 'earn-money' },
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {skillFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSkill(item)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                skill === item
                  ? 'border-lokals-purple bg-lokals-purple text-white shadow-card'
                  : 'border-lokals-border bg-lokals-bg text-lokals-charcoal hover:border-lokals-purple/40 hover:bg-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </SectionCard>

      {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700">{feedback}</SectionCard> : null}
      {jobError ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{jobError}</SectionCard> : null}

      <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        {mode === 'find-help' ? (
          <>
            <SectionCard className="bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-lokals-charcoal">Post a quick job</h3>
                  <p className="mt-2 text-sm text-lokals-muted">Keep it short. Add the task, area, and budget so nearby workers can respond fast.</p>
                </div>
                {!token ? <Button onClick={() => navigateToLogin(navigate)}>Login</Button> : null}
              </div>
              {token ? (
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={submitJob}>
                  <Input name="title" placeholder="House cleaner needed" required />
                  <Input name="location" placeholder="Nau-Aib, Okahandja" defaultValue={user?.default_area ?? OKAHANDJA_AREAS[0]} required />
                  <Input name="employment_type" placeholder="gig, part_time, contract" defaultValue="gig" required />
                  <Input name="compensation" placeholder="Budget in NAD (optional)" />
                  <Input name="skills" placeholder="cleaning, laundry, reliable" className="md:col-span-2" />
                  <TextArea name="description" placeholder="Share timing, tools, or any quick notes." className="md:col-span-2" rows={4} />
                  <Button className="md:col-span-2" disabled={createJob.isPending}>{createJob.isPending ? 'Publishing...' : 'Publish Job'}</Button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-lokals-muted">Sign in to post a job and hear from local workers.</p>
              )}
            </SectionCard>

            <SectionCard className="bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-lokals-charcoal">Recommended workers</h3>
                  <p className="mt-2 text-sm text-lokals-muted">Start with people who are already available locally and ready to respond.</p>
                </div>
                <Link to="/workers" className="text-sm font-semibold text-lokals-purple">View all</Link>
              </div>
              <QueryState isLoading={workersQuery.isLoading} error={workersQuery.error} empty={workers.length === 0}>
                {workers.length === 0 ? (
                  <EmptyState title="No workers found nearby" body="Try another skill or area." />
                ) : (
                  <div className="mt-4 space-y-3">
                    {workers.slice(0, 4).map((worker) => (
                      <Card key={worker.id} interactive>
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
                            <UserRoundSearch className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-lokals-charcoal">{worker.user?.name ?? worker.headline}</p>
                                <p className="mt-1 text-sm text-lokals-muted">{worker.headline}</p>
                              </div>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${worker.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {worker.is_available ? 'Available' : 'Busy'}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-lokals-muted">
                              <span>{worker.skills?.[0] ?? 'General help'}</span>
                              <span>{getDisplayDistance(worker.distance_km, worker.location)}</span>
                              <span>{worker.rate ? getDisplayPrice(worker.rate) : 'Rate on request'}</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Link to={`/workers/${worker.id}`} className="text-sm font-semibold text-lokals-purple">View profile</Link>
                              {worker.user?.phone ? (
                                <a href={`tel:${worker.user.phone}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-lokals-purple" aria-label={`Call ${worker.user?.name ?? 'worker'}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </QueryState>
            </SectionCard>
          </>
        ) : (
          <>
            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Complete your worker profile</h3>
              <p className="mt-2 text-sm text-lokals-muted">Skills, rates, and your area help you apply faster and look more trustworthy to local posters.</p>
              {token ? (
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={submitWorkerProfile}>
                  <Input name="headline" placeholder="House cleaner" defaultValue={user?.profession ?? ''} required />
                  <Input name="location" placeholder="Nau-Aib, Okahandja" defaultValue={user?.default_area ?? OKAHANDJA_AREAS[0]} required />
                  <Input name="skills" placeholder="cleaning, ironing, laundry" className="md:col-span-2" />
                  <Input name="experience_years" placeholder="Years of experience" />
                  <Input name="hourly_rate" placeholder="Hourly/day rate in NAD" />
                  <Button className="md:col-span-2" disabled={createWorkerProfile.isPending}>{createWorkerProfile.isPending ? 'Saving...' : 'Save Worker Profile'}</Button>
                </form>
              ) : (
                <div className="mt-4">
                  <Button onClick={() => navigateToLogin(navigate)}>Login to create profile</Button>
                </div>
              )}
            </SectionCard>

            <SectionCard className="bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-lokals-charcoal">Open jobs near you</h3>
                  <p className="mt-2 text-sm text-lokals-muted">One-tap apply is ready when you spot something that fits your skills.</p>
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-lokals-purple">{jobs.length} open jobs</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-lokals-muted">
                <span className="rounded-full bg-lokals-gold-soft px-3 py-2 font-semibold text-lokals-charcoal">Near me</span>
                <span className="rounded-full border border-lokals-border bg-lokals-bg px-3 py-2 font-semibold">New</span>
                <span className="rounded-full border border-lokals-border bg-lokals-bg px-3 py-2 font-semibold">Urgent</span>
                <span className="rounded-full border border-lokals-border bg-lokals-bg px-3 py-2 font-semibold">Verified workers</span>
              </div>
            </SectionCard>
          </>
        )}
      </div>

      <QueryState isLoading={jobsQuery.isLoading} error={jobsQuery.error} empty={jobs.length === 0}>
        {jobs.length === 0 ? (
          <EmptyState title="No jobs nearby yet" body="Check again later or post one." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.slice(0, mode === 'find-help' ? 4 : 6).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canApply={Boolean(token) && mode === 'earn-money'}
                onApply={async () => {
                  setApplyError('')
                  setFeedback('')
                  try {
                    await applyToJob.mutateAsync({ jobId: job.id, message: 'Ready to work and available nearby.' })
                    setFeedback(`Application sent for ${job.title}.`)
                  } catch (caught) {
                    setApplyError(getApiErrorMessage(caught, 'Unable to apply right now.'))
                  }
                }}
              />
            ))}
          </div>
        )}
      </QueryState>

      {applyError ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{applyError}</SectionCard> : null}

      {mode === 'find-help' ? (
        <SectionCard className="bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-lokals-charcoal">Popular local skills</h3>
                  <p className="mt-2 text-sm text-lokals-muted">Common help categories people book quickly around Okahandja.</p>
            </div>
            <Sparkles className="h-5 w-5 text-lokals-purple" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Cleaning', 'Fresh home support'],
              ['Painting', 'Walls and touch-ups'],
              ['Gardening', 'Yard cleanup'],
              ['Driving', 'School runs and trips'],
            ].map(([title, body]) => (
              <Card key={title}>
                <p className="font-semibold text-lokals-charcoal">{title}</p>
                <p className="mt-2 text-sm text-lokals-muted">{body}</p>
              </Card>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
