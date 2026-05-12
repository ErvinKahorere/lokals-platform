import { useState } from 'react'
import { Button, Input, PageHeader, QueryState, SectionCard, TextArea } from '../../components/Ui'
import { useCommunityImpactRewards, useCreateCommunityImpactReward } from '../../hooks/queries'
import type { CommunityImpactReward } from '../../types'

export function CommunityImpactRewardsManagePage() {
  const rewardsQuery = useCommunityImpactRewards()
  const createReward = useCreateCommunityImpactReward()
  const [title, setTitle] = useState('')
  const [pointsRequired, setPointsRequired] = useState('100')
  const [type, setType] = useState('voucher')
  const [description, setDescription] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Manage Community Impact rewards" description="Add sponsored rewards without exposing residents' detailed deed history publicly." />
      <SectionCard className="bg-white p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Reward title" />
          <Input value={pointsRequired} onChange={(event) => setPointsRequired(event.target.value)} placeholder="Points required" />
          <Input value={type} onChange={(event) => setType(event.target.value)} placeholder="Type" />
        </div>
        <div className="mt-3">
          <TextArea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Reward description" />
        </div>
        <div className="mt-4">
          <Button disabled={createReward.isPending} onClick={() => createReward.mutate({ title, points_required: Number(pointsRequired), reward_type: type, description, is_active: true })}>
            {createReward.isPending ? 'Saving reward...' : 'Create reward'}
          </Button>
        </div>
      </SectionCard>
      <QueryState isLoading={rewardsQuery.isLoading} error={rewardsQuery.error}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(rewardsQuery.data?.data ?? []).map((reward: CommunityImpactReward) => (
            <SectionCard key={reward.id} className="bg-white p-5">
              <h2 className="text-lg font-semibold text-lokals-charcoal">{reward.title}</h2>
              <p className="mt-2 text-sm text-lokals-muted">{reward.points_required} points • {reward.reward_type}</p>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
