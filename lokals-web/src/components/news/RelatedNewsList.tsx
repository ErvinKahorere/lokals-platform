import { Link } from 'react-router-dom'
import type { NewsItem } from '../../types'

export function RelatedNewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-lokals-muted">More related stories will appear here as the local feed grows.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={item.id} to={`/news/${item.id}`} className="block rounded-[20px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{item.source_name}</p>
          <p className="mt-2 font-semibold text-lokals-charcoal">{item.title}</p>
          <p className="mt-2 text-sm text-lokals-muted">{item.summary}</p>
        </Link>
      ))}
    </div>
  )
}
