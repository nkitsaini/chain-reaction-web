export const player_colors: { [key: string]: string } = {
	null: 'white',
	0: 'red',
	1: 'green',
	2: 'blue'
};


export function get_player_text_class(player: null | number): string {
	if (player == null) {
		return 'text-white';
	}
	return 'text-' + player_colors[player] + '-500';
}
export function get_player_shadow_class(player: null | number): string {
	if (player == null) {
		return 'text-black';
	}
	return 'shadow-' + player_colors[player] + '-300';
}

export function create_empty_grid<T>(height: number, width: number, factory: () => T): T[][] {
	return Array(height)
		.fill(undefined)
		.map(() =>
			Array(width)
				.fill(undefined)
				.map(factory)
		);
}