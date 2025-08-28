/**
 * SnakeStyles.js
 * Defines different visual styles for the snake
 */

export class SnakeStyles {
  static styles = {
    classic: {
      name: 'Classic',
      description: 'Traditional retro snake style',
      bodyColor: '#4CAF50',
      headColor: '#2E7D32',
      borderColor: '#1B5E20',
      borderWidth: 2,
      cornerRadius: 4,
      pattern: 'solid',
      glow: false,
      animation: 'none'
    },
    
    neon: {
      name: 'Neon',
      description: 'Glowing cyberpunk style',
      bodyColor: '#00FFFF',
      headColor: '#FF00FF',
      borderColor: '#FFFFFF',
      borderWidth: 1,
      cornerRadius: 8,
      pattern: 'solid',
      glow: true,
      glowColor: '#00FFFF',
      glowIntensity: 20,
      animation: 'pulse'
    },
    
    retro: {
      name: 'Retro',
      description: 'Classic 8-bit pixel style',
      bodyColor: '#32CD32',
      headColor: '#228B22',
      borderColor: '#006400',
      borderWidth: 3,
      cornerRadius: 0, // Sharp corners for pixel look
      pattern: 'pixelated',
      glow: false,
      animation: 'none'
    },
    
    gradient: {
      name: 'Gradient',
      description: 'Smooth color transitions',
      bodyColor: ['#FF6B35', '#F7931E', '#FFD23F'],
      headColor: '#FF4500',
      borderColor: '#8B0000',
      borderWidth: 2,
      cornerRadius: 6,
      pattern: 'gradient',
      glow: false,
      animation: 'flow'
    },
    
    rainbow: {
      name: 'Rainbow',
      description: 'Colorful rainbow snake',
      bodyColor: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      headColor: '#FFD700',
      borderColor: '#FFFFFF',
      borderWidth: 1,
      cornerRadius: 8,
      pattern: 'rainbow',
      glow: true,
      glowColor: '#FFFFFF',
      glowIntensity: 10,
      animation: 'shift'
    },
    
    metallic: {
      name: 'Metallic',
      description: 'Shiny metallic appearance',
      bodyColor: '#C0C0C0',
      headColor: '#FFD700',
      borderColor: '#696969',
      borderWidth: 2,
      cornerRadius: 5,
      pattern: 'metallic',
      glow: false,
      animation: 'shine'
    },
    
    fire: {
      name: 'Fire',
      description: 'Blazing fire effect',
      bodyColor: ['#FF4500', '#FF6347', '#FF8C00'],
      headColor: '#DC143C',
      borderColor: '#8B0000',
      borderWidth: 1,
      cornerRadius: 6,
      pattern: 'fire',
      glow: true,
      glowColor: '#FF4500',
      glowIntensity: 15,
      animation: 'flicker'
    },
    
    ice: {
      name: 'Ice',
      description: 'Cool crystalline ice',
      bodyColor: '#87CEEB',
      headColor: '#4169E1',
      borderColor: '#191970',
      borderWidth: 2,
      cornerRadius: 4,
      pattern: 'ice',
      glow: true,
      glowColor: '#87CEEB',
      glowIntensity: 12,
      animation: 'sparkle'
    },
    
    galaxy: {
      name: 'Galaxy',
      description: 'Cosmic space theme',
      bodyColor: ['#4B0082', '#8A2BE2', '#9400D3'],
      headColor: '#FFD700',
      borderColor: '#FFFFFF',
      borderWidth: 1,
      cornerRadius: 8,
      pattern: 'galaxy',
      glow: true,
      glowColor: '#9400D3',
      glowIntensity: 18,
      animation: 'twinkle'
    },
    
    matrix: {
      name: 'Matrix',
      description: 'Digital matrix code style',
      bodyColor: '#00FF00',
      headColor: '#32CD32',
      borderColor: '#008000',
      borderWidth: 1,
      cornerRadius: 2,
      pattern: 'matrix',
      glow: true,
      glowColor: '#00FF00',
      glowIntensity: 15,
      animation: 'digital'
    },
    
    kawaii: {
      name: 'Kawaii',
      description: 'Adorable Japanese-inspired style',
      bodyColor: '#F7A5A5',
      headColor: '#FFDBB6',
      borderColor: '#5D688A',
      borderWidth: 2,
      cornerRadius: 12,
      pattern: 'solid',
      glow: true,
      glowColor: '#F7A5A5',
      glowIntensity: 8,
      animation: 'bounce'
    },
    
    bubblegum: {
      name: 'Bubblegum',
      description: 'Sweet pink bubblegum snake',
      bodyColor: ['#F7A5A5', '#FFDBB6', '#FFF2EF'],
      headColor: '#F7A5A5',
      borderColor: '#5D688A',
      borderWidth: 1,
      cornerRadius: 10,
      pattern: 'gradient',
      glow: true,
      glowColor: '#F7A5A5',
      glowIntensity: 12,
      animation: 'bubble'
    },
    
    pastel: {
      name: 'Pastel Dream',
      description: 'Soft pastel colors',
      bodyColor: ['#FFF2EF', '#FFDBB6', '#F7A5A5'],
      headColor: '#5D688A',
      borderColor: '#F7A5A5',
      borderWidth: 2,
      cornerRadius: 8,
      pattern: 'pastel',
      glow: true,
      glowColor: '#FFF2EF',
      glowIntensity: 6,
      animation: 'float'
    },
    
    cherry: {
      name: 'Cherry Blossom',
      description: 'Delicate cherry blossom theme',
      bodyColor: '#F7A5A5',
      headColor: '#FFDBB6',
      borderColor: '#5D688A',
      borderWidth: 1,
      cornerRadius: 6,
      pattern: 'cherry',
      glow: true,
      glowColor: '#F7A5A5',
      glowIntensity: 10,
      animation: 'petal'
    },
    
    cottonCandy: {
      name: 'Cotton Candy',
      description: 'Fluffy cotton candy sweetness',
      bodyColor: ['#F7A5A5', '#FFF2EF'],
      headColor: '#FFDBB6',
      borderColor: '#5D688A',
      borderWidth: 2,
      cornerRadius: 15,
      pattern: 'fluffy',
      glow: true,
      glowColor: '#F7A5A5',
      glowIntensity: 15,
      animation: 'cloud'
    },
    
    unicorn: {
      name: 'Unicorn Magic',
      description: 'Magical unicorn with sparkles',
      bodyColor: ['#F7A5A5', '#FFDBB6', '#FFF2EF', '#5D688A'],
      headColor: '#F7A5A5',
      borderColor: '#5D688A',
      borderWidth: 1,
      cornerRadius: 10,
      pattern: 'unicorn',
      glow: true,
      glowColor: '#F7A5A5',
      glowIntensity: 20,
      animation: 'sparkle'
    }
  };
  
