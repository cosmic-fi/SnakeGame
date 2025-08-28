// @ts-nocheck
/**
 * ZoomAdapter - Dynamic font scaling based on browser zoom level
 * Detects browser zoom and adjusts font sizes accordingly
 */
export class ZoomAdapter {
  constructor() {
    this.zoomLevel = 1;
    this.baseZoomLevel = 1;
    this.isInitialized = false;
    this.callbacks = [];
    
    // Common zoom levels for detection
    this.zoomLevels = {
      zoomOut: [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9],
      zoomIn: [1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]
    };
    
    this.init();
  }
  
  /**
   * Initialize zoom detection and font scaling
   */
  init() {
    if (this.isInitialized) return;
    
    this.detectZoomLevel();
    this.setupZoomDetection();
    this.applyFontScaling();
    
    this.isInitialized = true;
  }
  
  /**
   * Detect current browser zoom level
   */
  detectZoomLevel() {
    // Method 1: Using devicePixelRatio (most reliable)
    if (typeof window.devicePixelRatio === 'number') {
      this.zoomLevel = window.devicePixelRatio;
      return;
    }
    
    // Method 2: Using screen width vs window width
    if (screen.width && window.innerWidth) {
      this.zoomLevel = screen.width / window.innerWidth;
      return;
    }
    
    // Method 3: Using visual viewport API (modern browsers)
    if (window.visualViewport?.scale !== undefined) {
      this.zoomLevel = window.visualViewport.scale;
      return;
    }
    
    // Method 4: Element measurement fallback
    this.zoomLevel = this.measureZoomLevel();
  }
  
