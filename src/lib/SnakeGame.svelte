<script>
	import { onMount, onDestroy } from 'svelte';
	import { LeaderboardAPI, validatePlayerName } from './supabase.js';
	import { GAME_CONFIG, debugLog } from './config.js';

	// Game state variables
	let canvas;
	let ctx;
	let gameRunning = false;
	let gamePaused = false;
	let gameLoop;
	let gameStartTime = 0;

	// Game configuration
	const gridSize = 20;
	const tileCount = 20;

	// Game objects
	let snake = [{ x: 10, y: 10 }];
	let food = { x: 15, y: 15 };
	let dx = 1;
	let dy = 0;

	// Game statistics
	let score = 0;
	let highScore = 0;
	let gameTime = 0;
	let currentStreak = 0;
	let gamesPlayed = 0;
	let bestStreak = 0;
	let totalTime = 0;
	let totalFood = 0;
	let winRate = 0;
	let snakeLength = 1;
	let recentGames = [];

	// UI state
	let showOverlay = true;
	let overlayTitle = 'Snake Game';
	let overlayMessage = 'Press Space or click Start to begin!';
	let overlayIcon = 'fa-play-circle';
	let showLeaderboard = false;
	let showNameInput = false;
	let playerName = '';
	let globalLeaderboard = [];
	let isLoadingLeaderboard = false;
	let leaderboardError = null;
	let isSubmittingScore = false;
	let gameContainer;
	let isFullscreen = false;

	// Load stats from localStorage and leaderboard from Supabase
	function loadStats() {
		try {
			const savedStats = localStorage.getItem('snakeGameStats');
			if (savedStats) {
				const stats = JSON.parse(savedStats);
				highScore = stats.highScore || 0;
				gamesPlayed = stats.gamesPlayed || 0;
				bestStreak = stats.bestStreak || 0;
				totalTime = stats.totalTime || 0;
				totalFood = stats.totalFood || 0;
				recentGames = stats.recentGames || [];
			}
			// Load leaderboard from Supabase
			loadLeaderboard();
		} catch (e) {
			console.error('Error loading stats:', e);
		}
	}

	// Load leaderboard from Supabase
	async function loadLeaderboard() {
		isLoadingLeaderboard = true;
		leaderboardError = null;
		
		try {
			const result = await LeaderboardAPI.getLeaderboard(GAME_CONFIG.leaderboardLimit);
			if (result.success) {
				globalLeaderboard = result.data.map(entry => ({
					name: entry.player_name,
					score: entry.score,
					date: new Date(entry.created_at).toLocaleDateString(),
					timestamp: new Date(entry.created_at).getTime()
				}));
				debugLog('Leaderboard loaded:', globalLeaderboard);
			} else {
				// Fallback to localStorage if Supabase fails
				const savedLeaderboard = localStorage.getItem('snakeGameLeaderboard');
				if (savedLeaderboard) {
					globalLeaderboard = JSON.parse(savedLeaderboard);
				}
				leaderboardError = result.error || 'Failed to load leaderboard';
				debugLog('Leaderboard load failed, using localStorage fallback');
			}
		} catch (error) {
			console.error('Error loading leaderboard:', error);
			leaderboardError = 'Connection error';
			// Fallback to localStorage
			const savedLeaderboard = localStorage.getItem('snakeGameLeaderboard');
			if (savedLeaderboard) {
				globalLeaderboard = JSON.parse(savedLeaderboard);
			}
		} finally {
			isLoadingLeaderboard = false;
		}
	}

	// Save stats to localStorage (leaderboard is saved to Supabase)
	function saveStats() {
		try {
			const stats = {
				highScore,
				gamesPlayed,
				bestStreak,
				totalTime,
				totalFood,
				recentGames
			};
			localStorage.setItem('snakeGameStats', JSON.stringify(stats));
			// Keep localStorage backup for offline mode
			localStorage.setItem('snakeGameLeaderboard', JSON.stringify(globalLeaderboard));
		} catch (e) {
			console.error('Error saving stats:', e);
		}
	}

	// Initialize canvas and game
	function initGame() {
		if (canvas) {
			ctx = canvas.getContext('2d');
			resizeCanvas();
			canvas.focus();
			draw();
		}
	}

	// Resize canvas to maintain aspect ratio
	function resizeCanvas() {
		if (!canvas) return;
		
		const size = gridSize * tileCount;
		canvas.width = size;
		canvas.height = size;
		
		// Set CSS size to maintain aspect ratio
		if (document.fullscreenElement === gameContainer) {
			// In fullscreen, scale to fit screen while maintaining aspect ratio
			const maxSize = Math.min(window.innerWidth, window.innerHeight) * 0.9;
			canvas.style.width = maxSize + 'px';
			canvas.style.height = maxSize + 'px';
		} else {
			// Normal mode
			canvas.style.width = size + 'px';
			canvas.style.height = size + 'px';
		}
	}

	// Generate food at random position
	function generateFood() {
		let foodPosition;
		let attempts = 0;
		const maxAttempts = 100;

		do {
			foodPosition = {
				x: Math.floor(Math.random() * tileCount),
				y: Math.floor(Math.random() * tileCount)
			};
			attempts++;
		} while (attempts < maxAttempts && 
				 snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));

		food = foodPosition;
	}

	// Start game
	function startGame() {
		if (gameRunning) return;

		// Reset game state
		snake = [{ x: 10, y: 10 }];
		score = 0;
		gameTime = 0;
		currentStreak = 0;
		generateFood();

		gameRunning = true;
		gamePaused = false;
		gameStartTime = Date.now();
		dx = 1;
		dy = 0;
		snakeLength = 1;

		hideGameOverlay();

		gameLoop = setInterval(() => {
			if (!gamePaused) {
				update();
				updateGameTime();
				draw();
			}
		}, 120);
	}

	// Toggle pause
	function togglePause() {
		if (!gameRunning) return;

		gamePaused = !gamePaused;

		if (gamePaused) {
			showGameOverlay('Game Paused', 'Press Space or click Resume to continue', 'fa-pause-circle');
		} else {
			hideGameOverlay();
		}
	}

	// Reset game
	function resetGame() {
		clearInterval(gameLoop);
		gameRunning = false;
		gamePaused = false;
		snake = [{ x: 10, y: 10 }];
		score = 0;
		gameTime = 0;
		currentStreak = 0;
		snakeLength = 1;
		dx = 1;
		dy = 0;
		generateFood();
		showGameOverlay('Snake Game', 'Press Space or click Start to begin!', 'fa-play-circle');
		draw();
	}

	// Update game state
	function update() {
		const head = { x: snake[0].x + dx, y: snake[0].y + dy };

		// Check wall collision
		if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
			gameOver();
			return;
		}

		// Check self collision
		for (let segment of snake) {
			if (head.x === segment.x && head.y === segment.y) {
				gameOver();
				return;
			}
		}

		snake.unshift(head);

		// Check food collision
		if (head.x === food.x && head.y === food.y) {
			score += 10;
			currentStreak++;
			totalFood++;
			snakeLength = snake.length;
			generateFood();
		} else {
			snake.pop();
		}

		snakeLength = snake.length;
	}

	// Draw game
	function draw() {
		if (!ctx) return;

		// Clear canvas with gradient background
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, '#1a1a2e');
		gradient.addColorStop(1, '#16213e');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw grid
		drawGrid();

		// Draw snake
		drawSnake();

		// Draw food
		drawFood();
	}

	// Draw grid
	function drawGrid() {
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
		ctx.lineWidth = 1;

		for (let i = 0; i <= tileCount; i++) {
			ctx.beginPath();
			ctx.moveTo(i * gridSize, 0);
			ctx.lineTo(i * gridSize, canvas.height);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, i * gridSize);
			ctx.lineTo(canvas.width, i * gridSize);
			ctx.stroke();
		}
	}

	// Draw snake
	function drawSnake() {
		snake.forEach((segment, index) => {
			const x = segment.x * gridSize;
			const y = segment.y * gridSize;

			if (index === 0) {
				// Snake head with glow
				ctx.shadowColor = '#27ae60';
				ctx.shadowBlur = 10;
				ctx.fillStyle = '#2ecc71';
				ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);

				// Eyes
				ctx.shadowBlur = 0;
				ctx.fillStyle = '#000';
				ctx.fillRect(x + 6, y + 6, 3, 3);
				ctx.fillRect(x + 11, y + 6, 3, 3);
			} else {
				// Snake body with gradient
				const bodyGradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
				bodyGradient.addColorStop(0, '#27ae60');
				bodyGradient.addColorStop(1, '#2ecc71');
				ctx.fillStyle = bodyGradient;
				ctx.shadowColor = '#27ae60';
				ctx.shadowBlur = 5;
				ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
			}
		});
		ctx.shadowBlur = 0;
	}

	// Draw food
	function drawFood() {
		const x = food.x * gridSize;
		const y = food.y * gridSize;

		// Food with glow effect
		ctx.shadowColor = '#e74c3c';
		ctx.shadowBlur = 15;
		ctx.fillStyle = '#e74c3c';
		ctx.beginPath();
		ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
		ctx.fill();
		ctx.shadowBlur = 0;
	}

	// Update game time
	function updateGameTime() {
		if (gameRunning && !gamePaused) {
			gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
		}
	}

	// Game over
	async function gameOver() {
		clearInterval(gameLoop);
		gameRunning = false;
		gamePaused = false;

		// Update statistics
		gamesPlayed++;
		totalTime += gameTime;
		if (currentStreak > bestStreak) {
			bestStreak = currentStreak;
		}
		if (score > highScore) {
			highScore = score;
		}

		// Add to recent games
		recentGames.unshift({
			score,
			time: gameTime,
			date: new Date().toLocaleDateString()
		});
		if (recentGames.length > 5) {
			recentGames = recentGames.slice(0, 5);
		}

		// Calculate win rate
		winRate = gamesPlayed > 0 ? Math.round((totalFood / gamesPlayed) * 10) : 0;

		// Check if score qualifies for leaderboard
		const qualifiesForLeaderboard = await isLeaderboardScore(score);
		if (qualifiesForLeaderboard) {
			showNameInput = true;
		} else {
			showGameOverlay('Game Over!', `Final Score: ${score}`, 'fa-skull-crossbones');
		}

		saveStats();
	}

	// Show game overlay
	function showGameOverlay(title, message, icon) {
		overlayTitle = title;
		overlayMessage = message;
		overlayIcon = icon;
		showOverlay = true;
	}

	// Hide game overlay
	function hideGameOverlay() {
		showOverlay = false;
	}

	// Check if score qualifies for leaderboard
	async function isLeaderboardScore(score) {
		try {
			const result = await LeaderboardAPI.isLeaderboardScore(score, GAME_CONFIG.leaderboardLimit);
			return result.qualifies;
		} catch (error) {
			console.error('Error checking leaderboard score:', error);
			// Fallback to local check
			if (globalLeaderboard.length < GAME_CONFIG.leaderboardLimit) return true;
			return score > globalLeaderboard[globalLeaderboard.length - 1].score;
		}
	}

	// Add score to leaderboard via Supabase
	async function addToLeaderboard(name, score) {
		isSubmittingScore = true;
		leaderboardError = null;
		
		try {
			const playerName = name.trim() || 'Anonymous';
			const result = await LeaderboardAPI.submitScore(playerName, score);
			
			if (result.success) {
				debugLog('Score submitted successfully:', result);
				// Refresh leaderboard to show updated data
				await loadLeaderboard();
				return { success: true, isNewRecord: result.updated };
			} else {
				// Fallback to localStorage
				globalLeaderboard.push({
					name: playerName,
					score,
					date: new Date().toLocaleDateString(),
					timestamp: Date.now()
				});
				
				// Sort by score (descending) and keep top limit
				globalLeaderboard.sort((a, b) => b.score - a.score);
				globalLeaderboard = globalLeaderboard.slice(0, GAME_CONFIG.leaderboardLimit);
				saveStats();
				
				leaderboardError = result.error || 'Failed to submit score online';
				return { success: false, error: leaderboardError };
			}
		} catch (error) {
			console.error('Error submitting score:', error);
			leaderboardError = 'Connection error';
			
			// Fallback to localStorage
			const playerName = name.trim() || 'Anonymous';
			globalLeaderboard.push({
				name: playerName,
				score,
				date: new Date().toLocaleDateString(),
				timestamp: Date.now()
			});
			
			globalLeaderboard.sort((a, b) => b.score - a.score);
			globalLeaderboard = globalLeaderboard.slice(0, GAME_CONFIG.leaderboardLimit);
			saveStats();
			
			return { success: false, error: leaderboardError };
		} finally {
			isSubmittingScore = false;
		}
	}

	// Handle name submission
	async function submitName() {
		if (playerName.trim().length === 0) {
			playerName = 'Anonymous';
		}
		
		// Validate player name
		const validation = validatePlayerName(playerName);
		if (!validation.valid) {
			leaderboardError = validation.error;
			return;
		}
		
		const result = await addToLeaderboard(playerName, score);
		showNameInput = false;
		playerName = '';
		
		if (result.success) {
			const message = result.isNewRecord ? 'New Personal Best!' : 'Score Submitted!';
			showGameOverlay(message, `Congratulations! Score: ${score}`, 'fa-trophy');
		} else {
			showGameOverlay('Score Saved Locally', `Score: ${score}\n${result.error || 'Online submission failed'}`, 'fa-exclamation-triangle');
		}
	}

	// Cancel name input
	function cancelNameInput() {
		showNameInput = false;
		playerName = '';
		showGameOverlay('Game Over!', `Final Score: ${score}`, 'fa-skull-crossbones');
	}

	// Toggle leaderboard modal
	function toggleLeaderboard() {
		showLeaderboard = !showLeaderboard;
	}

	// Toggle fullscreen for game container only
	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			if (gameContainer && gameContainer.requestFullscreen) {
				gameContainer.requestFullscreen().then(() => {
					setTimeout(resizeCanvas, 100); // Small delay to ensure fullscreen is active
				});
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen().then(() => {
					setTimeout(resizeCanvas, 100); // Small delay to ensure fullscreen is exited
				});
			}
		}
	}

	// Handle keyboard input
	function handleKeyPress(event) {
		// Don't interfere with text input when name input modal is open
		if (showNameInput && event.target.tagName === 'INPUT') {
			return;
		}

		// Prevent default scrolling for game keys (but not when typing in input)
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyF'].includes(event.code) && !showNameInput) {
			event.preventDefault();
		}

		if (event.code === 'Space' && !showNameInput) {
			if (!gameRunning) {
				startGame();
			} else {
				togglePause();
			}
			return;
		}

		if (event.code === 'KeyF' && !showNameInput) {
			toggleFullscreen();
			return;
		}

		// Don't process game controls when name input is open
		if (showNameInput) return;

		if (!gameRunning || gamePaused) return;

		// Movement controls
		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
				if (dy !== 1) { dx = 0; dy = -1; }
				break;
			case 'ArrowDown':
			case 'KeyS':
				if (dy !== -1) { dx = 0; dy = 1; }
				break;
			case 'ArrowLeft':
			case 'KeyA':
				if (dx !== 1) { dx = -1; dy = 0; }
				break;
			case 'ArrowRight':
			case 'KeyD':
				if (dx !== -1) { dx = 1; dy = 0; }
				break;
		}
	}

	// Handle canvas click
	function handleCanvasClick() {
		if (!gameRunning) {
			startGame();
		}
	}

	// Lifecycle
	onMount(() => {
		loadStats();
		initGame();
		
		// Add event listeners
		document.addEventListener('keydown', handleKeyPress);
		
		// Handle visibility change
		document.addEventListener('visibilitychange', () => {
			if (document.hidden && gameRunning && !gamePaused) {
				togglePause();
			}
		});
		
		// Handle fullscreen changes
		const handleFullscreenChange = () => {
			isFullscreen = !!document.fullscreenElement;
			setTimeout(resizeCanvas, 100);
		};
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		
		// Store the handler for cleanup
		gameContainer._fullscreenHandler = handleFullscreenChange;
	});

	onDestroy(() => {
		clearInterval(gameLoop);
		document.removeEventListener('keydown', handleKeyPress);
		if (gameContainer && gameContainer._fullscreenHandler) {
			document.removeEventListener('fullscreenchange', gameContainer._fullscreenHandler);
		}
	});

	// Reactive statements for computed values
	$: formattedGameTime = {
		minutes: Math.floor(gameTime / 60),
		seconds: gameTime % 60
	};

	$: formattedTotalTime = {
		hours: Math.floor(totalTime / 3600),
		minutes: Math.floor((totalTime % 3600) / 60)
	};
