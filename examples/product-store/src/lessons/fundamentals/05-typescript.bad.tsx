// Mistakes TypeScript catches before the code runs (not part of the app build).
import { Price } from './05-typescript'

export const examples = (
	<>
		<Price cents="89.00" />
		<Price cents={8900} currency="JPY" />
		<Price currency="EUR" />
	</>
)
