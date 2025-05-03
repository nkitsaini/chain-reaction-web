<script lang="ts">
	import Game from "./Game.svelte";
	interface GameOptions {
		rows: number;
		cols: number;
		players: number;
	}
	let playing = $state(false);

	let form = $state({ rows: "10", cols: "5", players: "2" });
	function parse_form() {
		if (
			Number(form.rows) >= 2 &&
			Number(form.rows) <= 25 &&
			Number(form.cols) >= 2 &&
			Number(form.cols) <= 25 &&
			Number(form.players) >= 2 &&
			Number(form.players) <= 6
		) {
			return {
				rows: Number(form.rows),
				cols: Number(form.cols),
				players: Number(form.players),
			};
		}
		return null;
	}
	let parsed_form = $derived(parse_form());
	function play() {
		if (parsed_form) {
			playing = true;
		}
	}

	let board;
</script>

{#if playing}
	<Game
		players={parsed_form.players}
		rows={parsed_form.rows}
		cols={parsed_form.cols}
	/>
	<div class="w-screen flex justify-center">
		<button
			onclick={() => {
				playing = false;
			}}
			class="m-auto btn btn-secondary btn-outline w-max"
		>
			Reset</button
		>
	</div>
{:else}
	<div class="p-5 w-screen flex flex-col gap-5 items-center">
		<h1 class="text-4xl text-green-800">Chain Reaction</h1>
		<label>
			<span class="label">Players</span>
			<br />
			<input
				type="number"
				min="2"
				max="6"
				bind:value={form.players}
				class="input validator input-lg min-w-[300px]"
			/>
			<div class="validator-hint">
				A valid number in range of 2 and 6 expected
			</div>
		</label>
		<label>
			<span class="label">Rows</span>
			<br />
			<input
				type="number"
				min="2"
				max="25"
				bind:value={form.rows}
				class="input input-lg validator min-w-[300px]"
			/>
			<div class="validator-hint">
				A valid number in range of 2 and 25 expected
			</div>
		</label>
		<label>
			<span class="label">Columns</span>
			<br />
			<input
				type="number"
				min="2"
				max="25"
				bind:value={form.cols}
				class="input input-lg validator min-w-[300px]"
			/>
			<div class="validator-hint">
				A valid number in range of 2 and 25 expected
			</div>
		</label>
		<button
			class="btn btn-outline btn-secondary btn-lg"
			onclick={() => {
				play();
			}}
		>
			Play
		</button>
	</div>
{/if}
