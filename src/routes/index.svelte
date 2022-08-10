<script lang="ts">
	import { browser } from '$app/env';
	import Box from '$lib/Box.svelte';
	import * as u from '$lib/utils';

	import Game from '$lib/Game.svelte';
	let playing = false;
	let options = {
		players: 2,
		rows: 10,
		cols: 5
	};
	let max_players = Object.keys(u.player_colors).length - 1;
	function changed() {
		options = options;
	}
	function _options_valid(options) {
		return (
			2 <= options.players &&
			options.players <= max_players &&
			options.rows >= 5 &&
			options.cols >= 5
		);
	}
	$: height = browser ? window.innerHeight - 15 : 50;
	$: width = browser ? window.innerWidth - 15 : 50;
	function box_size() {
		let w = width / options.cols;
		let h = height / options.rows;
		return Math.round(Math.min(w, h));
	}
	function get_height() {
		return box_size() * options.rows;
	}
	function get_width() {
		return box_size() * options.cols;
	}
</script>

{#if playing}
	<div class="flex flex-col justify-center items-center  m-2">
		<Game
			canvas_width={get_width()}
			canvas_height={get_height()}
			players={options.players}
			rows={options.rows}
			cols={options.cols}
		/>
		<button
			on:click={() => {
				window.location.reload();
			}}>Reset</button
		>
	</div>
{:else}
	<form class="max-w-[150px] p-3">
		<label>
			Players(2-7): <input
				class="num_input"
				type="number"
				min="2"
				max={max_players}
				bind:value={options.players}
				on:change={changed}
			/>
		</label>
		<br />
		<label>
			Rows(min 5): <input
				class="num_input"
				type="number"
				min="5"
				bind:value={options.rows}
				on:change={changed}
			/>
		</label>
		<br />
		<label>
			Columns(min 5): <input
				class="num_input"
				type="number"
				min="5"
				bind:value={options.cols}
				on:change={changed}
			/>
		</label>
		<br />
		<input
			type="submit"
			class="bg-blue-500 px-3 py-1 rounded text-gray-100 disabled:bg-gray-500"
			disabled={!_options_valid(options)}
			on:click={() => {
				playing = true;
			}}
		/>
	</form>
{/if}

<style>
	.num_input {
		@apply block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0;
	}
	.num_input:focus {
		@apply text-gray-700 bg-white border-blue-600 outline-none;
	}
</style>
