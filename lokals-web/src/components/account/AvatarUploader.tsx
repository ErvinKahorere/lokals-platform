import type { ChangeEvent } from 'react'
import { Camera } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { resolveMediaUrl } from '../../lib/display'

export function AvatarUploader({
  name,
  src,
  preview,
  isUploading,
  onChange,
}: {
  name: string
  src?: string | null
  preview?: string | null
  isUploading?: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar
          name={name}
          src={(preview || resolveMediaUrl(src ?? null)) ?? undefined}
          className="h-28 w-28 border-4 border-white shadow-[0_18px_40px_rgba(63,43,203,0.16)]"
        />
        <label className="absolute -bottom-1 -right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-lokals-purple text-white shadow-card">
          <Camera className="h-4 w-4" />
          <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-lokals-charcoal">{isUploading ? 'Uploading photo...' : 'Change profile photo'}</p>
        <p className="mt-1 text-xs text-lokals-muted">Upload a clear photo or keep your initials avatar.</p>
      </div>
    </div>
  )
}
