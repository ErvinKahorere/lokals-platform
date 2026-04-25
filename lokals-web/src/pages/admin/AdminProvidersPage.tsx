import { useProviders, useSuspendContent } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

export function AdminProvidersPage() {
  const providersQuery = useProviders()
  const suspendContent = useSuspendContent()
  const providers = providersQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Manage providers" description="Visibility into active provider records, verification, and moderation state." />
      <QueryState isLoading={providersQuery.isLoading} error={providersQuery.error} empty={providers.length === 0}>
        {providers.length === 0 ? (
          <EmptyState title="No providers found" body="Provider records will appear here when users create profiles." />
        ) : (
          <div className="space-y-3">
            {providers.map((provider: any) => (
              <SectionCard key={provider.id} className="bg-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{provider.category} in {provider.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge value={provider.status} tone={provider.status === 'active' ? 'success' : 'danger'} />
                    <button
                      className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold"
                      onClick={() => suspendContent.mutate({ target_type: 'provider', target_id: provider.id, status: provider.status === 'suspended' ? 'active' : 'suspended' })}
                    >
                      {provider.status === 'suspended' ? 'Restore' : 'Suspend'}
                    </button>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
