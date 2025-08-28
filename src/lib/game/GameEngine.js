/**
 * GameEngine.js
 * Core game logic for the Snake Game
 */

import { GAME_CONFIG } from '../utils/GameConfig.js';
import { Snake } from './Snake.js';
import { FoodManager } from './Food.js';
import { BuffManager } from './BuffManager.js';
import { Renderer } from './Renderer.js';
import { AudioService } from '../services/AudioService.js';

export class GameEngine {
  constructor(canvas, options = {}) {
    // Canvas and context
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game configuration
    this.gridSize = options.gridSize || 20;
    this.tileCount = options.tileCount || 25;
    this.gameMode = options.gameMode || 'border'; // 'border' or 'wrap'
    
    // Game objects
    this.snake = new Snake({
      initialPosition: { x: 12, y: 12 },
      initialDirection: { dx: 1, dy: 0 }
    });
    
    this.foodManager = new FoodManager({
      tileCount: this.tileCount,
      snake: this.snake
    });
    
    this.buffManager = new BuffManager({
      tileCount: this.tileCount,
      snake: this.snake,
      foodManager: this.foodManager
    });
    
    // Set buffManager reference in foodManager for position checking
    this.foodManager.buffManager = this.buffManager;
    
    this.renderer = new Renderer(this.canvas, {
      gridSize: this.gridSize,
      tileCount: this.tileCount
    });
    
    // Game state
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameStartTime = 0;
    this.gameTime = 0;
    this.pausedTime = 0;
    this.score = 0;
    this.gameOverState = {
      isGameOver: false,
      title: '',
      message: '',
      showStartPrompt: false
    };
    
    // Active buff effects
    this.activeBuffs = {
      speedBoost: { active: false, endTime: 0 },
      doublePoints: { active: false, endTime: 0 },
      invincible: { active: false, endTime: 0 },
      timeFreeze: { active: false, endTime: 0 }
    };
    this.baseSpeed = 150; // Base game speed in ms
    this.currentSpeed = this.baseSpeed;
    
    // Event callbacks
    this.onGameOver = options.onGameOver || (() => {});
    this.onScoreChange = options.onScoreChange || (() => {});
    this.onGameTimeUpdate = options.onGameTimeUpdate || (() => {});
    
    // Bind methods
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
    this.startGame = this.startGame.bind(this);
    this.pauseGame = this.pauseGame.bind(this);
    this.resumeGame = this.resumeGame.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
    
    // Listen for canvas theme changes
    this.setupCanvasThemeListener();
  }
  
  /**
   * Initialize the game
   */
  init() {
    // Set up event listeners
    document.addEventListener('keydown', this.handleKeyPress);
    this.canvas.addEventListener('click', this.handleCanvasClick);
    
    // Initialize audio
    AudioService.init();
    
    // Initial draw
    this.resetGame();
    this.draw();
  }
  
