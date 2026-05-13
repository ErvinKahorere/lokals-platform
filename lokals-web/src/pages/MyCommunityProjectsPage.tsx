import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CommunityProjectCard } from '../components/community/CommunityProjectCard'
import { Button, Card, EmptyState, PageHeader, QueryState, StatusBadge, TextArea } from '../components/Ui'
import { useCreateCommunityProjectUpdate, useMyCommunityProjects } from '../hooks/queries'

export function MyCommunityProjectsPage() {
  const projectsQuery = useMyCommunityProjects()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateBody, setUpdateBody] = useState('')
  const [progressPercent, setProgressPercent] = useState('25')
  const [statusAfterUpdate, setStatusAfterUpdate] = useState('in_progress')
  const projects = projectsQuery.data?.data ?? []
  const updateMutation = useCreateCommunityProjectUpdate(expandedId ?? undefined)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My initiatives"
        title="Projects I submitted"
        description="Track approval status, verification notes, and support progress across your community initiatives."
        actions={<Link to="/get-involved/submit"><Button>Submit another project</Button></Link>}
      />
      <QueryState isLoading={projectsQuery.isLoading} error={projectsQuery.error} empty={projects.length === 0}>
        {projects.length === 0 ? (
          <EmptyState title="No projects submitted yet" body="Start a verified local initiative for donations, volunteers, or community support." />
        ) : (
          <div className="space-y-5">
            {projects.map((project) => (
              <div key={project.id} className="space-y-4">
                <CommunityProjectCard
                  project={project}
                  action={
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/get-involved/${project.slug}`}><Button variant="secondary">Open public view</Button></Link>
                      <Button variant="secondary" onClick={() => setExpandedId((current) => current === project.id ? null : project.id)}>
                        {expandedId === project.id ? 'Hide update form' : 'Post progress update'}
                      </Button>
                    </div>
                  }
                />

                <Card className="grid gap-3 p-5 md:grid-cols-3">
                  <div className="rounded-[18px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Verification</p>
                    <div className="mt-2"><StatusBadge value={(project.verification_status ?? 'pending').replaceAll('_', ' ')} tone={project.is_verified ? 'success' : project.verification_status === 'rejected' ? 'danger' : 'warning'} /></div>
                  </div>
                  <div className="rounded-[18px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Reference</p>
                    <p className="mt-2 font-semibold text-lokals-charcoal">{project.reference_code}</p>
                  </div>
                  <div className="rounded-[18px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Latest note</p>
                    <p className="mt-2 text-sm text-lokals-charcoal">{project.verification_notes ?? project.rejection_reason ?? 'No review note yet.'}</p>
                  </div>
                </Card>

                {expandedId === project.id ? (
                  <Card className="space-y-4 p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-lokals-charcoal">Post a progress update</h3>
                      <p className="mt-2 text-sm text-lokals-muted">Share milestones, volunteer progress, or funding movement. Town Manager approval still applies before the update becomes public.</p>
                    </div>
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault()
                        const payload = new FormData()
                        payload.append('title', updateTitle)
                        payload.append('body', updateBody)
                        payload.append('status_after_update', statusAfterUpdate)
                        payload.append('progress_percent', progressPercent)
                        updateMutation.mutate(payload, {
                          onSuccess: async () => {
                            setUpdateTitle('')
                            setUpdateBody('')
                            setProgressPercent('25')
                            setStatusAfterUpdate('in_progress')
                            setExpandedId(null)
                            await projectsQuery.refetch()
                          },
                        })
                      }}
                    >
                      <input value={updateTitle} onChange={(event) => setUpdateTitle(event.target.value)} required className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Update title" />
                      <TextArea value={updateBody} onChange={(event) => setUpdateBody(event.target.value)} rows={4} placeholder="Share what changed, what is still needed, and what residents should know next." required />
                      <div className="grid gap-3 md:grid-cols-2">
                        <input value={progressPercent} onChange={(event) => setProgressPercent(event.target.value)} type="number" min="0" max="100" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Progress %" />
                        <select value={statusAfterUpdate} onChange={(event) => setStatusAfterUpdate(event.target.value)} className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple">
                          <option value="in_progress">In progress</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Submitting...' : 'Submit update for review'}</Button>
                        <Button type="button" variant="secondary" onClick={() => setExpandedId(null)}>Cancel</Button>
                      </div>
                    </form>
                  </Card>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
