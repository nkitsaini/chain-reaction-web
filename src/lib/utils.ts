export const player_colors: { [key: string]: string } = {
	null: "white",

	0: "oklch(0.6 0.1303 0)",
	1: "oklch(0.6 0.1303 60)",
	2: "oklch(0.6 0.1303 120)",
	3: "oklch(0.6 0.1303 180)",
	4: "oklch(0.6 0.1303 240)",
	5: "oklch(0.6 0.1303 300)",
	// 2: "#5ce673",
	// 3: "#e6af5c",
	// 4: "#5cd6e6",
	// 5: "#cf5ce6",
	// 6: "#8c5ce6",
};

export function get_player_text_class(player: null | number): string {
	if (player == null) {
		return "text-white";
	}
	return "text-" + player_colors[player] + "-500";
}

export function get_player_shadow_class(player: null | number): string {
	if (player == null) {
		return "text-black";
	}
	return "shadow-" + player_colors[player] + "-300";
}

export function create_empty_grid<T>(
	height: number,
	width: number,
	factory: () => T,
): T[][] {
	return Array(height)
		.fill(undefined)
		.map(() => Array(width).fill(undefined).map(factory));
}
