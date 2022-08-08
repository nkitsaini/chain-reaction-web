import type * as m from './models';
import * as utils from './utils';

export interface GameOptions {
	rows?: number,
	cols?: number,
	total_players?: number,
}
const DEFAULT_OPTIONS: GameOptions = {
	rows: 10,
	cols: 10,
	total_players: 2,
}
const directions = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1]
];
export class Game {
	public grid: m.Box[][]
	public curr_player: number
	public total_players: number
	public turns: number
	constructor(options: GameOptions) {
		let curr_options = { ...DEFAULT_OPTIONS, ...options };
		this.grid = utils.create_empty_grid(curr_options.rows, curr_options.cols, () => ({ balls: [], player: null }));
		this.curr_player = 0;
		this.total_players = curr_options.total_players;
		this.turns = 0;
	};
	tap(row: number, col: number): boolean {
		// Returns if the tap was registered.
		// Example: False if tapped in a box of other player.

		let box = this.grid[row][col];
		if (box.player != null && box.player != this.curr_player) {
			return false;
		}

		box.player = this.curr_player;
		box.balls.push({ id: 1 });
		return true;
	}

	next_player() {
		this.curr_player = this.curr_player + 1;
		if (this.curr_player >= this.total_players) {
			this.curr_player = 0;
			this.turns++;
		}
	}

	rows(): number {
		return this.grid.length
	}
	cols(): number {
		return this.grid[0].length
	}
	get_max_allowed_balls(row_idx: number, col_idx: number): number {
		let i_at_ends = [0, this.rows() - 1].includes(row_idx);
		let j_at_ends = [0, this.cols() - 1].includes(col_idx);
		if (i_at_ends && j_at_ends) {
			return 1;
		} else if (i_at_ends || j_at_ends) {
			return 2;
		} else {
			return 3;
		}
	}

	is_inside_grid(i: number, j: number) {
		return i >= 0 && i <= this.rows() - 1 && j >= 0 && j <= this.cols() - 1;
	}

	blast_one(): boolean {
		// returns true if more blasts are left
		const rows = this.cols()
		const cols = this.cols()
		let old_grid = utils.create_empty_grid(rows, cols, () => ({ balls: [], player: null }));
		for (const i of Array(rows).keys()) {
			for (const j of Array(cols).keys()) {
				old_grid[i][j] = {
					balls: this.grid[i][j].balls.map((x) => x),
					player: this.grid[i][j].player
				};
			}
		}

		for (const i of Array(rows).keys()) {
			for (const j of Array(cols).keys()) {
				if (this.get_max_allowed_balls(i, j) >= old_grid[i][j].balls.length) {
					continue;
				}
				for (const [di, dj] of directions) {
					let new_i = i + di;
					let new_j = j + dj;
					if (!this.is_inside_grid(new_i, new_j)) {
						continue;
					}
					if (old_grid[i][j].balls.length == 0) {
						this.grid[new_i][new_j].balls.push({ id: 0 });
					} else {
						this.grid[new_i][new_j].balls.push(this.grid[i][j].balls.pop());
						while (this.grid[new_i][new_j].balls.length > this.get_max_allowed_balls(i + di, j + dj) + 1) {
							this.grid[new_i][new_j].balls.pop();
						}
					}
					this.grid[i][j].player = null;
					this.grid[i + di][j + dj].player = this.curr_player;
				}
			}
		}
		let blast_remaining = false;
		if (!this.has_won()) {
			this.grid.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (cell.balls.length > this.get_max_allowed_balls(i, j)) {
						blast_remaining = true;
					}
				});
			});
		}
		return blast_remaining;
	}
	has_won(): boolean {
		// console.log('Checking won');
		let won = true;
		// console.log('Won', won, game.curr_player, game.turn);
		if (this.turns == 0) {
			// console.log('game turn 0');
			return false;
		}
		this.grid.forEach((row, i) => {
			row.forEach((box, j) => {
				if (box.balls.length != 0 && box.player != this.curr_player) {
					won = false;
				}
			});
		});
		// console.log('Won', won, this.curr_player, this.turns);
		return won;
	}
}
