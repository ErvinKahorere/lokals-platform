import { Phone } from 'lucide-react'
import { Button } from '../ui/Button'

export function QuickCallButton({ phone, className }: { phone?: string | null; className?: string }) {
  if (!phone) {
    return (
        <Button variant="secondary" className={className} disabled>
          <Phone className="h-4 w-4" />
          Call
        </Button>
      )
  }

  return (
    <a href={`tel:${phone}`} className={className}>
      <Button variant="secondary" className="w-full">
        <Phone className="h-4 w-4" />
        Call
      </Button>
    </a>
  )
}
