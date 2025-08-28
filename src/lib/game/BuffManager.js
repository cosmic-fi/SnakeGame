/**
 * BuffManager.js
 * Handles buff/power-up generation and management separately from regular food
 */

export class BuffManager {
  constructor(options = {}) {
    this.tileCount = options.tileCount || 25;
    this.snake = options.snake;
    this.foodManager = options.foodManager;
    
    // Buff types with their properties
    this.buffTypes = [
      {
        name: 'speed_boost',
        color: '#FF6B35',
        secondaryColor: '#FF8E53',
        points: 15,
        duration: 5000, // 5 seconds
        effect: 'speed',
        probability: 0.3,
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
        duration: 8000, // 8 seconds
        effect: 'double_score',
        probability: 0.25,
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
        probability: 0.2,
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
        duration: 3000, // 3 seconds
        effect: 'invincible',
        probability: 0.15,
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
        duration: 4000, // 4 seconds
        effect: 'time_freeze',
        probability: 0.1,
        size: 0.9,
        shape: 'crystal',
        glowEffect: true,
        sparkleEffect: true
      }
    ];
    
    // Current buffs on the board
    this.buffs = [];
    
    // Statistics
    this.buffsCollected = 0;
    
    // Buff spawning settings
    this.spawnChance = 0.15; // 15% chance per food eaten
    this.maxBuffs = 2; // Maximum buffs on board at once
    this.minSpawnDelay = 3000; // Minimum 3 seconds between spawns
    this.maxSpawnDelay = 8000; // Maximum 8 seconds between spawns
    this.lastSpawnTime = 0;
    
    // Auto-spawn timer
    this.autoSpawnTimer = null;
    this.scheduleNextAutoSpawn();
  }
  
  /**
   * Reset buff state
   */
  reset() {
    this.buffs = [];
    this.buffsCollected = 0;
    this.lastSpawnTime = 0;
    if (this.autoSpawnTimer) {
      clearTimeout(this.autoSpawnTimer);
    }
    this.scheduleNextAutoSpawn();
  }
  
  /**
   * Schedule the next automatic buff spawn
   */
  scheduleNextAutoSpawn() {
    if (this.autoSpawnTimer) {
      clearTimeout(this.autoSpawnTimer);
    }
    
    const delay = this.minSpawnDelay + Math.random() * (this.maxSpawnDelay - this.minSpawnDelay);
    
    this.autoSpawnTimer = setTimeout(() => {
      this.trySpawnBuff('auto');
      this.scheduleNextAutoSpawn();
    }, delay);
  }
  
  /**
   * Try to spawn a buff (called when food is eaten or by auto-spawn)
   * @param {string} trigger - 'food' or 'auto'
   */
  trySpawnBuff(trigger = 'food') {
    const now = Date.now();
    
    // Check if we can spawn a buff
    if (this.buffs.length >= this.maxBuffs) return false;
    if (now - this.lastSpawnTime < this.minSpawnDelay) return false;
    
    // Different spawn chances for different triggers
    let spawnChance = this.spawnChance;
    if (trigger === 'auto') {
      spawnChance = 0.8; // Higher chance for auto-spawn
    }
    
    if (Math.random() > spawnChance) return false;
    
    return this.spawnBuff();
  }
  
  /**
   * Spawn a buff at a random position
   * @param {Array} snakeBody - The snake's body segments to avoid
   */
  spawnBuff(snakeBody = []) {
    // Get current snake body if not provided
    if (snakeBody.length === 0 && this.snake) {
      snakeBody = this.snake.body;
    }
    
    // Determine buff type based on probability
    const buffType = this.getRandomBuffType();
    
    // Find a valid position (not occupied by snake or food)
    let position;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      position = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      attempts++;
      
      if (attempts >= maxAttempts) break;
      
    } while (this.isPositionOccupied(position, snakeBody));
    
    // Create buff item
    const buff = {
      ...buffType,
      x: position.x,
      y: position.y,
      createdAt: Date.now(),
      expiresAt: Date.now() + (buffType.duration || 10000), // Default 10 seconds if no duration
      id: Math.random().toString(36).substr(2, 9) // Unique ID
    };
    
    // Add to buffs array
    this.buffs.push(buff);
    this.lastSpawnTime = Date.now();
    
