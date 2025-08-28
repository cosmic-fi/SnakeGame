<script>
// @ts-nocheck

	import SnakeGame from './lib/components/SnakeGame.svelte';
	import BuffRenderer from './lib/components/BuffRenderer.svelte';
	import ZoomIndicator from './lib/components/ZoomIndicator.svelte';
	import { zoomAdapter, onZoomChange } from './lib/utils/ZoomAdapter.js';
	import { onMount } from 'svelte';
	import { initializeTheme, initializeCanvasTheme } from './lib/config/themes.js';
	import { StorageService } from './lib/services/StorageService.js';
	
	let showBuffRenderer = false;
	let currentZoom = 100;
	let showZoomIndicator = true; // Set to true to show zoom indicator for testing
	
	// Toggle buff renderer with Ctrl+Shift+B
	function handleKeydown(event) {
		if (event.ctrlKey && event.shiftKey && event.key === 'B') {
			showBuffRenderer = !showBuffRenderer;
			event.preventDefault();
		}
	}
	
	// Initialize zoom adapter
  onMount(() => {
    // Initialize theme systems
    const settings = StorageService.loadSettings();
    initializeTheme(settings.theme || 'light');
    initializeCanvasTheme();
		
		// Initialize zoom detection
		zoomAdapter.init();
		currentZoom = zoomAdapter.getZoomPercentage();
		
		// Listen for zoom changes
		onZoomChange((newZoom, oldZoom) => {
			currentZoom = Math.round(newZoom * 100);
			console.log(`Zoom changed from ${Math.round(oldZoom * 100)}% to ${currentZoom}%`);
		});
		
		// Cleanup on component destroy
		return () => {
			zoomAdapter.destroy();
		};
	});
</script>

<svelte:head>
	<title>Snake Game</title>
	<link rel="icon" href="./favicon.png"/>
	<meta name="description" content="Classic Snake game built with Svelte" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<main>
	{#if showBuffRenderer}
		<div class="dev-mode">
			<div class="dev-header">
				<h1>🛠️ Development Mode - Buff Renderer</h1>
				<button class="close-dev" on:click={() => showBuffRenderer = false}>✕ Close</button>
			</div>
			<BuffRenderer />
			<div class="dev-instructions">
				<p><strong>Instructions:</strong> Use this tool to render and export all buff types for documentation. Press <kbd>Ctrl+Shift+B</kbd> to toggle this view.</p>
			</div>
		</div>
	{:else}
		<SnakeGame />
	{/if}
	<!-- <ZoomIndicator show={showZoomIndicator} /> -->
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		/* background: 
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
			linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%); */
		min-height: 100vh;
		overflow-x: hidden;
		position: relative;
	}

	:global(body::before) {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: 
			url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
		pointer-events: none;
		background-color: #F7A5A5;
		z-index: -1;
	}

	:global(body::after) {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: 
			radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 20%),
			radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 20%),
			radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 30%);
		pointer-events: none;
		z-index: -1;
		animation: float 20s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		33% { transform: translateY(-10px) rotate(1deg); }
		66% { transform: translateY(5px) rotate(-1deg); }
	}

	main {
		width: 100vw;
		height: 100vh;
		min-height: 100vh;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	main:not(:has(.dev-mode)) {
		align-items: center;
	}

	.dev-mode {
		width: 100%;
		max-width: 1400px;
		background: rgba(0, 0, 0, 0.9);
		border-radius: 15px;
		padding: 0;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		margin: 20px;
		align-self: flex-start;
	}

	.dev-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 30px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		margin: 0;
	}

	.dev-header h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.close-dev {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
		padding: 8px 16px;
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
		transition: all 0.2s;
	}

	.close-dev:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.05);
	}

	.dev-instructions {
		padding: 20px 30px;
		background: rgba(255, 255, 255, 0.05);
		color: #ccc;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.dev-instructions kbd {
		background: #333;
		color: #fff;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		border: 1px solid #555;
	}
</style>
