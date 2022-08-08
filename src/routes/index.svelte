<script lang="ts">
	import Box from '$lib/Box.svelte';
	import type * as m from '$lib/models';
	import * as u from '$lib/utils';
	import { quintOut } from 'svelte/easing';

	const width: number = 10;
	const height: number = 10;

	import { crossfade } from 'svelte/transition';
	let [send, recieve] = crossfade({
		duration: 100
	});
	let _ball_ids: number = 0;
	function new_ball(): m.Ball {
		return { id: _ball_ids++ };
	}
	function new_game(): m.Game {
		return {
			grid: u.create_empty_grid(height, width, () => ({ balls: [], player: null })),
			curr_player: 0,
			total_players: 2,
			turn: 0
		};
	}

	let game: m.Game = new_game();
	$: grid = game.grid;
	let blasting: boolean = false;

	function get_max_allowed_balls(i: number, j: number) {
		let i_at_ends = [0, height - 1].includes(i);
		let j_at_ends = [0, width - 1].includes(j);
		if (i_at_ends && j_at_ends) {
			return 1;
		} else if (i_at_ends || j_at_ends) {
			return 2;
		} else {
			return 3;
		}
	}
	function is_inside_grid(i: number, j: number) {
		return i >= 0 && i <= height - 1 && j >= 0 && j <= width - 1;
	}
	const directions = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	];

	async function blast(delay: number = 200) {
		console.assert(blasting);
		let old_grid = u.create_empty_grid(height, width, () => ({ balls: [], player: null }));
		for (const i of Array(height).keys()) {
			for (const j of Array(width).keys()) {
				old_grid[i][j] = {
					balls: grid[i][j].balls.map((x) => x),
					player: grid[i][j].player
				};
			}
		}

		for (const i of Array(height).keys()) {
			for (const j of Array(width).keys()) {
				if (get_max_allowed_balls(i, j) >= old_grid[i][j].balls.length) {
					continue;
				}
				for (const [di, dj] of directions) {
					let new_i = i + di;
					let new_j = j + dj;
					if (!is_inside_grid(new_i, new_j)) {
						continue;
					}
					if (old_grid[i][j].balls.length == 0) {
						grid[new_i][new_j].balls.push(new_ball());
					} else {
						grid[new_i][new_j].balls.push(grid[i][j].balls.pop());
						while (grid[new_i][new_j].balls.length > get_max_allowed_balls(i + di, j + dj) + 1) {
							grid[new_i][new_j].balls.pop();
						}
					}
					grid[i][j].player = null;
					grid[i + di][j + dj].player = game.curr_player;
				}
			}
		}
		let blast_remaining = false;
		if (!has_won()) {
			grid.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (cell.balls.length > get_max_allowed_balls(i, j)) {
						blast_remaining = true;
					}
				});
			});
		}
		game = game;
		if (blast_remaining) {
			await new Promise((r) => {
				setTimeout(async () => {
					await blast(delay);
					r(null);
				}, delay);
			});
		}
	}
	function has_won(): boolean {
		console.log('Checking won');
		let won = true;
		// console.log('Won', won, game.curr_player, game.turn);
		if (game.turn == 0) {
			console.log('game turn 0');
			return false;
		}
		grid.forEach((row, i) => {
			row.forEach((box, j) => {
				if (box.balls.length != 0 && box.player != game.curr_player) {
					won = false;
				}
			});
		});
		console.log('Won', won, game.curr_player, game.turn);
		return won;
	}

	async function handle_click(i: number, j: number) {
		if (blasting) {
			return;
		}
		let box = grid[i][j];
		if (box.player != null && box.player != game.curr_player) {
			return;
		}

		box.player = game.curr_player;
		box.balls.push(new_ball());

		blasting = true;
		await blast();
		blasting = false;

		let won = has_won();

		if (won) {
			alert(`player ${game.curr_player} won`);
			game = new_game();
			return;
		}

		game.curr_player = game.curr_player + 1;
		if (game.curr_player >= game.total_players) {
			game.curr_player = 0;
			game.turn++;
		}
		game = game;
		// TODO: Execute Blast
	}
	// u.
</script>

<button
	on:click={() => {
		grid.forEach((row, i) => {
			row.forEach((box, j) => {
				let max_balls = get_max_allowed_balls(i, j);
				let player = Math.floor(Math.random() * 2);
				console.log(row, j);
				while (row[j].balls.length < max_balls) {
					row[j].balls.push(new_ball());
				}
				row[j].player = player;
				// row[j] = {
				// 	balls: Array(max_balls).map(() => new_ball()),
				// 	player: player
				// };
			});
		});
		game.turn = 2;
		grid = grid;
	}}>Populate</button
>
<div class="shadow {u.get_player_shadow_class(game.curr_player)} shadow-lg">
	<div class="select-none">
		{#each grid as row, i (i)}
			<div>
				{#each row as box, j (j)}
					<Box {box} cf={[send, recieve]} on:click={() => handle_click(i, j)} />
				{/each}
			</div>
		{/each}
	</div>

	<div class="random hidden" />
</div>

<style>
	/* This is to load tailwind classes which are getting used dynamically */
	.random {
		@apply text-green-500 text-blue-500 text-red-500;
		@apply shadow-green-300 shadow-blue-300 shadow-red-300;
	}
</style>
