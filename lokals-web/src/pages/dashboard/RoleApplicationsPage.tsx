import { useMemo, useState, type FormEvent } from 'react'
import { Button, Card, Input, QueryState, Select, StatusBadge, TextArea } from '../../components/Ui'
import { PILOT_TOWN } from '../../lib/pilot'
import { useAuthStore } from '../../store/auth'
import { useCreateRoleApplication, useMyModes, useMyRoleApplications, useSubmitRoleApplication } from '../../hooks/queries'
import type { RoleApplication } from '../../types'

const roleOptions = [
  { key: 'driver', label: 'Driver', helper: 'Accept taxi ride requests after Town Manager approval.' },
  { key: 'courier', label: 'Courier', helper: 'Accept parcel and delivery requests after Town Manager approval.' },
  { key: 'service_provider', label: 'Service Provider', helper: 'Offer trusted local services and bookings.' },
  { key: 'business_owner', label: 'Business Owner', helper: 'Manage a verified business profile, listings, and promotions.' },
  { key: 'organization_admin', label: 'Organisation Manager', helper: 'Publish projects, posts, events, and community updates.' },
] as const

const vehicleTypes = ['Sedan', 'Hatchback', 'SUV', 'Bakkie', 'Motorbike', 'Bicycle', 'Other']

type RoleOptionKey = (typeof roleOptions)[number]['key']

type RoleApplicationForm = {
  requested_role: RoleOptionKey
  full_name: string
  phone: string
  email: string
  address: string
  national_id_number: string
  license_number: string
  vehicle_registration: string
  vehicle_type: string
  service_category: string
  organisation_name: string
  business_name: string
  notes: string
  documents: File[]
}

const initialForm = (userName?: string | null, phone?: string | null): RoleApplicationForm => ({
  requested_role: 'driver',
  full_name: userName ?? '',
  phone: phone ?? '',
  email: '',
  address: '',
  national_id_number: '',
  license_number: '',
  vehicle_registration: '',
  vehicle_type: vehicleTypes[0],
  service_category: '',
  organisation_name: '',
  business_name: '',
  notes: '',
  documents: [],
})

