<script>
// @ts-nocheck

  import { createEventDispatcher, onMount } from 'svelte';
  import { GAME_CONFIG } from '../utils/GameConfig.js';
  import { StorageService } from '../services/StorageService.js';
  import { AudioService } from '../services/AudioService.js';
  import { SnakeStyles } from '../game/SnakeStyles.js';
  import { getThemeNames, getTheme, applyTheme, getCanvasThemeNames, applyCanvasTheme, getSavedCanvasTheme } from '../config/themes.js';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Props
  export let settings = StorageService.loadSettings();
  export let gamePaused = false;
  
  // Canvas theme state
  let canvasTheme = getSavedCanvasTheme();
  
  // Audio settings state
  let volume = AudioService.getVolume() * 100; // Convert to percentage for slider
  let musicMuted = AudioService.musicMuted;
  let musicVolume = AudioService.musicVolume * 100; // Convert to percentage for slider
  
  // Handle settings change
  function handleSettingsChange() {
    StorageService.saveSettings(settings);
    dispatch('settingsChange', settings);
  }
  
  // Handle sound toggle
  function handleSoundToggle() {
    AudioService.playButtonClickSound();
    settings.soundEnabled = !settings.soundEnabled;
    AudioService.setMuted(!settings.soundEnabled);
    handleSettingsChange();
  }
  
  // Handle game mode change
  function handleGameModeChange(event) {
    settings.gameMode = event.target.value;
    handleSettingsChange();
  }
  
  // Handle difficulty change
  function handleDifficultyChange(event) {
    settings.difficulty = event.target.value;
    handleSettingsChange();
  }
  
  // Handle snake style change
  function handleSnakeStyleChange(event) {
    settings.snakeStyle = event.target.value;
    handleSettingsChange();
  }
  
  // Handle theme change
  function handleThemeChange(event) {
    settings.theme = event.target.value;
    const theme = getTheme(settings.theme);
    applyTheme(theme);
    handleSettingsChange();
  }
  
  // Handle canvas theme change
  function handleCanvasThemeChange(event) {
    canvasTheme = event.target.value;
    applyCanvasTheme(canvasTheme);
  }
  
  // Handle volume change
  function handleVolumeChange(event) {
    volume = event.target.value;
    AudioService.setVolume(volume / 100); // Convert percentage back to 0-1 range
    // Update CSS custom property for progress bar
    event.target.style.setProperty('--slider-progress', `${volume}%`);
  }
  
  // Handle music toggle
  function handleMusicToggle() {
    AudioService.playButtonClickSound();
    musicMuted = AudioService.toggleMusicMute();
  }
  
  // Handle music volume change
  function handleMusicVolumeChange(event) {
    musicVolume = event.target.value;
    AudioService.setMusicVolume(musicVolume / 100); // Convert percentage back to 0-1 range
    // Update CSS custom property for progress bar
    event.target.style.setProperty('--music-slider-progress', `${musicVolume}%`);
  }
  
  // Initialize slider progress on mount
  onMount(() => {
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
      volumeSlider.style.setProperty('--slider-progress', `${volume}%`);
    }
    const musicSlider = document.querySelector('.music-slider');
    if (musicSlider) {
      musicSlider.style.setProperty('--music-slider-progress', `${musicVolume}%`);
    }
  })
  
  // Handle back to menu
  function handleBackToMenu() {
    AudioService.playButtonClickSound();
    dispatch('back');
  }
</script>

