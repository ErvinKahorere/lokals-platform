import { InlineLoader } from './LoadingSkeleton'

export function LoadingState({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="rounded-[24px] border border-lokals-border bg-white p-6 shadow-card">
      <InlineLoader label={label} />
    </div>
  )
}
