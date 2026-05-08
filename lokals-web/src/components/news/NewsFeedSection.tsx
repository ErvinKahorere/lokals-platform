import { Link } from 'react-router-dom'
import { EmptyState, QueryState } from '../Ui'
import { NewsCard } from './NewsCard'
import type { NewsItem } from '../../types'

export function NewsFeedSection({
  title,
  eyebrow,
  items,
  isLoading,
  error,
  to = '/news',
}: {
  title: string
  eyebrow: string
  items: NewsItem[]
  isLoading?: boolean
  error?: unknown
  to?: string
}) {
  return (
    <section className="space-y-4 border-t border-slate-200/70 pt-6">
      <div className="flex items-center justify-between gap-2">
        <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">{title}</h2>
        </div>
        <Link to={to} className="text-sm font-semibold text-lokals-green">See all</Link>
      </div>
      <QueryState isLoading={isLoading} error={error} empty={items.length === 0}>
        {items.length === 0 ? (
          <EmptyState title="No local news yet" body="Aggregated stories will appear here once sources start updating." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {items.map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        )}
      </QueryState>
    </section>
  )
}
