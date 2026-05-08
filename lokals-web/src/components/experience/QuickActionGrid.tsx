import { quickActions } from '../../styles/theme'
import { ActionTile } from '../ui/ActionTile'

export function QuickActionGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {quickActions.map((item) => (
        <ActionTile key={item.label} to={item.to} label={item.label} subtitle="Open fast" icon={item.icon} className={item.color} />
      ))}
    </section>
  )
}
