
export interface Ball {
	id: number;
}

export interface Box {
	balls: Ball[];
	player: null | number;
}
export interface Game {
	grid: Box[][];
	curr_player: null | number;
	total_players: number;
	turn: number
}