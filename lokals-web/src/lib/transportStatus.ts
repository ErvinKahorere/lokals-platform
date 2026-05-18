export type TransportTone = 'accent' | 'success' | 'danger' | 'neutral'

export type TransportTimelineItem = {
  key: string
  label: string
  timestamp?: string | null
}

export function formatTransportStatus(
  status?: string | null,
  statusLabel?: string | null,
): string {
  if (statusLabel && statusLabel.trim()) {
    return statusLabel
  }

  const raw = String(status ?? 'requested')
  if (raw === 'accepted') return 'Assigned'
  if (raw === 'driver_assigned') return 'Driver assigned'
  if (raw === 'courier_assigned') return 'Courier assigned'
  if (raw === 'searching') return 'Searching'
  return raw.replaceAll('_', ' ')
}

export function transportStatusTone(status?: string | null): TransportTone {
  switch (status) {
    case 'completed':
    case 'delivered':
    case 'resolved':
      return 'success'
    case 'cancelled':
    case 'rejected':
    case 'closed':
      return 'danger'
    case 'searching':
    case 'requested':
    case 'accepted':
    case 'driver_assigned':
    case 'courier_assigned':
    case 'arrived':
    case 'in_progress':
    case 'pickup_confirmed':
    case 'in_transit':
      return 'accent'
    default:
      return 'neutral'
  }
}

export function formatTransportTimestamp(value?: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString()
}

export function normalizeTransportTimeline(
  items: TransportTimelineItem[] | undefined,
  fallback: TransportTimelineItem[],
): TransportTimelineItem[] {
  const source = Array.isArray(items) && items.length ? items : fallback
  return source.filter((item) => Boolean(item.timestamp))
}
