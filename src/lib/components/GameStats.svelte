<script>
  // Props
  export let score = 0;
  export let gameTime = 0;
  export let snakeLength = 1;
  export let highScore = 0;
  
  // Format time as MM:SS
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="game-stats">
  <div class="stat-item">
    <span class="stat-label">Score:</span>
    <span class="stat-value">{score}</span>
  </div>
  <span class="line"></span>
  <div class="stat-item">
    <span class="stat-label">High Score:</span>
    <span class="stat-value">{highScore}</span>
  </div>
  <span class="line"></span>
  <div class="stat-item">
    <span class="stat-label">Time:</span>
    <span class="stat-value">{formatTime(gameTime)}</span>
  </div>
  <span class="line"></span>
  <div class="stat-item">
    <span class="stat-label">Length:</span>
    <span class="stat-value">{snakeLength}</span>
  </div>
</div>

<style>
  .game-stats {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #FFF2EF;
    border-radius: 5px;
    padding: 10px;
    row-gap: 10px;
    margin-bottom: 10px;
    color: white;
    font-family: 'Arial', sans-serif;
  }
  .line{
    width: 100%;
    height: 1px;
    opacity: .8;
    background-color: #FFD6D3;
    border-radius: 5px;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 10px;
  }
  
  .stat-label {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.7),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.9)
    );
    white-space: nowrap;
    color: #5d688abe;
    margin-bottom: 2px;
  }
  
  .stat-value {
    font-size: clamp(
      calc(var(--zoom-adaptive-base) * 0.9),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-large) * 1.1)
    );
    font-weight: bold;
    color: #e2a364;
  }
</style>