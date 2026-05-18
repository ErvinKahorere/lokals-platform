import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { PageHeader, QueryState, SearchInput, SectionCard, StatCard, StatusBadge } from '../../components/Ui'

type AdminUserRow = {
  id: number | string
  name: string
  email?: string | null
  phone?: string | null
  status?: string | null
  current_role?: string | null
  roles?: string[]
  default_town?: string | null
  default_area?: string | null
  created_at?: string | null
}

type AdminUsersPayload = {
  summary?: Record<string, number | string>
  data?: AdminUserRow[]
  meta?: {
    current_page?: number
    per_page?: number
    total?: number
    last_page?: number
  }
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('')

  const usersQuery = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => (
      await api.get('/admin/users', {
        params: search.trim().length > 0 ? { search } : undefined,
      })
    ).data as AdminUsersPayload,
  })

  const summary = Object.entries(usersQuery.data?.summary ?? {})
  const users = usersQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Users and access"
        description="Review platform accounts, role coverage, and pilot-town user distribution without leaving the admin workspace."
        actions={<Link to="/dashboard/admin/role-applications" className="rounded-full border border-lokals-border bg-white px-4 py-2 text-sm font-semibold text-lokals-charcoal">Role applications</Link>}
      />

      <div className="max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users by name, email, or phone" />
      </div>

      <QueryState isLoading={usersQuery.isLoading} error={usersQuery.error} empty={!usersQuery.data}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map(([key, value]) => (
            <StatCard key={key} label={formatLabel(key)} value={String(value)} hint="User summary" />
          ))}
        </div>

        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-lokals-charcoal">User list</h3>
              <p className="text-sm text-lokals-muted">
                Showing {users.length} of {usersQuery.data?.meta?.total ?? users.length} users
              </p>
            </div>
            <Link to="/dashboard/admin" className="text-sm font-semibold text-lokals-green">Back to overview</Link>
          </div>

          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-[20px] border border-lokals-border bg-[var(--bg)] px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{user.name}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{user.email || user.phone || 'No contact details yet'}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lokals-muted">
                      {[user.default_area, user.default_town].filter(Boolean).join(', ') || 'No town assigned'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={formatLabel(user.status || 'active')} tone={String(user.status ?? 'active').toLowerCase() === 'active' ? 'success' : 'warning'} />
                    <StatusBadge value={formatLabel(user.current_role || 'citizen')} tone="info" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-lokals-muted">
                  Roles: {(user.roles ?? []).length > 0 ? user.roles?.map((role) => formatLabel(role)).join(', ') : 'No elevated roles'}
                </p>
              </div>
            ))}
            {users.length === 0 ? <p className="text-sm text-lokals-muted">No users matched this search. Try a broader name, email, or phone query.</p> : null}
          </div>
        </SectionCard>
      </QueryState>
    </div>
  )
}
