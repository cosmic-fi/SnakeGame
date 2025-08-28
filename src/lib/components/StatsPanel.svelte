<script>
  import { onMount, onDestroy } from 'svelte';
  import { GAME_CONFIG } from '../config.js';

  export let gameEngine = null;
  export let score = 0;
  export let highScore = 0;
  export let gameTime = 0;
  export let snakeLength = 1;
  
  let level = 1;
  let speed = 'Normal';
  let foodEaten = 0;
  let buffsCollected = 0;
  let updateInterval;
  
  // Calculate level based on score
  function calculateLevel() {
    return Math.floor(score / 100) + 1;
  }
  
  // Get current speed description
  function getSpeedDescription() {
    if (!gameEngine) return 'Normal';
    
    const currentSpeed = gameEngine.currentSpeed || gameEngine.baseSpeed || 150;
    const baseSpeed = gameEngine.baseSpeed || 150;
    
    // Calculate speed relative to base speed
    const speedRatio = baseSpeed / currentSpeed;
    
    if (speedRatio >= 1.4) return 'Very Fast';
    if (speedRatio >= 1.2) return 'Fast';
    if (speedRatio <= 0.6) return 'Very Slow';
    if (speedRatio <= 0.8) return 'Slow';
    return 'Normal';
  }
  
  // Update stats
  function updateStats() {
    if (!gameEngine) return;
    
    level = calculateLevel();
    speed = getSpeedDescription();
    
    // Get food eaten count
    if (gameEngine.foodManager) {
      foodEaten = gameEngine.foodManager.foodEaten || 0;
    }
    
    // Get buffs collected count
    if (gameEngine.buffManager) {
      buffsCollected = gameEngine.buffManager.buffsCollected || 0;
    }
  }
  
  // Format time display
  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }
  
  // Calculate score per minute
  function getScorePerMinute() {
    if (gameTime === 0) return 0;
    const minutes = gameTime / 60; // gameTime is in seconds
    return Math.round(score / minutes);
  }
  
  // Get efficiency rating
  function getEfficiencyRating() {
    if (snakeLength <= 1) return 'Starting';
    const efficiency = score / snakeLength;
    if (efficiency >= 15) return 'Excellent';
    if (efficiency >= 10) return 'Good';
    if (efficiency >= 5) return 'Average';
    return 'Poor';
  }
  
  onMount(() => {
    // Update stats every 500ms
    updateInterval = setInterval(updateStats, 500);
  });
  
  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<div class="stats-panel">
  <h3>Game Stats</h3>
  
  <div class="stats-grid">
    <!-- Primary Stats -->
    <div class="stat-section">
      <h4>Score</h4>
      <div class="stat-group">
        <div class="stat-item primary">
          <span class="stat-label">Current</span>
          <span class="stat-value">{score.toLocaleString()}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">High Score</span>
          <span class="stat-value">{highScore.toLocaleString()}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Level</span>
          <span class="stat-value">{level}</span>
        </div>
      </div>
    </div>
    
    <!-- Snake Stats -->
    <div class="stat-section">
      <h4>Snake</h4>
      <div class="stat-group">
        <div class="stat-item">
          <span class="stat-label">Length</span>
          <span class="stat-value">{snakeLength}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Speed</span>
          <span class="stat-value">{speed}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Efficiency</span>
          <span class="stat-value">{getEfficiencyRating()}</span>
        </div>
      </div>
    </div>
    
    <!-- Game Stats -->
    <div class="stat-section">
      <h4>Performance</h4>
      <div class="stat-group">
        <div class="stat-item">
          <span class="stat-label">Time</span>
          <span class="stat-value">{formatTime(gameTime)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Food Eaten</span>
          <span class="stat-value">{foodEaten}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Buffs Used</span>
          <span class="stat-value">{buffsCollected}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Score/Min</span>
          <span class="stat-value">{getScorePerMinute()}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Progress Bars -->
  <div class="progress-section">
    <h4>Progress</h4>
    
    <!-- Level Progress -->
    <div class="progress-item">
      <div class="progress-header">
        <span>Level {level}</span>
        <span>{score % 100}/100</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill level" 
          style="width: {(score % 100)}%"
        ></div>
      </div>
    </div>
    
    <!-- High Score Progress -->
    {#if score > 0 && highScore > 0}
      <div class="progress-item">
        <div class="progress-header">
          <span>High Score</span>
          <span>{Math.round((score / highScore) * 100)}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill score" 
            style="width: {Math.min((score / highScore) * 100, 100)}%"
          ></div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .stats-panel {
    background: #fff2ef8f;
    border: 1px solid #fff2ef8f;
    border-radius: 12px;
    padding: 20px;
    /* max-width: 20vw; */
    height: fit-content;
    overflow: hidden;
    max-height: calc(100vh - 50px);
    overflow-y: auto;
    font-family: inherit;
    color: #5D688A;
  }
  
  h3 {
    margin: 0 0 20px 0;
    font-size: clamp(
      calc(var(--zoom-adaptive-large) * 0.9),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-xl) * 1.1)
    );
    color: #5D688A;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: calc(1px * var(--zoom-font-scale));
  }
  
  h4 {
    margin: 0 0 12px 0;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 1.1)
    );
    color: #5D688A;
    text-transform: uppercase;
    letter-spacing: calc(0.5px * var(--zoom-font-scale));
    border-bottom: 1px solid #5d688a4f;
    padding-bottom: 4px;
  }
  
  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .stat-section {
    background: #FFDBB6;
    border: 1px solid #55555548;
    border-radius: 8px;
    padding: 12px;
  }
  
  .stat-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    color: #5D688A;
    border-radius: 4px;
    background-color: #FFF2EF;
    min-width: 18vw !important;
    transition: background 0.2s ease;
  }
  
  .stat-item:hover {
    background: #FFD6D3;
  }
  
  .stat-item.primary {
    background: #f7a5a586;
    border: 1px solid #f7a5a5;
  }
  
  .stat-label {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.8),
      calc(2vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 1.0)
    );
    color: #5D688A;
    text-transform: uppercase;
    letter-spacing: calc(0.5px * var(--zoom-font-scale));
  }
  
  .stat-value {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 1.1)
    );
    font-weight: bold;
    color: #F7A5A5;
  }
  
  .primary .stat-value {
    color: #c57474;
    font-size: clamp(
      calc(var(--zoom-adaptive-base) * 0.9),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-large) * 1.1)
    );
  }
  
  .progress-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #5d688a4f;
  }
  
  .progress-item {
    margin-bottom: 12px;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
    color: #5D688A;
  }
  
  .progress-bar {
    height: 8px;
    background: #5d688a3f;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }
  
  .progress-fill.level {
    background: linear-gradient(90deg, #F7A5A5, #c57474);
  }
  
  .progress-fill.score {
    background: linear-gradient(90deg, #0088ff, #0066cc);
  }
  
  /* Scrollbar styling */
  .stats-panel::-webkit-scrollbar {
    width: 6px;
  }
  
  .stats-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .stats-panel::-webkit-scrollbar-thumb {
    background: #F7A5A5;
    border-radius: 3px;
  }
  
  .stats-panel::-webkit-scrollbar-thumb:hover {
    background: #ce8686;
  }
</style>