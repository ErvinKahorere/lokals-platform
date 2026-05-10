import type { PropsWithChildren, ReactNode } from 'react'
import { Card } from './ui/Card'
import { EmptyState as BaseEmptyState } from './ui/EmptyState'
import { Header } from './ui/Header'
import { InlineLoader, SkeletonList } from './ui/LoadingSkeleton'
import { Badge } from './ui/Badge'
export { Button } from './ui/Button'
export { Badge } from './ui/Badge'
export { Header } from './ui/Header'
export { Input, Select, TextArea } from './ui/Input'
export { SearchBar } from './ui/SearchBar'
export { ProviderCard } from './ui/ProviderCard'
export { ListingCard } from './ui/ListingCard'
export { ProductCard } from './ui/ProductCard'
export { AccommodationCard } from './ui/AccommodationCard'
export { JobCard } from './ui/JobCard'
export { BookingCard } from './ui/BookingCard'
export { AlertCard } from './ui/AlertCard'
export { ActionTile } from './ui/ActionTile'
export { StatCard } from './ui/StatCard'
export { Tabs } from './ui/Tabs'
export { ButtonLoader, InlineLoader, LoadingScreen, SkeletonCard, SkeletonList } from './ui/LoadingSkeleton'

export function StatusBadge({
  value,
  tone = 'neutral',
  className,
}: {
  value: ReactNode
  tone?: 'success' | 'warning' | 'warn' | 'danger' | 'info' | 'neutral' | 'accent'
  className?: string
}) {
  return (
    <Badge tone={tone === 'warn' ? 'warning' : tone} className={className}>
      {value}
    </Badge>
  )
}

export function SectionCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <Card className={className}>{children}</Card>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <Header eyebrow={eyebrow} title={title} description={description} actions={actions} />
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <BaseEmptyState title={title} body={body} action={action} />
}

export function QueryState({
  isLoading,
  error,
  empty,
  children,
}: PropsWithChildren<{ isLoading?: boolean; error?: unknown; empty?: boolean }>) {
  if (isLoading) {
    return <SkeletonList count={6} />
  }

  if (error) {
    return <BaseEmptyState title="Something went wrong" body="We could not load this section right now. Try again in a moment." />
  }

  if (empty) {
    return <BaseEmptyState title="Nothing here yet" body="This space will fill as people publish, book, and move around the city." />
  }

  return <>{children}</>
}

export function SectionLoader({ label = 'Loading section' }: { label?: string }) {
  return <InlineLoader label={label} />
}
