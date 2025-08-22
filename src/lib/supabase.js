import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, GAME_CONFIG, debugLog } from './config.js'

// Create Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Leaderboard API functions
export class LeaderboardAPI {
  // Get top leaderboard entries
  static async getLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return { success: false, error: error.message }
    }
  }

  // Add or update a score
  static async submitScore(playerName, score, gameData = {}) {
    try {
      // Basic score validation
      if (!playerName || typeof score !== 'number' || score < 0) {
        throw new Error('Invalid player name or score')
      }

      // Check if player already exists
      const { data: existingPlayer } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('player_name', playerName)
        .single()

      const timestamp = new Date().toISOString()
      const playerData = {
        player_name: playerName,
        score: score,
        updated_at: timestamp,
        game_duration: gameData.duration || null,
        moves_count: gameData.moves || null
      }

      let result
      if (existingPlayer && existingPlayer.score < score) {
        // Update existing player with higher score
        result = await supabase
          .from('leaderboard')
          .update(playerData)
          .eq('player_name', playerName)
          .select()
      } else if (!existingPlayer) {
        // Insert new player
        playerData.created_at = timestamp
        result = await supabase
          .from('leaderboard')
          .insert([playerData])
          .select()
      } else {
        // Score is not higher, don't update
        return { success: true, updated: false, message: 'Score not high enough to update' }
      }

      if (result.error) throw result.error
      return { success: true, updated: true, data: result.data }
    } catch (error) {
      console.error('Error submitting score:', error)
      return { success: false, error: error.message }
    }
  }

  // Check if a score qualifies for the leaderboard
  static async isLeaderboardScore(score, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('score')
        .order('score', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      // If we have less than limit entries, any score qualifies
      if (!data || data.length < limit) {
        return { qualifies: true, rank: data ? data.length + 1 : 1 }
      }
      
      // Check if score is higher than the lowest score in top entries
      const lowestScore = data[data.length - 1].score
      const qualifies = score > lowestScore
      
      if (qualifies) {
        // Find the rank this score would achieve
        const rank = data.findIndex(entry => score > entry.score) + 1
        return { qualifies: true, rank: rank || data.length + 1 }
      }
      
      return { qualifies: false, rank: null }
    } catch (error) {
      console.error('Error checking leaderboard qualification:', error)
      return { qualifies: false, error: error.message }
    }
  }

  // Get player's rank and score
  static async getPlayerRank(playerName) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('player_name, score')
        .order('score', { ascending: false })
      
      if (error) throw error
      
      const playerIndex = data.findIndex(player => player.player_name === playerName)
      if (playerIndex === -1) {
        return { found: false }
      }
      
      return {
        found: true,
        rank: playerIndex + 1,
        score: data[playerIndex].score,
        totalPlayers: data.length
      }
    } catch (error) {
      console.error('Error getting player rank:', error)
      return { found: false, error: error.message }
    }
  }

  // Subscribe to real-time leaderboard updates
  static subscribeToLeaderboard(callback) {
    const subscription = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        (payload) => {
          console.log('Leaderboard updated:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  }

  // Unsubscribe from real-time updates
  static unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

// Utility function to generate anonymous user ID
export function generateAnonymousId() {
  return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
}

// Utility function to validate player name
export function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Player name is required' }
  }
  
  if (name.length < 2 || name.length > 20) {
    return { valid: false, error: 'Player name must be between 2 and 20 characters' }
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { valid: false, error: 'Player name can only contain letters, numbers, underscores, and hyphens' }
  }
  
  return { valid: true }
}