const categories = [
  'all',
  'community',
  'business',
  'entertainment',
  'sport',
  'church',
  'school',
  'municipal',
  'training',
  'market',
  'workshop',
  'health',
  'charity',
] as const

export function EventCategoryChips({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = value === category
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-purple text-white shadow-card' : 'bg-slate-100 text-lokals-charcoal hover:bg-slate-200'}`}
          >
            {category === 'all' ? 'All' : category.replace('_', ' ')}
          </button>
        )
      })}
    </div>
  )
}
