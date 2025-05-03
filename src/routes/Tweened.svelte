<script lang="ts">
    import type { Snippet } from "svelte";
    import { Tween } from "svelte/motion";
    import { cubicIn } from "svelte/easing";

	let {children, class: className = '', style='', dx, dy, duration}: {class?: string, style?: string, children: Snippet, dx: number, dy: number, duration: number} = $props()
	let x = new Tween(0, {duration, easing: cubicIn});
	let y = new Tween(0, {duration, easing: cubicIn});
	x.target = dx
	y.target = dy

</script>

<div class="inline-block {className}" style="translate: {x.current}px {y.current}px; {style}" >
	<!-- translate: {x.current}px {y.current}px; {style} -->
	{@render children()}

</div>
