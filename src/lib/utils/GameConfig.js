/**
 * GameConfig.js
 * Game configuration constants
 */

export const GAME_CONFIG = {
  // Game settings
  fps: 15,                // Frames per second
  tileCount: 25,          // Number of tiles in the grid
  gridSize: 20,           // Size of each grid tile in pixels
  
  // Game modes
  gameModes: [
    { id: 'border', name: 'Classic Mode', description: 'Game ends when you hit the wall' },
    { id: 'wrap', name: 'Wrap Mode', description: 'Snake wraps around the edges' }
  ],
  
  // Difficulty levels
  difficultyLevels: [
    { id: 'easy', name: 'Easy', fps: 10 },
    { id: 'medium', name: 'Medium', fps: 15 },
    { id: 'hard', name: 'Hard', fps: 20 }
  ],
  
  // Default settings
  defaultGameMode: 'border',
  defaultDifficulty: 'medium',
  
  // Local storage keys
  storageKeys: {
    playerName: 'snakeGame_playerName',
    highScores: 'snakeGame_highScores',
    settings: 'snakeGame_settings'
  }
};