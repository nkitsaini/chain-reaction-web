
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
export interface UserOptions {
	rows?: number,
	cols?: number,
	players?: number,
}
export const DEFAULT_USER_OPTIONS: UserOptions = {
	rows: 10,
	cols: 5,
	players: 2,
}