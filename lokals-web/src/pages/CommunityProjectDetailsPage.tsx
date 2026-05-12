import { Mail, Phone, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CommunityProjectCard } from '../components/community/CommunityProjectCard'
import { Badge, Button, Card, EmptyState, PageHeader } from '../components/Ui'
import { useCommunityProject, useCreateCommunityProjectPledge, useFollowCommunityProject, useUnfollowCommunityProject } from '../hooks/queries'

export function CommunityProjectDetailsPage() {
  const { slug } = useParams()
  const projectQuery = useCommunityProject(slug)
  const project = projectQuery.data
  const followMutation = useFollowCommunityProject(project?.id)
  const unfollowMutation = useUnfollowCommunityProject(project?.id)
  const pledgeMutation = useCreateCommunityProjectPledge(project?.id)
  const [pledgeType, setPledgeType] = useState<'money' | 'volunteer' | 'service' | 'item' | 'other'>('money')

  const contactHref = useMemo(() => {
    if (project?.contact_whatsapp) {
      return `https://wa.me/${project.contact_whatsapp.replace(/\D/g, '')}`
    }
    if (project?.contact_phone) {
      return `tel:${project.contact_phone}`
    }
    if (project?.contact_email) {
      return `mailto:${project.contact_email}`
    }
    return null
  }, [project?.contact_email, project?.contact_phone, project?.contact_whatsapp])

  if (projectQuery.isLoading) {
    return <div className="rounded-[28px] bg-white p-8 shadow-soft">Loading community project...</div>
  }

  if (!project) {
    return <EmptyState title="Project not found" body="This initiative may have been archived or is still waiting for Town Manager approval." />
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Get involved" title={project.title} description={project.summary} />
      <CommunityProjectCard
        project={project}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              variant={project.is_following ? 'secondary' : 'primary'}
              onClick={() => project.is_following ? unfollowMutation.mutate() : followMutation.mutate()}
            >
              {project.is_following ? 'Following' : 'Follow'}
            </Button>
            <Link to={`/get-involved/${project.slug}/updates`}><Button variant="secondary">Open updates</Button></Link>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-lokals-charcoal">Support needed</h2>
            <p className="mt-2 text-sm leading-6 text-lokals-muted">{project.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(project.support_needed ?? []).map((item) => <Badge key={item} tone="neutral">{item}</Badge>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {project.target_amount != null ? <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-lokals-muted">Funding goal</p><p className="mt-2 text-lg font-semibold text-lokals-charcoal">N$ {project.target_amount}</p></div> : null}
            {project.current_amount != null ? <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-lokals-muted">Raised</p><p className="mt-2 text-lg font-semibold text-lokals-charcoal">N$ {project.current_amount}</p></div> : null}
            {project.target_volunteers != null ? <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-lokals-muted">Volunteer goal</p><p className="mt-2 text-lg font-semibold text-lokals-charcoal">{project.target_volunteers}</p></div> : null}
            {project.current_volunteers != null ? <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-lokals-muted">Current volunteers</p><p className="mt-2 text-lg font-semibold text-lokals-charcoal">{project.current_volunteers}</p></div> : null}
          </div>
          <div>
            <h3 className="text-base font-semibold text-lokals-charcoal">Progress updates</h3>
            <div className="mt-3 space-y-3">
              {(project.updates ?? []).length === 0 ? (
                <EmptyState title="No updates yet" body="The organiser has not posted a public milestone yet." />
              ) : (
                project.updates?.map((update) => (
                  <Card key={update.id} className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-lokals-charcoal">{update.title}</h4>
                      {update.status_after_update ? <Badge tone="info">{update.status_after_update}</Badge> : null}
                      {update.progress_percent != null ? <Badge tone="accent">{update.progress_percent}%</Badge> : null}
                    </div>
                    <p className="text-sm leading-6 text-lokals-muted">{update.body}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-lokals-muted">{update.created_at ? new Date(update.created_at).toLocaleString() : 'Recent'}</p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Offer support</h2>
              <p className="mt-2 text-sm leading-6 text-lokals-muted">Choose how you want to help, then send your pledge directly to the organiser.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['money', 'volunteer', 'service', 'item', 'other'] as const).map((type) => (
                <button key={type} type="button" onClick={() => setPledgeType(type)} className={`rounded-full px-3 py-2 text-sm font-semibold ${pledgeType === type ? 'bg-lokals-purple text-white' : 'bg-slate-100 text-lokals-charcoal'}`}>
                  {type}
                </button>
              ))}
            </div>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                pledgeMutation.mutate({
                  pledge_type: pledgeType,
                  pledge_description: String(form.get('pledge_description') ?? ''),
                  amount: form.get('amount') ? String(form.get('amount')) : undefined,
                  quantity: form.get('quantity') ? Number(form.get('quantity')) : undefined,
                  contact_phone: String(form.get('contact_phone') ?? ''),
                  contact_email: String(form.get('contact_email') ?? ''),
                })
              }}
            >
              <textarea name="pledge_description" required rows={4} className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Tell the organiser what you can offer." />
              {pledgeType === 'money' ? <input name="amount" type="number" min="0" step="0.01" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Amount (N$)" /> : null}
              {pledgeType === 'item' ? <input name="quantity" type="number" min="1" step="1" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Quantity" /> : null}
              <input name="contact_phone" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Contact phone" />
              <input name="contact_email" type="email" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Contact email" />
              <Button type="submit" disabled={pledgeMutation.isPending}>{pledgeMutation.isPending ? 'Sending...' : 'Send pledge'}</Button>
            </form>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-lokals-charcoal">Organiser</h2>
            <div className="space-y-2 text-sm text-lokals-muted">
              <p className="font-semibold text-lokals-charcoal">{project.contact_name}</p>
              {project.contact_phone ? <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-lokals-purple" /> {project.contact_phone}</p> : null}
              {project.contact_email ? <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-lokals-purple" /> {project.contact_email}</p> : null}
              <p className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-lokals-purple" /> {project.followers_count ?? 0} people following</p>
            </div>
            {contactHref ? <a href={contactHref} target={contactHref.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><Button variant="secondary">Contact organiser</Button></a> : null}
          </Card>
        </div>
      </div>
    </div>
  )
}
