<script>
	import { onMount } from 'svelte';
	import SnakeGame from './lib/SnakeGame.svelte';
</script>

<svelte:head>
	<title>Snake Game - Svelte Edition</title>
	<meta name="description" content="Classic Snake game built with Svelte" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</svelte:head>

<main>
	<SnakeGame />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		overflow-x: hidden;
	}

	main {
		width: 100%;
		height: 100vh;
		margin: 0;
		padding: 0;
	}
</style>
