import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { MessagePlaceholderModal } from './MessagePlaceholderModal'
import { QuickCallButton } from './QuickCallButton'
import { WhatsAppPlaceholderButton } from './WhatsAppPlaceholderButton'

export function ContactActions({
  name,
  phone,
  whatsapp,
  whatsappMessage,
  className,
}: {
  name: string
  phone?: string | null
  whatsapp?: string | null
  whatsappMessage?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={className ?? 'flex flex-wrap gap-2'}>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>
        <QuickCallButton phone={phone} />
        <WhatsAppPlaceholderButton onClick={() => setOpen(true)} phone={whatsapp ?? phone} name={name} message={whatsappMessage} />
      </div>
      <MessagePlaceholderModal open={open} title={`Contact ${name}`} phone={phone} onClose={() => setOpen(false)} />
    </>
  )
}
