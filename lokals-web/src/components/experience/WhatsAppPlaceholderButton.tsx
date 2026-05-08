import { MessageCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { getWhatsAppHref } from '../../lib/display'

export function WhatsAppPlaceholderButton({
  onClick,
  phone,
  name,
  message,
  className,
}: {
  onClick: () => void
  phone?: string | null
  name?: string
  message?: string
  className?: string
}) {
  const href = getWhatsAppHref(phone, name, message)

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        <Button variant="secondary" className="w-full">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      </a>
    )
  }

  return (
    <Button variant="ghost" className={className} onClick={onClick}>
      <MessageCircle className="h-4 w-4" />
      WhatsApp
    </Button>
  )
}
