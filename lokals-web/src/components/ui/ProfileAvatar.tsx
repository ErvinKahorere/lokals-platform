import { Avatar } from './Avatar'
import { resolveMediaUrl } from '../../lib/display'

export function ProfileAvatar({ name, avatar, size = 'md' }: { name?: string | null; avatar?: string | null; size?: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'
  return <Avatar name={name ?? 'LOKALS User'} src={resolveMediaUrl(avatar ?? null) ?? undefined} className={`${dimension} border border-lokals-border`} />
}
