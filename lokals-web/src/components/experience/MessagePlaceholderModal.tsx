import { MessageCircleMore, Phone } from 'lucide-react'
import { Button } from '../ui/Button'

export function MessagePlaceholderModal({
  open,
  title,
  phone,
  onClose,
}: {
  open: boolean
  title: string
  phone?: string | null
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-[28px] border border-lokals-border bg-white p-6 shadow-soft-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-green-soft text-lokals-green">
          <MessageCircleMore className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-lokals-charcoal">{title}</h3>
        <p className="mt-2 text-sm text-lokals-muted">Messaging is coming soon. You can call for now.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {phone ? (
            <a href={`tel:${phone}`} className="flex-1">
              <Button className="w-full">
                <Phone className="h-4 w-4" />
                Call instead
              </Button>
            </a>
          ) : null}
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
