import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { useWorker } from '../hooks/queries'
import { getDisplayDistance, getDisplayPrice } from '../lib/display'
import { Card } from '../components/ui/Card'

export function WorkerProfilePage() {
  const { id } = useParams()
  const workerQuery = useWorker(id)
  const worker = workerQuery.data

  return (
    <QueryState isLoading={workerQuery.isLoading} error={workerQuery.error} empty={!worker}>
      {!worker ? (
        <EmptyState title="Worker not found" body="This worker profile may no longer be available." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Worker profile" title={worker.user?.name ?? worker.headline} description={worker.headline} />

          <div className="grid gap-5 lg:grid-cols-[1.05fr,0.95fr]">
            <SectionCard className="bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-50 text-3xl font-semibold text-lokals-purple">
                  {(worker.user?.name ?? worker.headline).charAt(0)}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className={`rounded-full px-3 py-2 text-xs font-semibold ${worker.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {worker.is_available ? 'Available now' : 'Busy'}
                  </span>
                  <span className="rounded-full bg-lokals-gold-soft px-3 py-2 text-xs font-semibold text-lokals-charcoal">4.8 rating</span>
                </div>
                <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
                  <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Location</p>
                    <p className="mt-2 text-sm font-medium text-lokals-charcoal">{getDisplayDistance(worker.distance_km, worker.location)}</p>
                  </Card>
                  <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Rate</p>
                    <p className="mt-2 text-sm font-medium text-lokals-charcoal">{worker.hourly_rate ? getDisplayPrice(worker.hourly_rate) : worker.rate ? getDisplayPrice(worker.rate) : 'Rate on request'}</p>
                  </Card>
                  <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Experience</p>
                    <p className="mt-2 text-sm font-medium text-lokals-charcoal">{worker.experience_years ? `${worker.experience_years}+ years` : 'Local experience'}</p>
                  </Card>
                  <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Completed jobs</p>
                    <p className="mt-2 text-sm font-medium text-lokals-charcoal">Growing local track record</p>
                  </Card>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">About</h3>
              <p className="mt-3 text-sm text-lokals-muted">
                {worker.bio ?? `${worker.user?.name ?? 'This worker'} is available in ${worker.location ?? 'the local area'} and can discuss timing, scope, and rates directly.`}
              </p>

              <h3 className="mt-5 text-lg font-semibold text-lokals-charcoal">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(worker.skills?.length ? worker.skills : ['General help']).map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{skill}</span>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <ContactActions name={worker.user?.name ?? worker.headline} phone={worker.user?.phone} whatsapp={worker.user?.whatsapp ?? worker.user?.phone} className="flex flex-wrap gap-2" />
                <Link to="/jobs"><Button className="w-full">Invite to Job</Button></Link>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </QueryState>
  )
}
