import { Heart } from 'lucide-react'
import { Button } from '../Ui'
import { useSaveEvent, useUnsaveEvent } from '../../hooks/queries'

export function SaveEventButton({ eventId, isSaved, disabled, compact = false }: { eventId: number; isSaved?: boolean; disabled?: boolean; compact?: boolean }) {
  const saveEvent = useSaveEvent()
  const unsaveEvent = useUnsaveEvent()

  return (
    <Button
      variant={isSaved ? 'primary' : 'secondary'}
      disabled={disabled || saveEvent.isPending || unsaveEvent.isPending}
      onClick={() => (isSaved ? unsaveEvent.mutate(eventId) : saveEvent.mutate(eventId))}
    >
      <Heart className="h-4 w-4" />
      {compact ? null : isSaved ? 'Saved' : 'Save event'}
    </Button>
  )
}