<div class="settings-container">
  <h2>Settings</h2>
  
  {#if !gamePaused}
    <!-- Full settings for main menu -->
    <div class="setting-item">
      <label for="gameMode">Game Mode:</label>
      <select id="gameMode" bind:value={settings.gameMode} on:change={handleGameModeChange}>
        {#each GAME_CONFIG.gameModes as mode}
          <option value={mode.id}>{mode.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="setting-item">
      <label for="difficulty">Difficulty:</label>
      <select id="difficulty" bind:value={settings.difficulty} on:change={handleDifficultyChange}>
        {#each GAME_CONFIG.difficultyLevels as level}
          <option value={level.id}>{level.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="setting-item">
      <label for="snakeStyle">Snake Style:</label>
      <select id="snakeStyle" bind:value={settings.snakeStyle} on:change={handleSnakeStyleChange}>
        {#each SnakeStyles.getStyleNames() as style}
          <option value={style.id}>{style.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="setting-item">
      <label for="canvasTheme">Canvas Theme:</label>
      <select id="canvasTheme" bind:value={canvasTheme} on:change={handleCanvasThemeChange}>
        {#each getCanvasThemeNames() as theme}
          <option value={theme.id}>{theme.name}</option>
        {/each}
      </select>
    </div>
  {/if}
  
  <!-- Sound settings (available in both main menu and pause menu) -->
  <div class="setting-item">
    <label for="sound">Sound Effects:</label>
    <button 
      class="toggle-button {settings.soundEnabled ? 'on' : 'off'}" 
      on:click={handleSoundToggle}
    >
      {settings.soundEnabled ? 'On' : 'Off'}
    </button>
  </div>
  
  <div class="setting-item">
    <label for="volume">Volume: {Math.round(volume)}%</label>
    <input 
      type="range" 
      id="volume" 
      min="0" 
      max="100" 
      step="5" 
      bind:value={volume} 
      on:input={handleVolumeChange}
      class="volume-slider"
      disabled={!settings.soundEnabled}
    />
  </div>
  
  <div class="setting-item">
    <label for="music">Background Music:</label>
    <button 
      class="toggle-button {!musicMuted ? 'on' : 'off'}" 
      on:click={handleMusicToggle}
    >
      {!musicMuted ? 'On' : 'Off'}
    </button>
  </div>
  
  <div class="setting-item">
    <label for="musicVolume">Music Volume: {Math.round(musicVolume)}%</label>
    <input 
      type="range" 
      id="musicVolume" 
      min="0" 
      max="100" 
      step="5" 
      bind:value={musicVolume} 
      on:input={handleMusicVolumeChange}
      class="music-slider"
      disabled={musicMuted}
    />
  </div>
  
  <button class="menu-button back-button" on:click={handleBackToMenu}>
    Back to Menu
  </button>
</div>

<style>
  .settings-container {
    display: flex;
    flex-direction: column;
    /* gap: 15px; */;
    /* height: 500px; */
    background: 
      linear-gradient(135deg, #FFF2EF 0%, #F2E6D9 100%);
    min-width: 30vw;
    max-width: min(100vw, 100vh, 30vw);
    max-height: 80vh;
    overflow: hidden;
    overflow-y: auto;
    border-radius: 20px;
    padding: 15px;
    border: 1px solid #FFF2EF;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #F7A5A5;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #ce8686;
    }
  }
  
  h2 {
    font-size: clamp(
      calc(var(--zoom-adaptive-xl) * 0.9),
      calc(2vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-2xl) * 1.1)
    );
    margin-bottom: 25px;
    color: #5D688A;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    text-shadow: 0 0 20px #5d688a59;
    letter-spacing: calc(1px * var(--zoom-font-scale));
    text-align: center;
  }
  
  .setting-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* gap: 10px; */
    margin-bottom: 5px;
    padding: 10px;
    background: #ffdbb68c;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .setting-item label {
    font-weight: 700;
    font-family: 'Orbitron', sans-serif;
    color: #5d688a8c;
    margin-bottom: 8px;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(2.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 1.0)
    );
    letter-spacing: calc(0.5px * var(--zoom-font-scale));
  }
  
  .setting-item select {
    padding: 10px 10px;
    border-radius: 15px;
    border: 2px solid #f7a5a586;
    background: #f7a5a52c;
    color: #5D688A;
    font-family: 'Orbitron', sans-serif;
    font-weight: 500;
    width: 100%;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.8),
      calc(2vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.95)
    );
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  .setting-item select:focus {
    outline: none;
    border-color: #F7A5A5;
    box-shadow: 0 0 20px #F7A5A5;
  }
  
  .setting-item select option {
    background: #f7a5a52c;
    color: #5D688A;
    padding: 10px;
  }
  
  .toggle-button {
    padding: calc(8px * var(--zoom-font-scale)) calc(20px * var(--zoom-font-scale));
    border-radius: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.8),
      calc(1vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.95)
    );
    font-family: 'Orbitron', sans-serif;
  }
  
  .toggle-button.on {
    background-color: #F7A5A5;
    color: white;
  }
  
  .toggle-button.off {
    background-color: #7a7a7a86;
    color: white;
  }
  
  .volume-slider {
    width: 100%;
    height: 12px;
    border-radius: 20px;
    background: linear-gradient(90deg, #f7a5a52c 0%, #ffdbb652 100%);
    outline: none;
    border: 2px solid #f7a5a586;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .volume-slider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--slider-progress, 50%);
    background: linear-gradient(90deg, #F7A5A5 0%, #FF8A95 50%, #F7A5A5 100%);
    border-radius: 20px;
    transition: width 0.2s ease;
    z-index: 1;
  }
  
  .volume-slider:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(247, 165, 165, 0.3);
    border-color: #F7A5A5;
  }
  
  .volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F7A5A5 0%, #FF8A95 50%, #F7A5A5 100%);
    cursor: pointer;
    box-shadow: 
      0 0 15px rgba(247, 165, 165, 0.6),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 
      0 0 25px rgba(247, 165, 165, 0.8),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    background: linear-gradient(135deg, #FF8A95 0%, #F7A5A5 50%, #FF8A95 100%);
  }
  
  .volume-slider::-webkit-slider-thumb:active {
    transform: scale(1.05);
    box-shadow: 
      0 0 20px rgba(247, 165, 165, 0.9),
      0 2px 6px rgba(0, 0, 0, 0.4);
  }
  
  .volume-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F7A5A5 0%, #FF8A95 50%, #F7A5A5 100%);
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 0 15px rgba(247, 165, 165, 0.6),
      0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .volume-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 
      0 0 25px rgba(247, 165, 165, 0.8),
      0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .volume-slider::-moz-range-track {
    background: transparent;
    border: none;
    height: 12px;
  }
  
  .volume-slider:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .volume-slider:disabled::before {
    background: linear-gradient(90deg, #7a7a7a86 0%, #6a6a6a86 100%);
  }
  
  .volume-slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
    background: linear-gradient(135deg, #7a7a7a86 0%, #6a6a6a86 100%);
    box-shadow: none;
    transform: none;
    border-color: rgba(122, 122, 122, 0.3);
  }
  
  .volume-slider:disabled::-moz-range-thumb {
    background: linear-gradient(135deg, #7a7a7a86 0%, #6a6a6a86 100%);
    box-shadow: none;
    border-color: rgba(122, 122, 122, 0.3);
  }
  
  /* Music slider styles (duplicate of volume slider) */
  .music-slider {
    width: 100%;
    height: 12px;
    border-radius: 8px;
    background: linear-gradient(90deg, #E8D5C4 0%, #F2E6D9 100%);
    outline: none;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(93, 104, 138, 0.2);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(255, 255, 255, 0.8);
  }
  
  .music-slider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--music-slider-progress, 50%);
    background: linear-gradient(90deg, #F7A5A5 0%, #E8A5C4 100%);
    border-radius: 8px;
    transition: width 0.2s ease;
    box-shadow: 
      0 0 8px rgba(247, 165, 165, 0.4),
      inset 0 1px 2px rgba(255, 255, 255, 0.3);
  }
  
  .music-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F7A5A5 0%, #E8A5C4 100%);
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 0 15px rgba(247, 165, 165, 0.6),
      0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
  }
  
  .music-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 
      0 0 25px rgba(247, 165, 165, 0.8),
      0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .music-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F7A5A5 0%, #E8A5C4 100%);
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 0 15px rgba(247, 165, 165, 0.6),
      0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .music-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 
      0 0 25px rgba(247, 165, 165, 0.8),
      0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .music-slider::-moz-range-track {
    background: transparent;
    border: none;
    height: 12px;
  }
  
  .music-slider:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .music-slider:disabled::before {
    background: linear-gradient(90deg, #7a7a7a86 0%, #6a6a6a86 100%);
  }
  
  .music-slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
    background: linear-gradient(135deg, #7a7a7a86 0%, #6a6a6a86 100%);
    box-shadow: none;
    transform: none;
    border-color: rgba(122, 122, 122, 0.3);
  }
  
  .music-slider:disabled::-moz-range-thumb {
    background: linear-gradient(135deg, #7a7a7a86 0%, #6a6a6a86 100%);
    box-shadow: none;
    border-color: rgba(122, 122, 122, 0.3);
  }
  
  .menu-button {
    background: linear-gradient(45deg, #F7A5A5, #F7A5A5);
    color: #FFF2EF;
    border: none;
    min-height: 50px;
    /* padding-block: .8em; */
    /* padding: 15px 15px 30px 15px; */
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(1vw * var(--zoom-font-scale)),
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
      0 4px 15px rgba(247, 165, 165, 0.3),
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
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .menu-button:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 8px 25px rgba(0, 255, 136, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  .menu-button:hover::before {
    left: 100%;
  }
  
  .menu-button:active {
    transform: translateY(-1px);
  }
  
  .back-button {
    background: linear-gradient(45deg, #666, #888);
    margin-top: 15px;
  }
  
  .back-button:hover {
    box-shadow: 
      0 8px 25px rgba(136, 136, 136, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .setting-item {
      padding: 12px;
      margin-bottom: 15px;
    }
    
    .menu-button {
      padding: calc(12px * var(--zoom-font-scale)) calc(20px * var(--zoom-font-scale));
    }
  }
  
  @media (max-width: 480px) {
    .menu-button {
      padding: calc(10px * var(--zoom-font-scale)) calc(16px * var(--zoom-font-scale));
      border-radius: 20px;
    }
    
    .setting-item {
      padding: 10px;
    }
    
    .setting-item select {
      padding: calc(10px * var(--zoom-font-scale)) calc(12px * var(--zoom-font-scale));
      border-radius: 12px;
    }
  }
</style>