    return buff;
  }
  
  /**
   * Get a random buff type based on probability
   */
  getRandomBuffType() {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const buffType of this.buffTypes) {
      cumulativeProbability += buffType.probability;
      if (rand < cumulativeProbability) {
        return buffType;
      }
    }
    
    // Fallback to first buff type
    return this.buffTypes[0];
  }
  
  /**
   * Check if a position is occupied by snake, food, or other buffs
   */
  isPositionOccupied(position, snakeBody) {
    // Check snake body
    for (const segment of snakeBody) {
      if (segment.x === position.x && segment.y === position.y) {
        return true;
      }
    }
    
    // Check food positions (if foodManager is available)
    if (this.foodManager && this.foodManager.foods) {
      for (const food of this.foodManager.foods) {
        if (food.x === position.x && food.y === position.y) {
          return true;
        }
      }
    }
    
    // Check other buffs
    for (const buff of this.buffs) {
      if (buff.x === position.x && buff.y === position.y) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if the snake's head collides with any buff
   * @param {Object} head - The snake's head position
   * @returns {Object|null} - The buff that was collected, or null
   */
  checkBuffCollision(head) {
    const now = Date.now();
    let collectedBuffIndex = -1;
    let collectedBuff = null;
    
    // Check each buff for collision and expiration
    for (let i = 0; i < this.buffs.length; i++) {
      const buff = this.buffs[i];
      
      // Remove expired buffs
      if (now > buff.expiresAt) {
        this.buffs.splice(i, 1);
        i--;
        continue;
      }
      
      // Check collision
      if (head.x === buff.x && head.y === buff.y) {
        collectedBuffIndex = i;
        collectedBuff = { ...buff };
        break;
      }
    }
    
    // Remove collected buff and update statistics
    if (collectedBuffIndex !== -1) {
      this.buffs.splice(collectedBuffIndex, 1);
      this.buffsCollected++;
    }
    
    return collectedBuff;
  }
  
  /**
   * Update buff states (remove expired buffs)
   */
  update() {
    const now = Date.now();
    
    // Remove expired buffs
    this.buffs = this.buffs.filter(buff => now <= buff.expiresAt);
  }
  
  /**
   * Draw all buffs
   */
  draw(renderer) {
    const now = Date.now();
    
    for (const buff of this.buffs) {
      // Calculate enhanced effects based on buff properties
      let sizeModifier = 1;
      let glowIntensity = 1;
      let rotationAngle = 0;
      let sparkleIntensity = 0;
      
      const age = now - buff.createdAt;
      const timeLeft = buff.expiresAt - now;
      const totalDuration = buff.expiresAt - buff.createdAt;
      const urgency = 1 - (timeLeft / totalDuration);
      
      // Enhanced pulse effect
      if (buff.pulseEffect) {
        const pulseSpeed = buff.name === 'speed_boost' ? 100 : 150;
        sizeModifier = 1 + 0.4 * Math.sin(age / pulseSpeed);
        
        // Add rotation for speed boost
        if (buff.name === 'speed_boost') {
          rotationAngle = (age / 50) % (Math.PI * 2);
        }
      }
      
      // Enhanced sparkle effect
      if (buff.sparkleEffect) {
        sparkleIntensity = 0.5 + 0.5 * Math.sin(age / 200);
        
        // Add gentle rotation for sparkly buffs
        if (buff.name === 'double_points') {
          rotationAngle = (age / 300) % (Math.PI * 2);
        }
      }
      
      // Dynamic glow based on buff type and urgency
      switch (buff.name) {
        case 'speed_boost':
          glowIntensity = 1.5 + urgency * 1.5 + 0.5 * Math.sin(age / 100);
          break;
        case 'double_points':
          glowIntensity = 1.2 + urgency * 2 + sparkleIntensity * 0.8;
          break;
        case 'mega_food':
          glowIntensity = 2 + urgency * 1.5 + 0.3 * Math.sin(age / 120);
          break;
        case 'invincibility':
          glowIntensity = 1.8 + urgency * 2.5 + 0.7 * Math.sin(age / 80);
          break;
        case 'time_freeze':
          glowIntensity = 1.6 + urgency * 2 + 0.4 * Math.cos(age / 90);
          break;
        default:
          glowIntensity = 1 + urgency * 2;
      }
      
      // Add urgency effects for expiring buffs
      if (urgency > 0.7) {
        // Rapid blinking for almost expired buffs
        const blinkSpeed = Math.max(50, 200 * (1 - urgency));
        const blinkModifier = 0.3 + 0.7 * Math.abs(Math.sin(age / blinkSpeed));
        glowIntensity *= blinkModifier;
        sizeModifier *= (0.8 + 0.2 * blinkModifier);
      }
      
      // Draw the enhanced buff
      renderer.drawBuff(buff, sizeModifier, glowIntensity, {
        rotation: rotationAngle,
        sparkleIntensity: sparkleIntensity,
        urgency: urgency
      });
    }
  }
  
  /**
   * Cleanup when destroying the manager
   */
  destroy() {
    if (this.autoSpawnTimer) {
      clearTimeout(this.autoSpawnTimer);
    }
    this.buffs = [];
  }
}