</script>

<div class="app-container">
	<!-- Header -->
	<header class="header">
		<div class="logo">
			<i class="fas fa-gamepad"></i>
			<h1>Snake Game</h1>
			<span class="credits">by <a href="https://github.com/cosmic-fi" target="_blank">Cosmic-fi</a></span>
		</div>
		<div class="header-stats">
			<div class="stat-item">
				<i class="fas fa-trophy"></i>
				<span>High Score: {highScore}</span>
			</div>
			<div class="stat-item">
				<i class="fas fa-clock"></i>
				<span>Time: {formattedGameTime.minutes}:{formattedGameTime.seconds.toString().padStart(2, '0')}</span>
			</div>
			<div class="stat-item">
				<i class="fas fa-star"></i>
				<span>Score: {score}</span>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="main-content">
		<!-- Scoreboard -->
		<aside class="scoreboard">
			<!-- Current Game Stats -->
			<div class="score-section">
				<h3><i class="fas fa-gamepad"></i> Current Game</h3>
				<div class="current-stats">
					<div class="stat-row">
						<span class="stat-label">Score:</span>
						<span class="stat-value">{score}</span>
					</div>
					<div class="stat-row">
						<span class="stat-label">Length:</span>
						<span class="stat-value">{snakeLength}</span>
					</div>
					<div class="stat-row">
						<span class="stat-label">Time:</span>
						<span class="stat-value">{formattedGameTime.minutes}:{formattedGameTime.seconds.toString().padStart(2, '0')}</span>
					</div>
				</div>
			</div>

			<!-- All-time Stats -->
			<div class="score-section">
				<h3><i class="fas fa-chart-line"></i> Statistics</h3>
				<div class="stats-grid">
					<div class="stat-item-large">
						<div class="stat-number">{highScore}</div>
						<div class="stat-label">High Score</div>
					</div>
					<div class="stat-item-large">
						<div class="stat-number">{gamesPlayed}</div>
						<div class="stat-label">Games Played</div>
					</div>
					<div class="stat-item-large">
						<div class="stat-number">{bestStreak}</div>
						<div class="stat-label">Best Streak</div>
					</div>
					<div class="stat-item-large">
						<div class="stat-number">
							{#if formattedTotalTime.hours > 0}
								{formattedTotalTime.hours}h {formattedTotalTime.minutes}m
							{:else}
								{formattedTotalTime.minutes}m
							{/if}
						</div>
						<div class="stat-label">Total Time</div>
					</div>
					<div class="stat-item-large">
						<div class="stat-number">{totalFood}</div>
						<div class="stat-label">Food Eaten</div>
					</div>
					<div class="stat-item-large">
						<div class="stat-number">{winRate}%</div>
						<div class="stat-label">Survival Rate</div>
					</div>
				</div>
			</div>

			<!-- Recent Games -->
			<div class="score-section">
				<h3><i class="fas fa-history"></i> Recent Games</h3>
				<div class="recent-games">
					{#if recentGames.length === 0}
						<div class="no-games">No games played yet</div>
					{:else}
						{#each recentGames as game, index}
							<div class="game-entry">
								<div class="game-rank">#{index + 1}</div>
								<div class="game-details">
									<div class="game-score">{game.score}</div>
									<div class="game-time">{Math.floor(game.time / 60)}:{(game.time % 60).toString().padStart(2, '0')}</div>
								</div>
								<div class="game-date">{game.date}</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Game Tips -->
			<div class="score-section">
				<h3><i class="fas fa-lightbulb"></i> Controls & Tips</h3>
				<div class="tips-grid">
					<div class="tip-item">
						<strong>Movement:</strong> Arrow keys or WASD
					</div>
					<div class="tip-item">
						<strong>Start/Pause:</strong> Spacebar
					</div>
					<div class="tip-item">
						<strong>Fullscreen:</strong> F key
					</div>
					<div class="tip-item">
						<strong>Quick Start:</strong> Click the canvas
					</div>
				</div>
			</div>
		</aside>

		<!-- Game Area -->
		<section class="game-section">
			<div class="game-container" bind:this={gameContainer}>
				<canvas 
					bind:this={canvas}
					class="game-canvas"
					tabindex="0"
					on:click={handleCanvasClick}
				></canvas>
				
				{#if showOverlay}
				<div class="game-overlay">
					<div class="overlay-content">
						<i class="fas {overlayIcon} overlay-icon"></i>
						<h2 class="overlay-title">{overlayTitle}</h2>
						<p class="overlay-message">{overlayMessage}</p>
					</div>
				</div>
			{/if}

			<!-- Fullscreen HUD -->
			{#if isFullscreen}
				<div class="fullscreen-hud">
					<div class="hud-left">
						<div class="hud-item">
							<i class="fas fa-star"></i>
							<span>Score</span>
							<span class="hud-value">{score}</span>
						</div>
						<div class="hud-item">
							<i class="fas fa-trophy"></i>
							<span>High</span>
							<span class="hud-value">{highScore}</span>
						</div>
						<div class="hud-item">
							<i class="fas fa-clock"></i>
							<span>Time</span>
							<span class="hud-value">{formattedGameTime.minutes}:{formattedGameTime.seconds.toString().padStart(2, '0')}</span>
						</div>
					</div>
					<div class="hud-right">
						<div class="hud-controls">
							<div class="hud-hint"><kbd>F</kbd> Exit Fullscreen</div>
							<div class="hud-hint"><kbd>Space</kbd> {gameRunning ? (gamePaused ? 'Resume' : 'Pause') : 'Start'}</div>
							{#if gameRunning}
								<div class="hud-hint"><kbd>WASD</kbd> / <kbd>Arrows</kbd> Move</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
			</div>

			<!-- Game Controls -->
			<div class="game-controls">
				<button 
					class="btn btn-primary" 
					disabled={gameRunning}
					on:click={startGame}
				>
					<i class="fas fa-play"></i> Start
				</button>
				<button 
					class="btn btn-warning" 
					disabled={!gameRunning}
					on:click={togglePause}
				>
					<i class="fas {gamePaused ? 'fa-play' : 'fa-pause'}"></i> 
					{gamePaused ? 'Resume' : 'Pause'}
				</button>
				<button class="btn btn-danger" on:click={resetGame}>
					<i class="fas fa-redo"></i> Reset
				</button>
				<button class="btn btn-info" on:click={toggleFullscreen}>
					<i class="fas fa-expand"></i> Fullscreen
				</button>
				<button class="btn btn-success" on:click={toggleLeaderboard}>
					<i class="fas fa-trophy"></i> Leaderboard
				</button>
			</div>
		</section>
	</div>

	<!-- Name Input Modal -->
	{#if showNameInput}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" on:click={cancelNameInput}>
			<div class="modal-content" on:click|stopPropagation>
				<div class="modal-header">
					<h3><i class="fas fa-trophy"></i> New High Score!</h3>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button class="modal-close" on:click={cancelNameInput}>
						<i class="fas fa-times"></i>
					</button>
				</div>
				<div class="modal-body">
					<p>Congratulations! You scored <strong>{score}</strong> points!</p>
					<p>Enter your name for the global leaderboard:</p>
					{#if leaderboardError}
						<div class="error-message">
							<i class="fas fa-exclamation-triangle"></i>
							{leaderboardError}
						</div>
					{/if}
					<input 
						type="text" 
						bind:value={playerName} 
						placeholder="Enter your name (max 20 chars)" 
						maxlength="20"
						class="name-input"
						disabled={isSubmittingScore}
						on:keydown={(e) => e.key === 'Enter' && !isSubmittingScore && submitName()}
					/>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" on:click={submitName} disabled={isSubmittingScore}>
						{#if isSubmittingScore}
							<i class="fas fa-spinner fa-spin"></i> Submitting...
						{:else}
							<i class="fas fa-check"></i> Submit
						{/if}
					</button>
					<button class="btn btn-secondary" on:click={cancelNameInput} disabled={isSubmittingScore}>
						<i class="fas fa-times"></i> Skip
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Leaderboard Modal -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	{#if showLeaderboard}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" on:click={toggleLeaderboard}>
			<div class="modal-content leaderboard-modal" on:click|stopPropagation>
				<div class="modal-header">
					<h3><i class="fas fa-trophy"></i> Global Leaderboard</h3>
					<div class="header-actions">
						<button class="btn btn-sm btn-outline" on:click={loadLeaderboard} disabled={isLoadingLeaderboard} title="Refresh">
							{#if isLoadingLeaderboard}
								<i class="fas fa-spinner fa-spin"></i>
							{:else}
								<i class="fas fa-sync-alt"></i>
							{/if}
						</button>
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button class="modal-close" on:click={toggleLeaderboard}>
							<i class="fas fa-times"></i>
						</button>
					</div>
				</div>
				<div class="modal-body">
					{#if leaderboardError}
						<div class="error-message">
							<i class="fas fa-exclamation-triangle"></i>
							{leaderboardError}
							{#if globalLeaderboard.length > 0}
								<small>(Showing cached data)</small>
							{/if}
						</div>
					{/if}
					
					{#if isLoadingLeaderboard && globalLeaderboard.length === 0}
						<div class="loading-state">
							<i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
							<p>Loading leaderboard...</p>
						</div>
					{:else if globalLeaderboard.length === 0}
						<div class="empty-leaderboard">
							<i class="fas fa-trophy" style="font-size: 3rem; color: #ffd700; margin-bottom: 1rem;"></i>
							<p>No scores yet! Be the first to make it to the leaderboard!</p>
						</div>
					{:else}
						<div class="leaderboard-list">
							{#each globalLeaderboard as entry, index}
								<div class="leaderboard-entry rank-{index + 1}">
									<div class="rank">
										{#if index === 0}
											<i class="fas fa-crown"></i>
										{:else if index === 1}
											<i class="fas fa-medal"></i>
										{:else if index === 2}
											<i class="fas fa-award"></i>
										{:else}
											#{index + 1}
										{/if}
									</div>
									<div class="player-info">
										<div class="player-name">{entry.name}</div>
										<div class="player-date">{entry.date}</div>
									</div>
									<div class="player-score">{entry.score}</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.app-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #ffffff;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		height: 50px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.credits{
		color: rgb(209, 209, 209);

		a{
			color: #ffd700;
		}
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo h1 {
		margin: 0;
		font-size: 1.8rem;
		font-weight: 700;
		color: #ffffff;
	}

	.logo i {
		font-size: 2rem;
		color: #ffd700;
	}

	.header-stats {
		display: flex;
		gap: 2rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
	}

	.stat-item i {
		color: #ffd700;
	}

	.main-content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 2rem;
		padding: 2rem;
		max-width: 1400px;
		flex-grow: 1 !important;
		margin: 0 auto;
	}

	.scoreboard {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		height: 500px;
		overflow: hidden;
		overflow-y: auto;
		padding-right: .5em;
	}

	.score-section {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 15px;
		padding: 1.5rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.score-section h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #ffd700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.current-stats {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stat-label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9rem;
	}

	.stat-value {
		font-weight: 700;
		color: #ffffff;
		font-size: 1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat-item-large {
		text-align: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.stat-number {
		font-size: 1.5rem;
		font-weight: 700;
		color: #ffd700;
		margin-bottom: 0.3rem;
	}

	.stat-item-large .stat-label {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.recent-games {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.no-games {
		text-align: center;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
		padding: 1rem;
	}

	.game-entry {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.8rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.game-rank {
		font-weight: 700;
		color: #ffd700;
		min-width: 30px;
	}

	.game-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.game-score {
		font-weight: 700;
		color: #ffffff;
	}

	.game-time {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.game-date {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.game-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
	}

	.game-container {
		position: relative;
		border-radius: 15px;
		width: 100%;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.2);
		background-color: #1a1a2e;
	}

	.game-canvas {
		display: block;
		background: #1a1a2e;
		margin: 0 auto;
		cursor: pointer;
		outline: none;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	/* Fullscreen canvas scaling */
	.game-container:fullscreen .game-canvas {
		width: 100vw;
		height: 100vh;
		max-width: 100vw;
		max-height: 100vh;
		object-fit: contain;
	}

	.game-container:fullscreen {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0f0f23;
	}

	.game-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(5px);
		z-index: 1500;
	}

	/* Ensure game overlay appears above fullscreen HUD */
	.game-container:fullscreen .game-overlay {
		z-index: 1500;
		background: rgba(0, 0, 0, 0.9);
	}

	.overlay-content {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #ffffff;
	}

	.overlay-icon {
		font-size: 4rem;
		color: #ffd700;
		margin-bottom: 1rem;
		display: block;
	}

	.overlay-title {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.overlay-message {
		font-size: 1.1rem;
		margin: 0;
		color: rgba(255, 255, 255, 0.9);
	}

	.game-controls {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn {
		padding: 0.8rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		min-width: 120px;
		justify-content: center;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
	}

	.btn:not(:disabled):hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.btn-warning {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: white;
		min-width: 140px;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.btn-danger {
		background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.btn-info {
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
		color: #333;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.btn-success {
		background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.btn-secondary {
		background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.game-tips {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 15px;
		padding: 1.5rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		max-width: 500px;
		width: 100%;
	}

	.tips-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.8rem;
	}

	.tip-item {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.tip-item strong {
		color: #ffd700;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		backdrop-filter: blur(5px);
		animation: fadeIn 0.3s ease;
	}

	/* Ensure modals appear above fullscreen HUD */
	.game-container:fullscreen .modal-overlay {
		z-index: 2000;
		background: rgba(0, 0, 0, 0.9);
	}

	.modal-content {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 15px;
		max-width: 550px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		border: 2px solid rgba(255, 255, 255, 0.2);
		animation: slideIn 0.3s ease;
	}

	.leaderboard-modal {
		max-width: 600px;
		overflow: hidden;
	}

	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h3 {
		margin: 0;
		color: #ffd700;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.modal-close {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.8);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.modal-close:hover {
		color: white;
		background: rgba(255, 255, 255, 0.1);
	}

	.modal-body {
		padding: 1.5rem;
		max-height: 300px;
		color: white;
		overflow: hidden;
		overflow-y: auto;
	}

	.modal-body p {
		margin: 0 0 1rem 0;
		line-height: 1.6;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.name-input {
		/* width: 100%; */
		padding: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 1rem;
		outline: none;
		transition: all 0.3s ease;
	}

	.name-input::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	.name-input:focus {
		border-color: #ffd700;
		box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
	}

	.empty-leaderboard {
		text-align: center;
		padding: 2rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.leaderboard-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.leaderboard-entry {
		display: flex;
		align-items: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
	}

	.leaderboard-entry:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	.leaderboard-entry.rank-1 {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
		border-color: #ffd700;
	}

	.leaderboard-entry.rank-2 {
		background: linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(169, 169, 169, 0.1) 100%);
		border-color: #c0c0c0;
	}

	.leaderboard-entry.rank-3 {
		background: linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(184, 115, 51, 0.1) 100%);
		border-color: #cd7f32;
	}

	.rank {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2rem;
		margin-right: 1rem;
	}

	.rank-1 .rank {
		color: #ffd700;
		font-size: 1.5rem;
	}

	.rank-2 .rank {
		color: #c0c0c0;
		font-size: 1.3rem;
	}

	.rank-3 .rank {
		color: #cd7f32;
		font-size: 1.3rem;
	}

	.player-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.player-name {
		font-weight: 600;
		font-size: 1.1rem;
		color: white;
	}

	.player-date {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.player-score {
		font-weight: bold;
		font-size: 1.3rem;
		color: #ffd700;
		min-width: 80px;
		text-align: right;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideIn {
		from { 
			opacity: 0;
			transform: translateY(-50px) scale(0.9);
		}
		to { 
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Error and Loading States */
	.error-message {
		background: rgba(220, 53, 69, 0.2);
		border: 1px solid rgba(220, 53, 69, 0.5);
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		color: #ff6b6b;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-direction: column;
		text-align: center;
	}

	.error-message i {
		font-size: 1.2rem;
	}

	.error-message small {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.loading-state i {
		color: #ffd700;
	}

	/* Header Actions */
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-sm {
		padding: 0.4rem 0.8rem;
		font-size: 0.9rem;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: rgba(255, 255, 255, 0.8);
	}

	.btn-outline:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.5);
		color: white;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		pointer-events: none;
	}

	.name-input:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	/* Fullscreen HUD Styles */
	.fullscreen-hud {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem;
	}

	.hud-left {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 15px;
		padding: 1.5rem 1rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		min-width: 120px;
	}

	.hud-right {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.hud-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 15px;
		padding: 1.5rem 1rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		min-width: 180px;
	}

	.hud-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		color: white;
		font-size: 0.9rem;
		font-weight: 500;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
		text-align: center;
	}

	.hud-item i {
		color: #ffd700;
		font-size: 1.2rem;
		margin-bottom: 0.2rem;
	}

	.hud-value {
		font-size: 1.3rem;
		font-weight: 700;
		color: #ffd700;
	}

	.hud-hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 1rem;
		font-weight: 500;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.hud-hint kbd {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		font-size: 0.9rem;
		font-weight: 700;
		color: #ffd700;
		text-shadow: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.main-content {
			grid-template-columns: 280px 1fr;
			gap: 1.5rem;
			padding: 1.5rem;
		}
	}

	@media (max-width: 968px) {
		.main-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.scoreboard {
			order: 2;
		}

		.game-section {
			order: 1;
		}

		.header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.header-stats {
			justify-content: center;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.tips-grid {
			grid-template-columns: 1fr;
		}

		/* HUD responsive adjustments */
		.hud-left {
			gap: 1.2rem;
			padding: 1.2rem 0.8rem;
			min-width: 100px;
		}

		.hud-controls {
			gap: 0.8rem;
			padding: 1.2rem 0.8rem;
			min-width: 150px;
		}

		.hud-item {
			font-size: 0.8rem;
		}

		.hud-value {
			font-size: 1.1rem;
		}

		.hud-hint {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 600px) {
		.main-content {
			padding: 1rem;
		}

		.game-controls {
			grid-template-columns: 1fr 1fr;
		}

		.btn {
			min-width: auto;
			padding: 0.6rem 1rem;
			font-size: 0.9rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		/* HUD mobile adjustments */
		.fullscreen-hud {
			padding: 1rem;
			flex-direction: column;
			justify-content: flex-start;
			gap: 1rem;
		}

		.hud-left {
			gap: 1rem;
			padding: 1rem 0.8rem;
			flex-direction: row;
			justify-content: space-around;
			min-width: auto;
			width: 100%;
		}

		.hud-right {
			width: 100%;
		}

		.hud-controls {
			gap: 0.8rem;
			padding: 1rem 0.8rem;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			min-width: auto;
			width: 100%;
		}

		.hud-item {
			font-size: 0.7rem;
			gap: 0.2rem;
		}

		.hud-value {
			font-size: 1rem;
		}

		.hud-hint {
			font-size: 0.7rem;
		}

		.hud-hint kbd {
			padding: 0.2rem 0.4rem;
			font-size: 0.7rem;
		}
	}

	/* Custom Scrollbar Styles */
	:global(::-webkit-scrollbar) {
		width: 12px;
		height: 12px;
	}

	:global(::-webkit-scrollbar-track) {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(::-webkit-scrollbar-thumb) {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: rgba(255, 255, 255, 0.4);
		box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.4);
		transform: scale(1.1);
	}

	:global(::-webkit-scrollbar-thumb:active) {
		background: rgba(255, 255, 255, 0.6);
	}

	:global(::-webkit-scrollbar-corner) {
		background: rgba(255, 255, 255, 0.1);
	}

	/* Firefox Scrollbar */
	:global(*) {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
	}

	/* Custom scrollbar for specific containers */
	:global(.scoreboard::-webkit-scrollbar-thumb) {
		background: rgba(255, 255, 255, 0.15);
	}

	:global(.scoreboard::-webkit-scrollbar-thumb:hover) {
		background: rgba(255, 255, 255, 0.3);
	}
</style>