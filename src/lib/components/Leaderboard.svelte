<script>
  import { onMount } from 'svelte';
  import { LeaderboardService } from '../services/LeaderboardService.js';
  import { AudioService } from '../services/AudioService.js';
  
  // Props
  export let gameMode = 'border';
  
  // Local state
  let leaderboard = [];
  let loading = true;
  let error = null;
  let isOnline = false;
  let selectedGameMode = gameMode;
  
  // Available game modes
  const gameModes = [
    { key: 'border', label: 'Border Mode' },
    { key: 'wrap', label: 'Wrap Mode' }
  ];
  
  // Handle game mode change
  function handleGameModeChange(mode) {
    AudioService.playButtonClickSound();
    selectedGameMode = mode;
    loadLeaderboard();
  }
  
  // Load leaderboard data
  onMount(async () => {
    await loadLeaderboard();
  });
  
  // Watch for game mode changes
  $: if (gameMode) {
    selectedGameMode = gameMode;
    loadLeaderboard();
  }
  
  // Handle refresh button click
  function handleRefresh() {
    AudioService.playButtonClickSound();
    loadLeaderboard();
  }

  // Load leaderboard data
  async function loadLeaderboard() {
    loading = true;
    error = null;
    
    try {
      // Try to load online leaderboard
      const result = await LeaderboardService.getOnlineLeaderboard(10, selectedGameMode);
      
      if (result.success) {
        leaderboard = result.data;
        isOnline = true;
      } else {
        // Fallback to local leaderboard
        leaderboard = LeaderboardService.getLocalLeaderboard(selectedGameMode)
          .slice(0, 10);
        isOnline = false;
        
        if (result.error) {
          error = result.error;
        }
      }
    } catch (err) {
      // Fallback to local leaderboard on error
      leaderboard = LeaderboardService.getLocalLeaderboard(selectedGameMode)
        .slice(0, 10);
      isOnline = false;
      error = err.message || 'Failed to load leaderboard';
    } finally {
      loading = false;
    }
  }
  
  // Format date
  function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  }
</script>

