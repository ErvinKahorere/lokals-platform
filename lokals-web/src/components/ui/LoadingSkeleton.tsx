import clsx from 'clsx'
import { Loader2, MapPin } from 'lucide-react'

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

export function SkeletonList({
  count = 3,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={clsx('grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => <SkeletonCard key={index} />)}
    </div>
  )
}

export function InlineLoader({
  label = 'Loading',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={clsx('inline-flex items-center gap-2 text-sm font-semibold text-lokals-purple', className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}

export function ButtonLoader({
  label = 'Processing...',
}: {
  label?: string
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </span>
  )
}

export function LoadingScreen({
  title = 'Loading LOKALS',
  message = 'Everything in your city is getting ready...',
  showError = false,
  onRetry,
  onContinueOffline,
}: {
  title?: string
  message?: string
  showError?: boolean
  onRetry?: () => void
  onContinueOffline?: () => void
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.65),_transparent_38%),linear-gradient(135deg,#6D28D9_0%,#8B5CF6_42%,#A78BFA_100%)]">
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(255,255,255,0.16),transparent)]" />
      <div className="absolute left-[-3rem] top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-20 right-[-2rem] h-52 w-52 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/12 p-8 text-center shadow-[0_28px_80px_rgba(76,29,149,0.32)] backdrop-blur-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/12 shadow-[0_18px_46px_rgba(15,23,42,0.15)]">
            <img src="/brand/lokals-icon.png" alt="LOKALS" className="h-14 w-14 object-contain" />
          </div>
          <img src="/brand/lokals-logo.svg" alt="LOKALS" className="mx-auto mt-6 h-10 w-auto brightness-0 invert" />
          <p className="mt-5 text-3xl font-semibold text-white">{title}</p>
          <p className="mt-3 text-sm font-medium text-white/80">{message}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            <MapPin className="h-3.5 w-3.5" />
            Okahandja Pilot
          </div>
          <div className="mt-8">
            {showError ? (
              <div className="space-y-3">
                <button
                  type="button"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lokals-xl border border-white/30 bg-white px-4 py-3 text-sm font-semibold text-lokals-purple shadow-card transition hover:-translate-y-px"
                  onClick={onRetry}
                >
                  Retry
                </button>
                {onContinueOffline ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lokals-xl bg-lokals-green px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(22,163,74,0.24)] transition hover:-translate-y-px"
                    onClick={onContinueOffline}
                  >
                    Continue offline/demo
                  </button>
                ) : null}
              </div>
            ) : (
              <InlineLoader label="Loading LOKALS" className="justify-center text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
