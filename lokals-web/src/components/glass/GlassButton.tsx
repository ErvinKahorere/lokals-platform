import type { ComponentProps } from 'react'
import { Button } from '../ui/Button'

export function GlassButton(props: ComponentProps<typeof Button>) {
  return <Button {...props} className={`border border-lokals-border bg-white ${props.className ?? ''}`.trim()} />
}
