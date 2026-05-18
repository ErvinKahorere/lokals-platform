import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

type FeatureFlag = {
  key: string
  label: string
  enabled: boolean
  scope?: string | null
  status?: string | null
  editable?: boolean
  description?: string | null
}

type FeatureFlagsPayload = {
  data?: FeatureFlag[]
}

export function AdminFeatureFlagsPage() {
  const query = useQuery({
    queryKey: ['admin-feature-flags-page'],
    queryFn: async () => (await api.get('/admin/feature-flags')).data as FeatureFlagsPayload,
  })

  const flags = query.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Feature flags" description="A readable rollout view for pilot protections, live features, and operational switches." />
      <QueryState isLoading={query.isLoading} error={query.error} empty={flags.length === 0}>
        <div className="space-y-4">
          {flags.map((flag) => (
            <SectionCard key={flag.key} className="bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-lokals-charcoal">{flag.label}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{flag.description ?? 'Feature flag status'}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lokals-muted">{flag.scope ?? 'platform'} | {flag.key}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={flag.enabled ? 'enabled' : 'disabled'} tone={flag.enabled ? 'success' : 'warning'} />
                  <StatusBadge value={flag.status ?? 'live'} tone="info" />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
