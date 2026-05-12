import { HeartHandshake, PlusCircle, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CommunityProjectCard } from '../components/community/CommunityProjectCard'
import { Button, Card, EmptyState, PageHeader, QueryState } from '../components/Ui'
import { useCommunityProjectCategories, useCommunityProjects, useFeaturedCommunityProjects } from '../hooks/queries'

export function CommunityProjectsPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [needsVolunteers, setNeedsVolunteers] = useState(false)
  const [needsDonations, setNeedsDonations] = useState(false)
  const categoriesQuery = useCommunityProjectCategories()
  const featuredQuery = useFeaturedCommunityProjects()
  const params = useMemo(() => ({
    ...(categoryId ? { category_id: categoryId } : {}),
    ...(featuredOnly ? { featured: true } : {}),
    ...(needsVolunteers ? { needs_volunteers: true } : {}),
    ...(needsDonations ? { needs_donations: true } : {}),
  }), [categoryId, featuredOnly, needsVolunteers, needsDonations])
  const projectsQuery = useCommunityProjects(params)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Get involved"
        title="Community Projects"
        description="Verified local initiatives for donations, volunteers, sponsorships, and visible neighbourhood improvement."
        actions={<Link to="/get-involved/submit"><Button><PlusCircle className="h-4 w-4" /> Submit project</Button></Link>}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Town-approved local action</h2>
              <p className="mt-1 text-sm leading-6 text-lokals-muted">
                Every initiative is reviewed by the Town Manager before it becomes visible, so residents and businesses can support credible community work with confidence.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategoryId(undefined)} className={`rounded-full px-3 py-2 text-sm font-semibold ${categoryId == null ? 'bg-lokals-purple text-white' : 'bg-slate-100 text-lokals-charcoal'}`}>All</button>
            {(categoriesQuery.data?.data ?? []).map((category) => (
              <button key={category.id} type="button" onClick={() => setCategoryId(category.id)} className={`rounded-full px-3 py-2 text-sm font-semibold ${categoryId === category.id ? 'bg-lokals-purple text-white' : 'bg-slate-100 text-lokals-charcoal'}`}>
                {category.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Featured', active: featuredOnly, onClick: () => setFeaturedOnly((value) => !value) },
              { label: 'Needs volunteers', active: needsVolunteers, onClick: () => setNeedsVolunteers((value) => !value) },
              { label: 'Needs donations', active: needsDonations, onClick: () => setNeedsDonations((value) => !value) },
            ].map((chip) => (
              <button key={chip.label} type="button" onClick={chip.onClick} className={`rounded-full px-3 py-2 text-sm font-semibold ${chip.active ? 'bg-lokals-green text-white' : 'bg-lokals-green-soft text-lokals-green'}`}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Featured</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Initiatives needing support now</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-lokals-green-soft px-3 py-2 text-sm font-semibold text-lokals-green">
            <ShieldCheck className="h-4 w-4" />
            Verified only
          </span>
        </div>
        <QueryState isLoading={featuredQuery.isLoading} error={featuredQuery.error} empty={(featuredQuery.data?.data?.length ?? 0) === 0}>
          <div className="grid gap-4 lg:grid-cols-2">
            {(featuredQuery.data?.data ?? []).map((project) => (
              <CommunityProjectCard key={project.id} project={project} />
            ))}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Browse all</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Approved initiatives across Okahandja</h2>
        </div>
        <QueryState isLoading={projectsQuery.isLoading} error={projectsQuery.error} empty={(projectsQuery.data?.data?.length ?? 0) === 0}>
          {(projectsQuery.data?.data?.length ?? 0) === 0 ? (
            <EmptyState title="No initiatives match these filters" body="Try another category or support type to see active projects." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {(projectsQuery.data?.data ?? []).map((project) => (
                <CommunityProjectCard key={project.id} project={project} compact />
              ))}
            </div>
          )}
        </QueryState>
      </section>
    </div>
  )
}
