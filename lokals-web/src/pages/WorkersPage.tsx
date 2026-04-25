import { useMemo, useState } from 'react'
import { useWorkers } from '../hooks/queries'
import { EmptyState, Input, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'

export function WorkersPage() {
  const [search, setSearch] = useState('')
  const workersQuery = useWorkers(search ? { search } : undefined)
  const workers = useMemo(() => workersQuery.data?.data ?? [], [workersQuery.data])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workers"
        title="Available local talent and side hustlers"
        description="Worker profiles stay compact, searchable, and tuned for quick low-data hiring decisions."
        actions={<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workers" className="w-full md:w-64" />}
      />
      <QueryState isLoading={workersQuery.isLoading} error={workersQuery.error} empty={workers.length === 0}>
        {workers.length === 0 ? (
          <EmptyState title="No workers found" body="Worker profiles will appear once people publish their skills." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workers.map((worker: any) => (
              <SectionCard key={worker.id} className="bg-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{worker.headline}</h3>
                  <StatusBadge value={worker.is_available ? 'available' : 'busy'} tone={worker.is_available ? 'success' : 'warn'} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{worker.user?.name}</p>
                <p className="mt-2 text-sm">Skills: {(worker.skills ?? []).join(', ') || 'General help'}</p>
                <p className="mt-2 text-sm font-semibold">N$ {worker.rate ?? 'TBC'}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">{worker.location ?? 'Local area'} {worker.distance_km ? `• ${worker.distance_km} km` : ''}</p>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
