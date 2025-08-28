/**
 * Theme Configuration
 * Defines different visual themes for the Snake Game
 */

export const themes = {
  light: {
    id: 'light',
    name: 'Light Theme',
    description: 'Bright and colorful theme',
    colors: {
      // Current bright color scheme
      accent: '#F7A5A5',
      light: '#FFF2EF',
      dark: '#5D688A',
      secondary: '#FFDBB6',
      
      // UI Colors
      background: '#FFF2EF',
      surface: '#FFFFFF',
      text: '#5D688A',
      textSecondary: '#8A9BB8',
      border: '#F7A5A5',
      
      // Game Colors
      canvasBackground: '#FFF2EF',
      gridColor: '#F7A5A5',
      gameOverBackground: 'rgba(247, 165, 165, 0.9)',
      overlayBackground: 'rgba(255, 242, 239, 0.95)',
      
      // Button Colors
      buttonPrimary: '#F7A5A5',
      buttonPrimaryHover: '#F58B8B',
      buttonSecondary: '#FFDBB6',
      buttonSecondaryHover: '#FFD09A',
      buttonText: '#5D688A',
      
      // Status Colors
      success: '#A8E6CF',
      warning: '#FFD93D',
      error: '#FF6B6B',
      info: '#74C0FC'
    }
  },
  
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Sleek dark theme with neon accents',
    colors: {
      // Dark color scheme with neon accents
      accent: '#FF6B9D',
      light: '#2A2D3A',
      dark: '#1A1D29',
      secondary: '#4ECDC4',
      
      // UI Colors
      background: '#1A1D29',
      surface: '#2A2D3A',
      text: '#E8E9F3',
      textSecondary: '#A8AAB8',
      border: '#FF6B9D',
      
      // Game Colors
      canvasBackground: '#1A1D29',
      gridColor: '#FF6B9D',
      gameOverBackground: 'rgba(255, 107, 157, 0.9)',
      overlayBackground: 'rgba(26, 29, 41, 0.95)',
      
      // Button Colors
      buttonPrimary: '#FF6B9D',
      buttonPrimaryHover: '#FF5A8A',
      buttonSecondary: '#4ECDC4',
      buttonSecondaryHover: '#45B7B8',
      buttonText: '#E8E9F3',
      
      // Status Colors
      success: '#6BCF7F',
      warning: '#F39C12',
      error: '#E74C3C',
      info: '#3498DB'
    }
  }
};

export const defaultTheme = 'light';

/**
 * Canvas Theme Configuration
 * Separate themes specifically for the game canvas
 */
export const canvasThemes = {
  light: {
    id: 'light',
    name: 'Light Canvas',
    description: 'Bright canvas with soft colors',
    colors: {
      backgroundColor: '#FFF2EF',
      gridColor: 'rgba(93, 104, 138, 0.4)',
      textColor: '#5D688A',
      accentColor: '#F7A5A5',
      secondaryColor: '#FFDBB6',
      darkColor: '#5D688A'
    }
  },
  
  dark: {
    id: 'dark',
    name: 'Dark Canvas',
    description: 'Dark canvas with neon accents',
    colors: {
      backgroundColor: '#1A1D29',
      gridColor: 'rgba(255, 107, 157, 0.3)',
      textColor: '#E8E9F3',
      accentColor: '#FF6B9D',
      secondaryColor: '#4ECDC4',
      darkColor: '#E8E9F3'
    }
  },
  
  colorful: {
    id: 'colorful',
    name: 'Colorful Canvas',
    description: 'Vibrant rainbow theme',
    colors: {
      backgroundColor: '#2D1B69',
      gridColor: 'rgba(138, 43, 226, 0.3)',
      textColor: '#FFD700',
      accentColor: '#FF1493',
      secondaryColor: '#00CED1',
      darkColor: '#FFD700'
    }
  },
  
  retro: {
    id: 'retro',
    name: 'Retro Canvas',
    description: 'Classic green terminal style',
    colors: {
      backgroundColor: '#000000',
      gridColor: 'rgba(0, 255, 0, 0.2)',
      textColor: '#00FF00',
      accentColor: '#00FF00',
      secondaryColor: '#32CD32',
      darkColor: '#00FF00'
    }
  }
};

export const defaultCanvasTheme = 'light';

/**
 * Get theme by ID
 */
export function getTheme(themeId) {
  return themes[themeId] || themes[defaultTheme];
}

/**
 * Get all available themes
 */
export function getAllThemes() {
  return Object.values(themes);
}

/**
 * Get theme names for UI selection
 */
export function getThemeNames() {
  return Object.keys(themes).map(key => ({
    id: key,
    name: themes[key].name,
    description: themes[key].description
  }));
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  const colors = theme.colors;
  
  // Apply all theme colors as CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
  
  // Store current theme in localStorage
  localStorage.setItem('snakeGameTheme', theme.id);
  
  // Notify game engine to update renderer colors
  const gameEngineUpdateEvent = new CustomEvent('themeChanged', { detail: theme });
  document.dispatchEvent(gameEngineUpdateEvent);
}

/**
 * Get saved theme from localStorage
 */
export function getSavedTheme() {
  const savedThemeId = localStorage.getItem('snakeGameTheme');
  return savedThemeId || defaultTheme;
}

/**
 * Initialize theme system
 */
export function initializeTheme() {
  const savedThemeId = getSavedTheme();
  const theme = getTheme(savedThemeId);
  applyTheme(theme);
  return theme;
}

/**
 * Canvas Theme Functions
 */

/**
 * Get canvas theme by ID
 */
export function getCanvasTheme(themeId) {
  return canvasThemes[themeId] || canvasThemes[defaultCanvasTheme];
}

/**
 * Get all available canvas themes
 */
export function getAllCanvasThemes() {
  return Object.values(canvasThemes);
}

/**
 * Get canvas theme names for UI selection
 */
export function getCanvasThemeNames() {
  return Object.keys(canvasThemes).map(key => ({
    id: key,
    name: canvasThemes[key].name,
    description: canvasThemes[key].description
  }));
}

/**
 * Apply canvas theme to the game renderer
 */
export function applyCanvasTheme(themeId) {
  const theme = getCanvasTheme(themeId);
  
  // Store current canvas theme in localStorage
  localStorage.setItem('snakeGameCanvasTheme', themeId);
  
  // Notify game engine to update renderer colors
  const canvasThemeUpdateEvent = new CustomEvent('canvasThemeChanged', { 
    detail: { themeId, colors: theme.colors } 
  });
  document.dispatchEvent(canvasThemeUpdateEvent);
  
  return theme;
}

/**
 * Get saved canvas theme from localStorage
 */
export function getSavedCanvasTheme() {
  const savedThemeId = localStorage.getItem('snakeGameCanvasTheme');
  return savedThemeId || defaultCanvasTheme;
}

/**
 * Initialize canvas theme system
 */
export function initializeCanvasTheme() {
  const savedThemeId = getSavedCanvasTheme();
  const theme = applyCanvasTheme(savedThemeId);
  return theme;
}