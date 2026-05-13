import { Building2, Clock3, MapPin, ShieldAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { TrustRow } from '../components/experience/TrustRow'
import { useCreateFollow, useDeleteFollow, useDirectoryAlerts, useDirectoryDetails, useFollows } from '../hooks/queries'
import { getDisplayDistance, getServicePriceLabel, resolveMediaUrl } from '../lib/display'
import { useAuthStore } from '../store/auth'
import type { AlertItem } from '../types'

export function DirectoryDetailsPage() {
  const { id } = useParams()
  const token = useAuthStore((state) => state.token)
  const directoryQuery = useDirectoryDetails(id)
  const alertsQuery = useDirectoryAlerts(id)
  const followsQuery = useFollows(Boolean(token))
  const createFollow = useCreateFollow()
  const deleteFollow = useDeleteFollow()
  const organization = directoryQuery.data
  const followId = (followsQuery.data?.data ?? []).find((follow) => follow.followable_type.includes('Organization') && follow.followable_id === organization?.id)?.id
  const alerts = (alertsQuery.data?.data ?? []) as unknown as AlertItem[]

  return (
    <QueryState isLoading={directoryQuery.isLoading || alertsQuery.isLoading} error={directoryQuery.error ?? alertsQuery.error} empty={!organization}>
      {!organization ? (
        <EmptyState title="Directory profile not found" body="This business may have moved or is no longer visible." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Directory" title={organization.name} description={organization.description ?? 'Trusted local organization profile.'} />
          <SectionCard className="bg-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <Avatar name={organization.name} src={resolveMediaUrl(organization.logo_url)} className="h-20 w-20 border border-lokals-border" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lokals-green">{organization.category}</p>
                    {organization.is_public_service ? <StatusBadge value="Public service" tone="info" /> : null}
                    {organization.is_verified ? <StatusBadge value="Verified" tone="success" /> : null}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-lokals-charcoal">{organization.name}</h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-lokals-muted"><MapPin className="h-4 w-4" />{[organization.area, organization.town, organization.location].filter(Boolean).join(', ') || 'Windhoek'}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-lokals-muted"><Clock3 className="h-4 w-4" />{organization.open_now ? 'Open now' : organization.availability_status ?? 'Opening hours unavailable'}</p>
                  {organization.emergency_contact ? <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600"><ShieldAlert className="h-4 w-4" />Emergency contact available</p> : null}
                </div>
              </div>
              <div className="w-full md:w-[320px]">
                <TrustRow
                  ratingLabel={`${organization.rating?.toFixed(1) ?? '4.7'} ★ • ${organization.review_count ?? 0} reviews`}
                  distanceLabel={getDisplayDistance(organization.distance_km, organization.location)}
                  completedLabel={`${organization.followers_count ?? 0} followers`}
                  responseLabel="Updates posted here"
                />
                <div className="mt-4">
                  <ContactActions name={organization.name} phone={organization.phone} whatsapp={organization.whatsapp} className="grid gap-2 sm:grid-cols-3" />
                </div>
                <div className="mt-3">
                  <Button variant={followId ? 'primary' : 'secondary'} className="w-full" disabled={!token || createFollow.isPending || deleteFollow.isPending} onClick={() => followId ? deleteFollow.mutate(followId) : createFollow.mutate({ type: 'organization', id: organization.id })}>
                    {!token ? 'Login to follow' : followId ? 'Following' : 'Follow updates'}
                  </Button>
                </div>
                <div className="mt-4 rounded-[20px] bg-slate-50 p-4 text-sm text-lokals-muted">
                  <p>Phone: {organization.phone ?? 'Not listed'}</p>
                  <p className="mt-2">WhatsApp: {organization.whatsapp ?? organization.phone ?? 'Not listed'}</p>
                  <p className="mt-2">Email: {organization.email ?? 'Not listed'}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <SectionCard className="bg-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-lokals-green" />
                <h3 className="text-lg font-semibold text-lokals-charcoal">Services and rates</h3>
              </div>
              <div className="mt-4 grid gap-3">
                {(organization.services ?? []).length === 0 && (organization.service_providers ?? []).length === 0 ? (
                  <div className="rounded-[20px] border border-lokals-border bg-slate-50 p-4 text-sm text-lokals-muted">
                    Services and rates are being updated. Call or message this directory contact for the latest availability.
                  </div>
                ) : (
                  <>
                    {(organization.services ?? []).map((service) => (
                      <div key={`service-${service.id}`} className="rounded-[20px] border border-lokals-border bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-lokals-charcoal">{service.name}</p>
                            <p className="mt-1 text-sm text-lokals-muted">{service.description ?? 'Local service rate'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lokals-charcoal">{getServicePriceLabel(service)}</p>
                            <p className="text-xs text-lokals-muted">{service.duration_minutes ? `${service.duration_minutes} mins` : (service.price_type ?? 'fixed')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(organization.service_providers ?? []).map((provider) => (
                      <div key={provider.id} className="rounded-[20px] border border-lokals-border bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-lokals-charcoal">{provider.name}</p>
                          <p className="mt-1 text-sm text-lokals-muted">{provider.category}</p>
                        </div>
                        <Link to={`/services/${provider.id}`} className="text-sm font-semibold text-lokals-green">View provider</Link>
                      </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {organization.services_offered?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {organization.services_offered.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-lokals-charcoal">{item}</span>
                  ))}
                </div>
              ) : null}
            </SectionCard>

            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-lokals-charcoal">Latest alerts</h3>
                <Link to="/activity" className="inline-flex min-h-11 items-center justify-center rounded-[18px] border border-lokals-border px-4 py-2 text-sm font-semibold text-lokals-charcoal transition hover:-translate-y-0.5">Activity</Link>
              </div>
              <div className="mt-4 space-y-3">
                {alerts.length === 0 ? (
                  <EmptyState title="No alerts yet" body="Follow this profile to receive announcements and service updates here." />
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="rounded-[20px] border border-lokals-border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-gold">Alert</p>
                      <p className="mt-2 font-semibold text-lokals-charcoal">{alert.title}</p>
                      <p className="mt-2 text-sm text-lokals-muted">{alert.body}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Opening hours</p>
                <div className="mt-3 space-y-2 text-sm text-lokals-muted">
                  {(organization.opening_hours?.length ? organization.opening_hours : [{ day: 'Daily', open: '08:00', close: '17:00' }]).map((slot, index) => (
                    <p key={`${slot.day ?? 'day'}-${index}`}>{slot.day ?? 'Open'}: {slot.open ?? '08:00'} - {slot.close ?? '17:00'}</p>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </QueryState>
  )
}
