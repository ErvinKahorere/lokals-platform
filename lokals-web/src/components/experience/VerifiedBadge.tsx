import { ShieldCheck } from 'lucide-react'
import { Badge } from '../ui/Badge'

export function VerifiedBadge({ verified = true }: { verified?: boolean }) {
  if (!verified) {
    return <Badge tone="neutral">Profile live</Badge>
  }

  return (
    <Badge tone="success">
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified
    </Badge>
  )
}

