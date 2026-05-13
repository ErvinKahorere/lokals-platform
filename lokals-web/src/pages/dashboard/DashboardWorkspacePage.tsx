import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, DataTable, EmptyState, FilterTabs, PageHeader, QuickActionCard, SearchInput, StatusBadge } from '../../components/Ui'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { buildPlaceholderRows, dashboardEmptyRows, type DashboardMode, getDashboardConfig, getNavItemMeta } from '../../lib/dashboardConfig'
import { getDashboardWorkspaceData, type DashboardWorkspaceAction, type DashboardWorkspaceFilter, type DashboardWorkspaceRow } from '../../lib/dashboardWorkspaceData'

export function DashboardWorkspacePage({
  mode,
  path,
  title,
  description,
  actions = [],
  filters = [],
  rows,
  rightRail,
  primaryCta,
}: {
  mode: DashboardMode
  path: string
  title: string
  description: string
  actions?: DashboardWorkspaceAction[]
  filters?: DashboardWorkspaceFilter[]
  rows?: DashboardWorkspaceRow[]
  rightRail?: ReactNode
  primaryCta?: ReactNode
}) {
  const navMeta = getNavItemMeta(mode, path)
  const config = getDashboardConfig(mode)
  const seeded = getDashboardWorkspaceData(path)
  const [activeFilter, setActiveFilter] = useState(() => filters[0]?.value ?? seeded.filters?.[0]?.value ?? 'all')
  const [search, setSearch] = useState('')
  const mergedActions = actions.length > 0 ? actions : seeded.actions ?? []
  const mergedFilters = filters.length > 0 ? filters : seeded.filters ?? []
  const mergedRows = rows && rows.length > 0 ? rows : seeded.rows

  const tableRows = useMemo(() => {
    const source = mergedRows && mergedRows.length > 0 ? mergedRows : navMeta ? buildPlaceholderRows([navMeta]) : dashboardEmptyRows

    return source.filter((row) => {
      const matchesFilter = activeFilter === 'all' || row.status.toLowerCase().includes(activeFilter.toLowerCase())
      const needle = search.trim().toLowerCase()
      const matchesSearch =
        needle.length === 0 ||
        row.summary.toLowerCase().includes(needle) ||
        row.owner.toLowerCase().includes(needle) ||
        row.next_step.toLowerCase().includes(needle)

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, mergedRows, navMeta, search])

  return (
    <DashboardShell
      mode={mode}
      eyebrow={navMeta?.label ?? 'Workspace'}
      title={title}
      description={description}
      stats={{
        active_rows: tableRows.length,
        workflow_state: filters.length > 0 ? activeFilter : 'ready',
        route_status: navMeta ? 'linked' : 'draft',
        mode: config.shortLabel,
      }}
      actions={primaryCta}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card variant="dashboard" className="overflow-hidden p-5">
            <div className={`-mx-5 -mt-5 mb-5 h-2 bg-gradient-to-r ${config.accent}`} />
            <div className="flex flex-col gap-4">
              <PageHeader eyebrow={`${config.shortLabel} workflow`} title={title} description={description} />
              {mergedActions.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {mergedActions.map((action) => (
                    <QuickActionCard key={action.to + action.label} to={action.to} label={action.label} icon={action.icon} accentClass={action.accentClass} />
                  ))}
                </div>
              ) : null}
            </div>
          </Card>

          <DashboardSection
            title="Operational queue"
            description="Use this as the practical workspace for this route while deeper API wiring is completed."
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="lg:max-w-sm">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search this workspace" />
                </div>
                {mergedFilters.length > 0 ? <FilterTabs items={[{ label: 'All', value: 'all' }, ...mergedFilters]} value={activeFilter} onChange={setActiveFilter} /> : null}
              </div>
              <DataTable
                rows={tableRows}
                columns={[
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => <StatusBadge value={row.status} tone={row.status.toLowerCase().includes('pending') ? 'warning' : row.status.toLowerCase().includes('ready') ? 'success' : 'info'} />,
                  },
                  { key: 'summary', label: 'Summary' },
                  { key: 'owner', label: 'Context' },
                  { key: 'next_step', label: 'Next step' },
                ]}
                emptyState={<EmptyState title="No matching rows" body="Try another filter or search term. This workspace is ready for live data once the corresponding API is connected." />}
              />
            </div>
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <Card variant="dashboard" className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Context</p>
            <h3 className="mt-2 text-lg font-semibold text-lokals-charcoal">{config.shortLabel} control center</h3>
            <p className="mt-2 text-sm leading-6 text-lokals-muted">
              This route is already linked into the role sidebar and mode switcher so it behaves like a complete operational surface instead of a dead button.
            </p>
            <div className="mt-4 space-y-3 rounded-[20px] bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-lokals-muted">Linked route</span>
                <span className="text-sm font-semibold text-lokals-charcoal">{path}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-lokals-muted">Mode</span>
                <span className="text-sm font-semibold text-lokals-charcoal">{config.label}</span>
              </div>
            </div>
          </Card>

          {rightRail ?? (
            <Card variant="dashboard" className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Next</p>
              <h3 className="mt-2 text-lg font-semibold text-lokals-charcoal">Integration TODO</h3>
              <p className="mt-2 text-sm leading-6 text-lokals-muted">
                Connect this workspace to its live frontend endpoint when that module is ready. Until then, this polished placeholder keeps navigation complete and discoverable.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/dashboard/modes" className="rounded-full border border-lokals-border bg-white px-4 py-2 text-sm font-semibold text-lokals-charcoal">
                  Modes & roles
                </Link>
                <Link to="/support" className="rounded-full bg-lokals-purple px-4 py-2 text-sm font-semibold text-white">
                  Support
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
