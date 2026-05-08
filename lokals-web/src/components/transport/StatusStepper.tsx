export function StatusStepper({
  steps,
  current,
  updatedAt,
}: {
  steps: string[]
  current?: string | null
  updatedAt?: string | null
}) {
  const currentIndex = Math.max(steps.findIndex((step) => step === current), 0)

  return (
    <div className="rounded-[24px] border border-lokals-border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-lokals-charcoal">Status</h3>
        <p className="text-xs text-lokals-muted">
          {updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : 'Waiting for updates'}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const isDone = index <= currentIndex
          const isCurrent = step === current
          return (
            <div key={step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${isDone ? 'bg-lokals-purple text-white' : 'bg-slate-100 text-lokals-muted'}`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 ? (
                  <div className={`mt-1 h-8 w-px ${index < currentIndex ? 'bg-lokals-purple' : 'bg-lokals-border'}`} />
                ) : null}
              </div>
              <div className="pt-1">
                <p className={`font-semibold capitalize ${isCurrent ? 'text-lokals-purple' : 'text-lokals-charcoal'}`}>
                  {step.replaceAll('_', ' ')}
                </p>
                <p className="text-sm text-lokals-muted">
                  {isCurrent ? 'Current step' : isDone ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
