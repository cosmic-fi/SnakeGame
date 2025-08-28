// @ts-nocheck
/**
 * Renderer.js
 * Handles all drawing operations on the canvas
 */

import { getSavedCanvasTheme, getCanvasTheme } from '../config/themes.js';

export class Renderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Configure canvas for sharp rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    
    // Rendering options
    this.gridSize = options.gridSize || 20;
    this.tileCount = options.tileCount || 25;
    
    // Initialize with saved canvas theme colors
    const savedThemeId = getSavedCanvasTheme();
    const savedTheme = getCanvasTheme(savedThemeId);
    this.updateColors(savedTheme.colors);
    
    // Listen for canvas theme changes
    this.setupThemeListener();
  }
  
  /**
   * Setup theme change listener
   */
  setupThemeListener() {
    document.addEventListener('canvasThemeChanged', (event) => {
      this.updateColors(event.detail.colors);
    });
  }
  
  /**
   * Update colors based on canvas theme
   */
  updateColors(colors = null) {
    console.log(colors)
    if (colors) {
      // Use provided theme colors
      this.backgroundColor = colors.backgroundColor;
      this.gridColor = colors.gridColor;
      this.textColor = colors.textColor;
      this.accentColor = colors.accentColor;
      this.secondaryColor = colors.secondaryColor;
      this.darkColor = colors.darkColor;
    } else {
      // Default light theme colors
      this.gridColor = 'rgba(93, 104, 138, 0.4)';
      this.backgroundColor = '#FFF2EF';
      this.textColor = '#5D688A';
      this.accentColor = '#F7A5A5';
      this.secondaryColor = '#FFDBB6';
      this.darkColor = '#5D688A';
    }
  }
  
  /**
   * Clear the canvas
   */
  clearCanvas() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Draw the grid
   */
  drawGrid() {
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a snake segment
   */
  drawSnakeSegment(segment, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      segment.x * this.gridSize + 1,
      segment.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
    
    // Add a subtle border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      segment.x * this.gridSize + 1,
      segment.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }
  
  /**
   * Draw a styled snake segment with advanced visual effects
   */
  drawStyledSnakeSegment(segment, styleProps) {
    const x = segment.x * this.gridSize;
    const y = segment.y * this.gridSize;
    const size = this.gridSize * 0.9;
    const offset = (this.gridSize - size) / 2;
    
    this.ctx.save();
    
    // Apply style properties
    this.ctx.fillStyle = styleProps.fillStyle;
    this.ctx.strokeStyle = styleProps.strokeStyle;
    this.ctx.lineWidth = styleProps.lineWidth;
    
    // Draw the segment
    this.roundRect(
      x + offset,
      y + offset,
      size,
      size,
      styleProps.cornerRadius,
      true,
      styleProps.lineWidth > 0
    );
    
    this.ctx.restore();
  }

  /**
   * Draw the snake head with distinguishing features
   */
  drawSnakeHead(segment, styleProps, direction) {
    const x = segment.x * this.gridSize;
    const y = segment.y * this.gridSize;
    const size = this.gridSize * 0.9;
    const offset = (this.gridSize - size) / 2;
    
    this.ctx.save();
    
    // Draw the head base (slightly larger than body)
    const headSize = size * 1.1;
    const headOffset = (this.gridSize - headSize) / 2;
    
    this.ctx.fillStyle = styleProps.fillStyle;
    this.ctx.strokeStyle = styleProps.strokeStyle;
    this.ctx.lineWidth = styleProps.lineWidth;
    
    // Draw head with rounded corners
    this.roundRect(
      x + headOffset,
      y + headOffset,
      headSize,
      headSize,
      styleProps.cornerRadius + 2,
      true,
      styleProps.lineWidth > 0
    );
    
    // Draw eyes
    this.drawSnakeEyes(x + this.gridSize / 2, y + this.gridSize / 2, direction, size);
    
    // Add directional indicator (nose/mouth)
    this.drawDirectionalIndicator(x + this.gridSize / 2, y + this.gridSize / 2, direction, size);
    
    this.ctx.restore();
  }

  /**
   * Draw snake eyes based on direction
   */
  drawSnakeEyes(centerX, centerY, direction, size) {
    const eyeSize = size * 0.12;
    const eyeOffset = size * 0.15;
    
    // Calculate eye positions based on direction
    let eye1X, eye1Y, eye2X, eye2Y;
    
    if (direction.dx === 1) { // Moving right
      eye1X = centerX + eyeOffset;
      eye1Y = centerY - eyeOffset;
      eye2X = centerX + eyeOffset;
      eye2Y = centerY + eyeOffset;
    } else if (direction.dx === -1) { // Moving left
      eye1X = centerX - eyeOffset;
      eye1Y = centerY - eyeOffset;
      eye2X = centerX - eyeOffset;
      eye2Y = centerY + eyeOffset;
    } else if (direction.dy === -1) { // Moving up
      eye1X = centerX - eyeOffset;
      eye1Y = centerY - eyeOffset;
      eye2X = centerX + eyeOffset;
      eye2Y = centerY - eyeOffset;
    } else { // Moving down
      eye1X = centerX - eyeOffset;
      eye1Y = centerY + eyeOffset;
      eye2X = centerX + eyeOffset;
      eye2Y = centerY + eyeOffset;
    }
    
    // Draw eyes
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(eye1X, eye1Y, eyeSize, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(eye2X, eye2Y, eyeSize, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw pupils
    const pupilSize = eyeSize * 0.6;
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(eye1X, eye1Y, pupilSize, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(eye2X, eye2Y, pupilSize, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * Draw directional indicator (nose/mouth)
   */
  drawDirectionalIndicator(centerX, centerY, direction, size) {
    const indicatorSize = size * 0.08;
    
    // Calculate indicator position based on direction
    let indicatorX, indicatorY;
    
    if (direction.dx === 1) { // Moving right
      indicatorX = centerX + size * 0.3;
      indicatorY = centerY;
    } else if (direction.dx === -1) { // Moving left
      indicatorX = centerX - size * 0.3;
      indicatorY = centerY;
    } else if (direction.dy === -1) { // Moving up
      indicatorX = centerX;
      indicatorY = centerY - size * 0.3;
    } else { // Moving down
      indicatorX = centerX;
      indicatorY = centerY + size * 0.3;
    }
    
    // Draw small indicator
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(indicatorX, indicatorY, indicatorSize, 0, 2 * Math.PI);
    this.ctx.fill();
  }
  
  /**
   * Draw a food item
   */
  drawFood(food, sizeModifier = 1) {
    const centerX = food.x * this.gridSize + this.gridSize / 2;
    const centerY = food.y * this.gridSize + this.gridSize / 2;
    const radius = (this.gridSize / 3) * sizeModifier;
    
    // Draw based on food type
    switch (food.type) {
      case 'normal':
        this.ctx.fillStyle = food.color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        break;
      
      case 'special':
        this.drawStar(centerX, centerY, radius, food.color, '#FFD700');
        break;
      
      default:
        this.ctx.fillStyle = food.color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
  }
  
  /**
   * Draw a buff/power-up with enhanced special effects
   */
  drawBuff(buff, sizeModifier = 1, glowIntensity = 1, effects = {}) {
    const x = buff.x * this.gridSize;
    const y = buff.y * this.gridSize;
    const baseSize = this.gridSize * (buff.size || 0.9);
    const size = baseSize * sizeModifier;
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;
    
    this.ctx.save();
    
    // Apply rotation if specified
    if (effects.rotation) {
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(effects.rotation);
      this.ctx.translate(-centerX, -centerY);
    }
    
    // Enhanced glow effect with multiple layers
    if (buff.glowEffect) {
      const baseBlur = 15 * glowIntensity;
      
      // Outer glow
      this.ctx.shadowColor = buff.color;
      this.ctx.shadowBlur = baseBlur * 1.5;
      
      // Add urgency glow for expiring buffs
      if (effects.urgency > 0.5) {
        this.ctx.shadowColor = this.blendColors(buff.color, '#FFFFFF', effects.urgency * 0.3);
        this.ctx.shadowBlur = baseBlur * (1 + effects.urgency);
      }
    }
    
    // Draw based on shape
    switch (buff.shape) {
      case 'diamond':
        this.drawDiamond(centerX, centerY, size / 2, buff.color, buff.secondaryColor);
        break;
      case 'star':
        this.drawStar(centerX, centerY, size / 2, buff.color, buff.secondaryColor);
        break;
      case 'hexagon':
        this.drawHexagon(centerX, centerY, size / 2, buff.color, buff.secondaryColor);
        break;
      case 'shield':
        this.drawShield(centerX, centerY, size / 2, buff.color, buff.secondaryColor);
        break;
      case 'crystal':
        this.drawCrystal(centerX, centerY, size / 2, buff.color, buff.secondaryColor);
        break;
      default:
        // Default circle with enhanced effects
        this.ctx.fillStyle = buff.color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add inner highlight for urgency
        if (effects.urgency > 0.3) {
          this.ctx.fillStyle = this.blendColors(buff.color, '#FFFFFF', effects.urgency * 0.4);
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, size / 4, 0, Math.PI * 2);
          this.ctx.fill();
        }
    }
    
    // Enhanced sparkle effect
    if (buff.sparkleEffect && effects.sparkleIntensity > 0) {
      this.drawEnhancedSparkles(centerX, centerY, size / 2, buff.color, effects.sparkleIntensity);
    }
    
    // Add energy rings for high-value buffs
    if (buff.points >= 20) {
      this.drawEnergyRings(centerX, centerY, size / 2, buff.color, glowIntensity);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a diamond shape
   */
  drawDiamond(centerX, centerY, radius, color, secondaryColor) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - radius);
    this.ctx.lineTo(centerX + radius, centerY);
    this.ctx.lineTo(centerX, centerY + radius);
    this.ctx.lineTo(centerX - radius, centerY);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add inner highlight
    if (secondaryColor) {
      this.ctx.fillStyle = secondaryColor;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - radius * 0.6);
      this.ctx.lineTo(centerX + radius * 0.6, centerY);
      this.ctx.lineTo(centerX, centerY + radius * 0.6);
      this.ctx.lineTo(centerX - radius * 0.6, centerY);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  /**
   * Draw a star shape
   */
  drawStar(centerX, centerY, radius, color, secondaryColor) {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle - Math.PI / 2) * r;
      const y = centerY + Math.sin(angle - Math.PI / 2) * r;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add center circle
    if (secondaryColor) {
      this.ctx.fillStyle = secondaryColor;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, innerRadius * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  /**
   * Draw a hexagon shape
   */
  drawHexagon(centerX, centerY, radius, color, secondaryColor) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add inner hexagon
    if (secondaryColor) {
      this.ctx.fillStyle = secondaryColor;
      this.ctx.beginPath();
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = centerX + Math.cos(angle) * radius * 0.6;
        const y = centerY + Math.sin(angle) * radius * 0.6;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  /**
   * Draw a shield shape
   */
  drawShield(centerX, centerY, radius, color, secondaryColor) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - radius);
    this.ctx.quadraticCurveTo(centerX + radius, centerY - radius, centerX + radius, centerY);
    this.ctx.quadraticCurveTo(centerX + radius, centerY + radius * 0.5, centerX, centerY + radius);
    this.ctx.quadraticCurveTo(centerX - radius, centerY + radius * 0.5, centerX - radius, centerY);
    this.ctx.quadraticCurveTo(centerX - radius, centerY - radius, centerX, centerY - radius);
    this.ctx.fill();
    
    // Add inner shield design
    if (secondaryColor) {
      this.ctx.fillStyle = secondaryColor;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - radius * 0.7);
      this.ctx.quadraticCurveTo(centerX + radius * 0.7, centerY - radius * 0.7, centerX + radius * 0.7, centerY);
      this.ctx.quadraticCurveTo(centerX + radius * 0.7, centerY + radius * 0.3, centerX, centerY + radius * 0.7);
      this.ctx.quadraticCurveTo(centerX - radius * 0.7, centerY + radius * 0.3, centerX - radius * 0.7, centerY);
      this.ctx.quadraticCurveTo(centerX - radius * 0.7, centerY - radius * 0.7, centerX, centerY - radius * 0.7);
      this.ctx.fill();
    }
  }
  
  /**
   * Draw a crystal shape
   */
  drawCrystal(centerX, centerY, radius, color, secondaryColor) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    
    // Crystal facets
    const points = [
      { x: centerX, y: centerY - radius },
      { x: centerX + radius * 0.6, y: centerY - radius * 0.3 },
      { x: centerX + radius * 0.8, y: centerY + radius * 0.2 },
      { x: centerX + radius * 0.3, y: centerY + radius },
      { x: centerX - radius * 0.3, y: centerY + radius },
      { x: centerX - radius * 0.8, y: centerY + radius * 0.2 },
      { x: centerX - radius * 0.6, y: centerY - radius * 0.3 }
    ];
    
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add inner crystal lines
    if (secondaryColor) {
      this.ctx.strokeStyle = secondaryColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - radius);
      this.ctx.lineTo(centerX, centerY + radius);
      this.ctx.moveTo(centerX - radius * 0.6, centerY - radius * 0.3);
      this.ctx.lineTo(centerX + radius * 0.6, centerY - radius * 0.3);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw sparkle effects around a buff
   */
  drawSparkles(centerX, centerY, radius, color) {
    const time = Date.now() / 100;
    const sparkleCount = 6;
    
    this.ctx.fillStyle = color;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + time;
      const distance = radius * 1.5;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 2 + Math.sin(time + i) * 1;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  /**
   * Draw enhanced sparkle effects with intensity control
   */
  drawEnhancedSparkles(centerX, centerY, radius, color, intensity) {
    const time = Date.now() / 100;
    const sparkleCount = Math.floor(8 * intensity);
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 5 * intensity;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + time * intensity;
      const distance = radius * (1.2 + 0.5 * intensity);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = (1 + Math.sin(time + i) * 0.5) * intensity;
      
      // Draw star-shaped sparkles
      this.drawMiniStar(x, y, size, 4);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw energy rings around high-value buffs
   */
  drawEnergyRings(centerX, centerY, radius, color, intensity) {
    const time = Date.now() / 200;
    const ringCount = 3;
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = 0.3 * intensity;
    
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = radius * (1.5 + i * 0.3) + Math.sin(time + i) * 5;
      this.ctx.lineWidth = 2 - i * 0.5;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a mini star for sparkle effects
   */
  drawMiniStar(centerX, centerY, size, spikes) {
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    this.ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle - Math.PI / 2) * r;
      const y = centerY + Math.sin(angle - Math.PI / 2) * r;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  /**
   * Blend two colors together
   */
  blendColors(color1, color2, ratio) {
    // Convert hex colors to RGB
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    // Blend the colors
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * Draw game over overlay
   */
  drawGameOverOverlay(gameOverState) {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Title text
    this.ctx.fillStyle = '#F7A5A5';
    this.ctx.font = 'bold 32px Orbitron, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      gameOverState.title,
      this.canvas.width / 2,
      this.canvas.height / 2 - 40
    );
    
    // Message text
    this.ctx.fillStyle = '#5D688A';
    this.ctx.font = '20px Orbitron, Arial, sans-serif';
    this.ctx.fillText(
      gameOverState.message,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    
    // Start prompt
    if (gameOverState.showStartPrompt) {
      this.ctx.fillStyle = '#FFDBB6';
      this.ctx.font = '16px Orbitron, Arial, sans-serif';
      this.ctx.fillText(
        'Press Space or click to start',
        this.canvas.width / 2,
        this.canvas.height / 2 + 40
      );
    }
  }
  
  /**
   * Draw a rounded rectangle
   * Polyfill for older browsers that don't support roundRect
   */
  roundRect(x, y, width, height, radius, fill = false, stroke = false) {
    if (typeof this.ctx.roundRect === 'function') {
      // Use native roundRect if available
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, width, height, radius);
      if (fill) this.ctx.fill();
      if (stroke) this.ctx.stroke();
      return;
    }
    
    // Fallback implementation
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius.tl, y);
    this.ctx.lineTo(x + width - radius.tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    this.ctx.lineTo(x + width, y + height - radius.br);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    this.ctx.lineTo(x + radius.bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    this.ctx.lineTo(x, y + radius.tl);
    this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    this.ctx.closePath();
    
    if (fill) this.ctx.fill();
    if (stroke) this.ctx.stroke();
  }
}