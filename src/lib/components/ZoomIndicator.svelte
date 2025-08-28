<script>
  import { onMount } from 'svelte';
  import { zoomAdapter, onZoomChange } from '../utils/ZoomAdapter.js';
  
  export let show = false;
  
  let zoomLevel = 100;
  let zoomClass = 'zoom-normal';
  
  onMount(() => {
    // Get initial zoom level
    zoomLevel = zoomAdapter.getZoomPercentage();
    updateZoomClass();
    
    // Listen for zoom changes
    const unsubscribe = onZoomChange((newZoom) => {
      zoomLevel = Math.round(newZoom * 100);
      updateZoomClass();
    });
    
    return unsubscribe;
  });
  
  function updateZoomClass() {
    if (zoomLevel < 95) {
      zoomClass = 'zoom-out';
    } else if (zoomLevel > 105) {
      zoomClass = 'zoom-in';
    } else {
      zoomClass = 'zoom-normal';
    }
  }
  
  function getZoomDescription() {
    if (zoomLevel < 50) return 'Very Small';
    if (zoomLevel < 75) return 'Small';
    if (zoomLevel < 95) return 'Slightly Small';
    if (zoomLevel <= 105) return 'Normal';
    if (zoomLevel < 125) return 'Slightly Large';
    if (zoomLevel < 150) return 'Large';
    if (zoomLevel < 200) return 'Very Large';
    return 'Extremely Large';
  }
</script>

{#if show}
  <div class="zoom-indicator {zoomClass}" data-zoom={zoomLevel}>
    <div class="zoom-info">
      <div class="zoom-percentage">{zoomLevel}%</div>
      <div class="zoom-description">{getZoomDescription()}</div>
      <div class="zoom-status">
        {#if zoomLevel < 95}
          📤 Zoomed Out
        {:else if zoomLevel > 105}
          📥 Zoomed In
        {:else}
          ✅ Normal
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .zoom-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    z-index: 10000;
    pointer-events: none;
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
    min-width: 120px;
  }
  
  .zoom-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  
  .zoom-percentage {
    font-size: 16px;
    font-weight: bold;
    color: #00ff88;
  }
  
  .zoom-description {
    font-size: 10px;
    color: #ccc;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .zoom-status {
    font-size: 11px;
    margin-top: 2px;
  }
  
  .zoom-indicator.zoom-out {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
  
  .zoom-indicator.zoom-out .zoom-percentage {
    color: #ff6b6b;
  }
  
  .zoom-indicator.zoom-in {
    border-color: #4ecdc4;
    background: rgba(78, 205, 196, 0.1);
  }
  
  .zoom-indicator.zoom-in .zoom-percentage {
    color: #4ecdc4;
  }
  
  .zoom-indicator.zoom-normal {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
  }
  
  .zoom-indicator.zoom-normal .zoom-percentage {
    color: #00ff88;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .zoom-indicator {
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      font-size: 10px;
      min-width: 100px;
    }
    
    .zoom-percentage {
      font-size: 14px;
    }
    
    .zoom-description {
      font-size: 8px;
    }
    
    .zoom-status {
      font-size: 9px;
    }
  }
  
  /* Animation for zoom changes */
  @keyframes zoomPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .zoom-indicator {
    animation: zoomPulse 0.3s ease-in-out;
  }
</style>