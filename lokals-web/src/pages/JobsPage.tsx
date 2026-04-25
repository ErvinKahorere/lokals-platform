import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Button, EmptyState, Input, JobCard, PageHeader, QueryState, SearchBar, SectionCard, Select, Tabs, TextArea } from '../components/Ui'
import { useApplyToJob, useCreateJob, useJobs } from '../hooks/queries'
import { useAuthStore } from '../store/auth'

export function JobsPage() {
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('find-help')
  const [feedback, setFeedback] = useState('')
  const [sortBy, setSortBy] = useState('distance')
  const token = useAuthStore((state) => state.token)
  const jobsQuery = useJobs(search ? { search } : undefined)
  const createJob = useCreateJob()
  const applyToJob = useApplyToJob()
  const jobs = useMemo(() => {
    const items = [...(jobsQuery.data?.data ?? [])]
    return items.sort((a, b) => {
      if (sortBy === 'price') {
        return Number(b.compensation ?? 0) - Number(a.compensation ?? 0)
      }
      return Number(a.distance_km ?? 999999) - Number(b.distance_km ?? 999999)
    })
  }, [jobsQuery.data, sortBy])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    await createJob.mutateAsync({
      title: formData.get('title'),
      description: formData.get('description'),
      employment_type: formData.get('employment_type'),
      compensation: formData.get('compensation'),
      location: formData.get('location'),
      status: 'open',
      skills: ['reliable', 'local'],
    })
    setFeedback('Job posted and ready for applications.')
    event.currentTarget.reset()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-lokals-border bg-white p-5 shadow-card">
        <PageHeader
          eyebrow="Work"
          title="Flexible work and local hiring in one feed"
          description="Workers browse fast, employers post quickly, and applications stay lightweight enough for slower connections."
          actions={<SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onValueSelect={setSearch} recentKey="work" suggestions={['Jobs near me', 'Cleaner needed', 'Driver work', 'Part-time work']} shortcuts={[{ label: 'Popular near you', value: 'popular near you' }, { label: 'Available now', value: 'available now' }, { label: 'Affordable help', value: 'affordable help' }]} placeholder="Find a barber, job, product..." className="w-full md:w-80" />}
        />
      </section>

      <div className="overflow-x-auto pb-1">
        <Tabs
          value={mode}
          onChange={setMode}
          items={[
            { label: 'Find Help', value: 'find-help' },
            { label: 'Earn Money', value: 'earn-money' },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mode === 'find-help' ? (
          <>
            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Post Job</h3>
              <p className="mt-2 text-sm text-lokals-muted">Need help fast? Post a clear task with budget and location, then let workers apply in one tap.</p>
            </SectionCard>
            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Recommended workers</h3>
              <p className="mt-2 text-sm text-lokals-muted">Nearby skilled workers and popular services can be promoted here as backend matching expands.</p>
            </SectionCard>
          </>
        ) : (
          <>
            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Jobs near you today</h3>
              <p className="mt-2 text-sm text-lokals-muted">Apply quickly with saved details and only add a message when it actually helps.</p>
            </SectionCard>
            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Complete your worker profile</h3>
              <p className="mt-2 text-sm text-lokals-muted">Skills, location, and availability help employers trust your application faster.</p>
            </SectionCard>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary">Popular near you</Button>
        <Button variant="secondary">Available now</Button>
        <Button variant="secondary">Affordable</Button>
        <div className="ml-auto w-full sm:w-56">
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="distance">Sort by distance</option>
            <option value="price">Sort by budget</option>
          </Select>
        </div>
      </div>

      {token ? (
        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold">Post a job</h3>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={submit}>
            <Input name="title" placeholder="Role title" required />
            <Input name="location" placeholder="Location" required />
            <Input name="employment_type" placeholder="Type: contract, part-time, task" required />
            <Input name="compensation" placeholder="Compensation in NAD" />
            <TextArea name="description" placeholder="What needs to be done?" required className="md:col-span-2" rows={4} />
            {feedback ? <p className="text-sm text-[var(--accent)] md:col-span-2">{feedback}</p> : null}
            <Button className="md:col-span-2" disabled={createJob.isPending}>{createJob.isPending ? 'Posting job...' : 'Post Job'}</Button>
          </form>
        </SectionCard>
      ) : null}

      <QueryState isLoading={jobsQuery.isLoading} error={jobsQuery.error} empty={jobs.length === 0}>
        {jobs.length === 0 ? (
          <EmptyState title="No work found nearby" body="Try broadening your search or switch between Find Help and Earn Money." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canApply={Boolean(token)}
                onApply={async () => {
                  await applyToJob.mutateAsync({ jobId: job.id, message: mode === 'earn-money' ? 'Ready to work and available nearby.' : 'Interested in this local opportunity.' })
                  setFeedback(`Applied to ${job.title}.`)
                }}
              />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}

