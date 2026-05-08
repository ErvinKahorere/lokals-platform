import { StatusBadge } from '../Ui'
import { roleLabel, roleOptions } from './accountUtils'

export function RoleSwitcher({
  roles,
  currentRole,
  isSwitching,
  onSwitch,
}: {
  roles: string[]
  currentRole?: string | null
  isSwitching?: boolean
  onSwitch: (role: string) => void
}) {
  const availableRoles = roles.length > 0 ? roles : [...roleOptions]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableRoles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onSwitch(role)}
            disabled={isSwitching || role === currentRole}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              role === currentRole
                ? 'bg-lokals-purple text-white shadow-card'
                : 'border border-lokals-border bg-white text-lokals-charcoal hover:border-lokals-purple/30'
            }`}
          >
            {roleLabel(role)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-lokals-charcoal">Active role</p>
          <p className="mt-1 text-sm text-lokals-muted">Switch roles to change the tools and shortcuts you see.</p>
        </div>
        <StatusBadge tone="accent" value={roleLabel(currentRole)} />
      </div>
      <p className="text-xs text-lokals-muted">Need more roles? Additional role onboarding stays available through the flows that create services, businesses, and worker profiles.</p>
    </div>
  )
}
