import * as R from "remeda";

type Board = Cell[][];

export interface BlastMovement {
	from: Position;
	to: Position;
	player: number;
}

export interface BlastResult {
	moves: BlastMovement[];
	old_state: Board;
	new_state: Board;
}

export interface Position {
	row_idx: number;
	col_idx: number;
}

export interface Cell {
	player: number | null;
	count: number;
}

export class GameBoard {
	board: Board = $state()!;
	current_player: number = $state(0);
	turn = $state(0);
	players: number;
	rows: number;
	cols: number;

	constructor(rows: number, cols: number, players: number) {
		console.assert(players > 1);
		console.assert(rows * cols >= players);
		this.players = players;
		this.rows = rows;
		this.cols = cols;
		this.board = R.range(0, rows).map((_) =>
			R.range(0, cols).map((_) => ({
				player: null,
				count: 0,
			})),
		);
	}

	tap(position: Position): { valid: boolean; blast_pending: boolean } {
		const cell = this.get_cell(position);
		if (cell.count > 0 && cell.player != this.current_player) {
			return { valid: false, blast_pending: false };
		}
		cell.count += 1;
		cell.player = this.current_player;
		this.next_player();

		return { valid: true, blast_pending: this.is_over_capacity(position) };
	}

	next_player() {
		this.current_player += 1;
		if (this.current_player >= this.players) {
			this.turn += 1;
			this.current_player = 0;
		}
	}

	// Does not update the board only returns the 'new_state'
	// which should be applied using `apply_blast` for changes to reflect
	calculate_blast(): BlastResult | null {
		let overcapcity_cells = this.get_overcapacity_cells();
		if (overcapcity_cells.length === 0) {
			return null;
		}
		let old_state = R.clone(this.board);
		let new_state = R.clone(this.board);
		let moves: BlastMovement[] = [];
		for (const position of overcapcity_cells) {
			let neighbours = this.neighbours(position);
			let player = old_state[position.row_idx][position.col_idx].player;
			new_state[position.row_idx][position.col_idx].count = 0;
			new_state[position.row_idx][position.col_idx].player = null;
			for (const neighbour of neighbours) {
				moves.push({ from: position, to: neighbour, player: player! });
				new_state[neighbour.row_idx][neighbour.col_idx].count += 1;
				new_state[neighbour.row_idx][neighbour.col_idx].player = player;
			}
		}

		return {
			new_state,
			old_state,
			moves,
		};
	}

	apply_blast(blast: BlastResult) {
		this.board = blast.new_state;
	}
	winner(): number | null {
		if (this.turn === 0) {
			return null;
		}
		let winner: number | null = null;
		for (const row_idx of R.range(0, this.rows)) {
			for (const col_idx of R.range(0, this.cols)) {
				let cell = this.get_cell({ row_idx, col_idx });
				if (cell.count === 0) {
					continue;
				}
				if (winner === null) {
					winner = cell.player;
					continue;
				}
				if (winner != cell.player) {
					return null;
				}
			}
		}
		return winner;
	}

	get_overcapacity_cells(): Position[] {
		let result: Position[] = [];
		for (const row_idx of R.range(0, this.rows)) {
			for (const col_idx of R.range(0, this.cols)) {
				let position = { row_idx, col_idx };
				let capacity = this.cell_capacity(position);
				let cell = this.get_cell(position);
				if (cell.count > capacity) {
					result.push(position);
				}
			}
		}
		return result;
	}

	is_over_capacity(position: Position) {
		let cell = this.get_cell(position);
		let capacity = this.cell_capacity(position);
		return cell.count > capacity;
	}

	cell_capacity(position: Position): number {
		let horizontal_edge =
			position.col_idx == 0 || position.col_idx == this.cols - 1;
		let vertical_edge =
			position.row_idx == 0 || position.row_idx == this.rows - 1;
		if (horizontal_edge && vertical_edge) {
			return 1;
		} else if (horizontal_edge || vertical_edge) {
			return 2;
		} else {
			return 3;
		}
	}

	neighbours(position: Position): Position[] {
		let result: Position[] = [];
		for (const [drow, dcol] of [
			[0, 1],
			[0, -1],
			[1, 0],
			[-1, 0],
		]) {
			let new_row_idx = position.row_idx + drow;
			let new_col_idx = position.col_idx + dcol;
			if (
				new_row_idx >= 0 &&
				new_row_idx < this.rows &&
				new_col_idx >= 0 &&
				new_col_idx < this.cols
			) {
				result.push({
					row_idx: new_row_idx,
					col_idx: new_col_idx,
				});
			}
		}
		return result;
	}

	get_cell(position: Position) {
		return this.board[position.row_idx][position.col_idx];
	}
}
