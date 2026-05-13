type FilterTab = {
  label: string
  value: string
}

export function FilterTabs({
  items,
  value,
  onChange,
}: {
  items: FilterTab[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-lokals-purple text-white shadow-card'
                : 'border border-lokals-border bg-white text-lokals-charcoal hover:border-lokals-purple/20 hover:bg-lokals-purple-soft/40'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