  /**
   * Measure zoom level using element dimensions
   */
  measureZoomLevel() {
    const testElement = document.createElement('div');
    testElement.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 100px;
      height: 100px;
      visibility: hidden;
    `;
    
    document.body.appendChild(testElement);
    const measuredWidth = testElement.offsetWidth;
    document.body.removeChild(testElement);
    
    return 100 / measuredWidth;
  }
  
  /**
   * Setup zoom level detection listeners
   */
  setupZoomDetection() {
    // Listen for resize events (zoom changes trigger resize)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const oldZoom = this.zoomLevel;
        this.detectZoomLevel();
        
        if (Math.abs(this.zoomLevel - oldZoom) > 0.01) {
          this.applyFontScaling();
          this.notifyCallbacks(this.zoomLevel, oldZoom);
        }
      }, 100);
    });
    
    // Listen for visual viewport changes (mobile pinch zoom)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const oldZoom = this.zoomLevel;
        this.detectZoomLevel();
        
        if (Math.abs(this.zoomLevel - oldZoom) > 0.01) {
          this.applyFontScaling();
          this.notifyCallbacks(this.zoomLevel, oldZoom);
        }
      });
    }
  }
  
  /**
   * Apply font scaling based on zoom level
   */
  applyFontScaling() {
    const root = document.documentElement;
    
    // Calculate font scale factor
    const scaleFactor = this.calculateFontScaleFactor();
    
    // Set CSS custom properties for zoom-adaptive fonts
    root.style.setProperty('--zoom-level', this.zoomLevel);
    root.style.setProperty('--zoom-font-scale', scaleFactor);
    root.style.setProperty('--zoom-adaptive-base', `${1 * scaleFactor}rem`);
    root.style.setProperty('--zoom-adaptive-small', `${0.875 * scaleFactor}rem`);
    root.style.setProperty('--zoom-adaptive-medium', `${1.125 * scaleFactor}rem`);
    root.style.setProperty('--zoom-adaptive-large', `${1.25 * scaleFactor}rem`);
    root.style.setProperty('--zoom-adaptive-xl', `${1.5 * scaleFactor}rem`);
    root.style.setProperty('--zoom-adaptive-2xl', `${2 * scaleFactor}rem`);
    root.style.setProperty('--zoom-adaptive-3xl', `${3 * scaleFactor}rem`);
    
    // Apply zoom class to body for CSS targeting
    document.body.classList.remove('zoom-out', 'zoom-in', 'zoom-normal');
    
    if (this.zoomLevel < 0.95) {
      document.body.classList.add('zoom-out');
    } else if (this.zoomLevel > 1.05) {
      document.body.classList.add('zoom-in');
    } else {
      document.body.classList.add('zoom-normal');
    }
  }
  
  /**
   * Calculate font scale factor based on zoom level
   */
  calculateFontScaleFactor() {
    // For zoom out (< 100%), increase font size to maintain readability
    if (this.zoomLevel < 0.95) {
      // Scale factor increases as zoom decreases
      // At 50% zoom, fonts are 1.4x larger
      // At 75% zoom, fonts are 1.2x larger
      return Math.min(1.8, 1 + (1 - this.zoomLevel) * 0.8);
    }
    
    // For zoom in (> 100%), slightly reduce font size to prevent overflow
    if (this.zoomLevel > 1.05) {
      // Scale factor decreases slightly as zoom increases
      // At 150% zoom, fonts are 0.95x smaller
      // At 200% zoom, fonts are 0.9x smaller
      return Math.max(0.85, 1 - (this.zoomLevel - 1) * 0.1);
    }
    
    // Normal zoom (95-105%), no scaling
    return 1;
  }
  
  /**
   * Get current zoom level
   */
  getZoomLevel() {
    return this.zoomLevel;
  }
  
  /**
   * Get zoom level as percentage
   */
  getZoomPercentage() {
    return Math.round(this.zoomLevel * 100);
  }
  
  /**
   * Check if zoomed out
   */
  isZoomedOut() {
    return this.zoomLevel < 0.95;
  }
  
  /**
   * Check if zoomed in
   */
  isZoomedIn() {
    return this.zoomLevel > 1.05;
  }
  
  /**
   * Add callback for zoom changes
   */
  onZoomChange(callback) {
    this.callbacks.push(callback);
  }
  
  /**
   * Remove zoom change callback
   */
  removeZoomCallback(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
  
  /**
   * Notify all callbacks of zoom changes
   */
  notifyCallbacks(newZoom, oldZoom) {
    this.callbacks.forEach(callback => {
      try {
        callback(newZoom, oldZoom);
      } catch (error) {
        console.warn('ZoomAdapter callback error:', error);
      }
    });
  }
  
  /**
   * Force refresh zoom detection and scaling
   */
  refresh() {
    this.detectZoomLevel();
    this.applyFontScaling();
  }
  
  /**
   * Get CSS clamp function with zoom adaptation
   */
  getAdaptiveClamp(minRem, vwPercent, maxRem) {
    const scaleFactor = this.calculateFontScaleFactor();
    const adjustedMin = minRem * scaleFactor;
    const adjustedMax = maxRem * scaleFactor;
    
    return `clamp(${adjustedMin}rem, ${vwPercent}vw, ${adjustedMax}rem)`;
  }
  
  /**
   * Destroy zoom adapter and clean up listeners
   */
  destroy() {
    this.callbacks = [];
    this.isInitialized = false;
    
    // Remove CSS custom properties
    const root = document.documentElement;
    root.style.removeProperty('--zoom-level');
    root.style.removeProperty('--zoom-font-scale');
    root.style.removeProperty('--zoom-adaptive-base');
    root.style.removeProperty('--zoom-adaptive-small');
    root.style.removeProperty('--zoom-adaptive-medium');
    root.style.removeProperty('--zoom-adaptive-large');
    root.style.removeProperty('--zoom-adaptive-xl');
    root.style.removeProperty('--zoom-adaptive-2xl');
    root.style.removeProperty('--zoom-adaptive-3xl');
    
    // Remove zoom classes
    document.body.classList.remove('zoom-out', 'zoom-in', 'zoom-normal');
  }
}

// Create singleton instance
export const zoomAdapter = new ZoomAdapter();

// Export utility functions
export const getZoomLevel = () => zoomAdapter.getZoomLevel();
export const getZoomPercentage = () => zoomAdapter.getZoomPercentage();
export const isZoomedOut = () => zoomAdapter.isZoomedOut();
export const isZoomedIn = () => zoomAdapter.isZoomedIn();
export const onZoomChange = (callback) => zoomAdapter.onZoomChange(callback);
export const getAdaptiveClamp = (min, vw, max) => zoomAdapter.getAdaptiveClamp(min, vw, max);