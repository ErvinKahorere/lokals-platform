import { Button, Card, EmptyState, PageHeader } from '../../components/Ui'
import { useAdminRoleApplicationAction, useAdminRoleApplications } from '../../hooks/queries'

export function RoleApplicationsAdminPage() {
  const query = useAdminRoleApplications()
  const action = useAdminRoleApplicationAction()

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Manager" title="Role approvals" description="Review driver, courier, provider, business, and organisation applications in one operational queue." />
      <Card className="space-y-3">
        {!query.data?.data.length ? (
          <EmptyState title="No approval work right now" body="New role applications will appear here as residents and businesses apply for expanded platform access." />
        ) : (
          query.data.data.map((application) => (
            <div key={application.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-lokals-charcoal">{application.full_name} - {application.requested_role.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{application.phone} | {application.town_name ?? 'Okahandja'} | {application.status.replaceAll('_', ' ')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => action.mutate({ id: application.id, action: 'approve' })} isLoading={action.isPending && action.variables?.action === 'approve' && action.variables?.id === application.id}>
                    Approve
                  </Button>
                  <Button variant="secondary" onClick={() => action.mutate({ id: application.id, action: 'request-changes', payload: { reason: 'Please update missing supporting details.' } })} isLoading={action.isPending && action.variables?.action === 'request-changes' && action.variables?.id === application.id}>
                    Request changes
                  </Button>
                  <Button variant="ghost" onClick={() => action.mutate({ id: application.id, action: 'reject', payload: { reason: 'Application does not meet current approval requirements.' } })} isLoading={action.isPending && action.variables?.action === 'reject' && action.variables?.id === application.id}>
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
