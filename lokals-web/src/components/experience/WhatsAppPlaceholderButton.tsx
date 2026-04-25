import { MessageCircle } from 'lucide-react'
import { Button } from '../ui/Button'

export function WhatsAppPlaceholderButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button variant="ghost" className={className} onClick={onClick}>
      <MessageCircle className="h-4 w-4" />
      WhatsApp soon
    </Button>
  )
}