  /**
   * Get all available styles
   */
  static getAllStyles() {
    return Object.keys(this.styles).map(key => ({
      id: key,
      ...this.styles[key]
    }));
  }
  
  /**
   * Get a specific style by ID
   */
  static getStyle(styleId) {
    return this.styles[styleId] || this.styles.classic;
  }
  
  /**
   * Get style names for UI selection
   */
  static getStyleNames() {
    return Object.keys(this.styles).map(key => ({
      id: key,
      name: this.styles[key].name,
      description: this.styles[key].description
    }));
  }
  
  /**
   * Apply style to renderer context
   */
  static applyStyle(ctx, style, segment, segmentIndex, totalSegments, time = 0) {
    const currentStyle = this.getStyle(style);
    
    // Reset context
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    // Apply glow effect
    if (currentStyle.glow) {
      ctx.shadowColor = currentStyle.glowColor || currentStyle.bodyColor;
      ctx.shadowBlur = currentStyle.glowIntensity || 10;
      
      // Animate glow intensity
      if (currentStyle.animation === 'pulse') {
        const pulseIntensity = 1 + 0.5 * Math.sin(time / 200);
        ctx.shadowBlur *= pulseIntensity;
      }
    }
    
    // Get segment color based on pattern
    const segmentColor = this.getSegmentColor(currentStyle, segmentIndex, totalSegments, time);
    
    return {
      fillStyle: segmentColor,
      strokeStyle: currentStyle.borderColor,
      lineWidth: currentStyle.borderWidth,
      cornerRadius: currentStyle.cornerRadius
    };
  }
  
