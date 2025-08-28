/**
 * StorageService.js
 * Handles local storage operations
 */

import { GAME_CONFIG } from '../utils/GameConfig.js';

export const StorageService = {
  /**
   * Save player name to local storage
   */
  savePlayerName(name) {
    try {
      localStorage.setItem(GAME_CONFIG.storageKeys.playerName, name);
      return true;
    } catch (error) {
      console.error('Error saving player name:', error);
      return false;
    }
  },
  
  /**
   * Load player name from local storage
   */
  loadPlayerName() {
    try {
      return localStorage.getItem(GAME_CONFIG.storageKeys.playerName) || '';
    } catch (error) {
      console.error('Error loading player name:', error);
      return '';
    }
  },
  
  /**
   * Save game settings to local storage
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(GAME_CONFIG.storageKeys.settings, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },
  
  /**
   * Load game settings from local storage
   */
  loadSettings() {
    try {
      const settingsJson = localStorage.getItem(GAME_CONFIG.storageKeys.settings);
      if (!settingsJson) {
        return {
          gameMode: GAME_CONFIG.defaultGameMode,
          difficulty: GAME_CONFIG.defaultDifficulty,
          soundEnabled: true,
          snakeStyle: 'classic',
          theme: 'light'
        };
      }
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        gameMode: GAME_CONFIG.defaultGameMode,
        difficulty: GAME_CONFIG.defaultDifficulty,
        soundEnabled: true,
        snakeStyle: 'classic',
        theme: 'light'
      };
    }
  },
  
  /**
   * Clear all game data from local storage
   */
  clearAllData() {
    try {
      Object.values(GAME_CONFIG.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing game data:', error);
      return false;
    }
  }
};