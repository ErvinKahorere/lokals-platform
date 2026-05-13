import { useState } from 'react'
import { Button, Card, EmptyState, Input, PageHeader, QueryState, StatusBadge, TextArea } from '../../components/Ui'
import { useAdminRoleApplicationAction, useAdminRoleApplications } from '../../hooks/queries'

export function RoleApplicationsAdminPage() {
  const query = useAdminRoleApplications({ status: 'pending_review' })
  const action = useAdminRoleApplicationAction()
  const [reasonById, setReasonById] = useState<Record<number, string>>({})

  const applications = query.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Manager" title="Role approvals" description="Review driver, courier, provider, business, and organisation applications in one operational queue." />
      <QueryState isLoading={query.isLoading} error={query.error} empty={applications.length === 0}>
        {applications.length === 0 ? (
          <EmptyState title="No approval work right now" body="New role applications will appear here as residents and businesses apply for expanded platform access." />
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const reason = reasonById[application.id] ?? ''

              return (
                <Card key={application.id} className="space-y-4 border border-lokals-border bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{application.full_name} - {application.requested_role.replaceAll('_', ' ')}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{application.phone} | {application.town_name ?? 'Okahandja'} | {application.email ?? 'No email supplied'}</p>
                    </div>
                    <StatusBadge value={application.status.replaceAll('_', ' ')} tone="warning" />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Input value={application.address ?? ''} readOnly placeholder="Address" />
                    <Input value={application.license_number ?? ''} readOnly placeholder="License number" />
                    <Input value={application.vehicle_registration ?? ''} readOnly placeholder="Vehicle registration" />
                    <Input value={application.business_name ?? application.organisation_name ?? application.service_category ?? ''} readOnly placeholder="Business / organisation / service" />
                  </div>

                  {application.documents?.length ? (
                    <div className="rounded-[18px] bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-lokals-charcoal">Attached documents</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.documents.map((document, index) => (
                          document.url ? (
                            <a
                              key={`${document.url}-${index}`}
                              href={document.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-lokals-border bg-white px-3 py-2 text-xs font-semibold text-lokals-charcoal"
                            >
                              {document.name ?? document.file_name ?? `Document ${index + 1}`}
                            </a>
                          ) : (
                            <span key={`${document.file_name ?? index}`} className="rounded-full border border-lokals-border bg-white px-3 py-2 text-xs font-semibold text-lokals-charcoal">
                              {document.name ?? document.file_name ?? `Document ${index + 1}`}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[18px] bg-slate-50 p-4 text-sm text-lokals-muted">No documents were attached to this application.</div>
                  )}

                  <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                    <TextArea
                      value={reason}
                      onChange={(event) => setReasonById((current) => ({ ...current, [application.id]: event.target.value }))}
                      placeholder="Add approval note, rejection reason, or requested changes."
                      rows={4}
                    />
                    <div className="flex flex-wrap gap-2 xl:flex-col">
                      <Button onClick={() => action.mutate({ id: application.id, action: 'approve' })} isLoading={action.isPending && action.variables?.action === 'approve' && action.variables?.id === application.id}>
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => action.mutate({ id: application.id, action: 'request-changes', payload: { reason: reason || 'Please update missing supporting details.' } })}
                        isLoading={action.isPending && action.variables?.action === 'request-changes' && action.variables?.id === application.id}
                      >
                        Request changes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => action.mutate({ id: application.id, action: 'reject', payload: { reason: reason || 'Application does not meet current approval requirements.' } })}
                        isLoading={action.isPending && action.variables?.action === 'reject' && action.variables?.id === application.id}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </QueryState>
    </div>
  )
}
