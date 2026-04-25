import type { ComponentProps } from 'react'
import { Button } from '../ui/Button'

export function GlassButton(props: ComponentProps<typeof Button>) {
  return <Button {...props} className={`glass-surface border border-white/20 ${props.className ?? ''}`.trim()} />
}
