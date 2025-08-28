// @ts-nocheck
/**
 * Food.js
 * Handles food generation and management
 */

export class FoodManager {
  constructor(options = {}) {
    this.tileCount = options.tileCount || 25;
    this.snake = options.snake;
    this.buffManager = options.buffManager;
    
    // Food types with their properties
    this.foodTypes = [
      {
        name: 'regular',
        color: '#FF5252',
        points: 1,
        probability: 0.8,
        size: 0.8 // Size relative to tile size
      },
      {
        name: 'bonus',
        color: '#FFD740',
        points: 3,
        probability: 0.15,
        size: 0.9,
        pulseEffect: true
      },
      {
        name: 'special',
        color: '#40C4FF',
        points: 5,
        probability: 0.05,
        size: 1,
        pulseEffect: true,
        glowEffect: true
      }
    ];
    
    // Current food items on the board
    this.foods = [];
    
    // Statistics
    this.foodEaten = 0;
    
    // Initialize food
    this.ensureFoodExists();
  }
  
  /**
   * Reset food state
   */
  reset() {
    this.foods = [];
    this.foodEaten = 0;
    this.ensureFoodExists();
  }
  
  /**
   * Ensure at least one food exists on the board
   * @param {Array} snakeBody - Snake body positions to avoid
   */
  ensureFoodExists(snakeBody = []) {
    // If we already have food, don't generate more
    if (this.foods.length > 0) return;
    
    // Try to generate food multiple times if needed
    let attempts = 0;
    const maxRetries = 10;
    
    while (this.foods.length === 0 && attempts < maxRetries) {
      const result = this.generateFood(snakeBody);
      if (!result) {
        // If generateFood failed, try with empty snake body to allow any position
        this.generateFood([]);
      }
      attempts++;
    }
    
    // If still no food after retries, force create one at any position
    if (this.foods.length === 0) {
      console.warn('Forcing food creation after failed attempts');
      
      // Find any available position, even if occupied by snake
      let position;
      let forceAttempts = 0;
      do {
        position = {
          x: Math.floor(Math.random() * this.tileCount),
          y: Math.floor(Math.random() * this.tileCount)
        };
        forceAttempts++;
      } while (forceAttempts < 100 && this.isPositionOccupiedByFood(position));
      
      const food = {
         ...this.foodTypes[0], // Use first food type (regular)
         x: position.x,
         y: position.y,
         createdAt: Date.now()
       };
      
      this.foods.push(food);
    }
  }
  
  /**
   * Generate a new food item at a random position
   * @param {Array} snakeBody - The snake's body segments to avoid
   * @returns {Object|null} Generated food item or null if no valid position found
   */
  generateFood(snakeBody = []) {
    // Always create regular food to ensure food exists
    const foodType = this.foodTypes[0]; // Always use regular food for guaranteed spawning
    
    // Find a valid position (not occupied by snake)
    let position;
    let attempts = 0;
    const maxAttempts = 100; // Increased attempts
    
    do {
      position = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      attempts++;
      
      // Break if too many attempts (board might be nearly full)
      if (attempts >= maxAttempts) {
        console.warn('Could not find valid position for food after', maxAttempts, 'attempts');
        return null; // Don't create food if no valid position found
      }
      
    } while (this.isPositionOccupied(position, snakeBody));
    
    // Create food item - regular food never expires
    const food = {
      ...foodType,
      x: position.x,
      y: position.y,
      createdAt: Date.now()
    };
    
    // Regular food never expires - no expiration time added
    
    // Add to foods array
    this.foods.push(food);
    
    return food;
  }
  
  /**
   * Get a random food type based on probability
   */
  getRandomFoodType() {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const foodType of this.foodTypes) {
      cumulativeProbability += foodType.probability;
      if (rand < cumulativeProbability) {
        return foodType;
      }
    }
    
    // Fallback to regular food
    return this.foodTypes[0];
  }
  
  /**
   * Check if a position is occupied by the snake, food, or buffs
   */
  isPositionOccupied(position, snakeBody) {
    // Check if position is occupied by snake
    for (const segment of snakeBody) {
      if (segment.x === position.x && segment.y === position.y) {
        return true;
      }
    }
    
    // Check if position is occupied by other food
    for (const food of this.foods) {
      if (food.x === position.x && food.y === position.y) {
        return true;
      }
    }
    
    // Check if position is occupied by buffs
    if (this.buffManager && this.buffManager.buffs) {
      for (const buff of this.buffManager.buffs) {
        if (buff.x === position.x && buff.y === position.y) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Check if a position is occupied by other food only
   */
  isPositionOccupiedByFood(position) {
    for (const food of this.foods) {
      if (food.x === position.x && food.y === position.y) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if the snake's head collides with any food
   * @param {Object} head - The snake's head position
   * @returns {Object|null} - The food that was eaten, or null
   */
  checkFoodCollision(head) {
    let eatenFoodIndex = -1;
    let eatenFood = null;
    
    // Check each food for collision
    for (let i = 0; i < this.foods.length; i++) {
      const food = this.foods[i];
      
      // Regular food never expires, so no expiration check needed
      
      // Check collision
      if (head.x === food.x && head.y === food.y) {
        eatenFoodIndex = i;
        eatenFood = { ...food };
        break;
      }
    }
    
    // Remove eaten food and update statistics
    if (eatenFoodIndex !== -1) {
      this.foods.splice(eatenFoodIndex, 1);
      this.foodEaten++;
    }
    
    return eatenFood;
  }
  
  /**
   * Draw all food items
   */
  draw(renderer) {
    const now = Date.now();
    
    for (const food of this.foods) {
      // Calculate pulse effect for special foods
      let sizeModifier = 1;
      if (food.pulseEffect) {
        const age = now - food.createdAt;
        sizeModifier = 1 + 0.2 * Math.sin(age / 200);
      }
      
      // Draw the food
      renderer.drawFood(food, sizeModifier);
    }
  }
}