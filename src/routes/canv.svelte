<script lang="ts">
	import Box from '$lib/Box.svelte';
	import type * as m from '$lib/models';
	import * as u from '$lib/utils';
	import * as g from '$lib/game_utils';
	import { onMount } from 'svelte';
	type Context = CanvasRenderingContext2D;
	type Point = [number, number];

	const canvas_width = 700;
	const canvas_height = 700;
	const rows = 10;
	const cols = 10;
	let blasting: boolean = false;
	let canvas: HTMLCanvasElement;
	let ctx: Context;
	let __s = 50;
	const GRID_COLOR = '#d1d5db';

	function new_game(): g.Game {
		let game = new g.Game({ rows, cols });

		return game;
	}

	let game = new_game();

	function draw_line(x1, y1, x2, y2) {
		ctx.strokeStyle = GRID_COLOR;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	function get_box(row: number, col: number): [Point, Point] {
		let y1 = (canvas_height * row) / rows;
		let x1 = (canvas_width * col) / cols;
		let y2 = (canvas_height * (row + 1)) / rows;
		let x2 = (canvas_width * (col + 1)) / cols;
		return [
			[x1, y1],
			[x2, y2]
		];
	}
	function box_by_cordinates(x, y): [number, number] {
		// Returns (row, col)
		let ans = null;
		game.grid.forEach((row, i) => {
			if (ans == null) {
				row.forEach((cell, j) => {
					if (ans == null) {
						let [start, end] = get_box(i, j);
						if (start[0] <= x && x <= end[0] && start[1] <= y && y <= end[1]) {
							ans = [i, j];
							return;
						}
					}
				});
			}
		});
		if (ans == null) {
			throw new Error(`No Box matched, ${x},  ${y}`);
		}
		return ans;
	}
	function draw_game() {
		draw_grid();
		game.grid.forEach((row, i) => {
			row.forEach((cell, j) => {
				let [start, end] = get_box(i, j);
				let center = [Math.round((start[0] + end[0]) / 2), Math.round((end[1] + start[1]) / 2)];
				ctx.fillStyle = u.player_colors[cell.player];
				ctx.textAlign = 'center';
				ctx.font = '16px Monospace';
				ctx.fillText(`o`.repeat(cell.balls.length), center[0], center[1]);
			});
		});
	}
	function draw_grid() {
		for (let i of Array(rows - 1).keys()) {
			i += 1;
			let y = (canvas_height * i) / rows;
			draw_line(0, y, canvas_width, y);
		}
		for (let i of Array(cols - 1).keys()) {
			i += 1;
			let x = (canvas_width * i) / rows;
			draw_line(x, 0, x, canvas_width);
		}
	}
	function draw() {
		ctx.clearRect(0, 0, canvas_height, canvas_width);
		// draw_grid();
		draw_game();
	}
	async function handle_click(event: MouseEvent) {
		if (blasting) {
			return;
		}
		let x = event.clientX - canvas.getBoundingClientRect().left;
		let y = event.clientY - canvas.getBoundingClientRect().top;
		let [row_n, col_n] = box_by_cordinates(x, y);

		if (game.tap(row_n, col_n) == null) {
			return;
		}
		blasting = true;
		while (!game.blast_one().is_finished) {
			draw();
			await new Promise((r) => setTimeout(r, 300));
		}
		draw();
		if (game.has_won()) {
			alert(`Winner: ${game.curr_player + 1}`);
			game = new_game();
		} else {
			game.next_player();
		}
		blasting = false;
		console.log(game.curr_player, game.total_players);
	}
	onMount(() => {
		ctx = canvas.getContext('2d');
		setInterval(draw, 10);
	});
</script>

<canvas
	bind:this={canvas}
	on:click={handle_click}
	class="border border-[{GRID_COLOR}]"
	width={canvas_width}
	height={canvas_height}
/>
