import clsx from 'clsx'

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: Array<{ label: string; value: string }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="inline-flex rounded-full bg-lokals-border/35 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={clsx(
            'min-h-11 rounded-full px-4 text-sm font-semibold transition',
            value === item.value ? 'bg-lokals-surface text-lokals-charcoal shadow-card' : 'text-lokals-muted',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
