const appearanceModes = [
  ['light', 'Light'],
  ['system', 'System'],
  ['dark', 'Dark'],
] as const

export function AppearanceSettings({
  value,
  onChange,
}: {
  value: 'light' | 'system' | 'dark'
  onChange: (value: 'light' | 'system' | 'dark') => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {appearanceModes.map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              value === mode ? 'bg-lokals-purple text-white shadow-card' : 'border border-lokals-border bg-white text-lokals-charcoal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-3 text-sm text-lokals-muted">
        Theme preference is saved to this device now. LOKALS still defaults to the polished light experience while dark mode support continues to mature.
      </p>
    </div>
  )
}
