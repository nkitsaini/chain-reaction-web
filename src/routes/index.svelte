<script lang="ts">
	import Konva from 'konva';
	import { onMount } from 'svelte';
	import { draw } from 'svelte/transition';
	import type * as m from '$lib/models';
	import * as u from '$lib/utils';
	import * as g from '$lib/game_utils';
	import Box from '$lib/Box.svelte';
	const GRID_COLOR = '#d1d5db';

	class Id {
		static box(row, col): string {
			return `Box_${row}_${col}`;
		}
		static text(row, col): string {
			return `Text_${row}_${col}`;
		}
		static group(row, col): string {
			return `Group_${row}_${col}`;
		}
	}

	type Context = CanvasRenderingContext2D;
	type Point = [number, number];

	const canvas_width = 700;
	const canvas_height = 700;
	const rows = 10;
	const cols = 10;

	function new_game(): g.Game {
		return new g.Game({ rows, cols });
	}
	let game = new_game();

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
	let stage: Konva.Stage;
	let layer: Konva.Layer;
	let blasting = false;

	function get_box_center(row: number, col: number): Point {
		let [start, end] = get_box(row, col);
		return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
	}
	async function handle_click(row: number, col: number) {
		if (blasting) {
			return;
		}
		let group = stage.findOne<Konva.Group>('#' + Id.group(row, col));
		let text = stage.findOne<Konva.Text>('#' + Id.text(row, col));
		let new_ball = game.tap(row, col);
		function update_cell(i, j) {
			let elm = stage.findOne<Konva.Text>('#' + Id.text(i, j));
			elm.text(`o`.repeat(game.grid[i][j].balls.length));
			elm.fill(u.player_colors[game.grid[i][j].player]);
		}
		if (new_ball == null) {
			return;
		}
		blasting = true;
		update_cell(row, col);
		let finished = false;
		while (!finished) {
			let res = game.blast_one();
			finished = res.is_finished;
			let tweens: Konva.Tween[] = [];
			for (const move of res.moves) {
				let [pi, pj] = move.prev_pos;
				let [ni, nj] = move.next_pos;
				update_cell(pi, pj);

				let [ci, cj] = get_box_center(pi, pj);
				let [ti, tj] = get_box_center(ni, nj);
				let dummy_ball = new Konva.Circle({ x: ci, y: cj, radius: 3, fill: 'black' });
				layer.add(dummy_ball);
				tweens.push(
					new Konva.Tween({
						node: dummy_ball,
						x: ti,
						y: tj,
						opacity: 0
					})
				);
			}
			for (const t of tweens) {
				t.play();
			}
			await new Promise((r) => setTimeout(r, 200));
			for (const t of tweens) {
				t.node.destroy();
				t.destroy();
			}
			for (const move of res.moves) {
				let [ni, nj] = move.next_pos;
				update_cell(ni, nj);
			}
		}
		if (game.has_won()) {
			alert(`Winner: ${game.curr_player + 1}:${u.player_colors[game.curr_player]}`);
			stage.destroy();
			initialize();
			game = new_game();
		} else {
			game.next_player();
		}
		blasting = false;
	}

	function initialize() {
		stage = new Konva.Stage({
			container: container,
			width: canvas_width,
			height: canvas_height
		});
		layer = new Konva.Layer();
		for (const i of Array(rows).keys()) {
			for (const j of Array(cols).keys()) {
				let [start, end] = get_box(i, j);
				let group = new Konva.Group({
					id: Id.group(i, j),
					x: start[0],
					y: start[1]
				});
				let box = new Konva.Rect({
					id: Id.box(i, j),
					width: end[0] - start[0],
					height: end[1] - start[1],
					stroke: GRID_COLOR
				});

				let text = new Konva.Text({
					id: Id.text(i, j),
					text: ' ',
					align: 'center',
					verticalAlign: 'middle',
					height: canvas_height / rows,
					width: canvas_width / cols,
					fontSize: 16
				});

				group.add(text);
				group.add(box);
				box.on('click', (x) => handle_click(i, j));
				layer.add(group);
			}
		}
		stage.add(layer);
	}

	let container;
	onMount(async () => {
		initialize();
	});
</script>

<div bind:this={container} />
