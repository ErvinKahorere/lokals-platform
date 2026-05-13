import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateConversation } from '../../hooks/queries'
import { navigateToLogin } from '../../lib/authNavigation'
import { useAuthStore } from '../../store/auth'
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
  conversationUserId,
  conversationSubject,
  conversationContext,
}: {
  name: string
  phone?: string | null
  whatsapp?: string | null
  whatsappMessage?: string
  className?: string
  conversationUserId?: number | null
  conversationSubject?: string
  conversationContext?: string
}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const createConversation = useCreateConversation()

  const handleMessage = async () => {
    if (!conversationUserId) {
      setOpen(true)
      return
    }
    if (!token) {
      navigateToLogin(navigate)
      return
    }

    try {
      const response = await createConversation.mutateAsync({
        participant_ids: [conversationUserId],
        context: conversationContext ?? 'general',
        subject: conversationSubject ?? name,
      })
      navigate(`/conversations/${response.data.id}`)
    } catch {
      setOpen(true)
    }
  }

  return (
    <>
      <div className={className ?? 'flex flex-wrap gap-2'}>
        <Button variant="secondary" onClick={() => void handleMessage()} disabled={createConversation.isPending}>
          <MessageSquare className="h-4 w-4" />
          {createConversation.isPending ? 'Opening...' : 'Message'}
        </Button>
        <QuickCallButton phone={phone} />
        <WhatsAppPlaceholderButton onClick={() => setOpen(true)} phone={whatsapp ?? phone} name={name} message={whatsappMessage} />
      </div>
      <MessagePlaceholderModal open={open} title={`Contact ${name}`} phone={phone} onClose={() => setOpen(false)} />
    </>
  )
}
