import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateFollow, useDeleteFollow, useFollows } from '../../hooks/queries'
import type { NewsItem } from '../../types'

export function FollowSourceButton({ item }: { item: NewsItem }) {
  const navigate = useNavigate()
  const followsQuery = useFollows(true)
  const createFollow = useCreateFollow()
  const deleteFollow = useDeleteFollow()
  const entity = item.source_entity
  const follow = useMemo(
    () => (followsQuery.data?.data ?? []).find((entry) => {
      if (!entity) return false
      return entry.followable_id === entity.id && entry.followable_type.toLowerCase().includes(entity.type === 'organization' ? 'organization' : 'serviceprovider')
    }),
    [entity, followsQuery.data?.data],
  )

  if (!entity) {
    return null
  }

  return (
    <button
      type="button"
      disabled={createFollow.isPending || deleteFollow.isPending}
      onClick={async () => {
        try {
          if (follow) {
            await deleteFollow.mutateAsync(follow.id)
            return
          }
          await createFollow.mutateAsync({ type: entity.type, id: entity.id })
        } catch {
          navigate('/login')
        }
      }}
      className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition ${follow ? 'bg-lokals-charcoal text-white' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}
    >
      {follow ? 'Following source' : 'Follow source'}
    </button>
  )
}
