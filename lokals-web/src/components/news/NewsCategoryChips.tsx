const categories = ['all', 'business', 'community', 'events', 'safety', 'health', 'education', 'transport', 'sports', 'property', 'public_notice']

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
        const active = value === category

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-green text-white' : 'bg-white text-lokals-charcoal border border-lokals-border'}`}
          >
            {category === 'all' ? 'Local' : category.replace(/_/g, ' ')}
          </button>
        )
      })}
    </div>
  )
}
