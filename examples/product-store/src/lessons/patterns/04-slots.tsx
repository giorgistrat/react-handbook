// Patterns 4: one Label/Input/Text set reused by a checkout field and the
// gift-wrap toggle, wired through slots.
import { createContext, use, useId, useState, type ComponentProps, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { Switch } from './switch'

// #region slots
type Slots = Record<string, Record<string, unknown>>
const SlotContext = createContext<Slots>({})

function useSlotProps<P extends { slot?: string }>(props: P, defaultSlot: string) {
	const slots = use(SlotContext)
	const { slot = defaultSlot, ...own } = props
	return { ...slots[slot], ...own } // what you pass yourself wins
}
// #endregion

// #region parts
type WithSlot<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & { slot?: string }

function Label(props: WithSlot<'label'>) {
	return <label {...useSlotProps(props, 'label')} />
}

function Input(props: WithSlot<'input'>) {
	return <input {...useSlotProps(props, 'input')} />
}

function Text(props: WithSlot<'span'>) {
	return <span {...useSlotProps(props, 'text')} />
}

function SlotSwitch(props: { slot?: string }) {
	const { on = false, ...rest } = useSlotProps(props, 'switch') as { on?: boolean }
	return <Switch on={on} {...rest} />
}
// #endregion

// #region field
function Field({ children }: { children: ReactNode }) {
	const id = useId()
	const descriptionId = `${id}-description`
	const slots = {
		label: { htmlFor: id },
		input: { id, 'aria-describedby': descriptionId },
		description: { id: descriptionId },
	}
	return <SlotContext value={slots}>{children}</SlotContext>
}
// #endregion

// #region toggle
function GiftToggle({ children }: { children: ReactNode }) {
	const [on, setOn] = useState(false)
	const id = useId()
	const slots = {
		label: { htmlFor: id },
		switch: { id, on, onClick: () => setOn(!on) },
		onText: { hidden: !on },
		offText: { hidden: on },
	}
	return <SlotContext value={slots}>{children}</SlotContext>
}
// #endregion

function Checkout() {
	return (
		<>
			{/* #region usage */}
			<Field>
				<Label>Email for the receipt</Label>
				<div className="row">
					<Input type="email" />
				</div>
				<Text slot="description">We only use it for this order.</Text>
			</Field>

			<GiftToggle>
				<Label>Gift wrap</Label>
				<SlotSwitch />
				<Text slot="onText">Wrapped in recycled paper 🎁</Text>
				<Text slot="offText">No gift wrap</Text>
			</GiftToggle>
			{/* #endregion */}
		</>
	)
}

function CheckoutTypo() {
	return (
		// #region typo
		<Field>
			<Label>Email for the receipt</Label>
			<Input type="email" />
			<Text slot="descripton">We only use it for this order.</Text>
		</Field>
		// #endregion
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	createRoot(root).render(scenario === 'typo' ? <CheckoutTypo /> : <Checkout />)
	log(`scenario: ${scenario ?? 'slots'}`)
}
