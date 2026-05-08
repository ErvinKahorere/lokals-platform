import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { EmptyState, PageHeader, QueryState, SearchBar } from '../components/Ui'
import { useWorkers } from '../hooks/queries'
import { getDisplayDistance, getDisplayPrice } from '../lib/display'
import { Card } from '../components/ui/Card'

export function WorkersPage() {
  const [search, setSearch] = useState('')
  const workersQuery = useWorkers()
  const workers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (workersQuery.data?.data ?? []).filter((worker) => {
      return !query || worker.headline.toLowerCase().includes(query) || (worker.user?.name?.toLowerCase().includes(query) ?? false) || (worker.skills ?? []).some((item) => item.toLowerCase().includes(query))
    })
  }, [workersQuery.data, search])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workers"
        title="Local workers ready to help"
        description="Browse nearby people for quick jobs, recurring help, and local side-hustle support."
        actions={
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onValueSelect={setSearch}
            recentKey="workers"
            suggestions={['Cleaner', 'Painter', 'Driver', 'Tutor']}
            shortcuts={[{ label: 'Available now', value: 'available' }, { label: 'Near me', value: 'near me' }]}
            placeholder="Search workers..."
            className="w-full md:w-72"
          />
        }
      />

      <QueryState isLoading={workersQuery.isLoading} error={workersQuery.error} empty={workers.length === 0}>
        {workers.length === 0 ? (
          <EmptyState title="No workers found nearby" body="Try another skill or area." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workers.map((worker) => (
              <Card key={worker.id} interactive>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple text-lg font-semibold">
                    {(worker.user?.name ?? worker.headline).charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
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
                      <span>{worker.hourly_rate ? getDisplayPrice(worker.hourly_rate) : worker.rate ? getDisplayPrice(worker.rate) : 'Rate on request'}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
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
    </div>
  )
}