  /**
   * Game loop method
   */
  gameLoop() {
    if (!this.gameRunning || this.gamePaused) return;
    
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    
    // Update at current game speed
    if (deltaTime >= this.currentSpeed) {
      this.update();
      this.updateGameTime();
      this.lastUpdateTime = now;
    }
    
    this.draw();
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Start a new game
   */
  startGame() {
    if (this.gameRunning) return;
    
    this.resetGame();
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.gameOverState.isGameOver = false;
    this.lastUpdateTime = Date.now();
    
    // Start game loop with requestAnimationFrame
    this.cancelGameLoop();
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  }
  
  /**
   * Pause the game
   */
  pauseGame() {
    if (!this.gameRunning || this.gamePaused) return;
    
    this.gamePaused = true;
    this.pauseStartTime = Date.now();
    
    // Clear the game loop but keep gameRunning true
    this.cancelGameLoop();
  }
  
  /**
   * Resume the game
   */
  resumeGame() {
    if (!this.gameRunning || !this.gamePaused) return;
    
    // Add paused time to total paused time
    this.pausedTime += Date.now() - this.pauseStartTime;
    this.gamePaused = false;
    this.lastUpdateTime = Date.now();
    
    // Restart the game loop
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  }
  
  /**
   * Reset the game state
   */
  resetGame() {
    this.snake.reset({
      initialPosition: { x: 12, y: 12 },
      initialDirection: { dx: 1, dy: 0 }
    });
    
    this.foodManager.reset();
    this.buffManager.reset();
    this.score = 0;
    this.gameTime = 0;
    this.pausedTime = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    
    // Reset buff effects
    this.activeBuffs = {
      speedBoost: { active: false, endTime: 0 },
      doublePoints: { active: false, endTime: 0 },
      invincible: { active: false, endTime: 0 },
      timeFreeze: { active: false, endTime: 0 }
    };
    this.currentSpeed = this.baseSpeed;
    
    // Reset game over state with a welcome message
    this.gameOverState = {
      isGameOver: true,
      title: 'Snake Game',
      message: 'Press Space or click to start!',
      showStartPrompt: true
    };
    
    // Notify score change
    this.onScoreChange(this.score);
    
    // Draw the initial state
    this.draw();
  }
  
  /**
   * Update game state
   */
  update() {
    if (!this.gameRunning || this.gamePaused) return;
    
    // Update snake animation
    this.snake.updateAnimation(16); // Assuming ~60fps (16ms per frame)
    
    // Update snake position
    const result = this.snake.move(this.gameMode, this.tileCount);
    
    // Check for collisions (unless invincible)
    if (result.collision && !this.activeBuffs.invincible.active) {
      this.gameOver();
      return;
    }
    
    // Check if snake ate food
    const foodEaten = this.foodManager.checkFoodCollision(this.snake.body[0]);
    if (foodEaten) {
      // Grow snake
      this.snake.grow();
      
      // Update score
      this.score += foodEaten.points || 1;
      this.onScoreChange(this.score);
      
      // Play sound
      AudioService.playEatSound();
      
      // Ensure food exists on the board
      this.foodManager.ensureFoodExists(this.snake.body);
      
      // Try to spawn a buff when food is eaten
      this.buffManager.trySpawnBuff('food');
    }
    
    // Check if snake ate a buff
    const buffEaten = this.buffManager.checkBuffCollision(this.snake.body[0]);
    if (buffEaten) {
      this.applyBuffEffect(buffEaten);
      AudioService.playPowerUpSound();
    }
    
    // Update buff states
    this.buffManager.update();
    this.updateBuffEffects();
    
    // Safety check: ensure food always exists on the board
    this.foodManager.ensureFoodExists(this.snake.body);
  }
  
  /**
   * Apply buff effect to the game
   */
  applyBuffEffect(buff) {
    const now = Date.now();
    let points = buff.points || 0;
    
    // Apply double points multiplier if active
    if (this.activeBuffs.doublePoints.active) {
      points *= 2;
    }
    
    // Add buff points to score
    this.score += points;
    this.onScoreChange(this.score);
    
    // Apply buff effects based on type
    switch (buff.effect) {
      case 'speed':
        this.activeBuffs.speedBoost.active = true;
        this.activeBuffs.speedBoost.endTime = now + buff.duration;
        this.currentSpeed = this.baseSpeed * 0.7; // 30% faster
        this.updateGameSpeed();
        break;
        
      case 'double_score':
        this.activeBuffs.doublePoints.active = true;
        this.activeBuffs.doublePoints.endTime = now + buff.duration;
        break;
        
      case 'mega_growth':
        // Grow snake multiple times
        for (let i = 0; i < 3; i++) {
          this.snake.grow();
        }
        break;
        
      case 'invincible':
        this.activeBuffs.invincible.active = true;
        this.activeBuffs.invincible.endTime = now + buff.duration;
        break;
        
      case 'time_freeze':
        this.activeBuffs.timeFreeze.active = true;
        this.activeBuffs.timeFreeze.endTime = now + buff.duration;
        this.currentSpeed = this.baseSpeed * 2; // 50% slower
        this.updateGameSpeed();
        break;
    }
  }
  
  /**
   * Update active buff effects
   */
  updateBuffEffects() {
    const now = Date.now();
    let speedChanged = false;
    
    // Check each buff for expiration
    Object.keys(this.activeBuffs).forEach(buffType => {
      const buff = this.activeBuffs[buffType];
      if (buff.active && now > buff.endTime) {
        buff.active = false;
        buff.endTime = 0;
        
        // Handle speed-related buff expiration
        if (buffType === 'speedBoost' || buffType === 'timeFreeze') {
          speedChanged = true;
        }
      }
    });
    
    // Update game speed if speed buffs changed
    if (speedChanged) {
      this.currentSpeed = this.baseSpeed;
      
      // Apply active speed effects
      if (this.activeBuffs.speedBoost.active) {
        this.currentSpeed *= 0.7; // 30% faster
      }
      if (this.activeBuffs.timeFreeze.active) {
        this.currentSpeed *= 2; // 50% slower
      }
      
      this.updateGameSpeed();
    }
  }
  
  /**
   * Update the game loop speed
   */
  updateGameSpeed() {
    // Speed is now controlled by the deltaTime logic in the main game loop
    // No need to restart the loop, just update currentSpeed
    // The main game loop will automatically use the new speed
  }
  
  /**
   * Update base speed based on difficulty
   */
  updateDifficulty(difficultyId) {
    const difficultyLevel = GAME_CONFIG.difficultyLevels.find(
      level => level.id === difficultyId
    );
    
    if (difficultyLevel) {
      // Map FPS to speed (higher FPS = lower delay = faster game)
      // Easy: 10 FPS = 200ms, Medium: 15 FPS = 150ms, Hard: 20 FPS = 100ms
      this.baseSpeed = Math.round(1000 / difficultyLevel.fps * 1.5);
      
      // Reset current speed to base speed (unless buffs are active)
      this.currentSpeed = this.baseSpeed;
      
      // Reapply active speed buffs
      if (this.activeBuffs.speedBoost.active) {
        this.currentSpeed *= 0.7; // 30% faster
      }
      if (this.activeBuffs.timeFreeze.active) {
        this.currentSpeed *= 2; // 50% slower
      }
    }
  }
  
  /**
   * Update game time
   */
  updateGameTime() {
    if (this.gameRunning && !this.gamePaused) {
      this.gameTime = Math.floor((Date.now() - this.gameStartTime - this.pausedTime) / 1000);
      this.onGameTimeUpdate(this.gameTime);
    }
  }
  
  /**
   * Draw the game
   */
  draw() {
    // Clear canvas
    this.renderer.clearCanvas();
    
    // Draw grid
    this.renderer.drawGrid();
    
    // Draw food
    this.foodManager.draw(this.renderer);
    
    // Draw buffs
    this.buffManager.draw(this.renderer);
    
    // Draw snake (with invincibility effect if active)
    if (this.activeBuffs.invincible.active) {
      // Draw snake with flashing effect for invincibility
      const flashRate = 200; // Flash every 200ms
      const shouldShow = Math.floor(Date.now() / flashRate) % 2 === 0;
      if (shouldShow) {
        this.snake.draw(this.renderer);
      }
    } else {
      this.snake.draw(this.renderer);
    }
    
    // Draw game over overlay if game is over
    if (this.gameOverState.isGameOver) {
      this.renderer.drawGameOverOverlay(this.gameOverState);
    }
  }
  
  /**
   * Handle game over
   */
  gameOver() {
    this.gameRunning = false;
    this.cancelGameLoop();
    
    // Set game over state
    this.gameOverState = {
      isGameOver: true,
      title: 'Game Over!',
      message: `Final Score: ${this.score}`,
      showStartPrompt: true
    };
    
    // Draw final frame to prevent flickering
    this.draw();
    
    // Play game over sound
    AudioService.playGameOverSound();
    
    // Call game over callback
    this.onGameOver({
      score: this.score,
      gameTime: this.gameTime,
      snakeLength: this.snake.body.length
    });
  }
  
  /**
   * Handle keyboard input
   */
  handleKeyPress(event) {
    // Don't handle input if game is not running
    if (!this.gameRunning && event.code !== 'Space') return;
    
    // Start game with space
    if (event.code === 'Space' && (!this.gameRunning || this.gameOverState.isGameOver)) {
      this.startGame();
      return;
    }
    
    // Handle direction changes
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        if (this.snake.direction.dy !== 1) { // Not going down
          this.snake.setNextDirection(0, -1);
          AudioService.playMoveSound();
        }
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (this.snake.direction.dy !== -1) { // Not going up
          this.snake.setNextDirection(0, 1);
          AudioService.playMoveSound();
        }
        break;
      case 'ArrowLeft':
      case 'KeyA':
        if (this.snake.direction.dx !== 1) { // Not going right
          this.snake.setNextDirection(-1, 0);
          AudioService.playMoveSound();
        }
        break;
      case 'ArrowRight':
      case 'KeyD':
        if (this.snake.direction.dx !== -1) { // Not going left
          this.snake.setNextDirection(1, 0);
          AudioService.playMoveSound();
        }
        break;
    }
  }
  
  /**
   * Handle canvas click
   */
  handleCanvasClick() {
    if (!this.gameRunning || this.gameOverState.isGameOver) {
      this.startGame();
    }
  }
  
  /**
   * Change snake visual style
   */
  setSnakeStyle(styleId) {
    this.snake.setStyle(styleId);
  }
  
  /**
   * Get current snake style
   */
  getSnakeStyle() {
    return this.snake.styleId;
  }
  
  /**
   * Setup canvas theme change listener
   */
  setupCanvasThemeListener() {
    document.addEventListener('canvasThemeChanged', (event) => {
      // Force a redraw to apply new colors immediately
      this.draw();
    });
  }
  
  /**
   * Update renderer colors when theme changes
   */
  updateTheme() {
    if (this.renderer) {
      this.renderer.updateColors();
      // Redraw to apply new colors
      this.draw();
    }
  }
  
  /**
   * Cancel the game loop
   */
  cancelGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.cancelGameLoop();
    this.gameRunning = false;
    
    // Clean up buff manager
    if (this.buffManager) {
      this.buffManager.destroy();
    }
  }
}