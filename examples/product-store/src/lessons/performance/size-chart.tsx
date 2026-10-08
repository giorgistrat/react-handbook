// A "heavy" feature module: the size chart. In a real store this would pull in
// a charting library; here the recorder delays its download to make loading visible.
import { log } from '../../log'

log('size-chart.tsx evaluated')

const sizes = [
	['S', '86–91 cm'],
	['M', '96–101 cm'],
	['L', '106–111 cm'],
]

export default function SizeChart() {
	return (
		<table data-chart>
			<tbody>
				{sizes.map(([size, chest]) => (
					<tr key={size}>
						<th>{size}</th>
						<td>{chest}</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
