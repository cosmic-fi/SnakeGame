/**
 * Snake.js
 * Handles the snake's behavior and state
 */

import { SnakeStyles } from './SnakeStyles.js';

export class Snake {
  constructor(options = {}) {
    const initialPosition = options.initialPosition || { x: 12, y: 12 };
    const initialDirection = options.initialDirection || { dx: 1, dy: 0 };
    
    // Snake body segments (head is at index 0)
    this.body = [
      { ...initialPosition }
    ];
    
    // Current direction
    this.direction = { ...initialDirection };
    
    // Next direction (to prevent 180° turns in a single update)
    this.nextDirection = { ...initialDirection };
    
    // Snake appearance and style
    this.styleId = options.styleId || 'classic';
    this.style = SnakeStyles.getStyle(this.styleId);
    this.color = this.style.bodyColor;
    this.headColor = this.style.headColor;
    
    // Animation time for style effects
    this.animationTime = 0;
  }
  
  /**
   * Reset the snake to initial state
   */
  reset(options = {}) {
    const initialPosition = options.initialPosition || { x: 12, y: 12 };
    const initialDirection = options.initialDirection || { dx: 1, dy: 0 };
    
    this.body = [{ ...initialPosition }];
    this.direction = { ...initialDirection };
    this.nextDirection = { ...initialDirection };
  }
  
  /**
   * Set the next direction of the snake
   * This prevents the snake from turning 180° in a single update
   */
  setNextDirection(dx, dy) {
    this.nextDirection = { dx, dy };
  }
  
  /**
   * Move the snake
   * @param {string} gameMode - 'border' or 'wrap'
   * @param {number} tileCount - Number of tiles in the grid
   * @returns {Object} - Result of the move, including collision status
   */
  move(gameMode, tileCount) {
    // Update direction from nextDirection
    this.direction = { ...this.nextDirection };
    
    // Get current head position
    const head = { ...this.body[0] };
    
    // Calculate new head position
    const newHead = {
      x: head.x + this.direction.dx,
      y: head.y + this.direction.dy
    };
    
    // Handle game mode (border collision or wrap around)
    if (gameMode === 'border') {
      // Check for wall collision
      if (
        newHead.x < 0 ||
        newHead.y < 0 ||
        newHead.x >= tileCount ||
        newHead.y >= tileCount
      ) {
        return { collision: true, type: 'wall' };
      }
    } else if (gameMode === 'wrap') {
      // Wrap around the edges
      if (newHead.x < 0) newHead.x = tileCount - 1;
      if (newHead.y < 0) newHead.y = tileCount - 1;
      if (newHead.x >= tileCount) newHead.x = 0;
      if (newHead.y >= tileCount) newHead.y = 0;
    }
    
    // Check for self collision (skip the tail as it will move)
    for (let i = 0; i < this.body.length - 1; i++) {
      if (this.body[i].x === newHead.x && this.body[i].y === newHead.y) {
        return { collision: true, type: 'self' };
      }
    }
    
    // Add new head to the beginning of the body
    this.body.unshift(newHead);
    
    // Remove the tail (unless we're growing)
    this.body.pop();
    
    return { collision: false };
  }
  
  /**
   * Grow the snake by one segment
   */
  grow() {
    // Duplicate the tail to create growth
    // The tail will not be removed in the next move
    const tail = this.body[this.body.length - 1];
    this.body.push({ ...tail });
  }
  
  /**
   * Set snake style
   */
  setStyle(styleId) {
    this.styleId = styleId;
    this.style = SnakeStyles.getStyle(styleId);
    this.color = this.style.bodyColor;
    this.headColor = this.style.headColor;
  }
  
  /**
   * Update animation time for style effects
   */
  updateAnimation(deltaTime) {
    this.animationTime += deltaTime;
  }
  
  /**
   * Draw the snake
   */
  draw(renderer) {
    // Draw body segments with style
    for (let i = this.body.length - 1; i > 0; i--) {
      const styleProps = SnakeStyles.applyStyle(
        renderer.ctx, 
        this.styleId, 
        this.body[i], 
        i, 
        this.body.length, 
        this.animationTime
      );
      renderer.drawStyledSnakeSegment(this.body[i], styleProps);
    }
    
    // Draw head with head color and special features
    const headStyleProps = SnakeStyles.applyStyle(
      renderer.ctx, 
      this.styleId, 
      this.body[0], 
      0, 
      this.body.length, 
      this.animationTime
    );
    headStyleProps.fillStyle = Array.isArray(this.style.headColor) 
      ? this.style.headColor[0] 
      : this.style.headColor;
    renderer.drawSnakeHead(this.body[0], headStyleProps, this.direction);
  }
}