<div class="leaderboard-container">
  <div class="leaderboard-header">
    <h3>Top Scores</h3>
    <span class="source-indicator {isOnline ? 'online' : 'local'}">
      {isOnline ? 'Online' : 'Local'}
    </span>
  </div>
  
  <!-- Game Mode Tabs -->
  <div class="game-mode-tabs">
    {#each gameModes as mode}
      <button 
        class="tab-button {selectedGameMode === mode.key ? 'active' : ''}"
        on:click={() => handleGameModeChange(mode.key)}
      >
        {mode.label}
      </button>
    {/each}
  </div>
  
  {#if loading}
    <div class="loading">Loading...</div>
  {:else if error}
    <div class="error">
      <p>Error loading online leaderboard: {error}</p>
      <p>Showing local scores instead.</p>
    </div>
  {:else if leaderboard.length === 0}
    <div class="empty">No scores yet for {gameModes.find(m => m.key === selectedGameMode)?.label || selectedGameMode}. Be the first!</div>
  {:else}
    <div class="leaderboard-cards">
      {#each leaderboard as entry, index}
        <div class="rank-card {index < 3 ? 'podium-' + (index + 1) : ''}">
          <div class="rank-number">
            {#if index === 0}
              🥇
            {:else if index === 1}
              🥈
            {:else if index === 2}
              🥉
            {:else}
              #{index + 1}
            {/if}
          </div>
          <div class="player-info">
            <div class="player-name">{entry.playerName || entry.player_name}</div>
            <div class="player-score">{entry.score} points</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  <button class="refresh-button" on:click={handleRefresh} disabled={loading}>
    Refresh
  </button>
</div>

<style>
  .leaderboard-container {
    width: 100%;
    color: white;
    font-family: 'Orbitron', sans-serif;
  }
  
  .leaderboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 20px;
    background: #FFF2EF;
    border-radius: 15px;
    border: 1px solid #F7A5A5;
  }
  
  h3 {
    margin: 0;
    font-size: clamp(1.2rem, 3vw, 1.4rem);
    background: linear-gradient(45deg, #F7A5A5, #F78585);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 3s ease-in-out infinite;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    text-shadow: 0 0 15px rgba(247, 165, 165, 0.5);
    letter-spacing: 1px;
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .source-indicator {
    font-size: clamp(1rem, 2vw, 0.85rem);
    padding: 6px 12px;
    border-radius: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .source-indicator.online {
    background: linear-gradient(45deg, #F7A5A5, #F78585);
    color: #000;
    box-shadow: 0 0 15px rgba(247, 165, 165, 0.4);
  }
  
  .source-indicator.local {
    background: linear-gradient(45deg, #ffaa00, #ff8800);
    color: #000;
    box-shadow: 0 0 15px rgba(255, 170, 0, 0.4);
  }
  
  .loading, .error, .empty {
    text-align: center;
    padding: 30px 20px;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    font-family: 'Orbitron', sans-serif;
    border-radius: 15px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;
  }
  
  .loading {
    color: #F7A5A5;
    text-shadow: 0 0 10px rgba(247, 165, 165, 0.5);
  }
  
  .error {
    color: #ff4444;
    font-size: clamp(1rem, 2vw, 0.95rem);
    text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
    border-color: rgba(255, 68, 68, 0.3);
  }
  
  .empty {
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  
  .leaderboard-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
    max-height: min(500px, 50vh);
    overflow-y: auto;
    padding-right: 8px;
  }
  
  /* Custom scrollbar styling */
  .leaderboard-cards::-webkit-scrollbar {
    width: 8px;
  }
  
  .leaderboard-cards::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  
  .leaderboard-cards::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #F7A5A5, #F78585);
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  
  .leaderboard-cards::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #F7A5A5, #F78585);
  }
  
  .rank-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #FFF2EF;
    border: 1px solid rgba(247, 165, 165, 0.2);
    border-radius: 12px;
    transition: all 0.3s ease;
    font-family: 'Orbitron', sans-serif;
  }
  
  .rank-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(247, 165, 165, 0.3);
    border-color: rgba(247, 165, 165, 0.4);
  }
  
  .rank-number {
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    font-weight: 700;
    color: #5D688A;
    min-width: 40px;
    text-align: center;
  }
  
  .player-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .player-name {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    font-weight: 600;
    color: #5D688A;
    letter-spacing: 0.5px;
  }
  
  .player-score {
    font-size: clamp(0.85rem, 2vw, 0.95rem);
    color: #F7A5A5;
    font-weight: 500;
  }
  
  /* Podium styling */
  .podium-1 {
    background: linear-gradient(135deg, rgba(255, 217, 0, 0.979), rgb(255, 193, 7));
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
  }
  
  .podium-1 .player-name {
    color: #B8860B;
    font-weight: 700;
  }
  
  .podium-1 .player-score {
    color: #aa8117;
    font-weight: 600;
  }
  
  .podium-2 {
    background: linear-gradient(135deg, rgb(192, 192, 192), rgb(150, 150, 150));
    border-color: rgba(192, 192, 192, 0.4);
    box-shadow: 0 4px 20px rgba(192, 192, 192, 0.2);
  }
  
  .podium-2 .player-name {
    color: #ebebeb;
    font-weight: 700;
  }
  
  .podium-2 .player-score {
    color: #dadada;
    font-weight: 600;
  }
  
  .podium-3 {
    background: linear-gradient(135deg, rgb(205, 128, 50), rgba(168, 105, 45, 0.986));
    border-color: rgba(205, 127, 50, 0.4);
    box-shadow: 0 4px 20px rgba(205, 127, 50, 0.2);
  }
  
  .podium-3 .player-name {
    color: #ffdec7;
    font-weight: 700;
  }
  
  .podium-3 .player-score {
    color: #cec4ba;
    font-weight: 600;
  }
  
  .refresh-button {
    background: linear-gradient(45deg, #F7A5A5, #F78585);
    color: #5D688A;
    border: none;
    padding: 12px 25px;
    font-size: clamp(0.5rem, 2.5vw, 1rem);
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: block;
    margin: 0 auto;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 
      0 4px 15px rgba(247, 165, 165, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .refresh-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .refresh-button:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(247, 165, 165, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  .refresh-button:hover::before {
    left: 100%;
  }
  
  .refresh-button:disabled {
    background: linear-gradient(45deg, #666, #888);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .refresh-button:disabled::before {
    display: none;
  }
  
  /* Game Mode Tabs */
  .game-mode-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
  }
  
  .tab-button {
    padding: 10px 20px;
    background: #5d688a5d;
    border: 1px solid #F7A5A5;
    border-radius: 8px;
    color: #FFF2EF;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .tab-button:hover {
    background: #d48686;
    border-color: #F7A5A5;
    color: #FFF2EF;
    transform: translateY(-2px);
  }
  
  .tab-button.active {
    background: linear-gradient(45deg, #d48686, #d48686);
    border-color: #fff2efbb;
    color: #FFF2EF;
    box-shadow: 0 0 15px #d48686a2;
  }
  
  .tab-button.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.226), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .leaderboard-header {
      padding: 12px 15px;
      margin-bottom: 15px;
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
    
    .leaderboard-cards {
      gap: 10px;
      max-height: min(400px, 45vh);
    }
    
    .rank-card {
      padding: 12px 16px;
      gap: 12px;
    }
    
    .rank-number {
      min-width: 35px;
    }
    
    .refresh-button {
      padding: 10px 20px;
    }
    
    .game-mode-tabs {
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .tab-button {
      padding: 8px 16px;
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 480px) {
    .leaderboard-header {
      padding: 10px 12px;
      border-radius: 12px;
    }
    
    .leaderboard-cards {
      gap: 8px;
      max-height: min(350px, 40vh);
      margin-bottom: 15px;
    }
    
    .rank-card {
      padding: 10px 14px;
      gap: 10px;
      border-radius: 10px;
    }
    
    .rank-number {
      min-width: 30px;
    }
    
    .refresh-button {
      padding: 8px 16px;
      border-radius: 15px;
    }
    
    .loading, .error, .empty {
      padding: 20px 15px;
      border-radius: 12px;
    }
  }
</style>