export function RoleApplicationsPage() {
  const user = useAuthStore((state) => state.user)
  const modesQuery = useMyModes()
  const applicationsQuery = useMyRoleApplications()
  const createApplication = useCreateRoleApplication()
  const submitApplication = useSubmitRoleApplication()
  const [selectedRole, setSelectedRole] = useState<RoleOptionKey>('driver')
  const [form, setForm] = useState<RoleApplicationForm>(() => initialForm(user?.name, user?.phone))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const availableToApply = useMemo(() => {
    const allowed = new Set((modesQuery.data?.can_apply_for ?? []).map(String))
    const filtered = roleOptions.filter((option) => allowed.size === 0 || allowed.has(option.key))
    return filtered.length ? filtered : roleOptions
  }, [modesQuery.data?.can_apply_for])

  const applications = applicationsQuery.data?.data ?? []

  const roleNeedsVehicle = selectedRole === 'driver' || selectedRole === 'courier'
  const roleNeedsServiceInfo = selectedRole === 'service_provider'
  const roleNeedsBusinessInfo = selectedRole === 'business_owner'
  const roleNeedsOrganisationInfo = selectedRole === 'organization_admin'

  const submitDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const payload = new FormData()
      payload.append('requested_role', selectedRole)
      payload.append('full_name', form.full_name.trim())
      payload.append('phone', form.phone.trim())
      if (form.email.trim()) payload.append('email', form.email.trim())
      payload.append('town_name', PILOT_TOWN)
      if (form.address.trim()) payload.append('address', form.address.trim())
      if (form.national_id_number.trim()) payload.append('national_id_number', form.national_id_number.trim())
      if (form.notes.trim()) payload.append('notes', form.notes.trim())
      if (roleNeedsVehicle) {
        if (form.license_number.trim()) payload.append('license_number', form.license_number.trim())
        if (form.vehicle_registration.trim()) payload.append('vehicle_registration', form.vehicle_registration.trim())
        if (form.vehicle_type.trim()) payload.append('vehicle_type', form.vehicle_type.trim())
      }
      if (roleNeedsServiceInfo && form.service_category.trim()) {
        payload.append('service_category', form.service_category.trim())
      }
      if (roleNeedsBusinessInfo && form.business_name.trim()) {
        payload.append('business_name', form.business_name.trim())
      }
      if (roleNeedsOrganisationInfo && form.organisation_name.trim()) {
        payload.append('organisation_name', form.organisation_name.trim())
      }
      form.documents.forEach((file) => payload.append('documents_uploads[]', file))

      const response = await createApplication.mutateAsync(payload)
      const application = response.data as RoleApplication
      setMessage('Draft saved. Submit it once your details and documents look complete.')
      await submitApplication.mutateAsync(application.id)
      setMessage('Application submitted for Town Manager review.')
      setForm(initialForm(user?.name, user?.phone))
      setSelectedRole('driver')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save this application right now.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lokals-muted">Role modes</p>
        <h1 className="mt-2 text-3xl font-semibold text-lokals-charcoal">Apply for another role</h1>
        <p className="mt-2 max-w-2xl text-sm text-lokals-muted">Resident access stays available by default. Additional operational modes unlock only after review and approval.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-lokals-charcoal">Approved and pending modes</h2>
          <div className="flex flex-wrap gap-2">
            {((modesQuery.data?.available_modes ?? []) as string[]).map((mode) => (
              <span key={mode} className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-lokals-purple">{mode.replaceAll('_', ' ')}</span>
            ))}
          </div>
          <QueryState isLoading={applicationsQuery.isLoading} error={applicationsQuery.error} empty={applications.length === 0}>
            <div className="space-y-3">
              {applications.map((application) => (
                <div key={application.id} className="rounded-[18px] border border-lokals-border bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-lokals-charcoal">{application.requested_role.replaceAll('_', ' ')}</p>
                    <StatusBadge value={application.status.replaceAll('_', ' ')} tone={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning'} />
                  </div>
                  {application.rejection_reason ? <p className="mt-2 text-sm text-amber-700">{application.rejection_reason}</p> : null}
                  {application.documents?.length ? <p className="mt-2 text-xs text-lokals-muted">{application.documents.length} document(s) attached</p> : null}
                </div>
              ))}
            </div>
          </QueryState>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-lokals-charcoal">Start a role application</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {availableToApply.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => {
                  setSelectedRole(role.key)
                  setForm((current) => ({ ...current, requested_role: role.key }))
                }}
                className={`rounded-[20px] border px-4 py-4 text-left transition ${selectedRole === role.key ? 'border-lokals-purple bg-violet-50' : 'border-lokals-border bg-white hover:border-lokals-purple/40'}`}
              >
                <p className="font-semibold text-lokals-charcoal">{role.label}</p>
                <p className="mt-1 text-sm text-lokals-muted">{role.helper}</p>
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={submitDraft}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} placeholder="Full name" required />
              <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+264..." required />
              <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email (optional)" type="email" />
              <Input value={form.national_id_number} onChange={(event) => setForm((current) => ({ ...current, national_id_number: event.target.value }))} placeholder="National ID number (optional)" />
            </div>

            <Input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Residential or operating address" />

            {roleNeedsVehicle ? (
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={form.license_number} onChange={(event) => setForm((current) => ({ ...current, license_number: event.target.value }))} placeholder="License number" required />
                <Input value={form.vehicle_registration} onChange={(event) => setForm((current) => ({ ...current, vehicle_registration: event.target.value }))} placeholder="Vehicle registration" required />
                <Select value={form.vehicle_type} onChange={(event) => setForm((current) => ({ ...current, vehicle_type: event.target.value }))}>
                  {vehicleTypes.map((option) => <option key={option} value={option}>{option}</option>)}
                </Select>
              </div>
            ) : null}

            {roleNeedsServiceInfo ? (
              <Input value={form.service_category} onChange={(event) => setForm((current) => ({ ...current, service_category: event.target.value }))} placeholder="Service category" required />
            ) : null}

            {roleNeedsBusinessInfo ? (
              <Input value={form.business_name} onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Business name" required />
            ) : null}

            {roleNeedsOrganisationInfo ? (
              <Input value={form.organisation_name} onChange={(event) => setForm((current) => ({ ...current, organisation_name: event.target.value }))} placeholder="Organisation name" required />
            ) : null}

            <TextArea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Add supporting context, operating area, or document notes." rows={4} />

            <label className="block rounded-[20px] border border-dashed border-lokals-border bg-slate-50 px-4 py-4 text-sm text-lokals-muted">
              <span className="block font-semibold text-lokals-charcoal">Attach verification documents</span>
              <span className="mt-1 block">Add license, vehicle, business, or organisation proof relevant to this role.</span>
              <input
                type="file"
                multiple
                className="mt-3 block w-full text-sm"
                onChange={(event) => setForm((current) => ({ ...current, documents: Array.from(event.target.files ?? []) }))}
              />
              {form.documents.length ? (
                <div className="mt-3 space-y-1 text-xs">
                  {form.documents.map((file) => <p key={`${file.name}-${file.size}`}>{file.name}</p>)}
                </div>
              ) : null}
            </label>

            {error ? <p className="text-sm font-medium text-lokals-danger">{error}</p> : null}
            {message ? <p className="text-sm font-medium text-lokals-green">{message}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" isLoading={createApplication.isPending || submitApplication.isPending}>
                {createApplication.isPending || submitApplication.isPending ? 'Saving...' : 'Save and submit'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
