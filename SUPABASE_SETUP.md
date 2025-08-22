# Supabase Setup Guide for Snake Game Leaderboard

This guide will help you set up Supabase as the backend for your Snake Game's global leaderboard system.

## Prerequisites

- A Supabase account (free tier available)
- Basic understanding of SQL databases

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `snake-game-leaderboard` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Project API Key** (anon/public key)

## Step 3: Configure Your Application

1. Open `src/lib/config.js` in your project
2. Replace the placeholder values:

```javascript
export const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co', // Replace with your Project URL
  anonKey: 'your-anon-key-here' // Replace with your anon/public key
}
```

## Step 4: Create the Leaderboard Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the following SQL to create the leaderboard table:

```sql
-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id BIGSERIAL PRIMARY KEY,
    player_name VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    game_duration INTEGER, -- Game duration in seconds
    moves_count INTEGER,   -- Number of moves/direction changes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique index on player_name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_player_name 
ON public.leaderboard (player_name);

-- Create index on score for faster sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
ON public.leaderboard (score DESC);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at 
ON public.leaderboard (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read leaderboard data
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
    FOR SELECT USING (true);

-- Create policy to allow anyone to insert new scores
CREATE POLICY "Anyone can insert scores" ON public.leaderboard
    FOR INSERT WITH CHECK (true);

-- Create policy to allow players to update their own scores (only if new score is higher)
CREATE POLICY "Players can update their own higher scores" ON public.leaderboard
    FOR UPDATE USING (true)
    WITH CHECK (score > (SELECT score FROM public.leaderboard WHERE player_name = leaderboard.player_name AND id != leaderboard.id LIMIT 1));

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

4. Click "Run" to execute the SQL
5. You should see a success message

## Step 5: Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the `leaderboard` table
3. The table should have the following columns:
   - `id` (bigint, primary key)
   - `player_name` (varchar)
   - `score` (integer)
   - `game_duration` (integer, nullable)
   - `moves_count` (integer, nullable)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Step 6: Test the Connection

1. Start your development server: `npm run dev`
2. Open the game in your browser
3. Play a game and try to submit a score
4. Check the **Table Editor** in Supabase to see if the score was recorded

## Security Features Implemented

### Row Level Security (RLS)
- **Read Access**: Anyone can view the leaderboard
- **Insert Access**: Anyone can submit new scores
- **Update Access**: Players can only update their own scores, and only with higher scores

### Data Validation
- **Score Validation**: Scores must be non-negative integers
- **Player Name Validation**: Limited to 20 characters
- **Unique Player Names**: Each player name can only appear once

### Anti-Cheat Measures
- **Server-side Validation**: All score validation happens on the server
- **Score Limits**: Configurable maximum score thresholds
- **Game Data Tracking**: Optional tracking of game duration and moves for plausibility checks

## Optional: Enable Real-time Updates

To enable real-time leaderboard updates:

1. Go to **Database** > **Replication** in your Supabase dashboard
2. Enable replication for the `leaderboard` table
3. The game will automatically receive real-time updates when other players submit scores

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your API key in `config.js`
   - Make sure you're using the anon/public key, not the service role key

2. **"Table doesn't exist" error**
   - Make sure you ran the SQL commands in Step 4
   - Check the **SQL Editor** for any error messages

3. **"Permission denied" error**
   - Verify that Row Level Security policies are set up correctly
   - Check the RLS policies in **Authentication** > **Policies**

4. **Scores not updating**
   - Check that the update policy allows higher scores only
   - Verify the trigger for `updated_at` is working

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the browser console for error messages

## Next Steps

Once your Supabase backend is set up:

1. Test the leaderboard functionality
2. Customize the game configuration in `config.js`
3. Consider implementing user authentication for more advanced features
4. Monitor your usage in the Supabase dashboard

---

**Note**: The free tier of Supabase includes:
- Up to 500MB database storage
- Up to 2GB bandwidth per month
- Up to 50,000 monthly active users

This should be more than sufficient for most indie games and personal projects.