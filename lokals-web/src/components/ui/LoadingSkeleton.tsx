import clsx from 'clsx'

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200', className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-lokals-xl border border-lokals-border bg-lokals-surface p-5 shadow-card">
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="mt-4 h-7 w-2/3 rounded-2xl" />
      <LoadingSkeleton className="mt-4 h-4 w-full rounded-2xl" />
      <LoadingSkeleton className="mt-2 h-4 w-4/5 rounded-2xl" />
      <div className="mt-6 flex gap-3">
        <LoadingSkeleton className="h-11 flex-1 rounded-lokals-lg" />
        <LoadingSkeleton className="h-11 flex-1 rounded-lokals-lg" />
      </div>
    </div>
  )
}
