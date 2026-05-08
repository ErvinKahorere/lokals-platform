export function StatusBreakdownCard({
  items,
}: {
  items: Array<{ label: string; value: number | string }>
}) {
  return (
    <div className="space-y-3 rounded-[22px] border border-lokals-border bg-white p-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-sm">
          <span className="text-lokals-muted">{item.label}</span>
          <span className="font-semibold text-lokals-charcoal">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
