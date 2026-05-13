import { Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRemoveSavedItem, useSaveItem, useSavedItems } from '../../hooks/queries'
import { navigateToLogin } from '../../lib/authNavigation'
import { useAuthStore } from '../../store/auth'

export function SaveButton({
  label,
  itemId,
  itemType,
  onChange,
}: {
  label: string
  itemId?: number | string
  itemType?: string
  onChange?: (saved: boolean) => void
}) {
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const savedItemsQuery = useSavedItems(Boolean(token && itemType && itemId))
  const saveItem = useSaveItem()
  const removeSavedItem = useRemoveSavedItem()
  const remoteSaved = useMemo(() => {
    if (!itemType || !itemId) return false
    return (savedItemsQuery.data?.items ?? []).some((item) => item.kind === itemType && String(item.id) === String(itemId))
  }, [itemId, itemType, savedItemsQuery.data?.items])
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null)
  const saved = optimisticSaved ?? (token && itemType && itemId ? remoteSaved : false)

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      onClick={async () => {
        if (!token || !itemType || !itemId) {
          navigateToLogin(navigate)
          return
        }

        const nextSaved = !saved
        setOptimisticSaved(nextSaved)
        onChange?.(nextSaved)
        try {
          if (nextSaved) {
            await saveItem.mutateAsync({ type: itemType, id: itemId })
          } else {
            await removeSavedItem.mutateAsync({ type: itemType, id: itemId })
          }
          setOptimisticSaved(null)
        } catch {
          setOptimisticSaved(!nextSaved)
          onChange?.(!nextSaved)
        }
      }}
      disabled={saveItem.isPending || removeSavedItem.isPending}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${saved ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-white/80 bg-white/90 text-lokals-charcoal'}`}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
