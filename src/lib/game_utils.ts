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
type Direction = 'up' | 'down' | 'right' | 'left';
const DIRECTIONS: Direction[] = ['up', 'down', 'right', 'left'];

function direction_deltas(direction: Direction) {
	const directions = {
		up: [-1, 0],
		down: [1, 0],
		left: [0, -1],
		right: [0, 1]
	};
	return directions[direction];
}

export interface BallMovement {
	ball: m.Ball,
	prev_pos: [number, number],
	next_pos: [number, number],
	direction: Direction
}
export interface BlastResult {
	is_finished: boolean,
	moves: BallMovement[]
}
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

	tap(row: number, col: number): null | m.Ball {
		// Returns if the tap was registered.
		// Example: False if tapped in a box of other player.

		let box = this.grid[row][col];
		if (box.player != null && box.player != this.curr_player) {
			return null;
		}

		box.player = this.curr_player;
		let ball = { id: 1 }
		box.balls.push(ball);
		return ball;
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

	blast_one(): BlastResult {
		// returns true if more blasts are left
		const rows = this.rows()
		const cols = this.cols()
		let moves: BallMovement[] = []
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
				for (const name of DIRECTIONS) {
					let [di, dj] = direction_deltas(name);
					let new_i = i + di;
					let new_j = j + dj;
					if (!this.is_inside_grid(new_i, new_j)) {
						continue;
					}
					let popped_ball = this.grid[i][j].balls.pop();
					this.grid[new_i][new_j].balls.push(popped_ball);
					moves.push({ ball: popped_ball, direction: name, prev_pos: [i, j], next_pos: [new_i, new_j] })
					this.grid[i][j].player = this.grid[i][j].balls.length == 0 ? null : this.curr_player;
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
		return { is_finished: !blast_remaining, moves };
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
