<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { Renderer } from '../game/Renderer.js';

  let canvas;
  let renderer;
  let exportCanvas;
  let exportRenderer;
  
  // All buff types from BuffManager
  const buffTypes = [
    {
      name: 'speed_boost',
      color: '#FF6B35',
      secondaryColor: '#FF8E53',
      points: 15,
      duration: 5000,
      effect: 'speed',
      size: 0.9,
      shape: 'diamond',
      glowEffect: true,
      pulseEffect: true
    },
    {
      name: 'double_points',
      color: '#FFD23F',
      secondaryColor: '#FFE066',
      points: 20,
      duration: 8000,
      effect: 'double_score',
      size: 0.85,
      shape: 'star',
      glowEffect: true,
      sparkleEffect: true
    },
    {
      name: 'mega_food',
      color: '#06FFA5',
      secondaryColor: '#4FFFB0',
      points: 50,
      effect: 'mega_growth',
      size: 1.1,
      shape: 'hexagon',
      glowEffect: true,
      pulseEffect: true
    },
    {
      name: 'invincible',
      color: '#B19CD9',
      secondaryColor: '#C9B6E0',
      points: 30,
      duration: 3000,
      effect: 'invincible',
      size: 0.95,
      shape: 'shield',
      glowEffect: true,
      pulseEffect: true
    },
    {
      name: 'time_freeze',
      color: '#00D4FF',
      secondaryColor: '#33DDFF',
      points: 25,
      duration: 4000,
      effect: 'time_freeze',
      size: 0.9,
      shape: 'crystal',
      glowEffect: true,
      sparkleEffect: true
    }
  ];

  let selectedBuff = buffTypes[0];
  let animationFrame;
  let startTime = Date.now();

  onMount(() => {
    // Setup main canvas
    renderer = new Renderer(canvas, { gridSize: 24, tileCount: 25 });
    
    // Setup export canvas
    exportRenderer = new Renderer(exportCanvas, { gridSize: 25, tileCount: 8 });
    
    // Start animation loop
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  function animate() {
    if (!renderer) return;
    
    const now = Date.now();
    const elapsed = now - startTime;
    
    // Clear canvas
    renderer.clearCanvas();
    
    // Draw selected buff in center
    const centerX = 12;
    const centerY = 12;
    const buff = {
      x: centerX,
      y: centerY,
      ...selectedBuff,
      spawnTime: startTime
    };
    
    // Use the renderer's built-in drawBuff method with larger size
    renderer.drawBuff(buff, 2.5, 1, { pulse: true, glow: true });
    
    animationFrame = requestAnimationFrame(animate);
  }



  function selectBuff(buff) {
    selectedBuff = buff;
    startTime = Date.now();
  }

  function exportBuff(buff) {
    if (!exportRenderer) return;
    
    // Clear export canvas to transparent
    const ctx = exportCanvas.getContext('2d');
    ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // Draw buff in center of export canvas (3.5,3.5 is center for 8x8 grid)
    const centerBuff = {
      x: 3.5,
      y: 3.5,
      ...buff,
      spawnTime: Date.now()
    };
    
    exportRenderer.drawBuff(centerBuff, 2.5, 1, { pulse: true, glow: true });
    
    // Export as image
    const link = document.createElement('a');
    link.download = `buff_${buff.name}.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
  }

  function exportAllBuffs() {
    buffTypes.forEach((buff, index) => {
      setTimeout(() => {
        exportBuff(buff);
      }, index * 100);
    });
  }
</script>

<div class="buff-renderer">
  <h2>Buff Renderer - Development Tool</h2>
  
  <div class="controls">
    <div class="buff-selector">
      <h3>Select Buff Type:</h3>
      <div class="buff-buttons">
        {#each buffTypes as buff}
          <button 
            class="buff-button" 
            class:active={selectedBuff === buff}
            style="background-color: {buff.color}; border-color: {buff.secondaryColor}"
            on:click={() => selectBuff(buff)}
          >
            {buff.name.replace('_', ' ').toUpperCase()}
          </button>
        {/each}
      </div>
    </div>
    
    <div class="export-controls">
      <h3>Export Options:</h3>
      <button class="export-button" on:click={() => exportBuff(selectedBuff)}>
        Export Current Buff
      </button>
      <button class="export-all-button" on:click={exportAllBuffs}>
        Export All Buffs
      </button>
    </div>
  </div>
  
  <div class="canvas-container">
    <div class="main-canvas">
      <h3>Live Preview:</h3>
      <canvas bind:this={canvas} width="600" height="600"></canvas>
    </div>
    
    <div class="buff-info">
      <h3>Buff Details:</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Name:</strong> {selectedBuff.name.replace('_', ' ')}
        </div>
        <div class="info-item">
          <strong>Effect:</strong> {selectedBuff.effect}
        </div>
        <div class="info-item">
          <strong>Points:</strong> {selectedBuff.points}
        </div>
        <div class="info-item">
          <strong>Duration:</strong> {selectedBuff.duration ? selectedBuff.duration + 'ms' : 'Instant'}
        </div>
        <div class="info-item">
          <strong>Shape:</strong> {selectedBuff.shape}
        </div>
        <div class="info-item">
          <strong>Size:</strong> {selectedBuff.size}
        </div>
        <div class="info-item">
          <strong>Color:</strong> 
          <span class="color-swatch" style="background-color: {selectedBuff.color}"></span>
          {selectedBuff.color}
        </div>
        <div class="info-item">
          <strong>Secondary:</strong> 
          <span class="color-swatch" style="background-color: {selectedBuff.secondaryColor}"></span>
          {selectedBuff.secondaryColor}
        </div>
        <div class="info-item">
          <strong>Effects:</strong> 
          {selectedBuff.glowEffect ? 'Glow ' : ''}
          {selectedBuff.pulseEffect ? 'Pulse ' : ''}
          {selectedBuff.sparkleEffect ? 'Sparkle' : ''}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Hidden export canvas -->
  <canvas bind:this={exportCanvas} width="200" height="200" style="display: none;"></canvas>
</div>

<style>
  .buff-renderer {
    padding: 20px;
    background: #2a2a2a;
    color: white;
    border-radius: 10px;
    margin: auto;
    overflow: hidden;
    max-height: 66vh;
    overflow-y: auto;
  }
  
  .controls {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  
  .buff-selector {
    flex: 1;
    min-width: 300px;
  }
  
  .buff-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  
  .buff-button {
    padding: 8px 16px;
    border: 2px solid;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }
  
  .buff-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .buff-button.active {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(255,255,255,0.3);
  }
  
  .export-controls {
    flex: 1;
    min-width: 200px;
  }
  
  .export-button, .export-all-button {
    display: block;
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }
  
  .export-all-button {
    background: #FF9800;
  }
  
  .export-button:hover {
    background: #45a049;
  }
  
  .export-all-button:hover {
    background: #e68900;
  }
  
  .canvas-container {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  
  .main-canvas {
    flex: 1;
    min-width: 300px;
  }
  
  .main-canvas canvas {
    border: 2px solid #555;
    border-radius: 5px;
    background: #1a1a1a;
    max-width: 100%;
    height: auto;
  }
  
  .buff-info {
    flex: 1;
    min-width: 250px;
    background: #333;
    padding: 20px;
    border-radius: 5px;
  }
  
  .info-grid {
    display: grid;
    gap: 10px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    border: 1px solid #666;
    display: inline-block;
  }
  
  h2, h3 {
    margin-top: 0;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
    }
    
    .canvas-container {
      flex-direction: column;
    }
    
    .buff-buttons {
      justify-content: center;
    }
  }
</style>