  /**
   * Get color for a specific segment based on style pattern
   */
  static getSegmentColor(style, segmentIndex, totalSegments, time) {
    const bodyColor = style.bodyColor;
    
    // Handle different color patterns
    switch (style.pattern) {
      case 'gradient':
        if (Array.isArray(bodyColor)) {
          const progress = segmentIndex / Math.max(1, totalSegments - 1);
          return this.interpolateColors(bodyColor, progress);
        }
        return bodyColor;
        
      case 'rainbow':
        if (Array.isArray(bodyColor)) {
          const colorIndex = (segmentIndex + Math.floor(time / 100)) % bodyColor.length;
          return bodyColor[colorIndex];
        }
        return bodyColor;
        
      case 'fire':
        if (Array.isArray(bodyColor)) {
          const flicker = Math.sin(time / 50 + segmentIndex) * 0.5 + 0.5;
          const colorIndex = Math.floor(flicker * bodyColor.length);
          return bodyColor[Math.min(colorIndex, bodyColor.length - 1)];
        }
        return bodyColor;
        
      case 'galaxy':
        if (Array.isArray(bodyColor)) {
          const twinkle = Math.sin(time / 300 + segmentIndex * 0.5) * 0.5 + 0.5;
          const colorIndex = Math.floor(twinkle * bodyColor.length);
          return bodyColor[Math.min(colorIndex, bodyColor.length - 1)];
        }
        return bodyColor;
        
      case 'metallic':
        // Add metallic shine effect
        const shine = Math.sin(time / 200 + segmentIndex * 0.3) * 0.3 + 0.7;
        return this.adjustBrightness(bodyColor, shine);
        
      case 'ice':
        // Add crystalline sparkle
        const sparkle = Math.random() > 0.95 ? 1.5 : 1;
        return this.adjustBrightness(bodyColor, sparkle);
        
      case 'matrix':
        // Digital flicker effect
        const flicker = Math.random() > 0.9 ? 0.7 : 1;
        return this.adjustBrightness(bodyColor, flicker);
        
      case 'pastel':
        // Soft pastel color transitions
        if (Array.isArray(bodyColor)) {
          const softWave = Math.sin(time / 400 + segmentIndex * 0.2) * 0.5 + 0.5;
          const colorIndex = Math.floor(softWave * bodyColor.length);
          return bodyColor[Math.min(colorIndex, bodyColor.length - 1)];
        }
        return bodyColor;
        
      case 'cherry':
        // Cherry blossom gentle sway
        const sway = Math.sin(time / 600 + segmentIndex * 0.1) * 0.2 + 0.9;
        return this.adjustBrightness(bodyColor, sway);
        
      case 'fluffy':
        // Cotton candy fluffy alternation
        if (Array.isArray(bodyColor)) {
          const fluffy = Math.sin(time / 300 + segmentIndex * 0.8) * 0.5 + 0.5;
          const colorIndex = Math.floor(fluffy * bodyColor.length);
          return bodyColor[Math.min(colorIndex, bodyColor.length - 1)];
        }
        return bodyColor;
        
      case 'unicorn':
        // Magical unicorn rainbow shimmer
        if (Array.isArray(bodyColor)) {
          const magic = Math.sin(time / 150 + segmentIndex * 0.4) * 0.5 + 0.5;
          const sparkleBoost = Math.random() > 0.95 ? 1.3 : 1;
          const colorIndex = Math.floor(magic * bodyColor.length);
          const baseColor = bodyColor[Math.min(colorIndex, bodyColor.length - 1)];
          return this.adjustBrightness(baseColor, sparkleBoost);
        }
        return bodyColor;
        
      default:
        return Array.isArray(bodyColor) ? bodyColor[0] : bodyColor;
    }
  }
  
  /**
   * Interpolate between multiple colors
   */
  static interpolateColors(colors, progress) {
    if (colors.length === 1) return colors[0];
    
    const scaledProgress = progress * (colors.length - 1);
    const index = Math.floor(scaledProgress);
    const remainder = scaledProgress - index;
    
    if (index >= colors.length - 1) return colors[colors.length - 1];
    
    return this.blendColors(colors[index], colors[index + 1], remainder);
  }
  
  /**
   * Blend two colors
   */
  static blendColors(color1, color2, ratio) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  /**
   * Adjust color brightness
   */
  static adjustBrightness(color, factor) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const r = Math.min(255, Math.round(rgb.r * factor));
    const g = Math.min(255, Math.round(rgb.g * factor));
    const b = Math.min(255, Math.round(rgb.b * factor));
    
    return `rgb(${r}, ${g}, ${b})`;
  }
}