<script lang="ts">
	import * as R from "remeda";
	import { GameBoard, type BlastResult } from "./board.svelte";
	import { Tween } from "svelte/motion";
	import Tweened from "./Tweened.svelte";
	import { COLORS } from "./colors";
	let {
		rows,
		cols,
		players,
	}: {
		rows: number;
		cols: number;
		players: number;
	} = $props();

	let game = $state(new GameBoard(rows, cols, players));
	let active_blast: BlastResult | null = $state(null);
	let cell_height = $state(0);
	let cell_width = $state(0);
	let animation_duration = 300;

	function calculate_visible_board() {
		if (R.isNullish(active_blast)) {
			return game.board;
		}
		let result = R.clone(game.board);
		for (const { from } of active_blast.moves) {
			result[from.row_idx][from.col_idx].count = 0;
		}
		return result;
	}

	let visible_board = $derived.by(calculate_visible_board);
	function calculate_animations() {
		if (R.isNullish(active_blast)) {
			return [];
		}
		let balls = [];
		for (const move of active_blast.moves) {
			let from = get_cell_center(move.from.row_idx, move.from.col_idx);
			let to = get_cell_center(move.to.row_idx, move.to.col_idx);
			balls.push({
				left: from.left,
				top: from.top,
				dx: to.left - from.left,
				dy: to.top - from.top,
				target_left: to.left,
				target_top: to.top,
				player: move.player,
				key: `${from.top} ${from.left} ${to.left} ${to.top}`,
			});
		}
		return balls;
	}
	let visible_animations = $derived.by(calculate_animations);

	async function handle_tap(row_idx: number, col_idx: number) {
		if (R.isNonNullish(active_blast)) {
			return;
		}

		let result = game.tap({ row_idx, col_idx });
		if (!result.valid) {
			// TODO: show vibration
			return;
		}
		active_blast = game.calculate_blast();
		let i = 0;
		while (R.isNonNullish(active_blast)) {
			i += 1;
			// wait for animation
			await new Promise((r) => setTimeout(r, animation_duration));
			game.apply_blast(active_blast);
			active_blast = game.calculate_blast();
		}
		let winner = game.winner()
		console.log("========== winner", winner)
		if (winner !== null) {
			alert(`Player ${winner+1} won.`)
			game = new GameBoard(rows, cols, players);
		}
	}

	function get_cell_center(
		row_idx: number,
		col_idx: number,
	): { top: number; left: number } {
		let top = cell_height * row_idx + cell_height / 2;
		let left = cell_width * col_idx + cell_width / 2;
		return { top, left };
	}
</script>

<div class=" flex flex-col justify-start items-start  gap-2 p-2 h-[100dvh] w-[100dvw]">
	<div class="flex justify-center gap-2 w-max m-auto">
		{#each R.range(0, players) as p}
			<div class="h-6 w-6 rounded-full border" style="border-color: {COLORS[p]}; background-color: color-mix(in oklch, {COLORS[p]}, transparent {p===game.current_player?'0%':'80%'});"></div>
		{/each}
	</div>
	<div class="grow m-auto   max-w-full">
	<div class="grid select-none relative   w-full "
		style = "
		grid-template-columns: repeat({cols}, 1fr);
		grid-template-rows: repeat({rows}, 1fr);
		height: 100%;
		width: 100%;
		max-height: 100%;
		max-width: 100%;
		aspect-ratio: {cols} /{rows};
		justify-content: center;
		">
		{#each visible_animations as anim (anim.key)}
			<Tweened
				dx={anim.dx}
				dy={anim.dy}
				duration={animation_duration}
				class="absolute"
				style="top: {anim.top}px; left: {anim.left}px;"
			>
				<!-- {JSON.stringify(anim)} -->
				<div
					class="w-4 h-4 rounded-full"
					style="translate: -50% -50%; background-color: {COLORS[anim.player]}; opacity: 0.5;"
				></div>
			</Tweened>
		{/each}
		{#each visible_board as row, i}
			<!-- <div class="flex grow border border-green-500 w-max  min-w-[max-content]"> -->
				{#each row as cell, j}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					{@const is_current_player=cell.player===game.current_player}
					{@const is_empty=cell.count===0}
					{@const color=R.isNullish(cell.player)?COLORS[game.current_player]:COLORS[cell.player]}
					{@const transparency=is_empty?'80%':(is_current_player?'80%':'90%')}
					<div
						class="border flex flex-wrap gap-1 justify-center items-center  p-2"
						bind:offsetWidth={cell_width}
						bind:offsetHeight={cell_height}
						onclick={() => {
							handle_tap(i, j);
						}}
						style="
						height: calc(100%);
						width: calc(100%);
						border-radius: 1px;
						background-color: color-mix(in oklch, {color}, transparent {transparency});"
					>
						{#each R.range(0, cell.count) as _}
							<div
								class="w-4 h-4  rounded-full border bg-[{COLORS[
									cell.player!
								]}]"
								style="background-color: {COLORS[cell.player!]};"
							></div>
						{/each}
					</div>
				{/each}
			<!-- </div> -->
		{/each}
	</div>
	</div>
</div>
<style lang="postcss">
	@references 'tailwindcss';
</style>
