import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Ui'
import { useSaveEvent, useUnsaveEvent } from '../../hooks/queries'
import { navigateToLogin } from '../../lib/authNavigation'
import { useAuthStore } from '../../store/auth'

export function SaveEventButton({ eventId, isSaved, disabled, compact = false }: { eventId: number; isSaved?: boolean; disabled?: boolean; compact?: boolean }) {
  const saveEvent = useSaveEvent()
  const unsaveEvent = useUnsaveEvent()
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  return (
    <Button
      variant={isSaved ? 'primary' : 'secondary'}
      disabled={disabled || saveEvent.isPending || unsaveEvent.isPending}
      onClick={() => {
        if (!token) {
          navigateToLogin(navigate)
          return
        }
        if (isSaved) {
          unsaveEvent.mutate(eventId)
        } else {
          saveEvent.mutate(eventId)
        }
      }}
    >
      <Heart className="h-4 w-4" />
      {compact ? null : isSaved ? 'Saved' : 'Save event'}
    </Button>
  )
}
