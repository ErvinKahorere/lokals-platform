import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CommunityProjectCard } from '../components/community/CommunityProjectCard'
import { Button, Card, EmptyState, PageHeader } from '../components/Ui'
import { useAdminCommunityProject, useReviewCommunityProject } from '../hooks/queries'

export function TownManagerCommunityProjectReviewPage() {
  const { id } = useParams()
  const projectQuery = useAdminCommunityProject(id)
  const reviewMutation = useReviewCommunityProject(id)
  const [reason, setReason] = useState('')

  if (projectQuery.isLoading) {
    return <div className="rounded-[28px] bg-white p-8 shadow-soft">Loading submission...</div>
  }

  if (!projectQuery.data) {
    return <EmptyState title="Submission not found" body="This initiative may have been removed or already handled." />
  }

  const project = projectQuery.data

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Manager review" title={project.title} description="Approve, reject, or request changes before this initiative becomes visible to the public." />
      <CommunityProjectCard project={project} />
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-lokals-charcoal">Review notes</h2>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={5}
          className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple"
          placeholder="Add a reason for approval notes, rejection, or requested changes."
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => reviewMutation.mutate({ action: 'approve', payload: { verification_notes: reason } })} disabled={reviewMutation.isPending}>Approve</Button>
          <Button variant="secondary" onClick={() => reviewMutation.mutate({ action: 'request-changes', payload: { reason } })} disabled={reviewMutation.isPending}>Request changes</Button>
          <Button variant="danger" onClick={() => reviewMutation.mutate({ action: 'reject', payload: { reason } })} disabled={reviewMutation.isPending}>Reject</Button>
          <Button variant="secondary" onClick={() => reviewMutation.mutate({ action: 'feature', payload: { is_featured: !project.is_featured } })} disabled={reviewMutation.isPending}>
            {project.is_featured ? 'Remove feature' : 'Feature initiative'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
