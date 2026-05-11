const categories = [
  { value: 'all', label: 'Local' },
  { value: 'public_notice', label: 'Public Notice' },
  { value: 'community', label: 'Community' },
  { value: 'business', label: 'Business' },
  { value: 'events', label: 'Events' },
  { value: 'safety', label: 'Safety' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'transport', label: 'Transport' },
  { value: 'sports', label: 'Sports' },
]

export function NewsCategoryChips({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = value === category.value

        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-green text-white' : 'bg-white text-lokals-charcoal border border-lokals-border'}`}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
