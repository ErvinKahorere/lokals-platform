import { Clock3, MapPin, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NewsItem } from '../../types'

function formatRelative(value?: string | null) {
  if (!value) return 'Latest update'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Latest update' : date.toLocaleString()
}

function articleHref(item: NewsItem) {
  const params = new URLSearchParams({
    url: item.external_url,
    source: item.source_name,
    title: item.title,
  })
  return `/article?${params.toString()}`
}

export function NewsCard({ item }: { item: NewsItem }) {
  const locationLabel = [item.area, item.town].filter(Boolean).join(', ') || 'Okahandja'

  return (
    <article className="overflow-hidden rounded-[24px] border border-lokals-border bg-white shadow-card">
      <div className="h-44 bg-[linear-gradient(135deg,#ede9fe,#eff6ff)]">
        {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-lokals-purple"><Newspaper className="h-10 w-10" /></div>}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-lokals-purple">{item.category.replace(/_/g, ' ')}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-lokals-muted">{locationLabel}</span>
        </div>
        <Link to={`/news/${item.id}`} className="block text-xl font-semibold text-lokals-charcoal transition hover:text-lokals-purple">
          {item.title}
        </Link>
        <p className="text-sm leading-6 text-lokals-muted">{item.summary}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-lokals-muted">
          <span className="font-semibold text-lokals-charcoal">{item.source_name}</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{formatRelative(item.published_at)}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{locationLabel}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={`/news/${item.id}`} className="text-sm font-semibold text-lokals-purple">Open details</Link>
          <Link to={articleHref(item)} className="rounded-full bg-lokals-charcoal px-4 py-2 text-sm font-semibold text-white">
            Read Full Story
          </Link>
        </div>
      </div>
    </article>
  )
}
