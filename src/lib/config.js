// Supabase Configuration
// Replace these values with your actual Supabase project credentials
// You can find these in your Supabase project dashboard under Settings > API

export const SUPABASE_CONFIG = {
  // Your Supabase project URL (e.g., https://your-project.supabase.co)
  url: 'https://aumroaokyjndgjrspjyo.supabase.co',
  
  // Your Supabase anon/public key
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bXJvYW9reWpuZGdqcnNwanlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODg0NzgsImV4cCI6MjA3MTI2NDQ3OH0.S4JCIKLtTfdmAaXXw4bh33_TuQny3r0RlJsYhvkPgnE'
}

// Game configuration
export const GAME_CONFIG = {
  // Maximum number of leaderboard entries to display
  leaderboardLimit: 10,
  
  // Minimum score to qualify for leaderboard submission
  minScoreThreshold: 1,
  
  // Maximum score validation (to prevent impossible scores)
  maxScoreThreshold: 10000,
  
  // Player name validation
  playerName: {
    minLength: 2,
    maxLength: 20,
    allowedChars: /^[a-zA-Z0-9_-]+$/
  },
  
  // API timeout settings
  apiTimeout: 10000, // 10 seconds
  
  // Retry settings for failed API calls
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
}

// Environment detection
export const isDevelopment = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development'
}

// Debug logging
export const debugLog = (...args) => {
  if (isDevelopment()) {
    console.log('[Snake Game Debug]:', ...args)
  }
}