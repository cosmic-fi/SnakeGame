<script>
// @ts-nocheck

  import { onMount, onDestroy } from 'svelte';
  import { GameEngine } from '../game/GameEngine.js';
  import { GAME_CONFIG } from '../utils/GameConfig.js';
  import { AudioService } from '../services/AudioService.js';
  import { StorageService } from '../services/StorageService.js';
  import { LeaderboardService } from '../services/LeaderboardService.js';
  import GameStats from './GameStats.svelte';
  import NameInput from './NameInput.svelte';
  import MainMenu from './MainMenu.svelte';
  import Leaderboard from './Leaderboard.svelte';
  import StatsPanel from './StatsPanel.svelte';
  import BuffPanel from './BuffPanel.svelte';
  
  // Canvas reference
  let canvas;
  
  // Game engine
  let gameEngine;
  
  // Game state
  let score = 0;
  let gameTime = 0;
  let highScore = 0;
  let snakeLength = 1;
  
  // UI state
  let showMainMenu = true;
  let showNameInput = false;
  let showGameStats = false;
  let showCanvas = false;
  let showCountdown = false;
  let countdownValue = 3;
  let gamePaused = false;
  
  // Player data
  let playerName = StorageService.loadPlayerName();
  let settings = StorageService.loadSettings();
  
  // Handle keyboard events
  function handleKeyPress(event) {
    // Handle pause/resume with Escape key or Spacebar
    if (event.code === 'Escape' || event.code === 'Space') {
      if (gameEngine && gameEngine.gameRunning) {
        if (gameEngine.gamePaused) {
          resumeGame();
        } else {
          pauseGame();
        }
      }
      event.preventDefault();
    }
  }
  
  // Handle window resize for fullscreen canvas
  function handleResize() {
    if (canvas && gameEngine) {
      // Reinitialize the game engine with new dimensions
      const wasRunning = gameEngine.gameRunning;
      const wasPaused = gameEngine.gamePaused;
      
      // Destroy current game engine
      gameEngine.destroy();
      
      // Reinitialize with new dimensions
      initGameEngine();
      
      // Restore game state if it was running
      if (wasRunning && !wasPaused) {
        // Game was running, keep it running
        gameEngine.gameRunning = true;
      } else if (wasPaused) {
        // Game was paused, keep it paused
        gameEngine.gameRunning = true;
        gameEngine.gamePaused = true;
      }
    }
  }
  
  // Handle theme changes
  function handleThemeChange() {
    if (gameEngine) {
      gameEngine.updateTheme();
    }
  }
  
  // Handle user interaction to resume audio context
  function handleUserInteraction() {
    AudioService.playBackgroundMusic();
    // Remove the listener after first interaction
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
  }

  // Initialize game on mount
  onMount(() => {
    // Load high score
    const localLeaderboard = LeaderboardService.getLocalLeaderboard();
    if (localLeaderboard.length > 0) {
      highScore = localLeaderboard[0].score;
    }
    
    // Show name input if no name is set
    if (!playerName) {
      showNameInput = true;
      showMainMenu = false;
    }
    
    // Initialize audio and start background music
    AudioService.init();
    AudioService.setMuted(!settings.soundEnabled);
    AudioService.playBackgroundMusic();
    
    // Add user interaction listeners to resume audio context
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Add global keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Add theme change listener
    document.addEventListener('themeChanged', handleThemeChange);
    
    window.addEventListener('resize', handleResize);
  });
  
  // Clean up on destroy
  onDestroy(() => {
    if (gameEngine) {
      gameEngine.destroy();
    }
    
    // Stop all audio including background music and any playing sounds
    AudioService.stopAllSounds();
    
    // Remove global keyboard event listener
    document.removeEventListener('keydown', handleKeyPress);
    
    // Remove theme change listener
    document.removeEventListener('themeChanged', handleThemeChange);
    
    // Remove user interaction listeners
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
    
    // Remove resize event listener
    window.removeEventListener('resize', handleResize);
  });
  
  // Initialize game engine
  function initGameEngine() {
    if (!canvas) return;
    
    // Set fixed canvas size
    canvas.width = 600;
    canvas.height = 600;
    
    // Create game engine with fixed settings
    gameEngine = new GameEngine(canvas, {
      gridSize: 20,
      tileCount: 30,
      gameMode: settings.gameMode,
      onGameOver: handleGameOver,
      onScoreChange: handleScoreChange,
      onGameTimeUpdate: handleGameTimeUpdate
    });
    
    // Initialize game
    gameEngine.init();
    
    // Set initial snake style
    if (settings.snakeStyle) {
      gameEngine.setSnakeStyle(settings.snakeStyle);
    }
    
    // Update FPS based on difficulty
    updateGameSpeed();
  }
  
  // Update game speed based on difficulty
  function updateGameSpeed() {
    if (!gameEngine) return;
500    
    // Update the game engine's difficulty which will update baseSpeed
    gameEngine.updateDifficulty(settings.difficulty);
  }
  
  // Handle score change
  function handleScoreChange(newScore) {
    score = newScore;
    snakeLength = gameEngine?.snake?.body?.length || 1;
    
    // Update high score
    if (score > highScore) {
      highScore = score;
    }
  }
  
  // Handle game time update
  function handleGameTimeUpdate(newTime) {
    gameTime = newTime;
  }
  
  // Handle game over
  function handleGameOver(gameData) {
    // Show game stats
    showGameStats = true;
    
    // Submit score if player has a name and score > 0
    if (playerName && gameData.score > 0) {
      submitScore(gameData);
    }
  }
  
  // Submit score to leaderboard
  async function submitScore(gameData) {
    const playerData = {
      playerName,
      score: gameData.score,
      gameTime: gameData.gameTime,
      snakeLength: gameData.snakeLength,
      gameMode: settings.gameMode
    };
    
    try {
      const result = await LeaderboardService.submitScore(playerData);
      
      if (result.success) {
        if (result.newHighScore || result.localHighScore) {
          console.log(`🎉 New high score! Previous best: ${result.previousHighScore || 0}`);
          // You could show a celebration message here
        } else {
          console.log(`Score ${gameData.score} was not a new high score. Current best: ${result.currentHighScore}`);
        }
        
        if (result.onlineSubmitted) {
          console.log('Score submitted to online leaderboard!');
        } else if (result.reason) {
          console.log(`Online submission skipped: ${result.reason}`);
        }
      } else {
        console.log('Score submission failed:', result.error || result.reason);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }
  
  // Start game
  function startGame() {
    showMainMenu = false;
    showCanvas = true;
    showGameStats = true;
    showCountdown = true;
    countdownValue = 3;
    
    // Always reinitialize game engine to ensure canvas binding
    // Wait for canvas to be available
    setTimeout(() => {
      initGameEngine();
      startCountdown();
    }, 10);
  }
  
  // Start countdown timer
  function startCountdown() {
    // Draw countdown on canvas
    drawCountdown();
    
    const countdownInterval = setInterval(() => {
      countdownValue--;
      
      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        showCountdown = false;
        
        // Start game engine
        if (gameEngine) {
          gameEngine.startGame();
        }
      } else {
        // Draw next countdown number
        drawCountdown();
      }
    }, 1000);
  }
  
  // Draw countdown on canvas
  function drawCountdown() {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const canvasSize = Math.min(canvas.width, canvas.height);
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw countdown number
    ctx.fillStyle = '#F7A5A5';
    ctx.font = 'bold 80px Orbitron, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add glow effect
    ctx.shadowColor = '#F7A5A5';
    ctx.shadowBlur = 20;
    
    ctx.fillText(countdownValue.toString(), canvasSize / 2, canvasSize / 2);
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }
  
  // Show main menu
  function showMenu() {
    showMainMenu = true;
    showNameInput = false;
    showGameStats = false;
    showCanvas = false;
    showCountdown = false;
  }
  
  // Handle player name submission
  function handleNameSubmit(event) {
    playerName = event.detail;
    showNameInput = false;
    showMainMenu = true;
  }
  
  // Handle settings change
  function handleSettingsChange(event) {
    settings = event.detail;
    
    // Update game engine settings
    if (gameEngine) {
      gameEngine.gameMode = settings.gameMode;
      
      // Update game speed for difficulty changes
      updateGameSpeed();
      
      // Update snake style if it has changed
      if (settings.snakeStyle) {
        gameEngine.setSnakeStyle(settings.snakeStyle);
      }
    }
    
    // Update audio settings
    AudioService.setMuted(!settings.soundEnabled);
  }
  
  // Pause game
  function pauseGame() {
    if (gameEngine && gameEngine.gameRunning && !gameEngine.gamePaused) {
      gameEngine.pauseGame();
      gamePaused = true;
      showMainMenu = true;
    }
  }
  
  // Resume game
  function resumeGame() {
    if (gameEngine && gameEngine.gameRunning && gameEngine.gamePaused) {
      gameEngine.resumeGame();
      gamePaused = false;
      showMainMenu = false;
    }
  }
  
  // Restart game from pause menu
  function restartGame() {
    if (gameEngine) {
      gameEngine.resetGame();
      gamePaused = false;
      showMainMenu = false;
      showCanvas = true;
      showGameStats = true;
      showCountdown = true;
      countdownValue = 3;
      startCountdown();
    }
  }

  // Go to main menu from pause
  function goToMainMenu() {
    if (gameEngine) {
      // Properly destroy the game engine to clean up all timers and resources
      gameEngine.destroy();
      gameEngine = null;
      gamePaused = false;
      showMainMenu = true;
      showCanvas = false;
      showGameStats = false;
    }
    
    // Stop all sounds when returning to main menu
    AudioService.stopAllSounds();
  }
</script>

<div class="game-container">
  <!-- Game canvas -->
  {#if showCanvas}
    <div class="game-layout">
      <!-- Stats Panel (Left) -->
      <div class="stats-panel-container">
        <StatsPanel 
          {gameEngine}
          {score}
          {highScore}
          {gameTime}
          {snakeLength}
        />
      </div>
      
      <!-- Canvas (Center) -->
      <div class="canvas-container">
        <canvas 
          bind:this={canvas}
        ></canvas>
      </div>
      
      <!-- Buff Panel (Right) -->
      <div class="buff-panel-container">
        <BuffPanel 
          {gameEngine}
        />
      </div>
    </div>
  {/if}
  
  <!-- Game stats -->
  <!-- {#if showGameStats}
    <div class="stats-container">
      <GameStats 
        {score} 
        {gameTime} 
        {snakeLength} 
        {highScore}
      />
    </div>
  {/if} -->
  
  <!-- Main menu overlay -->
  {#if showMainMenu}
    <div
      class={gamePaused ? 'overlay-paused' : 'overlay'}
    >
      <MainMenu 
          {playerName} 
          {settings}
          {gamePaused}
          on:startGame={startGame}
          on:resumeGame={resumeGame}
          on:restartGame={restartGame}
          on:goToMainMenu={goToMainMenu}
          on:showNameInput={() => { showNameInput = true; showMainMenu = false; }}
          on:settingsChange={handleSettingsChange}
      >
        <div slot="leaderboard">
          <Leaderboard gameMode={settings.gameMode} />
        </div>
      </MainMenu>
    </div>
  {/if}
  
  <!-- Name input overlay -->
  {#if showNameInput}
    <div class="overlay">
      <NameInput 
        {playerName} 
        on:nameSubmit={handleNameSubmit}
        on:cancel={showMenu}
      />
    </div>
  {/if}
</div>

<style>
  .game-container {
    margin: auto;
    width: 100vw;
    height: 100vh;
    max-width: min(100vw, 100vh, 3000px);
    /* background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); */
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: start;
    /* justify-content: center; */
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  .game-layout {
    display: flex;
    align-items: start;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    width: 100%;
    height: 100%;
    margin: auto;
    max-width: 3000px;
    padding: 20px;
  }
  
  .stats-panel-container {
    flex: 0 0 auto;
  }
  
  .canvas-container {
    flex: 0 0 auto;
    width: 100%;
    max-width: 3000px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .buff-panel-container {
    flex: 0 0 auto;
  }
  
  canvas {
    width: 100%;
    height: 100%;
    /* max-width: 2500px; */
    display: block;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    margin: 0;
    padding: 0;
    outline: none;
    /* Prevent zoom flickering and scaling issues */
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    /* Maintain crisp rendering at all zoom levels */
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: unset;
  }
  
  .overlay {
    position: fixed;
    top: 0;
    right: -55.1%;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(8px);
    background: 
			url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
    z-index: 1000;
  }
  .overlay-paused{
    position: fixed;
    top: 0;
    right: -55.1%;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: #fff2ef60;
    backdrop-filter: blur(8px);
    z-index: 1000;
  }
  

</style>