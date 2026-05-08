import { BellRing } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../Ui'
import { useCreateEventReminder } from '../../hooks/queries'

export function EventReminderButton({ eventId, startsAt, disabled }: { eventId: number; startsAt?: string | null; disabled?: boolean }) {
  const createReminder = useCreateEventReminder()
  const [done, setDone] = useState(false)

  return (
    <Button
      variant="secondary"
      disabled={disabled || createReminder.isPending || done || !startsAt}
      onClick={async () => {
        if (!startsAt) return
        const remindAt = new Date(new Date(startsAt).getTime() - 6 * 60 * 60 * 1000).toISOString()
        await createReminder.mutateAsync({ eventId, remind_at: remindAt, channel: 'in_app' })
        setDone(true)
      }}
    >
      <BellRing className="h-4 w-4" />
      {done ? 'Reminder set' : 'Remind me'}
    </Button>
  )
}
