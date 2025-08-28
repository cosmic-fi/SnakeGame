<script>
  import { onMount, onDestroy } from 'svelte';
  import { GAME_CONFIG } from '../config.js';

  export let gameEngine = null;
  
  let activeBuffs = [];
  let updateInterval;
  
  // Update active buffs display
  function updateBuffs() {
    if (!gameEngine || !gameEngine.activeBuffs) {
      activeBuffs = [];
      return;
    }
    
    const now = Date.now();
    activeBuffs = Object.entries(gameEngine.activeBuffs)
      .filter(([type, buff]) => buff.active && buff.endTime > now)
      .map(([type, buff]) => {
        const timeLeft = Math.max(0, buff.endTime - now);
        const maxDuration = getBuffMaxDuration(type);
        return {
          type: type,
          timeLeft: timeLeft,
          maxDuration: maxDuration,
          percentage: (timeLeft / maxDuration) * 100
        };
      });
  }
  
  // Get buff max duration based on type
  function getBuffMaxDuration(buffType) {
    const durations = {
      speedBoost: 5000,
      doublePoints: 8000,
      invincible: 3000,
      timeFreeze: 4000
    };
    return durations[buffType] || 5000;
  }
  
  // Get buff display info
  function getBuffInfo(buffType) {
    const buffInfo = {
      speedBoost: { name: 'Speed Boost', color: '#FF6B35', icon: '⚡' },
      doublePoints: { name: 'Double Points', color: '#FFD23F', icon: '💰' },
      invincible: { name: 'Invincible', color: '#06FFA5', icon: '🛡️' },
      timeFreeze: { name: 'Time Freeze', color: '#4ECDC4', icon: '❄️' }
    };
    
    return buffInfo[buffType] || { name: buffType, color: '#666', icon: '?' };
  }
  
  // Format time display
  function formatTime(seconds) {
    return (seconds / 1000).toFixed(1) + 's';
  }
  
  onMount(() => {
    // Update buffs every 100ms for smooth countdown
    updateInterval = setInterval(updateBuffs, 100);
  });
  
  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<div class="buff-panel">
  <h3>Active Buffs</h3>
  
  {#if activeBuffs.length === 0}
    <div class="no-buffs">
      <span class="no-buffs-icon">💊</span>
      <p>No active buffs</p>
    </div>
  {:else}
    <div class="buffs-list">
      {#each activeBuffs as buff (buff.type)}
        {@const buffInfo = getBuffInfo(buff.type)}
        <div class="buff-item" style="border-left-color: {buffInfo.color}">
          <div class="buff-header">
            <span class="buff-icon">{buffInfo.icon}</span>
            <span class="buff-name">{buffInfo.name}</span>
          </div>
          <div class="buff-duration">
            <span class="time-left">{formatTime(buff.timeLeft)}</span>
            <div class="duration-bar">
              <div 
                class="duration-fill" 
                style="width: {buff.percentage}%; background-color: {buffInfo.color}"
              ></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  <div class="buff-info">
    <h4>Power-Up Guide</h4>
    <div class="buff-legend">
      <div class="legend-item speed-boost">
        <div class="legend-header">
          <img src="../buff_speed_boost.png" alt="SB" class="buff-image">
          <span class="legend-title">Speed Boost</span>
          <span class="legend-duration">5s</span>
        </div>
        <div class="legend-description">
          Increases movement speed by 30%. Perfect for quick escapes and aggressive plays.
        </div>
        <div class="legend-points">+15 points</div>
      </div>
      
      <div class="legend-item double-points">
        <div class="legend-header">
          <img src="../buff_double_points.png" alt="DBP" class="buff-image">
          <span class="legend-title">Double Points</span>
          <span class="legend-duration">8s</span>
        </div>
        <div class="legend-description">
          Doubles all score gains from food and other buffs. Stack with other buffs for massive scores!
        </div>
        <div class="legend-points">+20 points</div>
      </div>
      
      <div class="legend-item mega-food">
        <div class="legend-header">
          <img src="../buff_mega_food.png" alt="MF" class="buff-image">
          <span class="legend-title">Mega Food</span>
          <span class="legend-duration">Instant</span>
        </div>
        <div class="legend-description">
          Instantly grows your snake by 3 segments. High risk, high reward!
        </div>
        <div class="legend-points">+50 points</div>
      </div>
      
      <div class="legend-item invincible">
        <div class="legend-header">
          <img src="../buff_invincible.png" alt="I" class="buff-image">
          <span class="legend-title">Invincible</span>
          <span class="legend-duration">3s</span>
        </div>
        <div class="legend-description">
          Become immune to collisions. Pass through walls and your own body safely.
        </div>
        <div class="legend-points">+30 points</div>
      </div>
      
      <div class="legend-item time-freeze">
        <div class="legend-header">
          <img src="../buff_time_freeze.png" alt="TF" class="buff-image">
          <span class="legend-title">Time Freeze</span>
          <span class="legend-duration">4s</span>
        </div>
        <div class="legend-description">
          Slows down time by 50%. Great for precise movements and planning your next move.
        </div>
        <div class="legend-points">+25 points</div>
      </div>
    </div>
    
    <div class="buff-tips">
      <h5>💡 Pro Tips</h5>
      <ul>
        <li>Combine Double Points with other buffs for maximum score</li>
        <li>Use Invincible to escape tight situations</li>
        <li>Time Freeze helps with precise navigation</li>
        <li>Buffs spawn randomly - collect them quickly!</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .buff-panel {
    background: #fff2ef8f;
    border: 1px solid #fff2ef8f;
    border-radius: 12px;
    padding: 20px;
    max-width: 20vw;
    height: fit-content;
    max-height: calc(100vh - 50px);
    overflow-y: auto;
    font-family: inherit;
    color: #5D688A;
  }
  
  h3 {
    margin: 0 0 16px 0;
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
  
  .no-buffs {
    text-align: center;
    padding: 40px 20px;
    color: #5d688aa8;
  }
  
  .no-buffs-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .no-buffs p {
    margin: 0;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(2.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 1.1)
    );
    font-style: italic;
  }
  
  .buffs-list {
    margin-bottom: 24px;
  }
  
  .buff-item {
    background: #FFF2EF;
    border-left: 4px solid #F7A5A5;
    border-radius: 0 8px 8px 0px;
    padding: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
  }
  
  .buff-item:hover {
    background: #FFF2EF;
    transform: translateX(2px);
  }
  
  .buff-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .buff-icon {
    font-size: 20px;
    margin-right: 8px;
    width: 24px;
    text-align: center;
  }
  
  .buff-name {
    font-weight: bold;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(2.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 1.1)
    );
    flex: 1;
  }
  
  .buff-duration {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .time-left {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.8),
      calc(2vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 1.0)
    );
    color: #5d688a83;
    min-width: 40px;
  }
  
  .duration-bar {
    flex: 1;
    height: 6px;  
    background: #FFD6D3;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .duration-fill {
    height: 100%;
    transition: width 0.1s ease;
    border-radius: 3px;
  }
  
  .buff-info {
    border-top: 1px solid #444;
    padding-top: 16px;
  }
  
  .buff-image{
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #7b88af 0%, #596685 100%);
    object-fit: cover;
    border-radius: 5px;
  }
  h4 {
    margin: 0 0 12px 0;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.9),
      calc(2.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 1.1)
    );
    color: #5D688A;
    text-transform: uppercase;
    letter-spacing: calc(0.5px * var(--zoom-font-scale));
  }
  
  .buff-legend {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .legend-item {
    background: #ffdbb6c2;
    border: 1px solid #5d688a59;
    border-radius: 0 8px 8px 0px;
    padding: 12px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }
  
  .legend-item:hover {
    background: #ffdbb6c2;
    border-color: #5d688a96;
  }
  
  .legend-header {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }
  
  .legend-icon {
    font-size: 16px;
    margin-right: 8px;
    width: 20px;
    text-align: center;
  }
  
  .legend-title {
    font-weight: bold;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.8),
      calc(2vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 1.0)
    );
    color: #5D688A;
    flex: 1;
  }
  
  .legend-duration {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.7),
      calc(1.8vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.9)
    );
    color: #b66c6c;
    background: #f7a5a580;
    padding: calc(2px * var(--zoom-font-scale)) calc(6px * var(--zoom-font-scale));
    border-radius: 4px;
  }
  
  .legend-description {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.7),
      calc(1.8vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.9)
    );
    color: #5d688acc;
    line-height: 1.4;
    margin-bottom: 6px;
  }
  
  .legend-points {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.7),
      calc(1.8vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.9)
    );
    color: #c28080;
    font-weight: bold;
  }
  
  /* Buff type specific colors */
  .legend-item.speed-boost {
    border-left: 3px solid #FF6B35;
  }
  
  .legend-item.double-points {
    border-left: 3px solid #ffcb1f;
  }
  
  .legend-item.mega-food {
    border-left: 3px solid #06FFA5;
  }
  
  .legend-item.invincible {
    border-left: 3px solid #B19CD9;
  }
  
  .legend-item.time-freeze {
    border-left: 3px solid #00D4FF;
  }
  
  .buff-tips {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #5d688a4f;
  }
  
  .buff-tips h5 {
    margin: 0 0 8px 0;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.75),
      calc(1.9vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.95)
    );
    color: #5D688A;
    text-transform: uppercase;
    letter-spacing: calc(0.5px * var(--zoom-font-scale));
  }
  
  .buff-tips ul {
    margin: 0;
    padding-left: 16px;
    list-style: none;
  }
  
  .buff-tips li {
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.65),
      calc(1.6vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-small) * 0.85)
    );
    color: #5d688acc;
    line-height: 1.4;
    margin-bottom: 4px;
    position: relative;
  }
  
  .buff-tips li:before {
    content: '»';
    color: #c28080;
    position: absolute;
    left: -12px;
  }
  
  /* Scrollbar styling */
  .buff-panel::-webkit-scrollbar {
    width: 6px;
  }
  
  .buff-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .buff-panel::-webkit-scrollbar-thumb {
    background: #F7A5A5;
    border-radius: 3px;
  }
  
  .buff-panel::-webkit-scrollbar-thumb:hover {
    background: #ce8686;
  }
</style>