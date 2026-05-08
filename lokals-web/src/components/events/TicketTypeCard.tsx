import { Button, StatusBadge } from '../Ui'
import type { EventTicketType } from '../../types'
import { getDisplayPrice } from '../../lib/display'

export function TicketTypeCard({
  ticketType,
  selected,
  onSelect,
}: {
  ticketType: EventTicketType
  selected?: boolean
  onSelect?: () => void
}) {
  const remaining = ticketType.quantity_available == null
    ? null
    : Math.max(0, (ticketType.quantity_available ?? 0) - (ticketType.quantity_sold ?? 0))

  return (
    <div className={`rounded-[20px] border p-4 transition ${selected ? 'border-lokals-green bg-lokals-green-soft/40' : 'border-lokals-border bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-lokals-charcoal">{ticketType.name}</p>
          <p className="mt-1 text-sm text-lokals-muted">{ticketType.description ?? 'Event ticket option'}</p>
        </div>
        <StatusBadge tone={remaining === 0 ? 'warning' : 'accent'} value={remaining == null ? 'Open' : `${remaining} left`} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-lg font-bold text-lokals-charcoal">{ticketType.price == null || Number(ticketType.price) === 0 ? 'Free' : getDisplayPrice(ticketType.price)}</p>
        {onSelect ? <Button variant={selected ? 'primary' : 'secondary'} onClick={onSelect}>{selected ? 'Selected' : 'Choose'}</Button> : null}
      </div>
    </div>
  )
}
