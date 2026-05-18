import { useQuery } from '@tanstack/react-query'
import { Clock3 } from 'lucide-react'
import { api } from '../../lib/api'
import { PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

type AuditItem = {
  type: string
  title: string
  body: string
  timestamp?: string | null
}

type AuditPayload = {
  data?: AuditItem[]
}

function formatRelativeTimestamp(timestamp?: string | null) {
  if (!timestamp) return 'Recently'
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return 'Recently'
  return parsed.toLocaleString()
}

export function AdminAuditLogsPage() {
  const query = useQuery({
    queryKey: ['admin-audit-logs-page'],
    queryFn: async () => (await api.get('/admin/audit-logs')).data as AuditPayload,
  })

  const items = query.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Audit logs" description="Recent platform-level approvals, alerts, moderation events, and review activity." />
      <QueryState isLoading={query.isLoading} error={query.error} empty={items.length === 0}>
        <div className="space-y-4">
          {items.map((item, index) => (
            <SectionCard key={`${item.type}-${item.title}-${index}`} className="bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.body}</p>
                  <p className="mt-3 inline-flex items-center gap-2 text-xs text-lokals-muted">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatRelativeTimestamp(item.timestamp)}
                  </p>
                </div>
                <StatusBadge value={item.type.replaceAll('_', ' ')} tone="info" />
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
