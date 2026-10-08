// A small accessible switch shared by the pattern lessons.
import type { ComponentProps } from 'react'

export function Switch({ on, ...props }: { on: boolean } & Omit<ComponentProps<'button'>, 'role'>) {
	return (
		<button type="button" role="switch" aria-checked={on} className={`switch ${on ? 'switch--on' : ''}`} {...props}>
			{on ? 'On' : 'Off'}
		</button>
	)
}
