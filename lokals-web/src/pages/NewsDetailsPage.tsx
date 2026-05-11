import { Clock3, ExternalLink, MapPin, Newspaper } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader, QueryState } from '../components/Ui'
import { FollowSourceButton } from '../components/news/FollowSourceButton'
import { RelatedNewsList } from '../components/news/RelatedNewsList'
import { useNewsItem } from '../hooks/queries'

function formatPublishedAt(value?: string | null) {
  if (!value) return 'Latest update'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Latest update' : date.toLocaleString()
}

function articleHref(url: string, source: string, title: string) {
  return `/article?${new URLSearchParams({ url, source, title }).toString()}`
}

export function NewsDetailsPage() {
  const { id } = useParams()
  const newsItemQuery = useNewsItem(id)
  const item = newsItemQuery.data?.data
  const related = newsItemQuery.data?.related ?? []

  return (
    <div className="space-y-6">
      <QueryState isLoading={newsItemQuery.isLoading} error={newsItemQuery.error} empty={!item}>
        {item ? (
          <>
            <PageHeader eyebrow="Local News" title={item.title} description="LOKALS shows a source-attributed summary only. Continue to the original publisher for the full article." />
            <article className="overflow-hidden rounded-[28px] border border-lokals-border bg-white shadow-card">
              <div className="h-64 bg-[linear-gradient(135deg,#ede9fe,#eff6ff)]">
                {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-lokals-purple"><Newspaper className="h-12 w-12" /></div>}
              </div>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-purple">{item.category.replace(/_/g, ' ')}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-lokals-muted">{[item.area, item.town].filter(Boolean).join(', ') || 'Okahandja'}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-lokals-muted">
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{formatPublishedAt(item.published_at)}</span>
                  {(item.area || item.town) ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{[item.area, item.town].filter(Boolean).join(', ')}</span> : null}
                </div>
                <div className="rounded-[20px] bg-lokals-bg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Original source</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{item.source_name}</p>
                  <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-lokals-purple">{item.source_domain ?? item.source_url}</a>
                  <p className="mt-3 text-xs text-lokals-muted">{item.compliance_notice ?? 'Content is provided by external sources. LOKALS does not own this content.'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Snippet</p>
                  <p className="mt-2 text-base leading-7 text-lokals-muted">{item.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link to={articleHref(item.external_url, item.source_name, item.title)} className="inline-flex items-center gap-2 rounded-full bg-lokals-charcoal px-5 py-3 text-sm font-semibold text-white">
                    Read full story on {item.source_name}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <a href={item.external_url} target="_blank" rel="noreferrer" className="rounded-full border border-lokals-border px-5 py-3 text-sm font-semibold text-lokals-charcoal">
                    Open in browser
                  </a>
                  <FollowSourceButton item={item} />
                  <Link to="/news" className="text-sm font-semibold text-lokals-purple">Back to news</Link>
                </div>
              </div>
            </article>

            <section className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Keep reading</p>
                <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Related local stories</h2>
              </div>
              <RelatedNewsList items={related} />
            </section>
          </>
        ) : null}
      </QueryState>
    </div>
  )
}
