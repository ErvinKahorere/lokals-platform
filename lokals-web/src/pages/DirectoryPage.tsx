import { BellRing, MapPin, Phone } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Avatar } from '../components/ui/Avatar'
import { useAnnouncements, useCreateFollow, useDeleteFollow, useDirectory, useFollows } from '../hooks/queries'
import { Button, EmptyState, PageHeader, QueryState, SearchBar, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { TrustRow } from '../components/experience/TrustRow'
import { getDisplayDistance, resolveMediaUrl } from '../lib/display'
import { useAuthStore } from '../store/auth'
import type { Organization } from '../types'

type DirectoryAlert = {
  organization_id?: number | null
}

export function DirectoryPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [sortBy, setSortBy] = useState<'nearest' | 'popular' | 'recent' | 'open'>('nearest')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [publicOnly, setPublicOnly] = useState(false)
  const [category, setCategory] = useState<'all' | 'public' | 'police' | 'clinic' | 'council' | 'emergency' | 'business'>('all')
  const token = useAuthStore((state) => state.token)
  const directoryQuery = useDirectory({ ...(search ? { search } : {}), ...(verifiedOnly ? { verified: 1 } : {}), ...(publicOnly ? { public_service: 1 } : {}), sort: sortBy })
  const announcementsQuery = useAnnouncements()
  const followsQuery = useFollows(Boolean(token))
  const createFollow = useCreateFollow()
  const deleteFollow = useDeleteFollow()
  const organizations = useMemo(() => {
    const items = directoryQuery.data?.data ?? []
    return items.filter((organization) => {
      const haystack = `${organization.category} ${organization.subcategory ?? ''}`.toLowerCase()
      switch (category) {
        case 'public':
          return organization.is_public_service === true
        case 'police':
          return haystack.includes('police')
        case 'clinic':
          return haystack.includes('clinic') || haystack.includes('health')
        case 'council':
          return haystack.includes('council') || haystack.includes('municipal')
        case 'emergency':
          return haystack.includes('emergency')
        case 'business':
          return organization.is_public_service !== true
        default:
          return true
      }
    })
  }, [category, directoryQuery.data])
  const follows = followsQuery.data?.data ?? []
  const alerts = (announcementsQuery.data?.data ?? []) as DirectoryAlert[]

  const getFollowId = (organizationId: number) =>
    follows.find((follow) => follow.followable_type.includes('Organization') && follow.followable_id === organizationId)?.id

  const toggleFollow = async (organizationId: number) => {
    const followId = getFollowId(organizationId)
    if (followId) {
      await deleteFollow.mutateAsync(followId)
      return
    }

    await createFollow.mutateAsync({ type: 'organization', id: organizationId })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Directory"
        title="Local organizations and city-linked services"
        description="Residents can quickly find institutions, clinics, workshops, and offices without typing long searches."
        actions={<SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onValueSelect={setSearch} recentKey="directory" suggestions={['Clinics nearby', 'Local workshops', 'Municipal offices', 'Verified providers']} shortcuts={[{ label: 'Verified', value: 'verified' }, { label: 'Open today', value: 'open today' }, { label: 'Nearby', value: 'nearby' }]} placeholder="Search clinics, police, businesses..." className="w-full md:w-72" />}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant={category === 'all' ? 'primary' : 'secondary'} onClick={() => setCategory('all')}>All</Button>
        <Button variant={category === 'public' ? 'primary' : 'secondary'} onClick={() => setCategory('public')}>Public</Button>
        <Button variant={category === 'police' ? 'primary' : 'secondary'} onClick={() => setCategory('police')}>Police</Button>
        <Button variant={category === 'clinic' ? 'primary' : 'secondary'} onClick={() => setCategory('clinic')}>Clinic</Button>
        <Button variant={category === 'council' ? 'primary' : 'secondary'} onClick={() => setCategory('council')}>Council</Button>
        <Button variant={category === 'emergency' ? 'primary' : 'secondary'} onClick={() => setCategory('emergency')}>Emergency</Button>
        <Button variant={category === 'business' ? 'primary' : 'secondary'} onClick={() => setCategory('business')}>Business</Button>
        <Button variant={sortBy === 'nearest' ? 'primary' : 'secondary'} onClick={() => setSortBy('nearest')}>Nearest first</Button>
        <Button variant={sortBy === 'popular' ? 'primary' : 'secondary'} onClick={() => setSortBy('popular')}>Popular in your area</Button>
        <Button variant={sortBy === 'recent' ? 'primary' : 'secondary'} onClick={() => setSortBy('recent')}>Recently added</Button>
        <Button variant={sortBy === 'open' ? 'primary' : 'secondary'} onClick={() => setSortBy('open')}>Open now</Button>
        <Button variant={verifiedOnly ? 'primary' : 'secondary'} onClick={() => setVerifiedOnly((value) => !value)}>Verified only</Button>
        <Button variant={publicOnly ? 'primary' : 'secondary'} onClick={() => setPublicOnly((value) => !value)}>Public service</Button>
      </div>
      <QueryState isLoading={directoryQuery.isLoading} error={directoryQuery.error} empty={organizations.length === 0}>
        {organizations.length === 0 ? (
          <EmptyState title="No public services listed yet for this category" body="Try another area or remove a filter to see more local places." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {organizations.map((organization: Organization) => (
              <SectionCard key={organization.id} className="bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <Avatar name={organization.name} src={resolveMediaUrl(organization.logo_url)} className="h-16 w-16 border border-lokals-border" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-green">{organization.category}</p>
                      <h3 className="mt-2 text-lg font-semibold text-lokals-charcoal">{organization.name}</h3>
                      <p className="mt-2 text-sm text-lokals-muted">{organization.description ?? 'Trusted local organization listing.'}</p>
                    </div>
                  </div>
                  <Button variant={getFollowId(organization.id) ? 'primary' : 'secondary'} className="min-w-24" disabled={!token || createFollow.isPending || deleteFollow.isPending} onClick={() => void toggleFollow(organization.id)}>
                    {!token ? 'Login to follow' : getFollowId(organization.id) ? 'Following' : 'Follow'}
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge value={organization.is_public_service ? 'Public service' : organization.is_verified ? 'Verified' : 'Directory'} tone={organization.is_public_service ? 'info' : organization.is_verified ? 'success' : 'neutral'} />
                  <StatusBadge value={organization.open_now ? 'Open now' : organization.availability_status ?? 'Check hours'} tone={organization.open_now ? 'success' : 'warning'} />
                </div>

                <div className="mt-4">
                  <TrustRow
                    ratingLabel={`${organization.rating?.toFixed(1) ?? '4.7'} ★ • ${organization.review_count ?? 0} reviews`}
                    distanceLabel={getDisplayDistance(organization.distance_km, organization.location)}
                    completedLabel={`${organization.followers_count ?? 0} followers`}
                    responseLabel="Posts local updates"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-lokals-muted">
                  <MapPin className="h-4 w-4" />
                  <span>{[organization.area, organization.town, organization.location].filter(Boolean).join(', ') || 'Okahandja'}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-lokals-muted">
                  <BellRing className="h-4 w-4" />
                  <span>{alerts.filter((item) => item.organization_id === organization.id).length || 0} recent alerts</span>
                </div>

                <div className="mt-5">
                  <ContactActions name={organization.name} phone={organization.phone} whatsapp={organization.whatsapp} className="grid gap-2 sm:grid-cols-3" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-sm text-lokals-muted">
                    <Phone className="h-4 w-4" />
                    <span>{organization.phone ?? 'Call details available inside'}</span>
                  </div>
                  <Link to={`/directory/${organization.id}`} className="text-sm font-semibold text-lokals-green">View details</Link>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
