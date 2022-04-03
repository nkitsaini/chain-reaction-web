<script lang="ts">
	import type * as m from '$lib/models';
	import * as u from '$lib/utils';
	export let box: m.Box;
	import type { crossfade } from 'svelte/transition';
	export let cf: ReturnType<typeof crossfade>;
	let [send, recieve] = cf;
	$: balls_to_show = box.balls.slice(0, 3);
</script>

<div
	class=" inline-block border w-14 h-14 {u.get_player_text_class(
		box.balls.length == 0 ? null : box.player
	)}"
	on:click
>
	<div class="flex justify-center items-center h-full w-full">
		<span>
			{#each balls_to_show as ball (ball.id)}
				<!-- TODO make the transition work -->
				<span out:send={{ key: ball.id }} in:recieve={{ key: ball.id }}> o </span>
			{:else}
				<span>-</span>
			{/each}
		</span>
	</div>
</div>
