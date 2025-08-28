<script>
  import { createEventDispatcher } from 'svelte';
  import { StorageService } from '../services/StorageService.js';
  import { AudioService } from '../services/AudioService.js';
  import Settings from './Settings.svelte';
  import Leaderboard from './Leaderboard.svelte';
  import packageJson from '../../../package.json';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Props
  export let playerName = '';
  export let settings = StorageService.loadSettings();
  export let gamePaused = false;
  
  // Local state
  let showSettings = false;
  let showLeaderboard = false;
  
  // Handle start game
  function handleStartGame() {
    AudioService.playButtonClickSound();
    dispatch('startGame');
  }
  
  // Handle resume game
  function handleResumeGame() {
    AudioService.playButtonClickSound();
    dispatch('resumeGame');
  }
  
  // Handle restart game
  function handleRestartGame() {
    AudioService.playButtonClickSound();
    dispatch('restartGame');
  }

  // Handle go to main menu
  function handleGoToMainMenu() {
    AudioService.playButtonClickSound();
    dispatch('goToMainMenu');
  }
  
  // Handle show settings
  function handleShowSettings() {
    AudioService.playButtonClickSound();
    showSettings = true;
    showLeaderboard = false;
  }
  
  // Handle show leaderboard
  function handleShowLeaderboard() {
    AudioService.playButtonClickSound();
    showLeaderboard = true;
    showSettings = false;
  }
  
  // Handle back to main menu
  function handleBackToMenu() {
    AudioService.playButtonClickSound();
    showSettings = false;
    showLeaderboard = false;
  }
  
  // Handle settings change from Settings component
  function handleSettingsChange(event) {
    settings = event.detail;
    StorageService.saveSettings(settings);
    dispatch('settingsChange', settings);
  }
</script>

<div class="menu-wrapper">

  <div class="main-menu">
    <div class="game-title-container">
      <h1 class="game-title">Snake Game</h1>
      <span class="game-title-owner">Cosmic-fi's</span>
      <span class="game-title-version">v{packageJson.version}</span>
    </div>
    
    <!-- Main Menu -->
    <div class="menu-content">
      {#if gamePaused}
        <p class="welcome">Game Paused</p>
        <button class="menu-button resume-button" on:click={handleResumeGame}>
          Resume Game
        </button>
        <button class="menu-button restart-button" on:click={handleRestartGame}>
          Restart Game
        </button>
        <button class="menu-button" on:click={handleShowSettings}>
          Settings
        </button>
        <button class="menu-button" on:click={handleGoToMainMenu}>
          Main Menu
        </button>
      {:else}
        <p class="welcome">Welcome, {playerName || 'Player'}!</p>
        <button class="menu-button" on:click={handleStartGame}>
          Start Game
        </button>
        <button class="menu-button" on:click={handleShowSettings}>
          Settings
        </button>
        <button class="menu-button" on:click={() => dispatch('showNameInput')}>
          Change Name
        </button>
      {/if}
    </div>
  </div>
  {#if showSettings}
    <div class="setting-overlay">
      <Settings 
        bind:settings={settings}
        {gamePaused}
        on:settingsChange={handleSettingsChange}
        on:back={handleBackToMenu}
      />
    </div>
  {/if}
  {#if !gamePaused}
    <div class="leaderboard">
      <Leaderboard 
          gameMode={settings.gameMode}
          on:back={handleBackToMenu}
        />
    </div>
  {/if}
</div>

<style>
  .menu-wrapper{
    width: 100%;
    height: 100%;
    display: flex;
    column-gap: 2vw;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .setting-overlay{
    background-color: #fff2ef75;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    z-index: 9999;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
  }
  .main-menu {
    /* width: 100%; */
    min-width: 500px;
    /* max-width: min(100vw, 100vh, 500px); */
    background: 
      linear-gradient(135deg, #FFF2EF 0%, #F2E6D9 100%);
    border-radius: 20px;
    border: 1px solid #FFF2EF;
    padding: 30px;
    color: #5D688A;
    text-align: center;
    backdrop-filter: blur(20px);
    position: relative;
    /* overflow: hidden; */
  }
  
  .main-menu::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 30%, #f7a5a56e 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, #f7a5a580 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }
  .leaderboard{
    top: 0;
    left: 100%;
    width: min(100vw, 100vh, 30vw);
    /* height: min(100vw, 100vh, 90vh); */
    overflow: hidden;
    padding: 10px;
    /* overflow-y: auto; */

    /* Scrollbar styling */
    background-color: #FFF2EF48;
    border-radius: 20px;
    border: 1px #fff2ef2c solid; 
    backdrop-filter: blur(3px);
  }
  .game-title-container{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  h1 {
    font-size: clamp(
      calc(var(--zoom-adaptive-2xl) * 0.8),
      calc(3vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-3xl) * 1.2)
    );
    margin-bottom: 25px;
    background: linear-gradient(45deg, #F7A5A5, #a35e5e);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
    animation: gradientShift 3s ease-in-out infinite;
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(247, 165, 165, 0.5);
    letter-spacing: calc(2px * var(--zoom-font-scale));
    position: relative;
  }
  .game-title-owner{
    position: absolute;
    top: -5px;
    font-size: clamp(
      calc(var(--zoom-adaptive-2xl) * 0.8),
      calc(.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-3xl) * 1.2)
    );
  }
  .game-title-version{
    position: absolute;
    bottom: 10px;
    right: 0;
    opacity: .8;
    font-size: clamp(
      calc(var(--zoom-adaptive-2xl) * 0.4),
      calc(.1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-3xl) * 1.2)
    );
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  

  
  .welcome {
    font-size: clamp(1rem, 3vw, 1.3rem);
    margin-bottom: 25px;
    color: #5D688A;
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 10px #5d688a44;
  }
  
  .menu-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .menu-button {
    background: linear-gradient(45deg, #F7A5A5, #f7b1b1);
    color: #5d688a;
    border: none;
    padding: calc(15px * var(--zoom-font-scale)) calc(25px * var(--zoom-font-scale));
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(2vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-medium) * 1.1)
    );
    font-weight: 700;
    font-family: 'Orbitron', sans-serif;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: calc(1px * var(--zoom-font-scale));
    box-shadow: 
      0 4px 15px #f7a5a57a,
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .menu-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #ffffff4d, transparent);
    transition: left 0.5s;
  }
  
  .menu-button:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 8px 25px #f7a5a57a,
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  .menu-button:hover::before {
    left: 100%;
  }
  
  .menu-button:active {
    transform: translateY(-1px);
  }
  
  .resume-button {
    background: linear-gradient(45deg, #00ccff, #0088ff);
  }
  
  .resume-button:hover {
    box-shadow: 
      0 8px 25px rgba(0, 204, 255, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  .restart-button {
    background: linear-gradient(45deg, #ff8800, #ffaa00);
  }
  
  .restart-button:hover {
    box-shadow: 
      0 8px 25px rgba(255, 136, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  

  

  
  /* Responsive design */
  @media (max-width: 768px) {
    .main-menu {
      padding: 25px 20px;
      max-width: 95vw;
    }
    
    .menu-content {
      gap: 12px;
    }
    
    .menu-button {
      padding: 12px 20px;
    }
    

  }
  
  @media (max-width: 480px) {
    .main-menu {
      padding: 20px 15px;
      border-radius: 15px;
    }
    
    .menu-button {
      padding: 10px 16px;
      border-radius: 20px;
    }
    

  }
  

</style>