import { useState } from 'react'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, TextArea } from '../../components/Ui'
import { useApproveFeedPost, useFeatureFeedPost, usePendingFeedPosts, useRejectFeedPost } from '../../hooks/queries'
import { useAuthStore } from '../../store/auth'

export function FeedModerationPage() {
  const [reason, setReason] = useState('')
  const user = useAuthStore((state) => state.user)
  const isPlatformAdmin = Boolean(user?.roles?.some((role) => role === 'super_admin' || role === 'operator'))
  const pendingQuery = usePendingFeedPosts()
  const approveMutation = useApproveFeedPost()
  const rejectMutation = useRejectFeedPost()
  const featureMutation = useFeatureFeedPost()

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={isPlatformAdmin ? 'Admin' : 'Town Manager'} title="Pending feed approvals" description="Review local updates before they become public in the community feed." />
      <TextArea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional moderation note or rejection reason" rows={3} />
      <QueryState isLoading={pendingQuery.isLoading} error={pendingQuery.error} empty={(pendingQuery.data?.length ?? 0) === 0}>
        {(pendingQuery.data?.length ?? 0) === 0 ? (
          <EmptyState title="No pending feed items" body="New posts waiting for review will appear here." />
        ) : (
          <div className="space-y-4">
            {(pendingQuery.data ?? []).map((post) => (
              <SectionCard key={post.id} className="bg-white p-5">
                <h2 className="text-lg font-semibold text-lokals-charcoal">{post.title}</h2>
                {post.summary ? <p className="mt-2 text-sm text-lokals-muted">{post.summary}</p> : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button className="min-h-9 px-3 py-2 text-xs" onClick={() => approveMutation.mutate({ id: post.id, notes: reason || undefined })}>Approve</Button>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" onClick={() => featureMutation.mutate({ id: post.id, is_featured: true })}>Feature</Button>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="ghost" onClick={() => rejectMutation.mutate({ id: post.id, reason: reason || 'Changes needed before publishing' })}>Reject</Button>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
