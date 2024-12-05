<script lang="ts">
	import '../app.css';
	import { ModeWatcher, mode } from "mode-watcher";
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<Toaster theme={$mode} richColors />
<ModeWatcher />
{@render children()}
