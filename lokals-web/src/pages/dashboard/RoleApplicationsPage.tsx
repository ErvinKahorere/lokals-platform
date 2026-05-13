import { useMemo, useState } from 'react'
import { Button, Card, EmptyState } from '../../components/Ui'
import { useCreateRoleApplication, useMyModes, useMyRoleApplications, useSubmitRoleApplication } from '../../hooks/queries'

const roleOptions = [
  { key: 'driver', label: 'Driver', helper: 'Apply to accept taxi ride requests.' },
  { key: 'courier', label: 'Courier', helper: 'Apply to accept parcel and delivery requests.' },
  { key: 'service_provider', label: 'Service Provider', helper: 'Offer local services and bookings.' },
  { key: 'business_owner', label: 'Business Owner', helper: 'Manage business profile, products, and promotions.' },
  { key: 'organization_admin', label: 'Organisation Manager', helper: 'Publish projects, posts, and community updates.' },
]

export function RoleApplicationsPage() {
  const modesQuery = useMyModes()
  const applicationsQuery = useMyRoleApplications()
  const createApplication = useCreateRoleApplication()
  const [selectedRole, setSelectedRole] = useState('driver')
  const [submittedId, setSubmittedId] = useState<number | null>(null)
  const submitApplication = useSubmitRoleApplication(submittedId ?? undefined)

  const availableToApply = useMemo(() => {
    const allowed = new Set((modesQuery.data?.can_apply_for ?? []).map(String))
    return roleOptions.filter((option) => allowed.size === 0 || allowed.has(option.key))
  }, [modesQuery.data?.can_apply_for])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lokals-muted">Role modes</p>
        <h1 className="mt-2 text-3xl font-semibold text-lokals-charcoal">Apply for another role</h1>
        <p className="mt-2 max-w-2xl text-sm text-lokals-muted">Resident access stays available by default. Additional operational modes unlock only after approval.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-lokals-charcoal">Approved and pending modes</h2>
          <div className="flex flex-wrap gap-2">
            {((modesQuery.data?.available_modes ?? []) as string[]).map((mode) => (
              <span key={mode} className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-lokals-purple">{mode.replaceAll('_', ' ')}</span>
            ))}
          </div>
          {modesQuery.data?.pending_modes?.length ? (
            <div className="space-y-2">
              {modesQuery.data.pending_modes.map((application) => (
                <div key={application.id} className="rounded-[18px] border border-lokals-border bg-slate-50 px-4 py-3">
                  <p className="font-medium text-lokals-charcoal">{application.requested_role.replaceAll('_', ' ')}</p>
                  <p className="text-sm text-lokals-muted">{application.status.replaceAll('_', ' ')}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-lokals-muted">No pending applications right now.</p>}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-lokals-charcoal">Start a role application</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {availableToApply.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => setSelectedRole(role.key)}
                className={`rounded-[20px] border px-4 py-4 text-left transition ${selectedRole === role.key ? 'border-lokals-purple bg-violet-50' : 'border-lokals-border bg-white hover:border-lokals-purple/40'}`}
              >
                <p className="font-semibold text-lokals-charcoal">{role.label}</p>
                <p className="mt-1 text-sm text-lokals-muted">{role.helper}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                const payload = await createApplication.mutateAsync({
                  requested_role: selectedRole,
                  full_name: 'LOKALS Applicant',
                  phone: '+264810000000',
                  town_name: 'Okahandja',
                  address: 'Okahandja pilot area',
                })
                setSubmittedId(payload.data.id)
              }}
              isLoading={createApplication.isPending}
            >
              Save draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => submittedId ? submitApplication.mutate() : undefined}
              isLoading={submitApplication.isPending}
            >
              Submit latest draft
            </Button>
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-lokals-charcoal">My applications</h2>
        {(applicationsQuery.data?.data ?? []).length ? (
          <div className="space-y-3">
            {applicationsQuery.data?.data.map((application) => (
              <div key={application.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-lokals-charcoal">{application.requested_role.replaceAll('_', ' ')}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-lokals-muted">{application.status.replaceAll('_', ' ')}</span>
                </div>
                {application.rejection_reason ? <p className="mt-2 text-sm text-amber-700">{application.rejection_reason}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No role applications yet" body="When you apply for driver, courier, provider, business, or organisation access, the application history will appear here." />
        )}
      </Card>
    </div>
  )
}
