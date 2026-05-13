import { useState } from 'react'
import { Badge, Button, EmptyState, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { useFeed, useFeedCategories, useHideFeedPost, useReportFeedPost, useSaveFeedPost } from '../hooks/queries'
import type { FeedPost } from '../types'

export function FeedPage() {
  const [category, setCategory] = useState('')
  const feedQuery = useFeed(category ? { category } : undefined)
  const categoriesQuery = useFeedCategories()
  const savePost = useSaveFeedPost()
  const hidePost = useHideFeedPost()
  const reportPost = useReportFeedPost()

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Community feed" title="Approved local updates" description="Town notices, events, marketplace highlights, jobs, and community updates are moderated before they appear here." />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setCategory('')} className={`rounded-full border px-4 py-2 text-sm font-medium ${category === '' ? 'border-lokals-purple bg-violet-50 text-lokals-purple' : 'border-lokals-border bg-white text-lokals-muted'}`}>
          All
        </button>
        {(categoriesQuery.data ?? []).map((item) => (
          <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={`rounded-full border px-4 py-2 text-sm font-medium ${category === item.slug ? 'border-lokals-purple bg-violet-50 text-lokals-purple' : 'border-lokals-border bg-white text-lokals-muted'}`}>
            {item.name}
          </button>
        ))}
      </div>

      <QueryState isLoading={feedQuery.isLoading} error={feedQuery.error} empty={(feedQuery.data?.data?.length ?? 0) === 0}>
        {(feedQuery.data?.data?.length ?? 0) === 0 ? (
          <EmptyState title="No community feed posts yet" body="Approved town and community updates will appear here as they are published." />
        ) : (
          <div className="space-y-4">
            {(feedQuery.data?.data ?? []).map((post: FeedPost) => (
              <SectionCard key={post.id} className="bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {post.category?.name ? <Badge tone="info">{post.category.name}</Badge> : null}
                  {post.is_featured ? <Badge tone="success">Featured</Badge> : null}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-lokals-charcoal">{post.title}</h2>
                {post.summary ? <p className="mt-2 text-sm text-lokals-muted">{post.summary}</p> : null}
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-lokals-muted">
                  {[post.source?.name, post.area, post.town].filter(Boolean).join(' • ')}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" onClick={() => savePost.mutate(post.id)}>Save</Button>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="ghost" onClick={() => hidePost.mutate(post.id)}>Hide</Button>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="ghost" onClick={() => reportPost.mutate({ id: post.id, reason: 'Needs review' })}>Report</Button>
                  {post.external_url ? <a href={post.external_url} target="_blank" rel="noreferrer"><Button className="min-h-9 px-3 py-2 text-xs">Open source</Button></a> : null}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
