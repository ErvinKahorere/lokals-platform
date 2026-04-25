import { quickActions } from '../../styles/theme'
import { ActionTile } from '../ui/ActionTile'

export function QuickActionGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {quickActions.map((item) => (
        <ActionTile key={item.label} to={item.to} label={item.label} subtitle="Open fast" icon={item.icon} className={item.color} />
      ))}
    </section>
  )
}
