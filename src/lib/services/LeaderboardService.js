// @ts-nocheck
/**
 * LeaderboardService.js
 * Handles leaderboard functionality and score submission
 */

import { GAME_CONFIG } from '../utils/GameConfig.js';

// Import Supabase client if available
let supabaseClient = null;

// Function to initialize Supabase client
async function initializeSupabase() {
  if (supabaseClient) return supabaseClient;
  
  try {
    const supabaseModule = await import('../supabase.js');
    supabaseClient = supabaseModule.supabase;
    console.log('Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Supabase client not available:', error);
    return null;
  }
}

export const LeaderboardService = {
  /**
   * Submit a score to the leaderboard (only if it's a new high score)
   */
  async submitScore(playerData) {
    // Validate player data
    if (!this.validatePlayerData(playerData)) {
      return { success: false, error: 'Invalid player data' };
    }
    
    try {
      // First check if this is a high score locally
      const localResult = this.saveToLocalLeaderboard(playerData);
      if (!localResult.success) {
        return localResult; // Return early if not a high score
      }
      
      // Try to submit to online leaderboard if Supabase is available
      const client = await initializeSupabase();
      if (client) {
        // Check if player already has a score in online leaderboard
        // Try with game_mode first, fallback to without game_mode if column doesn't exist
        let existingScores = null;
        let fetchError = null;
        
        try {
          const result = await client
            .from('leaderboard')
            .select('score')
            .eq('player_name', playerData.playerName)
            .eq('game_mode', playerData.gameMode || 'border')
            .order('score', { ascending: false })
            .limit(1);
          existingScores = result.data;
          fetchError = result.error;
        } catch (error) {
          // If game_mode column doesn't exist, try without it
          if (error.code === '42703' || error.message?.includes('game_mode does not exist')) {
            console.log('game_mode column not found, querying without game mode filter');
            const result = await client
              .from('leaderboard')
              .select('score')
              .eq('player_name', playerData.playerName)
              .order('score', { ascending: false })
              .limit(1);
            existingScores = result.data;
            fetchError = result.error;
          } else {
            throw error;
          }
        }
          
        if (fetchError) {
          console.error('Error checking existing online scores:', fetchError);
        } else if (existingScores && existingScores.length > 0) {
          const existingHighScore = existingScores[0].score;
          if (playerData.score <= existingHighScore) {
            console.log(`Score ${playerData.score} is not higher than online high score ${existingHighScore}`);
            return { success: true, localHighScore: true, onlineSubmitted: false, reason: 'not_online_high_score' };
          }
        }
        
        // Try to upsert (insert or update) with game_mode, fallback to without if column doesn't exist
        let data = null;
        let error = null;
        
        try {
          const result = await client
            .from('leaderboard')
            .upsert([
              {
                player_name: playerData.playerName,
                score: playerData.score,
                game_duration: playerData.gameTime || null,
                moves_count: playerData.moves || null,
                game_mode: playerData.gameMode || 'border'
              }
            ], {
              onConflict: 'player_name,game_mode'
            });
          data = result.data;
          error = result.error;
        } catch (upsertError) {
          // If game_mode column doesn't exist, try without it
          if (upsertError.code === '42703' || upsertError.message?.includes('game_mode does not exist')) {
            console.log('game_mode column not found, upserting without game mode');
            const result = await client
              .from('leaderboard')
              .upsert([
                {
                  player_name: playerData.playerName,
                  score: playerData.score,
                  game_duration: playerData.gameTime || null,
                  moves_count: playerData.moves || null
                }
              ], {
                onConflict: 'player_name'
              });
            data = result.data;
            error = result.error;
          } else {
            throw upsertError;
          }
        }
          
        if (error) throw error;
        
        return { success: true, localHighScore: true, onlineSubmitted: true, data };
      } else {
        // No online connection, but local high score was saved
        return { success: true, localHighScore: true, onlineSubmitted: false, reason: 'no_online_connection' };
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      
      return { 
        success: true, 
        localHighScore: true, 
        onlineSubmitted: false, 
        error: error.message || 'Failed to submit to online leaderboard'
      };
    }
  },
  
  /**
   * Save score to local leaderboard (only if it's a new high score for the player)
   */
  saveToLocalLeaderboard(playerData) {
    try {
      // Get existing player high scores
      const playerHighScores = this.getPlayerHighScores();
      const playerKey = `${playerData.playerName}_${playerData.gameMode}`;
      
      // Check if this is a new high score for the player
      const currentHighScore = playerHighScores[playerKey];
      if (currentHighScore && playerData.score <= currentHighScore.score) {
        console.log(`Score ${playerData.score} is not higher than current high score ${currentHighScore.score} for ${playerData.playerName}`);
        return { success: false, reason: 'not_high_score', currentHighScore: currentHighScore.score };
      }
      
      // Save new high score for this player
      playerHighScores[playerKey] = {
        playerName: playerData.playerName,
        score: playerData.score,
        gameTime: playerData.gameTime,
        snakeLength: playerData.snakeLength,
        gameMode: playerData.gameMode,
        timestamp: new Date().toISOString()
      };
      
      // Save player high scores
      localStorage.setItem('snakeGame_playerHighScores', JSON.stringify(playerHighScores));
      
      // Update the main leaderboard with all high scores
      this.updateMainLeaderboard();
      
      return { success: true, newHighScore: true, previousHighScore: currentHighScore?.score || 0 };
    } catch (error) {
      console.error('Error saving to local leaderboard:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get player high scores (organized by player and game mode)
   */
  getPlayerHighScores() {
    try {
      const playerHighScoresJson = localStorage.getItem('snakeGame_playerHighScores');
      return playerHighScoresJson ? JSON.parse(playerHighScoresJson) : {};
    } catch (error) {
      console.error('Error getting player high scores:', error);
      return {};
    }
  },

  /**
   * Update main leaderboard from player high scores
   */
  updateMainLeaderboard() {
    try {
      const playerHighScores = this.getPlayerHighScores();
      const leaderboard = Object.values(playerHighScores);
      
      // Dynamic scoring: If any player scores higher than Olly, boost Olly's score
      const processedLeaderboard = [...leaderboard];
      
      // Find Olly's current score
      const ollyEntry = processedLeaderboard.find(score => 
        score.playerName && score.playerName.toLowerCase() === 'olly'
      );
      
      // Find the highest non-Olly score
      const nonOllyScores = processedLeaderboard.filter(score => 
        score.playerName && score.playerName.toLowerCase() !== 'olly'
      );
      
      if (ollyEntry && nonOllyScores.length > 0) {
        const highestNonOllyScore = Math.max(...nonOllyScores.map(s => s.score));
        
        // If any player scored higher than Olly, boost Olly's score
        if (highestNonOllyScore > ollyEntry.score) {
          ollyEntry.score = highestNonOllyScore + Math.floor(highestNonOllyScore / 2);
        }
      }
      
      // Group by game mode
      const leaderboardByMode = {};
      processedLeaderboard.forEach(score => {
        const gameMode = score.gameMode || 'border';
        if (!leaderboardByMode[gameMode]) {
          leaderboardByMode[gameMode] = [];
        }
        leaderboardByMode[gameMode].push(score);
      });
      
      // Sort each game mode leaderboard with Olly always first, then by score (descending) and keep top 100
      Object.keys(leaderboardByMode).forEach(gameMode => {
        leaderboardByMode[gameMode].sort((a, b) => {
          // Olly always comes first
          const aIsOlly = a.playerName && a.playerName.toLowerCase() === 'olly';
          const bIsOlly = b.playerName && b.playerName.toLowerCase() === 'olly';
          
          if (aIsOlly && !bIsOlly) return -1;
          if (!aIsOlly && bIsOlly) return 1;
          
          // For non-Olly players, sort by score descending
          return b.score - a.score;
        });
        leaderboardByMode[gameMode] = leaderboardByMode[gameMode].slice(0, 100);
      });
      
      // Save game mode specific leaderboards
      localStorage.setItem('snakeGame_leaderboardByMode', JSON.stringify(leaderboardByMode));
      
      // Maintain backward compatibility - save combined leaderboard
      const combinedLeaderboard = Object.values(leaderboardByMode).flat();
      combinedLeaderboard.sort((a, b) => b.score - a.score);
      const topScores = combinedLeaderboard.slice(0, 100);
      localStorage.setItem('snakeGame_highScores', JSON.stringify(topScores));
      
      return leaderboardByMode;
    } catch (error) {
      console.error('Error updating main leaderboard:', error);
      return {};
    }
  },

  /**
   * Get a player's current high score for a specific game mode
   */
  getPlayerHighScore(playerName, gameMode) {
    try {
      const playerHighScores = this.getPlayerHighScores();
      const playerKey = `${playerName}_${gameMode}`;
      return playerHighScores[playerKey] || null;
    } catch (error) {
      console.error('Error getting player high score:', error);
      return null;
    }
  },

  /**
   * Get local leaderboard (for display purposes)
   * Only returns scores for specific game mode - no combined leaderboard
   */
  getLocalLeaderboard(gameMode = null) {
    try {
      // Require specific game mode - return empty if none provided
      if (!gameMode) {
        return [];
      }
      
      // Try to get game mode specific leaderboards first
      const leaderboardByModeJson = localStorage.getItem('snakeGame_leaderboardByMode');
      
      if (leaderboardByModeJson) {
        const leaderboardByMode = JSON.parse(leaderboardByModeJson);
        return leaderboardByMode[gameMode] || [];
      }
      
      // Fallback to old format for backward compatibility
      const leaderboardJson = localStorage.getItem('snakeGame_highScores');
      const leaderboard = leaderboardJson ? JSON.parse(leaderboardJson) : [];
      
      return leaderboard.filter(entry => entry.gameMode === gameMode);
    } catch (error) {
      console.error('Error getting local leaderboard:', error);
      return [];
    }
  },
  
  /**
   * Get online leaderboard
   * Only returns scores for specific game mode - no combined leaderboard
   */
  async getOnlineLeaderboard(limit = 10, gameMode = null) {
    const client = await initializeSupabase();
    if (!client) {
      return { success: false, error: 'Supabase client not available', data: [] };
    }
    
    // Require specific game mode - return empty if none provided
    if (!gameMode) {
      return { success: true, data: [] };
    }
    
    try {
      let query = client
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);
      
      // Try to filter by game mode if specified and column exists
      try {
        const result = await query.eq('game_mode', gameMode);
        
        // Dynamic scoring: If any player scores higher than Olly, boost Olly's score
        const processedData = [...(result.data || [])];
        
        // Find Olly's current score
        const ollyEntry = processedData.find(entry => 
          entry.player_name && entry.player_name.toLowerCase() === 'olly'
        );
        
        // Find the highest non-Olly score
        const nonOllyScores = processedData.filter(entry => 
          entry.player_name && entry.player_name.toLowerCase() !== 'olly'
        );
        
        if (ollyEntry && nonOllyScores.length > 0) {
          const highestNonOllyScore = Math.max(...nonOllyScores.map(s => s.score));
          
          // If any player scored higher than Olly, boost Olly's score
          if (highestNonOllyScore > ollyEntry.score) {
            ollyEntry.score = highestNonOllyScore + Math.floor(highestNonOllyScore / 2);
          }
        }
         
         // Sort with Olly always first, then by score descending
         processedData.sort((a, b) => {
           // Olly always comes first
           const aIsOlly = a.player_name && a.player_name.toLowerCase() === 'olly';
           const bIsOlly = b.player_name && b.player_name.toLowerCase() === 'olly';
           
           if (aIsOlly && !bIsOlly) return -1;
           if (!aIsOlly && bIsOlly) return 1;
           
           // For non-Olly players, sort by score descending
           return b.score - a.score;
         });
         
         return { success: true, data: processedData };
      } catch (error) {
        // If game_mode column doesn't exist, return empty array
        if (error.code === '42703' || error.message?.includes('game_mode does not exist')) {
          console.log('game_mode column not found, cannot filter by game mode - returning empty array');
          return { success: true, data: [] };
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching online leaderboard:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch leaderboard',
        data: [] 
      };
    }
  },
  
  /**
   * Validate player data
   */
  validatePlayerData(playerData) {
    // Check if required fields exist
    if (!playerData || 
        typeof playerData.playerName !== 'string' || 
        typeof playerData.score !== 'number') {
      return false;
    }
    
    // Validate player name
    if (!this.validatePlayerName(playerData.playerName)) {
      return false;
    }
    
    // Validate score
    if (playerData.score < 0 || !Number.isInteger(playerData.score)) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Validate player name
   */
  validatePlayerName(name) {
    if (!name || typeof name !== 'string') return false;
    
    // Trim whitespace
    const trimmedName = name.trim();
    
    // Check length
    if (trimmedName.length < 2 || trimmedName.length > 20) return false;
    
    // Check for invalid characters
    const invalidCharsRegex = /[<>\\\/{};:]/;
    if (invalidCharsRegex.test(trimmedName)) return false;
    
    return true;
  }
};