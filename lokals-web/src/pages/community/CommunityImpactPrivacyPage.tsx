import { useMemo, useState } from 'react'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, Select } from '../../components/Ui'
import { useCommunityImpactDashboard, useUpdateCommunityImpactPrivacy } from '../../hooks/queries'
import type { CommunityImpactAccount } from '../../types'

type PrivacyFormProps = {
  account: CommunityImpactAccount
  updatePrivacy: ReturnType<typeof useUpdateCommunityImpactPrivacy>
}

function PrivacyForm({ account, updatePrivacy }: PrivacyFormProps) {
  const [displayName, setDisplayName] = useState(account.public_display_name ?? '')
  const [privacyMode, setPrivacyMode] = useState(account.privacy_mode ?? 'private')
  const [optIn, setOptIn] = useState(account.public_leaderboard_opt_in ?? false)

  return (
    <SectionCard className="bg-white p-5">
      <label className="flex items-center justify-between gap-4 rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
        <div>
          <p className="font-semibold text-lokals-charcoal">Show me on public Community Impact leaderboard</p>
          <p className="mt-1 text-sm text-lokals-muted">Only your chosen public identity, rank, points, and level are shown.</p>
        </div>
        <input type="checkbox" checked={optIn} onChange={(event) => setOptIn(event.target.checked)} className="h-5 w-5" />
      </label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
          Display mode
          <Select value={privacyMode} onChange={(event) => setPrivacyMode(event.target.value as CommunityImpactAccount['privacy_mode'])}>
            <option value="private">Private</option>
            <option value="initials">Initials</option>
            <option value="display_name">Display name</option>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
          Public display name
          <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Optional public name" />
        </label>
      </div>
      <div className="mt-4">
        <Button
          disabled={updatePrivacy.isPending}
          onClick={() => updatePrivacy.mutate({
            public_leaderboard_opt_in: optIn,
            privacy_mode: privacyMode,
            public_display_name: displayName || undefined,
          })}
        >
          {updatePrivacy.isPending ? 'Saving...' : 'Save privacy settings'}
        </Button>
      </div>
    </SectionCard>
  )
}

export function CommunityImpactPrivacyPage() {
  const dashboardQuery = useCommunityImpactDashboard()
  const updatePrivacy = useUpdateCommunityImpactPrivacy()
  const account = useMemo<CommunityImpactAccount | undefined>(() => {
    if (!dashboardQuery.data) return undefined
    return 'data' in dashboardQuery.data.account ? dashboardQuery.data.account.data : dashboardQuery.data.account
  }, [dashboardQuery.data])
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Privacy first" title="Community Impact Privacy Settings" description="Leaderboard visibility is off by default, and detailed deed history is never public." />
      <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error}>
        {!account ? <EmptyState title="Settings unavailable" body="Please try again shortly." /> : <PrivacyForm account={account} updatePrivacy={updatePrivacy} />}
      </QueryState>
    </div>
  )
}
